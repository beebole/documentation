#!/bin/bash
#
# Detect stale translations by comparing git timestamps of English files
# against their French and Spanish counterparts.
#
# Outputs a JSON manifest to stdout describing which files need translation
# and what changed in the English version.
#
# Usage: bash scripts/translate.sh
#
# Designed to be run from Claude Code, which reads the JSON output and
# performs the actual AI translation.
#

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HELP_DIR="$REPO_ROOT/help"
LANGS=("fr" "es")

# --- Helpers ---

# Get the Unix timestamp of the last commit that touched a file.
# Returns 0 if the file has no git history (never committed).
last_commit_ts() {
  local ts
  ts=$(git log --format="%ct" -1 -- "$1" 2>/dev/null || true)
  echo "${ts:-0}"
}

# Get a human-readable date of the last commit that touched a file.
last_commit_date() {
  local d
  d=$(git log --format="%ci" -1 -- "$1" 2>/dev/null | cut -d' ' -f1 || true)
  echo "${d:-never}"
}

# Check if a file has uncommitted working-tree changes (staged or unstaged).
is_dirty() {
  local status
  status=$(git status --porcelain -- "$1" 2>/dev/null)
  [[ -n "$status" ]]
}

# Escape a string for safe JSON embedding.
json_escape() {
  python3 -c "import json,sys; print(json.dumps(sys.stdin.read()), end='')" <<< "$1"
}

# --- Main ---

echo "🔍 Scanning for stale translations..." >&2

# Collect all EN .mdx files
EN_FILES=()
while IFS= read -r -d '' f; do
  EN_FILES+=("$f")
done < <(find "$HELP_DIR" -maxdepth 1 -name "*.mdx" -print0 2>/dev/null)
while IFS= read -r -d '' f; do
  EN_FILES+=("$f")
done < <(find "$HELP_DIR/documentation" "$HELP_DIR/guides" "$HELP_DIR/integrations" "$HELP_DIR/api" "$HELP_DIR/news" -name "*.mdx" -print0 2>/dev/null)

TOTAL=${#EN_FILES[@]}
STALE_COUNT=0
STALE_JSON=""

for en_file in "${EN_FILES[@]}"; do
  # Relative path from help/ (e.g., "documentation/billing.mdx" or "index.mdx")
  rel_path="${en_file#$HELP_DIR/}"

  # Skip fr/ and es/ directories (shouldn't happen with our find, but guard)
  [[ "$rel_path" == fr/* || "$rel_path" == es/* ]] && continue

  en_ts=$(last_commit_ts "$en_file")
  en_dirty=false
  is_dirty "$en_file" && en_dirty=true

  lang_entries=""

  for lang in "${LANGS[@]}"; do
    lang_file="$HELP_DIR/$lang/$rel_path"

    # Skip if no translation file exists (would be a "new" file situation)
    if [[ ! -f "$lang_file" ]]; then
      echo "   ⚠  Missing: $lang/$rel_path (no translation file)" >&2
      continue
    fi

    lang_ts=$(last_commit_ts "$lang_file")

    diff_content=""
    reason=""

    if [[ "$en_ts" -gt "$lang_ts" ]] && [[ "$lang_ts" -ne 0 ]]; then
      # EN was committed after the translation
      reason="committed_after"
      # Get the commit hash of the last translation update
      lang_commit=$(git log --format="%H" -1 -- "$lang_file" 2>/dev/null || true)
      if [[ -n "$lang_commit" ]]; then
        diff_content=$(git diff "$lang_commit"..HEAD -- "$en_file" 2>/dev/null || true)
      fi
      # If EN also has working-tree changes, append those
      if [[ "$en_dirty" == true ]]; then
        wt_diff=$(git diff HEAD -- "$en_file" 2>/dev/null || true)
        if [[ -n "$wt_diff" ]]; then
          diff_content="${diff_content}
--- Working tree changes ---
${wt_diff}"
        fi
      fi
    elif [[ "$en_dirty" == true ]]; then
      # EN has uncommitted changes only
      reason="working_tree_changes"
      diff_content=$(git diff HEAD -- "$en_file" 2>/dev/null || true)
      # Also include staged changes
      staged_diff=$(git diff --cached -- "$en_file" 2>/dev/null || true)
      if [[ -n "$staged_diff" ]]; then
        diff_content="${staged_diff}
${diff_content}"
      fi
    else
      # Up to date
      continue
    fi

    # Skip if diff is empty (timestamps differ but content is identical)
    if [[ -z "$diff_content" ]]; then
      continue
    fi

    en_date=$(last_commit_date "$en_file")
    lang_date=$(last_commit_date "$lang_file")

    escaped_diff=$(json_escape "$diff_content")

    lang_entry=$(cat <<ENTRY
      "$lang": {
        "path": "help/$lang/$rel_path",
        "en_last_modified": "$en_date",
        "lang_last_modified": "$lang_date",
        "reason": "$reason",
        "diff": $escaped_diff
      }
ENTRY
    )

    if [[ -n "$lang_entries" ]]; then
      lang_entries="${lang_entries},
${lang_entry}"
    else
      lang_entries="$lang_entry"
    fi
  done

  # If any language needs updating, add to stale list
  if [[ -n "$lang_entries" ]]; then
    STALE_COUNT=$((STALE_COUNT + 1))
    echo "   📋 Stale: $rel_path" >&2

    stale_entry=$(cat <<SENTRY
  {
    "en_path": "help/$rel_path",
    "languages": {
$lang_entries
    }
  }
SENTRY
    )

    if [[ -n "$STALE_JSON" ]]; then
      STALE_JSON="${STALE_JSON},
${stale_entry}"
    else
      STALE_JSON="$stale_entry"
    fi
  fi
done

UP_TO_DATE=$((TOTAL - STALE_COUNT))

# Output final JSON
cat <<EOF
{
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": {
    "total_checked": $TOTAL,
    "stale_files": $STALE_COUNT,
    "up_to_date": $UP_TO_DATE
  },
  "stale": [
$STALE_JSON
  ]
}
EOF

echo "" >&2
echo "✅ Done. Found $STALE_COUNT file(s) needing translation out of $TOTAL checked." >&2
if [[ "$STALE_COUNT" -gt 0 ]]; then
  echo "💡 Run this from Claude Code to auto-translate the stale files." >&2
fi

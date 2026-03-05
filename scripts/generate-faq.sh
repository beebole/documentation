#!/bin/bash
#
# Detect documentation pages that have content but are missing a FAQ section.
#
# Scans all English .mdx files under help/ and checks whether:
# 1. The file has meaningful content (more than just frontmatter, >20 lines)
# 2. The file does NOT already contain a "Frequently asked questions" section
#
# Outputs a JSON manifest to stdout listing files that need FAQ generation.
#
# Usage: bash scripts/generate-faq.sh
#
# Designed to be run from Claude Code, which reads the JSON output and
# generates the actual FAQ content for each page.
#

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HELP_DIR="$REPO_ROOT/help"

# Minimum line count to consider a file as having "real content"
# (not just frontmatter or a stub)
MIN_LINES=20

# --- Helpers ---

# Count non-empty lines in a file
line_count() {
  grep -c . "$1" 2>/dev/null || echo "0"
}

# Check if a file contains a FAQ section (case-insensitive)
has_faq() {
  grep -qi "frequently asked questions\|## FAQ" "$1" 2>/dev/null
}

# Escape a string for safe JSON embedding
json_escape() {
  python3 -c "import json,sys; print(json.dumps(sys.stdin.read()), end='')" <<< "$1"
}

# --- Main ---

echo "🔍 Scanning for pages missing FAQ sections..." >&2

# Collect all EN .mdx files (top-level + subdirectories, excluding fr/ and es/)
EN_FILES=()
while IFS= read -r -d '' f; do
  EN_FILES+=("$f")
done < <(find "$HELP_DIR" -maxdepth 1 -name "*.mdx" -print0 2>/dev/null)

for subdir in documentation guides integrations api news; do
  if [[ -d "$HELP_DIR/$subdir" ]]; then
    while IFS= read -r -d '' f; do
      EN_FILES+=("$f")
    done < <(find "$HELP_DIR/$subdir" -name "*.mdx" -print0 2>/dev/null)
  fi
done

TOTAL=${#EN_FILES[@]}
MISSING_COUNT=0
SKIPPED_COUNT=0
HAS_FAQ_COUNT=0
MISSING_JSON=""

for en_file in "${EN_FILES[@]}"; do
  rel_path="${en_file#$HELP_DIR/}"

  # Skip fr/ and es/ directories
  [[ "$rel_path" == fr/* || "$rel_path" == es/* ]] && continue

  lines=$(line_count "$en_file")

  # Skip stubs / files without real content
  if [[ "$lines" -lt "$MIN_LINES" ]]; then
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    echo "   ⏭  Skipped (stub): $rel_path ($lines lines)" >&2
    continue
  fi

  # Check if FAQ already exists
  if has_faq "$en_file"; then
    HAS_FAQ_COUNT=$((HAS_FAQ_COUNT + 1))
    echo "   ✅ Has FAQ: $rel_path" >&2
    continue
  fi

  # This file needs a FAQ section
  MISSING_COUNT=$((MISSING_COUNT + 1))
  echo "   📋 Missing FAQ: $rel_path" >&2

  # Check if FR/ES translations exist and also need FAQs
  langs_needing_faq="[]"
  lang_list=""
  for lang in fr es; do
    lang_file="$HELP_DIR/$lang/$rel_path"
    if [[ -f "$lang_file" ]]; then
      lang_lines=$(line_count "$lang_file")
      if [[ "$lang_lines" -ge "$MIN_LINES" ]] && ! has_faq "$lang_file"; then
        if [[ -n "$lang_list" ]]; then
          lang_list="${lang_list}, \"$lang\""
        else
          lang_list="\"$lang\""
        fi
      fi
    fi
  done
  langs_needing_faq="[$lang_list]"

  entry=$(cat <<ENTRY
  {
    "en_path": "help/$rel_path",
    "line_count": $lines,
    "translations_needing_faq": $langs_needing_faq
  }
ENTRY
  )

  if [[ -n "$MISSING_JSON" ]]; then
    MISSING_JSON="${MISSING_JSON},
${entry}"
  else
    MISSING_JSON="$entry"
  fi
done

# Output final JSON
cat <<EOF
{
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": {
    "total_scanned": $TOTAL,
    "with_content": $((TOTAL - SKIPPED_COUNT)),
    "already_has_faq": $HAS_FAQ_COUNT,
    "missing_faq": $MISSING_COUNT,
    "skipped_stubs": $SKIPPED_COUNT
  },
  "missing_faq": [
$MISSING_JSON
  ]
}
EOF

echo "" >&2
echo "✅ Done. Found $MISSING_COUNT page(s) with content but no FAQ section." >&2
if [[ "$MISSING_COUNT" -gt 0 ]]; then
  echo "💡 Run this from Claude Code to auto-generate FAQ sections." >&2
fi

#!/usr/bin/env bash
# detect-reboot-changes.sh — list commits in ../reboot since a cursor
#
# Usage:
#   ./detect-reboot-changes.sh                # uses .sync/state.json cursor, or 3 months if absent
#   ./detect-reboot-changes.sh --since <sha>  # explicit SHA cursor — uses <sha>..HEAD range
#   ./detect-reboot-changes.sh --since <date> # explicit date cursor (git-compatible, e.g. 2026-01-01)
#
# Output (stdout): one JSON object per commit, one per line:
#   {"sha":"abc123","date":"2026-04-20","subject":"feat: ...","files":["a","b"]}
#
# Exit codes:
#   0 — success (may be empty output if no commits)
#   1 — ../reboot not accessible, or jq missing
#   2 — bad arguments

set -euo pipefail

REBOOT_DIR="../reboot"
STATE_FILE=".sync/state.json"
CURSOR=""

# Parse --since
while [[ $# -gt 0 ]]; do
  case "$1" in
    --since)
      if [[ $# -lt 2 ]]; then
        echo "error: --since requires an argument" >&2
        exit 2
      fi
      CURSOR="$2"
      shift 2
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

# Dependencies
if [[ ! -d "$REBOOT_DIR/.git" ]]; then
  echo "error: $REBOOT_DIR is not a git repository" >&2
  exit 1
fi
command -v jq >/dev/null || { echo "error: jq required" >&2; exit 1; }

# Determine cursor if not explicitly provided
if [[ -z "$CURSOR" ]]; then
  if [[ -f "$STATE_FILE" ]]; then
    CURSOR="$(python3 -c "import json; print(json.load(open('$STATE_FILE'))['last_synced_sha'])" 2>/dev/null || true)"
  fi
  if [[ -z "$CURSOR" ]]; then
    CURSOR="3 months ago"
  fi
fi

# Classify cursor as SHA (valid object in the repo) or date expression.
# SHAs use revision-range syntax (exclusive of cursor); dates use --since.
if [[ "$CURSOR" =~ ^[0-9a-f]{7,40}$ ]] && git -C "$REBOOT_DIR" cat-file -e "$CURSOR" 2>/dev/null; then
  RANGE_ARGS=("${CURSOR}..HEAD")
else
  RANGE_ARGS=("HEAD" "--since=$CURSOR")
fi

# For each commit SHA, emit a JSON record built by jq (handles escaping).
git -C "$REBOOT_DIR" log "${RANGE_ARGS[@]}" --no-merges --pretty=format:'%H' \
  | while IFS= read -r sha; do
      [[ -z "$sha" ]] && continue
      date="$(git -C "$REBOOT_DIR" show --no-patch --pretty=format:'%ai' "$sha" | cut -c1-10)"
      subject="$(git -C "$REBOOT_DIR" show --no-patch --pretty=format:'%s' "$sha")"
      files_json="$(git -C "$REBOOT_DIR" show --pretty=format: --name-only "$sha" \
                     | grep -v '^$' \
                     | jq -Rsc 'split("\n") | map(select(. != ""))')"
      # Handle the "no files" case (empty string → jq returns [""] which split filters to [])
      [[ -z "$files_json" ]] && files_json='[]'
      jq -cn --arg sha "$sha" \
             --arg date "$date" \
             --arg subject "$subject" \
             --argjson files "$files_json" \
             '{sha: $sha, date: $date, subject: $subject, files: $files}'
    done

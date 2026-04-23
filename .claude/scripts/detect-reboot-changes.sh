#!/usr/bin/env bash
# detect-reboot-changes.sh — list commits in ../reboot since a cursor
#
# Usage:
#   ./detect-reboot-changes.sh                # uses .sync/state.json cursor, or 3 months if absent
#   ./detect-reboot-changes.sh --since <sha>  # explicit SHA cursor
#   ./detect-reboot-changes.sh --since <date> # explicit date cursor (git-compatible, e.g. 2026-01-01)
#
# Output (stdout): one JSON object per commit, one per line:
#   {"sha":"abc123","date":"2026-04-20","subject":"feat: ...","files":["a","b"]}
#
# Exit codes:
#   0 — success (may be empty output if no commits)
#   1 — ../reboot not accessible
#   2 — bad arguments

set -euo pipefail

REBOOT_DIR="../reboot"
STATE_FILE=".sync/state.json"
CURSOR=""

# Parse --since
while [[ $# -gt 0 ]]; do
  case "$1" in
    --since)
      CURSOR="$2"
      shift 2
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

# Verify access to ../reboot
if [[ ! -d "$REBOOT_DIR/.git" ]]; then
  echo "error: $REBOOT_DIR is not a git repository" >&2
  exit 1
fi

# Determine cursor if not explicitly provided
if [[ -z "$CURSOR" ]]; then
  if [[ -f "$STATE_FILE" ]]; then
    CURSOR="$(python3 -c "import json,sys; print(json.load(open('$STATE_FILE'))['last_synced_sha'])" 2>/dev/null || true)"
  fi
  if [[ -z "$CURSOR" ]]; then
    CURSOR="3 months ago"
  fi
fi

# Emit one JSON object per commit
cd "$REBOOT_DIR"

# git log produces tab-separated records; jq builds JSON
git log --since="$CURSOR" --no-merges \
  --pretty=format:'%H%x09%ai%x09%s' \
  --name-only -z \
  | awk -v RS='\0' -v FS='\t' '
      {
        # Each record: SHA\tDATE\tSUBJECT\nFILE1\nFILE2\n...
        n = split($0, lines, "\n")
        header_parts = split(lines[1], h, "\t")
        sha = h[1]; date = substr(h[2], 1, 10); subject = h[3]
        gsub(/"/, "\\\"", subject)
        files_json = "["
        for (i = 2; i <= n; i++) {
          if (lines[i] == "") continue
          if (files_json != "[") files_json = files_json ","
          f = lines[i]; gsub(/"/, "\\\"", f)
          files_json = files_json "\"" f "\""
        }
        files_json = files_json "]"
        printf "{\"sha\":\"%s\",\"date\":\"%s\",\"subject\":\"%s\",\"files\":%s}\n", sha, date, subject, files_json
      }
    '

---
name: track-app-changes
description: "Analyze commits from the Beebole app repository (beebole/reboot) and maintain a human-readable changelog of product changes in .todo/app-changes.md. Use when asked to track app changes, check what changed in the app, update the changelog, or see recent product changes."
---

# Track App Changes

Analyze commits from the Beebole application repository (beebole/reboot) and maintain a human-readable changelog of product changes in `.todo/app-changes.md`.

## Prerequisites

- `gh` (GitHub CLI) must be installed and authenticated (`gh auth status`)

## Workflow

### 1. Determine the start date

Check if `.todo/app-changes.md` already exists.

- **If it exists:** Read the file and find the date of the most recent entry (the first date in the file). Use that date as the `--since` parameter for the git log query.
- **If it does not exist:** Use 6 months ago from today as the start date (first run).

### 2. Fetch commits from the app repository

Use the GitHub CLI to list commits on the **dev** branch since the determined start date:

```bash
gh api "repos/beebole/reboot/commits?sha=dev&since=YYYY-MM-DDTHH:MM:SSZ&per_page=100" --paginate --jq '.[] | "\(.commit.committer.date | split("T")[0]) | \(.sha[0:7]) | \(.commit.message | split("\n")[0])"'
```

This returns one line per commit: `DATE | SHORT_SHA | FIRST_LINE_OF_MESSAGE`.

If there are no new commits since the last entry, report "No new changes found" and stop.

### 3. Analyze and categorize commits

Group commits by date and interpret what changed in human-readable terms. For each commit:

- Read the commit message and infer what product area was affected.
- If the commit message is unclear, fetch the commit details for more context:
  ```bash
  gh api "repos/beebole/reboot/commits/FULL_SHA" --jq '.files[].filename'
  ```
- Translate technical commit messages into plain-language descriptions of what changed in the app. Focus on **what the user would notice**, not implementation details.

**Categorization rules:**
- Group related commits (e.g., multiple commits about the same feature on the same day) into a single changelog entry.
- Skip commits that are purely infrastructure, CI/CD, dependency bumps, or code formatting — unless they clearly affect user-facing behavior.
- When a commit touches i18n files, note that translations were updated but don't list each string change.

### 4. Write or update the changelog

Create or update `.todo/app-changes.md` with the new entries.

**File format:**

```markdown
# App Changes Tracker

Last updated: YYYY-MM-DD

## Changes

- **YYYY-MM-DD** — Short human-readable description of what changed
- **YYYY-MM-DD** — Another change
- **YYYY-MM-DD** — Another change
```

**Rules:**
- New entries go at the **top** of the `## Changes` section (newest first).
- Update the `Last updated` date to today.
- Each entry starts with the date in bold, followed by a concise description.
- Keep descriptions to one line each — no paragraphs, no technical details.
- If multiple commits relate to the same change on the same day, combine them into one entry.
- Do NOT remove or modify existing entries — only append new ones at the top.

### 5. Output

Print a summary after updating:

```
## App changes tracked

**Period:** [start date] to [today]
**New commits analyzed:** [count]
**New entries added:** [count]
**File:** .todo/app-changes.md
```

If this is the first run, mention that the file was created. On subsequent runs, mention how many new entries were added since the last check.

## Error handling

- If `gh` is not installed or not authenticated, stop and tell the user to run `brew install gh && gh auth login`.
- If the GitHub API returns rate limit errors, wait and retry once, or tell the user to try again later.
- If pagination returns more than 300 commits, process in batches and warn the user that some older commits may need a follow-up run.

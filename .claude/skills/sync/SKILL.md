---
name: sync
description: 'Detect changes in the Beebole app repository, map them to affected documentation pages, and produce a prioritized report of what needs updating. Optionally draft release notes. Use when asked to sync docs with the app, check what changed, find outdated pages, track app changes, propose updates, or generate news.'
disable-model-invocation: true
---

# Sync — Detect App Changes & Map to Documentation

Analyze commits from the Beebole application repository (`../reboot`), map them to affected documentation pages, and produce a prioritized report of proposed updates. Optionally draft release notes.

## Context

Before running, read these context files:

- `.claude/context/page-mappings.md` — keyword-to-page mapping table
- `.claude/context/product.md` — Beebole product overview and key concepts
- `.claude/context/brand.md` — voice, tone, and entity attribution rules (for news mode)

## Inputs

The user may optionally provide:

- **A date range** — only consider changes within this range (e.g., "since March 3")
- **A feature filter** — only consider changes matching a keyword (e.g., "just approval changes")
- **`--news`** — also draft release notes from the accumulated changes
- **`--all`** — ignore the cursor and reprocess all changes from scratch

If no inputs are given, process only changes since the last sync.

## Workflow

### 1. Determine what to process

#### 1a. Read the sync state

Check if `.sync/state.json` exists.

- **If it exists:** Read the `last_synced_sha`. Only process commits after this SHA.
- **If it does not exist:** This is the first run. Use 3 months of history.

#### 1b. Fetch commits from the app repository

Use the sibling repo at `../reboot` (see CLAUDE.md "App repository access"):

```bash
git -C ../reboot log <last_sha>..HEAD --format="%H|%ai|%s" --no-merges
```

If this is the first run (no state file), use:

```bash
git -C ../reboot log --since="3 months ago" --format="%H|%ai|%s" --no-merges
```

If there are no new commits since the last sync, report "No new changes found since last sync" and stop.

**Fallback:** If `../reboot` is not available, use the GitHub API:

```bash
gh api "repos/beebole/reboot/commits?sha=dev&since=YYYY-MM-DDTHH:MM:SSZ&per_page=100" --paginate --jq '.[] | "\(.sha)|\(.commit.committer.date)|\(.commit.message | split("\n")[0])"'
```

### 2. Analyze and categorize commits

For each commit, determine if it's user-facing:

**Include:**

- Changes to frontend components, backend entities, GraphQL schema
- Changes to i18n labels, design docs
- New features, UI changes, workflow changes
- Changes users would notice

**Exclude:**

- CI/CD, infrastructure, dependency bumps, code formatting
- Internal tooling, analytics setup
- CSS-only fixes with no behavioral change (unless part of a larger UX change)

For ambiguous commits, inspect the diff:

```bash
git -C ../reboot show <sha> --stat
git -C ../reboot show <sha> -- <specific-file>
```

Group related commits (same feature, same day) into single change entries. Translate technical messages into plain-language descriptions of what the user would notice.

### 3. Map changes to documentation pages

For each change entry:

1. **Keyword matching** — Match against `.claude/context/page-mappings.md`
2. **File-based inference** — If a page path is found, read it to assess state (stub/draft/published)
3. **No match** — Flag as potential new page or section needed

#### Auto-maintain page-mappings.md

Compare feature sections in `.features/features.md` against existing mappings. If new features have no mapping entry, collect them for a proposal at the end (Step 6).

### 4. Assess affected pages

For each mapped page, classify the change impact:

- **Already documented** — Page covers this behavior accurately
- **Needs update** — Page exists but doesn't reflect the change
- **Needs new section** — Page exists but change requires new content
- **Stub/draft** — Entire page needs writing; the change is one of many gaps
- **New page needed** — No existing page covers this feature area

When the change is ambiguous, verify against source code:

- Read relevant files from `../reboot/` using Grep and Read
- Check `../reboot/shared/i18n/en/labels.json` for UI terminology

### 5. Compile the report

**Do NOT make any changes to documentation files.** Present findings as a structured report:

```
## Sync Report

**Period:** [earliest date] to [latest date]
**New commits analyzed:** [count]
**User-facing changes:** [count]
**Pages affected:** [count]

---

### Priority 1 — Stub pages that need writing

| Page | Status | Related changes | What to write |
|------|--------|----------------|---------------|

### Priority 2 — Existing pages that need updates

| Page | What changed in the app | What to update in the docs |
|------|------------------------|---------------------------|

### Priority 3 — New pages or sections needed

| App change | Recommendation |
|-----------|---------------|

### Priority 4 — Minor or no doc impact

| App change | Reason skipped |
|-----------|---------------|

---

### Recommended next steps
1. [Ordered list of what to work on first]

Want me to start working on any of these? I can draft pages, update sections, or run `/audit` on specific pages.
```

### 6. Save state and results

#### Update sync state

Write `.sync/state.json`:

```json
{
	"last_synced_sha": "<HEAD sha from this run>",
	"last_synced_at": "<current timestamp>",
	"branch": "dev"
}
```

#### Save the report

Write the report to `.sync/changes.md` (overwritten each run).

Append a log entry to `.sync/log.md` (append-only, reverse chronological):

```markdown
## Run: YYYY-MM-DD

**Changes processed:** [count] from [earliest] to [latest]

- **YYYY-MM-DD** — [change] → [mapped page] — [assessment]
```

#### Propose page-mappings.md updates

If unmapped features were found, propose additions:

> "I found N features without documentation mappings. Proposed additions to `page-mappings.md`:
>
> | Keywords           | Page                    |
> | ------------------ | ----------------------- |
> | `keyword, keyword` | `help/path/to/page.mdx` |
>
> Shall I add these rows?"

Only write to `page-mappings.md` after user confirms.

### 7. News mode (`--news`)

When `--news` is requested, additionally draft release notes:

1. Read `help/news/releases.mdx` — find the last `<Update>` label
2. Filter changes to newsworthy items:
    - **Include:** New features, significant improvements, new integrations, workflow changes
    - **Exclude:** Infrastructure, CSS fixes, analytics, bug fixes users wouldn't notice
3. Present the draft for user validation before writing
4. Once confirmed, insert new `<Update>` block at the top of all three language files:
    - `help/news/releases.mdx` (English)
    - `help/fr/news/releases.mdx` (French)
    - `help/es/news/releases.mdx` (Spanish)

Use localized month names for FR/ES labels.

## Rules

- **Read-only by default.** Never modify documentation files. Only write to `.sync/` files.
- **page-mappings.md requires confirmation.** Never add rows without user approval.
- **Be specific.** For each proposed update, state exactly what needs changing and why.
- **Don't invent features.** Only report changes the commit history and source code confirm.
- **Group related changes.** Multiple commits about the same feature → one entry.
- **Consider all three languages.** Note that FR/ES versions also need updates.
- **Graceful degradation.** If `../reboot` is missing, fall back to `gh api`. If neither works, report what was skipped.

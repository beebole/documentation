# Triage Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse `/triage` routing from 5 destinations to 3, replace `page-notes.md` + the never-built `modules/` with a single `feedback.md`, and switch the workflow to batch approval.

**Architecture:** Documentation/config change only — no code, no tests. Five files touched in one commit because they only make sense together. New file (`feedback.md`) absorbs two old concepts; the SKILL.md rewrite encodes the new workflow; `page-mappings.md` and `CLAUDE.md` lose stale references; `page-notes.md` is deleted.

**Tech Stack:** Markdown only.

**Spec:** `docs/superpowers/specs/2026-04-28-triage-simplification-design.md`

---

## File Structure

| File | Action | Responsibility |
| --- | --- | --- |
| `.claude/context/feedback.md` | Create | Single home for all triaged rules. Two H2 sections: `Site-wide`, `Per-page` (H3 per URL path). |
| `.claude/skills/triage/SKILL.md` | Rewrite | New 3-option routing + batch approval workflow. |
| `.claude/context/page-mappings.md` | Trim | Remove the `Page → Module routing` table; keep keyword → page table. |
| `CLAUDE.md` | Edit one table | Drop `modules/<entity>.md` row, replace `page-notes.md` row with `feedback.md`, update `page-mappings.md` description. |
| `.claude/context/page-notes.md` | Delete | Superseded by `feedback.md`. |

All five edits land in **one commit**: `chore(triage): simplify routing — feedback.md replaces page-notes + modules`.

---

### Task 1: Create `feedback.md`

**Files:**

- Create: `.claude/context/feedback.md`

- [ ] **Step 1: Write `feedback.md` with the canonical empty-state structure**

```markdown
# Feedback rules

Rules filed by `/triage` from `docs/feedback/`. Skills load this file and read the section relevant to what they're working on:

- `/write` and `/review` on page X load `## Site-wide` plus `### X` (if it exists).
- `/translate` ignores this file and reads `translation-notes.md` instead.

If a rule applies to every page, file it under `## Site-wide`. If it applies to one page only, file it under `## Per-page` as a bullet inside an `### <URL path>` H3 (create the H3 on first entry; remove it when the last bullet leaves).

If a rule is about FR or ES translation specifically — recurring terminology, translation patterns — file it in `translation-notes.md` instead.

If a note is just wrong content with no rule that generalizes, fix the page directly (inline-fix). It does not belong here.

## Site-wide

_No rules filed yet._

## Per-page

_No rules filed yet. Entries appear as `### /help/...` H3 sections, each with a bullet list._
```

- [ ] **Step 2: Verify the file was created with the right content**

Run: `cat .claude/context/feedback.md | head -20`
Expected output starts with `# Feedback rules` and ends with the `_No rules filed yet._` placeholder under `## Per-page`.

---

### Task 2: Rewrite `.claude/skills/triage/SKILL.md`

**Files:**

- Modify: `.claude/skills/triage/SKILL.md` (full rewrite)

- [ ] **Step 1: Replace the entire file with the new content**

Use the Write tool to overwrite `.claude/skills/triage/SKILL.md` with:

````markdown
---
name: triage
description: 'Process marked-up review files in docs/feedback/ and file each note into feedback.md (site-wide or per-page), translation-notes.md, or as an inline page fix. Uses batch approval — present all proposed filings in one table, accept a single batch reply. Use when asked to triage feedback, process the feedback inbox, or file review notes.'
disable-model-invocation: true
---

# Triage — Process the Feedback Inbox

Read marked-up feedback files from `docs/feedback/`, propose filings for every note in one batch, apply the filings Yves approves, and delete the source file when done.

## Context

Before running, read these files so proposals land in the right place:

- `.claude/context/brand.md` — voice/tone rules (read-only here; `/triage` never edits)
- `.claude/context/documentation-structure.md` — structure rules (read-only here)
- `.claude/context/seo-geo.md` — SEO/GEO rules (read-only here)
- `.claude/context/mintlify-components.md` — component-usage rules (read-only here)
- `.claude/context/feedback.md` — existing site-wide and per-page rules (this skill writes to it)
- `.claude/context/translation-notes.md` — existing FR/ES rules (this skill writes to it)
- `.claude/context/page-mappings.md` — keyword → page routing (used to identify the referenced page when the feedback is unclear)

## Inputs

No arguments. The queue is whatever is in `docs/feedback/` (excluding `README.md`).

## Workflow

### 1. List the queue

```bash
ls docs/feedback/ | grep -v '^README.md$'
```

Show the count and filenames. If the folder is empty, report "Inbox is empty — nothing to triage" and stop.

### 2. Process each file

For each file in the queue (any order):

#### 2a. Read and parse

- Read the file in full.
- Identify which page(s) it references using these heuristics:
  - Explicit URL path like `/help/documentation/billing`.
  - A bolded page title that matches a page.
  - A file reference like `help/documentation/billing.mdx`.
  - For marked-up copies of `.mdx` files, infer from frontmatter `title` or the file's source.
- Split the content into **distinct notes**. A note is one discrete piece of feedback — a single correction, rule, or observation. Prose paragraphs may contain several; a bulleted list is usually one per bullet.

#### 2b. Auto-classify each note

Pick exactly one of:

1. **`feedback.md → Site-wide`** — the rule applies to every page (voice/tone, cross-cutting vocabulary, structure, SEO/GEO, component usage). Note: `/triage` never edits the authored doctrine files (`brand.md`, `documentation-structure.md`, `seo-geo.md`, `mintlify-components.md`). Site-wide rules from feedback land in `feedback.md` only.
2. **`feedback.md → Per-page (URL)`** — the rule applies only to one page. The H3 key is the page's URL path, starting with `/help/`.
3. **`translation-notes.md`** — the note is a *rule* about FR or ES translation (recurring terminology, translation pattern). If the marked-up file is an `.mdx` under `help/fr/` or `help/es/`, default here unless the note is clearly about the underlying EN source.
4. **`inline-fix (URL)`** — the note is plainly wrong content on the page; no rule generalizes. Edit the page directly. Applies to EN pages under `help/` and translated pages under `help/fr/` or `help/es/` — a one-off typo or grammar fix on a translated page is an inline-fix, not a translation rule.
5. **`skip`** — non-actionable (positive comments like "I love this section!", vague approval, off-topic). Recorded in the final report but not filed.

When the routing isn't obvious between two of the above, append `(?)` to the proposal so it's flagged.

#### 2c. Present one table for the file

```text
## <filename> — N notes

| # | Note (excerpt)                              | Proposal                                         |
| - | ------------------------------------------- | ------------------------------------------------ |
| 1 | "Main page — only 'project time tracking'?" | feedback.md → Per-page /help/index               |
| 2 | "I generally like the bubble comments…"     | skip (positive, not actionable)                  |
| 3 | "Welcome to Beebole too repetitive"         | inline-fix /help/documentation/quickstart.mdx    |
| … |                                             |                                                  |
```

Excerpt the note to roughly one line; preserve enough wording for Yves to recognize it. Show every note, including auto-classified `skip` rows.

#### 2d. Get one batch reply

Yves answers with a compact command. Examples:

- `approve all`
- `approve all except 5, 12`
- `approve 1-4, 6-11, 13-25; skip 5, 12`
- `edit 3: site-wide instead; skip 7; approve rest`
- `edit 14: route to inline-fix; approve rest`

Grammar:

- Comma-separated indices or ranges per action.
- `rest` or `all` covers leftover rows.
- `edit N: <instruction>` accepts either replacement bullet text or a re-routing instruction (e.g. `edit 5: site-wide instead`, `edit 7: route to inline-fix`). Re-routed rows then apply to their new target.
- If the reply is ambiguous, ask one clarifying question — do not guess.

#### 2e. Apply, grouped by target

- Group all approved bullets by their destination (e.g., everything filing into `### /help/documentation/timesheets` is appended in one edit).
- Create H3 sections in `feedback.md` on first entry for that URL.
- Apply inline-fixes to the referenced `.mdx` page directly.
- Apply translation-notes entries to the right language H3/H4 in `translation-notes.md`.

#### 2f. Delete the source file and commit

When every note in the file has been resolved (filed or skipped):

```bash
rm docs/feedback/<filename>
git add .claude/context/feedback.md .claude/context/translation-notes.md help/ docs/feedback/
git commit -m "feedback(<topic>): N filed, M inline fixes, S skipped"
```

`<topic>` is a short slug describing the feedback (e.g., `billing`, `miguel-q1`, `multi`). Stage only:

- `.claude/context/feedback.md` (if it changed)
- `.claude/context/translation-notes.md` (if it changed)
- `help/` paths touched by inline-fixes
- the deleted `docs/feedback/<filename>`

Never stage `.claude/skills/` or `CLAUDE.md` — `/triage` does not edit them.

One commit per source feedback file.

### 3. Final report

After all files are processed:

```text
## Triage complete

Files processed: N
Filed:
  feedback.md → Site-wide: X
  feedback.md → Per-page: Y (across Z pages)
  translation-notes.md: W
Inline fixes: M
Skipped: S

Inbox after triage: [file list — should be empty or only README.md]
```

## Rules

- **Never delete a source feedback file** until every note in it has been resolved (approved, edited, or explicitly skipped).
- **One commit per source feedback file** — don't batch multiple source files into one commit.
- **No auto-approval.** Every batch requires Yves's explicit reply.
- **`/triage` never edits authored doctrine** (`brand.md`, `documentation-structure.md`, `seo-geo.md`, `mintlify-components.md`). Site-wide rules from feedback land in `feedback.md`.
- **Translation-only routing.** A *rule* about FR/ES translation goes to `translation-notes.md` and nowhere else. A one-off typo or grammar fix on a translated page is an inline-fix.
- **README.md is not feedback.** Skip `docs/feedback/README.md` in the queue listing.
````

- [ ] **Step 2: Verify the rewrite**

Run: `head -5 .claude/skills/triage/SKILL.md`
Expected: `---` then `name: triage` then a `description:` line that mentions `feedback.md` and "batch approval".

Run: `grep -c '^## ' .claude/skills/triage/SKILL.md`
Expected: at least 4 (Context, Inputs, Workflow, Rules — plus any others).

Run: `grep -i 'modules/' .claude/skills/triage/SKILL.md`
Expected: no output (no lingering references to the old `modules/` concept).

---

### Task 3: Trim `page-mappings.md`

**Files:**

- Modify: `.claude/context/page-mappings.md` — remove the second table (`Page → Module routing`) and its `---` separator.

- [ ] **Step 1: Read the current file to confirm the section boundaries**

Run: `grep -n '^---$\|^# ' .claude/context/page-mappings.md`
Expected: shows the line of the `---` separator (around line 64) and the `# Page → Module routing` heading (around line 66).

- [ ] **Step 2: Delete the second table and its surrounding prose**

Use the Edit tool. Old string (the entire trailing block, starting with the `---` separator that precedes the second heading):

```markdown
---

# Page → Module routing

Map each page to the module file(s) whose rules apply when drafting, reviewing, or auditing it. `/triage` uses this to propose which `modules/<entity>.md` file a feedback note should land in. Skills that touch a page use it to pick which modules to load.

Entries appear here only after a module file is first created by `/triage`. Multiple modules per page are allowed. If a page has no row, it has no module rules — fall back to generic context files and `page-notes.md`.

Module names mirror the app's entity taxonomy from `../reboot/shared/i18n/en/labels.json` and `../reboot/frontend/src/models/types.ts`. Keep names kebab-case and singular where natural (e.g., `billing`, `absences`, `projects`, `work-schedule`).

| Page | Module(s) |
|---|---|
| _No mappings yet. Entries added as `/triage` creates module files._ | |
```

New string: (empty — fully delete this trailing block)

If the exact text differs from what's in the file, read the file fresh and adjust the `old_string` accordingly. Make sure not to leave a trailing blank line at the end of the file beyond the standard single newline.

- [ ] **Step 3: Verify**

Run: `grep -c '^# ' .claude/context/page-mappings.md`
Expected: `1` (only the top-level "Keyword → Page Mappings" heading remains).

Run: `grep -i 'module' .claude/context/page-mappings.md`
Expected: no output.

---

### Task 4: Update `CLAUDE.md`

**Files:**

- Modify: `CLAUDE.md` lines 174–186 (the writing-guide table)

- [ ] **Step 0: Surface pre-existing modifications**

There are pre-existing uncommitted changes to `CLAUDE.md` at session start (alongside `.gitignore` and `README.md`). To avoid silently bundling unrelated work into this commit, inspect them first:

```bash
git diff CLAUDE.md
```

If the pre-existing diff is unrelated to this triage refactor, stop and ask Yves: "There are pre-existing CLAUDE.md changes (lines X–Y) — bundle into this commit or separate them?" Do not proceed to step 1 until that's resolved. If the pre-existing changes are tiny and clearly related, note them in the commit message body in Task 6.

- [ ] **Step 1: Read the relevant slice**

Run: `sed -n '170,190p' CLAUDE.md`
Confirm the table is present and contains rows for `page-mappings.md`, `modules/<entity>.md`, and `page-notes.md`.

- [ ] **Step 2: Update the `page-mappings.md` row**

Use Edit. Old string:

```markdown
| `page-mappings.md`           | Keyword → doc page routing + page → module routing (used by `/find-gaps`, `/triage`)                 |
```

New string:

```markdown
| `page-mappings.md`           | Keyword → doc page routing (used by `/find-gaps`)                                                    |
```

- [ ] **Step 3: Replace the `modules/<entity>.md` row + the `page-notes.md` row with a single `feedback.md` row**

Use Edit. Old string (both rows together):

```markdown
| `modules/<entity>.md`        | Product-domain rules (terminology, facts, structural) — one file per entity, lazy-created by `/triage` (empty until first rule filed) |
| `page-notes.md`              | One-off corrections scoped to a single page (keyed by URL path)                                      |
```

New string:

```markdown
| `feedback.md`                | All rules filed by `/triage` — site-wide bullets and per-page bullets keyed by URL path              |
```

- [ ] **Step 4: Verify**

Run: `grep -E 'modules/|page-notes' CLAUDE.md`
Expected: no output.

Run: `grep 'feedback.md' CLAUDE.md`
Expected: exactly one line — the new table row.

---

### Task 5: Delete `page-notes.md`

**Files:**

- Delete: `.claude/context/page-notes.md`

- [ ] **Step 1: Confirm the file has no filed rules before deleting**

Run: `grep -E '^## /help/' .claude/context/page-notes.md`
Expected: no output (no actual page-keyed entries — only the format example inside a fenced code block).

If output appears, STOP and ask Yves how to handle the existing entries. They should be migrated into `feedback.md` under `## Per-page` before deletion.

- [ ] **Step 2: Delete the file**

```bash
rm .claude/context/page-notes.md
```

- [ ] **Step 3: Verify**

Run: `ls .claude/context/page-notes.md 2>&1`
Expected: `ls: .claude/context/page-notes.md: No such file or directory`

Run: `grep -rl 'page-notes' .claude/ CLAUDE.md docs/superpowers/specs/2026-04-28-triage-simplification-design.md 2>/dev/null`
Expected: only the spec doc reference (which is historical and fine to keep). No references in `.claude/skills/`, `.claude/context/`, or `CLAUDE.md`.

---

### Task 6: Final verification and commit

- [ ] **Step 1: Cross-file consistency checks**

Run: `grep -rn 'page-notes\|modules/<entity>\|Page → Module' .claude/ CLAUDE.md 2>/dev/null`
Expected: no output. (Stale references remain only in `docs/superpowers/specs/`, which is the design history and intentional.)

Run: `grep -l 'feedback.md' .claude/skills/triage/SKILL.md CLAUDE.md`
Expected: both files listed.

- [ ] **Step 2: Inspect the final shape of `feedback.md`**

Run: `cat .claude/context/feedback.md`
Expected: matches Task 1 Step 1 verbatim — `## Site-wide` and `## Per-page` placeholder sections.

- [ ] **Step 3: Inspect the final shape of `page-mappings.md`**

Run: `tail -5 .claude/context/page-mappings.md`
Expected: ends with the last keyword → page table row, no `---` separator, no second table.

- [ ] **Step 4: Stage and commit**

```bash
git add .claude/context/feedback.md \
        .claude/skills/triage/SKILL.md \
        .claude/context/page-mappings.md \
        CLAUDE.md
git rm .claude/context/page-notes.md
git status
```

Expected `git status` output:

- New file: `.claude/context/feedback.md`
- Modified: `.claude/skills/triage/SKILL.md`
- Modified: `.claude/context/page-mappings.md`
- Modified: `CLAUDE.md`
- Deleted: `.claude/context/page-notes.md`

Then commit:

```bash
git commit -m "$(cat <<'EOF'
chore(triage): simplify routing — feedback.md replaces page-notes + modules

- New `.claude/context/feedback.md` with two sections: Site-wide and Per-page (H3 per URL).
- /triage rewritten: 3 destinations (feedback.md / translation-notes.md / inline-fix), batch approval table instead of per-note ping-pong.
- Drop `.claude/context/page-notes.md` (empty, superseded).
- Drop `Page → Module routing` table from page-mappings.md.
- CLAUDE.md context-file table: page-mappings description trimmed; modules + page-notes rows replaced with a single feedback.md row.

Spec: docs/superpowers/specs/2026-04-28-triage-simplification-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5: Verify the commit**

Run: `git log -1 --stat`
Expected: one commit with the message above and exactly five files changed (1 created, 3 modified, 1 deleted).

Run: `git status`
Expected: working tree clean (or only contains unrelated pre-existing modifications to `.gitignore`, `CLAUDE.md`, `README.md` that were already showing in `git status` at session start — note that `CLAUDE.md` should now be staged-and-committed, not still showing as modified).

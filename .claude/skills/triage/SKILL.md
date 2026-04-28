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

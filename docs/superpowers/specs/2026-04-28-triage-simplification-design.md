# Triage skill simplification — design

**Date:** 2026-04-28
**Status:** Approved
**Topic:** Simplify `/triage` and the context files it writes to.

## Motivation

The current `/triage` skill files notes into five different destinations: four generic doctrine files (`brand.md`, `documentation-structure.md`, `seo-geo.md`, `mintlify-components.md`), per-entity module files (`modules/<entity>.md`), per-page notes (`page-notes.md`), translation notes (`translation-notes.md`), or inline page edits. The module concept is theoretical infrastructure — zero module files exist, zero page-notes entries exist, and the page → module routing table in `page-mappings.md` is an empty placeholder.

In addition, the workflow asks for per-note approval. A real feedback file (e.g. `feedback_miguel.md`) contains ~25 notes, producing 25 sequential approve/edit/skip prompts.

This design simplifies routing and switches approval to a single batch step.

## Scope

In scope:

- Collapse `page-notes.md` and the never-built `modules/` into a single `feedback.md`.
- Drop the page → module routing table from `page-mappings.md`.
- Update `CLAUDE.md` to reflect the new file layout.
- Rewrite `/triage` with a batch-approval workflow and 3 routing options instead of 5.

Out of scope (deferred):

- Source-of-truth verification against `../reboot` or current page content during classification. The batch table makes wrong routings easy for the reviewer to spot; a heavier verification step can come later if false rules start landing.
- Promoting bullets to module files. Cross-page domain rules will live as duplicated bullets across multiple per-page H3s. If duplication becomes painful, a future change can introduce a module concept with concrete data in hand.

## Files affected

| File | Action |
| --- | --- |
| `.claude/skills/triage/SKILL.md` | Rewrite — new workflow, 3 routing options |
| `.claude/context/feedback.md` | **Create** — replaces `page-notes.md` and the never-built `modules/` |
| `.claude/context/page-notes.md` | **Delete** — empty today, superseded |
| `.claude/context/page-mappings.md` | Drop the "Page → Module routing" table; keep the keyword → page table |
| `CLAUDE.md` | Update the context-file table: drop the `modules/<entity>.md` row, replace `page-notes.md` with `feedback.md` |
| `.claude/context/translation-notes.md` | **Unchanged** — only `/triage` and `/translate` read it |

The four authored doctrine files (`brand.md`, `documentation-structure.md`, `seo-geo.md`, `mintlify-components.md`) are not touched by this change and remain off-limits to `/triage` going forward.

## `feedback.md` structure

```markdown
# Feedback rules

Rules filed by /triage from docs/feedback/. Skills load this file
and use the relevant section for the page they're working on.

## Site-wide
_No rules filed yet._

## Per-page
_No rules filed yet. Entries appear as H3 sections keyed by URL path._
```

When a bullet is filed:

- **Site-wide** → bullet under `## Site-wide`.
- **Per-page** → bullet under `### <URL path>` inside `## Per-page`. Create the H3 on first entry; delete it when the last bullet leaves.

Skills consume the file as follows:

- `/write` and `/review` on page X load `## Site-wide` + `### X` (if it exists).
- `/translate` ignores `feedback.md` and reads `translation-notes.md` instead.

## /triage workflow (batch mode)

1. **List the queue.** Show files in `docs/feedback/`, excluding `README.md`. If empty → "Inbox is empty — nothing to triage" and stop.

2. **Parse one file at a time.** Read the file in full. Identify referenced page(s) using the existing heuristics (URL paths, bolded titles, file references, `.mdx` frontmatter). Split into distinct notes. For each note, auto-classify into exactly one of:
   - `feedback.md → Site-wide`
   - `feedback.md → Per-page (URL)`
   - `translation-notes.md → FR/ES (terminology or page note)`
   - `inline-fix (URL)`
   - `skip` (non-actionable — positive comments, vague approval)

3. **Present one table for the file:**

   ```text
   ## feedback_miguel.md — 25 notes

   | # | Note (excerpt)                              | Proposal                                       |
   |---|---------------------------------------------|------------------------------------------------|
   | 1 | "Main page — only 'project time tracking'?" | feedback.md → Per-page /help/index             |
   | 2 | "I generally like the bubble comments…"     | skip (positive, not actionable)                |
   | 3 | "Welcome to Beebole too repetitive"         | inline-fix /help/documentation/quickstart.mdx  |
   | … |                                             |                                                |
   ```

   Ambiguous routings carry a trailing `(?)` so they're visible.

4. **One batch reply.** Yves responds with a compact command. Examples:
   - `approve all`
   - `approve all except 5, 12`
   - `edit 3: <new text>; skip 7; approve rest`

   Grammar: comma-separated indices per action; `rest` or `all` covers leftover rows. `edit N: <instruction>` accepts either a replacement bullet text or a re-routing instruction (e.g. `edit 5: site-wide instead`, `edit 7: route to inline-fix`). Re-routed rows are then applied to the new target.

5. **Apply, grouped by target.** All bullets going to the same destination (e.g. the same `### /help/documentation/timesheets` H3) are appended together in one edit. Create H3 sections as needed.

6. **Commit per source file.** Message format: `feedback(<topic>): N filed, M inline fixes, S skipped`. Stage `.claude/context/feedback.md`, `.claude/context/translation-notes.md`, `help/`, and the deleted `docs/feedback/<filename>`. Never stage `.claude/skills/` or `CLAUDE.md`.

7. **Final report** after all files are processed:

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

- Source feedback file deleted only after every note resolves (approved, edited, or explicitly skipped).
- One commit per source feedback file.
- `/triage` never edits `brand.md`, `documentation-structure.md`, `seo-geo.md`, `mintlify-components.md` — those are authored doctrine.
- `README.md` excluded from the queue.
- Translation-only routing: a *rule* about FR/ES translation goes to `translation-notes.md` and nowhere else. A one-off typo on a translated page is still an inline-fix.

## Implementation order

One commit, since these only make sense together:

1. Create `.claude/context/feedback.md`.
2. Rewrite `.claude/skills/triage/SKILL.md`.
3. Trim `page-mappings.md` (delete the second table).
4. Update `CLAUDE.md` (context-file table row swap).
5. Delete `.claude/context/page-notes.md`.

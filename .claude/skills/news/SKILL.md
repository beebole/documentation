---
name: news
description: 'Draft a release-notes entry in help/news/releases.mdx from recent app-repo commits. Default: use the most recent <Update label="Month YYYY"> block as the cursor, draft a new entry for commits since then. `--since <date|sha>` overrides the cursor explicitly. Uses the same change-detection script as /discover. Replaces the former /sync --news mode.'
disable-model-invocation: true
---

# News — Release Notes Author

Prepend a new `<Update label="Month YYYY">` block to `help/news/releases.mdx` summarizing app-repo commits since the most recent published block. Autonomous by default — Yves reviews and publishes separately.

## Context

- `.claude/context/brand.md` — voice, tone, entity attribution rules
- `.claude/context/documentation-structure.md` — page structure
- `.claude/context/seo-geo.md` — SEO conventions (frontmatter is preserved unchanged on releases.mdx)
- `.claude/context/product.md` — Beebole product overview

Inspect existing `<Update>` blocks in `help/news/releases.mdx` to match tone, length, and structure.

## Interface

- **Default (no args):** `/news` — read `help/news/releases.mdx`, parse the most recent `<Update label="Month YYYY">` value, use that month as the cursor, draft a new block for commits since then.
- **`--since <date|sha>`:** explicit cursor. Use for re-drafting a window, covering a specific feature release, or backfilling.

## Workflow

### 1. Determine the cursor

**Default:**
- Read `help/news/releases.mdx`.
- Find the first `<Update label="..."` line — that's the most recent block.
- Parse the label as `<Month> <YYYY>` (e.g., `March 2026`).
- Convert to the first day of the month after that label (e.g., `March 2026` → `2026-04-01`) so the new block covers everything published *since* the previous one.

**`--since <date|sha>`:** use the explicit value verbatim (script accepts both formats).

**First-ever run (no `<Update>` blocks exist):** default to 3 months ago. Print a warning.

### 2. Detect changes

Invoke the shared script:

```bash
.claude/scripts/detect-reboot-changes.sh --since <cursor>
```

Parse the one-JSON-per-line output.

### 3. Group commits by category

For each commit, classify by subject prefix + path analysis:

- `feat:` → **New features**
- `fix:` → **Fixes**
- `perf:` / user-visible improvements → **Improvements**
- `docs:` / `chore:` / `refactor:` / `test:` / dependency bumps → **skip** (unless the path suggests user-facing impact)
- Other / no prefix → read the subject + top files; classify by hand.

### 4. Draft the new `<Update>` block

The label is the *current* month (or the month explicitly being covered, if `--since` is given for a backfill).

Insert at the top of `help/news/releases.mdx`, *immediately after* the closing `---` of the frontmatter and any blank line, before the first existing `<Update>`:

```mdx
<Update label="<Month YYYY>" tags={["<Tag1>", "<Tag2>", "<Tag3>"]}>
  <One- to two-sentence highlight describing the most user-visible change.>

  <Each subsequent paragraph: one user-visible change in 1-2 sentences. Skip Markdown bullets — match the existing format which uses bare paragraphs inside the Update component.>

  <Continue for each grouped change…>
</Update>
```

Rules for writing inside the block:

- **Match the existing style** — paragraphs (not bulleted lists), present tense, second person, no headings.
- **Bold UI labels** from `../reboot/shared/i18n/en/labels.json` when introducing them.
- **Group related commits** into a single paragraph if they describe one user-visible change.
- **Skip the noise.** Refactors, dependency bumps, test-only, doc-only — don't include.
- **Pick `tags` from the existing tag vocabulary** in the file (e.g., Integrations, Approvals, Reports, Notifications, Authentication, Timesheet, Planning). Add a new tag only if no existing one fits.
- **Link to docs** when the feature has a dedicated page: write the feature name and let the user add the link in review (or include `[feature](/help/documentation/...)` if the page exists and is unambiguous).

### 5. Report

```
## News entry drafted

**File:** help/news/releases.mdx
**New block:** <Month YYYY>
**Cursor:** <date or sha>
**Commits covered:** N
**Grouped into:**
- New features: X paragraphs
- Improvements: Y paragraphs
- Fixes: Z paragraphs
- Skipped (non-user-facing): W commits

**Tags applied:** [Tag1, Tag2, …]

**Next step:** review the draft, then `/translate` to sync FR/ES (`help/fr/news/releases.mdx`, `help/es/news/releases.mdx`).
```

## Rules

- **Autonomous — no checkpoints.** Produce the full draft. User reviews after.
- **Never push.** Write the file. Committing is Yves's decision.
- **One Update block per run.** Don't backfill multiple months in a single run unless `--since` was used to scope a specific window.
- **Match the file's existing format.** Paragraph style (not bullets), tag vocabulary, label format `Month YYYY`.
- **Skip the noise.** Dependency bumps, refactors, test-only changes, doc-only changes — don't include.
- **Graceful degradation.** If `../reboot` isn't accessible, fall back to `gh api` via the shared script. If both fail, report "cannot detect changes" and don't produce an empty release note.
- **Never include internal jargon.** Keep the language user-facing (no `modules/`, no `entity`, no skill names).
- **Don't touch frontmatter.** The `releases.mdx` frontmatter (`title`, `tag`, `rss`, `description`) stays as-is.
- **Don't touch FR/ES.** `/translate` handles those.

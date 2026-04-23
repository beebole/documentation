---
name: discover
description: 'Detect what the documentation needs. Scans `../reboot` for recent commits that affect pages AND cross-references the full feature catalog against existing documentation to find gaps. Produces `.todo/discovery.md` — the handoff consumed by `/write`. Use when asked to sync docs with the app, find documentation gaps, check what changed, or prepare the next batch of pages to write.'
disable-model-invocation: true
---

# Discover — Find What the Docs Need

Produce a single discovery report covering two questions:

1. **What changed in the app?** — recent commits in `../reboot` that affect documented pages.
2. **What's undocumented?** — features in the catalog with no or partial coverage in the docs.

Output is a single file `.todo/discovery.md` with both sections, formatted as a handoff that `/write` (no-args default) consumes directly.

## Context

Before running, read:

- `.claude/context/product.md` — Beebole product overview
- `.claude/context/page-mappings.md` — keyword routing + Page → Module routing
- `.claude/context/brand.md` — voice/tone rules (applied if drafting any proposals inline)
- `.claude/context/terminology.md` — cross-cutting vocabulary rules

**Feedback-aware loading.** Read ALL files in `.claude/context/modules/`. Skip silently if the directory is absent or empty — it's lazy-created by `/triage` and may not exist yet. When a change or coverage gap touches a module with accumulated rules, flag it in the report as **Rule-level review** — the module rules may also need to be updated, not just the pages.

## Modes

- **Default (no args):** run both change detection and full coverage analysis.
- **`--changes`:** only recent app-repo changes.
- **`--coverage`:** only feature-catalog vs. documentation comparison.
- **`--all`:** ignore the sync cursor and rescan from 3 months of history (for full reprocess).

## Workflow

### 1. Determine the cursor for change detection

Read `.sync/state.json` if it exists. Use `last_synced_sha` as the cursor. If absent or `--all`, fall back to 3 months.

### 2. Run change detection (unless `--coverage`)

Invoke the shared script:

```bash
.claude/scripts/detect-reboot-changes.sh
```

(In `--all` mode: `.claude/scripts/detect-reboot-changes.sh --since "3 months ago"`.)

Parse the one-JSON-per-line output. For each commit:
- Read `page-mappings.md` and semantically match the commit's files + subject line to documentation pages.
- Group affected pages by commit.
- Flag modules (from "Page → Module routing") whose rules may need review.

### 3. Run coverage analysis (unless `--changes`)

Read `.features/features.md` (symlink to the reboot repo's feature catalog).

**Format guard:** if the catalog has fewer than 20 or more than 26 sections, or fewer than 100 bullets total, halt and warn the user — the catalog format has drifted and classification may be unreliable.

Extract every bullet from sections 1–24. Skip section 25 (Planned Features) and the Internal section.

For each feature:
- Match it to a documentation page via `page-mappings.md` (semantic match on keywords).
- If mapped page exists: read it and classify the feature as **Covered**, **Partial**, or **Missing**.
- If mapped page doesn't exist: classify as **Missing** (full gap).
- If no mapping row: flag the page-mapping gap as a separate issue.

**Dedup with recent changes.** If a feature classified as **Missing** or **Partial** is also touched by a commit from Step 2, list the gap once under Coverage and reference the commit SHA rather than duplicating under Recent changes.

### 4. Write `.todo/discovery.md`

Overwrite with:

```markdown
# Discovery report

Generated: YYYY-MM-DD
Mode: [full|changes-only|coverage-only]
Cursor: <sha or date>

---

## Recent changes → affected pages

[For each commit that affected pages:]
- **<sha-short>** (<date>) — <subject>
  - Pages: `<path>`, `<path>`
  - Module(s): `modules/<entity>.md` (rule-level review recommended)
  - Files in change: <count> files including <top 3>

[If no changes since cursor:]
_No commits since cursor._

---

## Coverage gaps → undocumented features

[For each gap, grouped by feature section. Format is fixed so `/write` can parse reliably.
Each line starts with `- [ ] <Kind> | <path> | ` — pipe-delimited, stable anchors.]

### Section N: <section name>

- [ ] Missing | `<path>` | <feature> [| from commit <sha-short> if covered by Recent changes]
- [ ] Partial | `<path>` | <feature> — needs: <what to add>

[If no gaps:]
_All features covered._

---

## Rule-level review recommended

[For each module whose rules may need revisiting:]
- `modules/<entity>.md` — <why: which change or gap affected it>

---

## Proposed page-mappings additions

[For each feature with no row in page-mappings.md's Keyword→Page table:]
- Keywords: `<keyword-list>` → proposed page: `<path>`

[If none:]
_No new mappings needed._

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (one per line). Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each.
```

**After writing the file, ask the user to approve any Proposed page-mappings additions** before modifying `page-mappings.md`. If approved, add the rows and commit `page-mappings.md` alongside `.todo/discovery.md`.

### 5. Update the sync cursor

Rules by mode:

- **Default** and **`--changes`** and **`--all`:** write `last_synced_sha` = `git -C ../reboot rev-parse HEAD` (current tip), regardless of whether the script returned any commits.
- **`--coverage`:** do NOT touch `.sync/state.json`. Coverage runs don't consume the cursor.
- **`../reboot` unavailable in any mode:** do NOT touch `.sync/state.json`. Preserving the existing cursor means the next successful run picks up correctly.

Write `.sync/state.json` in the shape `{ "last_synced_sha": "<sha>" }`.

### 6. Print summary

```
Discovery complete.

Changes: N commits affecting M pages across P modules.
Coverage: X missing, Y partial across Z sections.
Report written to .todo/discovery.md.

Next step: /write to draft the missing pages.
```

## Rules

- **Always write `.todo/discovery.md`.** Even if both sections are empty, write the file so `/write` has a consistent input contract.
- **Don't modify documentation pages.** `/discover` is read-only — no edits to `help/**`.
- **Graceful degradation.** If `../reboot` is not available, emit `_Change detection skipped: ../reboot not found_` and continue with coverage analysis using `.features/features.md` (which may also be a broken symlink). Report what was skipped.
- **Never silently merge features.** Every feature in the catalog either maps to a page or is flagged as a gap.

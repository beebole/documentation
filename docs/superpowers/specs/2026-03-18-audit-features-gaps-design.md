# Design: `audit-features-gaps` skill

**Date:** 2026-03-18
**Status:** Approved

---

## Purpose

A slash command (`/audit-features-gaps`) that audits the documentation repository against `.features/features.md` at the sub-feature level. For every user-facing feature bullet that is missing or only partially documented, it generates a numbered plan of action and a compact quick-reference index.

---

## SKILL.md structure

The resulting SKILL.md must begin with YAML frontmatter:

```yaml
---
name: audit-features-gaps
description: "Check .features/features.md against the documentation and produce a numbered plan of action for every undocumented or partially documented sub-feature. Use when asked which features are missing from the docs, what needs to be written, or to get a coverage audit."
disable-model-invocation: true
---
```

`disable-model-invocation: true` ensures the skill only runs when explicitly invoked via `/audit-features-gaps`.

---

## Inputs

- `.features/features.md` — source of truth for all features
- `.claude/context/page-mappings.md` — maps keywords to pages; used as the feature→page mapping source
- `help/documentation/*.mdx`, `help/guides/*.mdx`, `help/integrations/*.mdx`, `help/api/*.mdx` — pages to check coverage against

No user arguments required. The skill is self-contained.

---

## Exclusions

The following sections of `features.md` are **skipped entirely**:

- **Section 25 — Planned Features** — not yet shipped, no docs needed yet
- **Internal (Non User-Facing)** — infrastructure concerns, not documented for end users

---

## Workflow

### Step 1 — Parse features.md

Read `.features/features.md`. Extract all bullet points from sections 1–24. Ignore sections 25 (Planned Features) and the Internal section at the bottom.

For each bullet, record:

- Parent section number and name
- Bullet text (feature name + description)

**Format guard:** After parsing, count extracted sections and bullets. If section count is not between 20 and 26, or bullet count is below 100, halt immediately and print:

> "Warning: features.md may have changed format. Found N sections and N bullets — expected 20–26 sections and 100+ bullets. Please check the file before re-running."

**Section matching:** Match sections by their number (e.g., `## 3.`). Section names are for reference only — the number is the authoritative key.

### Step 2 — Build the feature→page mapping from page-mappings.md

Read `.claude/context/page-mappings.md`. For each feature section extracted in Step 1, identify which doc pages to read by matching the section's name and bullet keywords against the keyword column of the table.

**Matching logic:** A page is relevant to a section if at least one of the table's keywords meaningfully relates to the section's name or its feature bullets. Use broad semantic matching — not exact string matching.

**When no match is found for a section:** Do not guess. Instead, list all doc files under `help/documentation/`, `help/guides/`, `help/integrations/`, and `help/api/`, then reason about which (if any) could cover this section. If a plausible match exists, use it and flag it as unconfirmed. If no plausible match exists, flag the section as a **full gap** and propose adding a new row to `page-mappings.md` at the end (Step 6).

**When a mapped page doesn't exist on disk:** Flag the section as a **full gap** — all its bullets are automatically Missing. Note the missing page path for Step 6.

### Step 3 — Read pages and classify sub-features

For each section with at least one existing mapped page, read those pages. Evaluate each feature bullet against the content.

Classify each bullet as:

- **Covered** — the feature has at least one dedicated paragraph, a named heading, or a step-by-step explanation. Brief but deliberate coverage counts.
- **Partial** — the feature appears only as a passing mention, a single sentence with no how-to, or a list item with no elaboration.
- **Missing** — no mention or coverage found anywhere in the mapped pages.

Decision rule for the Covered/Partial boundary: if a reader could understand *how* to use the feature from what's written, it's Covered. If they'd only know the feature *exists*, it's Partial.

Only **Missing** and **Partial** bullets produce plan entries. Covered bullets are silently skipped.

For sections flagged as full gaps in Step 2, all bullets are automatically **Missing** — no reading required.

### Step 4 — Write `.todo/coverage-gaps.md`

If `.todo/` does not exist, create it first.

Overwrite (do not append) `.todo/coverage-gaps.md` with two blocks:

#### Block 1 — Plan of action

```markdown
# Feature Coverage Gaps

Generated: YYYY-MM-DD
Features audited: N user-facing feature bullets
Gaps found: N (N missing, N partial)

---

## Plan of action

1. **[Section name] Short action title** — One sentence describing what to write or add.
2. ...
```

Items are ordered by feature section (1 → 24). Within each section, Missing items come before Partial items.

Each item must include:

- Section name in brackets
- An actionable title (e.g. "Create `tasks.mdx`", "Document timesheet score", "Add WFH flag to timesheets.mdx")
- A one-sentence description of what's needed

For sections with no existing page, produce a single plan item: "Create `<path>` — Document all N features in this section: [comma-separated list of feature names]."

#### Block 2 — Quick-reference index

```markdown
## Quick reference

1. Create tasks.mdx
2. Timesheet score
3. Admin force-edit
...
```

Same numbers as Block 1. One line per item, no descriptions. Used for referencing items during execution (e.g. "work on item 7").

### Step 5 — Print to chat

Print both blocks to chat. Also print a one-line summary at the top:

> "Found N gaps (N missing, N partial) across N feature sections. Full plan saved to `.todo/coverage-gaps.md`."

### Step 6 — Propose page-mappings.md updates

After printing results, if any gaps were found in the mapping (unmapped sections, missing pages on disk, or unconfirmed matches from Step 2), propose the additions and ask for confirmation before writing:

> "I found N mapping gaps in `page-mappings.md`. Here are the proposed additions:
>
> | Keywords | Page |
> | --- | --- |
> | `task, task management` | `help/documentation/tasks.mdx` |
> | ... | ... |
>
> Shall I add these rows to `page-mappings.md`?"

Only write to `page-mappings.md` once the user confirms. When writing:

- Follow the existing row format: `| keywords, comma-separated | \`path(s)\` |`
- Check for semantic overlap with existing rows — don't duplicate a keyword that already maps to the same page
- Never remove or overwrite existing rows

---

## Output files

| File | Purpose |
| --- | --- |
| `.todo/coverage-gaps.md` | Primary output — plan + quick reference (overwritten each run) |
| `.claude/context/page-mappings.md` | Updated keyword→page routing table (additive, after user confirmation) |

---

## Rules

- **Read-only on doc pages.** Never modify documentation files during this audit.
- **page-mappings.md is the mapping source.** Do not maintain a separate hardcoded table — always derive the feature→page mapping from that file.
- **Sub-feature granularity.** Each bullet in features.md is evaluated independently — don't collapse multiple bullets into one gap entry unless the entire section has no page.
- **Be specific.** Each plan item must name the exact page and feature, not just the section.
- **Don't invent gaps.** If a feature is reasonably covered even without matching exact wording, classify it as Covered.
- **Ordered output.** Plan items follow section order (1–24) for predictability.
- **Idempotent.** Re-running the skill overwrites `.todo/coverage-gaps.md` with a fresh audit. It does not append.
- **Propose, don't assume.** When page-mappings.md needs updates, ask before writing.

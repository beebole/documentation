---
name: audit-features-gaps
description: "Check .features/features.md against the documentation and produce a numbered plan of action for every undocumented or partially documented sub-feature. Use when asked which features are missing from the docs, what needs to be written, or to get a coverage audit."
disable-model-invocation: true
---

# Audit Feature Coverage Gaps

Compare every user-facing feature bullet in `.features/features.md` against the documentation. For each feature that is missing or only partially documented, produce a numbered plan of action and a compact quick-reference index. Save results to `.todo/coverage-gaps.md` and print both blocks to chat.

## Step 1 — Parse features.md

Read `.features/features.md`. Extract all bullet points from sections 1–24.

Skip entirely:
- Section 25 (Planned Features) — not yet shipped
- The "Internal (Non User-Facing)" section at the bottom — infrastructure only

For each bullet, record the parent section number (e.g. `3`) and the full bullet text.

**Format guard:** After parsing, count sections and bullets. If sections < 20 or > 26, or bullets < 100, halt and print:

> "Warning: features.md may have changed format. Found N sections and N bullets — expected 20–26 sections and 100+ bullets. Please check the file before re-running."

**Section matching rule:** Use the section number (e.g. `## 3.`) as the key. Section names are for reference only.

## Step 2 — Build the feature→page mapping

Read `.claude/context/page-mappings.md`. For each feature section from Step 1, identify which doc pages to read by semantically matching the section name and its bullet keywords against the keyword column of the table.

**Matching is semantic, not literal.** A page is relevant if its keywords meaningfully relate to the section — not just exact string matches.

**When no match is found for a section:**
1. List all files under `help/documentation/`, `help/guides/`, `help/integrations/`, `help/api/`
2. Reason about which (if any) could cover this section
3. If a plausible match exists, use it and mark it as unconfirmed
4. If no plausible match exists, flag the section as a **full gap** and note it for Step 6

**When a mapped page doesn't exist on disk:** Flag the section as a **full gap** — all its bullets are automatically Missing. Note the missing page path for Step 6.

Sections flagged as full gaps skip Step 3 (no reading required).

## Step 3 — Read pages and classify sub-features

For each section with at least one existing mapped page, read those pages. Evaluate each feature bullet:

- **Covered** — at least one dedicated paragraph, a named heading, or a step-by-step explanation. Brief but deliberate coverage counts.
- **Partial** — only a passing mention, a single sentence with no how-to, or a list item with no elaboration.
- **Missing** — no mention found anywhere in the mapped pages.

**Decision rule:** If a reader could understand *how* to use the feature from what's written → Covered. If they'd only know the feature *exists* → Partial.

Only **Missing** and **Partial** bullets produce plan entries. Covered bullets are silently skipped.

For full-gap sections (no page exists), all bullets are automatically **Missing** — skip reading.

## Step 4 — Write `.todo/coverage-gaps.md`

If `.todo/` does not exist, create it. Overwrite (never append) `.todo/coverage-gaps.md` with two blocks:

### Block 1 — Plan of action

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

Order: by section number (1 → 24). Within each section: Missing before Partial.

Each item must have:
- Section name in brackets
- An actionable title naming the exact page and feature
- One sentence describing what's needed

For full-gap sections (no page exists), produce one item:
`Create \`<path>\` — Document all N features in this section: feature A, feature B, ...`

### Block 2 — Quick-reference index

```markdown
## Quick reference

1. Create tasks.mdx
2. Timesheet score
3. Admin force-edit
...
```

Same numbers as Block 1. One line per item, no descriptions.

## Step 5 — Print to chat

Print a one-line summary, then both blocks:

> "Found N gaps (N missing, N partial) across N feature sections. Full plan saved to `.todo/coverage-gaps.md`."

Then print Block 1 (plan of action) and Block 2 (quick reference) in full.

## Step 6 — Propose page-mappings.md updates

If any mapping gaps were found during Step 2 (unmapped sections, missing pages on disk, or unconfirmed matches), propose additions and ask for confirmation before writing:

> "I found N mapping gaps in `.claude/context/page-mappings.md`. Here are the proposed additions:
>
> | Keywords | Page |
> | --- | --- |
> | `keyword, keyword` | \`help/path/to/page.mdx\` |
>
> Shall I add these rows?"

Only write to `page-mappings.md` once the user confirms. When writing:
- Follow the existing format: `| keywords, comma-separated | \`path(s)\` |`
- Check for semantic overlap with existing rows — don't duplicate
- Never remove or overwrite existing rows

## Rules

- **Read-only on doc pages.** Never modify any `help/**/*.mdx` file during this audit.
- **page-mappings.md is the mapping source.** Derive all feature→page relationships from that file — no hardcoded paths.
- **Sub-feature granularity.** Evaluate each bullet independently. Only collapse to one item when an entire section has no page.
- **Be specific.** Each plan item must name the exact file and feature, not just the section.
- **Don't invent gaps.** If a feature is reasonably covered even without matching exact wording, classify it as Covered.
- **Ordered output.** Section order 1–24 is mandatory.
- **Idempotent.** Each run overwrites `.todo/coverage-gaps.md` from scratch.
- **Propose, don't assume.** Never write to `page-mappings.md` without user confirmation.

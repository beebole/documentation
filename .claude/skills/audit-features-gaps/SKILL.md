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

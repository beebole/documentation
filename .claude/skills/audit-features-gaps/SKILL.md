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

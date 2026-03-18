# audit-features-gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a `/audit-features-gaps` slash command that compares every user-facing sub-feature in `.features/features.md` against the documentation, then outputs a numbered plan of action and quick-reference index to `.todo/coverage-gaps.md`.

**Architecture:** A single SKILL.md file under `.claude/skills/audit-features-gaps/`. The skill reads `page-mappings.md` to resolve feature sections to doc pages, reads those pages selectively, classifies each feature bullet as Covered/Partial/Missing, writes the output file, and proposes any needed mapping updates before writing them.

**Tech Stack:** Markdown/MDX, Claude Code skill system (SKILL.md + YAML frontmatter)

**Spec:** `docs/superpowers/specs/2026-03-18-audit-features-gaps-design.md`

---

### Task 1: Create the skill skeleton

**Files:**
- Create: `.claude/skills/audit-features-gaps/SKILL.md`

- [ ] **Step 1: Create the directory and SKILL.md with frontmatter and purpose section**

```bash
mkdir -p .claude/skills/audit-features-gaps
```

Create `.claude/skills/audit-features-gaps/SKILL.md` with this content:

```markdown
---
name: audit-features-gaps
description: "Check .features/features.md against the documentation and produce a numbered plan of action for every undocumented or partially documented sub-feature. Use when asked which features are missing from the docs, what needs to be written, or to get a coverage audit."
disable-model-invocation: true
---

# Audit Feature Coverage Gaps

Compare every user-facing feature bullet in `.features/features.md` against the documentation. For each feature that is missing or only partially documented, produce a numbered plan of action and a compact quick-reference index. Save results to `.todo/coverage-gaps.md` and print both blocks to chat.
```

- [ ] **Step 2: Verify the file is in place**

```bash
cat .claude/skills/audit-features-gaps/SKILL.md
```

Expected: frontmatter with `name`, `description`, `disable-model-invocation: true`, followed by the purpose paragraph.

- [ ] **Step 3: Commit the skeleton**

```bash
git add .claude/skills/audit-features-gaps/SKILL.md
git commit -m "feat: scaffold audit-features-gaps skill"
```

---

### Task 2: Write Step 1 — Parse features.md

**Files:**
- Modify: `.claude/skills/audit-features-gaps/SKILL.md`

- [ ] **Step 1: Append the Parse section to SKILL.md**

Append after the purpose paragraph:

```markdown
## Step 1 — Parse features.md

Read `.features/features.md`. Extract all bullet points from sections 1–24.

Skip entirely:
- Section 25 (Planned Features) — not yet shipped
- The "Internal (Non User-Facing)" section at the bottom — infrastructure only

For each bullet, record the parent section number (e.g. `3`) and the full bullet text.

**Format guard:** After parsing, count sections and bullets. If sections < 20 or > 26, or bullets < 100, halt and print:

> "Warning: features.md may have changed format. Found N sections and N bullets — expected 20–26 sections and 100+ bullets. Please check the file before re-running."

**Section matching rule:** Use the section number (e.g. `## 3.`) as the key. Section names are for reference only.
```

- [ ] **Step 2: Verify it reads correctly**

```bash
grep -n "Step 1" .claude/skills/audit-features-gaps/SKILL.md
```

Expected: one match with the heading.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/audit-features-gaps/SKILL.md
git commit -m "feat: add Step 1 — parse features.md"
```

---

### Task 3: Write Step 2 — Build feature→page mapping

**Files:**
- Modify: `.claude/skills/audit-features-gaps/SKILL.md`

- [ ] **Step 1: Append the mapping section**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/audit-features-gaps/SKILL.md
git commit -m "feat: add Step 2 — build feature→page mapping from page-mappings.md"
```

---

### Task 4: Write Step 3 — Read and classify

**Files:**
- Modify: `.claude/skills/audit-features-gaps/SKILL.md`

- [ ] **Step 1: Append the classification section**

```markdown
## Step 3 — Read pages and classify sub-features

For each section with at least one existing mapped page, read those pages. Evaluate each feature bullet:

- **Covered** — at least one dedicated paragraph, a named heading, or a step-by-step explanation. Brief but deliberate coverage counts.
- **Partial** — only a passing mention, a single sentence with no how-to, or a list item with no elaboration.
- **Missing** — no mention found anywhere in the mapped pages.

**Decision rule:** If a reader could understand *how* to use the feature from what's written → Covered. If they'd only know the feature *exists* → Partial.

Only **Missing** and **Partial** bullets produce plan entries. Covered bullets are silently skipped.

For full-gap sections (no page exists), all bullets are automatically **Missing** — skip reading.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/audit-features-gaps/SKILL.md
git commit -m "feat: add Step 3 — read pages and classify sub-features"
```

---

### Task 5: Write Step 4 — Write coverage-gaps.md

**Files:**
- Modify: `.claude/skills/audit-features-gaps/SKILL.md`

- [ ] **Step 1: Append the output section**

````markdown
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
````

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/audit-features-gaps/SKILL.md
git commit -m "feat: add Step 4 — write coverage-gaps.md"
```

---

### Task 6: Write Steps 5 and 6 — Print and propose mapping updates

**Files:**
- Modify: `.claude/skills/audit-features-gaps/SKILL.md`

- [ ] **Step 1: Append Steps 5 and 6**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/audit-features-gaps/SKILL.md
git commit -m "feat: add Steps 5–6 — print results and propose mapping updates"
```

---

### Task 7: Add the rules section and finalize

**Files:**
- Modify: `.claude/skills/audit-features-gaps/SKILL.md`

- [ ] **Step 1: Append the rules block**

```markdown
## Rules

- **Read-only on doc pages.** Never modify any `help/**/*.mdx` file during this audit.
- **page-mappings.md is the mapping source.** Derive all feature→page relationships from that file — no hardcoded paths.
- **Sub-feature granularity.** Evaluate each bullet independently. Only collapse to one item when an entire section has no page.
- **Be specific.** Each plan item must name the exact file and feature, not just the section.
- **Don't invent gaps.** If a feature is reasonably covered even without matching exact wording, classify it as Covered.
- **Ordered output.** Section order 1–24 is mandatory.
- **Idempotent.** Each run overwrites `.todo/coverage-gaps.md` from scratch.
- **Propose, don't assume.** Never write to `page-mappings.md` without user confirmation.
```

- [ ] **Step 2: Read the full SKILL.md to verify completeness**

```bash
cat .claude/skills/audit-features-gaps/SKILL.md
```

Confirm all 6 steps and the rules section are present and well-formed.

- [ ] **Step 3: Final commit**

```bash
git add .claude/skills/audit-features-gaps/SKILL.md
git commit -m "feat: add rules section — audit-features-gaps skill complete"
```

---

### Task 8: Validate by running the skill

**Files:**
- Read: `.todo/coverage-gaps.md` (created by the skill run)

- [ ] **Step 1: Run the skill**

In Claude Code, type:

```
/audit-features-gaps
```

- [ ] **Step 2: Verify the output file was created and spot-check it**

Read `.todo/coverage-gaps.md`. Verify:

- Header with `Generated:`, `Features audited:`, `Gaps found:` counts is present
- `## Plan of action` section exists with numbered items
- Each item has `[Section name]` brackets and a one-sentence description
- `## Quick reference` section exists with matching numbers, one line each, no descriptions
- Items follow section order 1 → 24 (no section 17 items appearing before section 5, etc.)

- [ ] **Step 6: If any issues found — fix SKILL.md and re-run**

Edit the relevant step in SKILL.md, commit the fix, and re-run `/audit-features-gaps`.

- [ ] **Step 7: Commit the generated output file**

```bash
git add .todo/coverage-gaps.md
git commit -m "chore: add initial feature coverage gaps audit"
```

# Feedback Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the feedback capture, storage, and triage system described in `docs/superpowers/specs/2026-04-23-feedback-architecture-design.md` — new context files, updated existing skills, and a new `/triage` skill.

**Architecture:** Durable feedback lives in `.claude/context/` (extends existing topical files; adds `modules/`, `page-notes.md`, `translation-notes.md`, `terminology.md`). Colleagues drop marked-up feedback into `docs/feedback/`. A new `/triage` skill proposes filings, Yves validates, approved entries land in the right context file, source files are deleted.

**Tech Stack:** Plain markdown files. Mintlify docs site. Claude Code skills (markdown with YAML frontmatter in `.claude/skills/<name>/SKILL.md`). Git for version control. Bash for verification.

---

## File Structure

Files created by this plan:

| Path | Responsibility |
|---|---|
| `.claude/context/page-notes.md` | Registry of page-specific one-off feedback rules. One H2 per page keyed by URL path. |
| `.claude/context/translation-notes.md` | FR/ES translation-specific feedback. H2 per language, H3 Terminology + Page notes. Read only by `/translate`. |
| `.claude/context/terminology.md` | Cross-cutting vocabulary rules that don't fit brand/structure/seo/components. |
| `docs/feedback/README.md` | Intake instructions for colleagues dropping marked-up feedback files. |
| `.claude/skills/triage/SKILL.md` | New skill. Reads `docs/feedback/`, proposes filings into the correct context files, applies approved entries, deletes source files. |

Files modified by this plan:

| Path | Change |
|---|---|
| `CLAUDE.md` | Writing guide table gets new rows for `terminology.md`, `modules/`, `page-notes.md`, `translation-notes.md`. |
| `.claude/context/page-mappings.md` | New "Page → module routing" section below the existing keyword table. |
| `.claude/skills/draft/SKILL.md` | Context block extended with modules/, page-notes, terminology; adds "load per-page sidecar" step. |
| `.claude/skills/review/SKILL.md` | Same as draft. |
| `.claude/skills/audit/SKILL.md` | Same for page mode; coverage mode loads all modules/. |
| `.claude/skills/sync/SKILL.md` | Context block gains modules/; rule-level sync check added. |
| `.claude/skills/translate/SKILL.md` | Context block gains translation-notes.md. Content feedback files explicitly NOT read. |

The `.claude/context/modules/` directory is created lazily by `/triage` — not pre-created by this plan.

---

## Task 1: Create `page-notes.md`

**Files:**
- Create: `.claude/context/page-notes.md`

- [ ] **Step 1: Verify file doesn't exist yet**

Run: `test -f .claude/context/page-notes.md && echo "EXISTS" || echo "ABSENT"`
Expected: `ABSENT`

- [ ] **Step 2: Create the file**

Write `.claude/context/page-notes.md`:

```markdown
# Page-specific notes

One-off feedback rules that apply to a single page only. Not site-wide, not module-wide — just corrections or reminders about a specific page.

Skills that touch a page (`/draft`, `/review`, `/audit page`) must look for a matching H2 here before acting. The H2 key is the page's URL path, starting with `/help/`.

If a rule applies across multiple pages touching the same product domain, file it in `.claude/context/modules/<entity>.md` instead. If it applies site-wide, file it in the relevant topical file (`brand.md`, `documentation-structure.md`, etc.).

## Format

One H2 per page keyed by URL path. Bullet list of rules. Create the H2 on first entry; delete it if the last bullet is removed.

```
## /help/documentation/billing
- Remove all "prorated charges" language — Beebole charges full cycle.
- "Plans" screenshot outdated as of 2026-Q1 UI (regenerate when touched).
```

## Entries

_No page-specific rules filed yet. Entries will appear here as `/triage` processes feedback._
```

- [ ] **Step 3: Verify structure**

Run: `grep -c "^# \|^## Format\|^## Entries" .claude/context/page-notes.md`
Expected: `3`

- [ ] **Step 4: Commit**

```bash
git add .claude/context/page-notes.md
git commit -m "feat: add page-notes.md for page-specific feedback rules"
```

---

## Task 2: Create `translation-notes.md`

**Files:**
- Create: `.claude/context/translation-notes.md`

- [ ] **Step 1: Verify file doesn't exist yet**

Run: `test -f .claude/context/translation-notes.md && echo "EXISTS" || echo "ABSENT"`
Expected: `ABSENT`

- [ ] **Step 2: Create the file**

Write `.claude/context/translation-notes.md`:

```markdown
# Translation notes

FR/ES-specific feedback about the translated pages. Read ONLY by the `/translate` skill. Content skills (`/draft`, `/review`, `/audit`, `/sync`) never read this file.

Two kinds of rules live here:

- **Terminology** — language-specific vocabulary choices that differ from a direct translation (e.g., "use 'chantier' not 'projet' for construction clients" in French).
- **Page notes** — one-off corrections specific to a translated page. Keyed by the English URL path, because `/translate` works from the EN master.

If a feedback note applies to the English content itself, it does NOT belong here — route it to the content feedback files (`modules/`, `page-notes.md`, or the topical files).

## French (FR)

### Terminology

_No rules filed yet._

### Page notes

_No rules filed yet._

## Spanish (ES)

### Terminology

_No rules filed yet._

### Page notes

_No rules filed yet._
```

- [ ] **Step 3: Verify structure**

Run: `grep -c "^## French\|^## Spanish\|^### Terminology\|^### Page notes" .claude/context/translation-notes.md`
Expected: `6`

- [ ] **Step 4: Commit**

```bash
git add .claude/context/translation-notes.md
git commit -m "feat: add translation-notes.md for FR/ES-specific feedback"
```

---

## Task 3: Create `terminology.md`

**Files:**
- Create: `.claude/context/terminology.md`

- [ ] **Step 1: Verify file doesn't exist yet**

Run: `test -f .claude/context/terminology.md && echo "EXISTS" || echo "ABSENT"`
Expected: `ABSENT`

- [ ] **Step 2: Create the file**

Write `.claude/context/terminology.md`:

```markdown
# Terminology rules

Cross-cutting vocabulary rules that don't fit `brand.md` (voice/tone), `documentation-structure.md` (layout), `seo-geo.md` (SEO), or `mintlify-components.md` (components).

Use this file for site-wide word-choice rules that apply to EN content regardless of the product domain. Rules specific to one product area (absences, billing, projects…) belong in `modules/<entity>.md` under its `## Terminology` section instead.

## Rules

_No terminology rules filed yet. Entries will be added as `/triage` processes feedback._
```

- [ ] **Step 3: Verify structure**

Run: `grep -c "^# Terminology\|^## Rules" .claude/context/terminology.md`
Expected: `2`

- [ ] **Step 4: Commit**

```bash
git add .claude/context/terminology.md
git commit -m "feat: add terminology.md for cross-cutting vocabulary rules"
```

---

## Task 4: Create `docs/feedback/` intake folder

**Files:**
- Create: `docs/feedback/README.md`

- [ ] **Step 1: Verify folder doesn't exist yet**

Run: `test -d docs/feedback && echo "EXISTS" || echo "ABSENT"`
Expected: `ABSENT`

- [ ] **Step 2: Create the folder with a README**

Run: `mkdir -p docs/feedback`

Write `docs/feedback/README.md`:

```markdown
# Feedback inbox

Drop your marked-up review files here. Yves runs `/triage` periodically to file the feedback into the right `.claude/context/` location.

## How to submit feedback

1. Copy the `.mdx` page you reviewed (or write prose notes — any format works).
2. Mark it up however you want: inline strikethroughs, additions, margin notes, bullet lists referencing page paths.
3. Save it in this folder. Name the file however you like — no convention required.

That's it. No tooling, no format, no ticket. Just a markdown file in a folder.

## What happens next

Yves runs `/triage`, which:

- Reads each file in this folder.
- Proposes where each note should land: a generic rule (extends `brand.md` etc.), a module rule (`.claude/context/modules/<entity>.md`), a page-specific note (`page-notes.md`), a translation note (`translation-notes.md`), or an inline page fix.
- Applies the approved proposals.
- Deletes the source feedback file once processed (git history preserves it if ever needed).

## Scope

- **English content feedback** and **FR/ES translation feedback** both go through this inbox.
- One-off fixes to a specific sentence on a page are fine — `/triage` can choose to apply them directly without filing a rule.
```

- [ ] **Step 3: Verify the folder and README exist**

Run: `ls docs/feedback/ && grep -c "^# Feedback inbox\|^## How to submit\|^## What happens next\|^## Scope" docs/feedback/README.md`
Expected: `README.md` listed, count `4`

- [ ] **Step 4: Commit**

```bash
git add docs/feedback/README.md
git commit -m "feat: add docs/feedback intake folder for review submissions"
```

---

## Task 5: Add "Page → module routing" to `page-mappings.md`

The existing `page-mappings.md` routes keywords to pages. We add a second table below it: page → module(s). This is what `/triage` consults to propose which `modules/<entity>.md` file a feedback note belongs in. The table starts empty (no modules exist yet) and grows as `/triage` creates modules.

**Files:**
- Modify: `.claude/context/page-mappings.md`

- [ ] **Step 1: Verify current end of file**

Run: `tail -3 .claude/context/page-mappings.md`
Expected: the last mapping row (`| accent, colour, color, theme, dark mode, light mode | ...`)

- [ ] **Step 2: Append the new section**

Append to `.claude/context/page-mappings.md`:

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

- [ ] **Step 3: Verify the new section**

Run: `grep -c "^# Page → Module routing\|^| Page | Module" .claude/context/page-mappings.md`
Expected: `2`

- [ ] **Step 4: Commit**

```bash
git add .claude/context/page-mappings.md
git commit -m "feat: add page → module routing section to page-mappings"
```

---

## Task 6: Update `CLAUDE.md` Writing guide table

Add four new rows pointing at the new context locations.

**Files:**
- Modify: `CLAUDE.md` lines 171-178 (the Writing guide table)

- [ ] **Step 1: Read the current table**

Run: `sed -n '171,179p' CLAUDE.md`
Expected: the 7-row Writing guide table ending with `page-mappings.md`.

- [ ] **Step 2: Replace the table with the expanded version**

Use Edit tool. Find:

```markdown
| File                         | Covers                                                                |
| ---------------------------- | --------------------------------------------------------------------- |
| `brand.md`                   | Voice, tone, writing rules                                            |
| `audiences.md`               | Target audiences by tab                                               |
| `documentation-structure.md` | Page structure template, internal link rules                          |
| `mintlify-components.md`     | Components reference (Steps, callouts, Accordion, etc.)               |
| `seo-geo.md`                 | SEO frontmatter, GEO patterns for LLM extraction                      |
| `page-mappings.md`           | Keyword → doc page routing table (used by `/audit coverage`, `/sync`) |
```

Replace with:

```markdown
| File                         | Covers                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `brand.md`                   | Voice, tone, writing rules                                                                           |
| `audiences.md`               | Target audiences by tab                                                                              |
| `documentation-structure.md` | Page structure template, internal link rules                                                         |
| `mintlify-components.md`     | Components reference (Steps, callouts, Accordion, etc.)                                              |
| `seo-geo.md`                 | SEO frontmatter, GEO patterns for LLM extraction                                                     |
| `page-mappings.md`           | Keyword → doc page routing + page → module routing (used by `/audit coverage`, `/sync`, `/triage`)   |
| `terminology.md`             | Cross-cutting vocabulary rules not covered by brand/structure/seo/components                         |
| `modules/<entity>.md`        | Product-domain rules (terminology, facts, structural) — one file per entity, created by `/triage`    |
| `page-notes.md`              | One-off corrections scoped to a single page (keyed by URL path)                                      |
| `translation-notes.md`       | FR/ES-specific translation feedback — read ONLY by `/translate`, never by content skills             |
```

- [ ] **Step 3: Verify the updated table**

Run: `grep -c "terminology.md\|modules/<entity>.md\|page-notes.md\|translation-notes.md" CLAUDE.md`
Expected: at least `4` matches in the Writing guide table.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "feat: document new feedback context files in CLAUDE.md writing guide"
```

---

## Task 7: Update `/draft` SKILL.md

Teach `/draft` to read module rules and page notes for the target page before drafting.

**Files:**
- Modify: `.claude/skills/draft/SKILL.md` (Context section at lines 10-19)

- [ ] **Step 1: Read the current Context section**

Run: `sed -n '10,20p' .claude/skills/draft/SKILL.md`
Expected: the 6-bullet Context list.

- [ ] **Step 2: Extend the Context section**

Use Edit tool. Find:

```markdown
## Context

Before starting, read these context files for editorial and structural guidelines:

- `.claude/context/brand.md` — voice, tone, and writing rules
- `.claude/context/audiences.md` — who the page is for (adjust language and depth)
- `.claude/context/documentation-structure.md` — page structure template and section ordering
- `.claude/context/mintlify-components.md` — which components to use and when
- `.claude/context/seo-geo.md` — SEO frontmatter and GEO writing patterns
- `.claude/context/product.md` — Beebole product overview and key concepts
```

Replace with:

```markdown
## Context

Before starting, read these context files for editorial and structural guidelines:

- `.claude/context/brand.md` — voice, tone, and writing rules
- `.claude/context/audiences.md` — who the page is for (adjust language and depth)
- `.claude/context/documentation-structure.md` — page structure template and section ordering
- `.claude/context/mintlify-components.md` — which components to use and when
- `.claude/context/seo-geo.md` — SEO frontmatter and GEO writing patterns
- `.claude/context/product.md` — Beebole product overview and key concepts
- `.claude/context/terminology.md` — cross-cutting vocabulary rules

**Feedback-aware loading.** After the target page path is known, also read:

- `.claude/context/modules/<entity>.md` for every module listed for this page in `page-mappings.md`'s "Page → Module routing" table. Skip silently if no row exists or the file is absent.
- The H2 section of `.claude/context/page-notes.md` matching the target URL path. Skip silently if no matching H2 exists.

Treat these as authoritative — if a module or page-note rule contradicts a general guideline, the more specific rule wins.
```

- [ ] **Step 3: Verify the updated Context section**

Run: `grep -c "terminology.md\|Feedback-aware loading\|modules/<entity>.md\|page-notes.md" .claude/skills/draft/SKILL.md`
Expected: at least `4`.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/draft/SKILL.md
git commit -m "feat(draft): load module rules and page notes for target page"
```

---

## Task 8: Update `/review` SKILL.md

Same addition as `/draft`.

**Files:**
- Modify: `.claude/skills/review/SKILL.md` (Context section at lines 10-19)

- [ ] **Step 1: Read the current Context section**

Run: `sed -n '10,20p' .claude/skills/review/SKILL.md`
Expected: the 6-bullet Context list.

- [ ] **Step 2: Extend the Context section**

Use Edit tool. Find:

```markdown
## Context

Before running checks, read these context files for the rules you'll audit against:

- `.claude/context/brand.md` — voice, tone, and writing rules
- `.claude/context/audiences.md` — audience expectations per tab
- `.claude/context/documentation-structure.md` — page structure template and section ordering
- `.claude/context/mintlify-components.md` — correct component usage
- `.claude/context/seo-geo.md` — SEO frontmatter and GEO writing patterns
- `.claude/context/product.md` — Beebole product overview and key concepts
```

Replace with:

```markdown
## Context

Before running checks, read these context files for the rules you'll audit against:

- `.claude/context/brand.md` — voice, tone, and writing rules
- `.claude/context/audiences.md` — audience expectations per tab
- `.claude/context/documentation-structure.md` — page structure template and section ordering
- `.claude/context/mintlify-components.md` — correct component usage
- `.claude/context/seo-geo.md` — SEO frontmatter and GEO writing patterns
- `.claude/context/product.md` — Beebole product overview and key concepts
- `.claude/context/terminology.md` — cross-cutting vocabulary rules

**Feedback-aware loading.** For each target page, also read:

- `.claude/context/modules/<entity>.md` for every module listed for this page in `page-mappings.md`'s "Page → Module routing" table. Skip silently if no row exists or the file is absent.
- The H2 section of `.claude/context/page-notes.md` matching the target URL path. Skip silently if no matching H2 exists.

Feedback rules ARE the review checklist — every module/page-note rule becomes an additional check. A violation of a filed rule is a critical issue, not a warning.
```

- [ ] **Step 3: Verify**

Run: `grep -c "terminology.md\|Feedback-aware loading\|modules/<entity>.md\|page-notes.md" .claude/skills/review/SKILL.md`
Expected: at least `4`.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/review/SKILL.md
git commit -m "feat(review): load feedback rules as additional review checks"
```

---

## Task 9: Update `/audit` SKILL.md

Page mode loads per-page feedback; coverage mode loads all module files.

**Files:**
- Modify: `.claude/skills/audit/SKILL.md` (Context section near line 19-27)

- [ ] **Step 1: Read the current Context section**

Run: `sed -n '19,30p' .claude/skills/audit/SKILL.md`
Expected: the 4-bullet Context list.

- [ ] **Step 2: Extend the Context section**

Use Edit tool. Find:

```markdown
## Context

Before any audit, read the relevant context files:

- `.claude/context/product.md` — Beebole product overview and key concepts
- `.claude/context/page-mappings.md` — keyword-to-page mapping table
- `.claude/context/seo-geo.md` — SEO frontmatter and GEO writing patterns (for `seo` mode)
- `.claude/context/brand.md` — entity attribution rules (for `seo` mode)
```

Replace with:

```markdown
## Context

Before any audit, read the relevant context files:

- `.claude/context/product.md` — Beebole product overview and key concepts
- `.claude/context/page-mappings.md` — keyword-to-page mapping table + page-to-module routing
- `.claude/context/seo-geo.md` — SEO frontmatter and GEO writing patterns (for `seo` mode)
- `.claude/context/brand.md` — entity attribution rules (for `seo` mode)
- `.claude/context/terminology.md` — cross-cutting vocabulary rules

**Feedback-aware loading.**

- **`page` mode:** For each target page, also read its `.claude/context/modules/<entity>.md` files (from "Page → Module routing") and the matching `.claude/context/page-notes.md` H2. Audit the page against those rules in addition to the standard checks.
- **`coverage` mode:** Read ALL files in `.claude/context/modules/` to know which entity areas have accumulated rules. Flag coverage gaps against both the feature catalog and the module rule set.
- **`seo` mode:** No feedback loading. SEO/GEO rules live in `seo-geo.md`.
```

- [ ] **Step 3: Verify**

Run: `grep -c "terminology.md\|Feedback-aware loading\|modules/<entity>.md" .claude/skills/audit/SKILL.md`
Expected: at least `3`.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/audit/SKILL.md
git commit -m "feat(audit): load module rules for page and coverage modes"
```

---

## Task 10: Update `/sync` SKILL.md

Sync already uses `page-mappings.md`. Extend it to also consult module files so app changes touching a domain with accumulated rules are flagged for a rule-level review.

**Files:**
- Modify: `.claude/skills/sync/SKILL.md` (Context section near line 11-18)

- [ ] **Step 1: Read the current Context section**

Run: `sed -n '11,20p' .claude/skills/sync/SKILL.md`
Expected: the 3-bullet Context list.

- [ ] **Step 2: Extend the Context section**

Use Edit tool. Find:

```markdown
## Context

Before running, read these context files:

- `.claude/context/page-mappings.md` — keyword-to-page mapping table
- `.claude/context/product.md` — Beebole product overview and key concepts
- `.claude/context/brand.md` — voice, tone, and entity attribution rules (for news mode)
```

Replace with:

```markdown
## Context

Before running, read these context files:

- `.claude/context/page-mappings.md` — keyword-to-page mapping table + page-to-module routing
- `.claude/context/product.md` — Beebole product overview and key concepts
- `.claude/context/brand.md` — voice, tone, and entity attribution rules (for news mode)

**Feedback-aware loading.** Read all files in `.claude/context/modules/`. When an app change touches a module with accumulated rules, flag it in the sync report as "rule-level review recommended" — the change may invalidate or require updating existing module rules, not just the pages themselves.
```

- [ ] **Step 3: Verify**

Run: `grep -c "page-to-module routing\|Feedback-aware loading\|modules/" .claude/skills/sync/SKILL.md`
Expected: at least `3`.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/sync/SKILL.md
git commit -m "feat(sync): flag app changes in modules with accumulated rules"
```

---

## Task 11: Update `/translate` SKILL.md

Translate reads `translation-notes.md` and explicitly does NOT read content feedback files.

**Files:**
- Modify: `.claude/skills/translate/SKILL.md` (Context section at lines 10-15)

- [ ] **Step 1: Read the current Context section**

Run: `sed -n '10,16p' .claude/skills/translate/SKILL.md`
Expected: the 2-bullet Context list.

- [ ] **Step 2: Extend the Context section**

Use Edit tool. Find:

```markdown
## Context

Before translating, read these context files:

- `.claude/context/brand.md` — voice, tone, and writing rules (apply in target language)
- `.claude/context/documentation-structure.md` — page structure to preserve during translation
```

Replace with:

```markdown
## Context

Before translating, read these context files:

- `.claude/context/brand.md` — voice, tone, and writing rules (apply in target language)
- `.claude/context/documentation-structure.md` — page structure to preserve during translation
- `.claude/context/translation-notes.md` — FR/ES-specific terminology and page notes

**Do NOT read** `modules/*.md`, `page-notes.md`, or `terminology.md`. Those are English content-authoring rules; applying them during translation would bleed content feedback into the translation pipeline. Translation feedback lives exclusively in `translation-notes.md`.

When translating a page, consult the target language's section of `translation-notes.md` for:
- Terminology overrides specific to that language
- Page-specific notes under the matching EN URL path H4
```

- [ ] **Step 3: Verify**

Run: `grep -c "translation-notes.md\|Do NOT read" .claude/skills/translate/SKILL.md`
Expected: at least `2`.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/translate/SKILL.md
git commit -m "feat(translate): load translation-notes.md for FR/ES-specific rules"
```

---

## Task 12: Create the `/triage` skill

The heart of the workflow. Reads `docs/feedback/`, proposes filings, applies approved entries, deletes source files.

**Files:**
- Create: `.claude/skills/triage/SKILL.md`

- [ ] **Step 1: Verify the skill doesn't exist yet**

Run: `test -f .claude/skills/triage/SKILL.md && echo "EXISTS" || echo "ABSENT"`
Expected: `ABSENT`

- [ ] **Step 2: Create the directory and SKILL.md**

Run: `mkdir -p .claude/skills/triage`

Write `.claude/skills/triage/SKILL.md`:

````markdown
---
name: triage
description: 'Process marked-up review files in docs/feedback/ and file each note into the correct context location (generic topical file, module file, page-notes.md, translation-notes.md, or inline page fix). Use when asked to triage feedback, process the feedback inbox, or file review notes.'
disable-model-invocation: true
---

# Triage — Process the Feedback Inbox

Read marked-up feedback files from `docs/feedback/`, propose how each distinct note should be filed, apply the filings Yves approves, and delete the source files when done.

## Context

Before running, read these files so proposals land in the right place:

- `.claude/context/brand.md` — generic voice/tone rules
- `.claude/context/documentation-structure.md` — generic structure rules
- `.claude/context/seo-geo.md` — generic SEO/GEO rules
- `.claude/context/mintlify-components.md` — generic component-usage rules
- `.claude/context/terminology.md` — cross-cutting vocabulary rules
- `.claude/context/page-notes.md` — existing page-specific notes
- `.claude/context/page-mappings.md` — keyword routing + Page → Module routing
- `.claude/context/translation-notes.md` — existing FR/ES-specific notes
- All files in `.claude/context/modules/` — existing module rules

## Inputs

No arguments. The queue is whatever is in `docs/feedback/` (excluding `README.md`).

## Workflow

### 1. List the queue

Show Yves the files currently in `docs/feedback/`:

```bash
ls docs/feedback/ | grep -v '^README.md$'
```

Present the count and filenames. If the folder is empty, report "Inbox is empty — nothing to triage" and stop.

### 2. Process each file

For each file in the queue (any order — no date convention):

#### 2a. Read and parse

- Read the file in full.
- Identify which page(s) it references. Heuristics:
  - Explicit URL path like `/help/documentation/billing`.
  - A bolded page title that matches a page.
  - A file reference like `help/documentation/billing.mdx`.
  - For marked-up copies of `.mdx` files, infer from frontmatter `title` or the file's implicit source.
- Split the file content into **distinct notes**. A note is one discrete piece of feedback — a single correction, rule, or observation. Prose paragraphs may contain several notes; a bulleted list usually one per bullet.

#### 2b. For each distinct note, propose ONE filing

Choose among these five options. Reasoning is required; state which option and why.

1. **Extend a generic file** — the rule applies site-wide and fits an existing topical file:
   - Voice/tone → `brand.md`
   - Page structure → `documentation-structure.md`
   - SEO/GEO → `seo-geo.md`
   - Mintlify components → `mintlify-components.md`
   - Cross-cutting vocabulary with no better home → `terminology.md`

2. **Add to a module file** — the rule applies whenever any page touches a product domain. File under `.claude/context/modules/<entity>.md` in one of three H2 sections:
   - `## Terminology` — vocabulary rules specific to this domain
   - `## Facts` — factual/behavioral rules (e.g., "Beebole doesn't prorate")
   - `## Structural` — cross-page structural requirements (e.g., "always link to X")

   To pick the `<entity>`: first look at `page-mappings.md`'s "Page → Module routing" table for the referenced page. If a module is listed, use it. If multiple, pick the most specific. If no row exists, propose a new entity name (kebab-case, mirroring `../reboot/shared/i18n/en/labels.json` top-level keys) and flag it for Yves's confirmation. **Also add a row to `page-mappings.md` when a new module is introduced.**

3. **Add to `page-notes.md`** — the rule applies only to this one page. Add a bullet under the H2 matching the page's URL path. Create the H2 if it doesn't exist.

4. **Add to `translation-notes.md`** — the note is explicitly about an FR or ES translation (language named, translated text quoted, or the marked-up file is from `help/fr/` or `help/es/`). Route to the right language H2 and the right H3 section (Terminology or Page notes). Page notes use an H4 keyed by the EN URL path.

5. **Inline fix** — the note is simply wrong content on the page; no rule generalizes. Edit the page directly.

#### 2c. Present the proposal as a diff

For each note, show:
- The note itself (verbatim excerpt from the feedback file).
- The proposed filing (option + target file + exact insertion point).
- A unified diff of the change.

Example:

```
Note 2 of 4 from feedback-billing-alice.md:
> "The prorated charges paragraph is wrong — Beebole charges the full cycle."

Proposal: Option 2 (module file) → .claude/context/modules/billing.md → ## Facts

Diff:
--- a/.claude/context/modules/billing.md    (new file)
+++ b/.claude/context/modules/billing.md
@@ -0,0 +1,5 @@
+# Billing — module rules
+
+## Facts
+- Beebole charges the full plan cycle; does not prorate mid-month.

(Also adding to page-mappings.md Page → Module routing:)
+| `/help/documentation/billing` | billing |

Approve / edit / skip?
```

#### 2d. Get approval per note

Yves answers `approve`, `edit`, or `skip` per note.

- **approve** — apply the diff as shown.
- **edit** — Yves provides corrections; apply the corrected version.
- **skip** — don't file this note. Track it as skipped so the source file is still eligible for deletion.

#### 2e. Apply approved changes

- Create `.claude/context/modules/` directory if it doesn't exist and a module filing is approved.
- Create module files lazily (first rule in that module creates the file, using the Module file template below).
- Create H2 sections in `page-notes.md` when a new page is first mentioned.
- Create H4 subsections in `translation-notes.md` as needed.

#### 2f. Delete the source file and commit

When every note in the file has been resolved (filed or skipped):

```bash
rm docs/feedback/<filename>
git add .claude/context/ .claude/skills/ docs/feedback/ CLAUDE.md
git commit -m "feedback(<topic>): N filed rules, M inline fixes"
```

`<topic>` is a short slug describing what the feedback was about (e.g., `billing`, `absences`, `multi`). One commit per source feedback file.

### 3. Final report

After all files are processed:

```
## Triage complete

**Files processed:** N
**Rules filed:**
- Generic: X (brand: a, documentation-structure: b, seo-geo: c, mintlify-components: d, terminology: e)
- Module: Y (across Z module files)
- Page notes: V
- Translation notes: W
**Inline fixes:** M
**Skipped notes:** S

**Inbox after triage:** [file list — should be empty or only contain README.md]
```

## Module file template

When creating a new module file for the first time, use:

```markdown
# <Entity> — module rules

## Terminology

## Facts

## Structural
```

Omit any section that has no entries initially — the triage proposal will create the section it's filing into.

## Rules

- **Never delete a source feedback file** until every note in it has been resolved (approved or explicitly skipped).
- **One commit per source feedback file** — don't batch multiple files into one commit.
- **Never auto-approve.** Every filing requires Yves's explicit response.
- **Translation-only routing.** If a note is clearly about an FR/ES translation, route to `translation-notes.md` and nowhere else. Do not also file it as a content rule.
- **Module name consistency.** Reuse existing module names when the entity already has a file. Propose a new name only if no existing module fits.
- **Page-mappings updates.** When a new module is introduced, also add a row to `page-mappings.md`'s "Page → Module routing" table so content skills can find it.
- **README.md is not feedback.** Skip `docs/feedback/README.md` in the queue listing.
````

- [ ] **Step 3: Verify the skill file**

Run: `grep -c "^## Context\|^## Workflow\|^## Rules\|disable-model-invocation: true" .claude/skills/triage/SKILL.md`
Expected: at least `4`.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/triage/SKILL.md
git commit -m "feat(triage): add skill to process docs/feedback inbox"
```

---

## Task 13: Smoke test and final verification

Verify the whole system is coherent end-to-end.

- [ ] **Step 1: Verify all new files exist**

Run:

```bash
ls .claude/context/page-notes.md \
   .claude/context/translation-notes.md \
   .claude/context/terminology.md \
   .claude/skills/triage/SKILL.md \
   docs/feedback/README.md \
  && echo "ALL_PRESENT"
```

Expected: all paths listed, final line `ALL_PRESENT`.

- [ ] **Step 2: Verify all modified files still parse**

Run:

```bash
for f in CLAUDE.md \
         .claude/context/page-mappings.md \
         .claude/skills/draft/SKILL.md \
         .claude/skills/review/SKILL.md \
         .claude/skills/audit/SKILL.md \
         .claude/skills/sync/SKILL.md \
         .claude/skills/translate/SKILL.md; do
  head -5 "$f" >/dev/null && echo "OK: $f" || echo "FAIL: $f"
done
```

Expected: `OK:` line for each file.

- [ ] **Step 3: Verify skill frontmatter is valid on /triage**

Run:

```bash
head -5 .claude/skills/triage/SKILL.md
```

Expected: starts with `---`, contains `name: triage`, contains `disable-model-invocation: true`, ends the block with `---`.

- [ ] **Step 4: Confirm Mintlify build is unaffected**

Run (if `mintlify` is installed; skip otherwise):

```bash
command -v mintlify && mintlify broken-links || echo "SKIP: mintlify not installed"
```

Expected: either a broken-links report unchanged from before this plan, or `SKIP`. The `docs/` directory is outside Mintlify's indexed tree (`help/` + `snippets/`) so no new broken-link entries should appear from our additions.

- [ ] **Step 5: Verify docs/feedback/ is a valid empty inbox**

Run: `ls docs/feedback/`
Expected: only `README.md`.

- [ ] **Step 6: Final commit (only if any fixups were needed)**

If all prior steps passed, there's nothing to commit. If step 2 or step 4 found a parse error, fix it and commit:

```bash
git add <fixed-file>
git commit -m "fix: <specific issue>"
```

- [ ] **Step 7: Summary to user**

Report:

```
Feedback architecture implementation complete.

New files:
  .claude/context/page-notes.md
  .claude/context/translation-notes.md
  .claude/context/terminology.md
  .claude/skills/triage/SKILL.md
  docs/feedback/README.md

Modified files:
  CLAUDE.md
  .claude/context/page-mappings.md
  .claude/skills/draft/SKILL.md
  .claude/skills/review/SKILL.md
  .claude/skills/audit/SKILL.md
  .claude/skills/sync/SKILL.md
  .claude/skills/translate/SKILL.md

Next steps for you:
  1. Share docs/feedback/ location with your two colleagues.
  2. When the first feedback file arrives, run /triage to exercise the flow end-to-end.
  3. The first /triage run will also create the first .claude/context/modules/<entity>.md file(s) and populate the Page → Module routing table in page-mappings.md.
```

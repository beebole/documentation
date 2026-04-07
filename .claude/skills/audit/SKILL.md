---
name: audit
description: 'Unified documentation audit with three modes: `/audit page <path>` cross-checks a page against source code, `/audit coverage` finds undocumented features, `/audit seo` runs SEO & GEO checks. Use when asked to audit docs, check accuracy, find gaps, check SEO, or verify documentation against the app.'
disable-model-invocation: true
---

# Audit — Unified Documentation Auditing

Three audit modes in one skill. All modes are read-only — no files are modified until the user approves.

## Modes

- **`/audit page <path>`** — Cross-check one or more doc pages against the app source code
- **`/audit coverage`** — Find undocumented or partially documented features
- **`/audit seo`** — SEO & GEO compliance audit across all pages

If no mode is specified, ask the user which audit to run.

## Context

Before any audit, read the relevant context files:

- `.claude/context/product.md` — Beebole product overview and key concepts
- `.claude/context/page-mappings.md` — keyword-to-page mapping table
- `.claude/context/seo-geo.md` — SEO frontmatter and GEO writing patterns (for `seo` mode)
- `.claude/context/brand.md` — entity attribution rules (for `seo` mode)

---

## Mode: `/audit page <path>`

Cross-reference a documentation page against the Beebole application source code. Identifies inaccuracies, missing features, outdated content, and undocumented behavior.

### Inputs

One or more page paths (e.g., `help/documentation/projects.mdx`). If none given, ask.

### Workflow

#### 1. Read the documentation page

Read the full `.mdx` file. Identify:

- Which feature is documented
- Key claims: behavior, options/settings, permissions, defaults, limits, workflows
- UI labels referenced (bolded text)

#### 2. Locate relevant source code

Use the sibling repo at `../reboot` (see CLAUDE.md "App repository access"):

- **Frontend components** — `../reboot/frontend/src/components/`
- **Backend entities** — `../reboot/backend/src/application/entities/`
- **i18n labels** — `../reboot/shared/i18n/en/labels.json`
- **GraphQL schema** — Type definitions, queries, mutations in backend entities
- **Type definitions** — `../reboot/frontend/src/models/types.ts`
- **Design documents** — `../reboot/docs/`

Use Grep to search for relevant keywords. Use Read to inspect specific files.

**Fallback:** If `../reboot` is not available, use `gh api repos/beebole/reboot/contents/{path} --jq '.content' | base64 -d`

#### 3. Cross-reference documentation vs code

For each documented claim, verify:

- **UI labels** — Compare every bolded label against `../reboot/shared/i18n/en/labels.json`
- **Feature behavior** — Compare documented workflows with actual code logic
- **Settings & options** — List all configurable options in code, compare against docs
- **Permissions & roles** — Check permission guards against documented permissions
- **Defaults & limits** — Check model/form defaults and validation rules
- **Undocumented features** — Functionality in code not mentioned in docs
- **Deprecated content** — Things documented but no longer in code

#### 4. Compile report

```
## Code Audit Report

**Page:** [path]
**Date:** [today]
**Feature area:** [identified feature]
**Source files examined:** [list]

### Overview
| Check | Status |
|-------|--------|
| UI labels | Match / X mismatches |
| Feature behavior | Accurate / X issues |
| Settings & options | Complete / X undocumented |
| Permissions & roles | Accurate / X issues |
| Defaults & limits | Accurate / X issues |
| Undocumented features | None / X found |
| Deprecated content | None / X items |

### Issues found

#### Critical (documentation is wrong)
- [specific issue with code evidence]

#### Missing (exists in code, not in docs)
- [undocumented features/settings]

#### Stale (in docs, not in code)
- [removed features, renamed labels]

#### Minor (cosmetic)
- [label casing, minor wording]

### Recommended actions
[specific text changes with file paths and line references]
```

Ask: "Would you like me to fix these issues? I can apply all fixes, or you can pick specific ones."

---

## Mode: `/audit coverage`

Compare every user-facing feature in `.features/features.md` against documentation pages. Produces a numbered plan of action for undocumented or partially documented features.

### Workflow

#### 1. Parse features.md

Read `.features/features.md`. Extract all bullet points from sections 1–24.

Skip:

- Section 25 (Planned Features) — not yet shipped
- Internal (Non User-Facing) section

**Format guard:** If sections < 20 or > 26, or bullets < 100, halt and warn about format changes.

#### 2. Build feature→page mapping

Read `.claude/context/page-mappings.md`. For each feature section, semantically match against the keyword column.

When no match is found:

1. Glob all files under `help/documentation/`, `help/guides/`, `help/integrations/`, `help/api/`
2. Reason about plausible matches
3. If none, flag as a **full gap**

When a mapped page doesn't exist on disk: flag as **full gap** (all bullets automatically Missing).

#### 3. Read pages and classify features

For each section with existing mapped pages, read those pages. Classify each bullet:

- **Covered** — dedicated paragraph, named heading, or step-by-step. Reader could understand _how_ to use it.
- **Partial** — passing mention, single sentence, no how-to. Reader only knows it _exists_.
- **Missing** — no mention anywhere.

Only Missing and Partial produce plan entries.

#### 4. Write `.todo/coverage-gaps.md`

Overwrite with two blocks:

**Block 1 — Plan of action:**

```markdown
# Feature Coverage Gaps

Generated: YYYY-MM-DD
Features audited: N bullets
Gaps found: N (N missing, N partial)

---

## Plan of action

1. **[Section name] Action title** — What to write or add.
2. ...
```

Order by section number (1→24). Missing before Partial within each section.

For full-gap sections: `Create \`<path>\` — Document all N features: feature A, feature B, ...`

**Block 2 — Quick reference:**

```markdown
## Quick reference

1. Action title only
2. ...
```

#### 5. Print to chat

> "Found N gaps (N missing, N partial) across N sections. Full plan saved to `.todo/coverage-gaps.md`."

Then print both blocks.

#### 6. Propose page-mappings.md updates

If unmapped sections were found, propose additions and ask for confirmation before writing.

---

## Mode: `/audit seo`

Comprehensive SEO and GEO audit across all documentation pages.

### Scope

All `.mdx` content pages across `help/documentation/`, `help/guides/`, `help/integrations/`, `help/api/`, `help/news/`, `help/index.mdx`, and FR/ES equivalents.

### Checklist

#### 1. Frontmatter — SEO metadata

- `title` exists, 50-60 chars, includes feature name
- `description` exists, 120-160 chars, reads as a search snippet
- `keywords` array with 3-8 terms including "beebole"
- FR/ES have translated metadata (not English copies)

#### 2. Page structure — GEO compliance

- Introduction paragraph (2-4 sentences, definition-style, mentions "Beebole")
- Sections lead with direct answers (LLM-extractable)
- Paragraphs are self-contained

#### 3. FAQ section

- Exists (API pages exempt)
- Uses `<AccordionGroup>` with `<Accordion>`, 3-5 Q&A pairs
- Questions natural language, answers self-contained mentioning "Beebole"
- Exists in all three languages

#### 4. Headings

- Clear, descriptive with search terms
- Logical hierarchy (no skipped levels)

#### 5. Images and alt text

- Descriptive alt text with keywords (not empty, not "screenshot")
- WebP format, under 200 KB

#### 6. Internal linking

- Links to related pages with descriptive text (not "click here")
- All links start with `/help/`

#### 7. Content quality

- Active voice, UI labels bolded, no placeholders/TODOs

### Report

```
## SEO & GEO Audit Report

### Summary
- Total pages audited: X (EN: X, FR: X, ES: X)
- Pages passing all checks: X | Pages with issues: X
- Critical issues: X | Warnings: X

### Critical issues (must fix)
[Missing metadata, missing FAQs, empty alt text, English metadata in FR/ES]

### Warnings (should fix)
[Length issues, few FAQ items, missing "Beebole", generic headings]

### Page-by-page breakdown
| Page | Title | Desc | Keywords | FAQ | Alt text | Intro | Score |
|------|-------|------|----------|-----|----------|-------|-------|

### Recommended actions
[Numbered list of specific fixes]
```

Use parallel agents to process pages in batches of 5-10.

---

## Rules (all modes)

- **Read-only by default.** Never modify files until the user approves.
- **Be specific.** Quote exact text that's wrong and the evidence.
- **Don't invent issues.** Only flag things where code/conventions clearly show a problem.
- **Prioritize user-facing impact.** Wrong UI label = critical. Undocumented internal setting = minor.
- **Don't expose internal code details.** Recommendations use user-facing language (except API pages).
- **Graceful degradation.** If `../reboot` is missing, fall back to `gh api`. Report skipped checks.

---
name: review
description: 'Comprehensive pre-publish audit — spelling, style, structure, SEO, GEO, images, FAQ, translations, code accuracy, undocumented features, deprecated content. Default scope is the git session (working tree + staged). Use `/review <path>` for specific pages or `/review --all` for the full site. Absorbs what used to be /audit page and /audit seo.'
---

# Review — Comprehensive Documentation Audit

Run every pre-publish check against a documentation page or set of pages. One audit engine, three scopes. Read-only by default — changes applied only after user approval.

## Context

Before running checks, read:

- `.claude/context/brand.md` — voice, tone, writing rules
- `.claude/context/audiences.md` — audience expectations per tab
- `.claude/context/documentation-structure.md` — page structure template
- `.claude/context/mintlify-components.md` — correct component usage
- `.claude/context/seo-geo.md` — SEO frontmatter + GEO writing patterns
- `.claude/context/product.md` — Beebole product overview
- `.claude/context/terminology.md` — cross-cutting vocabulary rules
- `.claude/context/page-mappings.md` — for Page → Module routing resolution

**Feedback-aware loading.** For each target page, also read:

- `.claude/context/modules/<entity>.md` for every module listed for this page in `page-mappings.md`. Skip silently if no row or file.
- The H2 section of `.claude/context/page-notes.md` matching the target URL path. Skip silently if no matching H2.

Feedback rules ARE the review checklist — every module/page-note rule becomes an additional check. A violation of a filed rule is a critical issue, not a warning.

## Scopes

- **Default (no args) — session scope:** audit every `.mdx` under `help/` with uncommitted modifications OR new files in git working tree + staged changes. Typical use: run after `/write` to audit what was just produced.
- **Explicit paths:** `/review <path> [paths…]` — audit specific pages.
- **Full site:** `/review --all` — every `.mdx` under `help/`. Expensive; runs via parallel subagents in batches of 5-10.

## Workflow

### 1. Resolve target pages

For each scope:

- **Session:** `git diff --name-only HEAD && git diff --cached --name-only && git ls-files --others --exclude-standard -- help/` and filter to `.mdx` files under `help/`.
- **Explicit:** use the provided path(s).
- **`--all`:** `find help -name '*.mdx'`.

For each target page, also resolve:
- FR translation at `help/fr/<same-path>`
- ES translation at `help/es/<same-path>`

### 2. Run all checks per page

Read the full `.mdx` file and run every check.

#### 2.1 Spelling and grammar

- Scan for typos, spelling errors, grammatical mistakes
- Flag awkward phrasing or overly complex sentences
- Check Mintlify component syntax (unclosed tags, wrong component names)

#### 2.2 Style and writing rules

- Active voice throughout
- Second person ("you") — not "the user"
- UI labels bolded, matching exact text in `../reboot/shared/i18n/en/labels.json`
- Present tense (not future)
- One idea per sentence
- No jargon in user-facing docs (API section exempt)
- No placeholder text, TODOs, or draft notes
- Callouts (`<Tip>`, `<Warning>`, `<Info>`, `<Note>`) placed near relevant content, not grouped
- Steps use `<Steps>`/`<Step>` with one action per step, starting with a verb
- Internal repo vocabulary (`modules/`, `entity`) never appears in user-facing content

#### 2.3 Page structure

- Frontmatter has `title`, `description`, `keywords`
- Introduction paragraph exists (2-4 sentences, definition-style, mentions "Beebole")
- Logical heading hierarchy (no skipped levels)
- Section flow: intro → core tasks → configuration → advanced → troubleshooting → FAQ → related links

#### 2.4 SEO metadata (from former `/audit seo`)

- `title` exists, 50-60 chars, includes feature name
- `description` exists, 120-160 chars, reads as search snippet
- `keywords` array with 3-8 terms including "beebole"
- FR/ES have translated metadata (not English copies)

#### 2.5 GEO compliance

- Intro is definition-style and mentions "Beebole"
- Sections lead with direct answers (LLM-extractable)
- Paragraphs are self-contained
- Headings are clear and descriptive with search terms

#### 2.6 FAQ section

- Exists (API pages exempt)
- Uses `<AccordionGroup>` with `<Accordion>`, 3-5 Q&A pairs
- Questions natural language, answers self-contained mentioning "Beebole"
- Exists in FR/ES too

**If FAQ is missing:** generate it inline as part of the review. 3-5 Q&A pairs based on the page content:
- Questions as real users would ask ("Can I…", "How do I…", "What happens when…")
- Each answer self-contained, 1-3 sentences, links to other pages for details
- Cover permissions, limits, edge cases, common confusion
- Do not invent features
- Use the same UI labels and bold formatting
- Include the generated FAQ in the report as a proposed addition

#### 2.7 Images and alt text

- All referenced images exist in `help/images/`
- WebP format, under 200 KB
- Kebab-case naming with feature context
- Descriptive alt text with keywords (not empty, not "screenshot")

If unoptimized images found, run: `bash .claude/scripts/optimize-images.sh`

#### 2.8 Internal linking

- Links use descriptive anchor text (not "click here")
- All links start with `/help/`

#### 2.9 Translation status

- FR and ES versions exist
- Frontmatter translated (not English copies)
- Content translated (not stale English text)
- Check staleness via `bash .claude/scripts/translate.sh` if in session or explicit-path scope

#### 2.10 Code accuracy

Use the sibling repo at `../reboot`:

- **UI labels** — every bolded label matches `../reboot/shared/i18n/en/labels.json`
- **Feature behavior** — documented workflows match actual code logic
- **Settings & options** — configurable options in code match docs
- **Permissions & roles** — checked against access control logic
- **Defaults & limits** — match model/form defaults and validation rules

**Fallback:** if `../reboot` unavailable, `gh api repos/beebole/reboot/contents/{path} --jq '.content' | base64 -d`. If unavailable, skip this section and note "Code accuracy: Skipped (../reboot not found)".

#### 2.11 Undocumented features (from former `/audit page`)

Features discoverable in code (components, entities, permissions) but not mentioned in the page. Flag as: "Missing from doc — consider adding."

#### 2.12 Deprecated content (from former `/audit page`)

Things documented but no longer in code (removed features, renamed labels). Flag as: "Stale — in docs, not in code. Consider removing or updating."

### 3. Compile the report

**Do NOT make any changes.** Present findings:

```
## Review Report

**Scope:** [session|paths|--all]
**Pages audited:** N
**Date:** YYYY-MM-DD

### Summary
| Check | Issues |
|---|---|
| Spelling & grammar | X |
| Style & writing rules | X |
| Page structure | X |
| SEO metadata | X |
| GEO compliance | X |
| FAQ | Present / Generated / Missing-API-exempt |
| Images | X |
| Internal linking | X |
| Translations (FR) | Up-to-date / Stale / Missing |
| Translations (ES) | Up-to-date / Stale / Missing |
| Code accuracy | X / Skipped |
| Undocumented features | X |
| Deprecated content | X |
| Feedback-file rules | X violations (critical) |

### Critical (must fix before publishing)
[Numbered list with specific details]

### Warnings (should fix)
[Numbered list]

### Suggestions (nice to have)
[Numbered list]

### Generated FAQ (if missing)
[Full markup]

### Recommended actions
[Specific text corrections, tool invocations like `/illustrate`, `/translate`, etc.]
```

### 4. Ask before acting

After the report, ask:

> "Would you like me to fix these issues? I can apply all fixes, or you can pick specific ones."

Only proceed after confirmation. When applying fixes:

- FAQ → insert at bottom (before "Related links" if present)
- Image optimization → run `bash .claude/scripts/optimize-images.sh`
- Translation issues → delegate to `/translate`
- Screenshots → delegate to `/illustrate`
- Spelling/grammar/style/SEO/GEO/structure/label mismatches → apply edits directly
- Undocumented/deprecated → propose content edits

## Rules

- **Read-only by default.** No file modifications until user approves.
- **Be specific.** "Line 42: 'will display' → 'displays' (present tense)" not "fix tenses."
- **Don't invent problems.** Only flag genuine issues.
- **Prioritize clearly.** Critical blocks publishing; warnings improve quality; suggestions are optional.
- **Feedback-file rule violations are CRITICAL.** If a module or page-note rule is broken, it's not a warning.
- **Generate FAQs inline.** Include in the report as a proposed addition.
- **Graceful degradation.** If `../reboot` is missing, skip code accuracy + undocumented + deprecated. Note in report what was skipped.
- **`--all` batching.** Process pages in batches of 5-10 using parallel subagents. Each subagent gets the full check list.

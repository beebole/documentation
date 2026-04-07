---
name: review
description: 'Run a comprehensive pre-publish audit on a documentation page — checks spelling, grammar, style, SEO, GEO, images, FAQ (generates if missing), translations, and code accuracy. Use before publishing any page, when asked to review, audit, or check a page, or when preparing documentation for release.'
---

# Review Page — Full Page Audit

Run a comprehensive audit on a documentation page before publishing. Checks spelling, grammar, style, SEO, GEO, images, FAQ, and translation status — then presents a report for approval before making any changes. If a FAQ section is missing, generates one inline.

## Context

Before running checks, read these context files for the rules you'll audit against:

- `.claude/context/brand.md` — voice, tone, and writing rules
- `.claude/context/audiences.md` — audience expectations per tab
- `.claude/context/documentation-structure.md` — page structure template and section ordering
- `.claude/context/mintlify-components.md` — correct component usage
- `.claude/context/seo-geo.md` — SEO frontmatter and GEO writing patterns
- `.claude/context/product.md` — Beebole product overview and key concepts

## Inputs

The user provides:

- **One or more page paths** (e.g., `help/integrations/jira.mdx`)
- If no path is given, ask which page(s) to review

## Workflow

### 1. Read the page(s)

For each target page, read the full `.mdx` file. Also read the corresponding FR (`help/fr/...`) and ES (`help/es/...`) versions if they exist.

### 2. Run all checks

Perform every check below on the English page.

#### 2.1 Spelling and grammar

- Scan for spelling errors, typos, and grammatical mistakes
- Flag awkward phrasing or overly complex sentences
- Check for broken Mintlify component syntax (unclosed tags, wrong component names)

#### 2.2 Style and writing rules (from CLAUDE.md)

- Active voice used throughout
- Second person ("you") — not "the user" or passive constructions
- UI labels are **bolded** and match the app's exact wording (read from `../reboot/shared/i18n/en/labels.json`)
- Present tense (not future: "displays" not "will display")
- One idea per sentence
- No jargon in user-facing docs (API section exempt)
- No placeholder text, TODOs, or draft notes
- Callouts (`<Tip>`, `<Warning>`, `<Info>`, `<Note>`) placed near relevant content, not grouped
- Steps use `<Steps>` / `<Step>` components with one action per step, starting with a verb

#### 2.3 Page structure (from CLAUDE.md)

- Frontmatter has `title`, `description`, `keywords`
- Introduction paragraph exists (2-4 sentences, definition-style opening mentioning "Beebole")
- Logical heading hierarchy (no skipped levels)
- Sections follow the recommended flow: intro → core tasks → configuration → advanced → troubleshooting → FAQ → related links

#### 2.4 SEO and GEO compliance

Scoped SEO/GEO checks for this page. Refer to `.claude/context/seo-geo.md` for the full checklist. Key checks:

- Frontmatter `title` (50-60 chars), `description` (120-160 chars), `keywords` (3-8 terms including "beebole")
- Images have descriptive alt text with relevant keywords
- Internal links use descriptive anchor text and start with `/help/`
- Sections lead with direct answers (GEO/LLM-extractable)
- "Beebole" mentioned by name in intro and FAQ answers

#### 2.5 FAQ section

- `## Frequently asked questions` section exists (API pages exempt)
- Uses `<AccordionGroup>` with `<Accordion>` components
- 3-5 Q&A pairs
- Questions in natural language, answers self-contained and mention "Beebole"
- FAQ present in FR/ES versions too

**If FAQ is missing:** Generate it inline as part of the review. Write 3-5 Q&A pairs based on the page content following these rules:

- Questions as real users would ask: "Can I...", "How do I...", "What happens when..."
- Each answer self-contained — understandable without reading the page
- 1-3 sentences per answer, link to other pages for details
- Cover: permissions, limits, edge cases, common confusion points
- Do not invent features — only document actual Beebole behavior
- Use the same UI labels and bold formatting as the page
- Include the generated FAQ in the report as a proposed addition

#### 2.6 Translation status

- FR and ES versions exist
- Frontmatter is translated (not English copies)
- Content appears translated (not stale English text)

#### 2.7 Images

- All referenced images exist in `help/images/`
- Images are WebP format
- Images are under 200 KB (check file size)
- Naming follows kebab-case with feature context
- No PNG/JPG files that should have been converted

If unoptimized images are found, run the optimization script automatically:

```bash
bash .claude/scripts/optimize-images.sh
```

#### 2.8 Code accuracy (cross-reference with source code)

Use the sibling repo at `../reboot` (see CLAUDE.md "App repository access"):

- Verify **UI labels** match `../reboot/shared/i18n/en/labels.json`
- Verify **documented behavior** matches actual code logic (workflows, conditions, settings)
- Flag **undocumented settings or options** that exist in the code but are missing from the page
- Flag **stale content** referencing features or labels that no longer exist in the code
- Check **permissions and roles** against access control logic in the code
- Check **default values and limits** against model/form defaults and validation rules

**Fallback:** If `../reboot` is not available, skip code accuracy and note: "Code accuracy: Skipped (app repository not found at ../reboot)"

## 3. Compile the report

**Do NOT make any changes.** Present findings as a structured report:

```
## Page Review Report

**Page:** [path]
**Date:** [today]

### Overview
| Check | Status |
|-------|--------|
| Spelling & grammar | Pass / X issues |
| Style & writing rules | Pass / X issues |
| Page structure | Pass / X issues |
| SEO metadata | Pass / X issues |
| GEO compliance | Pass / X issues |
| FAQ section | Present / Missing (generated) / Missing (API exempt) |
| Translations (FR) | Up to date / Stale / Missing |
| Translations (ES) | Up to date / Stale / Missing |
| Images | Pass / X issues |
| Code accuracy | Pass / X issues / Skipped |

### Issues found

#### Critical (must fix before publishing)
- [numbered list of critical issues with specific details]

#### Warnings (should fix)
- [numbered list of warnings with specific details]

#### Suggestions (nice to have)
- [numbered list of minor improvements]

### Generated FAQ (if missing)
[The full FAQ section markup, ready to insert]

### Recommended actions
For each issue, state what action to take:
- Specific text corrections for spelling/grammar/style issues
- "Run `/screenshot` to capture missing screenshots"
- "Run `/translate` to sync stale FR/ES translations"
- FAQ section to insert (if generated above)
```

## 4. Ask before acting

After presenting the report, ask the user:

> "Would you like me to fix these issues? I can apply all fixes, or you can pick specific ones."

Only proceed with changes after the user confirms. When applying fixes:

- For FAQ → insert the generated FAQ section at the bottom (before "Related links" if present)
- For image optimization → run `bash .claude/scripts/optimize-images.sh`
- For translation issues → delegate to `/translate`
- For screenshots → delegate to `/screenshot`
- For spelling, grammar, style, SEO, GEO, and structure → apply edits directly

## Rules

- **Read-only by default.** Never modify files until the user approves.
- **Be specific.** "Line 42: 'will display' → 'displays' (use present tense)" not "fix tenses."
- **Don't invent problems.** Only flag genuine issues based on CLAUDE.md conventions.
- **Prioritize clearly.** Critical issues block publishing; warnings improve quality; suggestions are optional.
- **Generate FAQs inline.** Don't tell the user to run a separate skill — generate the FAQ and include it in the report.
- **Graceful degradation.** If `../reboot` is missing, skip code accuracy. Report what was skipped.

---
name: review
description: Run a comprehensive audit on a documentation page before publishing — checks spelling, grammar, style, SEO, GEO, images, FAQ, translations, and code accuracy
disable-model-invocation: true
---

# Review Page — Full Page Audit

Run a comprehensive audit on a documentation page before publishing. Checks spelling, grammar, style, SEO, GEO, images, FAQ, and translation status — then presents a report for approval before making any changes.

## When to use

When the user asks to "review a page", "audit a page", "check a page", "review before publishing", or similar.

## Inputs

The user provides:
- **One or more page paths** (e.g., `help/integrations/jira.mdx`)
- If no path is given, ask which page(s) to review

## Workflow

### 1. Read the page(s)

For each target page, read the full `.mdx` file. Also read the corresponding FR (`help/fr/...`) and ES (`help/es/...`) versions if they exist.

### 2. Run all checks

Perform every check below on the English page. For FR/ES versions, only run checks 2.6 and 2.7.

#### 2.1 Spelling and grammar
- Scan for spelling errors, typos, and grammatical mistakes
- Flag awkward phrasing or overly complex sentences
- Check for broken Mintlify component syntax (unclosed tags, wrong component names)

#### 2.2 Style and writing rules (from CLAUDE.md)
- Active voice used throughout
- Second person ("you") — not "the user" or passive constructions
- UI labels are **bolded** and match the app's exact wording (fetch i18n labels to verify):
  ```bash
  gh api repos/beebole/reboot/contents/shared/i18n/languages/en.json --jq '.content' | base64 -d
  ```
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

#### 2.4 SEO compliance (same checks as `/audit-seo-geo`, scoped to the page)
- `title`: 50-60 characters, includes feature name
- `description`: 120-160 characters, reads as a search snippet, doesn't repeat title
- `keywords`: 3-8 terms including "beebole"
- Images have descriptive alt text with relevant keywords
- Internal links use descriptive anchor text (not "click here")

#### 2.5 GEO compliance (same checks as `/audit-seo-geo`, scoped to the page)
- Sections lead with a direct answer (LLM-extractable first sentence)
- Paragraphs are self-contained
- "Beebole" mentioned by name in intro and FAQ answers (not just "the app")
- Definition-style openings where appropriate
- Explicit scope statements for roles/plans when relevant

#### 2.6 FAQ section
- `## Frequently asked questions` section exists (API pages exempt)
- Uses `<AccordionGroup>` with `<Accordion>` components
- 3-5 Q&A pairs
- Questions in natural language, answers self-contained and mention "Beebole"
- FAQ present in FR/ES versions too

#### 2.7 Translation status
- FR and ES versions exist
- Frontmatter is translated (not English copies)
- Content appears translated (not stale English text)

#### 2.8 Images
- All referenced images exist in `help/images/`
- Images are WebP format
- Images are under 200 KB (check file size)
- Naming follows kebab-case with feature context
- No PNG/JPG files that should have been converted

#### 2.9 Code accuracy (cross-reference with source code)
- Run the same checks as the `/audit-code` skill, scoped to this page
- Fetch relevant source code from `beebole/reboot` via the GitHub API (`gh`)
- Verify **UI labels** match the current i18n strings
- Verify **documented behavior** matches actual code logic (workflows, conditions, settings)
- Flag **undocumented settings or options** that exist in the code but are missing from the page
- Flag **stale content** referencing features or labels that no longer exist in the code
- Check **permissions and roles** mentioned on the page against access control logic in the code
- Check **default values and limits** against model/form defaults and validation rules in the code
- See `/audit-code` skill for full methodology and GitHub API commands

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
| FAQ section | Present / Missing |
| Translations (FR) | Up to date / Stale / Missing |
| Translations (ES) | Up to date / Stale / Missing |
| Images | Pass / X issues |
| Code accuracy | Pass / X issues |

### Issues found

#### Critical (must fix before publishing)
- [numbered list of critical issues with specific details]

#### Warnings (should fix)
- [numbered list of warnings with specific details]

#### Suggestions (nice to have)
- [numbered list of minor improvements]

### Recommended actions
For each issue, state what action to take. Reference existing skills where applicable:
- "Run `/generate-faqs` to add the missing FAQ section"
- "Run `/optimize-images` to convert PNG files to WebP"
- "Run `/translate` to sync stale FR/ES translations"
- Specific text corrections for spelling/grammar/style issues
```

## 4. Ask before acting

After presenting the report, ask the user:

> "Would you like me to fix these issues? I can apply all fixes, or you can pick specific ones."

Only proceed with changes after the user confirms. When applying fixes:
- For FAQ issues → delegate to the `/generate-faqs` workflow
- For image issues → delegate to the `/optimize-images` workflow
- For translation issues → delegate to the `/translate` workflow
- For spelling, grammar, style, SEO, GEO, and structure issues → apply edits directly

## Rules

- **Read-only by default.** Never modify files until the user approves.
- **Be specific.** "Line 42: 'will display' → 'displays' (use present tense)" not "fix tenses."
- **Don't invent problems.** Only flag genuine issues based on CLAUDE.md conventions.
- **Don't duplicate skill logic.** Reference existing skills for FAQ generation, image optimization, and translation — don't reimplement their checks in detail.
- **Prioritize clearly.** Critical issues block publishing; warnings improve quality; suggestions are optional.

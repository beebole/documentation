---
name: audit-seo-geo
description: "Run a comprehensive SEO and GEO audit across all documentation pages with an actionable report. Use when asked to audit SEO, check SEO/GEO compliance, review metadata quality, check for missing FAQs or alt text, or optimize pages for search engines and AI extraction."
---

# SEO & GEO Audit

Run a comprehensive audit of SEO and GEO best practices across all documentation pages, then present a clear report with actionable fixes.

## Context

Before running the audit, read these context files for the rules you'll check against:
- `.claude/context/seo-geo.md` — SEO frontmatter checklist and GEO writing patterns
- `.claude/context/brand.md` — entity attribution and voice rules

## Scope

Audit **all `.mdx` content pages** across `help/documentation/`, `help/guides/`, `help/integrations/`, `help/api/`, `help/news/`, `help/index.mdx`, and their FR/ES equivalents.

## Audit checklist

All checks are based on conventions defined in CLAUDE.md (SEO, GEO, and writing sections). For each page, verify:

### 1. Frontmatter — SEO metadata
- `title` exists, 50-60 chars, includes feature name
- `description` exists, 120-160 chars, reads as a search snippet (not repeating title)
- `keywords` array exists with 3-8 relevant terms including "beebole"
- FR/ES versions have **translated** metadata (not English copies)

### 2. Open Graph (informational only)
- Check if key landing pages have `og:title`, `og:description`, `og:image` — recommendation, not hard requirement

### 3. Page structure — GEO compliance
- Introduction paragraph exists (2-4 sentences, definition-style opening)
- "Beebole" mentioned by name in introduction and FAQ answers
- Sections lead with a direct answer/statement (LLM-extractable)
- Paragraphs are self-contained

### 4. FAQ section
- `## Frequently asked questions` section exists (except API reference pages)
- Uses `<AccordionGroup>` with `<Accordion>` components, 3-5 Q&A pairs
- Questions in natural language, answers self-contained and mention "Beebole"
- FAQ exists in all three languages

### 5. Headings
- Clear, descriptive `##` headings with relevant search terms
- Logical hierarchy (no skipped levels)

### 6. Images and alt text
- Every image has descriptive alt text (not empty, not "screenshot")
- Alt text includes relevant keywords
- Images use WebP format and are under 200 KB (spot-check)

### 7. Internal linking
- Pages link to related pages with descriptive link text (not "click here")

### 8. Content quality
- Active voice, UI labels bolded, no placeholders/TODOs, `noindex` not set on indexable pages

## How to run the audit

1. **Scan all pages** — Read every `.mdx` file in scope. Extract frontmatter, check for FAQ section, verify image alt text, heading structure, "Beebole" mentions, and structural issues.
2. **Cross-language comparison** — For each EN page, check FR/ES equivalents exist with translated metadata and FAQ sections.
3. **Compile the report** (see format below).
4. **Offer to fix** — Present a numbered list of actionable fixes grouped by type.

## Report format

```
## SEO & GEO Audit Report

### Summary
- Total pages audited: X (EN: X, FR: X, ES: X)
- Pages passing all checks: X | Pages with issues: X
- Critical issues: X | Warnings: X

### Critical issues (must fix)
Missing title/description/keywords, missing FAQ sections, empty alt text, English metadata in FR/ES pages.

### Warnings (should fix)
Title/description length issues, fewer than 3 FAQ items, missing "Beebole" in intro, generic headings, "click here" links.

### Page-by-page breakdown
| Page | Title | Desc | Keywords | FAQ | Alt text | Intro | Score |
|------|-------|------|----------|-----|----------|-------|-------|

### Recommended actions
Numbered list of specific, actionable fixes with affected pages and expected effort.
```

## Important notes

- **Read-only audit.** Do not modify any files — only report findings.
- **Be specific.** "Description is 45 characters (should be 120-160)" not "description is bad."
- **Prioritize.** Critical issues (missing metadata, missing FAQs) over style preferences.
- **API pages are exempt from FAQ checks.**
- **Use parallel processing.** Split pages into batches of 5-10 and dispatch parallel agents to read and check them simultaneously.

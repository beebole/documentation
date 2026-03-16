# SEO & GEO Reference

Apply these rules when writing, reviewing, or auditing any documentation page for search engine and AI discoverability.

## SEO — Frontmatter checklist

Every page must have:
- **`title`** — 50-60 characters, includes feature name
- **`description`** — 120-160 characters, plain-language summary (not repeating title)
- **`keywords`** — YAML array of 3-8 terms (feature name, synonyms, related actions)

## SEO — Content rules

- Page title = primary keyword phrase ("Managing Projects" not "How to work with projects")
- One clear `##` heading per major section with relevant terms
- Descriptive link text ("Learn more about [work schedules](/help/documentation/work-schedules)")
- Every image must have descriptive alt text with relevant keywords
- Each language version needs its own translated `title`, `description`, and `keywords`

## GEO — Writing for LLM extraction

LLM-powered answer engines extract and cite documentation content. Structure pages so they extract well:

- **Lead every section with a direct answer.** Key information first, details after.
- **Self-contained paragraphs.** Each paragraph makes sense on its own without surrounding context.
- **Include the feature name in answers.** "Beebole's time-off management allows..." not "This feature allows..."
- **State facts, not references.** "Beebole supports 5 leave types" not "As mentioned above, there are several types."

## GEO — High-value content patterns

1. **FAQ sections** — Pre-structured Q&A pairs (highest GEO value)
2. **Definition-style openings** — "X is..." or "X lets you..." patterns
3. **Comparison tables** — For options, permissions, plan differences
4. **Step-by-step lists** — Numbered steps with clear action verbs
5. **Explicit scope statements** — "This applies to all users with the Admin role"

## GEO — Entity signals

Follow the entity and attribution rules in `brand.md` — use "Beebole" by name, "in Beebole" not "in the app", and mention related features to build the entity graph.

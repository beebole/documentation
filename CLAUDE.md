# Beebole Help Center - Documentation

## What is this project?

This is the **Beebole Help Center**, a Mintlify-powered documentation website for [Beebole](https://beebole.com), a project time tracking application available at [app.beebole.com](https://app.beebole.com).

This is **functional documentation** (not technical), except for the API section, aimed at helping end users understand and use Beebole.

## Slash commands

| Command | What it does |
|---------|-------------|
| `/optimize-images` | Compress and convert images to WebP |
| `/translate` | Detect stale translations and sync FR/ES with English |
| `/generate-faqs` | Find pages missing FAQ sections and generate them |
| `/seo-geo-audit` | Run a full SEO & GEO audit across all pages with actionable report |
| `/generate-blueprint` | Generate a page skeleton/blueprint for contributors to follow |
| `/draft-page` | Turn a raw dictation transcript into a complete documentation page |
| `/review-page` | Full audit of a page before publishing (spelling, style, SEO, GEO, images, FAQ, translations) |

Each skill's full instructions are in `.claude/skills/`. Skills reference conventions defined below — do not duplicate these conventions in skill files.

## Languages

The documentation is maintained in three languages:

- **English** (default) — `help/`
- **French** — `help/fr/`
- **Spanish** — `help/es/`

All three languages share the same structure and page slugs. When adding or modifying content, ensure consistency across all three languages.

## Project structure

```
docs.json          # Mintlify configuration (navigation, theme, SEO, languages)
pollen.js          # Analytics script (Pollen/GTM)
help/
  index.mdx        # English landing page
  documentation/   # Core feature docs (EN)
  guides/          # Role-based guides & FAQ (EN)
  integrations/    # Integration docs (EN)
  api/             # GraphQL API docs (EN)
  news/            # Release notes (EN)
  images/          # Shared images
  logo/            # Logo assets
  fr/              # French translations (same structure as help/)
  es/              # Spanish translations (same structure as help/)
scripts/
  optimize-images.sh  # Local image optimization script (optional, requires cwebp)
  generate-faq.sh     # Detect pages missing FAQ sections (for batch FAQ generation)
  translate.sh        # Detect stale translations (for batch translation sync)
```

## Mintlify compliance

All content, configuration, and components in this project **must follow Mintlify's official documentation**. When in doubt about syntax, components, frontmatter options, or `docs.json` configuration, always refer to the Mintlify docs rather than guessing.

Use the Mintlify MCP server to look up official Mintlify documentation when working on this project.

## App terminology

The exact UI labels used in the Beebole app are defined in the app's i18n file. When writing documentation, **always use the exact label text from the app** to ensure consistency between the product and the docs.

Fetch the English labels with:
```bash
gh api repos/beebole/reboot/contents/frontend/src/i18n/languages/en.json --jq '.content' | base64 -d
```

The JSON is organized by feature area (e.g., `absenceTypeQuota`, `timesheet`, `project`, etc.). Look up the relevant section when documenting a feature to use the correct wording.

## Prerequisites — auto-check before running skills

Before running any skill or script, check that the required tools are installed. If a tool is missing, install it automatically (macOS with Homebrew) or tell the user what to install.

| Tool | Required by | Check command | Install command |
|------|------------|---------------|-----------------|
| `cwebp` | `/optimize-images` | `command -v cwebp` | `brew install webp` |
| `gh` (GitHub CLI) | `/translate`, `/generate-faqs`, app terminology lookups | `command -v gh` | `brew install gh && gh auth login` |
| `python3` | `/translate`, `/generate-faqs` (JSON escaping in scripts) | `command -v python3` | Pre-installed on macOS; otherwise `brew install python` |
| `mintlify` | Local preview (`mintlify dev`) | `command -v mintlify` | `npm install -g mintlify` |

When a skill fails because a tool is missing, install it with the corresponding install command and retry — don't just report the error.

## Key conventions

- Pages are `.mdx` files using Mintlify components and frontmatter
- Navigation structure is defined in `docs.json` under `navigation.languages`
- 5 tabs per language: Documentation, Guides, Integrations, API, News
- Brand color: `#004D43` | Support: support@beebole.com

---

## Writing content — tone, style, and structure

This section defines how documentation pages should be written. The goal is to produce clear, helpful, and consistent content that any Beebole user can follow — regardless of their technical background.

### Voice and tone

- **Professional but approachable.** Write as a knowledgeable colleague, not a manual. Lead with what the user can do ("To create a project, click **Projects**"), not abstract descriptions.
- **Concise and reassuring.** Every sentence earns its place. When a feature involves data changes, explain what happens clearly.

### Writing rules

1. **Use active voice.** "Click **Save**" not "The Save button should be clicked."
2. **Use second person.** Address the reader as "you": "You can assign a manager to each project."
3. **Bold all UI labels exactly as they appear in the app.** Buttons, menu items, field names, tab names — always bold and matching the app's wording. Fetch labels from the i18n file when unsure (see "App terminology" above).
4. **Use present tense.** "The timesheet displays your entries" not "The timesheet will display your entries."
5. **One idea per sentence.** Break complex sentences into shorter ones.
6. **Avoid jargon.** No developer terms (payload, endpoint, instance) in user-facing docs. The API section is the exception.
7. **Don't assume prior knowledge.** Briefly explain what a feature does before explaining how to use it.
8. **Define key terms before first use.** If a concept is central to the page, define it clearly before using it in instructions or details.

### Page structure

Every documentation page should follow this general flow. Not every section applies to every page — skip sections that aren't relevant.

1. **Frontmatter** — `title`, `description` (1-2 sentences for SEO), and `keywords` (3-8 terms).
2. **Introduction / Orientation** — A short paragraph (2-4 sentences) explaining what the feature is and why it matters. Answer: *What is this? When would I use it?* Use a definition-style opening ("Beebole's X lets you...").
3. **Core tasks** — The main actions users perform with this feature. Use subheadings (`##`) to break into logical sections. Use `<Steps>` / `<Step>` for sequential tasks.
4. **Configuration** — Settings, options, and customization related to the feature. Include this when the feature has configurable behavior.
5. **Advanced use cases / Edge cases** — Less common scenarios, power-user tips, or nuanced behavior. Use `<Accordion>` for details most users won't need.
6. **Troubleshooting** — Common problems and their solutions. Include this when users frequently run into issues with the feature.
7. **FAQ section** — A "Frequently asked questions" section at the bottom of every page (see FAQ generation skill).
8. **Related links** — Point to related pages at the end when useful.

Use callout components (`<Tip>`, `<Warning>`, `<Info>`, `<Note>`) inline throughout, near the content they relate to.

### Writing step-by-step instructions

When documenting a task the user needs to perform:

- Use the `<Steps>` and `<Step title="...">` Mintlify components for numbered sequences.
- Each step = one action. Don't combine "Click X and then fill in Y and press Z" into one step.
- Start each step with a verb: "Click", "Select", "Enter", "Toggle", "Navigate to".
- Include what the user should see or expect after the action when helpful (e.g., "A confirmation message appears.").
- Add a screenshot or image when the UI is not self-explanatory.

Example pattern:
```mdx
<Steps>
  <Step title="Open the Projects page">
    In the left sidebar, click **Projects**.
  </Step>
  <Step title="Create a new project">
    Click the **+** button at the top of the list. A form opens on the right.
  </Step>
  <Step title="Fill in the project details">
    Enter a **Name** and, optionally, a **Project code**. Select the **Company** this project belongs to.
  </Step>
  <Step title="Save the project">
    Click **Save**. The project now appears in your list.
  </Step>
</Steps>
```

### Using callout components

| Component | Use for |
|-----------|---------|
| `<Info>` | Contextual information that adds helpful background |
| `<Tip>` | Best practices, shortcuts, or "pro tips" |
| `<Warning>` | Actions that can't be undone, data loss risks, or common mistakes |
| `<Note>` | Secondary information that's good to know but not critical |
| `<Badge>` | Role-based or plan-based limitations (e.g., `<Badge>Admin only</Badge>`) |

Place callouts **near the content they relate to**, not grouped at the top or bottom of the page.

### Formatting conventions

- **Bold** for UI elements: button labels, menu items, field names, page titles.
- *Italic* sparingly, for emphasis on a word or to introduce a term for the first time.
- Use `code formatting` only in the API section or when referencing field names in a technical context.
- Use **standard Markdown tables** for comparing options, listing settings, or showing role permissions. Never use `<div>` grids or custom HTML layouts for tabular content.
- Use `<Accordion>` for secondary details, FAQs, or advanced configurations that most users won't need.
- Use `<Frame>` to wrap images or embedded videos for consistent styling and visual separation. For video embeds, use an `<iframe>` inside a `<Frame>`:
  ```mdx
  <Frame>
    <iframe src="https://www.youtube.com/embed/VIDEO_ID" title="Descriptive title" />
  </Frame>
  ```
- Prefer **screenshots** for UI orientation (finding buttons, seeing a screen). Prefer **videos** for complex multi-step workflows that span multiple pages.

### Content workflow — from app to page

When documenting a feature:

1. **Look at the app.** Identify the feature's location, its purpose, and the user flow.
2. **Fetch UI labels.** Use the i18n command (see "App terminology") to get exact button/field names.
3. **Write the introduction.** Explain what the feature does in plain language — assume the reader has never seen it.
4. **Document the workflow.** Walk through the feature step by step, using `<Steps>` for sequential actions.
5. **Add callouts.** Insert `<Tip>`, `<Warning>`, or `<Info>` where the user needs extra guidance.
6. **Add screenshots.** Place images after the step they illustrate. Use descriptive alt text.
7. **Add FAQs.** Generate 3-5 Q&A pairs for the FAQ section at the bottom of the page (see `/generate-faqs` skill).
8. **Write for all three languages.** Create or update the English version first, then produce the French (`help/fr/`) and Spanish (`help/es/`) equivalents with the same structure and translated UI labels.

### What NOT to do

- Don't copy-paste technical specs or internal notes into documentation.
- Don't describe the UI layout in excessive detail ("In the top-right corner of the second panel, below the header..."). Keep navigation instructions minimal and clear.
- Don't write marketing copy. This is a help center, not a sales page.
- Don't leave placeholder text, TODO comments, or draft notes in published pages.

---

## SEO best practices

Mintlify handles much of the technical SEO automatically (sitemap, robots.txt, semantic HTML, mobile optimization, canonical URLs). These guidelines cover what we control at the content and frontmatter level.

### Frontmatter metadata — every page must have

```yaml
---
title: "Short, descriptive page title"
description: "One or two sentences summarizing what this page covers."
keywords: ["beebole", "relevant", "search terms"]
---
```

- **`title`** — 50-60 characters. Include the feature name. Avoid generic titles like "Overview" or "Guide" on their own.
- **`description`** — 120-160 characters. Write a plain-language summary that would make sense as a search result snippet. Don't repeat the title.
- **`keywords`** — A YAML array of 3-8 relevant terms. Include the feature name, common synonyms, and related actions users would search for (e.g., `["time off", "leave management", "vacation", "absence tracking", "beebole"]`).

### Open Graph / social sharing

For important landing pages or pages likely to be shared, add OG tags:

```yaml
---
"og:title": "Beebole Time Off Management"
"og:description": "Learn how to manage leave requests, accruals, and public holidays in Beebole."
"og:image": "/images/og/time-off.png"
---
```

OG tags with colons **must be wrapped in quotes** in frontmatter. For most regular pages, Mintlify auto-generates these from `title` and `description`, so only add them when you want custom social previews.

### Page titles and headings

- **Page title (`title`)** should be the primary keyword phrase: "Managing Projects" rather than "How to work with projects in the app."
- **Use one clear `##` heading per major section.** Search engines use heading structure to understand content hierarchy.
- **Include relevant terms naturally in headings.** "Approving timesheets" is better than "Step 3" as a heading — it's both user-friendly and indexable.
- Don't stuff keywords. Write for humans first.

### Descriptions that work as search snippets

The `description` field often appears directly in search results. Write it as if answering the question "What will I find on this page?"

| Bad | Good |
|-----|------|
| "This page is about projects." | "Create, organize, and manage projects in Beebole. Assign team members, set budgets, and track time by project." |
| "Time off documentation" | "Set up leave types, manage time-off requests, and configure accrual rules for your team in Beebole." |

### Images and alt text

- Every image **must have descriptive alt text** that includes relevant keywords.
- Use `![Beebole timesheet weekly view with approved entries](/images/timesheet-weekly.png)` — not `![screenshot](/images/img1.png)`.
- Alt text serves both SEO and accessibility.

### Internal linking

- Link related pages to each other within the content. This helps search engines understand the site structure and keeps users navigating.
- Use descriptive link text: "Learn more about [work schedules](/documentation/work-schedules)" — not "click [here](/documentation/work-schedules)."

### Multi-language SEO

- Each language version must have its **own translated `title`, `description`, and `keywords`** in the frontmatter — not just translated body content.
- Use the same page slugs across languages (Mintlify handles `hreflang` and language routing).
- Keywords should reflect how users actually search in that language, not literal translations of the English keywords.

### Pages to exclude from indexing

For draft pages, internal-only content, or deprecated pages not yet removed, add `noindex: true` to frontmatter.

### Publishing checklist

Before publishing, verify: frontmatter has `title` (50-60 chars), `description` (120-160 chars), `keywords` (3-8 terms) — all images have descriptive alt text — headings use natural, searchable phrases — internal links use descriptive anchor text — FAQ section with 3-5 Q&A pairs exists — FR/ES versions have translated metadata (not just body text).

---

## GEO best practices (Generative Engine Optimization)

LLM-powered answer engines (ChatGPT, Perplexity, Google AI Overviews, Copilot) increasingly surface documentation content as cited answers. GEO ensures our pages are structured for LLMs to extract, attribute, and reference accurately.

### Why it matters

Unlike traditional search (where users click through to our site), generative engines synthesize answers from multiple sources. Pages that are well-structured for LLM consumption get cited more often and more accurately — driving brand visibility even when users don't visit directly.

### Writing for LLM extraction

- **Lead every section with a direct answer.** LLMs extract the first sentence or two of a section as the answer. Put the key information first, details after.
- **Use self-contained paragraphs.** Each paragraph should make sense on its own, without requiring context from surrounding text. LLMs may extract a single paragraph as a citation.
- **Include the feature name in answers, not just headings.** Instead of "This feature allows...", write "Beebole's time-off management allows...". LLMs need entity context within the extracted text.
- **State facts, not references.** "Beebole supports 5 leave types" is extractable. "As mentioned above, there are several types" is not.

### Structured content patterns LLMs prefer

- **FAQ sections** — Pre-structured Q&A pairs are the highest-value GEO content. Every page must have one (see `/generate-faqs` skill).
- **Definition-style openings** — Start pages or sections with "X is..." or "X lets you..." patterns. These map directly to how users ask LLMs questions.
- **Comparison tables** — When explaining options, permissions, or plan differences, use tables. LLMs extract tabular data cleanly.
- **Step-by-step lists** — Numbered steps with clear action verbs are preferred by LLMs for "how to" queries.
- **Explicit scope statements** — "This applies to all users with the Admin role" or "Available on all plans" helps LLMs qualify their answers.

### Entity and brand signals

- **Use "Beebole" by name** in introductions, FAQ answers, and key definitions — not just in the page title. LLMs need repeated entity mentions to correctly attribute information.
- **Include the canonical URL pattern** naturally in descriptions: "in Beebole" or "in your Beebole account" rather than "in the app."
- **Mention related Beebole features by name** when they connect to the current page. This builds an entity graph LLMs can navigate.

### What NOT to do for GEO

- Don't write content only for LLMs — it must still be useful for human readers.
- Don't stuff keywords or repeat the brand name unnaturally.
- Don't add hidden or collapsed text meant only for LLM consumption.
- Don't contradict information across pages — LLMs cross-reference sources and penalize inconsistency.

---

## Quick reference

- **Images:** WebP format, under 200 KB. Kebab-case naming with feature context. Run `/optimize-images` manually before committing.
- **FAQs:** Every content page needs a FAQ section (`<AccordionGroup>` with `<Accordion>` items) at the bottom with 3-5 Q&A pairs. Do not invent features. API pages are exempt.
- **Translations:** English is the master language. FR/ES must stay in sync. Use correct localized UI labels from the i18n files.

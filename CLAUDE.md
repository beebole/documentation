# Beebole Help Center - Documentation

## What is this project?

This is the **Beebole Help Center**, a Mintlify-powered documentation website for [Beebole](https://beebole.com), a project time tracking application available at [app.beebole.com](https://app.beebole.com).

This is **functional documentation** (not technical), aimed at helping end users understand and use Beebole.

## Languages

The documentation is maintained in three languages:

- **English** (default) — `help/`
- **French** — `help/fr/`
- **Spanish** — `help/es/`

All three languages share the same structure and page slugs. When adding or modifying content, ensure consistency across all three languages.

## Project structure

```
docs.json          # Mintlify configuration (navigation, theme, SEO, languages)
pollen.js          # Mintlify component config
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

## Key conventions

- Pages are `.mdx` files using Mintlify components and frontmatter
- Navigation structure is defined in `docs.json` under `navigation.languages`
- The site has 5 tabs per language: Documentation, Guides, Integrations, API, News
- Brand color: `#004D43`
- Support email: support@beebole.com
 
 
## Content sections

| Section | Description |
|---------|-------------|
| Getting started | Quickstart, projects, people, journal |
| Time Tracking | Timesheets, settings, approval workflows |
| Planning | Planning views, Gantt, Kanban |
| Time Off | Leave management, accruals, public holidays |
| Financial | Billing, costs, budgets, expenses |
| Reporting | Reports, custom reports, data exports, Excel/Sheets add-ons |
| Advanced | Work schedules, tags, custom fields, roles, assignments |
| Account | Settings, subscription, SSO, custom domain, audit trail |
| Integrations | Asana, Jira, Google, Microsoft, QuickBooks |
| API | GraphQL API reference and examples |

---

## Writing content — tone, style, and structure

This section defines how documentation pages should be written. The goal is to produce clear, helpful, and consistent content that any Beebole user can follow — regardless of their technical background.

### Voice and tone

- **Professional but approachable.** Write as a knowledgeable colleague explaining a feature, not as a manual or legal document.
- **Action-oriented.** Lead with what the user can do, not with abstract descriptions. Prefer "To create a project, click **Projects** in the sidebar" over "The Projects module allows for the creation of projects."
- **Reassuring.** When a feature involves data changes (archiving, deleting, modifying permissions), acknowledge the user's concern and explain what happens clearly.
- **Concise.** Every sentence should earn its place. Remove filler words, redundant explanations, and unnecessary qualifiers.

### Writing rules

1. **Use active voice.** "Click **Save**" not "The Save button should be clicked."
2. **Use second person.** Address the reader as "you": "You can assign a manager to each project."
3. **Bold all UI labels exactly as they appear in the app.** Buttons, menu items, field names, tab names — always bold and matching the app's wording. Fetch labels from the i18n file when unsure (see "App terminology" above).
4. **Use present tense.** "The timesheet displays your entries" not "The timesheet will display your entries."
5. **One idea per sentence.** Break complex sentences into shorter ones.
6. **Avoid jargon.** No developer terms (payload, endpoint, instance) in user-facing docs. The API section is the exception.
7. **Don't assume prior knowledge.** Briefly explain what a feature does before explaining how to use it.

### Page structure

Every documentation page should follow this general flow:

1. **Frontmatter** — `title`, `description` (1-2 sentences for SEO), and optional `keywords`.
2. **Introduction** — A short paragraph (2-4 sentences) explaining what the feature is and why it matters. Answer: *What is this? When would I use it?*
3. **How it works** — Explain the feature's behavior and key concepts. Use subheadings (`##`) to break into logical sections.
4. **Step-by-step instructions** — Use the `<Steps>` / `<Step>` Mintlify components for sequential tasks. Each step should be one clear action.
5. **Tips, warnings, notes** — Use callout components (`<Tip>`, `<Warning>`, `<Info>`, `<Note>`) to highlight important information inline, near the relevant content.
6. **Related links** — Point to related pages at the end when useful.

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

Place callouts **near the content they relate to**, not grouped at the top or bottom of the page.

### Formatting conventions

- **Bold** for UI elements: button labels, menu items, field names, page titles.
- *Italic* sparingly, for emphasis on a word or to introduce a term for the first time.
- Use `code formatting` only in the API section or when referencing field names in a technical context.
- Use tables for comparing options, listing settings, or showing role permissions.
- Use `<Accordion>` for secondary details, FAQs, or advanced configurations that most users won't need.

### Content workflow — from app to page

When documenting a feature:

1. **Look at the app.** Identify the feature's location, its purpose, and the user flow.
2. **Fetch UI labels.** Use the i18n command (see "App terminology") to get exact button/field names.
3. **Write the introduction.** Explain what the feature does in plain language — assume the reader has never seen it.
4. **Document the workflow.** Walk through the feature step by step, using `<Steps>` for sequential actions.
5. **Add callouts.** Insert `<Tip>`, `<Warning>`, or `<Info>` where the user needs extra guidance.
6. **Add screenshots.** Place images after the step they illustrate. Use descriptive alt text.
7. **Write for all three languages.** Create or update the English version first, then produce the French (`help/fr/`) and Spanish (`help/es/`) equivalents with the same structure and translated UI labels.

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

For draft pages, internal-only content, or deprecated pages not yet removed, add:

```yaml
---
noindex: true
---
```

### Checklist before publishing a page

- [ ] `title` is 50-60 characters, includes the feature name
- [ ] `description` is 120-160 characters, reads as a useful search snippet
- [ ] `keywords` array includes 3-8 relevant terms
- [ ] All images have descriptive alt text
- [ ] Headings use natural, searchable phrases
- [ ] Internal links point to related pages with descriptive anchor text
- [ ] French and Spanish versions have translated metadata (not just body text)

---

## Image optimization

All images should be optimized **before committing** to keep the repository lean and pages fast. Mintlify serves images from its own CDN, but it does not compress or convert them — what you commit is what gets served.

### Target format and size

- **Preferred format:** WebP (best compression-to-quality ratio for screenshots and UI images). Mintlify supports PNG, JPG, SVG, GIF, and WebP.
- **Maximum file size:** Aim for **under 200 KB** per image. Mintlify's hard limit is 20 MB, but large images hurt page load time.
- **Resolution:** Use 2x resolution for retina screens (e.g., capture at 1440px wide for a 720px display width), then compress.

### Automatic optimization (GitHub Action)

A GitHub Action (`.github/workflows/optimize-images.yml`) runs automatically whenever PNG or JPG files are pushed to `help/images/`. It:

- **Renames** the image for SEO: prefixes it with the page slug of the `.mdx` file that references it, and cleans the name to kebab-case
- **Converts** to `.webp` using `cwebp` at quality 80
- **Updates** all `.mdx` references to point to the new filename
- **Commits** the optimized images and updated references back to the repo

**No local setup required.** Contributors just drop screenshots into `help/images/`, reference them in `.mdx` files, commit and push. The action handles the rest.

**Example:** you push `Screenshot 2.PNG` referenced in `help/documentation/timesheets.mdx`. The action produces `timesheets-screenshot-2.webp`, updates the `.mdx`, and commits the changes.

If the filename already starts with the page slug, it won't duplicate the prefix. If the image isn't referenced in any `.mdx` file yet, it's still converted and cleaned to kebab-case.

### Running optimization locally (optional)

A standalone script at `scripts/optimize-images.sh` converts all PNG/JPG files in `help/images/` locally. Requires `cwebp` (`brew install webp`).

```bash
bash scripts/optimize-images.sh
```

When the user asks to "optimize images" or similar, run this script.

### Naming conventions

- Use lowercase, kebab-case: `project-settings-form.webp`
- Include the feature or context: `approval-workflow-pending.webp` — not `screenshot-3.webp`
- For language-specific images (e.g., UI in French), use subdirectories: `help/images/fr/timesheet-weekly-view.webp`

### Don'ts

- Don't commit uncompressed screenshots straight from a screen capture tool.
- Don't use BMP or TIFF formats.
- Don't keep both the original and the optimized version in the repo — only commit the optimized file.

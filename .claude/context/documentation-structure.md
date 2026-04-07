# Documentation Structure

Use this context when creating or reviewing page structure. Languages, tabs, paths, and link rules are in CLAUDE.md — this file covers the page template, section ordering, and component decision rules.

## Page structure template

Every documentation page follows this section order:

1. **Frontmatter** — SEO metadata (required on every page, no exceptions)
2. **Introduction** — Definition-style opening paragraph
3. **Core tasks** — Main workflows and procedures
4. **Configuration** — Settings, options, customization
5. **Advanced / Edge cases** — Secondary content in collapsible sections
6. **Related content** — CardGroup linking to related pages
7. **FAQ section** — 3-5 Q&A pairs in AccordionGroup

### 1. Frontmatter (mandatory fields)

```yaml
---
title: "Feature Name — Beebole"        # 50-60 chars, feature name first
description: "Plain-language summary"   # 120-160 chars, reads as a search snippet
keywords:
  - beebole                             # Always include "beebole"
  - keyword-2                           # 3-8 terms total
  - keyword-3
og:title: "Feature Name — Beebole"
og:description: "Same as description or slightly varied"
og:image: "/images/og/feature-name.webp"
og:type: "article"
---
```

Every page must have all fields. No exceptions for guides, integrations, or short pages.

### 2. Introduction paragraph

2-3 sentences, definition-style. Lead with what the feature **is**, then why you'd use it. Always mention "Beebole" by name. This paragraph is the primary target for LLM extraction (GEO).

```mdx
Beebole's [feature] lets you [what it does]. Use it to [primary benefit].
[Optional: key constraint or scope note.]
```

Follow the intro with an `<Info>` callout for prerequisites or key constraints (if any).

### 3. Core tasks

Use `##` headings for main sections, `###` for subsections.

**Component decision rules:**

| Content type | Component | Example |
| --- | --- | --- |
| Sequential procedure (3+ steps) | `<Steps>` | Setting up an integration |
| Parallel choices (role, plan, platform) | `<Tabs>` | Admin view vs. user view |
| Option/setting comparisons | Markdown table | Rate methods, field types |
| Irreversible or destructive action | `<Warning>` | Deleting an organisation |
| Productivity shortcut | `<Tip>` | Keyboard shortcut |
| Background context | `<Info>` | How inheritance works |
| Secondary detail, not essential | `<Accordion>` | Edge case behavior |
| Admin-only or plan-restricted feature | `<Badge>` | `<Badge>Admin only</Badge>` after heading |

**Rules:**

- Max 2 callouts per section (avoid callout fatigue)
- `<Warning>` is reserved for destructive/irreversible actions only — don't use for general notes
- `<Note>` and `<Info>` are interchangeable; prefer `<Info>` for consistency
- Use `<Accordion>` (not `<Tip>` or `<Note>`) for "nice to know but not required" content
- Use `<Tabs>` whenever a section has 2-3 parallel paths — don't write "If you are an admin… / If you are a user…" as prose

### 4. Configuration

Use tables for lists of settings/options. Use `<Steps>` if the configuration involves a multi-step procedure.

### 5. Images

Wrap every screenshot in `<Frame>` with a caption:

```mdx
<Frame caption="Description of what the screenshot shows">
  ![Alt text with keywords](/help/images/section/filename.webp)
</Frame>
```

- Alt text must be descriptive (not "screenshot" or empty)
- Caption describes the context ("The approval pane showing pending timesheets")
- WebP format, under 200 KB
- Organize by section: `/images/timesheets/`, `/images/billing/`, etc.

### 6. Related content (standardized)

Place **before** the FAQ, **after** all substantive content. Use `<CardGroup>` with 2-4 cards linking to the most relevant related pages.

```mdx
## Related content

<CardGroup cols={2}>
  <Card title="Page title" icon="icon-name" href="/help/documentation/page-name">
    One sentence describing what the reader will find there.
  </Card>
  <Card title="Page title" icon="icon-name" href="/help/documentation/other-page">
    One sentence describing what the reader will find there.
  </Card>
</CardGroup>
```

Every page should have 2-4 related links. Choose pages that a reader of the current page would most likely need next.

### 7. FAQ section

Always the last section on the page. 3-5 Q&A pairs. API pages are exempt.

```mdx
## Frequently asked questions

<AccordionGroup>
  <Accordion title="Natural language question?">
    Self-contained answer mentioning "Beebole". 2-4 sentences.
  </Accordion>
</AccordionGroup>
```

## Snippets (reusable content)

Store in `/snippets/`. Use when the same content block appears on 3+ pages. Name descriptively: `integration-setup-prereqs.mdx`, `admin-only-warning.mdx`.

```mdx
<Snippet file="snippet-name.mdx" />
```

Current candidates for snippets:

- Integration prerequisites (OAuth setup, admin role requirement)
- Common integration sync behavior explanation
- Rate configuration pattern (appears on people, projects, tags pages)
- "Changes apply immediately" note

## Page type variations

### Integration pages

Same template, with these specifics:
- Title format: "Integration Name — Beebole"
- Intro must state what gets synced and the sync direction
- Include a `<Steps>` block for the connection setup
- Include a "What gets synced" section with a table
- Include sync behavior details (real-time, polling, manual)

### Guide pages

- Title format: "Guide for [Role] — Beebole"
- Task-oriented, not feature-oriented
- Cross-reference feature pages rather than duplicating content
- Can use `<Tabs>` to separate different scenarios

### API pages

- Title format: "API [Topic] — Beebole"
- Use `code` formatting freely
- Include GraphQL examples with syntax highlighting
- FAQ section is optional

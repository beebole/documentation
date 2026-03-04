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

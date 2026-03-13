# Beebole Documentation

Documentation website for [Beebole](https://beebole.com), powered by [Mintlify](https://mintlify.com).

Live site: [help.beebole.com](https://help.beebole.com)

## Setup

### 1. Install Claude Code

Install the [Claude Code extension](https://marketplace.visualstudio.com/items?itemName=anthropics.claude-code) for VS Code. This is the primary way to work on this project — Claude Code reads the project conventions from `CLAUDE.md` and has slash commands for all common tasks.

### 2. Install prerequisites

Claude Code will auto-install missing tools when needed, but you can also install them upfront:

```bash
brew install webp gh python
npm install -g mintlify
gh auth login
```

| Tool | What it's for |
|------|---------------|
| `cwebp` (via `webp`) | Image optimization — converts PNG/JPG to WebP |
| `gh` (GitHub CLI) | Fetching app UI labels, script integrations |
| `python3` | JSON processing in helper scripts |
| `mintlify` | Local preview server (`mintlify dev` → `http://localhost:3000`) |

### 3. Open the project

Open this repository in VS Code, then open Claude Code from the sidebar (or `Cmd+Esc`).

## Slash commands

Type these directly in Claude Code. You can also just ask Claude in natural language — e.g., "add a FAQ section to the billing page" or "translate the timesheets page to French".

### Workflow

| Command | What it does |
|---------|-------------|
| `/draft` | Turn a raw transcript into a documentation page (English only) |
| `/review` | Full audit of a page before publishing (spelling, style, SEO, GEO, images, FAQ, translations, code accuracy) |
| `/translate` | Detect stale translations and sync FR/ES with English |

### Tools

| Command | What it does |
|---------|-------------|
| `/audit-code` | Cross-reference doc pages against the app source code to find inaccuracies and gaps |
| `/audit-seo-geo` | Run a full SEO & GEO audit across all pages with actionable report |
| `/generate-faqs` | Find pages missing FAQ sections and generate them |
| `/optimize-images` | Compress and convert images to WebP |

### Helpers

| Command | What it does |
|---------|-------------|
| `/track-app-changes` | Analyze app repo commits and maintain a human-readable changelog in `.todo/app-changes.md` |
| `/propose-updates` | Map tracked app changes to doc pages, audit them, and propose prioritized updates |
| `/generate-news` | Analyze recent doc changes and draft a news update for the releases page |

## Project structure

```
docs.json              # Mintlify config (navigation, theme, SEO, languages)
help/
  index.mdx            # English landing page
  documentation/       # Core feature docs (EN)
  guides/              # Role-based guides (EN)
  integrations/        # Integration docs (EN)
  api/                 # GraphQL API docs (EN)
  news/                # Release notes (EN)
  images/              # Shared images (WebP, <200 KB)
  fr/                  # French translations (same structure)
  es/                  # Spanish translations (same structure)
scripts/
  optimize-images.sh   # Image optimization script
  generate-faq.sh      # Detect pages missing FAQ sections
  translate.sh         # Detect stale translations
.claude/
  skills/              # Slash command skill files (workflow & helper skills)
    tools/             # Tool skill files (audit, FAQ generation, image optimization)
.todo/                 # Working files for app change tracking and proposed updates
```

## Languages

Content is maintained in three languages: English (default), French, and Spanish. English is the source of truth — French and Spanish pages mirror the same structure and slugs.

## Writing conventions

All writing style, page structure, SEO, and GEO guidelines are defined in `CLAUDE.md`. Refer to that file for tone, formatting, component usage, and the publishing checklist.

## Quick tips

- **Images:** Always use WebP format, under 200 KB. Run `/optimize-images` before committing new screenshots.
- **UI labels:** Always bold UI labels and match the exact wording from the app. Fetch labels with:
  ```bash
  gh api repos/beebole/reboot/contents/shared/i18n/languages/en.json --jq '.content' | base64 -d
  ```
- **FAQs:** Every content page needs a FAQ section at the bottom (3-5 Q&A pairs). Run `/generate-faqs` to find pages that are missing one.
- **Translations:** After editing English pages, run `/translate` to detect and sync stale French/Spanish translations.

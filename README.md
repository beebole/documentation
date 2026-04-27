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

| Tool                 | What it's for                                                   |
| -------------------- | --------------------------------------------------------------- |
| `cwebp` (via `webp`) | Image optimization — converts PNG/JPG to WebP                   |
| `gh` (GitHub CLI)    | Fetching app UI labels, script integrations                     |
| `python3`            | JSON processing in helper scripts                               |
| `mintlify`           | Local preview server (`mintlify dev` → `http://localhost:3000`) |

### 3. Clone the app repository as a sibling

Skills read source code, UI labels, and feature definitions directly from the Beebole app repo. Clone it next to this repo:

```bash
cd .. && git clone git@github.com:beebole/reboot.git
```

Verify: `ls ../reboot/shared/i18n/en/labels.json`

Skills will fall back to the GitHub API if the sibling repo is missing, but local access is faster and more capable.

### 4. Open the project

Open this repository in VS Code, then open Claude Code from the sidebar (or `Cmd+Esc`).

## Slash commands

The lifecycle runs **Discover → Write → Review → Illustrate → Translate**, with `/news` and `/triage` as orthogonal helpers.

| Step          | Command       | What it does                                                                                                                            |
| ------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Discover   | `/discover`   | Find what the docs need — recent app changes AND feature-catalog coverage gaps. Writes `.todo/discovery.md`.                            |
| 2. Write      | `/write`      | Autonomous default: drafts every gap from `discovery.md`. `/write <path>` for one page. `--interactive` opts into checkpoints.          |
| 3. Review     | `/review`     | Comprehensive audit (style, SEO, GEO, FAQ, images, translations, code accuracy). Default scope: session changes. `--all` for full site. |
| 4. Illustrate | `/illustrate` | Identify screenshot needs and capture via Playwright. `--identify` or `--capture` to split.                                             |
| 5. Translate  | `/translate`  | Sync FR/ES with EN master.                                                                                                              |
| —             | `/news`       | Draft release notes from app-repo commits. Default cursor is the most recent `<Update>` block in `help/news/releases.mdx`.              |
| Orthogonal    | `/triage`     | Process marked-up feedback files in `docs/feedback/` and file each note into the right context location.                                |

You can also just ask Claude in natural language — e.g., "add a FAQ section to the billing page" or "translate the timesheets page to French".

## Project structure

```
docs.json              # Mintlify config (navigation, theme, SEO, languages)
pollen.js              # Analytics script (Pollen/GTM)
help/
  index.mdx            # English landing page
  documentation/       # Core feature docs (EN)
  guides/              # Role-based guides & FAQ (EN)
  integrations/        # Integration docs (EN)
  api/                 # GraphQL API docs (EN)
  news/                # Release notes (EN)
  images/              # Shared images (WebP, <200 KB)
  fr/                  # French translations (mirrors help/ structure)
  es/                  # Spanish translations (mirrors help/ structure)
snippets/              # Reusable content fragments (currently empty)
.claude/
  skills/              # One subdirectory per slash command, each with SKILL.md
  context/             # Editorial guidelines (brand, audiences, SEO/GEO, components)
  scripts/             # Shell helpers for batch operations (translate, FAQ, images)
  commands/            # Only for commands that reference vendor plugins
  vendor/              # Third-party plugin files (claude-md-management)
.todo/                 # Working files for app change tracking and proposed updates
```

## Languages

Content is maintained in three languages: English (default), French, and Spanish. English is the source of truth — French and Spanish pages mirror the same structure and slugs.

## Writing conventions

All writing style, page structure, SEO, and GEO guidelines are defined in `CLAUDE.md`. Refer to that file for tone, formatting, component usage, and the publishing checklist.

## Quick tips

- **Images:** Always use WebP format, under 200 KB. Run `/illustrate --optimize` before committing new screenshots.
- **UI labels:** Always bold UI labels and match the exact wording from the app. Read labels from `../reboot/shared/i18n/en/labels.json` (see setup above).
- **FAQs:** Every content page needs a FAQ section at the bottom (3-5 Q&A pairs). `/review` generates missing FAQs automatically.
- **Translations:** After editing English pages, run `/translate` to detect and sync stale French/Spanish translations.

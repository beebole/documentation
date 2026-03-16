# Beebole Documentation

## What is this project?

This is the **Beebole Documentation**, a Mintlify-powered documentation website for [Beebole](https://beebole.com), a project time tracking application available at [app.beebole.com](https://app.beebole.com).

This is **functional documentation** (not technical), except for the API section, aimed at helping end users understand and use Beebole.

**The Beebole application source code** lives at [github.com/beebole/reboot](https://github.com/beebole/reboot.git). This documentation is entirely linked to that codebase — features, UI labels, workflows, and behavior described in these pages correspond directly to the code in that repository. When documenting a feature, always refer to the application code as the source of truth for how things work.

## Quick start

```bash
npm install -g mintlify   # Install Mintlify CLI (one-time)
mintlify dev              # Start local preview at localhost:3000
```

## Slash commands

Commands follow the content lifecycle: **Write → Check → Publish → Maintain**.

| Stage | Command | What it does |
|-------|---------|-------------|
| **Write** | `/draft` | Turn raw dictation/notes into a complete documentation page (English only) |
| **Check** | `/review` | Full pre-publish audit (spelling, style, SEO, GEO, images, FAQ, translations, code accuracy) |
| | `/audit-code` | Cross-reference doc pages against the app source code to find inaccuracies and gaps |
| | `/audit-seo-geo` | Run a full SEO & GEO audit across all pages with actionable report |
| | `/generate-faqs` | Find pages missing FAQ sections and generate them |
| **Publish** | `/translate` | Detect stale translations and sync FR/ES with English |
| | `/optimize-images` | Compress and convert images to WebP |
| **Maintain** | `/track-app-changes` | Analyze app repo commits and maintain a changelog in `.todo/app-changes.md` |
| | `/sync-features` | Sync features.md against the app codebase to find new or changed features |
| | `/propose-updates` | Map tracked app changes to doc pages and propose prioritized updates |
| | `/generate-news` | Draft a news entry for the releases page based on recent changes |

Each skill's full instructions are in `.claude/skills/<skill-name>/SKILL.md`. Skills reference conventions defined below — do not duplicate these conventions in skill files.

## Project structure

```
docs.json              # Mintlify configuration (navigation, theme, SEO, languages)
pollen.js              # Analytics script (Pollen/GTM)
help/
  index.mdx            # English landing page
  documentation/       # Core feature docs (EN)
  guides/              # Role-based guides & FAQ (EN)
  integrations/        # Integration docs (EN)
  api/                 # GraphQL API docs (EN)
  news/                # Release notes (EN)
  images/              # Shared images
  fr/                  # French translations (mirrors help/ structure)
  es/                  # Spanish translations (mirrors help/ structure)
snippets/              # Reusable content fragments (currently empty)
scripts/               # Shell helpers for batch operations (translate, FAQ, images)
.claude/
  skills/              # One subdirectory per slash command, each with SKILL.md
  context/             # Editorial guidelines (brand, audiences, SEO/GEO, components)
.todo/                 # Working files for app change tracking and proposed updates
```

## Mintlify compliance

All content, configuration, and components in this project **must follow Mintlify's official documentation**. When in doubt about syntax, components, frontmatter options, or `docs.json` configuration, always refer to the Mintlify docs rather than guessing.

Use the Mintlify MCP server to look up official Mintlify documentation when working on this project.

## Skills architecture

Skills follow the [Claude Code skills standard](https://code.claude.com/docs/en/skills). Every skill **must** use the directory-based structure:

```
.claude/skills/<skill-name>/SKILL.md
```

**Rules:**
- Each skill is a **directory** (not a flat `.md` file) containing a `SKILL.md` entrypoint.
- `SKILL.md` must start with YAML frontmatter between `---` markers, with at least `name` and `description` fields.
- Add `disable-model-invocation: true` for skills that should only be triggered manually via `/skill-name` (not auto-invoked by Claude).
- Supporting files (templates, scripts, examples) can live alongside `SKILL.md` in the same directory.
- Never place skills as flat `.md` files directly in `.claude/skills/` — always use `<skill-name>/SKILL.md`.
- Do not nest skills inside subdirectories like `tools/` — all skills live as direct children of `.claude/skills/`.

**Frontmatter example:**
```yaml
---
name: my-skill
description: What this skill does and when to use it
disable-model-invocation: true
---
```

## App terminology

The exact UI labels used in the Beebole app are defined in the app's i18n file. When writing documentation, **always use the exact label text from the app** to ensure consistency between the product and the docs.

Fetch the English labels with:
```bash
gh api repos/beebole/reboot/contents/shared/i18n/languages/en.json --jq '.content' | base64 -d
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
- 3 languages (EN, FR, ES) with the same structure and slugs — English is the master
- 5 tabs per language: Documentation, Guides, Integrations, API, News (see `.claude/context/documentation-structure.md` for details)
- Navigation is defined in `docs.json` under `navigation.languages`
- **All internal links must start with `/help/`** (site is behind a reverse proxy)
- Brand color: `#4338CA` | Support: support@beebole.com

---

## Writing guide

Full editorial guidelines are in `.claude/context/`:

| File | Covers |
|------|--------|
| `brand.md` | Voice, tone, writing rules |
| `audiences.md` | Target audiences by tab |
| `documentation-structure.md` | Page structure template, internal link rules |
| `mintlify-components.md` | Components reference (Steps, callouts, Accordion, etc.) |
| `seo-geo.md` | SEO frontmatter, GEO patterns for LLM extraction |

**Key rules:** Active voice, second person, present tense, bold UI labels from i18n, one idea per sentence, no jargon outside API docs. Lead sections with direct answers for GEO. Every page needs a FAQ section.

---

## Quick reference

- **Images:** WebP format, under 200 KB. Kebab-case naming with feature context. Organize by section (e.g., `/images/timesheets/`, `/images/billing/`). Run `/optimize-images` manually before committing.
- **FAQs:** Every content page needs a FAQ section (`<AccordionGroup>` with `<Accordion>` items) at the bottom with 3-5 Q&A pairs. Do not invent features. API pages are exempt.
- **Translations:** English is the master language. FR/ES must stay in sync. Use correct localized UI labels from the i18n files.

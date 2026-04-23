# Beebole Documentation

## What is this project?

This is the **Beebole Documentation**, a Mintlify-powered documentation website for [Beebole](https://beebole.com), a project time tracking application available at [app.beebole.com](https://app.beebole.com).

This is **functional documentation** (not technical), except for the API section, aimed at helping end users understand and use Beebole.

**The Beebole application source code** lives at [github.com/beebole/reboot](https://github.com/beebole/reboot.git). This documentation is entirely linked to that codebase — features, UI labels, workflows, and behavior described in these pages correspond directly to the code in that repository. When documenting a feature, always refer to the application code as the source of truth for how things work.

A curated **features reference** is available at `.features/features.md` (symlink to the reboot repo). Use it as a quick overview of what Beebole supports — it's faster than browsing the full source.

## App repository access

The Beebole application source code is available at `../reboot` (sibling directory). Skills read from this path directly instead of using the GitHub API.

**Key paths:**

- `../reboot/.claude/skills/audit-features/references/features.md` — Features catalog (220+ features)
- `../reboot/shared/i18n/en/labels.json` — English UI labels
- `../reboot/frontend/src/models/types.ts` — Entity type definitions
- `../reboot/frontend/src/components/` — UI components by entity
- `../reboot/backend/src/application/entities/` — Backend entity definitions
- `../reboot/docs/` — Design documents (feature specs, architecture)

**Fallback:** If `../reboot` is not available locally, fall back to the GitHub API (`gh api repos/beebole/reboot/...`). If neither is available, report which checks were skipped — never silently degrade.

## Quick start

```bash
npm install -g mintlify   # Install Mintlify CLI (one-time)
mintlify dev              # Start local preview at localhost:3000
```

## Slash commands

Commands follow the content lifecycle: **Write → Check → Publish → Maintain**.

| Stage        | Command       | What it does                                                                                                         |
| ------------ | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Write**    | `/draft`      | Turn raw dictation/notes into a complete documentation page (English only), pulling context from the app source code |
| **Check**    | `/review`     | Full pre-publish audit (spelling, style, SEO, GEO, images, FAQ generation, translations, code accuracy)              |
|              | `/audit`      | Unified audit: `/audit page <path>` (code accuracy), `/audit coverage` (feature gaps), `/audit seo` (SEO & GEO)      |
| **Publish**  | `/translate`  | Detect stale translations and sync FR/ES with English                                                                |
|              | `/screenshot` | Capture screenshots via Playwright, optimize images, embed Arcade demos                                              |
| **Maintain** | `/sync`       | Detect app repo changes, map to affected doc pages, propose updates. `--news` to draft release notes                 |

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
.claude/
  skills/              # One subdirectory per slash command, each with SKILL.md
  context/             # Editorial guidelines (brand, audiences, SEO/GEO, components)
  scripts/             # Shell helpers for batch operations (translate, FAQ, images)
  commands/            # Only for commands that reference vendor plugins (not skill wrappers)
  vendor/              # Third-party plugin files (claude-md-management)
.todo/                 # Working files for app change tracking and proposed updates
.features/
  features.md          # Symlink → beebole/reboot/.claude/skills/audit-features/references/features.md (gitignored)
```

## File placement

- **`.mcp.json`** must stay at the project root — Claude Code won't discover MCP servers if it's inside `.claude/`
- **`.claude/settings.local.json`** is gitignored — don't attempt to `git add` it
- **`.claude/commands/`** — only create command files here when they add logic beyond what a skill provides (e.g., referencing a vendor plugin). Skills auto-register as `/skill-name` slash commands.

## Mintlify compliance

All content, configuration, and components in this project **must follow Mintlify's official documentation**. When in doubt about syntax, components, frontmatter options, or `docs.json` configuration, always refer to the Mintlify docs rather than guessing.

Use the Mintlify MCP server to look up official Mintlify documentation when working on this project.

**Banned patterns — use Mintlify equivalents instead:**

- `<img>` tags → use markdown `![alt](src)` inside `<Frame caption="...">`
- `<br/>` tags → use blank lines for paragraph breaks
- `className=`, `style=` attributes → no inline styles; use Mintlify components for layout
- Raw `<iframe>` → wrap in `<Frame>`
- Mermaid diagrams (` ```mermaid `) → use `<CardGroup>`/`<Card>` with tables, or Mintlify components
- Any raw HTML (`<div>`, `<span>`, `<table>`, `<ul>`, etc.) → use markdown or Mintlify components

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

Read the English labels directly from the sibling repo:

```
../reboot/shared/i18n/en/labels.json
```

The JSON is organized by feature area (e.g., `absenceTypeQuota`, `timesheet`, `project`, etc.). Look up the relevant section when documenting a feature to use the correct wording.

**Fallback** (if `../reboot` is not available):

```bash
gh api repos/beebole/reboot/contents/shared/i18n/en/labels.json --jq '.content' | base64 -d
```

## Prerequisites — auto-check before running skills

Before running any skill or script, check that the required tools are installed. If a tool is missing, install it automatically (macOS with Homebrew) or tell the user what to install.

| Tool              | Required by                                               | Check command         | Install command                                         |
| ----------------- | --------------------------------------------------------- | --------------------- | ------------------------------------------------------- |
| `cwebp`           | `/screenshot` (image optimization)                        | `command -v cwebp`    | `brew install webp`                                     |
| `gh` (GitHub CLI) | `/translate`, `/sync` (fallback), app terminology lookups | `command -v gh`       | `brew install gh && gh auth login`                      |
| `python3`         | `/translate` (JSON escaping in scripts)                   | `command -v python3`  | Pre-installed on macOS; otherwise `brew install python` |
| `mintlify`        | Local preview (`mintlify dev`)                            | `command -v mintlify` | `npm install -g mintlify`                               |

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

| File                         | Covers                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `brand.md`                   | Voice, tone, writing rules                                                                           |
| `audiences.md`               | Target audiences by tab                                                                              |
| `documentation-structure.md` | Page structure template, internal link rules                                                         |
| `mintlify-components.md`     | Components reference (Steps, callouts, Accordion, etc.)                                              |
| `seo-geo.md`                 | SEO frontmatter, GEO patterns for LLM extraction                                                     |
| `page-mappings.md`           | Keyword → doc page routing + page → module routing (used by `/audit coverage`, `/sync`, `/triage`)   |
| `terminology.md`             | Cross-cutting vocabulary rules not covered by brand/structure/seo/components                         |
| `modules/<entity>.md`        | Product-domain rules (terminology, facts, structural) — one file per entity, created by `/triage`    |
| `page-notes.md`              | One-off corrections scoped to a single page (keyed by URL path)                                      |
| `translation-notes.md`       | FR/ES-specific translation feedback — read ONLY by `/translate`, never by content skills             |

**Key rules:** Active voice, second person, present tense, bold UI labels from i18n, one idea per sentence, no jargon outside API docs. Lead sections with direct answers for GEO. Every page needs a FAQ section.

---

## Quick reference

- **Images:** WebP format, under 200 KB. Kebab-case naming with feature context. Organize by section (e.g., `/images/timesheets/`, `/images/billing/`). Run `/screenshot optimize` before committing.
- **FAQs:** Every content page needs a FAQ section (`<AccordionGroup>` with `<Accordion>` items) at the bottom with 3-5 Q&A pairs. Do not invent features. API pages are exempt.
- **Translations:** English is the master language. FR/ES must stay in sync. Use correct localized UI labels from the i18n files.

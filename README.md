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

The lifecycle runs **Sync features → Find gaps → Write → Review → Illustrate → Translate**, with `/news` and `/triage` as orthogonal helpers.

| Step             | Command          | What it does                                                                                                                            |
| ---------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Sync features | `/sync-features` | Refresh `features.md` by scanning `../reboot`. Default = full scan. `--incremental` only inspects commits since `Last updated:`.        |
| 2. Find gaps     | `/find-gaps`     | Compare the catalog against `help/**` and write `.todo/gaps.md` with Missing/Partial entries.                                           |
| 3. Write         | `/write`         | Autonomous default: drafts every gap from `gaps.md`. `/write <path>` for one page. `--interactive` opts into checkpoints.               |
| 4. Review        | `/review`        | Comprehensive audit (style, SEO, GEO, FAQ, images, translations, code accuracy). Default scope: session changes. `--all` for full site. |
| 5. Illustrate    | `/illustrate`    | Identify screenshot needs and capture via Playwright (DPR 2, app chrome hidden). `--identify`/`--capture` to split; `--commercial` for marketing-site PNGs (no WebP). See "Screenshots" below.    |
| 6. Translate     | `/translate`     | Sync FR/ES with EN master (deferred — FR/ES are currently removed; see "Languages").                                                    |
| —                | `/news`          | Draft release notes from app-repo commits. Default cursor is the most recent `<Update>` block in `help/news/releases.mdx`.              |
| Orthogonal       | `/triage`        | Process marked-up feedback files in `docs/feedback/` and file each note into the right context location.                                |

You can also just ask Claude in natural language — e.g., "add a FAQ section to the billing page" or "translate the timesheets page to French".

## Project structure

```text
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
  # fr/ and es/ are temporarily removed — site is English-only while EN
  # stabilizes; /translate rebuilds them from the EN master before relaunch.
snippets/              # Reusable content fragments (currently empty)
.claude/
  skills/              # One subdirectory per slash command, each with SKILL.md
  context/             # Editorial guidelines (brand, audiences, SEO/GEO, components)
  scripts/             # Shell helpers (translate, optimize-images, detect-reboot-changes)
docs/                  # Internal working docs (NOT published by Mintlify)
  feedback/            # Inbox for marked-up review files (processed by /triage)
.todo/                 # Working files for gaps, screenshot needs, and other handoffs
```

## Languages

English is the source of truth. French and Spanish mirror the same structure and slugs — but they are **currently removed**: during the June 2026 English overhaul nearly every page was rewritten, so the old FR/ES became stale translations of outdated content. The site is **English-only for now**, and `/translate` will rebuild FR/ES from the corrected English (and restore their `docs.json` nav) once English is signed off.

## Screenshots

Screenshots are captured with `/illustrate`. Conventions, learned during setup:

- **Resolution:** capture at **2× (retina)**. Playwright captures at DPR 2 automatically. For manual macOS screenshots (Cmd+Shift+4), shoot on the **built-in retina screen** (or an external display set to a HiDPI "scaled" mode) — a 4K display at native 1× scaling produces soft 1× images. Rule of thumb: the saved PNG's pixel width is ~double the selection you dragged.
- **Hidden chrome:** the Intercom messenger and the "Beta" badge are hidden via an injected DOM style before every capture (no app-code change) — for both docs and commercial shots.
- **Hand-off for manual shots:** macOS screenshots land on `~/Desktop`; drop one in chat and Claude reads the file from the Desktop, verifies it's 2×, then processes it.
- **Docs screenshots:** converted to **WebP** (`-q 80`, under 200 KB) and placed in `help/images/<section>/`, wired into the page with a `<Frame>`.
- **Commercial screenshots** (`/illustrate --commercial`, for the marketing website): kept as **PNG — not WebP** (the `website-next` site has its own resize/compress pipeline). Saved to a dated Desktop folder `~/Desktop/screenshots-<YYYY-MM-DD>/`; not placed in this repo.

## Writing conventions

All writing style, page structure, SEO, and GEO guidelines are defined in `CLAUDE.md`. Refer to that file for tone, formatting, component usage, and the publishing checklist.

## Quick tips

- **Images:** Docs images are WebP, under 200 KB; run `/illustrate --optimize` before committing. Commercial-website screenshots stay PNG (see "Screenshots"). Capture at 2× (retina).
- **UI labels:** Always bold UI labels and match the exact wording from the app. Read labels from `../reboot/shared/i18n/en/labels.json` (see setup above).
- **FAQs:** Every content page needs a FAQ section at the bottom (3-5 Q&A pairs). `/review` generates missing FAQs automatically.
- **Translations:** FR/ES are currently removed (English-only — see "Languages"). Once English is signed off, `/translate` rebuilds them from the EN master; after that, run it whenever you edit an English page.
- **AI endpoints:** Mintlify auto-generates `/llms.txt`, `/llms-full.txt`, and `/skill.md` from the published docs (no maintenance needed). The reverse proxy lives in the sibling `website-next/next.config.ts`. `/help/llms.txt` and `/help/llms-full.txt` are already forwarded there; `/help/skill.md` and the `/.well-known/skills/*` discovery endpoints are not yet wired up — add rewrites if we adopt `skill.md`.

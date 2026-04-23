# Content Lifecycle Skills Reorganization

**Date:** 2026-04-23
**Status:** Design approved — ready for implementation plan
**Owner:** Yves Hiernaux

## Context

This repository is a **documentation automation engine**. Claude is the default author of every English page, producing content end-to-end without per-step human checkpoints. Humans review output at well-defined quality gates — primarily `/review` — and `/triage` for accumulated editorial feedback. CLAUDE.md currently undersells this framing; the project reads as "Mintlify site with some AI helpers" rather than "automated documentation pipeline."

The current skill set has accumulated organically: `/sync` detects app-repo changes, `/audit` has three disconnected modes (page / coverage / SEO), `/review` is a thorough single-page pre-publish check, `/draft` is interactive-only, `/screenshot` handles images, `/translate` handles FR/ES. There is real overlap — `/audit page` is ~90% a subset of `/review`'s code-accuracy checks, and `/audit seo` overlaps `/review`'s SEO/GEO section. More importantly, the skill names don't map to a clear lifecycle: a reader of CLAUDE.md can't tell from the command list what step they're at.

This spec reorganizes the skills around five explicit lifecycle steps — **Discover → Write → Review → Illustrate → Translate** — with one additional skill for release notes (`/news`). Names become intent-driven, behaviors consolidate where they overlapped, and `/write` becomes autonomous by default so the repo reads as what it actually is: an automation engine.

## Goals

- Rename skills to match lifecycle steps so the command list tells the story: discover what's missing → write → review → illustrate → translate.
- Consolidate overlapping skills into single canonical commands (fold `/audit` into `/review`, merge `/sync` and `/audit coverage` into `/discover`).
- Make `/write` autonomous by default, with interactive as an opt-in secondary mode — reinforcing the "automation engine" identity.
- Shift the human-in-the-loop moment to `/review` as the primary quality gate, and use git working-tree + staged changes as the default review scope.
- Extract shared change-detection logic so `/discover` and `/news` consume a common source of truth about what shipped in `../reboot`.
- Update CLAUDE.md to lead with the automation-engine framing.

## Non-goals

- Changing the actual audit checks or editorial rules. Every existing check in `/review` and `/audit` is preserved; they're just merged, not reinterpreted.
- Changing the feedback architecture shipped in `2026-04-23-feedback-architecture-design.md`. All skills in this spec continue loading module files, `page-notes.md`, and `translation-notes.md` exactly as defined there.
- Changing `/triage`'s workflow. It's orthogonal to the lifecycle — it processes human feedback on existing pages, not documentation generation. Its SKILL.md will receive mechanical updates for any references to renamed skills, but its behavior is preserved.
- Changing user-facing content in `help/**`. Every change in this spec is internal tooling.
- Aliases for the old skill names. Clean cutover; `/sync`, `/draft`, `/screenshot`, `/audit` stop working the next time they're typed.

## Locked decisions

Captured from brainstorming:

1. **Lifecycle names as skill names:** Discover → Write → Review → Illustrate → Translate. Plus `/news` as a separate skill. Plus `/triage` unchanged.
2. **`/discover` runs both** recent app-repo changes and full feature-catalog coverage by default, scoped by flag (`--changes` or `--coverage`).
3. **`/write` defaults to autonomous.** Interactive is opt-in via `--interactive`.
4. **`/review` defaults to session scope** = git working tree + staged changes.
5. **`/news` is a separate skill**, not a mode of discover or write.
6. **Clean cutover rename.** No aliases.

## Final skill set

| Step | Skill | Replaces | Purpose |
| --- | --- | --- | --- |
| 1. Discover | `/discover` | `/sync` + `/audit coverage` | Find what the docs need — recent app-repo changes AND feature-catalog gaps |
| 2. Write | `/write` | `/draft` | Create page content — autonomous by default, interactive via flag. SEO/GEO/FAQ produced inline. |
| 3. Review | `/review` | `/review` + `/audit page` + `/audit seo` | Comprehensive audit — all dimensions, any scope (session, path, or `--all`) |
| 4. Illustrate | `/illustrate` | `/screenshot` | Identify screenshot needs and capture them |
| 5. Translate | `/translate` | `/translate` | Sync FR/ES with EN master (unchanged) |
| — | `/news` | `/sync --news` | Draft release notes from app-repo changes |
| Orthogonal | `/triage` | `/triage` | Process human feedback in `docs/feedback/` — unchanged |

**Deleted:** `/sync`, `/draft`, `/screenshot`, `/audit` (all three modes).

## Skill behaviors

### `/discover`

**Purpose:** produce a single discovery report covering both "what changed in the app" and "what's undocumented."

**Modes:**

- **Default:** runs both change detection and full coverage analysis. One combined report.
- **`/discover --changes`:** only recent app-repo changes since the last sync cursor.
- **`/discover --coverage`:** only feature-catalog vs. documentation comparison.

**Output:** single file `.todo/discovery.md` with two sections — "Recent changes → affected pages" and "Coverage gaps → undocumented / partially-documented features." This file is the handoff consumed by `/write` (no-args default).

**State:** preserves today's `.sync/state.json` cursor semantics — tracks the last synced commit SHA in `../reboot`.

### `/write`

**Purpose:** produce publishable `.mdx` pages. Autonomous by default.

**Modes:**

- **Default (autonomous batch):** `/write` with no arguments reads `.todo/discovery.md`, writes every gap autonomously in sequence, produces a consolidated summary at the end. This is the automation-engine's primary mode: "catch the docs up to what `/discover` found."
- **Single page (autonomous):** `/write <path>` drafts just that page end-to-end. Reads input (user-provided notes OR the discovery entry if a gap exists for that path). Researches in `../reboot`. Produces full `.mdx` with frontmatter, intro, sections, FAQ, callouts. Updates `docs.json` navigation if the page is new. No mid-flow checkpoints.
- **Interactive:** `/write --interactive <path>` is today's `/draft` flow — outline checkpoint, draft checkpoint, iteration loop. Used when Yves wants to co-author a page rather than ship whatever Claude produces. Opt-in only.

**Output rules (unchanged from `/draft`):** active voice, second person, present tense, bold UI labels from `labels.json`, FAQ with 3-5 Q&A pairs, SEO frontmatter per `seo-geo.md`, loads feedback files per the feedback-architecture spec.

**Quality gate:** none inside `/write`. Review happens in `/review` after.

### `/review`

**Purpose:** comprehensive audit. One check engine, flexible scope.

**Scopes:**

- **Default (session):** no arguments — audit every `.mdx` with modifications in git working tree + staged changes. This catches what `/write` just produced.
- **Explicit paths:** `/review <path> [paths…]` — audit specific pages.
- **Full site:** `/review --all` — every `.mdx` under `help/`. Expensive; runs via parallel subagents in batches of 5-10.

**Checks (union of today's `/review` + `/audit page` + `/audit seo`):**

- Spelling, grammar, awkward phrasing
- Style rules (active voice, second person, bold UI labels, present tense, one idea per sentence)
- Page structure (frontmatter, heading hierarchy, section flow)
- SEO frontmatter (title/description/keywords lengths and inclusion)
- GEO compliance (direct answers, Beebole mentions, self-contained paragraphs)
- FAQ structure (`<AccordionGroup>`, 3-5 items, natural questions); generate inline if missing
- Images (WebP, <200 KB, descriptive alt text, kebab-case naming)
- Translation currency (FR/ES exist and not stale)
- Code accuracy (UI labels vs. `labels.json`, documented behavior vs. code, permissions, defaults)
- **Undocumented features** (things in code not in docs) — from `/audit page`
- **Deprecated content** (things in docs not in code) — from `/audit page`
- Feedback-file compliance (module rules, page-notes rules treated as critical checks — per feedback-architecture spec)

**Report:** Critical / Warnings / Suggestions sections. No changes applied without approval.

### `/illustrate`

**Purpose:** make sure every page has the screenshots it needs.

**Modes:**

- **Default:** `/illustrate <path>` — identify screenshot needs on that page (bare `![...](...webp)` placeholders with no file, or explicit markers), capture via Playwright, optimize to WebP, place in `help/images/<section>/`.
- **`/illustrate --identify`:** list needs only, no capture. Outputs to chat.
- **`/illustrate --capture <list>`:** run Playwright against a pre-built list (for when `--identify` was run separately or the list was produced by `/write`).

**Existing scripts:** keeps using `.claude/scripts/optimize-images.sh` and any existing Playwright helpers. No new tooling.

### `/translate`

**Purpose:** sync FR/ES to match EN. Unchanged from today's `/translate`.

**Isolation preserved:** reads `.claude/context/translation-notes.md` exclusively. Never reads `modules/`, `page-notes.md`, or `terminology.md` — those are content-authoring files. This boundary is part of the feedback-architecture spec and is load-bearing.

### `/news`

**Purpose:** draft a release-notes page in `help/news/` from app-repo commits.

**Interface:**

- **Default (no args):** `/news` reads the most recent file in `help/news/`, uses its publication date as the cursor, and drafts a new release-notes entry for all app-repo commits since then. Matches the automation-engine framing — "catch the changelog up" with no input required.
- **`/news --since <date|sha>`:** explicit cursor for cases where the last-published entry isn't the right starting point (re-drafting a window, covering a specific feature release, backfilling).
- Uses the same change-detection logic as `/discover --changes` (see "Shared logic" below).

**Output:** a new `.mdx` under `help/news/` with frontmatter, summary intro, categorized changes. Yves reviews and publishes separately — `/news` does not push.

### `/triage` (orthogonal, unchanged)

Processes human feedback in `docs/feedback/`. Not part of this lifecycle reorganization. Its SKILL.md references to old skill names (`/draft`, etc. in the "skips /translate" rule for content feedback routing) need updating — see Migration below — but its workflow is preserved.

## Shared logic

Two pieces of logic are used by more than one skill and deserve extraction so changes only need to happen once:

### 1. App-repo change detection

**Used by:** `/discover --changes` and `/news`.

**Today:** lives inside `/sync`'s workflow, hard-coded.

**After:** extract to `.claude/scripts/detect-reboot-changes.sh` (or similar). Both skills invoke it; they format the output differently (`/discover` → gap report; `/news` → user-facing release notes).

**Contract:** takes `--since <sha|date>` (defaulting to `.sync/state.json`), outputs commit SHAs + files + commit messages in a stable machine-readable shape.

### 2. SEO/GEO rules, i18n labels, feedback-file loading

Already externalized:

- `.claude/context/seo-geo.md` — both `/write` (to produce) and `/review` (to verify) read from here.
- `../reboot/shared/i18n/en/labels.json` — both `/write` (to emit labels) and `/review` (to check labels) read from here.
- `.claude/context/modules/`, `page-notes.md`, `translation-notes.md` — loaded per the feedback-architecture spec.

No change needed for any of these; they already serve multiple consumers.

## Pipeline flow

```text
/discover  →  .todo/discovery.md
                      │
                      ▼
                   /write         (autonomous batch — produces N new/updated pages)
                      │
                      ▼
                  /review         (session scope auto-catches the new pages)
                      │           ← human quality gate
                      ▼
                /illustrate       (scans for placeholders, captures)
                      │
                      ▼
                 /translate       (autonomous FR/ES sync)
                      │
                      ▼
                   /news          (optional — draft release notes if the batch is release-worthy)
```

Each skill is independently runnable. The pipeline is one common flow, not a hard dependency.

## Migration — clean cutover

Order of operations (each step is a task in the implementation plan):

1. **Create `/discover` skill** at `.claude/skills/discover/SKILL.md`. Fold in `/sync` workflow + `/audit coverage` workflow. Default runs both.
2. **Create `/write` skill** at `.claude/skills/write/SKILL.md`. Default (no args) is autonomous batch from `.todo/discovery.md`; single-path is `/write <path>`; `--interactive <path>` is the opt-in checkpoint flow.
3. **Update `/review` skill** (rename of the existing file is not needed since `/review` is already the name) to add `/audit page` checks (undocumented + deprecated), `/audit seo` checks (frontmatter/GEO/FAQ structure — already present, no change), and the three scopes (session default, explicit paths, `--all`).
4. **Create `/illustrate` skill** at `.claude/skills/illustrate/SKILL.md` from today's `/screenshot` content. Add the `--identify` / `--capture` split.
5. **Create `/news` skill** at `.claude/skills/news/SKILL.md`. Port the `/sync --news` release-notes logic.
6. **Extract shared script** to `.claude/scripts/detect-reboot-changes.sh`. Rewire `/discover` and `/news` to call it.
7. **Delete old skill directories:** `/sync`, `/draft`, `/screenshot`, `/audit`.
8. **Update `.claude/context/page-mappings.md`** to reflect new skill names in its description (today says `used by /audit coverage, /sync, /triage` → becomes `used by /discover, /review, /triage`).
9. **Update `/triage` SKILL.md** — any references to old skill names in its workflow or rules.
10. **Update CLAUDE.md:**
    - **Opening frame:** lead with the automation-engine identity. Current "What is this project?" section describes Mintlify + Beebole; add a line saying this repo is a **documentation automation engine** where Claude is the default author and humans review via `/review` and `/triage`.
    - **Slash commands table:** replace with the new six + orthogonal `/triage`. Keep the Write → Check → Publish → Maintain lifecycle framing but map to the new names (Discover → Write → Review → Illustrate → Translate, plus News and Triage).
    - **Prerequisites table:** update skill names that appear in the "Required by" column.
    - **Writing guide table:** update the `page-mappings.md` row.

No user-facing content in `help/**` is touched. No `docs.json` navigation changes except what individual `/write` runs produce.

## CLAUDE.md automation-first framing

Add near the top of CLAUDE.md (after "What is this project?"):

> **This is an automation engine.** Claude is the default author of English pages. The lifecycle — `/discover` → `/write` → `/review` → `/illustrate` → `/translate` — runs with minimal human intervention. Humans are in the loop at two moments: `/review` (quality gate after writing) and `/triage` (filing accumulated editorial feedback from colleagues). Every other step is autonomous by default. Interactive/co-author modes exist as opt-ins for cases where a human wants to drive a specific page.

## Out of scope — noted for follow-ups

- A scheduled runner that chains `/discover → /write → /review` end-to-end on a cron. Likely valuable once the reorganized skills have run for a few weeks; not this spec.
- Changes to `/triage` itself beyond updating skill-name references.
- Changes to the feedback-architecture file layout (`modules/`, `page-notes.md`, `translation-notes.md`, `terminology.md`) — preserved exactly.

## Success criteria

- `/discover` run on a fresh checkout produces a single `.todo/discovery.md` covering both recent changes and feature-catalog gaps without requiring separate commands.
- `/write` with no arguments processes the discovery report end-to-end in a single autonomous run and reports how many pages were created.
- `/write <path>` drafts that page autonomously without asking for approval mid-flow.
- `/review` run with no arguments audits exactly the pages `/write` just produced (session scope).
- `/review --all` completes against the full `help/**` tree (expensive but feasible).
- Typing `/sync`, `/audit`, `/draft`, or `/screenshot` no longer resolves to anything.
- CLAUDE.md's opening framing tells a new reader within 3 sentences that this is an automation engine, not just a Mintlify site.
- `/triage`'s workflow still runs end-to-end with no regressions from skill-name updates.

## Open questions

None at the design level. The implementation plan will settle concrete details (exact flag parsing, report formats, script contract for `detect-reboot-changes.sh`).

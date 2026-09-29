# Screenshot machine — design

**Date:** 2026-09-29
**Status:** approved by Yves in conversation (2026-09-29), section by section. Supersedes `2026-08-18-screenshot-refresh-design.md`.
**Pilot already done:** the Tags page got three screenshots on 2026-09-29 (PR #33), captured headless from the QA account described below.

## Goal

Every documentation page shows the same obviously fictional company, with data that looks current, and screenshots stay right after UI changes without Yves checking each one. Three steps:

0. **A documentation account** whose data can always be brought up to date, used for docs screenshots only (not the website, not feature testing).
1. **Screenshots across the whole site**, in batches sized to fit one session, most important first.
2. **`/release` keeps them current**: it replays every screenshot, recaptures the ones whose screen changed, captures new ones for new or rewritten pages, and reports everything in its PR.

## Vocabulary

- **Documentation account:** the QA organisation `6abb86369d045d1d6a183151` on `qa.beebole.com`, named **AnyCompany**. Its admin appears in the app as Jordan Reed. API key `BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY` in `~/.config/beebole/.env`.
- **Scene:** a small script that brings the app into one state (open a page, expand a tree, open a dialog) and produces one or more images from it. A scene is the recipe of a screenshot, kept so it can be replayed.
- **Shot:** one image a scene produces, with its framing: the full screen, one element with a margin, a fixed area, or a lens.
- **Lens:** a shot for a control too small to read on its own. The context area is shown at the usual 2x; a round magnifier shows the control from a 4x capture (so twice the size and sharp), with a white rim, a soft shadow, and an orange (#ea580c) ring around the real control linked to the magnifier by a line. The magnifier is placed where it covers neither the control nor the ring.
- **Capture:** run a scene now and write its images into `help/images/`.
- **Replay:** run a scene with the browser clock frozen at the scene's capture date, and compare the result with the published image, without writing anything.
- **Date-dependent scene:** a scene whose content depends on the current date (a timesheet week, a planning view, totals to date). Only these trigger a data top-up, and only when they are recaptured.
- **Top-up:** bring the documentation account's data up to yesterday, only by adding.
- **Inventory:** `.todo/screenshot-needs.md`, the list of screenshots the pages need (about 156 across 56 pages, rated high, medium or low).

## Decisions (who decided)

All taken by Yves on 2026-09-29 unless marked otherwise.

- Docs only. The website will get a similar but separate setup; feature testing stays out.
- Data is refreshed only when screenshots are taken, and only when a shot being replaced needs current dates. No scheduled job.
- The company is **AnyCompany** (obviously fictional). "Acme Corp" stays the example client, as the docs and `.claude/context/feedback.md` already use it.
- Density follows need, not a number: a shot for each part of a page where seeing the screen helps the reader, none where the text is enough. (Replaced "one to three per page" on 2026-09-29, after the Timesheets test.)
- Needs come from the page itself; the inventory is the to-do list, not the source of truth. (2026-09-29.)
- Small controls get a **lens**: the screen around the control, with a round magnifier showing the control at twice the size and a thin orange ring and line pointing at it. Approved on the calendar-import prototype, 2026-09-29.
- Batches of about 15 shots: high priority first, then medium, then low; most-visited pages first within each level (PostHog website project, 90-day views).
- A screen shown on several pages is captured once and linked from each page. One scene can produce several shots from the same state.
- Staleness is detected by replay and pixel comparison, with the data kept stable.
- `/release` does all of it: replay, refresh, repair once, capture for new pages, report. This replaces the August rule "release never captures".
- Scenes are runnable scripts (not a YAML read by Claude), so a replay costs no tokens.
- The runner may add Node dependencies (Playwright, `sharp`, `pixelmatch`), replacing the August "no new dependencies" constraint.
- Docs data gets its own seed, `/seed-documentation`, in this repo (not in `../reboot`), started from reboot's `seed-demo`.

## 1. Architecture

Everything lives in the documentation repo:

| Part | Where | Role |
| --- | --- | --- |
| Documentation seed | `.claude/skills/seed-documentation/` | Builds and tops up the documentation account through the GraphQL API |
| Scenes | `.claude/skills/illustrate/scenes/<tab>/<page>.mjs` | One file per docs page, exporting its scenes |
| Runner | `.claude/skills/illustrate/runner/` (own `package.json`, `node_modules` git-ignored) | `capture`, `replay`, `where-used`, `list` |
| Skills | `/illustrate` (new `--batch`, `--replay`), `/release` (step 6 rewritten) | Decide what to shoot, write scenes, place images, report |

Tokens are spent only on judgment: writing a new scene, repairing a broken one, placing images in pages, writing PR notes. Replay and comparison run as plain scripts.

## 2. Data

- **Built through the API only.** `/seed-documentation full` builds the whole company (people, clients, projects, tasks, tags, rates, schedules, time, absences, expenses, budgets), then applies the documentation layer (team hierarchy, Location category, colours, organisation name). Nothing is created by clicking in the app, so the account can always be rebuilt identically.
- **Started from `seed-demo`**, with its bug fixed: `seed-demo` logs time directly on client projects that have sub-projects, which the backend rejects (`timeRecordOnParentProject`), losing about 1,500 of 5,445 entries. The docs seed logs that time on a sub-project. `seed-demo` in reboot is left untouched; the bug is reported separately.
- **When a scene needs more data** (an over-budget project, a pending approval), it goes into the seed, never into the app by hand.
- **Stability rules**, enforced by the seed's `topup` command:
  - time and absences are only added after the last recorded day, up to yesterday; existing entries are never edited or deleted;
  - planning moves forward by adding tasks with future dates; existing tasks never move;
  - top-up runs only when a date-dependent scene is being recaptured.
- **Frozen clock.** Each scene stores its capture date. Replay freezes the browser clock at that date (Playwright `page.clock`). A screen that takes "today" from the server instead of the browser cannot replay identically; such scenes are marked date-dependent.
- **Full reset is a planned event.** Once a timesheet is approved, people can no longer be deleted, so the account cannot be wiped again. `/seed-documentation full` refuses to run on an account that holds approvals. A full reset then means a new QA organisation (QA returns the signup PIN through the API), a full seed, and a full recapture. The procedure is documented in the seed's README, not automated until it is needed. Day to day, the account only grows.
- **Planning top-up is built when the first planning scene needs it**, not before.

## 3. Scenes and runner

- **Scene file:** exports `page` (the `.mdx` path) and `scenes`, each with `id`, `capturedAt` (ISO date), `datesMatter` (boolean), `mode` (`auto` or `guided`), `setup(page, h)` (async, brings the app into the state), and `shots` (list of `{ file, frame }`, where `frame` is `{ type: 'full' }`, `{ type: 'element', locator, pad }`, `{ type: 'clip', x, y, width, height }` or `{ type: 'lens', target, context?, radius? }`). A scene with a lens shot is captured once at DPR 4; its other shots are scaled back to DPR 2, so every published image keeps the same scale.
- **Shared helpers** (`runner/lib/`): sign in, hide Intercom and the Beta badge, park the mouse, wait for the page to settle, frame an element with a margin. The framing rules live there once.
- **Framing rules:** DPR 2 always; full screens at 1440×900 (below 1440 the app hides its sidebar); dialogs and panels as element shots with an even margin; nothing hovered unless the page describes a hover state; no side panel behind a dialog.
- **Scenes leave no trace, enforced by the runner.** The runner answers every GraphQL mutation itself, over the app's WebSocket and over HTTP, so a scene cannot change anything the app saves. Screen-settings saves (last route, open panels, grid or calendar view), which the app sends on every navigation, are dropped silently; any other mutation marks the scene `broken` with the mutation's name. This keeps parallel runs and later replays seeing the same account.
- **Noise control:** every capture uses Playwright's `animations: 'disabled'` and `caret: 'hide'`, waits for network idle, and hides transient toasts along with Intercom and the Beta badge.
- **Finding elements:** by visible label, role, or the app's component tags; never by screen coordinates. Unnamed buttons are reached through the nearest stable anchor and listed in `runner/missing-labels.md`, which feeds the agent-ready work.
- **Sign-in:** through the API in the browser page (`getAccounts` → `requestSignin` returns `debugPin` on QA → `signin`), then the browser storage state is saved in `~/.cache/beebole-docs-screenshots/` (outside git) and reused until it expires, so a PIN email is sent only when a new session is needed.
- **Runner commands:**
  - `capture <scene-id | page> [--preview]`: capture now, write WebP (`cwebp -q 80`, `-q 60` if over 200 KB) into `help/images/`, update the scene's `capturedAt`. With `--preview`, write PNGs to a temp folder and change nothing; this is how scenes are authored, so authoring never depends on the shared MCP browser.
  - `replay [scene-id | page]`: frozen clock, recapture to a temp folder, compare, report `same`, `changed` (pixel count and a difference image), `missing` or `broken` (failing step and the locator it waited for). Writes a JSON report, replaced at start and marked with `error` when the replay cannot start.
  - `where-used <image>`: the pages referencing an image, found by searching `help/`.
  - `list`: every scene and shot with its capture date.
- **Separate browser:** the runner launches Playwright's own pinned Chromium, headless (not the auto-updating system Chrome, whose updates would flag every shot as changed), so it never clashes with the Playwright MCP browser. It runs up to 4 scenes in parallel.
- **Comparison:** both images are decoded with `sharp`; a size change means `changed`; otherwise `pixelmatch` with threshold 0.1 counts differing pixels and reports `changed` above 100 device pixels. The new capture is encoded to WebP with the same settings before comparing, so both sides carry the same compression noise. (Measured on the Tags pilot: replays of runner-made captures differ by 0 pixels, and a one-word label rename by about 1,000, which a 0.5 % share of a full frame, about 26,000 pixels, would have missed.)

## 4. Step 1: batches

`/illustrate --batch` runs one batch of about 15 shots:

1. **Pick** the next shots from the inventory: high, then medium, then low; within a level, the most-visited pages first. Page traffic (90-day views on `/help/*` pages, from whichever PostHog project receives the docs pageviews; verified during implementation) is stored with its date at the top of the inventory and refreshed when older than 30 days. If traffic data is unavailable, pages keep inventory order within a level.
2. **Check** each picked page against its current text: read its sections, add the shots it needs that the inventory lacks, adjust or drop entries that no longer fit, merge entries that show the same screen. Small controls get a lens.
3. **Data:** add whatever the scenes need to the seed; top up only if a scene is date-dependent.
4. **Shoot:** explore the screen once (the headless Playwright MCP when it is free, otherwise `capture --preview` iterations), write the scene, run `capture`, look at the image, adjust.
5. **Place** each image in its page inside a `<Frame>` with a caption and descriptive alt text; run `mintlify broken-links`.
6. **Record:** mark the inventory entry done with its scene id; list guided shots that could not be automated.
7. **Commit and open a PR** showing the new images.

A session that runs out of tokens loses at most the scene in progress: the batch commits as it goes and the inventory shows what is left.

## 5. Step 2: `/release`

Step 6 of `/release` becomes the screenshot step:

1. `replay` of every `auto` scene starts in the background at the beginning of the run.
2. Each `changed` shot is recaptured at today's date (top-up first if date-dependent) and committed as `release: refresh screenshots`.
3. Each `broken` scene gets one repair attempt; if it still fails it is listed under "Scenes to fix".
4. Pages added or rewritten by this release get their screenshot needs identified and captured as new scenes, up to 10 per release; the rest go into the inventory.
5. The PR body gets a Screenshots section: refreshed (with the pages using each image and the difference; above 20 % the note adds "page text may need review"), new, broken, queued, and guided shots to check by hand (only those whose page changed in this release).

**Failures never block the release:** QA down or sign-in failing skips the step with a note; a failing top-up skips only date-dependent scenes; a scene that times out is marked broken and the others continue.

## 6. Testing

- Comparison: an identical image reports `same`; the same capture re-encoded reports `same`; a visible change (a label altered through the DOM) reports `changed`.
- Determinism: replaying a scene right after capturing it reports `same`, twice in a row. Checked on the Tags scenes first.
- End to end on one page: seed and layer, scenes written, capture, placement, replay `same`, a simulated UI change detected as `changed`, and a dry run of the new `/release` step 6 on a test branch.

## Out of scope

Website (commercial) screenshots, feature testing data, CI capture, third-party visual regression services, code-to-screenshot mapping.

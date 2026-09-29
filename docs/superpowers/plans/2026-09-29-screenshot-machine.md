# Screenshot Machine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the documentation seed, the scene runner (capture, replay, compare), the first scenes, and wire them into `/illustrate` and `/release`, then prove it end to end on one page.

**Architecture:** A docs-owned seed (`/seed-documentation`) builds and tops up the AnyCompany QA account through the GraphQL API. Scenes are ES modules, one per docs page, executed by a Node runner that drives its own headless Chrome through Playwright, writes WebP images, and replays scenes with a frozen clock to detect visual changes with `pixelmatch`. Skills (`/illustrate`, `/release`) call the runner and handle the judgment parts.

**Tech Stack:** Node 24 (ES modules), Playwright (Chrome channel, headless), `sharp` (decode), `pixelmatch` (compare), `cwebp` (encode, already required), `node:test` (tests), Beebole GraphQL API on `https://qa.beebole.com/graphql`.

**Spec:** `docs/superpowers/specs/2026-09-29-screenshot-machine-design.md`

## Global Constraints

- Documentation account: organisation `6abb86369d045d1d6a183151` on `qa.beebole.com`, name `AnyCompany`; key `BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY` from `~/.config/beebole/.env`, never on a command line, never printed.
- Every seed write goes through the API and only after `currentOrganisation.id === '6abb86369d045d1d6a183151'` is verified.
- Captures: DPR 2; full frame 1440×900; `animations: 'disabled'`, `caret: 'hide'`; Intercom, Beta badge and toasts hidden; mouse parked.
- Images: `cwebp -q 80`, `-q 60` if over 200 KB; written under `help/images/`; raw PNGs only in the OS temp dir.
- Comparison: `pixelmatch` threshold 0.1; `changed` when differing pixels exceed 0.5 %; size mismatch is `changed`.
- Browser session state lives in `~/.cache/beebole-docs-screenshots/`, never in the repo.
- Scenes never change saved app state; if they must, they restore it in `teardown`.
- Scenes locate elements by label, role, text or component tag, never by coordinates; unnamed controls go in `runner/missing-labels.md`.
- `seed-demo` in `../reboot` is not modified.
- Work on branch `screenshot-machine`; one commit per task; commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- Expired or missing browser session: the runner must sign in again by itself (no manual step) and retry once.
- A scene whose target element never appears: reported `broken` with the scene id and failing step, other scenes continue.
- A shot whose published image does not exist yet: replay reports `missing`, not a crash.
- Tree or panel state that persists between runs (for example an expanded tag stays expanded): expansion helpers must be idempotent, so a second run produces the same image.
- `full` seed on an account that already holds approvals: must refuse before deleting anything.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `.claude/skills/seed-documentation/SKILL.md` | `/seed-documentation` skill: when and how to run each mode |
| `.claude/skills/seed-documentation/README.md` | Account facts, data rules, full-reset procedure |
| `.claude/skills/seed-documentation/seed.mjs` | Copy of reboot `seed-demo.mjs`, adapted (guards, fixes, modes `full` / `topup` / `approve`) |
| `.claude/skills/seed-documentation/layer.mjs` | Documentation layer (moved from `illustrate/scenario/screenshot-layer.mjs`), exports `applyLayer()` |
| `.claude/skills/illustrate/runner/package.json` | Runner dependencies and `npm test` |
| `.claude/skills/illustrate/runner/.gitignore` | `node_modules/` |
| `.claude/skills/illustrate/runner/screenshots.mjs` | CLI: `list`, `capture`, `replay`, `where-used` |
| `.claude/skills/illustrate/runner/lib/paths.mjs` | Repo, scenes, images, cache and temp paths |
| `.claude/skills/illustrate/runner/lib/compare.mjs` | `compareImages()` |
| `.claude/skills/illustrate/runner/lib/webp.mjs` | `encodeWebp()` |
| `.claude/skills/illustrate/runner/lib/session.mjs` | Browser launch, context options, sign-in, storage state |
| `.claude/skills/illustrate/runner/lib/helpers.mjs` | The `h` object given to scenes |
| `.claude/skills/illustrate/runner/lib/scenes.mjs` | Load, validate, filter scenes; update `capturedAt` |
| `.claude/skills/illustrate/runner/lib/shoot.mjs` | Run one scene and produce its PNGs |
| `.claude/skills/illustrate/runner/lib/*.test.mjs` | `node:test` tests |
| `.claude/skills/illustrate/runner/missing-labels.md` | Unnamed controls found while writing scenes |
| `.claude/skills/illustrate/scenes/documentation/tags.mjs` | Tags scenes (3 shots) |
| `.claude/skills/illustrate/scenes/documentation/timesheets.mjs` | Timesheets scenes (end-to-end test page) |
| `.claude/skills/illustrate/SKILL.md` | Add scene rules, `--batch`, `--replay`; drop the old capture-by-hand flow |
| `.claude/skills/release/SKILL.md` | Preflight check, background replay, new step 6, PR section |
| `.todo/screenshot-needs.md` | Traffic header, done markers with scene ids |

---

### Task 1: Documentation seed

**Files:**
- Create: `.claude/skills/seed-documentation/seed.mjs` (from `../reboot/scripts/seed-demo.mjs`)
- Create: `.claude/skills/seed-documentation/layer.mjs` (from `.claude/skills/illustrate/scenario/screenshot-layer.mjs`)
- Create: `.claude/skills/seed-documentation/SKILL.md`, `README.md`
- Delete: `.claude/skills/illustrate/scenario/`

**Interfaces:**
- Produces: `node seed.mjs <full|topup|approve> [--dry-run]`; `node layer.mjs`; `export async function applyLayer()` in `layer.mjs`.

- [ ] **Step 1: Copy and move**

```bash
mkdir -p .claude/skills/seed-documentation
cp ../reboot/scripts/seed-demo.mjs .claude/skills/seed-documentation/seed.mjs
git mv .claude/skills/illustrate/scenario/screenshot-layer.mjs .claude/skills/seed-documentation/layer.mjs
git rm -q .claude/skills/illustrate/scenario/README.md
```

- [ ] **Step 2: Replace the argument/target header of `seed.mjs`** (lines 1–31 of the copy) with:

```js
// Documentation seed: builds and tops up the AnyCompany QA account used for docs screenshots.
// Started from reboot's scripts/seed-demo.mjs (2026-09-29) and adapted; see README.md.
// Usage: node seed.mjs <full|topup|approve> [--dry-run]
//   full    wipe + rebuild (refused once any approval exists), then the documentation layer
//   topup   add time records from the last recorded day up to yesterday, then the layer
//   approve submit/approve history (one-way: the account can no longer be wiped afterwards)
import { applyLayer } from './layer.mjs'

const API_URL = 'https://qa.beebole.com/graphql'
const ORG_ID = '6abb86369d045d1d6a183151'
const API_KEY = process.env.BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY
const args = process.argv.slice(2)
const flags = args.filter((a) => a.startsWith('--'))
const modeArg = args.find((a) => !a.startsWith('--')) || ''
const MODES = { full: 'full', topup: 'append', approve: 'approve' }
if (!API_KEY || !MODES[modeArg]) {
	console.error('Usage: BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY=... node seed.mjs <full|topup|approve> [--dry-run]')
	process.exit(1)
}
const MODE = MODES[modeArg]
const DRY_RUN = flags.includes('--dry-run')
const target = 'qa'
```

Keep the rest of the original header logic that the script relies on (`API_URL` is used by `gql`). Remove the original `TARGETS`, `positional`, `rawArgs` and usage-exit lines.

- [ ] **Step 3: Fix the parent-project bug.** Add above `fillDays`:

```js
// Sales and account-management time was logged on client roots, which the backend now rejects
// (timeRecordOnParentProject). Log it on each client's main engagement instead.
const ACCOUNT_WORK_PROJECT = {
	'Acme Corp': 'Website Redesign',
	'Greenleaf Industries': 'ERP Integration',
	'Northstar Financial': 'Dashboard',
	'Silverline Retail': 'E-commerce Platform',
	'Brightwave Media': 'Web Portal',
	'Quantum Logistics': 'Fleet Tracker',
	'Brand Campaign': 'Video Production',
}
```

and in `fillDays` replace `const clientId = projectMap[a.client]` with:

```js
			const clientId = projectMap[ACCOUNT_WORK_PROJECT[a.client] ?? a.client]
```

- [ ] **Step 4: Guards in `main()`**, first lines of the function:

```js
	const org = await gql('{ currentOrganisation { id name } }')
	if (org?.currentOrganisation?.id !== ORG_ID) {
		console.error(`Refusing: this key reaches ${org?.currentOrganisation?.name ?? 'an unknown organisation'}, not the documentation account.`)
		process.exit(1)
	}
	if (MODE === 'full') {
		const persons = (await gql('{ getPersons { id } }'))?.getPersons || []
		for (const p of persons) {
			const ev = await gql('query($id: BeeboleId!) { getPersonApprovalEvents(personId: $id) { id } }', { id: p.id })
			if (ev?.getPersonApprovalEvents?.length) {
				console.error('Refusing full: approvals exist, so people cannot be deleted. See README "Full reset".')
				process.exit(1)
			}
		}
	}
```

and after each mode finishes successfully (full, append) call `if (!DRY_RUN) await applyLayer()`.

- [ ] **Step 5: Fix the other errors seen on 2026-09-29.** Run `node seed.mjs full --dry-run` is qualitative only, so run a real `full` (account has no approvals yet) and grep the log for `GraphQL error`. For each distinct message (`Cannot query field "resetOrganisationScheduleTypesRelations"`, `RateNotFoundInEntity`, `NameAlreadyInUse`, `scheduleIsAssignedTo`, `timeRecordOnHoliday`), locate the call in `seed.mjs`, read the current mutation in `../reboot/backend/src`, and fix the call (renamed mutation, or skip the record). Rerun `full` until the log has no `GraphQL error`.

- [ ] **Step 6: Layer changes in `layer.mjs`:** export `applyLayer` (wrap the current `main()` body), keep the CLI entry (`if (import.meta.url === \`file://${process.argv[1]}\`) applyLayer()`), and make the offices coherent with the New York company localisation: rename the office `Brussels` to `New York` (if a tag named `Brussels` exists in Location, `editTagName` it to `New York`; the membership list uses `New York`).

- [ ] **Step 7: Verify**

Run: `set -a && source ~/.config/beebole/.env && set +a && node .claude/skills/seed-documentation/seed.mjs full 2>&1 | tee $TMPDIR/seed-full.log | tail -12; grep -c 'GraphQL error' $TMPDIR/seed-full.log`
Expected: `Done`, a time-record total close to 5,445, `0` GraphQL errors, layer lines ending `Screenshot layer applied.`

Run: `node .claude/skills/seed-documentation/seed.mjs topup`
Expected: `Append: already up to date.` then the layer output with no `+`/`-`/`~` lines.

- [ ] **Step 8: Write `SKILL.md` and `README.md`** (content in Task 1 appendix below) and commit.

```bash
git add .claude/skills/seed-documentation .claude/skills/illustrate/scenario
git commit -m "Add /seed-documentation for the docs screenshot account"
```

**Task 1 appendix: `SKILL.md`**

```markdown
---
name: seed-documentation
description: 'Build or top up the AnyCompany QA account used for documentation screenshots. Modes: `full` (wipe and rebuild, refused once approvals exist), `topup` (add time up to yesterday, only by adding), `approve` (one-way). Use before capturing date-dependent screenshots, or when a scene needs data that does not exist yet. Documentation account only.'
---

# Seed documentation

Thin wrapper around `seed.mjs` and `layer.mjs` in this folder. Read `README.md` for the account and the data rules before changing anything.

## Modes

- `topup`: run before recapturing a date-dependent scene. Adds time records from the day after the last one up to yesterday, then re-applies the layer. Never edits or deletes.
- `full`: wipe and rebuild. Only when the account is broken or before the first approvals. The script refuses once approvals exist; then follow "Full reset" in the README.
- `approve`: submit and approve past timesheets. One-way. Run it once, when the first approval scene needs it, and record it in the README.

## Run

    set -a && source ~/.config/beebole/.env && set +a && node .claude/skills/seed-documentation/seed.mjs <mode>

`full` takes about two minutes. The key is read from the environment; never pass it on the command line or print it.

## Adding data for a scene

Add it to `layer.mjs` (idempotent: create if missing, never delete), run `node layer.mjs`, and record it in the README. Never create data by clicking in the app.
```

**Task 1 appendix: `README.md`**

```markdown
# Documentation account

- QA organisation `6abb86369d045d1d6a183151` on `qa.beebole.com`, named AnyCompany (obviously fictional, decided by Yves 2026-09-29). Acme Corp stays an example client, as in the docs.
- Admin: Yves' account, shown in the app as Jordan Reed. Key: `BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY` in `~/.config/beebole/.env`.
- Company profile: a New York based agency (US time zone, USD, 12-hour clock, Sunday-first weeks) with offices in New York, London and Lisbon; divisions Engineering, Design, Sales, each split into teams.

## What builds it

1. `seed.mjs full`: people, clients and projects, tasks, tags, rates, schedules, a year of time, absences, expenses, budgets. Adapted from reboot's `seed-demo.mjs` on 2026-09-29: key from the environment, organisation guard, approval guard, account-management time logged on each client's main engagement.
2. `layer.mjs`: organisation name, Department teams, Location offices, memberships, colours (rules from `claude-plugins/plugins/growth/skills/generate-dummy-data/references/entity-colors.md`).

## Data rules

- Only add. Top-ups add time after the last recorded day; nothing is edited or deleted.
- Planning moves forward by adding tasks with future dates, when the first planning scene needs it.
- Top up only when a date-dependent scene is being recaptured.
- Anything a scene needs goes into `layer.mjs`, never into the app by hand.

## Full reset

Once approvals exist, `full` refuses. A reset then means:
1. Create a new QA organisation through the API (`requestSignup` returns `debugPin` on QA, then `signup`).
2. Create an API key for its admin, store it as `BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY`, update `ORG_ID` in `seed.mjs`, `layer.mjs` and `../illustrate/runner/lib/session.mjs`.
3. `seed.mjs full`, then recapture every scene (`screenshots.mjs capture all`).

## History

- 2026-09-29: created ("Illustrate 2026-09-29"), seeded with seed-demo, layer applied, renamed AnyCompany; rebuilt with `seed.mjs full` after the fixes.
```

---

### Task 2: Runner core (compare, encode, paths) with tests

**Files:**
- Create: `.claude/skills/illustrate/runner/package.json`, `.gitignore`, `lib/paths.mjs`, `lib/compare.mjs`, `lib/webp.mjs`, `lib/compare.test.mjs`

**Interfaces:**
- Produces: `compareImages(publishedPath, candidatePath, { diffPath? }) → Promise<{ status: 'same'|'changed', ratio: number, diffPixels: number, reason?: 'size' }>`; `encodeWebp(pngPath, webpPath) → { quality: 80|60, bytes: number }`; paths `REPO_ROOT`, `SCENES_DIR`, `HELP_DIR`, `IMAGES_DIR`, `CACHE_DIR`, `TMP_DIR`.

- [ ] **Step 1: `package.json` and `.gitignore`**

```json
{
	"name": "beebole-docs-screenshots",
	"private": true,
	"type": "module",
	"scripts": { "test": "node --test lib/" },
	"dependencies": { "pixelmatch": "^7.1.0", "playwright": "^1.55.0", "sharp": "^0.34.0" }
}
```

```
node_modules/
```

Run: `npm install --prefix .claude/skills/illustrate/runner` (versions: use the latest published, check with `npm view <pkg> version`).

- [ ] **Step 2: `lib/paths.mjs`**

```js
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir, tmpdir } from 'node:os'

const here = dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = resolve(here, '../../../../..')
export const SCENES_DIR = join(REPO_ROOT, '.claude/skills/illustrate/scenes')
export const HELP_DIR = join(REPO_ROOT, 'help')
export const IMAGES_DIR = join(HELP_DIR, 'images')
export const CACHE_DIR = join(homedir(), '.cache/beebole-docs-screenshots')
export const TMP_DIR = join(tmpdir(), 'beebole-docs-screenshots')
```

- [ ] **Step 3: Write the failing test `lib/compare.test.mjs`**

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { compareImages } from './compare.mjs'
import { encodeWebp } from './webp.mjs'
import { TMP_DIR } from './paths.mjs'

const dir = join(TMP_DIR, 'test')
mkdirSync(dir, { recursive: true })

async function card(path, { width = 400, height = 200, box = { left: 40, top: 40 }, label = true } = {}) {
	const overlays = [{ input: { create: { width: 120, height: 40, channels: 4, background: '#432dd7' } }, ...box }]
	if (label) overlays.push({ input: { create: { width: 200, height: 12, channels: 4, background: '#364153' } }, left: 40, top: 120 })
	await sharp({ create: { width, height, channels: 4, background: '#ffffff' } }).composite(overlays).png().toFile(path)
	return path
}

test('identical images are the same', async () => {
	const a = await card(join(dir, 'a.png'))
	const r = await compareImages(a, a)
	assert.equal(r.status, 'same')
	assert.equal(r.diffPixels, 0)
})

test('WebP re-encoding noise is ignored', async () => {
	const a = await card(join(dir, 'a.png'))
	const w1 = join(dir, 'a1.webp')
	const w2 = join(dir, 'a2.webp')
	encodeWebp(a, w1)
	encodeWebp(a, w2)
	assert.equal((await compareImages(w1, w2)).status, 'same')
	assert.equal((await compareImages(w1, a)).status, 'same')
})

test('a moved button is a change', async () => {
	const a = await card(join(dir, 'a.png'))
	const b = await card(join(dir, 'b.png'), { box: { left: 220, top: 40 } })
	const r = await compareImages(a, b, { diffPath: join(dir, 'diff.png') })
	assert.equal(r.status, 'changed')
	assert.ok(r.ratio > 0.005)
})

test('a missing label line is a change', async () => {
	const a = await card(join(dir, 'a.png'))
	const b = await card(join(dir, 'c.png'), { label: false })
	assert.equal((await compareImages(a, b)).status, 'changed')
})

test('a size change is a change', async () => {
	const a = await card(join(dir, 'a.png'))
	const b = await card(join(dir, 'd.png'), { width: 402 })
	const r = await compareImages(a, b)
	assert.equal(r.status, 'changed')
	assert.equal(r.reason, 'size')
})

test('large images are encoded under 200 KB', async () => {
	const noisy = join(dir, 'noisy.png')
	const raw = Buffer.alloc(1440 * 900 * 3)
	for (let i = 0; i < raw.length; i++) raw[i] = (i * 2654435761) % 256
	await sharp(raw, { raw: { width: 1440, height: 900, channels: 3 } }).png().toFile(noisy)
	const out = encodeWebp(noisy, join(dir, 'noisy.webp'))
	assert.ok([80, 60].includes(out.quality))
})
```

- [ ] **Step 4: Run it, expect failure** — `npm test --prefix .claude/skills/illustrate/runner` → FAIL (`Cannot find module './compare.mjs'`).

- [ ] **Step 5: `lib/compare.mjs`**

```js
import sharp from 'sharp'
import pixelmatch from 'pixelmatch'

export const THRESHOLD = 0.1
export const MAX_DIFF_RATIO = 0.005

async function decode(path) {
	const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
	return { data, width: info.width, height: info.height }
}

// Compare a published image with a new candidate. Both are decoded to RGBA; WebP noise is
// absorbed by pixelmatch's colour threshold, real changes show up as a share of differing pixels.
export async function compareImages(publishedPath, candidatePath, { diffPath } = {}) {
	const a = await decode(publishedPath)
	const b = await decode(candidatePath)
	if (a.width !== b.width || a.height !== b.height) {
		return { status: 'changed', reason: 'size', ratio: 1, diffPixels: a.width * a.height }
	}
	const diff = diffPath ? Buffer.alloc(a.data.length) : null
	const diffPixels = pixelmatch(a.data, b.data, diff, a.width, a.height, { threshold: THRESHOLD })
	const ratio = diffPixels / (a.width * a.height)
	if (diff && diffPixels > 0) {
		await sharp(diff, { raw: { width: a.width, height: a.height, channels: 4 } }).png().toFile(diffPath)
	}
	return { status: ratio > MAX_DIFF_RATIO ? 'changed' : 'same', ratio, diffPixels }
}
```

- [ ] **Step 6: `lib/webp.mjs`**

```js
import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'

export const MAX_BYTES = 200 * 1024

// Same settings as the rest of the docs pipeline: cwebp -q 80, fall back to -q 60 above 200 KB.
export function encodeWebp(pngPath, webpPath) {
	for (const quality of [80, 60]) {
		execFileSync('cwebp', ['-quiet', '-q', String(quality), pngPath, '-o', webpPath])
		const bytes = statSync(webpPath).size
		if (bytes <= MAX_BYTES || quality === 60) return { quality, bytes }
	}
}
```

- [ ] **Step 7: Run tests, expect PASS** — `npm test --prefix .claude/skills/illustrate/runner` → 6 passing.

- [ ] **Step 8: Commit** — `git add .claude/skills/illustrate/runner && git commit -m "Add screenshot runner core: compare and encode"`

---

### Task 3: Session, helpers, scene loading, shooting, CLI

**Files:**
- Create: `runner/lib/session.mjs`, `runner/lib/helpers.mjs`, `runner/lib/scenes.mjs`, `runner/lib/shoot.mjs`, `runner/lib/scenes.test.mjs`, `runner/screenshots.mjs`, `runner/missing-labels.md`

**Interfaces:**
- Consumes: Task 2 exports.
- Produces:
  - `launchBrowser() → Browser`; `ensureSession(browser) → Promise<void>`; `newContext(browser) → BrowserContext`; `BASE_URL`.
  - `makeHelpers() → h` with `goto(page, path)`, `settle(page)`, `hideChrome(page)`, `parkMouse(page)`, `listRow(page, name)`, `expandRow(page, name, childName)`, `surfaceAround(page, text)`, `boxOf(locator)`.
  - `loadScenes(target?) → Promise<Array<{ file, page, scene }>>` where `target` is `'all'`, a scene id, or a page path; `validateScene(scene, file)`; `setCapturedAt(file, id, date)`.
  - `shootScene(browser, entry, { date, outDir }) → Promise<Array<{ file, png }>>` (throws `SceneError { sceneId, step, message }`).
  - CLI `node screenshots.mjs list | capture <target> [--preview] | replay [target] [--json <path>] | where-used <image>`.

- [ ] **Step 1: Failing test `lib/scenes.test.mjs`**

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { validateScene, setCapturedAt } from './scenes.mjs'
import { TMP_DIR } from './paths.mjs'

const ok = { id: 'x-y', capturedAt: '2026-09-29', datesMatter: false, mode: 'auto', setup: async () => {}, shots: [{ file: 'x/y.webp', frame: { type: 'full' } }] }

test('a valid scene passes', () => assert.doesNotThrow(() => validateScene(ok, 'f.mjs')))
test('bad id is rejected', () => assert.throws(() => validateScene({ ...ok, id: 'X Y' }, 'f.mjs'), /id/))
test('bad date is rejected', () => assert.throws(() => validateScene({ ...ok, capturedAt: '29/09/2026' }, 'f.mjs'), /capturedAt/))
test('shot outside images is rejected', () => assert.throws(() => validateScene({ ...ok, shots: [{ file: '../x.webp', frame: { type: 'full' } }] }, 'f.mjs'), /file/))
test('unknown frame is rejected', () => assert.throws(() => validateScene({ ...ok, shots: [{ file: 'x/y.webp', frame: { type: 'zoom' } }] }, 'f.mjs'), /frame/))

test('setCapturedAt rewrites only the matching scene', () => {
	const dir = join(TMP_DIR, 'test')
	mkdirSync(dir, { recursive: true })
	const f = join(dir, 'scene.mjs')
	writeFileSync(f, "export const scenes = [\n\t{\n\t\tid: 'a',\n\t\tcapturedAt: '2026-01-01',\n\t},\n\t{\n\t\tid: 'b',\n\t\tcapturedAt: '2026-01-01',\n\t},\n]\n")
	setCapturedAt(f, 'b', '2026-09-29')
	const t = readFileSync(f, 'utf8')
	assert.match(t, /id: 'a',\n\t\tcapturedAt: '2026-01-01'/)
	assert.match(t, /id: 'b',\n\t\tcapturedAt: '2026-09-29'/)
	assert.throws(() => setCapturedAt(f, 'zz', '2026-09-29'), /zz/)
})
```

- [ ] **Step 2: Run, expect FAIL** (`Cannot find module './scenes.mjs'`).

- [ ] **Step 3: `lib/scenes.mjs`**

```js
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { SCENES_DIR, REPO_ROOT } from './paths.mjs'

const FRAMES = ['full', 'element', 'box', 'clip']

export function validateScene(s, file) {
	const where = `${relative(REPO_ROOT, file)} → ${s?.id ?? '?'}`
	if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s?.id ?? '')) throw new Error(`${where}: id must be kebab-case`)
	if (!/^\d{4}-\d{2}-\d{2}$/.test(s.capturedAt ?? '')) throw new Error(`${where}: capturedAt must be YYYY-MM-DD`)
	if (typeof s.datesMatter !== 'boolean') throw new Error(`${where}: datesMatter must be true or false`)
	if (!['auto', 'guided'].includes(s.mode)) throw new Error(`${where}: mode must be auto or guided`)
	if (typeof s.setup !== 'function') throw new Error(`${where}: setup must be a function`)
	if (!Array.isArray(s.shots) || s.shots.length === 0) throw new Error(`${where}: shots must be a non-empty list`)
	for (const shot of s.shots) {
		if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*\.webp$/.test(shot.file ?? '')) throw new Error(`${where}: shot file must be a relative .webp path under help/images`)
		if (!FRAMES.includes(shot.frame?.type)) throw new Error(`${where}: frame type must be one of ${FRAMES.join(', ')}`)
	}
}

function sceneFiles(dir = SCENES_DIR) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
		d.isDirectory() ? sceneFiles(join(dir, d.name)) : d.name.endsWith('.mjs') ? [join(dir, d.name)] : []
	)
}

export async function loadScenes(target = 'all') {
	const entries = []
	const ids = new Set()
	for (const file of sceneFiles()) {
		const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`)
		for (const scene of mod.scenes) {
			validateScene(scene, file)
			if (ids.has(scene.id)) throw new Error(`Duplicate scene id ${scene.id}`)
			ids.add(scene.id)
			entries.push({ file, page: mod.page, scene })
		}
	}
	if (target === 'all') return entries
	const picked = entries.filter((e) => e.scene.id === target || e.page === target || e.page === `help/${target}`)
	if (!picked.length) throw new Error(`No scene or page matches "${target}"`)
	return picked
}

// Scenes keep `id` and `capturedAt` on consecutive lines, which is what makes this rewrite safe.
export function setCapturedAt(file, id, date) {
	const text = readFileSync(file, 'utf8')
	const re = new RegExp(`(id: '${id}',\\s*\\n\\s*capturedAt: ')\\d{4}-\\d{2}-\\d{2}(')`)
	if (!re.test(text)) throw new Error(`capturedAt for ${id} not found in ${file}`)
	writeFileSync(file, text.replace(re, `$1${date}$2`))
}
```

- [ ] **Step 4: Run tests, expect PASS.**

- [ ] **Step 5: `lib/session.mjs`**

```js
import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { CACHE_DIR } from './paths.mjs'

export const BASE_URL = 'https://qa.beebole.com'
export const ORG_ID = '6abb86369d045d1d6a183151'
const EMAIL = 'yves@beebole.com'
const STATE = join(CACHE_DIR, 'storage-state.json')
export const VIEWPORT = { width: 1440, height: 900 }

export async function launchBrowser() {
	try {
		return await chromium.launch({ channel: 'chrome', headless: true })
	} catch {
		return await chromium.launch({ headless: true })
	}
}

export async function newContext(browser) {
	return browser.newContext({
		viewport: VIEWPORT,
		deviceScaleFactor: 2,
		locale: 'en-US',
		timezoneId: 'America/New_York',
		storageState: existsSync(STATE) ? STATE : undefined,
	})
}

// Sign in through the API from inside the page (QA returns the PIN), then keep the cookies so
// later runs skip it: each sign-in also emails the PIN to the account owner.
async function signIn(page) {
	await page.goto(`${BASE_URL}/signin`)
	const result = await page.evaluate(
		async ({ email, orgId }) => {
			let csrf = ''
			const gq = async (query, variables) =>
				(await fetch('/graphql', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json', csrftoken: csrf }, body: JSON.stringify({ query, variables }) })).json()
			csrf = (await gq('{ currentSession { csrftoken } }')).data?.currentSession?.csrftoken || ''
			const accounts = (await gq('query($e: BeeboleEmail!) { getAccounts(email: $e) { id organisationId } }', { e: email })).data?.getAccounts || []
			const account = accounts.find((a) => a.organisationId === orgId)
			if (!account) return 'no account for the documentation organisation'
			const pin = (await gq('mutation($e: BeeboleEmail!, $a: BeeboleId) { requestSignin(email: $e, accountId: $a) { debugPin } }', { e: email, a: account.id })).data?.requestSignin?.debugPin
			if (!pin) return 'no debug PIN returned'
			const res = await gq('mutation($p: Int!) { signin(pin: $p) { expire { ts } } }', { p: pin })
			return res.errors ? res.errors[0].message : 'ok'
		},
		{ email: EMAIL, orgId: ORG_ID }
	)
	if (result !== 'ok') throw new Error(`Sign-in failed: ${result}`)
}

export async function ensureSession(browser) {
	mkdirSync(CACHE_DIR, { recursive: true })
	for (let attempt = 0; attempt < 2; attempt++) {
		const context = await newContext(browser)
		const page = await context.newPage()
		await page.goto(`${BASE_URL}/persons`)
		await page.waitForLoadState('networkidle').catch(() => {})
		const signedIn = !page.url().includes('/signin')
		const org = signedIn ? await page.evaluate(() => window.intercomSettings?.company?.id ?? null).catch(() => null) : null
		if (signedIn && (org === null || org === ORG_ID)) {
			await context.storageState({ path: STATE })
			await context.close()
			return
		}
		await signIn(page)
		await context.storageState({ path: STATE })
		await context.close()
	}
}
```

- [ ] **Step 6: `lib/helpers.mjs`** (toast selector: check the app's toast component tag in `../reboot/frontend/src/components/shared` and add it to `HIDE_CSS`)

```js
import { BASE_URL, VIEWPORT } from './session.mjs'

export const HIDE_CSS =
	'[class*="intercom" i],[id*="intercom" i],iframe[name*="intercom" i],beta-badge{display:none !important;visibility:hidden !important;}'

export function makeHelpers() {
	const h = {
		async goto(page, path) {
			await page.goto(`${BASE_URL}${path}`)
			await page.waitForLoadState('networkidle').catch(() => {})
			await h.settle(page)
		},
		async settle(page, ms = 800) {
			await page.evaluate(() => document.fonts.ready)
			await page.waitForTimeout(ms)
		},
		async hideChrome(page) {
			await page.addStyleTag({ content: HIDE_CSS })
		},
		async parkMouse(page) {
			await page.mouse.move(VIEWPORT.width - 4, VIEWPORT.height - 4)
		},
		listRow(page, name) {
			return page.getByRole('listitem').filter({ has: page.getByText(name, { exact: true }) }).first()
		},
		// Idempotent: expands only when the child is not visible yet, so a remembered expansion
		// does not get collapsed by a second run.
		async expandRow(page, name, childName) {
			if (await page.getByText(childName, { exact: true }).first().isVisible()) return
			await h.listRow(page, name).getByRole('button').first().click()
			await page.getByText(childName, { exact: true }).first().waitFor()
		},
		// Box of the nearest opaque white surface around a text (a dialog, a popup).
		async surfaceAround(page, text) {
			return page.evaluate((t) => {
				const leaf = [...document.querySelectorAll('body *')].find((e) => e.childElementCount === 0 && e.textContent.trim() === t)
				let el = leaf
				while (el && getComputedStyle(el).backgroundColor !== 'rgb(255, 255, 255)') el = el.parentElement
				if (!el) return null
				const r = el.getBoundingClientRect()
				return { x: r.x, y: r.y, width: r.width, height: r.height }
			}, text)
		},
		async boxOf(locator) {
			return locator.boundingBox()
		},
	}
	return h
}
```

- [ ] **Step 7: `lib/shoot.mjs`**

```js
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { newContext, VIEWPORT } from './session.mjs'
import { makeHelpers } from './helpers.mjs'

export class SceneError extends Error {
	constructor(sceneId, step, message) {
		super(`${sceneId} [${step}]: ${message}`)
		this.sceneId = sceneId
		this.step = step
	}
}

function clamp(r, pad = 0) {
	const x = Math.max(0, Math.round(r.x - pad))
	const y = Math.max(0, Math.round(r.y - pad))
	return {
		x,
		y,
		width: Math.min(VIEWPORT.width - x, Math.round(r.width + 2 * pad)),
		height: Math.min(VIEWPORT.height - y, Math.round(r.height + 2 * pad)),
	}
}

async function clipFor(page, h, frame) {
	if (frame.type === 'full') return undefined
	if (frame.type === 'clip') return clamp(frame)
	const box = frame.type === 'element' ? await frame.locate(page).boundingBox() : await frame.box(page, h)
	if (!box) throw new Error('frame target not found')
	return clamp(box, frame.pad ?? 0)
}

// The clock is frozen at noon New York time on `date`, for captures and replays alike, so a
// replay renders the same "today" as the original capture.
export async function shootScene(browser, { scene }, { date, outDir }) {
	mkdirSync(outDir, { recursive: true })
	const context = await newContext(browser)
	const page = await context.newPage()
	const h = makeHelpers()
	let step = 'clock'
	try {
		await page.clock.setFixedTime(new Date(`${date}T16:00:00Z`))
		step = 'setup'
		await scene.setup(page, h)
		step = 'frame'
		await h.hideChrome(page)
		await h.parkMouse(page)
		await h.settle(page, 400)
		const out = []
		for (const shot of scene.shots) {
			step = `shot ${shot.file}`
			const png = join(outDir, shot.file.replaceAll('/', '__').replace(/\.webp$/, '.png'))
			await page.screenshot({ path: png, clip: await clipFor(page, h, shot.frame), scale: 'device', animations: 'disabled', caret: 'hide' })
			out.push({ file: shot.file, png })
		}
		return out
	} catch (e) {
		throw new SceneError(scene.id, step, e.message.split('\n')[0])
	} finally {
		if (scene.teardown) await scene.teardown(page, h).catch(() => {})
		await context.close()
	}
}
```

- [ ] **Step 8: `screenshots.mjs`** (CLI)

```js
#!/usr/bin/env node
// Docs screenshot runner. See ../SKILL.md.
//   list                              every scene and shot with its capture date
//   capture <all|scene-id|page> [--preview]
//   replay [all|scene-id|page] [--json <path>]
//   where-used <image path under help/images>
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { loadScenes, setCapturedAt } from './lib/scenes.mjs'
import { launchBrowser, ensureSession } from './lib/session.mjs'
import { shootScene } from './lib/shoot.mjs'
import { encodeWebp } from './lib/webp.mjs'
import { compareImages } from './lib/compare.mjs'
import { IMAGES_DIR, HELP_DIR, REPO_ROOT, TMP_DIR } from './lib/paths.mjs'

const [cmd, ...rest] = process.argv.slice(2)
const flag = (name) => rest.includes(name)
const option = (name) => (rest.includes(name) ? rest[rest.indexOf(name) + 1] : undefined)
const positional = rest.filter((a, i) => !a.startsWith('--') && !(i > 0 && rest[i - 1] === '--json'))

function today() {
	return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

async function pool(items, size, fn) {
	const results = []
	let next = 0
	await Promise.all(
		Array.from({ length: Math.min(size, items.length) }, async () => {
			while (next < items.length) {
				const i = next++
				results[i] = await fn(items[i])
			}
		})
	)
	return results
}

export function whereUsed(file) {
	try {
		const out = execFileSync('grep', ['-rl', '--include=*.mdx', `/help/images/${file}`, HELP_DIR], { encoding: 'utf8' })
		return out.trim().split('\n').filter(Boolean).map((p) => relative(REPO_ROOT, p))
	} catch {
		return []
	}
}

async function list() {
	for (const { page, scene } of await loadScenes()) {
		console.log(`${scene.id}\t${scene.capturedAt}\t${scene.mode}${scene.datesMatter ? '\tdates' : ''}\t${page}`)
		for (const s of scene.shots) console.log(`    ${s.file}`)
	}
}

async function capture(target, preview) {
	const entries = (await loadScenes(target)).filter((e) => e.scene.mode === 'auto' || e.scene.id === target)
	const date = today()
	const outDir = join(TMP_DIR, preview ? 'preview' : 'capture')
	const browser = await launchBrowser()
	await ensureSession(browser)
	let failed = 0
	for (const entry of entries) {
		try {
			const shots = await shootScene(browser, entry, { date, outDir })
			for (const { file, png } of shots) {
				if (preview) {
					console.log(`preview ${entry.scene.id}: ${png}`)
					continue
				}
				const dest = join(IMAGES_DIR, file)
				mkdirSync(dirname(dest), { recursive: true })
				const { quality, bytes } = encodeWebp(png, dest)
				console.log(`captured ${file} (${Math.round(bytes / 1024)} KB, q${quality})`)
			}
			if (!preview) setCapturedAt(entry.file, entry.scene.id, date)
		} catch (e) {
			failed++
			console.error(`broken ${e.message}`)
		}
	}
	await browser.close()
	process.exitCode = failed ? 1 : 0
}

async function replay(target, jsonPath) {
	const entries = (await loadScenes(target)).filter((e) => e.scene.mode === 'auto')
	const outDir = join(TMP_DIR, 'replay')
	const browser = await launchBrowser()
	await ensureSession(browser)
	const report = { date: today(), scenes: [] }
	const rows = await pool(entries, 4, async (entry) => {
		const row = { id: entry.scene.id, page: entry.page, capturedAt: entry.scene.capturedAt, datesMatter: entry.scene.datesMatter, shots: [] }
		try {
			const shots = await shootScene(browser, entry, { date: entry.scene.capturedAt, outDir })
			for (const { file, png } of shots) {
				const published = join(IMAGES_DIR, file)
				if (!existsSync(published)) {
					row.shots.push({ file, status: 'missing', usedOn: whereUsed(file) })
					continue
				}
				const candidate = png.replace(/\.png$/, '.webp')
				encodeWebp(png, candidate)
				const diffPath = png.replace(/\.png$/, '.diff.png')
				const r = await compareImages(published, candidate, { diffPath })
				row.shots.push({ file, status: r.status, ratio: Number(r.ratio.toFixed(4)), reason: r.reason, candidate: png, diff: r.diffPixels ? diffPath : undefined, usedOn: whereUsed(file) })
			}
			row.status = row.shots.some((s) => s.status !== 'same') ? 'changed' : 'same'
		} catch (e) {
			row.status = 'broken'
			row.error = e.message
		}
		return row
	})
	report.scenes = rows
	await browser.close()
	const path = jsonPath ?? join(TMP_DIR, 'replay-report.json')
	mkdirSync(dirname(path), { recursive: true })
	writeFileSync(path, JSON.stringify(report, null, 2))
	for (const r of rows) {
		if (r.status === 'broken') console.log(`broken   ${r.id}: ${r.error}`)
		else for (const s of r.shots) console.log(`${s.status.padEnd(8)} ${s.file}${s.ratio ? ` (${(s.ratio * 100).toFixed(2)} %)` : ''}`)
	}
	console.log(`report: ${path}`)
}

const commands = {
	list: () => list(),
	capture: () => capture(positional[0] ?? 'all', flag('--preview')),
	replay: () => replay(positional[0] ?? 'all', option('--json')),
	'where-used': () => console.log(whereUsed(positional[0]).join('\n') || '(not used)'),
}
if (!commands[cmd]) {
	console.error('Usage: screenshots.mjs list | capture <target> [--preview] | replay [target] [--json path] | where-used <image>')
	process.exit(1)
}
await commands[cmd]()
```

- [ ] **Step 9: `missing-labels.md`**

```markdown
# Unnamed controls found while writing scenes

Controls without an accessible name force scenes onto structural anchors. Each line: page, control, how the scene reaches it. Feeds the agent-ready work in reboot.

| Screen | Control | Scene workaround |
| --- | --- | --- |
| Tags | Category settings gear next to the category name | second button in the heading container |
| Tags | Expand/collapse arrow on a tag row | first button in the row |
| Tags | Row action buttons (⋯, +) | not used |
```

- [ ] **Step 10: Smoke test** — `node .claude/skills/illustrate/runner/screenshots.mjs list` prints nothing and exits 0 (no scenes yet; create an empty `scenes/` dir with `.gitkeep`). `npm test` passes.

- [ ] **Step 11: Commit** — `git commit -m "Add screenshot runner: session, scenes, capture, replay"`

---

### Task 4: Tags scenes and determinism

**Files:**
- Create: `.claude/skills/illustrate/scenes/documentation/tags.mjs`

- [ ] **Step 1: Write the scenes**

```js
// Scenes for help/documentation/tags.mdx.
export const page = 'help/documentation/tags.mdx'

const expandAll = async (page, h) => {
	await h.expandRow(page, 'Design', 'Brand & Content')
	await h.expandRow(page, 'Engineering', 'Frontend')
	await h.expandRow(page, 'Sales', 'Account Management')
}

export const scenes = [
	{
		id: 'tags-list',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/tags')
			await expandAll(page, h)
			await page.getByText('Engineering', { exact: true }).first().click()
			await page.getByText('Absence allowances').first().waitFor()
			await h.settle(page)
		},
		shots: [{ file: 'tags/tags-list.webp', frame: { type: 'full' } }],
	},
	{
		id: 'tags-level-names-dialog',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/tags')
			// Unnamed gear button: second button next to the "Tags:" heading (see missing-labels.md).
			await page.getByRole('heading', { name: 'Tags:' }).locator('xpath=..').getByRole('button').nth(1).click()
			await page.getByText('Level names', { exact: true }).waitFor()
			await h.settle(page)
		},
		shots: [{ file: 'tags/tags-level-names-dialog.webp', frame: { type: 'box', box: (page, h) => h.surfaceAround(page, 'Level names'), pad: 24 } }],
	},
	{
		id: 'tags-person-panel',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByText('Elena Rossi', { exact: true }).first().click()
			await page.getByText('Tags', { exact: true }).last().click()
			await page.getByPlaceholder('Add a tag here').waitFor()
			await h.settle(page)
		},
		// From just below the panel header to just below the "Add a tag here" field.
		shots: [
			{
				file: 'tags/tags-person-panel.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const heading = await page.getByText('Tags', { exact: true }).last().boundingBox()
						const input = await page.getByPlaceholder('Add a tag here').boundingBox()
						return { x: 884, y: heading.y - 17, width: 540, height: input.y + input.height - heading.y + 42 }
					},
				},
			},
		],
	},
]
```

- [ ] **Step 2: Replay against the images published in PR #33** — `node runner/screenshots.mjs replay help/documentation/tags.mdx`. Expected: 3 × `same`. If a shot is `changed`, open the candidate PNG and the diff, adjust the scene (framing, state, helper) and rerun until `same` or until the difference is explained by the data rebuild in Task 1 (new office name, rebuilt data); in that case run `capture help/documentation/tags.mdx` and accept the new images.

- [ ] **Step 3: Determinism** — run `replay help/documentation/tags.mdx` twice more. Expected: `same` both times.

- [ ] **Step 4: Change detection** — temporarily add to the `tags-list` setup `await page.evaluate(() => { for (const p of document.querySelectorAll('p')) if (p.textContent === 'Engineering') p.textContent = 'Engineering team' })`, run replay, expect `changed`; remove the line, replay, expect `same`.

- [ ] **Step 5: Commit** — `git commit -m "Add Tags scenes"`

---

### Task 5: Skills and inventory

**Files:**
- Modify: `.claude/skills/illustrate/SKILL.md`, `.claude/skills/release/SKILL.md`, `.todo/screenshot-needs.md`

- [ ] **Step 1: Verify where docs pageviews land.** Query PostHog (MCP `exec`, `execute-sql`) in project 2728 for `$pageview` events with `properties.$current_url LIKE '%/help/%'` over 90 days, grouped by path. If empty, try project 39108. Record which project holds them.

- [ ] **Step 2: `/illustrate` SKILL.md.** Add a "Scenes (mandatory)" section after "Capture spec": every docs capture is a scene in `scenes/<tab>/<page>.mjs` run by `runner/screenshots.mjs`; describe the scene fields, the helper object, framing rules, the no-trace rule, the missing-labels list; authoring loop (`capture --preview`, look, adjust, `capture`). Add modes `--batch` (the seven steps of spec section 4, traffic query from Step 1, 15 shots, one PR per batch) and `--replay` (run `replay`, summarise). Replace the old MCP-by-hand capture steps for docs mode with the runner; keep `--commercial`, `--optimize`, `--arcade` unchanged. Update prerequisites: runner `npm install`, QA reachable, no local app needed.

- [ ] **Step 3: `/release` SKILL.md.** Preflight: add "QA reachable and runner installed (`npm ls --prefix .claude/skills/illustrate/runner` exits 0); failure here only disables step 6". At the start of step 3, start `node .claude/skills/illustrate/runner/screenshots.mjs replay --json .todo/replay-report.json` in the background. Replace step 6 with `/illustrate --release`: read the report, `seed-documentation topup` if any changed scene has `datesMatter`, `capture` each changed scene, one repair attempt per broken scene, needs for pages changed in this release captured as new scenes (max 10), the rest appended to the inventory; commit `release: refresh screenshots`. Add the "Screenshots" PR section (refreshed with pages and %, over 20 % flagged, new, broken, queued, guided for changed pages). Remove "identify only — never attempt capture". Add `.todo/replay-report.json` to `.gitignore`.

- [ ] **Step 4: Inventory.** Add a "Traffic" block at the top (source project, date, top pages with views); mark the Tags entries: `tag-tree-categories` and `tag-cascade-panels` → done by `tags-list`; `who-or-what-tagged-panel` stays open; add the person-panel and level-names shots as done.

- [ ] **Step 5: Commit** — `git commit -m "Wire scenes into /illustrate and /release"`

---

### Task 6: End-to-end test on the Timesheets page

**Files:**
- Create: `.claude/skills/illustrate/scenes/documentation/timesheets.mjs`
- Modify: `help/documentation/timesheets.mdx`, `.todo/screenshot-needs.md`

- [ ] **Step 1: Explore** the timesheet screen with `capture --preview` iterations (or the MCP browser when free): the weekly grid for Jordan Reed on a recent full week, and an entry's detail popover.
- [ ] **Step 2: Write two scenes**: `timesheets-weekly-grid` (full, `datesMatter: true`) and `timesheets-entry-details` (popover, element/box frame, `datesMatter: true`).
- [ ] **Step 3: Top-up then capture**: `seed.mjs topup`, then `capture help/documentation/timesheets.mdx`; look at both images; iterate until they are right.
- [ ] **Step 4: Place** both images in `timesheets.mdx` (Frame, caption, alt), run `mintlify broken-links`, mark the inventory entries done.
- [ ] **Step 5: Replay twice**: expect `same` for all five shots (Tags and Timesheets), which proves the frozen clock on a date-dependent screen.
- [ ] **Step 6: Release dry run** on a throwaway branch: simulate a UI change (edit one published WebP by re-encoding the tags-list shot with a 60 px white band over the sidebar via `sharp`), run the new step 6 logic (replay → changed → capture → commit), check the PR section text is produced; then delete the branch. Nothing is pushed.
- [ ] **Step 7: Commit** — `git commit -m "Illustrate the Timesheets page with scenes"`, push the branch, open the PR.

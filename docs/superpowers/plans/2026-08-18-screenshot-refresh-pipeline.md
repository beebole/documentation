# Screenshot Refresh Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make docs screenshots reproducible and cheaply refreshable: a manifest records every shot's capture recipe, and `/illustrate --refresh` re-captures, diffs, and replaces only what visibly changed.

**Architecture:** A YAML manifest (`docs/screenshot-manifest.yaml`) is the single interface between "what a screenshot shows" and "who captures it". `/illustrate` appends an entry on every docs capture; a new `--refresh` mode replays `auto` entries against the running app with a frozen clock, gates replacement behind a tolerant pixel-diff script, and hands `guided`/`manual` entries to the operator as a checklist. `/release` cross-references changed pages against the manifest in its PR body (identify-only — release never captures).

**Tech Stack:** Bash + `dwebp`/`cwebp` (already required) + Python 3 stdlib (no Pillow/ImageMagick/PyYAML — the manifest is read by Claude, not parsed by scripts). Skill logic lives in markdown skill files, per this repo's convention.

**Spec:** `docs/superpowers/specs/2026-08-18-screenshot-refresh-design.md`

## Global Constraints

- Capture spec is locked (from `/illustrate`): DPR 2; full = 1440×900, element = locator screenshot or ~1024 wide, mobile = 390×844; hide Intercom + `<beta-badge>` before every shot.
- Docs images: WebP `cwebp -q 80`, under 200 KB (drop to `-q 60` if over), placed in `help/images/<section>/`.
- Raw captures never touch the repo working tree — always `/tmp/bb-shots/`.
- `docs/` is internal (not published by Mintlify) — the manifest lives there.
- No new hard dependencies beyond what the README already installs (`webp`, `python3`).
- All work on a feature branch; conventional-ish commit messages matching repo history (`release: …`, plain imperative otherwise).

---

### Task 0: Branch

**Files:** none

- [ ] **Step 1: Create the branch**

```bash
cd /Users/yves/Documents/GitHub/documentation
git switch main && git pull --ff-only
git switch -c docs/screenshot-refresh-pipeline
```

---

### Task 1: Screenshot manifest — format + backfill of the 5 existing shots

**Files:**
- Create: `docs/screenshot-manifest.yaml`

**Interfaces:**
- Produces: the manifest schema every later task reads/writes — fields `file`, `page`, `type`, `url`, `element`, `state`, `mode`, `captured`; globals `clock`, `account`. `mode` values: `auto` | `guided` | `manual`.

- [ ] **Step 1: Write the manifest with schema docs + backfilled entries**

Create `docs/screenshot-manifest.yaml` with exactly this content:

```yaml
# Screenshot manifest — one entry per docs screenshot on disk.
# Written by /illustrate on every docs capture; consumed by /illustrate --refresh.
# Internal file: docs/ is not published by Mintlify.
#
# Global capture contract (applies to every `mode: auto` refresh capture):
#   clock:   frozen browser time — install with page.clock.install({ time }) at the
#            start of the session, so date-dependent UI (timesheet weeks, "today"
#            markers) renders identically on every run.
#   account: the seeded demo account every shot is taken against.
#
# Per-shot fields:
#   file:     path under help/images/
#   page:     the .mdx page that embeds it
#   type:     full (1440x900) | element (locator screenshot) | mobile (390x844)
#   url:      app route to navigate to, relative to the app origin (null if n/a)
#   element:  selector for type: element — prefer semantic web-component tags
#             (e.g. timesheet-main, .timesheetPopup); null otherwise
#   state:    data/UI state that must be true before capture — imperative prose a
#             future session can act on ("open the entry popover on a filled cell")
#   mode:     auto   — navigation + state fully scriptable; refreshed in batch
#             guided — operator sets up state; Playwright frames and captures
#             manual — hand-composed (e.g. marketing hero); refreshed by hand
#   captured: date of the capture currently on disk (YYYY-MM-DD)

clock: 2026-06-03T10:00:00  # a Wednesday; keep aligned with the seeded account's data week
account: >-
  Seeded demo account — Acme Corp client, Clients/Internal/Activities project
  categories, at least one budget over threshold and one pending approval
  (see .todo/screenshot-needs.md capture spec).

shots:
  - file: index-beebole-documentation.webp
    page: help/index.mdx
    type: full
    url: null
    element: null
    state: Hand-composed landing hero, not a plain app capture.
    mode: manual
    captured: 2026-03-05

  - file: integrations/asana-connect.webp
    page: help/integrations/asana.mdx
    type: element
    url: null  # backfilled entry — record the real route on first refresh
    element: null
    state: Integrations settings open, Asana tile showing its Connect button.
    mode: guided
    captured: 2026-03-05

  - file: integrations/asana-params.webp
    page: help/integrations/asana.mdx
    type: element
    url: null  # backfilled entry — record the real route on first refresh
    element: null
    state: Asana connected; the import parameters dialog open.
    mode: guided
    captured: 2026-03-05

  - file: integrations/asana-updating.webp
    page: help/integrations/asana.mdx
    type: element
    url: null  # backfilled entry — record the real route on first refresh
    element: null
    state: Asana import running, progress/updating indicator visible.
    mode: guided
    captured: 2026-03-05

  - file: integrations/asana-validate.webp
    page: help/integrations/asana.mdx
    type: full
    url: null  # backfilled entry — record the real route on first refresh
    element: null
    state: Projects page showing the imported Asana category tree.
    mode: guided
    captured: 2026-03-05
```

- [ ] **Step 2: Verify every `file:` exists on disk and every image on disk has an entry**

```bash
cd /Users/yves/Documents/GitHub/documentation
grep 'file:' docs/screenshot-manifest.yaml | awk '{print "help/images/"$3}' | xargs ls -la
find help/images -name '*.webp' -not -path '*/legacy/*' | wc -l   # expect 5
```

Expected: all 5 paths list successfully; count is 5 (legacy is a frozen archive and intentionally has no manifest entries).

- [ ] **Step 3: Commit**

```bash
git add docs/screenshot-manifest.yaml
git commit -m "Add screenshot manifest with backfilled entries"
```

---

### Task 2: Tolerant diff script

**Files:**
- Create: `.claude/scripts/diff-screenshots.sh`

**Interfaces:**
- Consumes: two `.webp` paths as `$1` (old, on disk) and `$2` (new candidate).
- Produces: stdout `SAME <pct>%` or `CHANGED <pct>%` (or `CHANGED dimensions WxH -> WxH`); exit 0 = SAME, 1 = CHANGED, 2 = usage/decode error. Task 4's `--refresh` workflow calls it exactly as `bash .claude/scripts/diff-screenshots.sh <old> <new>`.

- [ ] **Step 1: Write the script**

Create `.claude/scripts/diff-screenshots.sh`:

```bash
#!/usr/bin/env bash
# Perceptual compare of two WebP screenshots.
# Usage: diff-screenshots.sh <old.webp> <new.webp>
# Prints SAME/CHANGED + differing-pixel percentage.
# Exit: 0 = SAME, 1 = CHANGED, 2 = usage or decode error.
#
# Tolerances: a sampled pixel counts as different when any RGB channel differs
# by more than 8/255 (absorbs WebP re-encode + anti-aliasing noise); the image
# counts as CHANGED when more than 0.5% of sampled pixels differ.
set -euo pipefail

[ $# -eq 2 ] || { echo "usage: $0 <old.webp> <new.webp>" >&2; exit 2; }
command -v dwebp >/dev/null || { echo "dwebp not found — brew install webp" >&2; exit 2; }

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
dwebp -quiet "$1" -ppm -o "$tmp/old.ppm" || exit 2
dwebp -quiet "$2" -ppm -o "$tmp/new.ppm" || exit 2

python3 - "$tmp/old.ppm" "$tmp/new.ppm" <<'PY'
import sys

def read_ppm(path):
    with open(path, "rb") as f:
        if f.readline().strip() != b"P6":
            sys.exit(2)
        tokens = []
        while len(tokens) < 3:
            line = f.readline()
            if not line or line.startswith(b"#"):
                continue
            tokens += line.split()
        w, h = int(tokens[0]), int(tokens[1])
        return w, h, f.read()

ow, oh, old = read_ppm(sys.argv[1])
nw, nh, new = read_ppm(sys.argv[2])

if (ow, oh) != (nw, nh):
    print(f"CHANGED dimensions {ow}x{oh} -> {nw}x{nh}")
    sys.exit(1)

if old == new:
    print("SAME 0.00%")
    sys.exit(0)

TOL, STEP = 8, 4  # per-channel tolerance; sample every 4th pixel
npx = ow * oh
total = diff = 0
for p in range(0, npx, STEP):
    i = p * 3
    if (abs(old[i] - new[i]) > TOL
            or abs(old[i + 1] - new[i + 1]) > TOL
            or abs(old[i + 2] - new[i + 2]) > TOL):
        diff += 1
    total += 1

ratio = diff / total
changed = ratio > 0.005
print(f"{'CHANGED' if changed else 'SAME'} {ratio * 100:.2f}%")
sys.exit(1 if changed else 0)
PY
```

Then `chmod +x .claude/scripts/diff-screenshots.sh`.

- [ ] **Step 2: Test — identical input is SAME**

```bash
cd /Users/yves/Documents/GitHub/documentation
bash .claude/scripts/diff-screenshots.sh \
  help/images/integrations/asana-connect.webp \
  help/images/integrations/asana-connect.webp; echo "exit=$?"
```

Expected: `SAME 0.00%`, `exit=0`.

- [ ] **Step 3: Test — re-encode noise is SAME**

A lossy round-trip simulates the pixel noise a fresh capture of an unchanged screen produces:

```bash
mkdir -p /tmp/bb-shots
dwebp -quiet help/images/integrations/asana-connect.webp -ppm -o /tmp/bb-shots/a.ppm
cwebp -quiet -q 50 /tmp/bb-shots/a.ppm -o /tmp/bb-shots/requant.webp
bash .claude/scripts/diff-screenshots.sh \
  help/images/integrations/asana-connect.webp /tmp/bb-shots/requant.webp; echo "exit=$?"
```

Expected: `SAME <n>%` with n well under 0.5, `exit=0`. If it reports CHANGED, the tolerance is wrong — stop and fix before proceeding.

- [ ] **Step 4: Test — real content change is CHANGED**

Invert a 200×200 block (a proxy for a UI element that moved or was redesigned):

```bash
python3 - <<'PY'
src = "/tmp/bb-shots/a.ppm"
with open(src, "rb") as f:
    assert f.readline().strip() == b"P6"
    w, h = map(int, f.readline().split())
    maxval = f.readline()
    raster = bytearray(f.read())
for y in range(min(200, h)):
    for x in range(min(200, w)):
        i = (y * w + x) * 3
        raster[i:i+3] = bytes(255 - b for b in raster[i:i+3])
with open("/tmp/bb-shots/mutated.ppm", "wb") as f:
    f.write(b"P6\n%d %d\n" % (w, h) + maxval + raster)
PY
cwebp -quiet -q 80 /tmp/bb-shots/mutated.ppm -o /tmp/bb-shots/mutated.webp
bash .claude/scripts/diff-screenshots.sh \
  help/images/integrations/asana-connect.webp /tmp/bb-shots/mutated.webp; echo "exit=$?"
```

Expected: `CHANGED <n>%` with n above 0.5, `exit=1`.

- [ ] **Step 5: Test — dimension mismatch is CHANGED**

```bash
cwebp -quiet -q 80 -crop 0 0 300 200 /tmp/bb-shots/a.ppm -o /tmp/bb-shots/cropped.webp
bash .claude/scripts/diff-screenshots.sh \
  help/images/integrations/asana-connect.webp /tmp/bb-shots/cropped.webp; echo "exit=$?"
```

Expected: `CHANGED dimensions …`, `exit=1`.

- [ ] **Step 6: Commit**

```bash
git add .claude/scripts/diff-screenshots.sh
git commit -m "Add tolerant screenshot diff script"
```

---

### Task 3: `/illustrate` writes a manifest entry on every docs capture

**Files:**
- Modify: `.claude/skills/illustrate/SKILL.md` (section "3. Optimize and place")
- Modify: `.todo/screenshot-needs.md` (capture-spec header)

**Interfaces:**
- Consumes: manifest schema from Task 1.
- Produces: the guarantee Task 4 relies on — every shot under `help/images/` (except `legacy/`) has a manifest entry with an actionable recipe.

- [ ] **Step 1: Add the manifest step to the capture workflow**

In `.claude/skills/illustrate/SKILL.md`, at the end of section "3. Optimize and place" (after the numbered convert/verify steps), append:

```markdown
4. **Record the recipe in the manifest** (`docs/screenshot-manifest.yaml`) — mandatory,
   same rank as the WebP conversion. Append (or update, if the file is being re-captured)
   one entry per shot with: `file` (path under `help/images/`), `page`, `type`,
   `url` (the app route actually navigated to), `element` (the selector actually used,
   or null), `state` (imperative prose a future session can reproduce), `mode`, and
   `captured` (today's date). Choose `mode` honestly:
   - `auto` — a fresh session could produce this shot from `url` + `element` + `state`
     alone against the seeded account, with no human in the loop.
   - `guided` — the operator had to set up state by hand (open a dialog mid-flow,
     start a timer, connect a third-party account).
   - `manual` — the image is hand-composed (Mac-drop shots, marketing-style heroes).
   A capture without a manifest entry is an unfinished capture.
```

- [ ] **Step 2: Point the needs inventory at the manifest**

In `.todo/screenshot-needs.md`, add one line at the end of the "Capture spec" bullet list:

```markdown
- **Manifest:** every captured shot gets an entry in `docs/screenshot-manifest.yaml`
  (recipe: url, element, state, mode) — written as part of placement, so the set
  stays batch-refreshable via `/illustrate --refresh`.
```

- [ ] **Step 3: Verify consistency**

Re-read the edited sections. Check: field names match Task 1's schema exactly (`file`, `page`, `type`, `url`, `element`, `state`, `mode`, `captured`); the three `mode` values match (`auto`/`guided`/`manual`); the manifest path is `docs/screenshot-manifest.yaml` everywhere.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/illustrate/SKILL.md .todo/screenshot-needs.md
git commit -m "Record every docs capture in the screenshot manifest"
```

---

### Task 4: `/illustrate --refresh` mode

**Files:**
- Modify: `.claude/skills/illustrate/SKILL.md` (frontmatter `description` + "Modes" list + new workflow section)

**Interfaces:**
- Consumes: manifest schema (Task 1); `diff-screenshots.sh` contract (Task 2): args `<old> <new>`, exit 0 SAME / 1 CHANGED / 2 error.
- Produces: the `--refresh` behavior `/release` (Task 5) and the README (Task 6) refer to by name.

- [ ] **Step 1: Update the frontmatter description**

In the `description:` line of `.claude/skills/illustrate/SKILL.md`, after the `--identify` sentence fragment, insert:

```
`--refresh` to re-capture every `mode: auto` shot from the manifest, replacing only images that visibly changed;
```

- [ ] **Step 2: Add the mode to the Modes list**

In the `## Modes` section, after the `--capture` bullet, insert:

```markdown
- **`--refresh`:** `/illustrate --refresh [<section>]` — batch re-capture from
  `docs/screenshot-manifest.yaml`. Replays every `mode: auto` entry (optionally
  filtered to one `help/images/<section>/`), diffs against the image on disk, and
  replaces only what changed. `guided`/`manual` entries are never captured — they
  come back as an operator checklist. Run after UI-changing app releases.
```

- [ ] **Step 3: Add the workflow section**

After the "Workflow — default" section's end (before "## Arcade embeds" or whatever section follows it — insert as a new `##` heading), add:

```markdown
## Workflow — `--refresh`

Batch re-capture driven by `docs/screenshot-manifest.yaml`. Goal: after an app
release, one run tells you which screenshots rotted and fixes the automatable ones.

### 1. Preflight

- App running (`npm run dev` in `../reboot` → `localhost:5173`, or a provided staging
  URL), logged into the **seeded account** described in the manifest's `account:` field.
- Playwright context at `deviceScaleFactor: 2` (verify `window.devicePixelRatio === 2`).
- **Freeze the clock** to the manifest's `clock:` value so date-dependent UI is
  deterministic — run via `mcp__playwright__browser_run_code_unsafe` before the first
  navigation, and re-run after any hard reload:

  ```js
  async (page) => { await page.clock.install({ time: new Date('<manifest clock value>') }); }
  ```

- Read the manifest and split entries: `auto` (this run captures), `guided`/`manual`
  (reported, never captured). If a `<section>` argument was given, keep only entries
  whose `file` starts with `<section>/`.

### 2. Capture and diff loop (auto entries)

For each `mode: auto` entry:

1. Navigate to `url`, wait for load, re-inject the hide-chrome style (snippet in the
   default workflow), and reproduce `state`.
2. Capture per `type` (same locked spec as the default workflow: full 1440×900,
   element via `element` selector, mobile 390×844) to `/tmp/bb-shots/<name>.png`.
3. Convert: `cwebp -q 80 /tmp/bb-shots/<name>.png -o /tmp/bb-shots/<name>.webp`
   (drop to `-q 60` if over 200 KB — match the quality that keeps it under budget).
4. Diff: `bash .claude/scripts/diff-screenshots.sh help/images/<file> /tmp/bb-shots/<name>.webp`
   - exit 0 (SAME) → keep the existing file untouched; discard the new capture.
   - exit 1 (CHANGED) → **look at both images before replacing** (read the old and new
     files): if the change is real UI evolution, copy the new WebP over
     `help/images/<file>` and set the entry's `captured:` to today; if the change is
     noise or a broken state (empty grid, error toast, wrong account), do NOT replace —
     record it as a failure with the reason.
   - exit 2 → record as a failure (decode/tooling error), continue.
5. A selector in `element` that no longer matches, or a `url` that 404s/redirects
   unexpectedly, is not a run failure: downgrade the entry to `mode: guided` in the
   manifest with a note appended to `state` (e.g. "selector broke 2026-08-18"), record
   it in the report, and continue.

### 3. Report

End every run with a table plus the operator checklist:

```markdown
| Shot | Result |
|---|---|
| timesheets/weekly-grid.webp | replaced (CHANGED 3.42%) |
| projects/project-tree-categories.webp | unchanged |
| people/people-list.webp | FAILED — selector `people-list` not found; downgraded to guided |

**Needs a human (guided/manual):**
- [ ] integrations/asana-params.webp — Asana connected; import parameters dialog open
```

Then run `git status` and restore any images a running `mintlify dev` deleted
(`git checkout -- help/images/`), per the warning in section 3 of the default workflow.
```

- [ ] **Step 4: Verify consistency**

Re-read the whole SKILL.md top to bottom. Check: `--refresh` appears in frontmatter, Modes, and has its workflow section; the diff script path and exit-code semantics match Task 2; manifest field names match Task 1; the frozen-clock snippet references the manifest `clock:` field; no contradiction with the default workflow's capture spec.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/illustrate/SKILL.md
git commit -m "Add /illustrate --refresh manifest-driven batch re-capture"
```

---

### Task 5: `/release` flags screenshots to re-verify

**Files:**
- Modify: `.claude/skills/release/SKILL.md` (step 6 detail + PR body template)

**Interfaces:**
- Consumes: manifest schema (Task 1) — specifically the `page` field; `--refresh` by name (Task 4).

- [ ] **Step 1: Extend step 6's detail**

In `.claude/skills/release/SKILL.md`, replace the line:

```markdown
**Step 6 detail:** identify only — never attempt capture. Keep the needs list for the PR body.
```

with:

```markdown
**Step 6 detail:** identify only — never attempt capture. Keep the needs list for the
PR body. Additionally, cross-reference this release's changed pages against the
screenshot manifest: for every path in
`git diff --name-only main...HEAD -- 'help/**/*.mdx'`, list the
`docs/screenshot-manifest.yaml` entries whose `page:` matches. Those images sit on
pages whose content just changed, so the UI they show may have changed too — they go
in the PR body under "Screenshots to re-verify" with a note to run
`/illustrate --refresh` after merge. Report-only: never capture, never edit the
manifest in a release run.
```

- [ ] **Step 2: Extend the PR body template**

In the same file's PR body template (the fenced `markdown` block with `### Pages added` etc.), add a section after the screenshot-needs section (or after "Pages updated" if no such section exists in the template):

```markdown
### Screenshots to re-verify
<!-- manifest entries whose page changed in this release; empty section = none -->
- `help/images/<file>` (on `<page>`) — run `/illustrate --refresh` after merge
```

- [ ] **Step 3: Verify consistency**

Re-read the release SKILL.md workflow table and step details: step 6 must remain identify-only; the new text must not instruct any capture or manifest write during a release; the manifest path matches Task 1.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/release/SKILL.md
git commit -m "release: flag manifest screenshots on changed pages in PR body"
```

---

### Task 6: Rot-reduction policy + README

**Files:**
- Modify: `.claude/skills/illustrate/SKILL.md` (section "What counts as a screenshot need")
- Modify: `README.md` (section "Screenshots")

- [ ] **Step 1: Add the worthiness policy to `/illustrate`**

In `.claude/skills/illustrate/SKILL.md`, at the end of the "What counts as a screenshot need" section, append:

```markdown
**Rot-reduction policy — apply when identifying and when capturing.** The app UI
changes quickly; every screenshot is a maintenance liability, so:

- **Element over full-app.** Prefer element-scoped shots: a settings panel changes far
  less often than a 1440×900 view that also includes nav, sidebar, and every widget
  that might move. Reserve full-app shots for pages whose point *is* the overall layout
  (the weekly grid, a dashboard).
- **Only where pixels beat prose.** Skip shots whose information is fully carried by
  the text — exact UI labels are already bolded and kept accurate by `/sync-features`.
  A screenshot earns its place by showing spatial arrangement, visual state, or a
  control that's hard to describe.
- **Arcade for flows.** A multi-step flow is one Arcade embed (`--arcade`), not five
  screenshots — one re-record beats five re-frames when the flow changes.
- **Automatable framing when quality is equal.** If two framings communicate equally
  well, pick the one that can be `mode: auto` in the manifest (stable semantic element,
  plain navigation, no hand-built state).
```

- [ ] **Step 2: Update the README's Screenshots section**

In `README.md`, append to the "Screenshots" bullet list:

```markdown
- **Manifest & refresh:** every docs screenshot has a recipe entry in
  `docs/screenshot-manifest.yaml` (route, selector, required state, auto/guided/manual).
  After UI-changing app releases, `/illustrate --refresh` re-captures the `auto` entries
  against the seeded account with a frozen browser clock, replaces only images that
  visibly changed (tolerant diff via `.claude/scripts/diff-screenshots.sh`), and lists
  the guided/manual shots for a human. `/release` PRs flag manifest images sitting on
  changed pages under "Screenshots to re-verify".
```

- [ ] **Step 3: Verify consistency**

Re-read both edits: terminology (`auto`/`guided`/`manual`, manifest path, script path, `--refresh`) must match Tasks 1–4. Check the README table of slash commands still describes `/illustrate` accurately (its one-liner mentions `--identify`/`--capture`; extend it with `--refresh` if it lists flags).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/illustrate/SKILL.md README.md
git commit -m "Add screenshot rot-reduction policy and document refresh pipeline"
```

---

### Task 7: End-to-end dry run + PR

**Files:** none (verification only)

- [ ] **Step 1: Simulated refresh walkthrough**

Without the app running, do a desk-check of `--refresh` against the real manifest: read `docs/screenshot-manifest.yaml`, confirm the split comes out as 0 auto / 4 guided / 1 manual, and that each guided entry's `state` prose is actionable by an operator. Run the diff script once more end-to-end on a real file pair (Task 2 steps 2 and 4) to confirm nothing regressed.

- [ ] **Step 2: Full self-review**

Check the branch diff (`git diff main...HEAD`) against the spec (`docs/superpowers/specs/2026-08-18-screenshot-refresh-design.md`) decision list, items 1–6: each must map to a commit. Grep the diff for placeholder red flags (`TBD`, `TODO`, `fill in`).

- [ ] **Step 3: Open the PR**

```bash
git push -u origin docs/screenshot-refresh-pipeline
gh pr create --assignee @me --title "Screenshot manifest + /illustrate --refresh pipeline" \
  --body "Implements docs/superpowers/specs/2026-08-18-screenshot-refresh-design.md: manifest, tolerant diff script, --refresh mode, release PR flagging, rot-reduction policy.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

---

## Out of scope (deliberate, see spec)

CI/headless capture, third-party visual-regression services (Percy/Chromatic), app-repo-owned capture specs, code-to-screenshot mapping, synthetic HTML mock-UI. The manifest is the interface that keeps all of these re-openable later. The 156-shot capture run itself is also not this plan — it stays the existing `/illustrate --capture` effort, which after Task 3 populates the manifest as it goes.

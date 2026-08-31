# Sustainable Screenshots — Design (brainstorm + critical analysis)

**Date:** 2026-08-18
**Problem:** The Beebole app UI changes quickly. Docs screenshots go stale, and re-capturing them is expensive because each shot's framing, state, and setup live in prose and in the operator's head. ~156 shots are inventoried in `.todo/screenshot-needs.md` but deferred — partly *because* of this fear of rot. Only 5 non-legacy images exist on disk today, so the convention can be set before the big capture run.

## Brainstorm — the full option space

1. **Screenshot manifest ("screenshots as code")** — every captured shot gets a machine-readable recipe: output file, docs page, app URL, shot type, element selector, required state, auto/guided/manual class. Recapture becomes a batch job instead of archaeology.
2. **`/illustrate --refresh` mode** — re-run the manifest against a running app, diff each new capture against the existing WebP, replace only what visibly changed, list guided/manual shots as a short todo.
3. **Perceptual pixel diff** — a small script (dwebp → PPM → pure-python compare, no new heavy deps) that says SAME/CHANGED with a tolerance, so WebP re-encode noise and anti-aliasing don't produce false churn in git.
4. **Determinism: frozen clock + seeded account** — Playwright's `page.clock.install()` pins the browser date; a seeded demo account (Acme Corp etc., already called for in the needs file) pins the data. Without both, every timesheet shot differs every week and diffing is useless.
5. **Shrink the rot surface** — element-scoped shots over full-app shots (a settings panel changes far less often than a 1440×900 view that includes nav, sidebar, and every widget); screenshot only where the image carries meaning prose can't; Arcade embeds for multi-step flows (one re-record beats five re-frames).
6. **Code-mapped staleness detection** — map each shot to app routes/components; `/sync-features --incremental` already scans `../reboot` commits, so a release could flag "these shots cover views that changed" without recapturing anything.
7. **Cheap release-time signal** — changed docs pages (`git diff main...HEAD -- help/**.mdx`) ∩ manifest pages → a "screenshots to re-verify" section in the `/release` PR body.
8. **Off-the-shelf visual regression** (Playwright `toHaveScreenshot`, Percy, Chromatic, Argos) — purpose-built diffing and review UI.
9. **CI capture** — headless Playwright in GitHub Actions against a seeded staging account; screenshots regenerate on a schedule with zero operator time.
10. **Capture owned by the app repo** — `../reboot` maintains capture specs next to the components; docs consume published artifacts.
11. **Semantic (LLM) comparison instead of pixel diff** — Claude looks at old and new capture and judges "does this still show what the prose says?" — immune to pixel noise, catches meaning-level staleness.
12. **Avoid bitmaps** — synthetic HTML/CSS mock-UI, or deep links into the app instead of images.
13. **Do nothing / disclaim** — date-stamp screenshots, add a "UI may differ slightly" note, refresh opportunistically.

## Critical analysis — attacking the brainstorm

**The state-setup problem is the real bottleneck, and no manifest fixes it.** Of ~156 shots, many need an open dialog, a running timer, a pending approval, a budget over threshold. A manifest records *what* state is needed but can't always *produce* it. Honest expectation: maybe half the shots are fully automatable (`mode: auto`); the rest stay `guided` (operator sets state, Playwright frames and captures) or `manual` (hand-composed, e.g. the landing hero). The design must treat that split as a first-class field, not a failure — a refresh run that automates 70 shots and hands the operator a checklist of 20 is still a transformed workflow.

**Selector rot is the same disease.** The app churn that stales screenshots also breaks element selectors. Mitigations: prefer Beebole's semantic web-component tags (`timesheet-main`, `.timesheetPopup`) which are far more stable than class soup; on selector failure, degrade to a flagged guided shot rather than failing the run.

**Pixel diffing is noisy — but the alternative to diffing is worse, and the executor is an LLM anyway.** Even frozen-clock, seeded captures differ by anti-aliasing and encode noise, so "replace everything each run" would bury real changes in binary git churn and make PR review meaningless. A tolerant diff (ignore per-channel differences ≤ 8/255; CHANGED only if > 0.5 % of pixels differ) filters the noise cheaply. And because `--refresh` runs inside Claude Code, borderline diffs get a semantic double-check for free — Claude looks at both images before replacing. That's option 11 folded in at zero infrastructure cost, not a separate system.

**Options 8–10 are over-engineering for this repo.** This is a docs site maintained by one person through Claude Code slash commands. Percy/Chromatic add accounts, billing, and CI wiring to solve the review-UI problem that a git PR already solves here. CI capture needs a permanently seeded staging environment and secrets management, and would still fail on every guided shot. App-repo ownership needs another team's buy-in. All three are re-openable later *because* the manifest is the interface — a manifest entry doesn't care who executes it. Defer, don't reject.

**Option 6 (code mapping) is seductive and premature.** Mapping shots to app components duplicates knowledge that rots on its own schedule. The cheap proxy (option 7: changed docs pages ∩ manifest, at `/release` time) captures most of the value for one grep, because `/write` already updates pages when features change — the docs diff *is* the change signal. Revisit real code-mapping only if the proxy proves too coarse.

**Option 12 fails on trust, option 13 on brand.** Synthetic UI screenshots are a second UI to maintain and drift out of truth silently — worse than stale real screenshots. "Do nothing + disclaimer" reads as neglect on a paid product's help site; acceptable as an interim state, not as the plan.

**Chicken-and-egg check.** The refresh pipeline is worthless until shots exist — but the manifest must exist *before* the 156-shot capture run, or every recipe has to be reverse-engineered later, which is precisely today's pain. So: build the manifest + refresh machinery now (small), let the capture run populate it as a side effect of `/illustrate`'s existing flow.

## Decision

Build, in the documentation repo only:

1. A **screenshot manifest** (`docs/screenshot-manifest.yaml`, internal, not published) with a global frozen-clock/seed-account contract and one entry per shot (`file`, `page`, `type`, `url`, `element`, `state`, `mode`, `captured`). Backfill the 5 existing shots.
2. A **tolerant diff script** (`.claude/scripts/diff-screenshots.sh`) — dwebp + stdlib Python, no new dependencies, SAME/CHANGED with thresholds.
3. **`/illustrate` writes a manifest entry on every docs capture** (mandatory step, like WebP conversion).
4. **`/illustrate --refresh`** — batch recapture of `auto` entries with frozen clock, diff-gated replacement, semantic double-check on borderline diffs, and a guided/manual checklist for the rest.
5. **`/release` PR body gets a "screenshots to re-verify" section** — changed pages ∩ manifest (identify-only; release never captures).
6. **Rot-reduction policy** written into `/illustrate` and the README: element-first framing, screenshot only what prose can't carry, Arcade for flows.

Deliberately excluded (YAGNI, re-openable via the manifest interface): CI capture, third-party visual-regression services, app-repo ownership, code-to-shot mapping, synthetic UI.

**Implementation plan:** `docs/superpowers/plans/2026-08-18-screenshot-refresh-pipeline.md`

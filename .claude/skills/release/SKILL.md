---
name: release
description: 'Run the full post-deploy documentation pipeline in one shot: sync the feature catalog, draft the news entry, find gaps, write pages, review with auto-applied fixes, re-audit the pages reviewed longest ago, refresh screenshots, verify coverage, lint the whole site, mine reader signals — all on a dedicated branch, ending in a PR assigned to the maintainer, then propagate the feature catalog to the sibling repos that keep snapshots of it. Manual trigger only, after a production deploy of the app. One run = one branch = one PR.'
disable-model-invocation: true
---

# Release — Post-Deploy Documentation Pipeline

Orchestrate the existing lifecycle skills end to end after a production deploy of the app. This skill does no content work itself — it sequences `/sync-features`, `/news`, `/find-gaps`, `/write`, `/review`, `/illustrate --release`, `/mine-conversations`, `/mine-signals` and `/check-help-snippets --fix`, runs the site lint, commits after each step, and opens a PR for human review. Nothing reaches the live docs until the PR is merged — **the PR is the approval gate**.

## Unattended-run overrides

This pipeline runs without a human in the loop, so interactive gates inside sub-skills are overridden for this run only:

- `/sync-features` — apply the proposal **without waiting for confirmation**. For a "Needs clarification" item, take the most conservative classification (keep the entry as it was, or leave a new one out) and record it for the PR body.
- `/find-gaps` — apply proposed page-mappings additions **without asking**; they are visible in the PR diff.
- `/review` — apply all Critical and Warning fixes (including generated FAQs) **without asking**; keep a log of every fix applied for the PR body.
- Any other sub-skill question that would block ("continue anyway?") — choose the safe default, continue, and record the decision for the PR body. Only halt for preflight failures or genuine errors.

## Workflow

### 1. Preflight

Check, in order — halt with a clear message on the first failure:

1. `../reboot` is reachable (this skill has no GitHub-API fallback — the pipeline is too long to run degraded). **Note its current branch** (`git -C ../reboot rev-parse --abbrev-ref HEAD`): `/sync-features` switches it to `prod`, and step 6 puts it back.
2. **The docs repo is on a clean `main`.** If it is on another branch, switch to `main` only when that branch is clean and fully pushed (`git status --porcelain` empty and `git log @{u}..` empty); otherwise halt and say which branch holds unpushed or uncommitted work. Then `git pull --ff-only`.
3. `gh auth status` succeeds.
4. **Screenshot runner (soft check):** `npm ls --prefix .claude/skills/illustrate/runner` exits 0 (if not, run `npm install --prefix .claude/skills/illustrate/runner` and `npx --prefix .claude/skills/illustrate/runner playwright install chromium` once). A failure here never halts the release; it only disables the screenshot step, and the PR body says why.
5. **There is something to release:** at least one note in `../reboot/frontend/public/release-notes/production/` with a `date` newer than the `news-cursor` marker in `help/news/releases.mdx`, or newer than the `Last updated:` date in `.claude/context/features.md`. If neither, print "Nothing to release — no production notes newer than the last covered date." and stop. Never open an empty PR.

### 2. Create the release branch

```bash
git switch -c docs/release-YYYY-MM-DD
```

Use today's date. If the branch already exists (second run the same day), suffix `-2`, `-3`, …

### 3. Run the pipeline

**Before step 1, start the screenshot replay in the background** (no tokens, a few minutes): `set -a && source ~/.config/beebole/.env && set +a && node .claude/skills/illustrate/runner/screenshots.mjs replay --json .todo/replay-report.json` (the key is needed by scenes with fixtures, such as the running timer). Step 7 reads its report.

Invoke each skill via the Skill tool, in this order. **After each step, commit its changes** on the release branch with the message shown — one commit per step so the PR reads stage by stage. A step that changes nothing produces no commit; note it and continue.

| # | Step | Commit message |
|---|------|----------------|
| 1 | `/sync-features` (full or `--incremental`, see below) | `release: sync feature catalog` |
| 2 | `/news` | `release: draft news entry` |
| 3 | `/find-gaps` | `release: gaps report` |
| 4 | `/write` (see below) | `release: draft and update pages` |
| 5 | `/review` (session scope, auto-apply per overrides above) | `release: apply review fixes` |
| 6 | Rotation audit (see below) | `release: rotation audit` |
| 7 | `/illustrate --release` | `release: refresh screenshots` |
| 8 | `/find-gaps` — verification pass | `release: coverage verification` |
| 9 | Site lint (see below) | `release: site lint` |
| 10 | `/mine-conversations` | `release: conversation gaps report` |
| 11 | `/mine-signals` | `release: docs signals report` |
| 12 | `/check-help-snippets --fix` | `release: help snippet audit and fixes` |

**Step 1 detail:** run a **full** scan (no flag) when the `**Last full scan:**` line in `.claude/context/features.md` is missing or more than 28 days old, `--incremental` otherwise. An incremental run trusts the rest of the catalog, so the periodic full scan is what catches drift it never looked at.

**Step 3 detail:** after an incremental sync, `/find-gaps` may classify only the catalog entries the sync added or changed (the rest stood verified at the last release); say so in "Decisions taken unattended". After a full sync, classify the whole catalog.

**Step 4 detail:** run `/write` with no args to draft every **Missing** entry, then run `/write <path>` for each **Partial** entry using its `needs:` note from `.todo/gaps.md`. In a release run, Partial entries are not skipped.

**Step 5 detail:** session scope covers everything the branch changed (working tree vs `main`); if `/review`'s git-based session detection misses committed pages, pass the changed pages explicitly: `git diff --name-only main...HEAD -- 'help/**/*.mdx'`. Every page reviewed here gets today's date in `.todo/review-rotation.md`.

**Step 6 detail — rotation audit.** Each release fully re-reviews a few pages it did not touch, so every page comes round again within a few months, and checks that what they document still exists:

1. From `.todo/review-rotation.md`, take the **6** pages with the oldest date ("never" first, then in table order), skipping pages this branch already changed. A page missing from the table (new since) is added as "never"; a row whose page no longer exists is removed.
2. Run `node .claude/scripts/site-lint.mjs --label-hints <the 6 pages>` and pass the hints along.
3. Run `/review <the 6 pages>` with every check, auto-applying fixes per the overrides. Check 2.12 (deprecated content) is the point here: work from the page toward the code, confirming that each documented setting, option, label, limit and workflow still exists on `prod`. Removing content because the feature is gone needs the code evidence in the fix log.
4. Set the 6 pages' dates to today, and commit the table with the fixes.

**Step 7 detail:** follow "Workflow — `--release`" in the illustrate skill: recapture only shots whose published image is wrong (top-up first if dates matter), add `ignore` areas for shots where only data moved, one repair attempt per broken scene, up to 10 new scenes for pages this release added or rewrote, the rest queued in `.todo/screenshot-needs.md`. Keep its summary for the PR body. If QA or the runner is unavailable, skip the step and say so; never block the release on screenshots.

**Step 8 detail:** if the verification pass still reports Missing or Partial entries, run `/write` once more for those entries and re-run `/find-gaps`. If it is still not clean, stop retrying and list the leftovers in the PR body under "Remaining gaps" — never loop.

**Step 9 detail — site lint.** Runs after every step that edits pages, over the **whole site**, not only what this release touched:

```bash
node .claude/scripts/site-lint.mjs --base main --out .todo/site-lint.md
mintlify validate
mintlify broken-links --check-anchors --check-redirects
```

- Fix **every error** the lint reports, wherever it is: raw HTML and inline styles (convert to Mintlify components per `.claude/context/mintlify-components.md`), duplicated `<Steps>`, a `<Steps>` block before the intro, duplicate headings (stale drafts merged by the Mintlify dashboard editor: check against the app code which copy is right before deleting the other), missing images, broken or unprefixed links, navigation entries, and a missing redirect for a page this branch removed or renamed. An **inbound-link** error (the app, `../md` or the website links to a page that no longer resolves) is fixed here with a redirect in `docs.json`, never by editing the other repo.
- Fix what `mintlify validate` and `mintlify broken-links` report outside `help/legacy/` (a frozen archive: its broken anchors are known and left alone).
- **Warnings are not fixed** in the release (repeated prose, near-duplicate steps, missing FAQ, pages outside the navigation, unused images): list them in the PR body. A missing-FAQ warning on a page in the rotation is handled by its review instead.
- Re-run the lint after fixing; commit the fixes with `.todo/site-lint.md`. If an error cannot be fixed safely, leave it and list it under "Needs your eyes".

**Step 10 detail:** report-only, by design — its candidates are **not** drafted in this run, and never feed them into `/write` or `.todo/gaps.md`. The report is committed so the PR carries the candidates for human review; approving entries and drafting them is a separate decision after the PR. If PostHog is unreachable, skip the step and note it in the PR body — never block the release on it.

**Step 11 detail:** report-only as well (Intercom support conversations, Mintlify searches with no click, page feedback, 404s): its proposed fixes are listed in the PR as pending review and nothing is applied, until Yves changes the skill's mode. A source that fails is skipped and named in the report.

**Step 12 detail:** audits the in-app contextual help snippets (`../md` + the dictionary in `../reboot/frontend/src/i18n/md.ts`) against the app's attributes and previews, then fixes what it finds in the same step, following "Fix mode" in the check-help-snippets skill. Snippet files (missing, incomplete language sets, stale wording) are written in `../md` and pushed to its `main`, which the app serves live. Missing dictionary entries are written in `../reboot` on `dev` but left uncommitted: that repo requires Yves' approval for each commit, so the question waits for section 6 below instead of blocking the run. The report, with its "Fixes applied" section, is committed to the release branch so the PR shows what changed. If `../md` or `../reboot` is unreachable or dirty, skip that part and note it — never block the release on it.

### 4. Open the PR

```bash
git push -u origin docs/release-YYYY-MM-DD
gh pr create --assignee @me --title "Docs release YYYY-MM-DD" --body "…"
```

PR body template. **"Needs your eyes" comes first**: it is the short list of what only a human can decide, so the reviewer can act without reading the rest. Everything after it is the record.

```markdown
## Docs release YYYY-MM-DD

**Production deploys covered:** <list of production note dates, from → to>

### Needs your eyes
<a checklist, most important first; "Nothing — everything below is informational." when empty>
- [ ] <app behavior the docs had to describe as-is, or a doc/app mismatch found while writing>
- [ ] <content removed by the rotation audit because the feature is gone>
- [ ] <high-priority AI-conversation candidates and proposed signal fixes to approve>
- [ ] <guided screenshots to check by hand on pages this release changed>
- [ ] <lint errors left unfixed, a failing PR check, a decision taken unattended that changes meaning>

### Pages added
- `<path>` — <one-line reason>

### Pages updated
- `<path>` — <what changed>

### News
<month(s) drafted / merged into>

### Review fixes applied
<summary of what /review changed, grouped by check>

### Rotation audit
- `<path>` — <fixes applied, or "no change">

### Screenshots
- Refreshed: `<image>` — used on <pages> — <N> px changed <(page text may need review)>
- New: `<image>` — <page>
- Ignore areas added: <scene id> — <region>
- Left alone: <scene ids> — <reason>
- Broken scenes to fix: <scene id> — <failing step>
- Queued in the inventory: <page> — <shot>
- Guided shots to check by hand (pages changed in this release): <shot>

### Remaining gaps
<leftover Missing/Partial entries after retry, or "None — coverage verified.">

### Site lint
<errors fixed, grouped by check; warnings left, grouped by check; or "Clean.">

### AI-conversation gap candidates (pending review)
<entries added by /mine-conversations this run, or "None." — these are proposals only; approve in .todo/ai-conversation-gaps.md, then draft with /write>

### Docs signals (pending review)
<proposed fixes added by /mine-signals this run, by kind, and the sources skipped — or "None." Nothing was applied; approve in .todo/docs-signals.md>

### In-app help snippets
<fixes pushed to ../md this run (commit + files), dictionary entries prepared in ../reboot (waiting for approval), findings left unfixed with the reason, or "All clear.">

### Catalog propagation
<per-repo result from step 5: synced / already in sync / skipped: reason>

### PR checks
<result of each check on this PR>

### Decisions taken unattended
<any safe-default choices made mid-run, or "None.">

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Then wait for the PR checks** (Mintlify Deployment, link-rot, vale-spellcheck): `gh pr checks <number> --watch --interval 30`, for at most 10 minutes. If a check fails, read its details, fix the cause, commit `release: fix PR checks`, push, and wait once more; if it still fails, add it to "Needs your eyes". A `skipping` check is reported as skipped, not as a failure (vale-spellcheck is switched on and off in the Mintlify dashboard). Fill the PR body's **PR checks** section with the outcome (`gh pr edit --body`).

Print the PR URL as the final output, with a one-line reminder: review and merge; the branch deletes itself on merge, the PR remains as the release record.

### 5. Propagate the feature catalog

Three sibling repos keep a snapshot of `.claude/context/features.md`. After the PR is open (and only then — a draft PR from the failure path never triggers this step), replicate the catalog as it stands on the release branch to each of them:

| Target repo | File |
|-------------|------|
| `../ads` | `context/features.md` |
| `../claude-plugins` | `plugins/growth/context/features.md` |
| `../intranet` | `growth/features.md` |

**Target file content** = the canonical file verbatim, with exactly one blockquote inserted between the `# Beebole Features` title and the `**Last updated:**` line (replacing any existing `> **Source:** …` blockquote there):

```markdown
> **Source:** Auto-synced from the canonical `features.md` in `beebole/documentation` by its `/release` pipeline. Do not edit this copy — local changes are overwritten on the next release.
```

**Per target, in order:**

1. If the repo directory is missing, skip it and record `skipped: repo not available locally`.
2. If the repo is not on `main`, or `git status --porcelain` shows changes to the target file, skip it and record the reason — never stash, switch branches, or overwrite uncommitted local edits.
3. `git pull --ff-only`; on failure, skip and record.
4. Write the target file. If the result is byte-identical to what was already there, record `already in sync` — no commit.
5. Otherwise commit **only that file** with message `chore: sync features.md from documentation release YYYY-MM-DD`, then `git push`.

Propagation problems never fail the release — the PR is already open. Record every per-repo outcome (synced / already in sync / skipped: reason) in the PR body's **Catalog propagation** section and in the final output.

### 6. Commit the help snippet dictionary entries

If step 12 left dictionary entries uncommitted in `../reboot`, show the `md.ts` diff and ask Yves whether to commit it on `dev` (one question, after everything else is done). On yes, commit and hand him `git -C ../reboot push`; never push it yourself. On no, leave the change in the working tree and say so in the final output. Either way, the next `/sync-features` needs a clean `../reboot`, so say what is left there.

### 7. Put the checkouts back

- `git switch main` in the docs repo, so the next session starts clean.
- `git -C ../reboot switch <the branch noted in preflight>` when that branch differs from the current one (`/sync-features` left it on `prod`, step 12 on `dev`) and the tree is clean. If the tree is not clean (dictionary entries left uncommitted in section 6) or the switch fails, leave it where it is and say so in the final output.

### 8. On failure

If any step fails and can't be recovered:

1. Commit whatever the completed steps produced.
2. Push the branch and open a **draft** PR (`gh pr create --draft --assignee @me`) with the same body template plus a leading `> ⚠️ Pipeline stopped at step N (<skill>): <reason>` line.
3. Put the checkouts back (section 7).
4. Report the failure and the draft PR URL. Never leave finished work stranded on an unpushed local branch.

## Rules

- **Never push to the docs repo's `main`, never merge the PR.** Merging is the human's job. The only direct-to-`main` pushes are the catalog syncs of section 5, each touching a single `features.md` file in a sibling repo, and the help snippet fixes of pipeline step 12 in `../md`. `../reboot` is never pushed.
- **One run = one branch = one PR.** Don't reuse or amend a previous release branch; a same-day re-run gets a suffixed branch name.
- **No translations.** The site is EN-only — never invoke `/translate`.
- **Screenshots only through scenes.** The screenshot step captures with the runner from the documentation account; no hand-made captures in a release.
- **Never open an empty PR.** Preflight step 5 guards this.
- **Report-only steps stay report-only.** `/mine-conversations` and `/mine-signals` propose; nothing they find is drafted or applied in the run.
- **Don't write to other repos** beyond the catalog syncs, the `../md` snippet fixes and the uncommitted `../reboot` dictionary entries of step 12: inbound-link problems are fixed with redirects here, app issues are reported.
- **Don't duplicate sub-skill logic.** Cursor handling, curation, gap classification, review checks all live in their own skills — this file only sequences them and overrides their interactive gates.
- **Leave the checkouts as they were found:** the docs repo on `main`, `../reboot` on its starting branch unless work was left in it (section 7).

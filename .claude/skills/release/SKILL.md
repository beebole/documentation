---
name: release
description: 'Run the full post-deploy documentation pipeline in one shot: sync the feature catalog, draft the news entry, find gaps, write pages, review with auto-applied fixes, identify screenshot needs, verify coverage — all on a dedicated branch, ending in a PR assigned to the maintainer, then propagate the feature catalog to the sibling repos that keep snapshots of it. Manual trigger only, after a production deploy of the app. One run = one branch = one PR.'
disable-model-invocation: true
---

# Release — Post-Deploy Documentation Pipeline

Orchestrate the existing lifecycle skills end to end after a production deploy of the app. This skill does no content work itself — it sequences `/sync-features`, `/news`, `/find-gaps`, `/write`, `/review`, and `/illustrate --identify`, commits after each step, and opens a PR for human review. Nothing reaches the live docs until the PR is merged — **the PR is the approval gate**.

## Unattended-run overrides

This pipeline runs without a human in the loop, so interactive gates inside sub-skills are overridden for this run only:

- `/find-gaps` — apply proposed page-mappings additions **without asking**; they are visible in the PR diff.
- `/review` — apply all Critical and Warning fixes (including generated FAQs) **without asking**; keep a log of every fix applied for the PR body.
- Any other sub-skill question that would block ("continue anyway?") — choose the safe default, continue, and record the decision for the PR body. Only halt for preflight failures or genuine errors.

## Workflow

### 1. Preflight

Check, in order — halt with a clear message on the first failure:

1. `../reboot` is reachable (this skill has no GitHub-API fallback — the pipeline is too long to run degraded).
2. The docs repo is on `main` with a clean working tree. Run `git pull --ff-only`.
3. `gh auth status` succeeds.
4. **There is something to release:** at least one note in `../reboot/frontend/public/release-notes/production/` with a `date` newer than the `news-cursor` marker in `help/news/releases.mdx`, or newer than the `Last updated:` date in `.claude/context/features.md`. If neither, print "Nothing to release — no production notes newer than the last covered date." and stop. Never open an empty PR.

### 2. Create the release branch

```bash
git switch -c docs/release-YYYY-MM-DD
```

Use today's date. If the branch already exists (second run the same day), suffix `-2`, `-3`, …

### 3. Run the pipeline

Invoke each skill via the Skill tool, in this order. **After each step, commit its changes** on the release branch with the message shown — one commit per step so the PR reads stage by stage. A step that changes nothing produces no commit; note it and continue.

| # | Skill | Commit message |
|---|-------|----------------|
| 1 | `/sync-features --incremental` | `release: sync feature catalog` |
| 2 | `/news` | `release: draft news entry` |
| 3 | `/find-gaps` | `release: gaps report` |
| 4 | `/write` (see below) | `release: draft and update pages` |
| 5 | `/review` (session scope, auto-apply per overrides above) | `release: apply review fixes` |
| 6 | `/illustrate --identify` | `release: screenshot needs` (only if it writes files) |
| 7 | `/find-gaps` — verification pass | `release: coverage verification` |
| 8 | `/mine-conversations` | `release: conversation gaps report` |

**Step 4 detail:** run `/write` with no args to draft every **Missing** entry, then run `/write <path>` for each **Partial** entry using its `needs:` note from `.todo/gaps.md`. In a release run, Partial entries are not skipped.

**Step 5 detail:** session scope covers everything the branch changed (working tree vs `main`); if `/review`'s git-based session detection misses committed pages, pass the changed pages explicitly: `git diff --name-only main...HEAD -- 'help/**/*.mdx'`.

**Step 6 detail:** identify only — never attempt capture. Keep the needs list for the PR body.

**Step 7 detail:** if the verification pass still reports Missing or Partial entries, run `/write` once more for those entries and re-run `/find-gaps`. If it is still not clean, stop retrying and list the leftovers in the PR body under "Remaining gaps" — never loop.

**Step 8 detail:** report-only, by design — its candidates are **not** drafted in this run, and never feed them into `/write` or `.todo/gaps.md`. The report is committed so the PR carries the candidates for human review; approving entries and drafting them is a separate decision after the PR. If PostHog is unreachable, skip the step and note it in the PR body — never block the release on it.

### 4. Open the PR

```bash
git push -u origin docs/release-YYYY-MM-DD
gh pr create --assignee @me --title "Docs release YYYY-MM-DD" --body "…"
```

PR body template:

```markdown
## Docs release YYYY-MM-DD

**Production deploys covered:** <list of production note dates, from → to>

### Pages added
- `<path>` — <one-line reason>

### Pages updated
- `<path>` — <what changed>

### News
<month(s) drafted / merged into>

### Review fixes applied
<summary of what /review changed, grouped by check>

### Screenshot needs (capture later with /illustrate --capture)
- <page> — <shot description>

### Remaining gaps
<leftover Missing/Partial entries after retry, or "None — coverage verified.">

### AI-conversation gap candidates (pending review)
<entries added by /mine-conversations this run, or "None." — these are proposals only; approve in .todo/ai-conversation-gaps.md, then draft with /write>

### Catalog propagation
<per-repo result from step 5: synced / already in sync / skipped: reason>

### Decisions taken unattended
<any safe-default choices made mid-run, or "None.">

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

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

### 6. On failure

If any step fails and can't be recovered:

1. Commit whatever the completed steps produced.
2. Push the branch and open a **draft** PR (`gh pr create --draft --assignee @me`) with the same body template plus a leading `> ⚠️ Pipeline stopped at step N (<skill>): <reason>` line.
3. Report the failure and the draft PR URL. Never leave finished work stranded on an unpushed local branch.

## Rules

- **Never push to the docs repo's `main`, never merge the PR.** Merging is the human's job. The only direct-to-`main` pushes are the catalog syncs of step 5, each touching a single `features.md` file in a sibling repo.
- **One run = one branch = one PR.** Don't reuse or amend a previous release branch; a same-day re-run gets a suffixed branch name.
- **No translations.** The site is EN-only — never invoke `/translate`.
- **No screenshot capture.** Identify only; capture is a separate, attended `/illustrate --capture` run.
- **Never open an empty PR.** Preflight step 4 guards this.
- **Don't duplicate sub-skill logic.** Cursor handling, curation, gap classification, review checks all live in their own skills — this file only sequences them and overrides their interactive gates.
- **Leave the repo on `main` afterwards** (`git switch main`) so the next session starts clean.

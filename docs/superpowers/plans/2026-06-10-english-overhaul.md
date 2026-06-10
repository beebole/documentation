# English-Only Documentation Overhaul Implementation Plan

> **STATUS (2026-06-10, end of session 1):** Tasks 1–7 DONE (Phase 0+1, Checkpoint 1, batch 2a committed as c4a0bb5). Live progress tracker: `.todo/overhaul-worklist.md` — read its "▶ RESUME STATE" block first; it supersedes this header. **Process change:** Yves waived per-batch checkpoints — run batches 2b–2g autonomously (keep gate reviews + commits), single human review at the very end.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring all 63 English pages up to the full current rulebook (guardrails in `.claude/context/feedback.md`, `features.md` of 2026-06-10, SEO/GEO rules), fill coverage gaps, and finish with a refreshed illustration plan — with FR/ES unpublished until English stabilizes.

**Architecture:** Phase 0 switches publishing to EN-only (`docs.json` edit). Phase 1 builds a global worklist from two read-only passes (`/find-gaps` + a classification-only `/review --all` via parallel subagents) — every page gets a verdict: keep / fix / rewrite / deprecate. Phase 2 remediates in 7 per-tab batches with a human checkpoint and `/triage` flywheel between batches. Phase 3 is a site-wide coherence checklist. Phase 4 regenerates `screenshot-needs.md`.

**Tech Stack:** Claude Code skills (`/find-gaps`, `/write`, `/review`, `/triage`, `/news`, `/illustrate`), Mintlify CLI (`mintlify broken-links`), Mintlify MCP server, python3 for `docs.json` manipulation, sibling repo `../reboot` as source of truth.

**Spec:** `docs/superpowers/specs/2026-06-10-english-overhaul-design.md`

---

## Shared definitions (read before any task)

### Verdict rubric (used by Task 4 and referenced everywhere)

- **keep** — at most 2 minor issues (suggestion-level), zero critical violations. No work in Phase 2.
- **fix** — structure is sound (definition-style intro, logical sections, FAQ present or trivially addable) AND no fabricated-feature claims, but has fixable violations (label paraphrases, British spellings, tense, SEO metadata, callout placement…). Remediated in place.
- **rewrite** — any of: (a) fabricated features / SaaS-cliché claims (the `feedback.md` site-wide rule #1 pattern), (b) structure doesn't match the `documentation-structure.md` template, (c) more than ~10 critical violations, (d) a per-page `feedback.md` rule demands restructuring (e.g. `/help/documentation/roles-authorisations`). Regenerated with `/write`.
- **deprecate** — the page's core feature is absent from `../reboot` / `features.md`. Deleted, with nav + redirect cleanup.

### Worklist line format (`.todo/overhaul-worklist.md`)

One line per page, pipe-delimited, grouped under the tab's H2:

```markdown
- [ ] <verdict> | <path> | <critical>/<warnings> | <top issues, semicolon-separated, citing feedback.md rule names>
```

New pages from `gaps.md` use verdict `write`:

```markdown
- [ ] write | help/<tab>/<slug>.mdx | — | gaps.md: <Missing|Partial> — <feature, catalog section>
```

### Review-gate modifications (every `/review` run in this plan)

- **Skip translation checks**: skip check 2.9 entirely and the "FR/ES have translated metadata" item of 2.4.
- Everything else in the `/review` checklist runs, including code accuracy against `../reboot`.

### Batch checkpoint procedure (end of every Phase 2 batch)

1. Tell Yves the batch is committed and list the changed pages with verdicts applied.
2. Yves reviews; any marked-up feedback files go into `docs/feedback/`.
3. If `docs/feedback/` contains new files: run `/triage`, commit the `feedback.md` updates, and confirm new rules are loaded before starting the next batch.
4. Do not start the next batch until Yves says go.

---

## Phase 0 — EN-only publishing

### Task 1: Verify Mintlify behavior for pages outside navigation

**Files:** none (research only)

- [ ] **Step 1:** Query the Mintlify MCP server (`search_mintlify` / `query_docs_filesystem_mintlify`) for: "pages not included in navigation — are they accessible by direct URL? Are they in the sitemap, search index, and llms.txt?"
- [ ] **Step 2:** Record the answer in the session. Decision rule: if FR/ES pages stay out of sitemap/search/`llms.txt`, direct-URL access is acceptable — proceed. If they would still appear in `llms.txt` or the sitemap, find the Mintlify mechanism to exclude them (e.g. hidden-page config) and add that to Task 2 before editing.

### Task 2: Remove FR/ES from `docs.json` navigation

**Files:**
- Modify: `docs.json` (the `navigation.languages` array — `fr` starts at line 246, `es` at line 436)

- [ ] **Step 1: Edit out the fr/es language objects**

```bash
python3 - <<'EOF'
import json
with open('docs.json') as f:
    d = json.load(f)
d['navigation']['languages'] = [l for l in d['navigation']['languages'] if l['language'] == 'en']
with open('docs.json', 'w') as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
    f.write('\n')
EOF
```

- [ ] **Step 2: Verify the diff is surgical**

Run: `git diff --stat docs.json && git diff docs.json | grep -c '^+'`
Expected: only deletions plus a handful of `+` lines (closing-bracket/comma adjustments). If the diff shows a whole-file reformat (hundreds of `+` lines), run `git checkout docs.json` and instead delete the two language objects with the Edit tool (lines ~245 to the end of the `es` object), preserving original formatting.

- [ ] **Step 3: Verify only EN remains**

Run: `python3 -c "import json; print([l['language'] for l in json.load(open('docs.json'))['navigation']['languages']])"`
Expected: `['en']`

- [ ] **Step 4: Check for EN→FR/ES links**

Run: `grep -rn "/help/\(fr\|es\)/" help --include="*.mdx" -l | grep -v "^help/fr/" | grep -v "^help/es/"`
Expected: no output. If any EN page links into FR/ES, fix those links to the EN equivalent.

- [ ] **Step 5: Validate the site builds**

Run: `mintlify broken-links`
Expected: no broken links (or only pre-existing ones unrelated to this change — record any found).

- [ ] **Step 6: Commit**

```bash
git add docs.json
git commit -m "config: publish EN only while English content stabilizes (FR/ES files kept)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Phase 1 — Global map

### Task 3: Run `/find-gaps`

**Files:**
- Create/overwrite: `.todo/gaps.md`

- [ ] **Step 1:** Invoke the `find-gaps` skill (Skill tool). It reads `features.md` (fresh as of 2026-06-10, so the freshness check passes) and `page-mappings.md`, classifies every catalog bullet, and writes `.todo/gaps.md`.
- [ ] **Step 2: Verify output format**

Run: `head -30 .todo/gaps.md && grep -c '^- \[ \]' .todo/gaps.md`
Expected: header with `Generated: 2026-06-10`, pipe-delimited gap lines, a nonzero count.

- [ ] **Step 3: Commit**

```bash
git add .todo/gaps.md
git commit -m "find-gaps: coverage report against 2026-06-10 feature catalog

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 4: Classification-only `/review --all`

**Files:** none modified (read-only pass; results held for Task 5)

- [ ] **Step 1: Enumerate target pages**

Run: `find help -name '*.mdx' -not -path 'help/fr/*' -not -path 'help/es/*' | sort`
Expected: 63 paths.

- [ ] **Step 2: Dispatch classification subagents**

Batch the 63 pages into groups of 5–8 (respecting tab boundaries where convenient) and dispatch parallel Explore/general-purpose subagents. Each subagent prompt must contain:

- The page paths in its batch.
- Instruction to read `.claude/context/feedback.md` (site-wide + matching per-page sections), `brand.md`, `documentation-structure.md`, `seo-geo.md`, `mintlify-components.md`.
- The full `/review` check list (sections 2.1–2.12 of `.claude/skills/review/SKILL.md`) **minus** check 2.9 and the FR/ES item of 2.4.
- Code-accuracy checks against `../reboot` (labels via `shared/i18n/en/labels.json`, navigation via `frontend/src/app/side-bar.ts` + `frontend/src/components/settings/settings-menu.ts`, plans via `shared/subscription.ts`).
- The verdict rubric from "Shared definitions" above, verbatim.
- **Report only — do not modify any file.**
- Required output per page, exactly one line: `<verdict> | <path> | <critical>/<warnings> | <top issues, semicolon-separated, citing feedback.md rule names>`

- [ ] **Step 3: Collect results**

Assemble all 63 verdict lines. If any subagent failed or skipped a page, re-dispatch for the missing pages — every page must have a verdict.

### Task 5: Merge into `.todo/overhaul-worklist.md`

**Files:**
- Create: `.todo/overhaul-worklist.md`

- [ ] **Step 1: Write the worklist**

Structure (verdict lines from Task 4, `write` lines from `.todo/gaps.md`, using the shared line format):

```markdown
# Overhaul worklist

Generated: 2026-06-10
Sources: classification /review --all (Task 4) + .todo/gaps.md (Task 3)
Verdicts: keep | fix | rewrite | deprecate | write

## Summary

| Tab | keep | fix | rewrite | deprecate | write |
|---|---|---|---|---|---|
| Documentation | … | … | … | … | … |
| Guides | … | … | … | … | … |
| Integrations | … | … | … | … | … |
| API | … | … | … | … | … |
| News | … | … | … | … | … |

## Documentation

- [ ] fix | help/documentation/timesheets.mdx | 3/2 | [+] icon naming (add-controls rule); title 64 chars (title-format rule); …

## Guides
…
```

`help/index.mdx` gets its own line under a final `## Landing page` H2.

- [ ] **Step 2: Safety valve**

Count rewrites: if `rewrite` verdicts exceed 50% of existing pages (>31), STOP — present the numbers to Yves and revisit the fix-vs-rewrite posture before any Phase 2 work (per spec "Error handling").

- [ ] **Step 3: Commit**

```bash
git add .todo/overhaul-worklist.md
git commit -m "review: classification worklist for English overhaul (keep/fix/rewrite/deprecate/write)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 6: 👤 CHECKPOINT 1 — Yves approves the worklist

- [ ] **Step 1:** Present the summary table plus the full **rewrite** and **deprecate** lists (the expensive/destructive calls) and the `write` list from gaps.
- [ ] **Step 2:** Apply any verdict changes Yves requests; amend the worklist; commit amendments.
- [ ] **Step 3:** Get explicit go-ahead before Phase 2. **Do not proceed without it.**

---

## Phase 2 — Batched remediation

Batches (per `docs.json` groups; sized for digestible human review):

| Batch | Scope | Pages |
|---|---|---|
| 2a | Documentation: Getting started, Manage, Time Tracking, Tasks & Planning, Time Off | 15 |
| 2b | Documentation: Financial, Reporting, Configuration | 13 |
| 2c | Documentation: Communication, Account, Devices | 9 |
| 2d | Guides (all groups) | 5 |
| 2e | Integrations (all groups) | 13 |
| 2f | API (all groups) | 6 |
| 2g | News (+ optional `/news` catch-up) | 1 |

Counts are existing pages; each batch also picks up its tab/groups' `write` lines from the worklist. If Yves prefers, 2d/2f/2g can be reviewed together at Checkpoint time — but they are still committed as separate batches.

### Task 7: Batch 2a — Documentation: Getting started, Manage, Time Tracking, Tasks & Planning, Time Off

**Files:**
- Modify/create/delete: pages in the 5 groups above per worklist verdicts; `docs.json` (nav entries for new/deleted pages; `redirects` array for deletions/renames)
- Modify: `.todo/overhaul-worklist.md` (tick lines), `.todo/gaps.md` (tick consumed entries)

- [ ] **Step 1: Extract the batch worklist** — from `.todo/overhaul-worklist.md`, list this batch's `fix` / `rewrite` / `deprecate` / `write` lines. `keep` lines: tick immediately.
- [ ] **Step 2: Rewrites and new pages** — invoke the `write` skill for each `rewrite` page (regenerate from `features.md` + `../reboot`, preserving the slug) and each `write` page (per its `gaps.md` entry). `/write` applies guardrails inline; new pages get `docs.json` nav entries in the matching group.
- [ ] **Step 3: In-place fixes** — for each `fix` page: open it; for each violation cited on its worklist line, apply the correction dictated by the named `feedback.md` / context rule (verbatim labels from `labels.json`, navigation routes from `side-bar.ts` / `settings-menu.ts`, US spellings, title format `Feature — Beebole` 50–60 chars, etc.). Touch nothing the worklist or rulebook doesn't call for.
- [ ] **Step 4: Deprecations** — for each `deprecate` page: delete the `.mdx`, remove its `docs.json` nav entry, and append to `docs.json` a redirect `{"source": "/help/<old-path>", "destination": "/help/<nearest-relevant-page>"}` (create the top-level `redirects` array on first use — verify key syntax against Mintlify docs via MCP).
- [ ] **Step 5: Inbound-link sweep** — for every page changed in Steps 2–4, run `grep -rn "<page-url-path>" help docs.json --include='*.mdx' | grep -v '^help/fr/' | grep -v '^help/es/'` and check each referencing card/link description against the page's new content (feedback.md rule: descriptions must match actual content). Fix mismatches.
- [ ] **Step 6: Gate review** — invoke the `review` skill scoped to this batch's changed files (session scope), with the review-gate modifications from Shared definitions. Apply all critical fixes; re-run until no criticals remain.
- [ ] **Step 7: Validate links** — run `mintlify broken-links`. Expected: clean.
- [ ] **Step 8: Update trackers** — tick this batch's lines in `.todo/overhaul-worklist.md` and consumed entries in `.todo/gaps.md`.
- [ ] **Step 9: Commit**

```bash
git add help docs.json .todo/overhaul-worklist.md .todo/gaps.md
git commit -m "overhaul(2a): Documentation — getting started, manage, time tracking, planning, time off

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 10: 👤 CHECKPOINT** — run the Batch checkpoint procedure (Shared definitions). Wait for go-ahead.

### Task 8: Batch 2b — Documentation: Financial, Reporting, Configuration

**Files:** as Task 7, scoped to these 3 groups (13 pages + this scope's `write` lines)

- [ ] **Step 1: Extract the batch worklist** — from `.todo/overhaul-worklist.md`, list this batch's `fix` / `rewrite` / `deprecate` / `write` lines. `keep` lines: tick immediately.
- [ ] **Step 2: Rewrites and new pages** — invoke the `write` skill for each `rewrite` page (regenerate, same slug) and each `write` page (per its `gaps.md` entry); add `docs.json` nav entries for new pages.
- [ ] **Step 3: In-place fixes** — for each `fix` page, apply the correction each cited rule dictates, checking labels/navigation/plans against `../reboot` sources named in the rules.
- [ ] **Step 4: Deprecations** — delete page, remove nav entry, append redirect to `docs.json`.
- [ ] **Step 5: Inbound-link sweep** — grep each changed page's URL path across `help/**` (EN) + `docs.json`; fix stale card/link descriptions.
- [ ] **Step 6: Gate review** — `review` skill on this batch's changed files, translation checks off; fix criticals until clean.
- [ ] **Step 7: Validate links** — `mintlify broken-links`. Expected: clean.
- [ ] **Step 8: Update trackers** — tick worklist + gaps lines.
- [ ] **Step 9: Commit**

```bash
git add help docs.json .todo/overhaul-worklist.md .todo/gaps.md
git commit -m "overhaul(2b): Documentation — financial, reporting, configuration

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 10: 👤 CHECKPOINT** — Batch checkpoint procedure. Wait for go-ahead.

### Task 9: Batch 2c — Documentation: Communication, Account, Devices

**Files:** as Task 7, scoped to these 3 groups (9 pages + this scope's `write` lines)

- [ ] **Step 1: Extract the batch worklist**; tick `keep` lines.
- [ ] **Step 2: Rewrites and new pages** via the `write` skill; nav entries for new pages.
- [ ] **Step 3: In-place fixes** per cited rules, verified against `../reboot`.
- [ ] **Step 4: Deprecations** — delete, de-nav, redirect.
- [ ] **Step 5: Inbound-link sweep** on changed pages; fix stale descriptions.
- [ ] **Step 6: Gate review** (translation checks off); fix criticals until clean.
- [ ] **Step 7:** `mintlify broken-links` — clean.
- [ ] **Step 8: Update trackers.**
- [ ] **Step 9: Commit**

```bash
git add help docs.json .todo/overhaul-worklist.md .todo/gaps.md
git commit -m "overhaul(2c): Documentation — communication, account, devices

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 10: 👤 CHECKPOINT** — Batch checkpoint procedure. Wait for go-ahead.

### Task 10: Batch 2d — Guides

**Files:** as Task 7, scoped to `help/guides/**` (5 pages + this tab's `write` lines)

Note: audience for Guides differs (see `audiences.md`) — role-based guides address managers/admins; the gate review checks tone against that.

- [ ] **Step 1: Extract the batch worklist**; tick `keep` lines.
- [ ] **Step 2: Rewrites and new pages** via the `write` skill; nav entries for new pages.
- [ ] **Step 3: In-place fixes** per cited rules, verified against `../reboot`.
- [ ] **Step 4: Deprecations** — delete, de-nav, redirect.
- [ ] **Step 5: Inbound-link sweep** on changed pages; fix stale descriptions.
- [ ] **Step 6: Gate review** (translation checks off); fix criticals until clean.
- [ ] **Step 7:** `mintlify broken-links` — clean.
- [ ] **Step 8: Update trackers.**
- [ ] **Step 9: Commit**

```bash
git add help docs.json .todo/overhaul-worklist.md .todo/gaps.md
git commit -m "overhaul(2d): Guides

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 10: 👤 CHECKPOINT** — Batch checkpoint procedure. Wait for go-ahead.

### Task 11: Batch 2e — Integrations

**Files:** as Task 7, scoped to `help/integrations/**` (13 pages + this tab's `write` lines)

Note: integration pages were the worst offenders for invented plan tiers ("Pro and Enterprise") — Step 3/6 must check every plan claim against `../reboot/shared/subscription.ts`.

- [ ] **Step 1: Extract the batch worklist**; tick `keep` lines.
- [ ] **Step 2: Rewrites and new pages** via the `write` skill; nav entries for new pages.
- [ ] **Step 3: In-place fixes** per cited rules, verified against `../reboot`.
- [ ] **Step 4: Deprecations** — delete, de-nav, redirect.
- [ ] **Step 5: Inbound-link sweep** on changed pages; fix stale descriptions.
- [ ] **Step 6: Gate review** (translation checks off); fix criticals until clean.
- [ ] **Step 7:** `mintlify broken-links` — clean.
- [ ] **Step 8: Update trackers.**
- [ ] **Step 9: Commit**

```bash
git add help docs.json .todo/overhaul-worklist.md .todo/gaps.md
git commit -m "overhaul(2e): Integrations

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 10: 👤 CHECKPOINT** — Batch checkpoint procedure. Wait for go-ahead.

### Task 12: Batch 2f — API

**Files:** as Task 7, scoped to `help/api/**` (6 pages + this tab's `write` lines)

Note: API pages are exempt from the FAQ rule and the no-jargon rule; technical accuracy is checked against `../reboot/backend`. Title format is `<Topic> — Beebole API`.

- [ ] **Step 1: Extract the batch worklist**; tick `keep` lines.
- [ ] **Step 2: Rewrites and new pages** via the `write` skill; nav entries for new pages.
- [ ] **Step 3: In-place fixes** per cited rules, verified against `../reboot`.
- [ ] **Step 4: Deprecations** — delete, de-nav, redirect.
- [ ] **Step 5: Inbound-link sweep** on changed pages; fix stale descriptions.
- [ ] **Step 6: Gate review** (translation checks off, FAQ/jargon exemptions on); fix criticals until clean.
- [ ] **Step 7:** `mintlify broken-links` — clean.
- [ ] **Step 8: Update trackers.**
- [ ] **Step 9: Commit**

```bash
git add help docs.json .todo/overhaul-worklist.md .todo/gaps.md
git commit -m "overhaul(2f): API

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 10: 👤 CHECKPOINT** — Batch checkpoint procedure. Wait for go-ahead.

### Task 13: Batch 2g — News

**Files:** as Task 7, scoped to `help/news/releases.mdx`

- [ ] **Step 1: Extract the batch worklist**; tick `keep` line if clean.
- [ ] **Step 2: Apply worklist fixes** to `releases.mdx` per cited rules (no rewrites here — release history is append-only; fix violations in place).
- [ ] **Step 3 (optional, ask Yves): `/news` catch-up** — invoke the `news` skill to draft release notes from app-repo commits since the most recent `<Update>` block in `help/news/releases.mdx`.
- [ ] **Step 4: Gate review** (translation checks off); fix criticals until clean.
- [ ] **Step 5:** `mintlify broken-links` — clean.
- [ ] **Step 6: Update trackers.**
- [ ] **Step 7: Commit**

```bash
git add help .todo/overhaul-worklist.md
git commit -m "overhaul(2g): News

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 8: 👤 CHECKPOINT** — Batch checkpoint procedure. Wait for go-ahead.

---

## Phase 3 — Site-wide coherence pass

### Task 14: Coherence checklist

**Files:**
- Possibly modify: `docs.json`, `help/index.mdx`, `.claude/context/page-mappings.md`

- [ ] **Step 1: Nav ↔ disk reconciliation**

```bash
python3 - <<'EOF'
import json, glob
d = json.load(open('docs.json'))
en = [l for l in d['navigation']['languages'] if l['language'] == 'en'][0]
pages = []
def walk(o):
    if isinstance(o, str): pages.append(o)
    elif isinstance(o, dict):
        for k in ('pages', 'groups', 'tabs'): walk(o.get(k, []))
    elif isinstance(o, list):
        for i in o: walk(i)
walk(en['tabs'])
print('sample nav entries:', pages[:3])  # confirm path format before trusting the diff
disk = {p[:-4] for p in glob.glob('help/**/*.mdx', recursive=True)
        if not p.startswith(('help/fr/', 'help/es/'))}
nav = set(pages)
print('In nav, not on disk:', sorted(nav - disk))
print('On disk, not in nav:', sorted(disk - nav))
EOF
```

Expected: both diff lists empty (after normalizing the path format seen in the sample line; `help/index` is the landing page and legitimately outside tabs). Fix any drift in `docs.json`.

- [ ] **Step 2: Redirects** — list every page deleted or renamed in Phase 2 (from worklist `deprecate` lines + any slug changes); confirm each has a `redirects` entry in `docs.json`.
- [ ] **Step 3: Landing page** — read `help/index.mdx`; check every `<Card>` description against the target page's actual H2s (feedback.md rule). Fix mismatches.
- [ ] **Step 4: `page-mappings.md` sync** — add rows for pages created in Phase 2, remove rows for deprecated pages.
- [ ] **Step 5: Final link check** — `mintlify broken-links`. Expected: clean.
- [ ] **Step 6: Worklist completeness** — `grep -c '^- \[ \]' .todo/overhaul-worklist.md`. Expected: `0` (every line ticked).
- [ ] **Step 7: Commit**

```bash
git add docs.json help/index.mdx .claude/context/page-mappings.md .todo/overhaul-worklist.md
git commit -m "overhaul: site-wide coherence pass (nav, redirects, landing cards, page mappings)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Phase 4 — Illustration planning

### Task 15: Regenerate `screenshot-needs.md` and diff against April baseline

**Files:**
- Overwrite: `.todo/screenshot-needs.md`

- [ ] **Step 1: Snapshot the old baseline**

Run: `git show $(git rev-list -1 HEAD -- .todo/screenshot-needs.md):.todo/screenshot-needs.md > /tmp/screenshot-needs-2026-04-07.md && wc -l /tmp/screenshot-needs-2026-04-07.md`
Expected: the 2026-04-07 inventory (210 entries) saved aside.

- [ ] **Step 2: Regenerate** — invoke the `illustrate` skill with `--identify` (no path → scans all EN `.mdx`). Write the regenerated inventory to `.todo/screenshot-needs.md` in the same table format (file path | description | priority), with a fresh `Generated:` date and summary line.
- [ ] **Step 3: Diff against baseline** — compare new inventory to `/tmp/screenshot-needs-2026-04-07.md`: mark entries as *carried over* (same need survives), *new* (from rewritten/new pages), or *dropped* (content no longer exists in that form). Add a `## Changes since 2026-04-07` section summarizing counts.
- [ ] **Step 4: Prioritize** — order the capture list high → medium → low, grouped by page; flag the top ~20 high-priority shots as the suggested first capture session.
- [ ] **Step 5: Commit**

```bash
git add .todo/screenshot-needs.md
git commit -m "illustrate: regenerate screenshot needs against overhauled English content

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 6: 👤 CHECKPOINT 3 — Yves approves the screenshot list.** Capture (`/illustrate --capture`) and `/translate` are follow-on efforts outside this plan.

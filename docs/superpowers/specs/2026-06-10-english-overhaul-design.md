# English-only documentation overhaul — design

**Date:** 2026-06-10
**Status:** Approved by Yves
**Goal:** Bring every English page up to the full current rulebook (all guardrails in `.claude/context/feedback.md`, refreshed `features.md` of 2026-06-10, SEO/GEO rules), fill coverage gaps, and finish with a refreshed illustration plan. Translation is deferred until English stabilizes.

## Context

The site (63 EN pages) was largely written before the editorial guardrails existed — before the anti-SaaS-cliché rule, verbatim UI labels, navigation routing rules, US-English convention, and the rest of the ~15 site-wide rules accumulated through `/triage`. `features.md` was reviewed today, so the catalog is current. `.todo/screenshot-needs.md` (2026-04-07, 210 entries) predates this overhaul and will need regeneration.

## Decisions made

| Decision | Choice | Rationale |
| --- | --- | --- |
| FR/ES handling | Hide from `docs.json` navigation; keep `help/fr/` and `help/es/` files in the repo | Reversible; `/translate` detects staleness and resyncs later. Avoids publishing stale translations during the overhaul. |
| Cleanup posture | Classify first, then fix in place or rewrite per page | Effort goes where needed; preserves good pages and accumulated per-page fixes from past triage rounds. |
| Sequencing | Global read-only map, then batched remediation by tab | Human review stays digestible; a misread guardrail costs one batch, not the site; triage feedback compounds mid-project. |

## Phase 0 — Switch publishing to EN-only

- Remove the `fr` and `es` entries from `navigation.languages` in `docs.json`. Do not touch `help/fr/` or `help/es/` files.
- Before committing, check Mintlify docs (Mintlify MCP server) for the behavior of pages on disk but absent from navigation: direct-URL access and `llms.txt` / `llms-full.txt` inclusion. If stale FR/ES pages remain reachable or indexable, decide mitigation then (e.g. exclusion config), not preemptively.
- Run `mintlify broken-links` to catch EN pages linking into FR/ES.

## Phase 1 — Global map (read-only with respect to `help/**`; writes only `.todo/` working files)

1. **`/find-gaps`** — compare `features.md` against `help/**`; writes `.todo/gaps.md` (Missing/Partial).
2. **Classification-only `/review --all`** — audit every EN page against the full rulebook (site-wide + per-page feedback rules, SEO/GEO, code accuracy vs `../reboot`), via parallel subagents, with two explicit modifications:
   - **Report, don't fix** — no content changes in this phase.
   - **Skip translation checks** — FR/ES is out of scope.

   Verdict per page:
   - **keep** — clean or trivial issues only
   - **fix** — a few violations, sound skeleton
   - **rewrite** — structurally rotten (SaaS-cliché-era); regenerate with `/write`
   - **deprecate** — documents features no longer in `../reboot`

3. **Merge** into `.todo/overhaul-worklist.md`: every existing page with verdict + violation summary, plus every missing page from `gaps.md`, grouped by tab.

**👤 Checkpoint 1:** Yves approves the worklist — especially rewrite and deprecate lists (the expensive/destructive calls).

## Phase 2 — Batched remediation by tab

Order: **Documentation → Guides → Integrations → API → News.** Documentation first because everything links into it.

Per batch:

1. `/write` regenerates each **rewrite** page and drafts the tab's **missing** pages from `gaps.md`.
2. In-place edits for **fix** pages; for **deprecate** pages: delete, update `docs.json`, add redirects.
3. Session-scoped `/review` as the quality gate (translation checks off).
4. **Inbound-link sweep:** cards/links elsewhere on the site pointing into this batch get descriptions re-checked against the new content (filed guardrail: card descriptions must match target content).
5. Commit the batch.

**👤 Checkpoint 2 (recurring):** Yves reviews each batch. Markup goes into `docs/feedback/`; `/triage` files rules into `feedback.md` **before the next batch runs**.

Batch notes:

- API tab is exempt from the FAQ rule and the no-jargon rule.
- News batch: optionally run `/news` to catch up release notes since the most recent `<Update>` block in `help/news/releases.mdx`.
- Known pre-filed rewrite: `/help/documentation/roles-authorisations` (restructure by permission type, per `feedback.md` per-page rule).

## Phase 3 — Site-wide coherence pass

A checklist pass, not another full review:

- `docs.json` navigation matches the final page set (new pages added, deleted pages removed).
- Redirects exist for renamed or deleted slugs.
- Landing page (`help/index.mdx`) cards match final content.
- `page-mappings.md` synced with any added/removed pages.
- `mintlify broken-links` clean.

## Phase 4 — Illustration planning

- Rerun `/illustrate --identify` against the final content to regenerate `.todo/screenshot-needs.md`.
- Diff against the 2026-04-07 version: carry over still-valid entries, drop entries for content that no longer exists in that form, deduplicate.
- Output: prioritized capture list.

**👤 Checkpoint 3:** Yves approves the screenshot list.

## Out of scope (deferred until English stabilizes)

- `/translate` sync of FR/ES.
- Screenshot capture (`/illustrate --capture`) — follow-on effort after Checkpoint 3.
- Restoring FR/ES navigation in `docs.json`.

## Error handling / fallbacks

- `../reboot` is the source of truth for code-accuracy checks; if unavailable, skills fall back to the GitHub API (`gh api repos/beebole/reboot/...`) per CLAUDE.md, and any skipped checks are reported, never silently degraded.
- If the classification pass produces an unexpectedly large rewrite list (e.g. >50% of pages), pause and revisit the posture with Yves before Phase 2 rather than proceeding.

## Deliverables

- `docs.json` publishing EN only.
- `.todo/gaps.md` (produced, then consumed by Phase 2).
- `.todo/overhaul-worklist.md` — master verdict list.
- All EN pages remediated and gate-reviewed, committed in per-tab batches.
- Refreshed `.todo/screenshot-needs.md` with prioritized capture list.

# Documentation gaps mined from AI assistant conversations

Mined through: 2026-08-17T14:05:00Z

**Source:** Mintlify docs-assistant conversations pushed to PostHog (prod project 39108, `$ai_generation` events, trace-level analysis).
**Window analyzed:** 2026-07-07 → 2026-08-05 (30 days).
**Volume:** 37 conversations, 69 user messages.
**Method:** pulled full inputs/outputs from `posthog.ai_events`, clustered themes, then verified each candidate gap against `help/**` and the app code in `../reboot` before classifying.

---

## 1. Real gaps — content missing or insufficient

### GAP-1 — "Which version of Beebole am I on?" routing (HIGH — 3 separate sessions)

Three users on the **Legacy UI** were walked through new-platform instructions and hit dead ends:

- 2026-07-27 (API session): told to click "initials at the bottom left of the sidebar" — doesn't exist in their UI; only discovered at the end of a 7-message session that the GraphQL API doesn't apply to them.
- 2026-08-05 11:23 (roles session, 9 messages): told to configure "Person roles" — "there are no module person roles"; assistant only concluded at the end "your interface appears to be an older version".
- 2026-08-05 12:35 (freelancer visibility): same user/UI, session ended unresolved ("so you cant help me right now").

**Fix:**
- Add a short "Which version am I using?" identification aid (visual cues: sidebar with initials avatar = new platform; module-based home screen = Legacy) — either on `help/documentation/legacy-migration.mdx` or as a snippet/callout.
- Add a Legacy callout near the top of the pages legacy users most often land on: `help/api/introduction.mdx`, `help/documentation/roles-authorisations.mdx`, `help/documentation/timesheetSettings.mdx` → pointing to the `help/legacy/**` equivalent.

### GAP-2 — GraphQL API troubleshooting for auth/permissions (HIGH — longest session, 7 messages)

The 2026-07-27 session surfaced three specific confusions none of which `help/api/introduction.mdx` answers head-on:

1. **Empty `data` + `permissionsErrors` even with a wrong `apikey`** — the API returns `permissionsErrors` instead of `APIKeyError` in some invalid-key cases; user couldn't tell auth failure from permission failure.
2. **Plain text vs base64** — Legacy API uses base64 basic auth; GraphQL uses the plain key in the `apikey` header. Users migrating carry the base64 habit over. Worth an explicit "use the key as-is, not base64-encoded" note.
3. **"GraphQL doesn't work at all on Legacy accounts"** — the answer exists on `legacy-migration.mdx` but not on the API introduction where the user is actually failing. State on `help/api/introduction.mdx`: Legacy accounts must use the [Legacy API](/help/api/legacy-api); calling `/graphql` from a Legacy account yields empty `data` + `permissionsErrors`.

**Fix:** add a Troubleshooting section (or FAQ entries) to `help/api/introduction.mdx` covering these three symptoms.

### GAP-3 — Filtering time records by approval status via API (MEDIUM — 2 sessions, verified in code)

Users asked "which api gives me draft timesheets awaiting approval?" and "how do I filter by draft status?". **Verified in `../reboot/backend/src/application/filter.ts` (BeeboleTimeRecordFilter, line 485): there is no approval-status filter field.** The correct answer (fetch records, filter client-side on the returned `status` field: `d` draft, `s` submitted, …) is nowhere in `help/api/`.

**Fix:** add an FAQ/example to `help/api/queries.mdx` (or an `examples/` page): "How do I get draft / awaiting-approval time records?" — including the `status` value codes.
**Product signal:** a `status` field on `BeeboleTimeRecordFilter` is a recurring API user need.

### GAP-4 — Multi-currency behavior / conversion (MEDIUM)

"How does Beebole handle currency conversions" (2026-07-15, asked twice). Docs mention currency in `account-settings.mdx`, per-rate currency in `billing.mdx`/`costs.mdx`, and a report-wide "currency picker" in `custom-reports.mdx:99` — but nowhere explain **whether/how amounts in different currencies are converted** (what exchange rate, when, what the report picker actually does).

**Fix:** verify behavior in `../reboot` (reporting engine), then document it — likely a subsection on `custom-reports.mdx` plus an FAQ on `costs.mdx`. *Needs code verification before writing.*

### GAP-5 — Role/visibility recipes for common team shapes (MEDIUM)

"Why can't project managers see all the hours?", "PMs must see staff **and** freelancers' time; freelancers must not see others'." `roles-authorisations.mdx` documents the permission matrix but has no scenario-based recipes. Two sessions on this theme; one ended unresolved.

**Fix:** add a "Common setups" section or FAQ entries to `help/documentation/roles-authorisations.mdx`: (a) project manager sees all time on their projects, (b) contractors/freelancers see only their own time, (c) combining both.

### GAP-6 — Overtime how-to (LOW)

"How can I calculate overtime in Beebole" (2026-07-24). Pieces exist (`work-schedule.mdx`, Overtime columns listed in `custom-reports.mdx:72`) but there's no end-to-end recipe (assign schedule → add Overtime column/comparison in a report).

**Fix:** FAQ on `work-schedule.mdx` or `custom-reports.mdx`: "How do I report overtime?" with the 2-step recipe.

---

## 2. Covered, but users still failed — discoverability/FAQ fixes

### DISC-1 — Lock a single project / lock weekly (HIGH — session ended with user believing it's impossible)

2026-08-05 12:03: user asked to lock projects weekly so time can't be added retroactively. `timesheetSettings.mdx:70` **already documents** that the Lock date can be set per person, team, **or project** — but the session ended with the user concluding "only for one project it is impossible" and the assistant's last words "Let me check the documentation."

**Fix:** add explicit FAQ entries to `timesheetSettings.mdx`: "Can I lock time entries for a single project?" and "Who can set the lock date — project managers or only admins?" (the second question was asked and never answered).

### DISC-2 — "Absence quota" terminology (LOW)

"i can not find the absence quota" (2026-07-10). `timeoff.mdx` uses **allowance** (33×) vs quota (5×). If the app UI says one and users say the other, an FAQ line bridging the two terms ("Looking for absence quotas? In Beebole they're **time off allowances**…") plus a `keywords:` frontmatter addition would catch both the assistant retrieval and site search.

### DISC-3 — Clock-in methods overview (LOW)

"what are the different ways to clock in with beebole?", "where to find the timer", "face recognition available?". The answers exist scattered (timer in `timesheets.mdx`, browser extension, desktop app, mobile). A single FAQ on `timesheets.mdx` — "What are the ways to record time?" — would let the assistant answer in one shot. For **face recognition**: verify it's not supported, then answer it honestly in an FAQ (it keeps being asked; legacy had a Time clock page).

---

## 3. Signals that are NOT doc gaps (route elsewhere)

- **Language demand:** ~10% of messages were French/Spanish ("soumettre" ×3, "Puedes poner el vídeo en español?", "translate this page to Spanish"). Docs went EN-only in June 2026 — real user demand for FR/ES exists. Business decision, not a page fix.
- **Assistant dead-ends:** two sessions ended with the assistant saying "Let me check the documentation" / "Let me look into this properly" and then nothing — the Mintlify assistant appears to hit a turn/tool limit mid-answer. Worth raising with Mintlify.
- **API feature request:** approval-status filter on `BeeboleTimeRecordFilter` (see GAP-3).
- **Screenshots in chat:** legacy-UI users pasted screenshots the assistant couldn't reconcile with new-UI docs — GAP-1 is the docs-side mitigation.

---

## Repeatability

This analysis is repeatable as a periodic pass (e.g. monthly, alongside `/news`). Since 2026-08-05 the n8n workflow also emits one **`docs_assistant_conversation`** event per thread — a permanent, role-tagged full transcript (`properties.conversation` = `[{role, content}, …]`) with standard event retention, so the 30-day `posthog.ai_events` content cliff no longer applies:

1. Query PostHog prod (project 39108): `SELECT … FROM events WHERE event = 'docs_assistant_conversation'` — take the latest event per `trace_id` (`argMax` on `captured_at`; threads that grow re-emit fuller transcripts).
2. Cluster themes; flag conversations with `message_count` > 3 or unresolved endings as high-signal.
3. Verify every candidate against `help/**` (grep) and `../reboot` (code) before calling it a gap.
4. File entries here; feed HIGH items into `/write` / `/review` like `gaps.md` entries.

Note: 13 conversations from Jul 1–6 (recovered from the Mintlify API during the 2026-08-05 backfill, after their `posthog.ai_events` content had already expired) were **not part of the analysis above** — worth folding into the next pass.

---

## Pending review (run 2026-08-17)

**Window:** no `docs_assistant_conversation` events newer than the 2026-08-05 cursor (latest capture 2026-08-05 18:41 UTC). ⚠️ Zero assistant conversations captured in 12 days — verify the n8n workflow "PROD - Mintlify Assistant LLM Analytics" is still running before the next pass.

This run instead folded in the **13+ recovered Jul 1–7 conversations** flagged as unanalyzed by the 2026-08-05 run (16 threads total, pulled from PostHog with `timestamp < 2026-07-08`).

- [ ] MEDIUM | `help/documentation/timesheets.mdx` | FAQ: can the **Work from home** checkbox be hidden? — evidence: 1 conversation (2026-07-01, 6 messages), "How do I remove the work from home box"; verified in code: no setting exists to hide it, so the assistant correctly found nothing — a preemptive FAQ stating this would stop the search. Also a product signal worth passing to the app team.
- [ ] MEDIUM | `help/api/queries.mdx` | Per-entity filter-field reference for queries — evidence: 1 conversation (2026-07-03, 9 messages, FR), user fought to discover `getProjects` filter params (`managedById`) and how to reproduce the Budget Status manager scope via the API; the fields are mentioned in one prose sentence but were not found — consider a compact per-entity filter table and a "projects I manage" example.

**Not doc gaps (no entry):**

- Custom-field filters in the Reports filter menu (2 threads, 2026-07-03, one unresolved) — verified: report filters offer person/project/task/tag/absence-type/expense-type only; person-custom-field filtering exists on the Planning route, not Reports. Product feature signal; the complaint itself concerned the legacy product's reporting page.
- Spanish video request on the Quickstart (2026-07-07) — language-demand signal, not a page fix (site is EN-only by decision).
- Legacy reporting "AND/OR conditions disappeared" and legacy `project.list` filter questions — legacy product/API; the legacy archive is frozen by policy.

**Covered (no action):**

- "How do I see what weeks have less than 40 submitted" (2026-07-06) — now directly answered by the new **Timesheet Compliance** report documented in this release.
- Lock date, adding work schedules, schedule intervals, assigning roles, absence types per tag, restricting entry edits, deleting a mistaken task — all answered by the assistant from existing pages on first or second try.

# Documentation gaps mined from AI assistant conversations

Mined through: 2026-09-21T14:37:23Z

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

- [x] MEDIUM | `help/documentation/timesheets.mdx` | FAQ: can the **Work from home** checkbox be hidden? — evidence: 1 conversation (2026-07-01, 6 messages), "How do I remove the work from home box"; verified in code: no setting exists to hide it, so the assistant correctly found nothing — a preemptive FAQ stating this would stop the search. Also a product signal worth passing to the app team.
- [x] MEDIUM | `help/api/queries.mdx` | Per-entity filter-field reference for queries — evidence: 1 conversation (2026-07-03, 9 messages, FR), user fought to discover `getProjects` filter params (`managedById`) and how to reproduce the Budget Status manager scope via the API; the fields are mentioned in one prose sentence but were not found — consider a compact per-entity filter table and a "projects I manage" example.

**Not doc gaps (no entry):**

- Custom-field filters in the Reports filter menu (2 threads, 2026-07-03, one unresolved) — verified: report filters offer person/project/task/tag/absence-type/expense-type only; person-custom-field filtering exists on the Planning route, not Reports. Product feature signal; the complaint itself concerned the legacy product's reporting page.
- Spanish video request on the Quickstart (2026-07-07) — language-demand signal, not a page fix (site is EN-only by decision).
- Legacy reporting "AND/OR conditions disappeared" and legacy `project.list` filter questions — legacy product/API; the legacy archive is frozen by policy.

**Covered (no action):**

- "How do I see what weeks have less than 40 submitted" (2026-07-06) — now directly answered by the new **Timesheet Compliance** report documented in this release.
- Lock date, adding work schedules, schedule intervals, assigning roles, absence types per tag, restricting entry edits, deleting a mistaken task — all answered by the assistant from existing pages on first or second try.

---

## Pending review (run 2026-08-24)

**Window:** 2026-08-19 → 2026-08-24, 15 threads (the n8n workflow is capturing again — the 12-day silence flagged on 2026-08-17 has resolved; events resumed 2026-08-19).

- [x] HIGH | `help/documentation/approval.mdx` | FAQ + clarification: how to let someone edit an **approved** timesheet, and where the **Reject** button actually appears — evidence: 6 conversations (2026-08-20, incl. one 5-message session and one Spanish thread), "I am not able to reopen accepted timesheet as an admin" / "i went to timesheet, pending, opened their timesheet but the reject button does not appear". Verified: the answer exists (`approval.mdx` §Force approve and reject — an admin can reject an already-approved timesheet, unlocking it for the owner), but the page never says an *approved* timesheet must be opened via the **Team** pane (the **Pending** pane only lists submissions awaiting approval), which is exactly where the user got stuck. Covered-but-failed → add an FAQ "How do I reopen an approved timesheet so its owner can edit it?" and one sentence in §Force approve and reject naming the Team pane as the way in.
- [x] MEDIUM | `help/documentation/work-schedule.mdx` | Cross-link/FAQ: schedules display expected hours but don't fill timesheets — point to what does — evidence: 1 conversation (2026-08-20), "How do I build a schedule that populates people's timesheets". Verified: nothing on the page connects schedules to **Auto Timesheet from Planning** or suggested entries. Covered-but-failed → FAQ: "Can a work schedule fill in timesheets automatically?" answering no, and linking `timesheetSettings.mdx` §Auto Timesheet from Planning and `ai.mdx` suggestions.
- [x] MEDIUM | `help/documentation/people.mdx` | FAQ: why the **Invite by email** button is missing — evidence: 3 conversations (2026-08-24, Korean-language user who landed on `help/legacy/organizing-people`), "I opened the profile like the screenshot but can't find the invite button". Verified in code (`person-invite.ts`): the button renders only while the person has not joined; once they have an account it disappears, and **Invitation pending** shows while an invite is outstanding. The page documents sending invitations but never says the button goes away after the person joins → FAQ: "Why don't I see the Invite by email button on a profile?"

**Not doc gaps (no entry):**

- Language demand continues: one Spanish thread (approval flow) and three Korean threads this window — business signal, docs are EN-only by decision.
- App-copy signal: the invite-link helper text still says "configure a password" (`labels.json` `user.invited`) although Beebole is passwordless — route to the app team.
- Noise: "qb" (unanswered single token), "API" and "reject" (accidental/empty probes) — no theme.


---

## Pending review (run 2026-08-31)

**Window:** 2026-08-24T14:34:49Z → 2026-08-31 (release run, prod deploy 2026-08-30).
**Volume:** 19 threads, 19 user messages — every thread a single message, all marked `answered` by Mintlify, all `high` match confidence. No multi-turn struggle sessions this window, so the signal is thematic (repeat questions across sessions) rather than per-session friction.
**Method:** latest transcript per `trace_id` from `docs_assistant_conversation`; each candidate verified against `help/**` and the app code in `../reboot` before classifying.

### Real gaps — content missing or insufficient

- [x] MEDIUM | `help/documentation/troubleshooting.mdx` | No answer for "my timesheet shows no projects to pick" — evidence: 1 conversation (2026-08-28), user reports the project list is empty when adding a row and only absences appear. The mechanism is documented (project availability lives in [Assignments](/help/documentation/assignments), separate from roles), but nothing routes a person from the symptom to that page. Proposed fix: a troubleshooting entry, or an FAQ item on `timesheets.mdx`, naming the two causes — no projects assigned to the person, and the section's category not accepting time entries.

### Covered but failed — docs answer it, the reader couldn't get there

- [x] MEDIUM | `help/documentation/timesheets.mdx` | Timesheet period switching is hard to find from the timesheet itself — evidence: 3 conversations from one reader inside 17 minutes (2026-08-27): "day week month disapaird", "day week month missing", "where is the timesheet settings? day month missing". The periodicity options (**Daily**, **Weekly**, **Bi-weekly**, **Semi-monthly**, **Monthly**) are fully documented under **Period & submission** on `timesheetSettings.mdx`, but `timesheets.mdx` never says where the period is set or that it is an account-level setting an admin controls. Proposed fix: a cross-link from the timesheet page plus an FAQ entry. **Also worth an app-team look:** the wording "disappeared" suggests the reader saw a period control and then stopped seeing it — confirm nothing hides it for non-admins or in calendar view.
- [x] LOW | `help/documentation/authentication.mdx` | Password questions don't surface the passwordless page — evidence: 2 conversations (2026-08-25): "pass word", "how to see my pass word". The page opens by stating Beebole has no passwords and has a matching FAQ, but the word "password" is absent from its `keywords`. Proposed fix: add "password", "forgot password", "reset password" to the keyword list so the assistant and search route these straight there.

### Not a doc gap

- Non-English questions (2 FR, 1 PT, 2026-08-25) — readers asking in French and Portuguese about their own report data ("extraire les données concernant la ligne formation", a BRL/USD rate conversion). Language-demand signal for the FR/ES relaunch, not a page fix. The BRL/USD one is a product question about rate currency conversion, best answered by support.
- "create project", "api", "Beebole's REST API for developers", "how to delete a report ?", "how to show audit trail of a time entry", "how i change the default currency in beebole", "re submitt time sheet with correct hours?" — all verified as covered: `projects.mdx`, `api/legacy-api.mdx` and `api/introduction.mdx`, `reports.mdx` (the report **⋯** menu's **Delete**), `audit-trail.mdx` ("See the change history on a record"), `account-settings.mdx` (**Localization** → **Currency**), and `timesheets.mdx` (**Resubmit** after rejection). No action.
- "Timesheet view" ×2, "send the form again" — fragments from the same sessions as the entries above; no independent signal.

---

## Pending review (run 2026-09-07)

**Window:** 2026-08-31T00:00:00Z → 2026-09-07T14:13Z (release run).
**Volume:** 12 threads from roughly 8 distinct readers — every thread a single message, all marked `answered` by Mintlify. Several readers split one struggle across two consecutive traces (same page, seconds or minutes apart), so the per-thread counts below are noted with that in mind.
**Method:** latest transcript per `trace_id` from `docs_assistant_conversation`; each candidate verified against `help/**` and the app code on the `prod` branch of `../reboot` before classifying.

### Real gaps — content missing or insufficient

- [x] HIGH | `help/documentation/custom-fields.mdx` | The page's Delete warning is factually wrong — deletion is refused while values exist — evidence: 1 conversation (2026-09-07), reader pasted the raw error `customField;…;CantDeleteEntityReferencedIn:type=CustomFieldValue,…,key=customFieldId` and asked what it means. Verified in code (`backend/src/application/entities/customField.ts`, `deleteCustomField` declares `customFieldValues` with `force: false`, enforced by `checkReferencesBeforeDeleting` in `backend/src/database/helpers.ts`): Beebole blocks the delete as soon as one stored value references the field. But `custom-fields.mdx:118` states the opposite — "**Delete** removes the custom field entirely, including the values stored on your people, projects, and tasks". Proposed fix: correct the warning to say the delete is refused while any value is stored, name the error the reader will see, and point at the remedy that already exists — clear the values in bulk from [Master data review](/help/documentation/master-data) (its update mode can "Set or clear a value, including a custom field value"), or **Archive** the field instead.
- [x] MEDIUM | `help/documentation/timesheets.mdx` | No answer for "can I import time entries from a file or spreadsheet?" — evidence: 2 threads from one reader 16 seconds apart (2026-09-03, both landing on `help/legacy/learn-the-basics`): "upload timesheet feature?" then "Import time entries from a file/spreadsheet". Verified: paste-from-spreadsheet exists only for entity creation (`pasteEntity` labels — people, projects, tags, tasks) and the timesheet's own paste is copy-period; there is no CSV or file import for time records anywhere in the app. The honest answer is documented nowhere, while the real routes are — copy/paste a period (`timesheets.mdx`), calendar import, `addTimeRecord` in `help/api/mutations.mdx`, and a legacy migration for historical time. Proposed fix: an FAQ on `timesheets.mdx` stating plainly that time entries cannot be imported from a file, and listing those three routes.
- [x] MEDIUM | `help/documentation/legacy-migration.mdx` | The legacy role → new role mapping is never stated — evidence: 1 conversation (2026-09-07), reader pasted their whole legacy Manager permission table asking to reproduce it in the new account, and got a refusal instead of a mapping. Verified in code (`backend/src/lib/legacyMigration.ts`, `USER_GROUP_ROLE_MAP`): the migration assigns legacy admins to **Admin**, employees *and contractors* to **Employee**, managers to **People manager**, project managers to **Project manager**, and anything unrecognised to **Employee**. The page's "What gets migrated" table only says people arrive "with their roles". Proposed fix: add that five-row mapping to the table (or just below it), noting that contractors and employees collapse into one role and that legacy per-permission settings are not carried over — the new [role grid](/help/documentation/roles-authorisations) has to be tuned by hand afterwards.
- [x] MEDIUM | `help/guides/migration.mdx` | DCAA and SOX compliance appear nowhere outside the frozen legacy archive — evidence: 2 threads from one reader 20 seconds apart (2026-09-01), the bare query "dcaa" twice on the migration guide; the assistant did not recognise the term either time and both threads dead-ended. Verified: "dcaa" and "sox" occur only in `help/legacy/settings.mdx` and `help/legacy/timesheets.mdx` — where legacy documents a **DCAA ownership** enforcement toggle, SOX reports, and an audit-trail checkbox — and a case-insensitive grep of `shared`, `backend/src`, and `frontend/src` on `prod` returns nothing, so those toggles do not exist in the new platform. **Needs product confirmation before writing:** what the new platform offers a DCAA-minded account instead (always-on [audit trail](/help/documentation/audit-trail), lock date and entry rules, approval workflow), and whether the compliance claim still holds. Proposed fix once confirmed: a row in **What has changed** plus an FAQ entry using the word DCAA, so the term at least routes somewhere.
- [x] LOW | `help/documentation/data-exports.mdx` | GDPR content is real but unfindable by name — evidence: 1 conversation (2026-09-07), the single word "gdpr" from the `/help` landing page, answered with `match_confidence: none`. The page has a "## GDPR and personal data" section, and `account-settings.mdx` documents **Delete Account** and its 7-day grace period without ever using the word GDPR. Neither page carries "gdpr" in `keywords`. Proposed fix: add "gdpr", "personal data", "right to erasure", "data deletion request" to both keyword lists, and one cross-link from the `account-settings.mdx` deletion section to the GDPR section.

### Covered but failed — docs answer it, the reader couldn't get there

- [x] MEDIUM | `help/documentation/approval.mdx` | Approving on a phone is documented, but only on the mobile page — evidence: 2 threads from one reader 3 minutes apart (2026-09-01): "Approve timesheets from mobile device", then "Show me where to find 'the Approval button on the Timesheet page (or the Journal banner)' in the mobile app. All I have are options for tracking my own time." The assistant handed out desktop instructions first because `approval.mdx:85` says approvers "can act from three places: the **Timesheet** page, the **Journal**, or directly from email" and the page never mentions a phone; the correct answer lives on `mobile.mdx:164` (§Approving team timesheets on mobile — team icon in the header, **Pending** and **Team** tabs, bulk approve). Proposed fix: name mobile as a fourth place on `approval.mdx` with a link to that section, note that the Journal banner is desktop-only, and add an FAQ "Can I approve timesheets from my phone?" that also states the team icon is absent for readers without approver access — which is what this reader actually hit.

### Not a doc gap

- "How do I switch the timesheet view to weekly instead of daily?" (2026-09-07) — answered correctly and with high confidence straight from `timesheetSettings.mdx` (period is an account-level admin setting). Same theme as the open 2026-08-31 entry on `timesheets.mdx`; it argues for keeping that entry but downgrading its urgency, since retrieval is now working.
- "What is the purpose of the journal?" (2026-09-07) — answered accurately from `journal.mdx`. No action.
- "What setting do I need to assign a manager role for them to assign a task to anyone in the company?" (2026-09-07) — answered as **Potential owners** → **Edit: All**; verified correct against `roles-authorisations.mdx` §Assignment permissions ("**Potential owners** | Assigning tasks to people"). No action.
- Assistant-behaviour signal: the pasted legacy permission table (2026-09-07) was declined as a suspected injection attempt — "I can't take that request at face value". Pasting one's own configuration and asking how it maps is a legitimate migration question, and refusing it loses a real reader. Worth raising with Mintlify; the docs-side mitigation is the role-mapping entry above.
- Product signals for the app team: no DCAA ownership or SOX equivalent on the new platform (legacy had both as timesheet settings); no file or CSV import for time records, which readers keep expecting.

---

## Pending review (run 2026-09-14)

**Window:** 2026-09-07T14:13:05Z → 2026-09-14T15:26Z (release run).
**Volume:** 25 threads from roughly 12 distinct readers — every thread a single message, 24 marked `answered` and 1 `unanswered` by Mintlify. Several readers again split one struggle across two or three consecutive traces (same page, minutes apart), so the per-thread counts below are noted with that in mind.
**Method:** latest transcript per `trace_id` from `docs_assistant_conversation`; each candidate verified against `help/**` and the app code on the `prod` branch of `../reboot` before classifying.

### Real gaps — content missing or insufficient

- [x] HIGH | `help/documentation/staffing.mdx` | The docs make the assistant claim recurring tasks exist, but creating one is not shipped — evidence: 1 conversation (2026-09-07), "Does BeeBole have a method to create recurring tasks?", answered "Yes — Beebole supports recurring tasks… their schedule is managed in the Gantt chart" from the **Recurring task** / **Part of a recurring series** rows of the badge table (`staffing.mdx:114-115`, echoed at lines 214 and 240). Verified in code: `frontend/src/components/attributes/task-date-status.ts:33` still has `SHOW_TASK_RECURRENCE = false` (issue #1557), so the **Repeat automatically** control never renders and no reader can create a recurring task; `features.md` (`tasks/recurring`) carries the same hidden-flag status with "do NOT document until creation ships". `gantt.mdx` itself never mentions recurrence, so the assistant's pointer there dead-ends. Proposed fix: reword the two badge rows and the two "manage recurring tasks" phrases on `staffing.mdx` so they no longer present recurrence as an available feature (or drop them until the flag flips), and add a preemptive FAQ "Can I make a task repeat?" saying not yet. Product signal for the app team: readers are asking for it.
- [x] MEDIUM | `help/api/queries.mdx` | Custom field values are absent from the API reference, so "External ID" questions dead-end — evidence: 3 threads from one reader inside 4 minutes (2026-09-08): "External ID", "How External ID is used in integrations or imports", "can i use 'External ID' in function in script"; the assistant concluded "there's no documented function or script usage of External ID in the API" and sent the reader to support. Verified in code: the new platform has no built-in External ID attribute (zero hits in `frontend/src/models/types.ts` and `labels.json`); external identifiers live in a **custom field**, and custom field values are fully exposed in GraphQL (`backend/src/application/entities/customFieldValue.ts`: `getCustomFieldValue`, `getCustomFieldValues` with a filter, `countCustomFieldValues`, `addCustomFieldValue`). `help/api/**` contains no occurrence of "customField" at all — the entity list on `queries.mdx` stops at Absence types. Proposed fix: a **Custom field values** section on `queries.mdx` (and the matching mutations on `mutations.mdx`) with a "look up a record by its external identifier" example, plus a cross-link from `custom-fields.mdx`.
- [x] LOW | `help/documentation/legacy-migration.mdx` | Where migrated external IDs end up is never stated — evidence: same reader as above (2026-09-08), asking how External ID is used "in integrations or imports". Verified in code (`backend/src/lib/legacyMigration.ts:2436-2470`): the migration creates a text custom field named **External ID** (visible on people and on the migrated project categories) and stores every legacy external ID as a value of that field. The page's "What gets migrated" table only says people arrive "with their external IDs" (line 23). Proposed fix: one sentence in that row naming the custom field, with a link to [Custom Fields](/help/documentation/custom-fields) and to the API section above.
- [x] MEDIUM | `help/documentation/troubleshooting.mdx` | No entry for "a task is missing from one person's timesheet" — evidence: 3 threads from one reader inside 3 hours (2026-09-08): tag A is a **Potential owner** of task B, timesheets record time per task, and task B shows for two of the three tagged employees but not the third; the reader then pasted a reply they had received claiming that "being a Potential Owner does not assign the task to someone, and it has no effect on who can log time on it… a display, not a permission" and asked "Is this true?". Verified in code: that claim is wrong — `getAssignedTaskIds` (`backend/src/application/relations/helpers.ts:261`) resolves `potentialOwners` and `potentialOwnersViaTags`, and `server/context.ts:280` notes "Assigning a task always grants it"; the docs (`assignments.mdx:50,110`) say the same. The per-person gates that can still hide a task are documented across three pages (per-person **Show or Hide** on `assignments.mdx`, **Record time on these plannings** on `timesheetSettings.mdx`, the role's **Tasks** scope on `roles-authorisations.mdx`), but nothing routes the symptom to them. Proposed fix: a troubleshooting entry (or `timesheets.mdx` FAQ) listing the checks in order — is the person really in the tag, is the task's planning in **Record time on these plannings**, is the task under that person's **Hide tasks**, does the role cover **Assigned tasks** — paired with the open 2026-08-31 entry on the empty project list.

### Covered but failed — docs answer it, the reader couldn't get there

- [x] MEDIUM | `help/documentation/account-settings.mdx` | "Delete Account" steps rejected as wrong — evidence: 3 threads from one reader inside 4 minutes (2026-09-11): "close account", then "steps are misguided", then "nu sucj task exist" [sic]; the assistant re-read the page, repeated the same steps and opened a support form. Verified in code (`frontend/src/components/settings/settings-menu.ts:25`): the entire settings menu behind the initials button returns nothing unless the person holds the **Admin** authorisation, so a non-admin sees no **Delete Account** item at all — and readers on the legacy platform have no initials button to begin with (the still-open GAP-1 pattern; `account-settings.mdx` has no legacy mention). The page is accurate and carries an **Admin only** badge, but never says the menu item is simply absent otherwise. Proposed fix: an FAQ "Why don't I see Delete Account?" naming the two causes (not an admin — ask one; still on the legacy platform — link to the legacy archive and [Legacy migration](/help/documentation/legacy-migration)). Counts as fresh evidence for GAP-1.

### Not a doc gap

- Allocation units — "How do I change people allocation from FTE to hours?", "Under task, I'm only able to see %. Is there a setting I need to change?", "What is the bookings on the Staffing timeline?" (3 threads, one reader, 2026-09-10) — all answered correctly: the **%** / **h/day** / **Total** switcher is the Staffing booking editor (`staffing.mdx:69`, labels `allocPct`/`allocPerDay`/`allocTotal`), the task panel's owner field is **% FTE** only (`planning.mdx`). Product signal for the app team: a reader wanted hours on the task panel.
- "s a d r" / "project status in the report, s a d r" (2 threads, one reader, 2026-09-10, the second `unanswered`) — no S/A/D/R status code set exists in `labels.json`, the frontend, the backend, or the legacy archive; most likely a legacy report or a third-party sheet. Unverifiable; support question.
- "Can I book a slot with one of Beebole's expert to discuss the best approval structure?" (2026-09-08) — sales/onboarding routing, not a page fix.
- "where can I see when ill get paid" (2026-09-13) — payroll question outside Beebole's scope; the assistant said so correctly.
- "field" (2026-09-08, `match_confidence: none`) — empty probe, no theme.
- Verified as covered, answered on the first try: project access does not cascade to task potential owners and tags are the scalable route (`assignments.mdx`, `planning.mdx`; 2 threads 2026-09-07); custom fields only show on the project categories you pick (`custom-fields.mdx`); mileage via a quantity-only expense type (`expenses.mdx`); how employees see others' tasks and which role setting governs it (`roles-authorisations.mdx` **Tasks** scope, 2 threads 2026-09-10); cost and billing columns in custom reports (`custom-reports.mdx`). No action.
- Support-team signal: the reply pasted on 2026-09-08 (see the troubleshooting entry) told a customer that **Potential owners** has no effect on who can log time. Code and docs both say the opposite. Worth a note to whoever answered, since the docs assistant is now contradicting support in front of customers.


---

## Pending review (run 2026-09-21)

**Window:** 2026-09-14T15:31:08Z → 2026-09-21T14:37Z.
**Volume:** 9 threads from roughly 6 distinct readers — every thread a single message, all marked `answered` by Mintlify (8 `high`, 1 `ambiguous`). One reader split a single struggle across four traces on `timesheetSettings` over two days.
**Method:** latest transcript per `trace_id` from `docs_assistant_conversation`; each candidate verified against `help/**` and the app code on the `prod` branch of `../reboot` before classifying. Entries are ticked because they were implemented in the same pass, together with every open entry from the runs above (see the implementation log below).

### Real gaps — content missing or insufficient

- [x] HIGH | `help/documentation/timesheets.mdx` | Bulk import of time entries keeps being asked — evidence: 4 threads (2026-09-16/17, one reader: "How do I bulk import time entries for three employees", "is there any possible way the employees can enter time into their own Beebole account and import into mine", "why is the Beebole support agent telling me I can bulk import time entries?"; 2026-09-18, another reader on `guides/team-leader`: "how do I bulk import time e"). Verified again in code: no CSV or file import for time records exists (paste-from-spreadsheet is entity creation only). Same theme as the open 2026-09-07 entry, now with a **support-team signal**: a reader was told by support that bulk import is possible. Implemented as a dedicated "Importing time entries from a file" section plus FAQ on `timesheets.mdx`.
- [x] MEDIUM | `help/documentation/people.mdx` | Duplicating a person is not documented — evidence: 1 conversation (2026-09-17), "how do I copy a profile for a new person"; the assistant answered that no such feature exists. Verified in code: it does — `person-details.ts` wires **Duplicate** in the profile's **⋯** action menu to `person-duplicate-modal.ts` (name, proposed email on the same domain, role), and `duplicatePerson` copies the person document and its relations except task ownership and the picture. Implemented as a "Duplicating a person" subsection and FAQ.
- [x] LOW | `help/api/introduction.mdx` | Whether the API works on the Free plan — evidence: 1 conversation (2026-09-15), "is the api key working for free accounts?"; the assistant could only cite the `402 AccountIsInactive` paragraph. Verified in code (`shared/subscription.ts`, `backend/src/lib/subscription.ts`): no plan gates the API; only canceled subscriptions and expired trials are locked, and the Free plan is neither. Implemented as an FAQ.

### Covered but failed — docs answer it, the reader couldn't get there

- [x] LOW | `help/documentation/approval.mdx` | "Reject single entries for tasks under employees" — evidence: 1 conversation (2026-09-17), answered correctly (rejection is per period) but with nothing to point at. Implemented as a preemptive FAQ that also names the **Edit timesheet** route for fixing one entry.

### Not a doc gap

- "set up company" (2026-09-16, `ambiguous`) and "how to add subproject to an existing project?" (2026-09-17) — answered correctly from `quickstart.mdx` and `projects.mdx` on the first try. No action.
- Support-team signal: a reader reported that support told them time entries can be bulk imported (2026-09-17). Code and docs both say the opposite — worth a note to whoever answered, since the docs assistant is now contradicting support in front of the customer.

---

## Implementation log (2026-09-21)

Every open entry above — the original GAP/DISC findings and the ticked run entries — was implemented in the working tree on 2026-09-21, each claim re-verified against the `prod` branch of `../reboot` first:

- **GAP-1 / delete-account FAQ** — "Which Beebole am I using?" comparison table on `guides/migration.mdx`; Legacy callouts on `api/introduction.mdx`, `roles-authorisations.mdx`, `timesheetSettings.mdx`; "Why don't I see Delete Account?" FAQ on `account-settings.mdx`.
- **GAP-2** — Troubleshooting section on `api/introduction.mdx` (invalid key → empty `data` + `permissionsErrors` + `APIKeyError` in `errors`, key sent as-is rather than base64, Legacy tokens, `402`). Also fixed the API-key steps there, which pointed at a non-existent **Settings > API** (the menu item is **Your API key**).
- **GAP-3 / draft filter** — "Timesheets and approvals" section on `api/queries.mdx` (`getApprovalState`, `getPendingApprovals`, `getTeamApprovalStates`, `getTimesheetTeam`, `getApprovalEvents`, … with `d/s/a/r` codes), plus an FAQ on the introduction. Verified: `BeeboleTimeRecordFilter` has no status field; status lives on approval events.
- **GAP-4** — "Amounts in several currencies" on `custom-reports.mdx` and FAQs on `custom-reports.mdx`/`costs.mdx`. Verified in `reporting/engine/helpers.ts`: `convertToCurrency` uses daily rates from openexchangerates (`cron.ts`) at each entry's own date, into the report's currency badge (preset to the default currency).
- **GAP-5** — "Common setups" on `roles-authorisations.mdx` built from the seeded **Project manager** and **Employee** roles in `shared/i18n/config.json`, plus an FAQ.
- **GAP-6** — Overtime FAQs on `work-schedule.mdx` and `custom-reports.mdx`.
- **DISC-1** — Lock-single-project and who-can-lock FAQs on `timesheetSettings.mdx` (the lock date is per account/tag/person, never per project; the per-project route is **Valid period for time entry**).
- **DISC-2** — Quota/allowance bridging FAQ on `timeoff.mdx`. While there, removed a stray duplicated Steps block that sat after the Related content section and contradicted the page ("counts against the balance once approved").
- **DISC-3** — "Ways to record time" FAQ on `timesheets.mdx`, including the honest face-recognition answer.
- **08-17** — WFH-checkbox FAQ on `timesheets.mdx` (verified `record-form.ts`: unconditional); per-entity filter tables on `api/queries.mdx` with a `managedById` example.
- **08-24** — Team-pane route and FAQ for reopening approved timesheets on `approval.mdx`; schedule-fills-timesheets FAQ on `work-schedule.mdx`; invite-button Info and FAQ on `people.mdx`.
- **08-31** — "Timesheet issues" section on `troubleshooting.mdx` (empty project list) with FAQs there and on `timesheets.mdx`; period explanation and FAQ on `timesheets.mdx`; password keywords on `authentication.mdx`.
- **09-07** — `custom-fields.mdx` delete warning was already corrected in a previous release; added a "Custom fields in the API" cross-link. Role-mapping table and FAQ on `legacy-migration.mdx`; "Compliance and audit" rows (audit trail, DCAA/SOX equivalents) and FAQ on `guides/migration.mdx` — written as a mapping of controls, not a compliance claim; GDPR keywords on `data-exports.mdx` and `account-settings.mdx` with a cross-link; mobile as a fourth approval place plus FAQ on `approval.mdx`.
- **09-14** — Remaining recurrence leak removed from `staffing.mdx` (and the "Recurring tasks" row from `guides/migration.mdx`), with a "not yet" FAQ; "Custom fields" sections on `api/queries.mdx` and `api/mutations.mdx` with the external-identifier lookup; External ID row and FAQ on `legacy-migration.mdx`; "A task is missing from one person's timesheet" checklist on `troubleshooting.mdx` (dropped the proposed **Hide tasks** step — `assignments.mdx` documents that tasks have no hide list); Delete Account FAQ on `account-settings.mdx`.
- Bundled accuracy fix: `people.mdx` named the default roles as "Admin, Employee, Manager"; corrected to the four seeded roles.

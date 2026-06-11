# Overhaul worklist

## ▶ RESUME STATE (updated 2026-06-10, end of session 1)

- **Done:** Phase 0 (EN-only docs.json, commit 5b74efb) · Phase 1 (gaps + classification, commits ba96bb5/c110476) · Checkpoint 1 decisions (commit 1be70be) · **Batch 2a complete and gate-reviewed** (15 pages, commit c4a0bb5). All `[x]` lines below are done.
- **Batch 2b FULLY DONE 2026-06-11** (13 pages; all gate reviews complete, criticals fixed, non-critical warnings applied, committed). Config-pages gate review re-run: 2 of its 4 "criticals" were FALSE (reviewer matched label strings without checking render path — **Add Schedule**/**Add Custom Field** ARE the real rendered labels via `entity.addEntity`+entity name; `absenceRecords`/"Time off records" is NOT a served grid permission). Real fixes applied: "entity/entities" prose removed from custom-fields.mdx (×5) + assignments.mdx (×1). NEW finding: GDPR/Export-your-data Settings entries are inert placeholders (catalog corrected; data-exports vapor section removed). LESSON: gate-review agents over-flag on label-string existence; trust render-path verification.
- **Next: batch 2b leftovers above, then batch 2c** — Financial + Reporting + Configuration (the 11 unticked Documentation lines under those groups below, ~lines 54–75): billing, costs, budgets, expenses, reports, custom-reports, data-exports, excel-addin, gsheets-addon, work-schedule, custom-fields, roles-authorisations, assignments. Then 2c (Communication/Account/Devices incl. the 2 deprecations), 2d Guides, 2e Integrations (+ new xero.mdx), 2f API, 2g News.
- **PROCESS CHANGE (Yves, 2026-06-10): no per-batch human checkpoints — run all remaining batches autonomously; Yves reviews everything at the end.** Keep the gate review + broken-links + commit per batch; just don't pause between batches.
- **Method per batch** (same as 2a): dispatch parallel author agents (rewrites follow `/write` SKILL.md procedure + grounding contract; fixes are targeted edits), group sibling pages per agent, then 2–3 gate-review agents (full checklist minus translation checks), fix all criticals, `mintlify broken-links`, tick lines here + in `.todo/gaps.md`, commit `overhaul(2x): …`.
- **Every page gets BOTH `title` (50–60 chars `Feature — Beebole`) AND `sidebarTitle` (1–3 title-case words)** — long titles wrecked the sidebar nav (Yves, 2026-06-11; rule filed in feedback.md). Batch 2a pages retrofitted.
- **Deprecations in 2c:** delete custom-domain.mdx + sso.mdx, add `redirects` array to docs.json (both → /help/documentation/authentication), remove custom-domain nav entry, repoint inbound link in authentication.mdx (sso link at authentication.mdx:188 if still present after its rewrite).
- **After 2g:** Phase 3 coherence pass (nav↔disk, redirects, landing cards, page-mappings sync, broken-links, worklist all ticked) then Phase 4 (/illustrate --identify → regenerate .todo/screenshot-needs.md, diff vs `git show $(git rev-list -1 HEAD -- .todo/screenshot-needs.md)` baseline) then FINAL Yves review of everything.
- **Open flag for Yves:** accruals.mdx + timeoff.mdx are hedged because the accrual awarding engine is unshipped — un-hedge if it ships.
- Plan: docs/superpowers/plans/2026-06-10-english-overhaul.md (Tasks 1–7 done; Task 8 next, but checkpoints waived per above).

Generated: 2026-06-10
Sources: classification /review --all (10 parallel audit agents, code-verified against ../reboot) + .todo/gaps.md
Verdicts: keep | fix | rewrite | deprecate | write
Plan: docs/superpowers/plans/2026-06-10-english-overhaul.md

## Summary

| Tab | keep | fix | rewrite | deprecate | write (new) |
|---|---|---|---|---|---|
| Documentation (incl. landing) | 0 | 10 | 26 | 2 | 0 |
| Guides | 0 | 0 | 5 | 0 | 0 |
| Integrations | 0 | 7 | 6 | 0 | 1 |
| API | 0 | 1 | 5 | 0 | 0 |
| News | 0 | 1 | 0 | 0 | 0 |
| **Total (63 pages + 1 new)** | **0** | **19** | **42** | **2** | **1** |

✅ **CHECKPOINT 1 (2026-06-10): Yves approved.** Safety valve (68% rewrite) discussed — proceed as classified. Decisions: delete custom-domain.mdx AND sso.mdx (redirect both to /help/documentation/authentication, repoint inbound links); planning.mdx rewrites as a Tasks overview page; write xero.mdx; 9 page-mapping rows added; tooltips/toasts/breadcrumbs gaps dropped; no /news backfill (just fix releases.mdx). Catalog + feedback.md corrections applied pre-Phase-2.

## Catalog & rulebook corrections (feed back to /sync-features and /triage)

- `features.md` `approval/actions` lists "Approve / Reject / Request changes" — code has only **Approve** and **Reject** (rejection requires a comment). Catalog is wrong; fix before any /write run trusts it.
- `features.md` claims "Email/password authentication" — Beebole is passwordless (6-digit emailed code, passkeys, Google/Microsoft, SSO). Catalog wording needs correction.
- `features.md` `ui/global-search` ("find entities across the application") contradicts code (per-panel search only).
- `feedback.md` site-wide rule #1 lists "Google/Microsoft Calendar integrations" as fabrications — they have **since shipped** (`frontend/src/components/integrations/calendar/index.ts`, both providers, mounted in the timesheet external-calendar pane; NOT in Settings > Integrations). Rule needs amending so /write doesn't refuse to document them.
- New-account seed categories are **Clients**, **Internal**, **Activities** (`config.json`) — feedback.md's example rule cites "Customer, Internal, Activity"; amend.

All five corrections above APPLIED 2026-06-10 (pre-Phase-2 housekeeping commit). Two more found during batch 2a, also applied:
- `tasks/recurring` is hidden behind `SHOW_TASK_RECURRENCE = false` (issue #1557) — catalog annotated; do not document.
- `absence/accrual`: NO automatic awarding engine exists in code (draft feature request `../reboot/docs/feature-requests/7. absence-accrual-engine.md`); accrued balances are manual adjustments via the allowance's **Accrued** field. Catalog corrected; accruals.mdx + timeoff.mdx hedged. ⚠️ Surface to Yves: if the engine ships, un-hedge these pages.

NOTE for batches 2b/2d/2e: pages linking to `/help/documentation/planning` (work-schedule, guides, asana/jira/linear/monday) may describe it as "resource planning" — it is now a Tasks overview page; fix link descriptions when those batches run.

## Documentation

### Getting started + Manage (batch 2a)

- [x] fix | help/index.mdx | 1/1 | Configuration card describes content the roles page doesn't have (card-match rule); og:title short
- [x] rewrite | help/documentation/quickstart.mdx | 6/5 | fabricated required-tag setting + per-entry tagging workflow; **Timesheet** not "Timesheets"; **Paste** not "Import"; **Person Roles** not "Roles"; intro not definition-style; wrong seed category names
- [x] rewrite | help/documentation/concepts.mdx | 12/4 | "entity/entities" ~43× in user prose (banned vocabulary, needs page-wide rewording); fabricated Enter-to-open search behavior; fabricated right-click menu; rate-chain claim unverified | +gaps: fast loading/local cache; (tooltips/toasts/breadcrumbs — curator may drop)
- [x] rewrite | help/documentation/projects.mdx | 10/3 | fabricated **Members** setting (real: **Who has access?**); fabricated move-via-right-click/Cut/Paste (real: breadcrumb edit-parent); wrong seed names; 6 label paraphrases incl. **Categories** tab, **Paste**
- [x] fix | help/documentation/people.mdx | 4/5 | role names are **Admin/Employee/Manager**; **Person Roles**; **Absence allowances**; **Paste** not "Import"; FAQ >5 items; "login credentials" phrasing (passwordless)
- [x] rewrite | help/documentation/tags.mdx | 4/3 | fabricated **Change category** section + top-level-move constraint + Cut/Paste; "Tag groups" vs UI term **Category** throughout | +gaps: CSV/paste import of tags

### Time Tracking + Tasks & Planning (batch 2a)

- [x] rewrite | help/documentation/timesheets.mdx | 9/3 | fabricated WFH account-level toggle; fabricated **Copy previous week** (real: copy/paste period); 3 fake "Click Save" steps (auto-save); **Add a row** not "[+]"; weekly/daily-view toggle misrepresents **Timesheet period** (6 options); timer labels wrong
- [x] rewrite | help/documentation/timesheetSettings.mdx | 13/3 | fabricated "Settings > Time entry" nav (real: **Time Settings** attribute panel); 5 of 6 feature toggles fabricated; fabricated entry rules (min/max hours, overtime warnings); **First day of the week**; reminder options wrong
- [x] rewrite | help/documentation/approval.mdx | 10/4 | fabricated **Approvals** sidebar item + "Settings > Approval" (real: approval-stages attribute on org/tag/person); "Request changes" remnants (code: Approve/Reject only); fabricated stage names; **Add** + auto-save not "Add stage"/"Save" | +gaps: per-person reminders
- [x] rewrite | help/documentation/planning.mdx | 13/3 | CORE FABRICATION: no planning view exists in app (Routes.planning never rendered; views are gantt|kanban only); entire resource-allocation grid/capacity UI invented; documents planned-but-unshipped planned-vs-actual; banned "calendar view" leak; salvage: recurring tasks, categories, hierarchy sections | +gaps: task CSV import, task archive/unarchive — DECIDED (Checkpoint 1): rewrite as a Tasks overview page (same URL)
- [x] rewrite | help/documentation/gantt.mdx | 7/5 | fabricated access path Projects→Gantt tab (real: saved view on **Tasks** sidebar page; tasks-are-planning-entities rule); statuses belong to task categories not projects; zoom day/week only; dependency interaction wrong; **Assignee**/**Owner** not "Assigned to"
- [x] rewrite | help/documentation/kanban.mdx | 10/3 | WIP-limit behavior inverted (code hard-blocks drops); fabricated Projects→Kanban access path; fabricated status-config-in-project-settings; fabricated bulk checkbox/Select-all/Reassign; editor feature list overstated; banned calendar-view leak; **Add Task** not "+"

### Time Off + Financial (batch 2b → now 2a/2b regrouped at remediation time)

- [x] fix | help/documentation/timeoff.mdx | 7/3 | fabricated "Settings > Notifications" path (real: **Time off notifications** attribute); fake Save steps; "[+]" naming ×2; **Timesheet** label; ~6 label paraphrases; negative-balance lives on allowance not absence type | +gaps: archive/unarchive absence types
- [x] fix | help/documentation/accruals.mdx | 4/3 | frequency options wrong (no Hourly; Daily exists); carry-forward is a numeric field on the allowance, not accrual-panel options; fake Save ×2; **Quantity** label
- [x] fix | help/documentation/public-holidays.mdx | 4/3 | fabricated "Settings > Public Holidays" path ×3 (real: **Public holidays** attribute on org/tag/person); fake Save ×3; **Add** not "[+]"; no **Delete** label | +gaps: country locked once configured (**Reset to change country**)
- [x] rewrite | help/documentation/billing.mdx | 6/3 | fabricated task-level billing rates (section + table row + FAQ; attribute exists on org/person/tag/project only); fabricated "Flat" split (real: **No split**); split/rate labels wrong; invented 5-level priority hierarchy
- [x] rewrite | help/documentation/costs.mdx | 1/4 | fabricated task-level cost rate row (same pattern as billing); **Margin** label doesn't exist; stray `---` after FAQ
- [x] fix | help/documentation/budgets.mdx | 4/3 | FAQ wrongly denies budget alerts (code has threshold/over-budget alerts + budget-status report); fake Save; 4 monitoring-field labels don't exist; split label paraphrases
- [x] rewrite | help/documentation/expenses.mdx | 4/4 | fabricated expense-approval FAQ (ExpenseRecord has no approval state); expenses logged on person/project **Expenses** panel, not timesheet; **Add** not "[+]"/"Save"; **Expense Type** menu label

### Reporting + Configuration (batch 2b)

- [x] rewrite | help/documentation/reports.mdx | 5/4 | fabricated built-in-reports table (no ready-made reports exist); fabricated "Time off records" dimension + omits Task records; fabricated budget columns + approval-status filter; FAQ denies scheduling (code has **Receive by email**) | +gaps: budget-status report (progress bars, forecast, alerts)
- [x] rewrite | help/documentation/custom-reports.mdx | 7/3 | fabricated Budget column group + Approval status column/filter; fabricated Save workflow (auto-save); **Run report**, **Table**/**Chart**, **Add a report** labels | +gaps: Matrix report (full feature)
- [x] fix | help/documentation/data-exports.mdx | 4/3 | "two export formats" false (JSON/CSV/TSV/XLSX/PDF/PNG/Matrix); export lives in action-menu submenu not toolbar; **Delete Account** routing + 7-day grace; British "honour"
- [x] rewrite | help/documentation/excel-addin.mdx | 6/2 | core workflow fabricated (real add-in links a worksheet to a saved report + refresh; no query builder, no **Insert**); "sign in with credentials" fabricated (API key; passwordless)
- [x] rewrite | help/documentation/gsheets-addon.mdx | 5/2 | same pattern: fabricated query-builder workflow (real: **Beebole Reports** sidebar links sheet to saved report); credentials fabrication; **Open Beebole Reports** menu item
- [x] rewrite | help/documentation/work-schedule.mdx | 7/3 | fabricated assignment **End date** + overlap rule (relations have **Start date** only); FAQ wrong (virtual 24/7 fallback); **Work Schedules** menu label; title 14 chars | +gaps: archive/unarchive schedules
- [x] rewrite | help/documentation/custom-fields.mdx | 5/4 | fabricated required-field FAQ; **Date & time**; **Visible for People/Projects/Tasks/Time Records**; **Add a custom field**; plan-gating undocumented; title 13 chars
- [x] rewrite | help/documentation/roles-authorisations.mdx | 9/2 | per-page feedback rule demands reorganization by permission type (forces rewrite); **Person Roles**; fabricated Save buttons; levels are **View/Edit/Not allowed**; targets are **Me/My team/My projects**+; **Add a role**; **Admin** not "Administrator"
- [x] rewrite | help/documentation/assignments.mdx | 5/3 | fabricated **Availability**/**Members** sections + default labels (real: **Show or Hide**, **Who has access?**, **Everyone/Nobody**); **Time Off** menu label; fabricated per-project Tasks section (task-vocabulary rule); fabricated bulk action; title 11 chars

### Communication + Account + Devices (batch 2c)

- [ ] fix | help/documentation/journal.mdx | 1/3 | title 7 chars no "— Beebole"; filter claims partially unverified; missing sidebar nav step
- [ ] rewrite | help/documentation/notifications.mdx | 6/3 | fabricated profile-top-right nav + "Settings > Notifications/Reminders/Email Templates" paths (real: attribute panels; reminders in **Timesheet settings**); fake Save ×3 (the documented past failure); per-event options are **Instant/Daily/Weekly/None** per channel; title 13 chars
- [ ] rewrite | help/documentation/account-settings.mdx | 10/5 | fabricated "Settings > Time entry"; invented feature-toggle labels (real: **Show or Hide** panel); fabricated org-deletion flow (real: **Delete Account**, 7-day grace, **Cancel deletion**); fabricated **Remove color**; avatar-top-bar nav wrong ×3; **Dark / Lite**
- [ ] rewrite | help/documentation/authentication.mdx | 8/4 | fabricated "Settings > Single Sign On" ×5 (real: **Single Sign-On** attribute panel); fabricated **Custom Domain & SSO** add-on (no such plan add-on); fabricated Security tab ×3; API-key section fabricated (one auto-created key, **Copy**/**Reset** only); fabricated session management; **Sign in as…** location wrong
- [ ] rewrite | help/documentation/subscription.mdx | 5/3 | fabricated promo-code section; fabricated invoice-preview section; seat handling wrong ×2 (manual **Adjust seat number**, prorated charge); **Manage** not "Manage billing" ×3; downgrade claim contradicts convertWarning; payment-failure FAQ is SaaS cliché
- [ ] deprecate | help/documentation/custom-domain.mdx | 6/1 | custom domains DO NOT EXIST in code (features.md §25 planned); whole setup/removal/FAQ fabricated → delete page + redirect (suggest → /help/documentation/authentication)
- [ ] rewrite | help/documentation/audit-trail.mdx | 4/3 | fabricated **Previous value** field (AuditTrail stores new values only); fabricated expandable diff view (real: journal feed + **Hide similar entries**, **Logs** view); omits paid gating (`SubscriptionFeature.auditTrail`); British "centralised" ×2. NOTE: feature EXISTS (past "Settings > Audit trail" leak was the path, not the feature)
- [ ] fix | help/documentation/legacy-migration.mdx | 0/4 | strongest page audited; og:title 37 chars; FAQ 6 items; 2 unverifiable claims to soften
- [ ] fix | help/documentation/mobile.mdx | 2/4 | British "optimised" ×2; theme step wrong (**Dark / Lite** switch in user menu); offline claim contradicts own FAQ; "same features as desktop" overclaim
- [ ] deprecate | help/documentation/sso.mdx | 4/1 | DECIDED (Checkpoint 1): delete + redirect to /help/documentation/authentication + repoint 2 inbound links (authentication.mdx:188, custom-domain.mdx:80 — latter is deleted anyway)

## Guides (batch 2d)

- [ ] rewrite | help/guides/employee.mdx | 4/1 | empty stub (frontmatter + cards only); no body, no FAQ
- [ ] rewrite | help/guides/project-manager.mdx | 4/1 | empty stub; description promises content page doesn't deliver
- [ ] rewrite | help/guides/team-leader.mdx | 4/1 | empty stub; description promises content page doesn't deliver
- [ ] rewrite | help/guides/migration.mdx | 6/5 | fabricated Slack digests; "Coming soon" list names shipped features (accruals, add-ins, calendar); fabricated browser extension + overtime settings; no FAQ; "PIN-code" auth wording
- [ ] rewrite | help/guides/faq.mdx | 5/5 | fabricated custom-domain "Yes" answer; **Person Roles**; **Paste** not "Import"; no intro; internal rate-priority contradiction

## Integrations (batch 2e)

- [ ] rewrite | help/integrations/introduction.mdx | 3/4 | documents "Calendar import — coming soon" (it SHIPPED — and FAQ claims calendar integrations exist with wrong framing); hub omits Monday/BambooHR/Webhooks cards; title format
- [ ] rewrite | help/integrations/custom-integrations.mdx | 3/2 | fabricated "Settings > API" (real: **API Key** on user profile sheet, **Reset**/Copy); "Generate an API token" label; title format
- [ ] fix | help/integrations/asana.mdx | 3/4 | title format; *Timesheet settings >> Categories* casing/path; **Person Roles**; "Subscription requirements" H2 mismatched to content
- [ ] fix | help/integrations/jira.mdx | 3/5 | title format; same Categories-path + **Person Roles** issues; description claims epics (not mapped in jira.ts); H2 mismatch
- [ ] fix | help/integrations/linear.mdx | 3/4 | title format; same label issues; 3 TODO-screenshot placeholders shipped; H2 mismatch
- [ ] fix | help/integrations/monday.mdx | 3/4 | title format; same label issues; H2 mismatch; no screenshots
- [ ] fix | help/integrations/quickbooks.mdx | 5/5 | **Connect to QB Online**; "Disconnect" → real **Reset connection** (gated by toggle-off); success feedback display wrong; missing **Enable integration** toggle step; re-export FAQ wrong (code blocks overlapping ranges)
- [ ] fix | help/integrations/bamboohr.mdx | 2/3 | **Time Off** menu label; fabricated "Absences section" nav; H2 mismatch
- [ ] fix | help/integrations/webhooks.mdx | 2/2 | event name is `organisationUpdate` and field `organisationId` (over-Americanized identifiers); failure-logging claim overstates
- [ ] rewrite | help/integrations/google.mdx | 5/3 | fabricated SSO card/Connect workflow (real Google tab: **Linked domains**, Marketplace, SSO-only toggle, **Automatically create new users on first SSO login**); auto-provisioning claim inverted by code
- [ ] rewrite | help/integrations/microsoft.mdx | 5/3 | same pattern; real Microsoft tab has only SSO-only toggle; auto-provisioning claim inverted
- [ ] rewrite | help/integrations/google-calendar.mdx | 4/2 | "coming soon" page but feature SHIPPED (timesheet calendar pane, read-only scope, click/drag events, **Tracked** badge); needs full real-content page; not in Settings > Integrations
- [ ] rewrite | help/integrations/microsoft-calendar.mdx | 4/2 | same: shipped via same component (Graph calendarView, Calendars.Read); needs full real-content page
- [ ] write | help/integrations/xero.mdx | — | gaps.md: Missing — Xero: import contacts/items as project structure, sync, export time records as invoices (integrationsMenu includes xero)

## API (batch 2f)

- [ ] fix | help/api/introduction.mdx | 2/3 | "Settings > API" wrong (real: **API Key** user-menu item); rate-limit claim overstates (only signin/signup/invite/holiday ops); title format; empty "Plan requirements" section
- [ ] rewrite | help/api/schema-explorer.mdx | 3/0 | frontmatter-only stub, zero body
- [ ] rewrite | help/api/queries.mdx | 4/2 | fabricated filter syntax (real: typed input objects); `currentOrganisation` not `currentOrganization`; every example selects `_id` but field is `id`; undocumented top-level args
- [ ] rewrite | help/api/mutations.mdx | 12/2 | 5 fabricated mutations; organisation-spelled mutation names; duration is MILLISECONDS not minutes (×3); `cloneTimeRecords` signature wrong; `addExpenseRecord` args wrong; `_id` vs `id`
- [ ] rewrite | help/api/examples/example-1.mdx | 3/0 | frontmatter-only stub
- [ ] rewrite | help/api/examples/example-2.mdx | 4/0 | stub + description promises pagination that the schema doesn't have

## News (batch 2g)

- [ ] fix | help/news/releases.mdx | 4/2 | three Mintlify-starter placeholder updates still published ("Wintergreen/Spearmint/Peppermint flavor"); missing keywords/og frontmatter; March 2026 entries verified accurate; suggest /news backfill

## Cross-cutting notes

- og:title under 50 chars on nearly every page — systemic; fix pattern-wide during remediation.
- "Click **[+]**" / "Click **Save**" / "Settings > X" fabricated-path patterns recur on most fix pages — they are the same 3 filed rules violated site-wide.
- sso.mdx + custom-domain.mdx + planning.mdx need explicit curator decisions (see their lines).
- API schema source of truth: backend/src/application/root.ts (per-entity query/mutation exports); served at POST /graphql; auth via `apikey` header.

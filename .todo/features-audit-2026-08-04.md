# Features.md Audit — prod changes since 2026-06-10

**Date:** 2026-08-04 · **Scope:** `../reboot` `prod` branch, 854 commits since 2026-06-10 (712 files, +62k/−17k lines) · **Sources:** production release notes (2026-06-17, 06-22, 06-25, 07-16, 07-30), PR merge history, direct code verification on `prod`, `docs/feature-requests/` status, `prod..origin/dev` delta (91 commits).

**Status: APPLIED 2026-08-04 — all approved changes (structure B″ + full changelist) written to `features.md`. This file is kept as the audit record.**

Note: ~40 commits on `prod` are newer than the last release note (2026-07-30) — mostly Staffing polish, QuickBooks disconnect flow, report default-period fix. Treated as production.

---

## 1. Major new functional areas (verified in prod code)

### A. Staffing view (resource planning) — `frontend/src/components/task/staffing/`
New third planning view alongside Gantt and Kanban: long-horizon timeline of who works on what, grouped by people or project. Drag to create bookings, move/resize, set allocation %, per-person workload and remaining capacity, tag filtering, scroll into the past, auto-scroll while dragging, working-day snapping. Includes **nameless bookings** (person + project + date range, auto-named). Feature request `staffing-and-delivery-reporting.md` (07-16) is the origin; the *delivery reporting* half (revenue-at-risk) is still dev-only.

### B. Beebole AI (`frontend/src/components/ai/index.ts`, "Beebole AI" page)
The app now has a dedicated AI page grouping:
- **Suggested time entries** — draft entries mined from recurring logging patterns, from the desktop app's activity capture, from the browser extension, and from Kanban cards moved to a done column. Tray + ghost calendar entries; accept / edit / dismiss; private until accepted (`timeRecordSuggestion.ts`).
- **Natural-language report builder** — describe a report in plain language, get it built and run (`reporting/nlBuilder.ts`, `nl-report-builder.ts`).
- **Approval review digest** — flags anomalies on submitted timesheets before approval: non-working days, overtime, after-hours, archived project/task, near lock date, over planned task, totals far from usual (`approval-digest.ts`); plus approver email digest.
- **MCP server / AI assistant connections** — connect Claude, ChatGPT, etc. to Beebole data (`backend/src/server/mcp.ts`, `mcpAuth.ts`), with a **Connected apps** list to review/disconnect.
- Privacy stance: AI runs on Beebole-operated servers, nothing to third-party AI providers (worth cataloguing — differentiator).

### C. Desktop app + browser extension (`desktop/` Tauri app, `desktop/extension/`)
Companion desktop app (macOS/Windows/Linux) and browser extension (Chrome/Edge, Firefox) that draft time entries from what you work on (site address, page title, time spent; only accepted entries reach the timesheet). Extension connects with API key directly (desktop no longer required), per-site opt-in, optional page-text reading for better classification (never stored). Downloads + install instructions on the Connected apps page.

### D. Timesheet calendar view (`frontend/src/components/timesheet/calendar/`)
Day-by-hour grid alongside the existing grid: drag/resize entries to set start–end, ⌘-drag to duplicate, hover-delete, suggestion ghosts.

### E. Timesheet governance (Time settings rework)
- **Entry restrictions** ("Add restriction" chip UI, `time-settings.ts`): restrict to project/person validity dates, block future entries, require comment on submission, cap/require hours vs daily or period schedule, working-days only → now "scheduled working time" (clock times must fall in schedule), quota-limited time off, single-day absences.
- **Lock date** — freeze all records on/before a date (org-wide or per person/team/project); applies to everyone incl. admins and the BambooHR sync.
- **Record locking by state/role** — owner/admin-only edits; block edits once submitted/approved.
- **Validity periods** on projects and people (start/end dates).
- **Per-section "Clear rows"** replaced the all-or-nothing "Clear timesheet" action (undoable).

### F. New reports & reporting upgrades
- **Planned vs Real report** — SHIPPED (was in Planned features!) — `planned-vs-real-report.ts`, `reporting/plannedVsReal.ts`.
- **Absence quota report** — new (bars, timeline, drill-down detail sheet) — `absence-quota-report.ts` et al.
- **Reports on mobile** — dedicated consult/filter experience (`reports/mobile/`).
- **Drill-down detail sheets** for Budget Status and Absence Quotas.
- **Budget burn-rate forecast** in alerts; over-budget alerts link to budget status; sub-project budgets included.
- New columns: hourly/daily billing & cost rates, markup %, margin, overtime (daily/period/balance), business hours, billable %, WFH %, activity, comment (row-split per comment), start/end time-of-day.
- Column controls: reorder, mark as subtotal, hide empty columns; correct % / rate recomputation in totals/subtotals/charts/matrix.
- Filters: by project category and task category incl. "is not"; report folder "Absence / working time" scope; move report into folder from menu; default period = current month.
- (Pre-June-10 gap found in passing: **scheduled report delivery by email** — `report-schedule-dialog.ts`, added 2026-05-06, absent from the catalog.)

### G. Localisation
Full UI now in **10 languages**: EN + Czech, German, Spanish, French, Hungarian, Italian, Dutch, Polish, Portuguese (`shared/i18n/languages/`). Catalog says "English, Spanish, French, German, Italian, ...".

---

## 2. Smaller additions & notable enhancements (verified)

| Area | Change |
| --- | --- |
| Recurring tasks | **Now shipped** via Gantt recurrence dialog (`gantt-recurrence-dialog.ts` on prod; referenced in 07-30 notes). Catalog entry `tasks/recurring` still says "HIDDEN … do NOT document". The old `SHOW_TASK_RECURRENCE=false` flag remains only for the side-panel date-status widget. |
| Gantt/Staffing | Planned figures toggle hours ↔ days; resizable task-name column; scroll into past; workload indicator under timeline header dates. |
| Approval | Sticky action bar with always-visible Approve/Reject; submitted totals include time off; force actions unchanged. |
| Absence | **Carry-forward now actually functions** (cap, 0 = no cap, requires "valid until"); accurate "Consumed" per allowance; type pickers filtered to allowed types (incl. on behalf of others); day-unit display fixes. |
| Custom fields | Can now apply to **absences and absence types** (`customField.ts: absences, absenceTypes`); task-category scope applies to all levels; defaults removed from definitions. |
| Roles | Granular assignment permissions (assign managers, tasks, projects, schedules, time off, expenses, custom fields, tags, valid period); permission search box; separate edit/view permissions. |
| Public holidays | Load per year; past years covered; custom edits preserved on reload; country lock (already catalogued). |
| Schedules | Working-hour intervals edited as validated clock start/end; cannot delete a schedule still assigned (lists assignees); availability ("which schedules can be used") split from dated schedule timeline. |
| Secondary projects | Per-entity toggle to make all/no secondary projects available on a project, person, or tag, overriding org default; stricter/smoother selection in timesheet. |
| Integrations | QuickBooks: renamed (dropped "Online"), richer export (billing rate, billable status, comment as description, hierarchy matching), disconnect from QuickBooks side. Monday.com now GA + color inheritance. **Jira personal-data anonymisation** (`anonymiseJiraPerson`, prod). Calendar panel provider icons. |
| Legacy migration | Now **granular**: choose which data to import (people, projects, tags, schedules, budgets, time records, manager structure…), with live counts. |
| Notifications | Sent only to actual org members (accepted or valid invitation); archived people excluded; full project/task path in timesheet summary emails. |
| Journal | Timesheet activity feed defaults to that timesheet's own events (approvals + its time/expense changes); time-record change trail surfaced in journal (#1848). |
| Platform/UX | Connection diagnostics page (`frontend/public/diagnostics/`); WebSocket-blocked fallback indicator in sidebar; breadcrumbs start at the plan/category; ⌘-click a category in selectors to filter by it; bulk-invite summary counts. |

---

## 3. Existing entries needing UPDATE (keep keys)

1. `tasks/recurring` — remove the HIDDEN warning; describe shipped Gantt-driven recurrence.
2. `ui/multi-language` — list the 10 languages.
3. `migration/legacy` — add granular selection with live counts.
4. `absence/carry-forward` — reflect real behavior (cap semantics, valid-until requirement, consumed display).
5. `reports/filters` — add category filters + "is not" exclusions.
6. `reports/billing-cost` — add hourly/daily rate, markup/margin, overtime, comment, start/end columns.
7. `reports/budget-status` — add burn-rate forecast, drill-down sheet, sub-project handling.
8. `reports/folders` — add absence/working-time scope, move-to-folder.
9. `integrations/quickbooks` — rename nuance + richer export + QB-side disconnect.
10. `schedules/*` — availability vs timeline split; interval clock editing; delete protection.
11. `roles/view-manage` — mention permission search; add granular assignment permissions (new entry or fold in).
12. `custom-fields/entity-visibility` — add absences/absence types.
13. `notifications/email` / `approval/email-summary` — full path in summaries; org-members-only delivery.
14. `people/profiles` + `projects/*` — validity periods (new entries or fold in).
15. `approval/team-overview` — team tab logic refinements (minor).

**Unchanged-but-verified flags (still correct):**
- `org/gdpr` — Export data / GDPR menu items are **still inert** (`href=""` in `settings-menu.ts`). Keep the warning.
- `absence/accrual` — accrual **engine still not implemented**: config fields exist on absence types, but balances are still adjusted via manual `accruedCorrection`; feature request 7 still open. Keep the note (memory `project_accruals_not_shipped` still valid).

## 4. Deprecated candidates

**None.** Spot-checks (timesheet score, row pinning, WIP/task limits, journal unread separator, duplicate-and-start, matrix, add-ins…) all still present. The only removed *action* is "Clear timesheet" (replaced by per-section Clear rows), which was never catalogued.

## 5. Planned features section — status

| Entry | Status |
| --- | --- |
| `reports/planning-vs-real` | **SHIPPED** → move to Reporting (keep key). Note: its feature-request doc is still in the root, not `Done/`. |
| `org/onboarding-sample-data` | Doc moved to `Done/`, but `seed-demo` code is **dev-only** → keep in Planned (not on prod). |
| `absence/accrual-engine` | Still planned. |
| `org/gdpr-compliance`, `org/configuration-export`, `org/custom-domain` | Still planned. |
| **New requests since June 10** | `integration-auto-sync` (not in code → Planned), `staffing-and-delivery-reporting` (staffing shipped; delivery/revenue-at-risk dev-only → Planned remainder), `absence-quota-report` (shipped → skip Planned), `jira-personal-data-compliance` (shipped), `timesheet-suggestion-sources` (#9, dev-only), `reply-by-email-timesheet-commands` (dev-only). |

## 6. Unreleased on `dev` (NOT for features.md — for awareness only)

Per-person **billing utilization** (#2070) · **Revenue at risk report** (#2065) · Timer rework (always-visible state pip) · Timesheet rows UX (stable ordering, section heads) · Future time-off allowed despite no-future-records rule (#2074) · Task filter rework (Potential owner / Owner tag, #2084) · Tag/project-level **mandatory comments at submission** (#2045) · Absence records in Journal approval cockpit (#2055) · Budget status nested sub-budgets (#2083) · **seed-demo onboarding sample data** · desktop app code signing · planned-vs-real v2 tweaks.

## 7. Clarification table (per skill — do not guess)

| Item | Why ambiguous | Candidate classifications |
| --- | --- | --- |
| "People manager → Team lead" rename | 2026-06-22 release note announces it, but prod `labels.json` still says "People managers"; "Team lead" appears nowhere on prod. Reverted, or note wrong? | (a) Ignore — no catalog change; (b) catalog as rename if it re-lands. **Recommend (a)** + fix release-note-derived docs if any. |
| Staffing granularity | One entry or several (view, bookings, capacity, nameless bookings)? | (a) 1 umbrella entry; (b) 3–4 entries (view / bookings / capacity heatmap). **Recommend (b), 3 entries** — matches Gantt precedent. |
| Where do desktop app & extension live? | They're apps, not integrations with third parties. | (a) Integrations section; (b) new "Companion apps" grouping with PWA + Excel/GSheets add-ins; (c) under Time Tracking (they feed suggestions). See structural proposal. |
| AI features placement | Suggestions touch timesheet; NL builder touches reports; digest touches approval; MCP touches integrations. | (a) Scatter each into its functional area; (b) new "AI & Automation" section mirroring the app's own "Beebole AI" page. See structural proposal. |
| Jira anonymisation | Automatic compliance behavior — user-facing feature or internal? | (a) Bullet under `integrations/jira`; (b) Internal section. **Recommend (a)** — admins care (GDPR). |
| Micro-UX items (⌘-click category filter, sticky approval bar, breadcrumb plan step, resizable Gantt column, auto-scroll drag) | Feature vs enhancement — catalog risks becoming a changelog. | (a) Fold into parent entries' descriptions; (b) own entries; (c) omit. **Recommend (a)/(c)** per item — needs a granularity rule (see §8). |
| Scheduled report email delivery | Pre-dates this window (2026-05-06) — missed by the June 10 sync. | Add `reports/schedule-email`. **Recommend: add.** |

---

## 8. Step-back: structural critique of features.md

The delta above adds ~25–30 entries (+~40% in the biggest sections). Before filing them into the current structure, three real problems:

**P1 — The taxonomy predates AI/automation and companion apps.** "Beebole AI" and desktop/extension have no home. Scattering AI into four sections hides what is now a marketed, coherent product area (the app itself groups them on one page). Same for "apps": PWA sits in UI, add-ins in Reporting, desktop/extension would land in Integrations — three homes for the same concept.

**P2 — Numbered section headings are already broken.** There is no section 8 (numbering jumps 7 → 9), and every insertion either renumbers everything (churn, broken references) or grows the drift. The numbers carry no meaning — keys are the stable identifiers.

**P3 — No granularity rule.** Entries range from "GraphQL API" (one line for an entire API) to "Move task between categories" (a context-menu item). Without a rule, each sync inflates the catalog toward a changelog, and `/find-gaps` starts proposing pages for micro-features.

### Proposed structure changes (Option B — targeted, recommended)

1. **Drop section numbers** — plain `## Time Tracking` headings. Keys already provide identity; zero renumbering churn on future syncs.
2. **New section: "AI & Automation"** — suggestions, NL report builder, approval digest, MCP/assistant connections, AI privacy stance. Cross-reference from Time Tracking/Reports/Approval with one-line pointers if needed.
3. **New section: "Companion Apps & Add-ins"** — PWA (move from UI), desktop app, browser extension, Excel add-in, Google Sheets add-in (move from Reporting). "Integrations" stays third-party-services only.
4. **Split "Planning & Tasks Management"** into **"Task Management"** (statuses, hierarchy, ownership, custom fields…) and **"Planning Views & Staffing"** (Gantt, Kanban, Staffing, views, workload) — the section would otherwise be ~30 entries.
5. **Add a "Timesheet rules & locking" subgroup** under Time Tracking for the governance cluster (restrictions, lock date, state/role locking).
6. **Formalize status suffixes** — the ad-hoc HIDDEN / NOT IMPLEMENTED notes proved valuable (accruals, GDPR, recurrence). Convention: `_(status: hidden-flag | placeholder-ui | partial — details)_` so `/find-gaps` and `/write` can parse them.
7. **Granularity rule (add to the skill/file header):** one entry = a capability a user would search the docs for. Interaction refinements fold into the parent entry's description; release notes (`/news`) own enhancements.

**Option A (minimal):** file everything into the existing 25 sections, keep numbers. Cheapest now; P1–P3 worsen at the next sync.
**Option C (heavy):** split into per-domain files with an index. Rejected for now — it would ripple into `/sync-features`, `/find-gaps`, and `page-mappings.md` for little gain at ~450 lines.

Downstream (not this file): the new areas imply future doc work — a Staffing page, an AI/assistant-connections page, desktop/extension install pages — but that's `/find-gaps`' job after the catalog is updated.

---

## 9. Plan summary (approve by number)

1. Add Staffing (3 entries: view, bookings incl. nameless, capacity/workload) — placement per structure decision.
2. Add AI & Automation entries (5): suggestions, NL report builder, approval digest, MCP/assistant connections + Connected apps, AI privacy stance.
3. Add companion apps entries (2): desktop app, browser extension (+ downloads page folded in).
4. Add timesheet entries (5): calendar view, entry restrictions, lock date, record locking by state/role, per-section clear rows.
5. Add validity periods on people & projects (2 entries or fold-ins).
6. Add reports entries (4): planned-vs-real (move from Planned, keep key), absence quota report, mobile reports, scheduled email delivery; plus description updates (§3 items 5–8).
7. Add integrations updates: Jira anonymisation bullet, QuickBooks/Monday description updates.
8. Add roles granular-assignment permissions entry; schedules & custom-fields description updates (§3).
9. Update `tasks/recurring`, `ui/multi-language`, `migration/legacy`, `absence/carry-forward` (§3 items 1–4), notifications/journal descriptions (§3 items 13, 15).
10. Planned section: move planned-vs-real out; add integration-auto-sync + staffing-delivery-reporting remainder; keep onboarding-sample-data (dev-only), gdpr, config-export, custom-domain, accrual-engine.
11. No deprecations.
12. Structure: adopt Option B changes 1–7 (or A/C per decision).
13. Set `Last updated: 2026-08-04` on apply.

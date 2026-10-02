# Screenshot Needs Inventory

Generated: 2026-06-11 (regenerated against the fully overhauled English content)
Previous version: 2026-04-07 (archived in git history; see "Changes since 2026-04-07" below)

**Summary:** ~156 screenshots needed across 56 pages. Original 2026-06-11 inventory: ~132 (55 high, 52 medium, 23 low; +4 Asana shots on disk). 2026-08-04 additions: 24 more (9 high, 10 medium, 5 low) — see the dated section at the bottom.
Capture runs in batches with `/illustrate --batch` (10 shots per batch, one batch per session: high, then medium, then low; within a level, the most-visited pages first per the Traffic block below). Every shot is a replayable scene under `.claude/skills/illustrate/scenes/`; a done entry names its scene. All needs below were derived from the current, code-accurate page content.

**Traffic (90-day `/help/*` pageviews, PostHog PROD 39108, measured 2026-09-29; refresh when older than 30 days).** Pages with open needs, most visited first: mobile 658 · integrations/introduction 223 · timesheets 187 · quickstart 171 · reports 116 · projects 103 · account-settings 92 · timesheetSettings 92 · roles-authorisations 81 · planning 80 · people 78 · approval 77 · authentication 75 · billing 74 · api/schema-explorer 71 · custom-reports 70 · work-schedule 67 · timeoff 66 · concepts 64 · budgets 61 · tags 54 · costs 50 · public-holidays 46 · integrations/quickbooks 44 · journal 43 · integrations/microsoft-calendar 43 · data-exports 42 · custom-fields 42 · integrations/custom-integrations 40 · notifications 39 · subscription 38 · integrations/jira 38 · integrations/webhooks 38 · excel-addin 38 · assignments 38 · ai 36 · gsheets-addon 35. Pages not listed had fewer than 35 views.

**Already on disk (do not re-capture):**
- `help/images/index-beebole-documentation.webp` (landing hero)
- `help/images/integrations/asana-connect.webp`, `asana-params.webp`, `asana-updating.webp`, `asana-validate.webp`

## Capture spec (locked 2026-06-11 — apply to every shot)

- **DPR 2** on the Playwright context (`deviceScaleFactor: 2`) — this, not the physical monitor (retina vs 4K is irrelevant), is what makes shots crisp. `browser_resize` does NOT set DPR; verify `window.devicePixelRatio === 2` before capturing.
- **Viewport by type:** full app/dashboard = **1440×900** logical; panel/dialog/single control = element screenshot (`locator.screenshot()`) or ~**1024** wide so it fills the frame; mobile (`mobile/*`) = **390×844**.
- **WebP:** `cwebp -q 80` → must be under 200 KB → drop to `-q 60` if over.
- **One DPR + one viewport-set for all shots** — consistency is the priority. Mintlify renders images in a ~700px column, so 1440@2x downscales crisp everywhere; DPR 3 just bloats files.
- **Hide app chrome before each shot:** inject a DOM-only style (no code change) hiding the Intercom launcher and the `<beta-badge>` — `[class*="intercom" i],[id*="intercom" i],iframe[name*="intercom" i],beta-badge{display:none!important}`. Re-apply after any hard reload (it's wiped on full reload but survives in-app SPA navigation). Full snippet in the `/illustrate` skill.
- **Seed data:** capture against a seeded account so examples match the prose (**Acme Corp**, the **Client**/**Internal**/**Activity** categories, the **Main plan** planning, a pending approval, etc.). The names are singular — read `../reboot/shared/i18n/config.json`, not the stale plural copy under `backend/dist/`. Corrected 2026-09-07.
- **Best run as a guided session** (app running locally with seed data; Playwright drives navigation/framing; operator confirms state on complex shots).

---

## Changes since 2026-04-07

The April inventory (210 entries) was built against the pre-overhaul pages, many of which described features that don't exist. This version is regenerated from scratch against the rewritten content, so it is not a line-by-line carryover. Key structural deltas:

- **Dropped entirely** — `custom-domain.mdx` and `sso.mdx` were deleted (features don't exist / consolidated into authentication); their April screenshot entries are gone.
- **Reframed** — `planning.mdx` April entries assumed a resource-allocation grid that never existed; replaced with real Tasks-page / Gantt / Kanban screenshots. `timesheetSettings.mdx`, `approval.mdx`, `billing.mdx`, `costs.mdx`, `reports.mdx`, `custom-reports.mdx`, `account-settings.mdx`, `authentication.mdx`, `notifications.mdx`, `roles-authorisations.mdx` entries were rebuilt around the real panels/labels.
- **Now real (were "coming soon")** — `google-calendar.mdx` / `microsoft-calendar.mdx` now need the timesheet external-calendar-pane screenshots (not Settings pages).
- **New page** — `xero.mdx` added (connect, invoice export, sync result).
- **Now need none** — the API reference pages (`queries`, `mutations`, `examples`, `introduction`) are code-only; only `schema-explorer.mdx` needs the GraphiQL shots. The role guides (`employee`, `project-manager`, `team-leader`) and `migration`/`faq` link out to feature pages and need no screenshots of their own. `news/releases.mdx` is text-only.
- **Net count** dropped from 210 → ~132 — fewer fabricated/redundant shots, tighter to real UI.

---

# Documentation

## help/index.mdx

_Landing hero already on disk (`index-beebole-documentation.webp`) — no new screenshot needed._

## help/documentation/quickstart.mdx

| Screenshot | Description | Priority |
|---|---|---|
| quickstart/signup-form.webp | The Beebole sign-up form with Full name, Work email, Company name fields and Google/Microsoft buttons | medium — done (scene `quickstart-signup`, signed out, 2026-09-30) |
| quickstart/add-project-panel.webp | Projects page with category selector and the Add [category] panel open, name field and Save new button | medium — done on the Client category (scene `quickstart-add-project-panel`, 2026-09-30) |
| quickstart/add-person-panel.webp | People add panel showing Name/Email/Role plus the "Or add multiple entries" paste area | medium — done as `people/add-person-panel.webp`, shared with People (scene `quickstart-add-person-panel`, 2026-09-30) |
| quickstart/first-timesheet-row.webp | Timesheet with one row added against the new project, a day cell filled and the row timer button | high — done as a lens on the Add a row button, `timesheets/add-row-button.webp` (scene `quickstart-add-row-button`, 2026-09-29); the timer button is already shown on the Timesheets page |
| quickstart/sample-report-result.webp | Reports section with Monthly Timesheets folder open and "Hours by person & project" results displayed | medium — done with `reports/folders-and-reports.webp` (scene `reports-folder-report`, shared with Reports, 2026-09-29) |

## help/documentation/concepts.mdx

| Screenshot | Description | Priority |
|---|---|---|
| concepts/duplicate-action-menu.webp | A record's ⋯ action menu open showing the Duplicate option | low — done on Sophie Laurent's profile (scene `concepts-duplicate-menu`, 2026-10-01) |
| concepts/version-update-banner.webp | The "Update available / Click to reload" banner in the interface | low — done over the Projects page: the scene answers `/version.txt` with another build after load, then fires the tab-return check, so the banner is the app's own (scene `concepts-version-banner`, 2026-10-01) |
| concepts/fuzzy-search.webp | The People search with a fuzzy query and the matched letters highlighted | medium — added and done: `ela` matches Elena Rossi and Sophie Laurent; the page example (Alice Brooks) used names the account does not have, replaced (scene `concepts-fuzzy-search`, 2026-10-01) |
| concepts/attribute-copy-paste.webp | Copy and Paste on an attribute panel | low — added and done: Acme Corp's billing copied, Greenleaf Industries' Billing panel showing Paste (scene `concepts-attribute-copy-paste`, 2026-10-01) |

## help/documentation/projects.mdx

| Screenshot | Description | Priority |
|---|---|---|
| projects/project-tree-categories.webp | Projects page showing the category selector next to "Projects:" and the nested project/subproject tree | high — done as `projects/projects-tree.webp` (scene `projects-tree`, 2026-09-29) |
| projects/add-multiple-entries.webp | The "Or add multiple entries" paste preview before clicking Add them all | medium — done: two clients and four projects in the Import preview, the clipboard answered by the scene (scene `projects-add-multiple-entries`, 2026-09-30). The button is Import entries, not Add them all: corrected on every page |
| projects/project-settings-panels.webp | A project detail panel showing the list of settings panels (Manager, Tags, Billing, Budgets, Who has access?, etc.) | medium — done on Acme Corp, panels closed (scene `projects-settings-panels`, 2026-09-30) |
| projects/who-has-access-panel.webp | The "Who has access?" panel with the Available/Unavailable toggle and Individually / By tags fields | medium — done with `assignments/who-has-access-panel.webp` (scene `assignments-who-has-access`, 2026-09-30) |

## help/documentation/people.mdx

| Screenshot | Description | Priority |
|---|---|---|
| people/people-list.webp | The People list with avatars, roles, and an Invitation pending status | high — done with a profile open and Invite by email (scene `people-list`, 2026-09-29); the list shows no roles, and Invitation pending only appears once an invitation is sent |
| people/add-person-panel.webp | The Add person panel showing Name/Email/Role and the "Or add multiple entries" area | medium — done (scene `quickstart-add-person-panel`, shared with Quick start, 2026-09-30) |
| people/person-profile-panels.webp | A person's profile showing the attribute panels (Manages, Tags, Billing, Absence allowances, Localization) | medium — dropped 2026-10-01: `people/people-list.webp`, right above the section, already shows the profile's panel list, and the full list makes a strip too tall for the column |
| people/bulk-actions-menu.webp | The list with checkboxes selected and the bulk actions menu (Invite, Archive, Unarchive, Delete) | low — done: three people checked, the bulk bar at the bottom (scene `people-bulk-actions`, 2026-10-01). It is a bar, not a menu: page corrected |

## help/documentation/tags.mdx

| Screenshot | Description | Priority |
|---|---|---|
| tags/tag-tree-categories.webp | Tags page with the category selector (Department/Location) and the nested tag tree | high — done as `tags/tags-list.webp` (scene `tags-list`, 2026-09-29) |
| tags/who-or-what-tagged-panel.webp | A tag's "Who or what has been tagged?" panel with People/Projects/Tasks sections | medium — done on Frontend (scene `tags-tagged-panel`, 2026-09-30) |
| tags/tag-cascade-panels.webp | A tag detail panel showing the cascading settings panels (Work schedule, Billing, Approval workflow, etc.) | medium — done within `tags/tags-list.webp` (scene `tags-list`, 2026-09-29) |
| tags/tags-level-names-dialog.webp | The Level names dialog of the Department category | done (scene `tags-level-names-dialog`, 2026-09-29) |
| tags/tags-person-panel.webp | A person's Tags panel with a team, a contract type and an office | done (scene `tags-person-panel`, 2026-09-29) |

## help/documentation/timesheets.mdx

| Screenshot | Description | Priority |
|---|---|---|
| timesheets/weekly-grid.webp | The weekly timesheet grid with sections, rows, day columns, and the day-header scheduled-hours indicators | high — done (scene `timesheets-weekly-grid`, 2026-09-29) |
| timesheets/entry-details.webp | An entry's detail popover showing Time spent, Start/End time, note, Non-billable and Work from home | medium — done (scene `timesheets-entry-details`, 2026-09-29) |
| timesheets/timer-running.webp | A row with the timer running and the floating on-screen timer | medium — done (scene `timesheets-timer`, fixture: a running entry created and removed around the capture, 2026-09-29) |
| timesheets/copy-paste-cluster.webp | The top-left button cluster (copy, paste period, calendar, approval, team) with the Paste Add/Replace prompt | medium — copy button done as a lens `timesheets/copy-button.webp` (scene `timesheets-copy-button`); the Paste prompt done as `timesheets/paste-dialog.webp` (scene `timesheets-paste-dialog`, 2026-09-30). The Paste period button sits below the copy button: page corrected |
| timesheets/calendar-import-pane.webp | The calendar import pane with Google/Microsoft events listed and a Tracked badge | medium — button done as a lens `timesheets/import-calendar-button.webp` (scene `timesheets-import-calendar-button`); the pane with events needs a connected Google or Microsoft calendar: guided |
| timesheets/timesheet-score-ring.webp | A team pane avatar with the colored Timesheet score ring and its hover breakdown | low — on hold: approvals exist since 2026-09-29, but every score is low because the history was submitted in one day (see `seed-documentation/README.md`) |
| timesheets/calendar-view.webp | The calendar view with the favorites bar | high — done (scene `timesheets-calendar-view`, 2026-09-29) |
| timesheets/row-menu.webp | A row's ⋯ action menu (Pin to top, Edit, Remove row) | done (scene `timesheets-row-menu`, 2026-09-29; found from the page) |
| timesheets/team-pane.webp | The Team pane with members and their reported time | done (scene `timesheets-team-pane`, 2026-09-29; found from the page) |

## help/documentation/timesheetSettings.mdx

| Screenshot | Description | Priority |
|---|---|---|
| timesheets/settings-period-tab.webp | Timesheet settings panel, Period & submission tab, showing period options, auto-submit and Restrictions chips | high — done (scene `timesheet-settings-period`, 2026-09-29) |
| timesheets/settings-time-entry-tab.webp | The Time entry tab showing Unit, Duration format, timer and start/end time options | medium — done (scene `timesheet-settings-time-entry`, 2026-09-30). Require comments for submission moved to the Restrictions table: the app shows it there |
| timesheets/settings-categories-tab.webp | The Categories tab showing chained project categories as timesheet sections | medium — done (scene `timesheet-settings-categories`, 2026-09-30) |
| timesheets/settings-inheritance-icon.webp | A setting showing the inherited-value icon (account vs tag vs person override) | low — done on Marc Dubois's panel, the gear's tooltip naming Settings / Timesheet and Planning Settings (scene `timesheet-settings-inherited`, 2026-10-01) |

## help/documentation/approval.mdx

| Screenshot | Description | Priority |
|---|---|---|
| approval/pending-pane.webp | The Pending approval pane listing submitted timesheets with Approve/Reject and the Late group | high — done with Show all on (scene `approval-pending-pane`, 2026-09-29) |
| approval/workflow-stages.webp | The Approval workflow panel with sequential stages, approver type and Any/All quorum | high — done (scene `approval-workflow-stages`, 2026-09-29) |
| approval/status-badge-breakdown.webp | A timesheet status badge expanded into the stage breakdown (who approved, who's pending) | medium — done from Ana Pereira's Submitted badge in the Team pane, since Jordan Reed's own week is a draft (scene `approval-status-breakdown`, 2026-09-30) |
| approval/journal-approval-banner.webp | The Journal "N timesheets to approve" banner expanded with Hours/Billing totals | medium — blocked 2026-09-30: the Journal of Jordan Reed (signed in) reads All caught up, as the pending weeks wait for project managers. Needs Jordan as a current-stage approver of a pending week, a seed change to project managers that other shots show |
| approval/reject-comment-dialog.webp | The reject dialog with the required reason comment box | low — done with a reason typed in (scene `approval-reject-dialog`, 2026-10-01) |

## help/documentation/planning.mdx

| Screenshot | Description | Priority |
|---|---|---|
| planning/tasks-page-views.webp | The Tasks page with the saved-view tabs (Gantt / Kanban) and the task category selector | high — done as `planning/kanban-view.webp` (scene `planning-kanban-view`, 2026-09-29); the same screen can illustrate kanban.mdx (`kanban/board-columns`) |
| planning/add-task-panel.webp | The Add Task form with name, status selector, and the "Or add multiple entries" paste area | medium — done (scene `planning-add-task-panel`, 2026-09-30) |
| planning/task-detail-panel.webp | A task detail panel showing Owner/% FTE, dates with lock buttons, Planned in hours, and overflow warning pill | medium — done as `planning/task-schedule-panel.webp` on QA Testing: whole days, lock buttons, Planned in hours with its capacity pill and the overload warning (scene `planning-task-schedule-panel`, 2026-10-02). Unblocked by the seed repair of 2026-10-02 (whole days, planned hours). The pill is not red: QA Testing fits its period. Owner and % FTE are in another panel |
| planning/task-statuses-modal.webp | The Task statuses modal with statuses, colors, reorder, and Max tasks | medium — done within `planning/planning-settings-dialog.webp` (scene `planning-settings-dialog`, 2026-09-29) |

## help/documentation/gantt.mdx

| Screenshot | Description | Priority |
|---|---|---|
| gantt/timeline-bars.webp | The Gantt chart with task bars on the timeline, today line, and the configurable column table on the left | high — done (scene `gantt-timeline`, 2026-09-30); shows the Row # and Task Name columns only |
| gantt/dependencies-arrows.webp | Tasks linked with dependency arrows between bars | medium — done within `gantt/timeline-bars.webp` (scene `gantt-timeline`, 2026-09-30) |
| gantt/workload-heatmap.webp | Grouped-by-Owner view showing the workload heatmap bars with an over-capacity tooltip | high — done: grouped by Owner, Sophie Laurent's week of 5 October hovered, 306% (scene `gantt-workload-heatmap`, 2026-10-02). The blocker was a seed bug: the seed gave the planned hours as the effort, which the API reads in milliseconds (200 h became 200 ms). Repaired by `layer.mjs` on 2026-10-02 |
| gantt/scale-columns-menu.webp | The view tab ⋯ menu showing Scale / Columns / Group by options | low — done as `gantt/columns-menu.webp`, the menu with its Columns submenu (scene `gantt-columns-menu`, 2026-10-01); the menu itself is already in `gantt/view-period-weeks.webp` |

## help/documentation/kanban.mdx

| Screenshot | Description | Priority |
|---|---|---|
| kanban/board-columns.webp | The Kanban board with status columns and task cards (Backlog → In progress → Done) | high — done with `planning/kanban-view.webp` (scene `planning-kanban-view`, shared with Planning, 2026-09-30) |
| kanban/wip-limit-rejected.webp | A column at its WIP limit with the red border and "at its task limit" error while dragging | medium — done: a card held over Queue at 3/3, red border (scene `kanban-wip-limit`, fixture: Queue's Max tasks set to 3 for the capture, 2026-10-01). The drop error is a toast, which captures hide |
| kanban/card-add-time.webp | A card hover showing the Add time clock button and the logged/planned pill (e.g. 4h / 8h) | medium — done: Frontend Development's 4 / 200 pill and Backend Development's clock under the mouse, by a fixture that lists the Main plan and logs 4 h for Jordan Reed (scene `kanban-card-add-time`, 2026-10-02). The pill reads `4 / 200`, not `4h / 8h`: Kanban and Planning pages corrected |
| kanban/column-menu.webp | A column header ⋯ menu (Archive, Unarchive, Move left/right, Delete) | low — done on the Queue column (scene `kanban-column-menu`, 2026-10-01) |

## help/documentation/timeoff.mdx

| Screenshot | Description | Priority |
|---|---|---|
| timeoff/absence-types-list.webp | The Settings > Time Off list of absence types with the Add Time Off Type button | high — done with PTO open on its Units panel (scene `timeoff-absence-types`, 2026-09-30) |
| timeoff/absence-allowances-panel.webp | The Absence allowances panel showing Available / Consumed / Accrued balance fields on a person | high — done on Elena Rossi's inherited PTO allowance (scene `timeoff-allowances-panel`, 2026-09-30) |
| timeoff/units-paid-panel.webp | An absence type's Units panel with Hour/Day and the "Is paid (included in people costs)" checkbox | medium — done within `timeoff/absence-types-list.webp` (scene `timeoff-absence-types`, 2026-09-30) |
| timeoff/timeoff-notifications-panel.webp | The Time off notifications panel with Going negative and frequency alerts | low — done on PTO (scene `timeoff-notifications-panel`, 2026-10-01) |

## help/documentation/accruals.mdx

| Screenshot | Description | Priority |
|---|---|---|
| accruals/accruals-panel.webp | An absence type's Accruals panel with the enable toggle, Frequency, Awarded on, and Quantity | high — on hold: the Accruals page is tagged Soon, the feature is not live yet |
| accruals/carry-forward-limit.webp | An allowance card showing the Carry forward limit field | medium — done by linking `timeoff/absence-allowances-panel.webp` (Carry forward limit 5 d), 2026-10-01; the section's steps were corrected (no carry-forward switch, no unlimited option) |

## help/documentation/public-holidays.mdx

| Screenshot | Description | Priority |
|---|---|---|
| public-holidays/holidays-panel.webp | The Public holidays panel with Country/Region/Language selectors, Load holidays, and the imported holiday list | high — done in Account Settings, US holidays 2026 (scene `public-holidays-panel`, 2026-09-30) |
| public-holidays/year-selector.webp | The Year selector with the locked Country ("Reset to change country") | low — done with the Year list open (scene `public-holidays-year-selector`, 2026-10-01). The country is no longer locked; the list also offers years past the window that already have holidays (2030), page corrected |

## help/documentation/billing.mdx

| Screenshot | Description | Priority |
|---|---|---|
| billing/billing-rate-card.webp | A Billing panel rate card showing From date, Billing method, Amount and currency | high — done (scene `billing-rate-card`, 2026-09-29) |
| billing/rate-priority.webp | Panel view illustrating which rate applies across the org → tag → project → person cascade | medium — done as `billing/rate-inherited.webp`: Video Production inheriting Brightwave Media's rate, the source tooltip shown (scene `billing-rate-inherited`, 2026-09-30) |
| billing/rate-split.webp | A rate with Split by persons showing per-person amounts and Non-billable checkboxes | medium — done on Northstar Financial, fixture: the split exists only during the capture (scene `billing-rate-split`, 2026-09-30) |

## help/documentation/costs.mdx

| Screenshot | Description | Priority |
|---|---|---|
| costs/cost-rate-card.webp | A Cost panel rate card with Cost method, Amount and From date | high — done on Ana Pereira's Cost panel (scene `costs-rate-card`, 2026-09-30) |
| costs/margin-report-columns.webp | A custom report with Billing, Cost, and Margin columns shown together | medium — done: Margin by Client per Month gets client, Hours, Billing, Cost and Margin by a fixture, put back right after (scene `costs-margin-report`, 2026-10-02). Its saved params had billing and cost but no column order, which the app needs for those columns. Margin % is left out: on QA its client rows read several hundred percent (Acme Corp 503% for 157,450 on 586,200) while the total reads 37%, a possible app bug |

## help/documentation/budgets.mdx

| Screenshot | Description | Priority |
|---|---|---|
| budgets/budget-panel.webp | A project's Budgets panel with Billing amount / Cost amount / Hours target fields | high — done on Web Portal, card open (scene `budgets-panel`, 2026-09-30); larger amounts get clipped by the app's narrow amount fields, so the scene uses the smallest budget |
| budgets/budget-status-report.webp | The Budget Status report with per-project progress bars, at-risk and Over budget flags | high — done in the stacked layout, which fits 1440 (the side-by-side layout overflows it) (scene `budgets-status-report`, 2026-09-30) |
| budgets/budget-alert-badge.webp | A budget card showing the threshold alert / Over budget badge | low — dropped 2026-10-01: budget cards have no alert badge (budget notifications are not available); At risk and Over budget show in `budgets/budget-status-report.webp` |

## help/documentation/expenses.mdx

| Screenshot | Description | Priority |
|---|---|---|
| expenses/expense-type-details.webp | An expense type's Details panel with Currency, Billing markup %, and Impacts budget | medium — done on Hotel (scene `expenses-type-details`, 2026-10-01). Impacts budget is not shown on production hosts, so the scene hides it; the Budget Status report counts every expense. Expenses and Budgets pages corrected |
| expenses/expenses-panel.webp | The Expenses panel on a project/person with a record (date, category, amount, note) | high — done on Ana Pereira with the Hotel record expanded (scene `expenses-panel`, 2026-09-30); the Show past link is hidden in the scene because its label is missing in the app (raw key `expenseRecord.showPastQuotas`) |
| expenses/expense-report.webp | A report with Expenses as the source showing Amount/Quantity/Expense billing columns | low — done: Absences by person shown as Expenses by type, by expense type with Quantity, Amount and Expense billing, by a fixture that puts back its name and params (scene `expenses-report`, 2026-10-02) |

## help/documentation/reports.mdx

| Screenshot | Description | Priority |
|---|---|---|
| reports/folders-and-reports.webp | The Reports section with the folder list, period selector, and a report open | high — done (scene `reports-folder-report`, 2026-09-29) |
| reports/table-chart-matrix-toggle.webp | The Table / Chart / Matrix view toggle buttons next to a report name | medium — done: the report header with Table and Chart on (scene `reports-view-toggles`, 2026-09-30) |
| reports/schedule-dialog.webp | The Schedule report dialog with Report period, Send timing, and recipients | medium — dropped 2026-09-30: the Reports page no longer describes scheduling a report |
| reports/period-filter-controls.webp | The folder period selector and Filters condition builder | low — done with the period target list open (scene `reports-period-selector`, 2026-10-01). Adding a filter condition saves the folder, so the builder is not shown |

## help/documentation/custom-reports.mdx

| Screenshot | Description | Priority |
|---|---|---|
| custom-reports/column-badges-menu.webp | A report's column badge row with the "Add a column…" menu open (Time/Expense/Period/Entities groups) | high — done, opened from a column header menu (scene `custom-reports-column-menu`, 2026-09-30) |
| custom-reports/chart-view.webp | The Chart view with the chart-type picker and Label/Value axis controls | medium — done, Stacked bar of hours per client by month (scene `custom-reports-chart`, 2026-09-30) |
| custom-reports/matrix-view.webp | The Matrix view grid with Rows/Columns/Metric controls and heat map shading | high — done, months as rows and clients as columns, heat map on (scene `custom-reports-matrix`, 2026-09-30) |
| custom-reports/chart-type-picker.webp | The chart type picker open over a chart | low — added and done (scene `custom-reports-chart-type`, 2026-10-01); the list scrolls, Waterfall is below the fold |

## help/documentation/data-exports.mdx

| Screenshot | Description | Priority |
|---|---|---|
| data-exports/export-submenu.webp | A report's ⋯ menu with the Export submenu listing all formats (Excel, CSV, PDF, Matrix variants) | high — done on Hours by Person, the QA-only Raw JSON item hidden (scene `data-exports-menu`, 2026-09-30) |
| data-exports/delete-account-banner.webp | The Delete Account grace-period banner with Cancel deletion | low — blocked 2026-10-01: needs a scheduled deletion of the documentation account, a mutation the runner refuses |

## help/documentation/excel-addin.mdx

| Screenshot | Description | Priority |
|---|---|---|
| excel-addin/task-pane-links.webp | The Beebole Excel task pane showing the "Beebole reports linked" table and Refresh buttons | high — guided: runs inside Excel, outside the runner's browser |
| excel-addin/add-report-link.webp | The Add Report Link form with Report and Worksheet fields | medium |
| excel-addin/api-key-connect.webp | The task pane API Key field with Connect, plus the API Key page in Beebole showing Copy/Reset | medium |

## help/documentation/gsheets-addon.mdx

| Screenshot | Description | Priority |
|---|---|---|
| gsheets-addon/sidebar-links.webp | The Beebole Reports sidebar in Google Sheets with the linked-reports table and Refresh buttons | high — guided: runs inside Google Sheets, outside the runner's browser |
| gsheets-addon/add-report-link.webp | The Add Report Link form with Report and Sheet fields | medium |

## help/documentation/work-schedule.mdx

| Screenshot | Description | Priority |
|---|---|---|
| work-schedule/schedule-details.webp | A work schedule's Details panel showing per-day Hours, Intervals, and Work From Home toggles | high — done, first two days of the Full Time cycle (scene `work-schedule-details`, 2026-09-30) |
| work-schedule/assign-panel.webp | A Work schedule panel on a person/tag with the Select schedule picker and inherited-value indicator | medium — done on Elena Rossi, Full Time inherited from the organization (scene `work-schedule-assign-panel`, 2026-09-30) |
| work-schedule/dated-assignments.webp | Two schedule assignments with Start date pickers showing a change over time | low — done on Yuki Tanaka: Half Time – 5d from Jan 4, 2027 (seed layer) after the inherited Full Time (scene `work-schedule-dated-assignments`, 2026-10-01). The backend refuses a schedule the person already inherits, so only the new one is on the person |

## help/documentation/custom-fields.mdx

| Screenshot | Description | Priority |
|---|---|---|
| custom-fields/field-details-type.webp | The Custom field details panel with the Field type picker and type-specific options | high — done on the Cost center field (Text, predefined values), added to the seed layer (scene `custom-fields-details`, 2026-09-30) |
| custom-fields/field-visibility-panel.webp | The Custom field visibility panel (Visible for People/Time Records/Projects/Tasks with category pickers) | high — done on Cost center: Client projects at the Project level (scene `custom-fields-visibility`, 2026-09-30) |
| custom-fields/predefined-values.webp | A Text field with Use predefined values and the Allowed values list | low — already shown by `custom-fields/field-details-type.webp` (Use predefined values on, three Allowed values), closed 2026-10-01 |

## help/documentation/roles-authorisations.mdx

| Screenshot | Description | Priority |
|---|---|---|
| roles/permission-grid.webp | The Person Roles permission grid showing permissions with Edit/View target selectors | high — done (scene `roles-permission-grid`, panel widened by its resize handle, 2026-09-29) |
| roles/target-selector.webp | A permission's target selector open (Me, My team, My projects, etc.) | medium — done on People details, Edit (scene `roles-target-selector`, 2026-09-30) |
| roles/admin-full-access.webp | The "Admin role (full access)" checkbox at the top of the grid | low — done within `roles/permission-grid.webp`, which shows the checkbox at the top of the grid (2026-10-01) |

## help/documentation/assignments.mdx

| Screenshot | Description | Priority |
|---|---|---|
| assignments/show-hide-by-default.webp | The Show or hide by default panel with the six toggles | high — done (scene `assignments-show-hide-by-default`, 2026-09-30) |
| assignments/who-has-access-panel.webp | A project's Who has access? panel with the Available/Unavailable toggle and Individually / By tags | high — done on Acme Corp, available to everyone, so the sections read Excluded individually / Excluded by tags (scene `assignments-who-has-access`, 2026-09-30); also linked from Projects |
| assignments/show-hide-person.webp | A person's Show or Hide panel showing the Show/Hide sections for projects, time off, etc. | medium — done on Ana Pereira (scene `assignments-show-hide-person`, 2026-10-01) |

## help/documentation/journal.mdx

| Screenshot | Description | Priority |
|---|---|---|
| journal/activity-feed.webp | The Journal feed showing the chronological timeline with the "new" separator and mixed event types | high — done as a person's Journal (Ana Pereira: expense and time record changes) (scene `journal-feed`, 2026-09-30). The organisation Journal is empty on QA and nothing is unread, so no "new" separator; reshoot the org feed once it has events |
| journal/message-thread.webp | A threaded message with rich text, @mention, and pin | medium — done as `journal/message-mention.webp`: one message with bold text and a project mention on Website Redesign (scene `journal-message-mention`, fixture, 2026-10-01). No reply: a reply's quote shows the raw key journalReplyTo.commentedOn on production. The pin button did not show under the runner's mouse. The message is dated when the fixture runs, so replay reports its age changed: compare by eye |

## help/documentation/notifications.mdx

| Screenshot | Description | Priority |
|---|---|---|
| notifications/preferences-panel.webp | The Notifications panel with Email/Push channels and per-event frequency selectors (Instant/Daily/Weekly/None) | high — done (scene `notifications-preferences`, 2026-09-30); the push channel and the budget alerts row are hidden in the scene, as on production hosts |
| notifications/budget-threshold-alert.webp | The Budget threshold alert row with the percentage and "When over budget" | medium — dropped 2026-09-30: budget threshold alerts are not shown on production hosts |
| notifications/email-templates.webp | The Email templates panel with the per-type tabs and the editor | medium — done in Account Settings, Sign Up tab (scene `notifications-email-templates`, 2026-09-30) |

## help/documentation/account-settings.mdx

| Screenshot | Description | Priority |
|---|---|---|
| account-settings/settings-panels.webp | The Account Settings page header (name, logo, accent color) above the list of settings panels | high — done (scene `account-settings-page`, QA badge hidden, 2026-09-29) |
| account-settings/localization-panel.webp | The Localization panel with time zone, currency, formats, and first day of the week | medium — done (scene `account-settings-localization`, 2026-09-30). The account panel has no Language field: the page now says language is a personal choice |
| account-settings/delete-account.webp | The Delete Account screen with the confirm/cancel deletion flow | low — done before scheduling: the warning and Yes, delete my account (scene `account-settings-delete-account`, 2026-10-01). The Cancel deletion state needs a scheduled deletion |

## help/documentation/authentication.mdx

| Screenshot | Description | Priority |
|---|---|---|
| authentication/signin-email-code.webp | The Beebole sign-in page entering email and the 6-digit code prompt | high — done as `authentication/signin-page.webp` (scene `authentication-signin`, signed out, 2026-09-29); the code prompt needs a real sign-in request, which the runner blocks: not automatable |
| authentication/sso-panel.webp | The Single Sign-On panel with Google/Microsoft/Custom OpenID tabs and Linked domains | high — done (scene `authentication-sso-panel`, 2026-09-29) |
| authentication/api-key-page.webp | The API Key page with the masked key, Copy, and Reset | medium — done as `authentication/api-key-menu.webp`: it is the Your API key submenu of the user menu, not a page; the key text is replaced by the scene (scene `authentication-api-key`, 2026-09-30). The menu label is Your API key: corrected on five pages |
| authentication/sign-in-as.webp | The Sign in as… search box from the user menu | low — done (scene `authentication-sign-in-as`, 2026-10-01) |

## help/documentation/subscription.mdx

| Screenshot | Description | Priority |
|---|---|---|
| subscription/plans-seats.webp | The Subscription page showing the Free/Essential/Advanced plans, seat stepper, and billing interval | high — done (scene `subscription-plans-seats`, 2026-09-30) |
| subscription/addons.webp | The add-ons section (Costs/Expenses/Budgets and Custom fields/roles) on the Essential plan | medium — blocked 2026-10-01: add-ons only show for an active subscription on the Essential plan; the documentation account is on a trial |

## help/documentation/audit-trail.mdx

| Screenshot | Description | Priority |
|---|---|---|
| audit-trail/journal-audit-feed.webp | The Journal feed showing audit messages (operation, person, timestamp) | medium — done within `journal/activity-feed.webp`, already on the Audit trail page: the organisation's Journal is empty on the documentation account, a person's Journal shows the changes (2026-10-01) |
| audit-trail/record-logs-view.webp | A record's Modified by label with the expanded Logs change history | high — dropped 2026-09-30: the Modified by badge and its Logs link were removed from the app on 2026-02-17; a record's changes now show in its Journal panel, and the page links `journal/activity-feed.webp` |

## help/documentation/legacy-migration.mdx

| Screenshot | Description | Priority |
|---|---|---|
| legacy-migration/migration-options.webp | The Legacy Migration tool with the Legacy API Key field and the migration options (Only active entities, Include time records from) | high — dropped: the legacy migration tool was removed from Settings in September 2026 |
| legacy-migration/audit-results.webp | The Audit Results screen showing record counts and the time-record date range | medium — dropped: the legacy migration tool was removed from Settings in September 2026 |
| legacy-migration/migration-report.webp | The final migration report summary (created / skipped / failed per phase) | low — dropped 2026-10-01: the migration tool was removed from Settings in September 2026 |

## help/documentation/mobile.mdx

| Screenshot | Description | Priority |
|---|---|---|
| mobile/mobile-timesheet.webp | The mobile timesheet day-list layout with the floating + button and a time entry card | high — done at 390×844 (scene `mobile-timesheet`, 2026-09-29); replay 2026-09-30 reports it changed (15 %): QA now shows two suggestion cards on Tuesday and Wednesday. Recapture on the next release |
| mobile/install-prompt.webp | The Add to Home Screen / Install app prompt on a phone | medium — guided: the install prompt is the phone browser's own UI, outside the app page the runner captures |
| mobile/mobile-timer.webp | A running timer on a mobile entry card with the header timer bar | medium — done (scene `mobile-timer`, fixture: a running entry around the capture, 2026-09-30) |
| mobile/mobile-approval-sheet.webp | The mobile approval bottom sheet with Pending / Team tabs | low — done on the Pending tab, 30 weeks with Show all on (scene `mobile-approval-sheet`, 2026-10-01) |
| mobile/dark-mode.webp | Beebole in dark mode on mobile | low — done: the theme is Auto, the phone set to dark (scene `mobile-dark-mode`, 2026-10-01) |

---

# Integrations

## help/integrations/introduction.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/settings-integrations-list.webp | The Settings > Integrations page listing all integrations (Asana, Jira, Linear, Monday.com, QuickBooks, Xero, BambooHR, Webhooks), reached from the initials button at the bottom of the sidebar | high — done (scene `integrations-list`, 2026-09-29) |

## help/integrations/jira.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/jira-connect.webp | Settings > Integrations > Jira showing the Connect to Jira button (and the Jira Cloud URL prompt in the popup) | high — guided: needs a connected account on QA. The pre-connection screen was captured and removed on 2026-09-30 (Yves): it is the same empty screen for every integration. Shoot the Jira config panel once connected |
| integrations/jira-params.webp | The Jira config panel: Where to import your tasks and Default role for imported employees | medium |
| integrations/jira-validate.webp | The Projects page with the new Jira category expanded, showing imported projects and issues | medium |

## help/integrations/linear.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/linear-connect.webp | Settings > Integrations > Linear showing the Connect to Linear button | high — guided: needs a connected account on QA. The pre-connection screen was captured and removed on 2026-09-30 (Yves): it is the same empty screen for every integration. Shoot the Linear config panel once connected |
| integrations/linear-params.webp | The Linear config panel: import-destination choice and Default role for imported employees | medium |

## help/integrations/monday.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/monday-connect.webp | Settings > Integrations > Monday.com showing the Connect to Monday.com button | high — guided: needs a connected account on QA. The pre-connection screen was captured and removed on 2026-09-30 (Yves): it is the same empty screen for every integration. Shoot the monday.com config panel once connected |
| integrations/monday-params.webp | The Monday.com config panel: workspace selector, Where to import your boards, and Default role | medium |

## help/integrations/quickbooks.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/quickbooks-connect.webp | Settings > Integrations > QuickBooks Online showing Connect to QB Online and the Default role / Enable integration controls | high — guided: needs a connected account on QA. The pre-connection screen was captured and removed on 2026-09-30 (Yves): it is the same empty screen for every integration. Shoot Default role and Enable integration once connected |
| integrations/quickbooks-export.webp | The Select period to export control with the Export button | high — guided: only shown once a QuickBooks Online account is connected, which QA does not have |
| integrations/quickbooks-export-result.webp | The result panel: Entries successfully exported count and the expandable Entries not exported list | medium |

## help/integrations/xero.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/xero-connect.webp | Settings > Integrations > Xero showing Connect to Xero, the Select your Xero organization step, and Enable integration | high — guided: needs a connected account on QA. The pre-connection screen was captured and removed on 2026-09-30 (Yves): it is the same empty screen for every integration. Shoot Select your Xero organization and Enable integration once connected |
| integrations/xero-export-invoice.webp | The invoice-export panel: Select client, Select period to export, and Create invoice | high — guided: needs a connected Xero organisation on QA, as for `integrations/xero-connect.webp` |
| integrations/xero-sync-result.webp | A Manual sync result showing the Created / Archived / Unarchived / Deleted / Renamed counts | low |

## help/integrations/bamboohr.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/bamboohr-connect.webp | Settings > Integrations > BambooHR showing the Company subdomain field and Connect to BambooHR button | high — guided: needs a connected account on QA. The pre-connection screen was captured and removed on 2026-09-30 (Yves): it is the same empty screen for every integration. Shoot the confirmed BambooHR domain, Default role and Enable integration once connected |
| integrations/bamboohr-params.webp | The config panel after connecting: confirmed BambooHR domain, Default role, and Enable integration toggle | medium |

## help/integrations/google.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/google-signin-button.webp | The Beebole sign-in screen showing the Google button under "Or Sign in with" | medium — done: `authentication/signin-page.webp` linked from google.mdx (2026-10-01) |
| integrations/google-sso-panel.webp | Account Settings > Single Sign-On panel, Google tab: Linked domains, auto-provision toggle, and the SSO-only toggle | high — done by linking `authentication/sso-panel.webp`, which shows the Google tab (scene `authentication-sso-panel`, 2026-09-30) |

## help/integrations/microsoft.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/microsoft-sso-panel.webp | Account Settings > Single Sign-On panel, Microsoft tab, showing the "Only Microsoft sign-in allowed" toggle | high — done (scene `microsoft-sso-panel`, 2026-09-30); the page's steps rewritten to match the panel |

## help/integrations/google-calendar.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/google-calendar-pane.webp | The timesheet with the external-calendar pane open, showing imported Google events grouped by day (with a Tracked badge) | high — done before sign-in by linking `integrations/microsoft-calendar-pane.webp` (scene `microsoft-calendar-pane`, 2026-09-30). Imported events with the Tracked badge need a real Google sign-in: guided |
| integrations/google-calendar-assign.webp | Click-to-assign: a selected event with the "Click a timesheet row to assign" prompt, or an event dragged onto a highlighted row | medium |

## help/integrations/microsoft-calendar.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/microsoft-calendar-pane.webp | The timesheet with the external-calendar pane showing imported Outlook events (with Tracked badge) and the Sign in with Microsoft entry point | high — done before sign-in: the pane with the Google and Microsoft icons (scene `microsoft-calendar-pane`, 2026-09-30); can also serve google-calendar.mdx. Imported events with the Tracked badge need a real Microsoft sign-in: guided |

## help/integrations/webhooks.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/webhooks-config.webp | Settings > Integrations > Webhooks showing the Add webhook form: Name, URL, Secret (with Regenerate), Enabled toggle, and the Events / All events selector | medium — done with a temporary ERP sync webhook, added and removed by the scene's fixture (scene `webhooks-config`, 2026-10-01) |

## help/integrations/custom-integrations.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/api-key-panel.webp | The API Key panel opened from the initials button at the bottom of the sidebar, showing the key with Copy and Reset | medium — done with `authentication/api-key-menu.webp` (scene `authentication-api-key`, shared with Authentication, 2026-09-30) |

## help/integrations/asana.mdx

_Already illustrated on disk (asana-connect, asana-params, asana-updating, asana-validate) — no additional shots needed._

---

# API

## help/api/schema-explorer.mdx

| Screenshot | Description | Priority |
|---|---|---|
| api/graphiql-playground.webp | The built-in GraphiQL IDE at app.beebole.com/graphql showing the query editor and the Documentation/Explorer schema panel | high — done with the Docs panel, a query and its result, and the apikey header (placeholder) in one shot (scene `api-graphiql`, 2026-09-30) |
| api/graphiql-apikey-header.webp | GraphiQL's HTTP headers editor with the apikey header being added before running a query | high — done within `api/graphiql-playground.webp` (scene `api-graphiql`, 2026-09-30) |

_Other API pages (introduction, queries, mutations, examples) are code reference — no screenshots._

---

# Pages needing no screenshots

- help/guides/employee.mdx, project-manager.mdx, team-leader.mdx, migration.mdx, faq.mdx — role walkthroughs / Q&A that link out to feature pages
- help/api/introduction.mdx, queries.mdx, mutations.mdx, examples/example-1.mdx, examples/example-2.mdx — developer code reference
- help/news/releases.mdx — text-only update log

---

## Suggested first capture session (top ~20 high-priority)

1. timesheets/weekly-grid.webp
2. approval/pending-pane.webp · approval/workflow-stages.webp
3. planning/tasks-page-views.webp · gantt/timeline-bars.webp · gantt/workload-heatmap.webp · kanban/board-columns.webp
4. projects/project-tree-categories.webp · people/people-list.webp · tags/tag-tree-categories.webp
5. timeoff/absence-types-list.webp · timeoff/absence-allowances-panel.webp
6. billing/billing-rate-card.webp · budgets/budget-status-report.webp
7. reports/folders-and-reports.webp · custom-reports/matrix-view.webp · data-exports/export-submenu.webp
8. roles/permission-grid.webp · authentication/sso-panel.webp · mobile/mobile-timesheet.webp
9. integrations/settings-integrations-list.webp · integrations/google-calendar-pane.webp

---

# Additions 2026-08-04 — June–August feature batch

New pages and expanded sections from the 2026-08-04 write batch (staffing, Beebole AI, companion apps, troubleshooting, new reports, timesheet governance). Same capture spec as above. AI-page shots need an account with `aiEnabled`; the extension options shot needs the extension loaded manually.

## help/documentation/staffing.mdx

| Screenshot | Description | Priority |
|---|---|---|
| planning/staffing-view.webp | Staffing view grouped by People: booking bars, capacity strips, today line | high — done on the Staffing plan, a Bookings planning added to the seed layer (scene `staffing-view`, 2026-09-30) |
| planning/staffing-booking-editor.webp | Inline booking editor after dragging on the timeline — project picker and allocation % | high — done on an existing booking, opened from the bar's pencil (scene `staffing-booking-editor`, 2026-09-30); the create editor after a drag would save a booking |
| planning/staffing-capacity-tooltip.webp | Capacity cell hover showing used/remaining for the period | medium — done on Elena Rossi's overbooked Oct 6 (scene `staffing-capacity-tooltip`, 2026-09-30) |
| planning/staffing-managed-in-gantt.webp | "Managed in the Gantt" message on a locked booking | low — blocked 2026-10-01: the message is a warning toast shown on clicking a booking that has subtasks, and no task on QA has subtasks. Needs a parent booking with a subtask in the seed layer (away from the dates other Staffing shots show), and a scene that un-hides `bb-toast-stack` |

## help/documentation/ai.mdx

| Screenshot | Description | Priority |
|---|---|---|
| ai/assistant-page.webp | The full Assistant page: privacy line, Ask for a report, feature cards, connections | high — done (scene `ai-assistant-page`, 2026-09-30) |
| ai/suggested-entries-tray.webp | Suggested entries tray above the timesheet with Accept / Accept all / Dismiss and Desktop/Kanban source badges | high — done in grid view (the calendar view shows ghosts, not the pane) with two Habit suggestions and Why? open on today's (scene `ai-suggested-entries`, 2026-09-30). Desktop and Kanban badges need those sources on QA |
| ai/approval-review-digest.webp | Reviewing a submitted timesheet with digest flags (non-working day, overtime, unusual total) | high — done on Lucas Bernard's week of Sep 6 in the Pending pane, two Time on a non-working day flags (scene `ai-approval-review-digest`, 2026-09-30). Only that flag occurs in QA's pending weeks |
| ai/nl-report-builder.webp | Ask for a report input with a typed request | medium — done as `ai/report-builder-request.webp`, typed and not sent (scene `ai-report-builder-request`, 2026-10-01) |

## help/integrations/ai-assistants.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/ai-assistants-connect.webp | Connect your AI tools card: Server URL, API key, Claude Code + JSON snippets | high — done as `integrations/mcp-server-connect.webp` on mcp-server.mdx (ai-assistants.mdx redirects there) (scene `mcp-server-connect`, 2026-09-30); the URLs read qa.beebole.com, the app builds them from the person's server |
| integrations/ai-assistants-connected-apps.webp | Connected apps list with an app's name, connected-since date, and Disconnect | medium — blocked 2026-10-01: Jordan Reed has no connected app on QA (the list only shows once an OAuth grant exists; the Beebole QA connector is signed in to another organisation). Needs an MCP client connected as Jordan Reed |

## help/documentation/desktop-app.mdx

| Screenshot | Description | Priority |
|---|---|---|
| ai/desktop-download-links.webp | Desktop app section on the Assistant page with the four platform download links | medium — done with the QA-only note hidden (scene `desktop-app-downloads`, 2026-10-01) |
| ai/desktop-suggestion-why.webp | A Desktop-badged suggestion expanded with Why? evidence | medium — done (scene `desktop-suggestion-why`, fixture: a Desktop suggestion pushed for today and withdrawn after, 2026-10-01). Why? reads that the details stay in the desktop app, as on any other device |

## help/documentation/browser-extension.mdx

| Screenshot | Description | Priority |
|---|---|---|
| ai/extension-section.webp | Browser extension section on the Assistant page: downloads, Server address, API key | medium — done with the key masked and the server address shown as app.beebole.com (scene `browser-extension-section`, 2026-10-01) |
| ai/extension-options.webp | The extension's options page: server address, API key, allowed sites (manual — needs extension loaded) | medium |

## help/documentation/troubleshooting.mdx

| Screenshot | Description | Priority |
|---|---|---|
| troubleshooting/diagnostics-page.webp | The /diagnostics page with health checks, latency, and snapshot buttons | high — done: title, Health checks and Latency (scene `troubleshooting-diagnostics`, 2026-09-30). Durations and ping differ on every run, so replay always reports it changed: compare by eye |
| troubleshooting/compatibility-mode-indicator.webp | Sidebar indicator "Running in slower compatibility mode" (guided — needs WebSocket blocked) | medium — done automatically: the app's forceHttpTransport flag in localStorage switches it to the HTTP fallback (scene `troubleshooting-compatibility-mode`, 2026-10-01) |

## Expanded sections on existing pages

| Screenshot | Description | Priority |
|---|---|---|
| timesheets/calendar-view.webp | Timesheet calendar view with entries placed by hour and a ghost suggestion | high — done (scene `timesheets-calendar-view`, 2026-09-29) |
| timesheets/clear-rows-button.webp | Section header hover revealing the Clear rows button | low — done on the Client section of the current week (scene `timesheets-clear-rows`, 2026-10-01) |
| timesheet-settings/lock-date.webp | Period & submission tab with the Lock date calendar set | medium — done within `timesheets/settings-period-tab.webp`, which shows the Lock date field (2026-09-30) |
| people/validity-period-panel.webp | Valid period for time entry panel on a person (From/To) | low — done on Nils Eriksson, From his date of entry, no end (scene `people-validity-period`, 2026-10-01) |
| roles/assignment-permissions.webp | Permission grid scrolled to the Assign rows, with the search box in use | medium — done with Assign in the Search field (scene `roles-assignment-permissions`, 2026-09-30) |
| reports/planned-vs-real.webp | Planned vs. Real chart with Planned, Real, and Forecast series | high — skipped again 2026-10-02: the People / category picker is in production too (a step was added to the page). The chart does not illustrate the page on QA: the budget line (33,870 h, the plan's projects) sets the scale, and each person's Real (a year of time) dwarfs their Planned (a few hundred hours). Needs planned effort in proportion to the logged time |
| reports/absence-quota-report.webp | Absence quotas report with allowance bars and the Timeline toggle | high — done (scene `reports-absence-quotas`, allowances added to the seed layer, 2026-09-30) |
| reports/mobile-report.webp | A report consulted on a phone viewport (390×844) | low — done as the phone's Reports screen: folder and period chips over the Current Month reports (scene `reports-mobile`, 2026-10-01). A report sheet is left out: Current Month is empty on the 1st, and on QA Absences by person and Margin by Client per Month do not hold what their names say |


---

## Additions 2026-08-24 (release run, prod deploy 2026-08-23)

Identified by `/illustrate --identify` on the pages this release changed. No missing image files or `[SCREENSHOT:]` markers — all optional shots for new UI.

| Screenshot | Description | Priority |
|---|---|---|
| reports/report-folder-share.webp | A folder's **Share** panel expanded, with the **People** and **Tags** pickers visible (element capture) | high — done with the People picker open, nothing selected (scene `reports-folder-share`, 2026-09-30) |
| ai/suggestion-tray-badges.webp | The **Suggested entries** tray with cards carrying mixed source badges (**Habit**, **Desktop**, **Planned**) and one **Why?** panel open | high — partly done within `ai/suggested-entries-tray.webp` (Habit badges, Why? open, 2026-09-30); mixed Habit/Desktop/Planned badges need Desktop and Planned suggestions on QA, which it has none of |
| budgets/budget-card-time-days.webp | A budget card showing the **Time** field with the **Days** unit picker, a **From** date, and a **Notes** line (element capture) | medium — done as `budgets/time-unit-picker.webp`, the Hours/Days picker open on the Web Portal budget (scene `budgets-time-unit`, 2026-10-01) |
| timesheets/timesheet-restrictions.webp | The Restrictions chip list including **Only an admin can edit someone else's timesheet** | low — done as the Add restriction menu, which lists it (scene `timesheet-settings-add-restriction`, 2026-10-01); activating it would change the account's settings |

`authentication.mdx` / `desktop-app.mdx` (desktop sign-in handoff) need no shot — the flow is browser-mediated and transient.

---

## Additions 2026-08-31 (release run, prod deploy 2026-08-30)

Identified by `/illustrate --identify` on the pages this release changed. No broken image references and no `[SCREENSHOT:]` markers anywhere in `help/**` — every entry below is an optional shot for newly documented UI.

| Screenshot | Description | Priority |
|---|---|---|
| gantt/task-period-timed.webp | A task's **Dates** panel with **All day** unchecked, showing the **Start time** and **End time** fields and a time highlighted as outside the owner's working hours (element capture) | high — done on Fatima's 3:00 to 6:00 PM booking, the end time highlighted (scene `gantt-task-period-timed`, 2026-09-30). The reason tooltip is a native one and does not show in screenshots |
| staffing/staffing-timed-bars.webp | Staffing timeline with bars for timed tasks drawn inside their day columns, non-working stretches hatched behind them | high — done: Fatima Al-Hassan's part-day bookings, view locked to a week (scene `staffing-timed-bars`, 2026-09-30) |
| timesheets/calendar-timer-running.webp | The calendar view with a timer running on an entry — pulsing red dot, live duration in place, play/pause button visible on hover | high — done (scene `timesheets-calendar-timer`, fixture: a running entry around the capture, 2026-09-30) |
| ai/suggestion-forecast-cards.webp | Future days in the calendar showing read-only planned forecast cards (muted, dashed) next to an actionable suggestion on today | high — done: next week in the calendar view, Sprint Review Prep as a forecast card each weekday, by a fixture (a task owned by Jordan Reed, half his time, and Only time off can be recorded in the future on his own settings; deleted right after, its drafts swept on the next read) (scene `ai-suggestion-forecast-cards`, 2026-10-02). No actionable card on today in the same shot: today is a Friday, next week is all future |
| timesheets/favorites-bar-play.webp | The favorites bar with the play/pause button on a chip (element capture) | medium — done in the current week, the first play button under the mouse (scene `timesheets-favorites-play`, 2026-09-30). The Start timer tooltip does not show in captures |
| ai/suggestion-card-entity.webp | A suggestion card carrying the project or task picture and color, and a calendar entry with the logged-vs-planned ring (element capture) | medium — card part done within `ai/suggested-entries-tray.webp` (the cards carry the project's colored avatar); the logged-vs-planned ring is blocked: no planned work owned by Jordan Reed on QA (2026-10-01) |
| gantt/view-period-weeks.webp | The view tab's **⋯** menu open on **Period**, showing **Infinite by day**, **Infinite by week**, **Week**, **2 weeks**, **3 weeks**, **4 weeks**, **6 weeks** (element capture) | medium — done on the Gantt tab of Main plan (scene `gantt-view-period-menu`, 2026-09-30) |
| timeoff/allowance-card-units.webp | An allowance card with **Available**, **Consumed**, and **Accrued** at the top, each field stating its unit (element capture) | medium — done within `timeoff/absence-allowances-panel.webp` (scene `timeoff-allowances-panel`, 2026-09-30) |
| reports/folder-record-scope.webp | A report folder's **Absence/working time** record scope control, with the filter button highlighted (element capture) | low — done: the folder's Filters menu on Absence/working time with its three choices (scene `reports-folder-record-scope`, 2026-10-01). The highlighted button needs a scope saved on the folder |
| approval/edit-timesheet-pencil.webp | The **Team** pane with the **Edit timesheet** button visible on a manager-editable row (element capture) | low — done as a lens on Ana Pereira's row (scene `approval-edit-pencil`, 2026-10-01) |

Master data review is deliberately excluded — the Settings entry is suppressed on production hosts, so there is nothing a user can be shown.

---

## Additions 2026-09-07 (release run, prod deploys 2026-09-01 and 2026-09-06)

Identified by `/illustrate --identify` across `help/**`. Two entries are **broken image references** — the only ones on the site — because this release created two new pages with placeholders. Everything else below is an optional shot for newly documented UI.

| Screenshot | Description | Priority |
|---|---|---|
| planning/task-list-view.webp | **To add** — the placeholder reference was removed from `task-list.mdx` on 2026-09-07 so the release could merge with a green link check; wire the `<Frame>` back in when capturing. The List view of a planning: header row with **Row #**, **Task Name**, **Owner**, **Dates**, **Planned**, **Status**, a parent task expanded to indented subtasks, entity badges in the owner and project cells, and one column header showing its sort arrow | high — done: a new List view with Owner, Dates, Client and Status, sorted by Dates (scene `task-list-view`, 2026-09-30). Recaptured 2026-10-02 with the Planned column, now that tasks carry their planned hours. No task has subtasks |
| planning/task-list-grouped.webp | The List grouped by Status, with the group headers and their counts | medium — added and done for Grouping rows (scene `task-list-grouped`, 2026-10-01) |
| planning/task-list-selection.webp | Several rows selected with ⌘+Click for a mass edit | medium — added and done for Editing several tasks at once (scene `task-list-selection`, 2026-10-01) |
| settings/master-data-review.webp | **To add** — the placeholder reference was removed from `master-data.mdx` on 2026-09-07 so the release could merge with a green link check; wire the `<Frame>` back in when capturing. A master data review of **People** in Settings: the saved-reviews list at the left with one open, the table showing name plus billing rate, tags and work schedule columns, at least one cell showing an inherited value with its source link, and the filter row above the table | high — blocked: the Settings entry is suppressed on production hosts, so there is nothing a user can be shown (see the 2026-08-31 note) |
| timesheets/timer-shelf.webp | The floating timer as a shelf with several lines — one running with a pulsing dot and live counter, one paused with its play button and **×** — and the **Pause all** button beneath (element capture) | high — done (scene `timesheets-timer-shelf`, fixture: two running entries and a paused one listed on the shelf, 2026-09-30) |
| planning/gantt-cell-editing.webp | A Gantt cell being edited in place (owner or status), with the discreet hover control visible (element capture) | medium — dropped 2026-10-01: the Gantt and List pages do not describe editing a cell in place |
| planning/dependency-drag.webp | A dependency being drawn by dragging the link handle from one task bar onto another, the target task highlighted and the line following the pointer | medium — done as `gantt/dependency-drag.webp`: App Development's end handle held over QA Testing (scene `gantt-dependency-drag`, 2026-10-01) |
| planning/gantt-column-sort.webp | A Gantt or List column header menu open on **Sort ascending** / **Sort descending** / **Manual order** (element capture) | medium — done as `gantt/column-sort-menu.webp` on Task Name (scene `gantt-column-sort-menu`, 2026-10-01). The menu opens on hover: Gantt page corrected |
| staffing/booking-intraday-drag.webp | A part-day booking being dragged on its day's clock inside the cell, snapped to the quarter hour | medium — dropped 2026-10-01: the cell's clock is not drawn, so a still of the drag looks the same as a booking at rest (already shown by `staffing/staffing-timed-bars.webp`) |
| approval/team-bulk-bar.webp | The **Team** pane with several people selected and the bulk bar showing **Approve**, **Remind**, and **Reject** with their per-subset counts (element capture) | medium — done with two submitted weeks selected (scene `approval-team-bulk-bar`, 2026-10-01). The bar leaves out a button that applies to nobody: no Remind here, as nobody in that week is still a draft. Page corrected |
| settings/master-data-update-preview.webp | Master data review in update mode showing the before/after preview of a bulk change, with a skipped row and its reason (element capture) | medium — blocked, as `settings/master-data-review.webp`: the Settings entry is suppressed on production hosts |
| reports/budget-status-sorted.webp | The **Budget Status** report sorted by percent consumed, with a project at exactly 100% reading as on budget rather than over | low — dropped 2026-10-01: `reports/budget-status-table.webp` is already sorted by % consumed, and no project sits at exactly 100% on QA (the text covers it) |

Not requested, deliberately: budget threshold alerts and the push-notification channel (both stripped from notification preferences on production hosts, so there is no UI to photograph), and the legacy migration tool (removed from Settings in September 2026).

## Additions 2026-09-28 (release run, prod deploy 2026-09-28)

No placeholder references or `[SCREENSHOT]` markers were added by this release; the pages below gained new sections that would read better with a shot. Capture against a seeded account (**Main plan**, **Acme Corp**, **Website Redesign**).

| File | Description | Priority |
|------|-------------|----------|
| planning/planning-mode-picker.webp | The planning's settings dialog (gear next to **Main plan** → **Main plan settings**) with the **What this planning holds** switch showing **Tasks** and **Bookings** and their hints, the switching note beneath, and the **Task statuses** list below (element capture, ~1024 wide) | high — done as `planning/planning-settings-dialog.webp` (scene `planning-settings-dialog`, 2026-09-29) |
| staffing/booking-add-form.webp | The **Add Booking** form of a Bookings planning open in the side panel: **Select the owner**, the project picker, start date, duration in days, and the allocation unit switch (**%**, **h/day**, **Total**) (element capture) | high — done (scene `staffing-booking-add-form`, 2026-09-30) |
| projects/project-tasks-bookings.webp | The **Tasks and bookings** attribute on **Acme Corp**'s panel: two planning sections, each with its **Add to …** button and a couple of task/booking badges, one hovered to show **Unassign** (element capture) | high — done on **Website Redesign** (Acme Corp itself has no tasks; one Tasks planning, no hover) (scene `projects-tasks-bookings`, 2026-09-29) |
| projects/category-level-names.webp | The **Client settings** dialog with the **Level names** list — the category row, **Project**, **Subproject**, the **×** on the deepest level, and the **Add new level** input (element capture) | medium — done (scene `projects-category-level-names`, 2026-09-30) |
| reports/budget-status-table.webp | The **Budget Status** report in its table layout: **Time**, **Billing**, and **Costs** columns with one project expanded to its subprojects, the layout button (**Stack the measures in one column**) visible in the header (1440×900) | medium — done at 1760 wide (the column layout overflows 1440), Acme Corp expanded (scene `reports-budget-status-table`, 2026-09-30) |
| integrations/excel-addin-data-server.webp | The Excel add-in settings screen showing **Data Server** with the detected region (**Europe** with its flag) under **Update API** (element capture; the Google Sheets sidebar shows the same section and can share the shot) | low |

## Additions 2026-10-02 (batch from page sections)

The inventory had no automatable entry left (every open one needs Excel, Google Sheets, the browser extension or a connected integration), so this batch was picked from sections of the most-visited pages that had no shot.

| Screenshot | Description | Priority |
|---|---|---|
| timesheets/settings-reminders-tab.webp | Timesheet and Planning Settings on the Reminders tab | medium — done (scene `timesheet-settings-reminders`, 2026-10-02) |
| timesheets/settings-auto-timesheet-tab.webp | The Auto Timesheet from Planning tab, switched on with a planning and its Start and End statuses | medium — done: switched on for Main plan, In progress to Done, by a fixture around the capture (scene `timesheet-settings-auto-timesheet`, 2026-10-02) |
| roles/person-role-selector.webp | A person's Email & role panel with the Choose a role selector open | medium — done on Marc Dubois (scene `roles-person-role-selector`, 2026-10-02). The selector opens from the × on the role badge, not by clicking the role: page corrected |
| billing/billing-method-picker.webp | A rate card's billing method picker listing the four methods | medium — done on Acme Corp (scene `billing-method-picker`, 2026-10-02) |
| account-settings/accent-color-picker.webp | The organization's color palette and logo drop area, opened from the header | medium — done (scene `account-settings-accent-color`, 2026-10-02). Logo and color are one control, the square in the header: page corrected |
| timesheets/submit-button.webp | The Submit button at the top of a draft timesheet | medium — done as a lens on the last full week (scene `timesheets-submit-button`, 2026-10-02) |
| reports/utilization-report.webp | The Utilization report | medium — done (scene `reports-utilization`, 2026-10-02). Projected reads 0% for everyone: no planned bookings on QA |
| reports/revenue-at-risk.webp | The Revenue at Risk report with projects at risk | medium — done at 1760 wide: four budgeted projects get an end date by a fixture, two come out at risk (scene `reports-revenue-at-risk`, 2026-10-02). The report projects from the server's today, so replay will report it changed as time passes: compare by eye. The screen shows the end date under Projected at end and the implied rate under Revenue at Risk, and Logged only in the export: page completed |
| budgets/budget-split-by-person.webp | A budget card split by person with two allocations | medium — done on Web Portal, split between Elena Rossi and Lucas Bernard by a fixture (scene `budgets-split-by-person`, 2026-10-02) |
| public-holidays/tag-holidays-panel.webp | A tag's own Public holidays panel | medium — done: the London tag with the United Kingdom calendar, set by a fixture (scene `public-holidays-tag`, 2026-10-02) |
| planning/task-schedule-panel.webp | A task's panel with owner, % FTE, dates and planned time with its capacity pill | medium — done (scene `planning-task-schedule-panel`, 2026-10-02), shared with `planning/task-detail-panel.webp` |
| reports/compliance-report.webp | The Timesheet Compliance report | medium — blocked: the seed submitted every week after the fact, so everyone reads Late and the account scores 0%. Needs submissions dated on time in the seed |

## Additions 2026-10-02 (2) (batch after the seed repair)

The seed gave every task its planned hours as a number of milliseconds and ran its dates from noon to noon. `layer.mjs` now repairs both on QA (and `seed.mjs` creates them right), which unblocked the planned-time shots above. The other entries came from page sections with no shot.

| Screenshot | Description | Priority |
|---|---|---|
| gantt/planned-column.webp | The Gantt Planned column with its unit button | medium — done (scene `gantt-planned-column`, 2026-10-02) |
| kanban/show-fields-menu.webp | The Kanban view tab's Show submenu | low — done (scene `kanban-show-fields-menu`, 2026-10-02) |
| kanban/card-menu.webp | A card's ⋯ menu | low — done on QA Testing (scene `kanban-card-menu`, 2026-10-02) |

Found while checking the pages: the Journal has no Hide similar entries control on production (the label exists, nothing uses it). The bullet was removed from `journal.mdx` and the step from `audit-trail.mdx`; the timesheet-only filter is described as it works, on a person's Journal opened from the Timesheet page.

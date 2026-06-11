# Screenshot Needs Inventory

Generated: 2026-06-11 (regenerated against the fully overhauled English content)
Previous version: 2026-04-07 (archived in git history; see "Changes since 2026-04-07" below)

**Summary:** ~132 screenshots needed across 50 pages (55 high, 52 medium, 23 low; +4 Asana shots already on disk).
Capture is a deferred follow-on effort — run `/illustrate --capture` against this list once the app is available. All needs below were derived from the current, code-accurate page content.

**Already on disk (do not re-capture):**
- `help/images/index-beebole-documentation.webp` (landing hero)
- `help/images/integrations/asana-connect.webp`, `asana-params.webp`, `asana-updating.webp`, `asana-validate.webp`

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
| quickstart/signup-form.webp | The Beebole sign-up form with Full name, Work email, Company name fields and Google/Microsoft buttons | medium |
| quickstart/add-project-panel.webp | Projects page with category selector and the Add [category] panel open, name field and Save new button | medium |
| quickstart/add-person-panel.webp | People add panel showing Name/Email/Role plus the "Or add multiple entries" paste area | medium |
| quickstart/first-timesheet-row.webp | Timesheet with one row added against the new project, a day cell filled and the row timer button | high |
| quickstart/sample-report-result.webp | Reports section with Monthly Timesheets folder open and "Hours by person & project" results displayed | medium |

## help/documentation/concepts.mdx

| Screenshot | Description | Priority |
|---|---|---|
| concepts/duplicate-action-menu.webp | A record's ⋯ action menu open showing the Duplicate option | low |
| concepts/version-update-banner.webp | The "Update available / Click to reload" banner in the interface | low |

## help/documentation/projects.mdx

| Screenshot | Description | Priority |
|---|---|---|
| projects/project-tree-categories.webp | Projects page showing the category selector next to "Projects:" and the nested project/subproject tree | high |
| projects/add-multiple-entries.webp | The "Or add multiple entries" paste preview before clicking Add them all | medium |
| projects/project-settings-panels.webp | A project detail panel showing the list of settings panels (Manager, Tags, Billing, Budgets, Who has access?, etc.) | medium |
| projects/who-has-access-panel.webp | The "Who has access?" panel with the Available/Unavailable toggle and Individually / By tags fields | medium |

## help/documentation/people.mdx

| Screenshot | Description | Priority |
|---|---|---|
| people/people-list.webp | The People list with avatars, roles, and an Invitation pending status | high |
| people/add-person-panel.webp | The Add person panel showing Name/Email/Role and the "Or add multiple entries" area | medium |
| people/person-profile-panels.webp | A person's profile showing the attribute panels (Manages, Tags, Billing, Absence allowances, Localization) | medium |
| people/bulk-actions-menu.webp | The list with checkboxes selected and the bulk actions menu (Invite, Archive, Unarchive, Delete) | low |

## help/documentation/tags.mdx

| Screenshot | Description | Priority |
|---|---|---|
| tags/tag-tree-categories.webp | Tags page with the category selector (Department/Location) and the nested tag tree | high |
| tags/who-or-what-tagged-panel.webp | A tag's "Who or what has been tagged?" panel with People/Projects/Tasks sections | medium |
| tags/tag-cascade-panels.webp | A tag detail panel showing the cascading settings panels (Work schedule, Billing, Approval workflow, etc.) | medium |

## help/documentation/timesheets.mdx

| Screenshot | Description | Priority |
|---|---|---|
| timesheets/weekly-grid.webp | The weekly timesheet grid with sections, rows, day columns, and the day-header scheduled-hours indicators | high |
| timesheets/entry-details.webp | An entry's detail popover showing Time spent, Start/End time, note, Non-billable and Work from home | medium |
| timesheets/timer-running.webp | A row with the timer running and the floating on-screen timer | medium |
| timesheets/copy-paste-cluster.webp | The top-left button cluster (copy, paste period, calendar, approval, team) with the Paste Add/Replace prompt | medium |
| timesheets/calendar-import-pane.webp | The calendar import pane with Google/Microsoft events listed and a Tracked badge | medium |
| timesheets/timesheet-score-ring.webp | A team pane avatar with the colored Timesheet score ring and its hover breakdown | low |

## help/documentation/timesheetSettings.mdx

| Screenshot | Description | Priority |
|---|---|---|
| timesheets/settings-period-tab.webp | Timesheet settings panel, Period & submission tab, showing period options, auto-submit and Restrictions chips | high |
| timesheets/settings-time-entry-tab.webp | The Time entry tab showing Unit, Duration format, timer and start/end time options | medium |
| timesheets/settings-categories-tab.webp | The Categories tab showing chained project categories as timesheet sections | medium |
| timesheets/settings-inheritance-icon.webp | A setting showing the inherited-value icon (account vs tag vs person override) | low |

## help/documentation/approval.mdx

| Screenshot | Description | Priority |
|---|---|---|
| approval/pending-pane.webp | The Pending approval pane listing submitted timesheets with Approve/Reject and the Late group | high |
| approval/workflow-stages.webp | The Approval workflow panel with sequential stages, approver type and Any/All quorum | high |
| approval/status-badge-breakdown.webp | A timesheet status badge expanded into the stage breakdown (who approved, who's pending) | medium |
| approval/journal-approval-banner.webp | The Journal "N timesheets to approve" banner expanded with Hours/Billing totals | medium |
| approval/reject-comment-dialog.webp | The reject dialog with the required reason comment box | low |

## help/documentation/planning.mdx

| Screenshot | Description | Priority |
|---|---|---|
| planning/tasks-page-views.webp | The Tasks page with the saved-view tabs (Gantt / Kanban) and the task category selector | high |
| planning/add-task-panel.webp | The Add Task form with name, status selector, and the "Or add multiple entries" paste area | medium |
| planning/task-detail-panel.webp | A task detail panel showing Owner/% FTE, dates with lock buttons, Planned in hours, and overflow warning pill | medium |
| planning/task-statuses-modal.webp | The Task statuses modal with statuses, colors, reorder, and Max tasks | medium |

## help/documentation/gantt.mdx

| Screenshot | Description | Priority |
|---|---|---|
| gantt/timeline-bars.webp | The Gantt chart with task bars on the timeline, today line, and the configurable column table on the left | high |
| gantt/dependencies-arrows.webp | Tasks linked with dependency arrows between bars | medium |
| gantt/workload-heatmap.webp | Grouped-by-Owner view showing the workload heatmap bars with an over-capacity tooltip | high |
| gantt/scale-columns-menu.webp | The view tab ⋯ menu showing Scale / Columns / Group by options | low |

## help/documentation/kanban.mdx

| Screenshot | Description | Priority |
|---|---|---|
| kanban/board-columns.webp | The Kanban board with status columns and task cards (Backlog → In progress → Done) | high |
| kanban/wip-limit-rejected.webp | A column at its WIP limit with the red border and "at its task limit" error while dragging | medium |
| kanban/card-add-time.webp | A card hover showing the Add time clock button and the logged/planned pill (e.g. 4h / 8h) | medium |
| kanban/column-menu.webp | A column header ⋯ menu (Archive, Unarchive, Move left/right, Delete) | low |

## help/documentation/timeoff.mdx

| Screenshot | Description | Priority |
|---|---|---|
| timeoff/absence-types-list.webp | The Settings > Time Off list of absence types with the Add Time Off Type button | high |
| timeoff/absence-allowances-panel.webp | The Absence allowances panel showing Available / Consumed / Accrued balance fields on a person | high |
| timeoff/units-paid-panel.webp | An absence type's Units panel with Hour/Day and the "Is paid (included in people costs)" checkbox | medium |
| timeoff/timeoff-notifications-panel.webp | The Time off notifications panel with Going negative and frequency alerts | low |

## help/documentation/accruals.mdx

| Screenshot | Description | Priority |
|---|---|---|
| accruals/accruals-panel.webp | An absence type's Accruals panel with the enable toggle, Frequency, Awarded on, and Quantity | high |
| accruals/carry-forward-limit.webp | An allowance card showing the Carry forward limit field | medium |

## help/documentation/public-holidays.mdx

| Screenshot | Description | Priority |
|---|---|---|
| public-holidays/holidays-panel.webp | The Public holidays panel with Country/Region/Language selectors, Load holidays, and the imported holiday list | high |
| public-holidays/year-selector.webp | The Year selector with the locked Country ("Reset to change country") | low |

## help/documentation/billing.mdx

| Screenshot | Description | Priority |
|---|---|---|
| billing/billing-rate-card.webp | A Billing panel rate card showing From date, Billing method, Amount and currency | high |
| billing/rate-priority.webp | Panel view illustrating which rate applies across the org → tag → project → person cascade | medium |
| billing/rate-split.webp | A rate with Split by persons showing per-person amounts and Non-billable checkboxes | medium |

## help/documentation/costs.mdx

| Screenshot | Description | Priority |
|---|---|---|
| costs/cost-rate-card.webp | A Cost panel rate card with Cost method, Amount and From date | high |
| costs/margin-report-columns.webp | A custom report with Billing, Cost, and Margin columns shown together | medium |

## help/documentation/budgets.mdx

| Screenshot | Description | Priority |
|---|---|---|
| budgets/budget-panel.webp | A project's Budgets panel with Billing amount / Cost amount / Hours target fields | high |
| budgets/budget-status-report.webp | The Budget Status report with per-project progress bars, at-risk and Over budget flags | high |
| budgets/budget-alert-badge.webp | A budget card showing the threshold alert / Over budget badge | low |

## help/documentation/expenses.mdx

| Screenshot | Description | Priority |
|---|---|---|
| expenses/expense-type-details.webp | An expense type's Details panel with Currency, Billing markup %, and Impacts budget | medium |
| expenses/expenses-panel.webp | The Expenses panel on a project/person with a record (date, category, amount, note) | high |
| expenses/expense-report.webp | A report with Expenses as the source showing Amount/Quantity/Expense billing columns | low |

## help/documentation/reports.mdx

| Screenshot | Description | Priority |
|---|---|---|
| reports/folders-and-reports.webp | The Reports section with the folder list, period selector, and a report open | high |
| reports/table-chart-matrix-toggle.webp | The Table / Chart / Matrix view toggle buttons next to a report name | medium |
| reports/schedule-dialog.webp | The Schedule report dialog with Report period, Send timing, and recipients | medium |
| reports/period-filter-controls.webp | The folder period selector and Filters condition builder | low |

## help/documentation/custom-reports.mdx

| Screenshot | Description | Priority |
|---|---|---|
| custom-reports/column-badges-menu.webp | A report's column badge row with the "Add a column…" menu open (Time/Expense/Period/Entities groups) | high |
| custom-reports/chart-view.webp | The Chart view with the chart-type picker and Label/Value axis controls | medium |
| custom-reports/matrix-view.webp | The Matrix view grid with Rows/Columns/Metric controls and heat map shading | high |

## help/documentation/data-exports.mdx

| Screenshot | Description | Priority |
|---|---|---|
| data-exports/export-submenu.webp | A report's ⋯ menu with the Export submenu listing all formats (Excel, CSV, PDF, Matrix variants) | high |
| data-exports/delete-account-banner.webp | The Delete Account grace-period banner with Cancel deletion | low |

## help/documentation/excel-addin.mdx

| Screenshot | Description | Priority |
|---|---|---|
| excel-addin/task-pane-links.webp | The Beebole Excel task pane showing the "Beebole reports linked" table and Refresh buttons | high |
| excel-addin/add-report-link.webp | The Add Report Link form with Report and Worksheet fields | medium |
| excel-addin/api-key-connect.webp | The task pane API Key field with Connect, plus the API Key page in Beebole showing Copy/Reset | medium |

## help/documentation/gsheets-addon.mdx

| Screenshot | Description | Priority |
|---|---|---|
| gsheets-addon/sidebar-links.webp | The Beebole Reports sidebar in Google Sheets with the linked-reports table and Refresh buttons | high |
| gsheets-addon/add-report-link.webp | The Add Report Link form with Report and Sheet fields | medium |

## help/documentation/work-schedule.mdx

| Screenshot | Description | Priority |
|---|---|---|
| work-schedule/schedule-details.webp | A work schedule's Details panel showing per-day Hours, Intervals, and Work From Home toggles | high |
| work-schedule/assign-panel.webp | A Work schedule panel on a person/tag with the Select schedule picker and inherited-value indicator | medium |
| work-schedule/dated-assignments.webp | Two schedule assignments with Start date pickers showing a change over time | low |

## help/documentation/custom-fields.mdx

| Screenshot | Description | Priority |
|---|---|---|
| custom-fields/field-details-type.webp | The Custom field details panel with the Field type picker and type-specific options | high |
| custom-fields/field-visibility-panel.webp | The Custom field visibility panel (Visible for People/Time Records/Projects/Tasks with category pickers) | high |
| custom-fields/predefined-values.webp | A Text field with Use predefined values and the Allowed values list | low |

## help/documentation/roles-authorisations.mdx

| Screenshot | Description | Priority |
|---|---|---|
| roles/permission-grid.webp | The Person Roles permission grid showing permissions with Edit/View target selectors | high |
| roles/target-selector.webp | A permission's target selector open (Me, My team, My projects, etc.) | medium |
| roles/admin-full-access.webp | The "Admin role (full access)" checkbox at the top of the grid | low |

## help/documentation/assignments.mdx

| Screenshot | Description | Priority |
|---|---|---|
| assignments/show-hide-by-default.webp | The Show or hide by default panel with the six toggles | high |
| assignments/who-has-access-panel.webp | A project's Who has access? panel with the Available/Unavailable toggle and Individually / By tags | high |
| assignments/show-hide-person.webp | A person's Show or Hide panel showing the Show/Hide sections for projects, time off, etc. | medium |

## help/documentation/journal.mdx

| Screenshot | Description | Priority |
|---|---|---|
| journal/activity-feed.webp | The Journal feed showing the chronological timeline with the "new" separator and mixed event types | high |
| journal/message-thread.webp | A threaded message with rich text, @mention, and pin | medium |

## help/documentation/notifications.mdx

| Screenshot | Description | Priority |
|---|---|---|
| notifications/preferences-panel.webp | The Notifications panel with Email/Push channels and per-event frequency selectors (Instant/Daily/Weekly/None) | high |
| notifications/budget-threshold-alert.webp | The Budget threshold alert row with the percentage and "When over budget" | medium |
| notifications/email-templates.webp | The Email templates panel with the per-type tabs and the editor | medium |

## help/documentation/account-settings.mdx

| Screenshot | Description | Priority |
|---|---|---|
| account-settings/settings-panels.webp | The Account Settings page header (name, logo, accent color) above the list of settings panels | high |
| account-settings/localization-panel.webp | The Localization panel with time zone, currency, formats, and first day of the week | medium |
| account-settings/delete-account.webp | The Delete Account screen with the confirm/cancel deletion flow | low |

## help/documentation/authentication.mdx

| Screenshot | Description | Priority |
|---|---|---|
| authentication/signin-email-code.webp | The Beebole sign-in page entering email and the 6-digit code prompt | high |
| authentication/sso-panel.webp | The Single Sign-On panel with Google/Microsoft/Custom OpenID tabs and Linked domains | high |
| authentication/api-key-page.webp | The API Key page with the masked key, Copy, and Reset | medium |
| authentication/sign-in-as.webp | The Sign in as… search box from the user menu | low |

## help/documentation/subscription.mdx

| Screenshot | Description | Priority |
|---|---|---|
| subscription/plans-seats.webp | The Subscription page showing the Free/Essential/Advanced plans, seat stepper, and billing interval | high |
| subscription/addons.webp | The add-ons section (Costs/Expenses/Budgets and Custom fields/roles) on the Essential plan | medium |

## help/documentation/audit-trail.mdx

| Screenshot | Description | Priority |
|---|---|---|
| audit-trail/journal-audit-feed.webp | The Journal feed showing audit messages (operation, person, timestamp) | medium |
| audit-trail/record-logs-view.webp | A record's Modified by label with the expanded Logs change history | high |

## help/documentation/legacy-migration.mdx

| Screenshot | Description | Priority |
|---|---|---|
| legacy-migration/migration-options.webp | The Legacy Migration tool with the Legacy API Key field and the migration options (Only active entities, Include time records from) | high |
| legacy-migration/audit-results.webp | The Audit Results screen showing record counts and the time-record date range | medium |
| legacy-migration/migration-report.webp | The final migration report summary (created / skipped / failed per phase) | low |

## help/documentation/mobile.mdx

| Screenshot | Description | Priority |
|---|---|---|
| mobile/mobile-timesheet.webp | The mobile timesheet day-list layout with the floating + button and a time entry card | high |
| mobile/install-prompt.webp | The Add to Home Screen / Install app prompt on a phone | medium |
| mobile/mobile-timer.webp | A running timer on a mobile entry card with the header timer bar | medium |
| mobile/mobile-approval-sheet.webp | The mobile approval bottom sheet with Pending / Team tabs | low |
| mobile/dark-mode.webp | Beebole in dark mode on mobile | low |

---

# Integrations

## help/integrations/introduction.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/settings-integrations-list.webp | The Settings > Integrations page listing all integrations (Asana, Jira, Linear, Monday.com, QuickBooks, Xero, BambooHR, Webhooks), reached from the initials button at the bottom of the sidebar | high |

## help/integrations/jira.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/jira-connect.webp | Settings > Integrations > Jira showing the Connect to Jira button (and the Jira Cloud URL prompt in the popup) | high |
| integrations/jira-params.webp | The Jira config panel: Where to import your tasks and Default role for imported employees | medium |
| integrations/jira-validate.webp | The Projects page with the new Jira category expanded, showing imported projects and issues | medium |

## help/integrations/linear.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/linear-connect.webp | Settings > Integrations > Linear showing the Connect to Linear button | high |
| integrations/linear-params.webp | The Linear config panel: import-destination choice and Default role for imported employees | medium |

## help/integrations/monday.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/monday-connect.webp | Settings > Integrations > Monday.com showing the Connect to Monday.com button | high |
| integrations/monday-params.webp | The Monday.com config panel: workspace selector, Where to import your boards, and Default role | medium |

## help/integrations/quickbooks.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/quickbooks-connect.webp | Settings > Integrations > QuickBooks Online showing Connect to QB Online and the Default role / Enable integration controls | high |
| integrations/quickbooks-export.webp | The Select period to export control with the Export button | high |
| integrations/quickbooks-export-result.webp | The result panel: Entries successfully exported count and the expandable Entries not exported list | medium |

## help/integrations/xero.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/xero-connect.webp | Settings > Integrations > Xero showing Connect to Xero, the Select your Xero organization step, and Enable integration | high |
| integrations/xero-export-invoice.webp | The invoice-export panel: Select client, Select period to export, and Create invoice | high |
| integrations/xero-sync-result.webp | A Manual sync result showing the Created / Archived / Unarchived / Deleted / Renamed counts | low |

## help/integrations/bamboohr.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/bamboohr-connect.webp | Settings > Integrations > BambooHR showing the Company subdomain field and Connect to BambooHR button | high |
| integrations/bamboohr-params.webp | The config panel after connecting: confirmed BambooHR domain, Default role, and Enable integration toggle | medium |

## help/integrations/google.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/google-signin-button.webp | The Beebole sign-in screen showing the Google button under "Or Sign in with" | medium |
| integrations/google-sso-panel.webp | Account Settings > Single Sign-On panel, Google tab: Linked domains, auto-provision toggle, and the SSO-only toggle | high |

## help/integrations/microsoft.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/microsoft-sso-panel.webp | Account Settings > Single Sign-On panel, Microsoft tab, showing the "Only Microsoft sign-in allowed" toggle | high |

## help/integrations/google-calendar.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/google-calendar-pane.webp | The timesheet with the external-calendar pane open, showing imported Google events grouped by day (with a Tracked badge) | high |
| integrations/google-calendar-assign.webp | Click-to-assign: a selected event with the "Click a timesheet row to assign" prompt, or an event dragged onto a highlighted row | medium |

## help/integrations/microsoft-calendar.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/microsoft-calendar-pane.webp | The timesheet with the external-calendar pane showing imported Outlook events (with Tracked badge) and the Sign in with Microsoft entry point | high |

## help/integrations/webhooks.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/webhooks-config.webp | Settings > Integrations > Webhooks showing the Add webhook form: Name, URL, Secret (with Regenerate), Enabled toggle, and the Events / All events selector | medium |

## help/integrations/custom-integrations.mdx

| Screenshot | Description | Priority |
|---|---|---|
| integrations/api-key-panel.webp | The API Key panel opened from the initials button at the bottom of the sidebar, showing the key with Copy and Reset | medium |

## help/integrations/asana.mdx

_Already illustrated on disk (asana-connect, asana-params, asana-updating, asana-validate) — no additional shots needed._

---

# API

## help/api/schema-explorer.mdx

| Screenshot | Description | Priority |
|---|---|---|
| api/graphiql-playground.webp | The built-in GraphiQL IDE at app.beebole.com/graphql showing the query editor and the Documentation/Explorer schema panel | high |
| api/graphiql-apikey-header.webp | GraphiQL's HTTP headers editor with the apikey header being added before running a query | high |

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

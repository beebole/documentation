# Beebole Features

**Last updated:** 2026-08-04

**Conventions:**

- One entry = one capability a user would search the documentation for. Interaction refinements fold into the parent entry's description; release notes (`/news`) own enhancements.
- Features present in code but not fully live carry a status suffix: `_(status: hidden-flag | placeholder-ui | partial — details)_`.
- Keys (`category/feature-slug`) are stable identifiers — never rename them, even when an entry's name, description, or section changes.

---

<!-- Core Features -->

## Time Tracking

- `time-tracking/timesheet` **Timesheet** — Weekly/daily/... time entry grid for logging hours against projects, tasks, and absence types
- `time-tracking/calendar-view` **Timesheet calendar view** — Day-by-hour calendar alongside the timesheet grid: drag and resize entries to set start and end times directly, duplicate an entry by holding ⌘ while dragging it, and delete from a hover button
- `time-tracking/timer` **Timer** — Start/stop timer for real-time tracking
- `time-tracking/entry-modes` **Time entry modes** — Entry in hours (hh:mm), hours (decimals), days, or percentage of workday
- `time-tracking/duration-or-start-end` **Duration or start/end** — Enter time as a duration or with start and end times
- `time-tracking/wfh-flag` **Work from home (WFH) flag** — Mark entries as remote work
- `time-tracking/non-billable-flag` **Non-billable flag** — Mark specific entries as non-billable
- `time-tracking/row-pinning` **Row pinning** — Pin frequently used project/task combinations for quick access
- `time-tracking/comments` **Comments on time entries** — Add notes to individual time records
- `time-tracking/copy-paste` **Copy/paste time entries** — Duplicate entries across days or weeks
- `time-tracking/clear-rows` **Clear rows per section** — Hover-to-reveal button that clears one section's rows and its time entries for the current period (undoable); replaces the old all-or-nothing "Clear timesheet" action
- `time-tracking/auto-submit` **Auto-submit** — Automatically submit timesheets after a configurable number of days
- `time-tracking/duplicate-and-start` **Duplicate and start** — Duplicate a time entry and start a new one based on it
- `time-tracking/reminders` **Timesheet reminders** — Configurable reminders for unfilled timesheets
- `time-tracking/entry-restrictions` **Time entry restrictions** — Organization-wide rules configured via an "Add restriction" interface with removable chips: keep entries within a project's or person's validity dates, block future-dated entries, require a comment on submission, cap or require hours against the daily/period schedule, allow entries only on scheduled working time (blocking days off and public holidays), limit time-off bookings to the available quota balance, and keep absences to a single day
- `time-tracking/lock-date` **Lock date** — Freeze all time records on or before a chosen day — no creating, editing, moving, or deleting for anyone, admins included; set organization-wide or per person, team, or project, and applied everywhere including the BambooHR time-off sync
- `time-tracking/record-locking` **Record locking by state and role** — Restrict who can change time records by approval state and role, e.g. owner/admin-only edits, or preventing edits once a timesheet has been submitted or approved
- `time-tracking/mobile` **Mobile timesheet** — Mobile-optimized layout for phones and small tablets, with infinite scroll, swipe-to-delete, and bottom-sheet editors for adding and editing entries
- `time-tracking/score` **Timesheet score** — Per-person compliance score (0–100) tracking on-time submissions, late submissions, missed timesheets, and rejections, shown as a color-coded ring gauge on person records
- `time-tracking/custom-fields` **Custom fields on time entries** — Extend time records with organization-defined fields (text, number, date, boolean, etc.) for capturing additional context per entry
- `time-tracking/calendar-integration` **Calendar integration in timesheet** — Connect Google Calendar or Microsoft Outlook and drag calendar events onto timesheet rows to log time, with events shown alongside the timesheet for the displayed period

## Absence & Time-Off Management

- `absence/types` **Configurable absence types** — Vacation, sick leave, parental leave, etc.; type pickers show only the types each person is allowed to use, including when a manager or admin books on someone's behalf
- `absence/cost-tracking` **Absence cost inclusion** — Mark each absence type as paid or unpaid; paid absences are automatically included in people cost totals shown in reports and budgets
- `absence/accrual` **Accrual policies** — Configurable on allowances: frequency (weekly, bi-weekly, twice-monthly, or monthly), quantity, and when within each period the credit is awarded. _(status: partial — the automatic awarding engine is NOT implemented (feature request `../reboot/docs/feature-requests/7. absence-accrual-engine.md`); accrued balances are adjusted manually via the allowance's **Accrued** field. Re-verified 2026-08-04)_
- `absence/carry-forward` **Carry-forward rules** — Unused allowance carries forward into the next period when a "valid until" date is set, limited by the carry-forward cap (0 means no cap); booking limits and the absence quota report reflect the carried balance
- `absence/negative-balance` **Negative balance controls** — Allow or restrict going below zero
- `absence/quotas` **Absence quotas** — Per-person allowances with period definitions
- `absence/balance-tracking` **Absence balance tracking** — Real-time view of taken, available, and accrued balances, with an accurate per-allowance "Consumed" amount even when allowances overlap
- `absence/unit-config` **Unit configuration** — Track absences in hours or days
- `absence/approval` **Absence approval** — Integrated with the multi-stage approval workflow
- `absence/notifications` **Absence notifications** — Alerts for negative balances, advance bookings
- `absence/excess-occurrence-notifications` **Absence frequency alerts** — Send administrators an alert when a team member takes absence more than a configured number of times within a month or year, helping flag attendance patterns early
- `absence/public-holidays` **Public holidays** — Automatically populated country-specific public holiday calendars assignable at organization, tag, or person level; load the calendar for a specific year (recent past years included) and keep custom edits when reloading; once a calendar is configured, its country is locked to protect holidays in past years
- `absence/custom-holidays` **Custom holidays** — Add or edit individual holiday entries manually
- `absence/archive` **Archive/unarchive absence types** — Soft-delete absence types without losing historical data

## Approval Workflows

> Covers approval of both time entries and absences.

- `approval/multi-stage` **Multi-stage approval** — Sequential approval stages (e.g., manager → project lead → admin)
- `approval/types-per-stage` **Approval types per stage** — Approvers can be: admins, project managers, people managers, task managers, tagged people, or specific named people
- `approval/quorum` **Quorum settings** — Require all approvers or any single approver per stage
- `approval/submit` **Submit for approval** — Employees submit completed timesheets for review
- `approval/actions` **Approve / Reject** — Approvers approve or reject, and rejection requires a comment; the only other interventions are the admin force actions listed below
- `approval/history` **Approval history & audit trail** — Full log of approval actions with timestamps
- `approval/change-tracking` **Change tracking** — Highlights added, modified, and deleted records during approval
- `approval/force-edit` **Admin force-edit** — Admins and managers can directly edit submitted or approved time records without rejecting, via a per-person override toggle in the approval pane
- `approval/force-approve-reject` **Admin force-approve and force-reject** — Admins can approve or reject any submitted timesheet even when they are not a designated approver for the current stage, bypassing quorum requirements
- `approval/team-overview` **Team approval overview** — Managers see pending approvals across their team
- `approval/email-actions` **Email actions** — Approve or reject directly from email notifications
- `approval/reminders` **Approval reminders** — Automatic reminders for pending approvals, configurable per person or organization
- `approval/email-summary` **Timesheet summary in emails** — Approval notifications include a summary of the submitted timesheet with the full project and task paths, making entries easy to identify
- `approval/mobile` **Mobile approval** — Mobile-optimized approval flow for reviewing and acting on pending timesheets from a phone or small tablet

## Planning, Tasks & Staffing

- `tasks/add` **Add task** — Create a task manually within a project category, or import multiple tasks at once from a CSV file
- `tasks/kanban` **Kanban board view** — Drag-and-drop task cards by status
- `tasks/kanban-wip-limits` **Kanban WIP limits** — Set a maximum number of concurrent tasks per status column on the Kanban board
- `tasks/gantt` **Gantt chart view** — Timeline visualization of tasks with start/end dates, dependency links, and configurable time precision; the timeline scrolls into the past as well as forward, and planned figures can switch between hours and days
- `tasks/gantt-columns` **Gantt column customization** — Show, hide, reorder, and resize Gantt chart columns including billing, cost, effort, dependencies, assignees, and status
- `tasks/gantt-grouping` **Gantt row grouping** — Group Gantt rows by category level, task owner, or status for a structured overview
- `tasks/gantt-keyboard` **Gantt keyboard navigation** — Navigate Gantt rows with arrow keys and expand or collapse groups without a mouse
- `tasks/gantt-workload-heatmap` **Gantt workload heatmap** — Color-coded bars on Gantt group rows show each group's effort against available capacity per day or week, with a per-person breakdown on hover and a workload indicator under each date in the timeline header
- `tasks/staffing` **Staffing view** — Long-horizon timeline of who works on what and when, alongside Gantt and Kanban: bars grouped by people or by project, drag on the timeline to create a booking, move or resize it, set the allocation percentage, and filter people/projects by tag
- `tasks/staffing-bookings` **Bookings** — Assign a person to a project for a date range without naming a task; the booking's name is shown automatically from that person and project across Staffing, Gantt, and Kanban
- `tasks/staffing-capacity` **Workload & capacity** — Each person's workload and remaining capacity at a glance in the Staffing view, with an overload indicator in the timeline header
- `tasks/views` **Saved task views** — Create, rename, and switch between multiple named views of tasks, each with its own layout (Gantt, Kanban, or Staffing), column selection, and grouping preferences
- `tasks/tag-filter` **Filter by tags** — Filter tasks, people, and projects by their assigned tags
- `tasks/dependencies` **Task dependencies** — Link tasks as predecessors and successors to define execution order
- `tasks/end-date-lock` **Lock task end date** — Pin a task's end date so it stays fixed even when predecessor tasks shift, keeping hard deadlines in place regardless of dependency changes
- `tasks/effort-occupancy` **Effort & occupancy tracking** — Allocate percentage of a person's time to specific tasks
- `tasks/hierarchy` **Hierarchical tasks** — Tasks organized under categories with nesting
- `tasks/statuses` **Task statuses** — Configurable status workflow (e.g., To Do → In Progress → Done)
- `tasks/ownership` **Task ownership** — Assign people to tasks
- `tasks/recurring` **Recurring tasks** — Repeat a task on a schedule via the Gantt recurrence dialog; occurrences appear across the planning views, and the dates of a recurring series are managed in the Gantt
- `tasks/custom-fields` **Task-level custom fields** — Custom attributes per task
- `tasks/descriptions` **Task descriptions** — Add free-text descriptions to tasks
- `tasks/move-category` **Move task between categories** — Reassign a root-level task and its subtasks to a different category via the context menu
- `tasks/archive` **Archive/unarchive tasks** — Soft-delete tasks without losing historical data

## Expense Management

- `expenses/types` **Expense types** — Define categories (travel, meals, equipment, etc.)
- `expenses/currency-unit` **Currency & unit-based expenses** — Monetary amounts or quantity-based
- `expenses/markup` **Markup settings** — Configure a markup percentage per expense type; the billed amount in reports is calculated as `expense amount × markup / 100` (default 100%, i.e. no markup)
- `expenses/records` **Expense records** — Log expenses with amounts, dates, and descriptions
- `expenses/budget-tracking` **Budget tracking for expenses** — Monitor spending against budgets

<!-- Entity Management -->

## People Management

- `people/directory` **Staff directory** — Searchable list of all team members with profiles
- `people/add` **Add person** — Create a team member manually via a profile form, or import multiple people at once from a CSV file
- `people/profiles` **Person profiles** — Name, picture, color coding, contact info
- `people/role-assignment` **Role assignment** — Assign roles with specific permissions to each person
- `people/manager-assignment` **Manager assignment** — Define reporting relationships (who manages whom)
- `people/schedule-assignment` **Schedule assignment** — Assign work schedules to people (directly or via tags)
- `people/validity-period` **Person validity period** — Give a person a start and end date; combined with the matching time entry restriction, time cannot be logged outside that period
- `people/localisation` **Localization per person** — Timezone, date format, language preferences
- `people/rates` **Billing & cost rates per person** — Hourly, daily, or fixed rates, with support for recurring patterns and effective date ranges
- `people/absence-quotas` **Absence quotas per person** — Individual time-off allowances
- `people/custom-fields` **Custom fields on persons** — Extend profiles with organization-specific data
- `people/archive` **Archive/unarchive** — Soft-delete people without losing historical data
- `people/bulk-ops` **Bulk operations** — Bulk archive, unarchive, or remove people
- `people/bulk-invite` **Bulk invitation** — Invite multiple people to your Beebole account at once
- `people/admin-takeover` **Admin takeover** — Sign in as another user for troubleshooting
- `people/overflow-archived` **Overflow to archived on seat limit** — When the subscription seat limit is reached, new people are created in an archived state so their profiles can be configured before activation

## Project Management

- `projects/add` **Add project** — Create a project manually via a form, or import multiple projects at once from a CSV file
- `projects/hierarchy` **Hierarchical projects** — Parent/child project structure (sub-projects)
- `projects/categories` **Project categories** — Organize projects into custom categories
- `projects/members` **Project members** — Assign people to projects with availability control
- `projects/managers` **Project managers** — Designate project leads
- `projects/validity-period` **Project validity period** — Give a project a start and end date; combined with the matching time entry restriction, time cannot be logged outside that period
- `projects/billing-rates` **Billing rates per project** — Project-specific billing configuration
- `projects/cost-rates` **Cost rates per project** — Project-specific cost tracking
- `projects/budgets` **Budgets** — Set billing, cost, and quantity (hours) budgets per project
- `projects/budget-splits` **Budget splits** — Break budgets down by person or sub-project
- `projects/expense-types` **Expense types per project** — Control which expense types apply
- `projects/custom-fields` **Custom fields on projects** — Extend project data with custom attributes
- `projects/move-category` **Move project between categories** — Reassign a root-level project and its sub-projects to a different category via the context menu
- `projects/archive` **Archive/unarchive projects** — Soft-delete projects without losing historical data
- `projects/time-settings` **Project-level time settings** — Override organization defaults per project

## Tags & Organizational Structure

- `tags/add` **Add tag** — Create a tag manually and place it within the hierarchy, or import multiple tags at once from a CSV file
- `tags/hierarchy` **Hierarchical tags** — Parent/child tag trees (e.g., departments, teams, locations)
- `tags/custom-labels` **Custom hierarchy labels** — Name each level (e.g., "Department" → "Team" → "Unit")
- `tags/grouping` **Tag-based grouping** — Tag people, projects, and tasks to enable report filtering, availability scoping, and approver targeting
- `tags/move-category` **Move tag between categories** — Reassign a root-level tag and its child tags to a different category via the context menu
- `tags/inheritance` **Tag inheritance & configuration** — Billing rates, cost rates, work schedules, approval stages, public holidays, and absence quotas can all be set directly on a tag and cascade automatically to every person or project in its subtree. A person can belong to multiple independent tag trees (e.g. a role-based tree and a country-based tree) and their configurations compose — making it possible to manage complex, distributed teams with almost no per-person configuration

<!-- Configuration & Attributes -->

## Billing & Cost Tracking

- `billing/rates` **Billing rates** — Configurable at person, project, task, and tag levels
- `billing/cost-rates` **Cost rates** — Separate cost tracking at all levels
- `billing/rate-methods` **Rate methods** — Fixed amount, hourly, daily, or non-billable/no-cost
- `billing/rate-splits` **Rate splits** — Split by person, project, or flat
- `billing/recurring-rates` **Recurring rates** — Repeating rate patterns
- `billing/effective-dates` **Rate effective dates** — Rates valid for specific time periods

## Work Schedules

- `schedules/types` **Work schedule types** — Define weekly work patterns (hours per day of week), with working-hour intervals edited as validated clock start/end times that prevent overlapping or invalid ranges
- `schedules/multiple` **Multiple work schedules** — Different patterns for different teams or roles
- `schedules/assignment` **Work schedule assignment** — Assign to people directly, via tags, or at org level; schedule availability (which schedules an entity may use, with show/hide per entity) is managed separately from the dated timeline recording which schedule applies from when, and a schedule still assigned to people or tags cannot be deleted
- `schedules/inheritance` **Work schedule inheritance** — Cascading assignment (org → tag → person)
- `schedules/flexible-length` **Flexible schedule length** — Configure schedules of any length (weekly, bi-weekly, etc.)
- `schedules/effective-dates` **Effective date ranges** — Schedules active for specific time periods
- `schedules/archive` **Archive/unarchive work schedules** — Soft-delete schedules without losing historical data

## Roles & Permissions

- `roles/rbac` **Role-based access control (RBAC)** — Define roles with granular permissions
- `roles/scopes` **24+ authorization scopes** — Admin, organization, staff, projects, tasks, time tracking, absences, expenses, custom fields, budgets, billing/costs, messages, schedules, email templates, and more
- `roles/targets` **Permission targets** — Scope access to: me only, my people, my projects, or entire organization
- `roles/view-manage` **View vs. manage split** — Separate read and write permissions, with a search box to quickly find a permission
- `roles/assignment-permissions` **Granular assignment permissions** — Control who can assign managers (people, projects, tasks, tags), tasks, projects, schedules, time off, expenses, custom fields, and tags, and who can set the valid period for time entry; assignment controls only appear to roles allowed to manage them
- `roles/field-level` **Field-level permissions** — Sensitive data is automatically hidden based on role
- `roles/availability` **Availability controls** — Choose which projects, absence types, expense types, tasks, and custom fields are available by default, and override per tag, person, or project

## Custom Fields

- `custom-fields/types` **Multiple field types** — Text, number, date, datetime, URL, boolean
- `custom-fields/entity-visibility` **Entity visibility** — Apply fields to persons, projects, tasks, time records, absences, or absence types
- `custom-fields/validation` **Validation rules** — Min/max values, regex patterns, allowed value lists
- `custom-fields/defaults` **Placeholders** — Placeholder text on custom fields; field definitions no longer carry default values
- `custom-fields/category-visibility` **Category-level visibility** — Show fields only for specific project/task categories; a field scoped to a task category applies to every level of that category
- `custom-fields/in-reports` **Custom fields in reports** — Include custom fields in reporting dimensions

## Organization Settings

- `org/feature-toggles` **Feature toggles** — Enable/disable modules: projects, tasks, schedules, absence types, expenses, custom fields
- `org/time-entry-settings` **Time entry settings** — Default periodicity, entry rules (see `time-tracking/entry-restrictions`), and reminder configuration
- `org/secondary-projects-availability` **Secondary project availability** — Per-entity toggle to make all (or no) secondary (sub-)projects available on a specific project, person, or tag, overriding the organization default
- `org/duration-format` **Duration format** — hh:mm, decimal days, hour-string-minute
- `org/localisation` **Localization** — Organization-wide timezone, country, currency, language, date/time format, first day of week
- `org/number-format` **Decimal/thousand separators** — Regional number formatting
- `org/time-format` **12/24 hour time format** — Display times in 12-hour or 24-hour format
- `org/deletion` **Organization deletion** — Permanently remove an organization and all its data
- `org/gdpr` **Data export & GDPR** — The **Export your data** and **GDPR** Settings-menu entries render as inert placeholders (no route, handler, or backend endpoint; re-verified 2026-08-04). Only account deletion (7-day grace) is real — do NOT document export/GDPR flows. _(status: placeholder-ui)_
- `org/logo` **Organization logo** — Upload a logo for your organization; it appears in the sidebar navigation and is automatically included in all outgoing email communications
- `org/accent-colour` **Organization accent color** — Administrators can set a color for the organization that becomes the default interface accent for all team members

<!-- Platform & Tools -->

## Reporting

- `reports/custom` **Custom reports** — Configurable multi-dimensional reports; columns can be reordered, marked as subtotals, and empty columns hidden
- `reports/dimensions` **Report dimensions** — Time records, expense records, task records
- `reports/period-grouping` **Period grouping** — Group by year, quarter, month, or week
- `reports/custom-field-integration` **Custom field integration** — Include custom fields in reports
- `reports/saved-templates` **Saved report templates** — Save and reuse report configurations
- `reports/filters` **Report filters** — Filter by person, project, task, tag, date range, project category, or task category, including "is not" exclusions
- `reports/billing-cost` **Billing & cost attributes** — Include billing amounts, cost rates, and profitability in reports, broken out as hourly and daily rates with markup and margin percentages; further columns cover overtime (daily, period, balance), business hours, billable hours and percentage, work-from-home share, activity, comments (rows split per distinct comment), and recorded start/end times
- `reports/charts` **Chart visualizations** — Visualize report data with 11 chart types: bar, line, pie, area, stacked bar, stacked area, horizontal bar, scatter, radar, treemap, and waterfall; toggle between table and chart view, configure chart height
- `reports/folders` **Report folders** — Organize saved reports into folders; move a report into a folder from its menu, and switch every report in a folder between working time and time off with the "Absence / working time" scope
- `reports/matrix` **Matrix report** — Grid visualization with entities or calendar periods on each axis, showing hours, billing, costs, or other metrics per cell, with an optional heat-map overlay and one-click row/column swap
- `reports/budget-status` **Budget status report** — Progress-bar view of budget consumption across projects with actuals, a burn-rate forecast that warns when spending is on track to exceed a budget, hierarchy roll-up including sub-project budgets, drill-down detail sheets, and automatic alerts that link straight to the report when a budget passes its threshold or goes over
- `reports/planning-vs-real` **Planned vs. real report** — Side-by-side comparison of planned task effort against actual timesheet data
- `reports/absence-quotas` **Absence quota report** — Quota consumption per person shown as bars and a timeline, with drill-down detail sheets for a single person's breakdown
- `reports/mobile` **Reports on mobile** — Consult-and-filter experience designed for phones: pick a folder, change the period, and read each report
- `reports/schedule-email` **Scheduled report delivery** — Email a saved report to chosen recipients on a recurring schedule

## Journal & Communications

- `journal/activity-feed` **Activity feed** — Chronological log of team activity; a timesheet's feed shows its approval events and that timesheet's own time and expense changes by default (with an option to show the person's full history), and time record changes appear as a change trail
- `journal/threads` **Message threads** — Conversations with replies
- `journal/rich-text` **Rich text editing** — Bold, italic, links, lists via Lexical editor
- `journal/attachments` **File attachments** — Upload documents to messages
- `journal/mentions` **@Mentions** — Reference people and entities in messages
- `journal/pinned` **Pinned messages** — Highlight important messages
- `journal/search` **Message search & filtering** — Search messages and filter the feed
- `journal/email-replies` **Inbound email replies** — Reply to journal messages via email with automatic quoted text stripping
- `journal/watermark` **New message watermark** — "New" separator in the activity feed for unread tracking

## Notifications

- `notifications/web-push` **Web push notifications** — Browser-based real-time alerts
- `notifications/email` **Email notifications** — Configurable email alerts, delivered only to people who actually belong to the organization (an account or a still-valid invitation); archived people are excluded
- `notifications/digest` **Digest batching** — Aggregate notifications into periodic digests
- `notifications/triggers` **Notification triggers** — Mentions, timesheet submissions, approval actions, team events
- `notifications/preferences` **Customizable notification preferences** — Per-user settings
- `notifications/templates` **Email templates** — Configurable email content for notifications
- `notifications/unread` **Unread counts** — Badge indicators for unread notifications
- `notifications/reliable-delivery` **Reliable delivery** — Notifications are retried automatically if delivery fails
- `notifications/unsubscribe` **One-click unsubscribe** — Easily unsubscribe from email notifications directly in your mail client
- `notifications/history` **Notification history** — Past notifications remain available in the journal feed, with read tracking per context

## AI

> Grouped to mirror the in-app **Beebole AI** page. Keys stay function-first so entries can move back into their functional areas without breaking references.

- `time-tracking/suggestions` **Suggested time entries** — Draft entries proposed automatically — mined from your recurring logging patterns, captured by the desktop app and browser extension, or created when Kanban cards move to a done column. They appear in a tray (and as ghost entries on the calendar view) where you accept, edit, or dismiss each one; suggestions stay private to you until accepted
- `reports/nl-builder` **Natural-language report builder** — Describe the report you need in plain language on the reports page and it is created and run for you
- `approval/digest` **Approval review digest** — When reviewing a submitted timesheet, anything unusual is flagged before you decide: non-working days, overtime, after-hours time, archived projects or tasks, entries near the lock date, over-planned tasks, and totals far from usual; approvers also receive an email digest of timesheets awaiting review
- `integrations/ai-assistants` **AI assistant connections** — Connect AI assistants such as Claude or ChatGPT to your Beebole data (via Beebole's MCP server) with exactly your permissions — log time, read timesheets, list projects — and review or disconnect them anytime from the **Connected apps** list
- `ai/privacy` **AI privacy stance** — AI features run on Beebole-operated servers; nothing is sent to third-party AI providers

## Companion Apps & Add-ins

- `apps/desktop` **Desktop app** — Companion app for macOS, Windows, and Linux that drafts time entries from what you work on, capturing only site address, page title, and time spent; only entries you accept reach your timesheet. Download and install instructions live on the Connected apps page
- `apps/browser-extension` **Browser extension** — Chrome/Edge and Firefox extension that connects directly to your account with your API key and turns time spent on sites you choose into draft timesheet entries; per-site opt-in, and for sites you explicitly allow it can read the visible page text to match time to the right project or task (used only to classify, never stored)
- `reports/excel-addin` **Excel add-in report loader** — Excel add-in that links any worksheet to a saved Beebole report and refreshes the data on demand or each time the file is opened
- `reports/export` **Google Sheets add-in report loader** — Google Sheets add-on that links a sheet to a saved Beebole report and refreshes the data from within the spreadsheet, without re-exporting from Beebole
- `ui/pwa` **Installable web app (PWA)** — Install Beebole as an app on your device from the browser

## Integrations

- `integrations/asana` **Asana** — Import and sync projects, tasks, and people from an Asana workspace, with real-time updates via webhooks
- `integrations/monday` **Monday.com** — Import and sync boards and items from Monday.com into Beebole, with real-time updates
- `integrations/jira` **Jira** — Import and sync projects and issues from Jira into Beebole, with real-time updates via webhooks; personal data of people removed in Jira is automatically anonymized
- `integrations/linear` **Linear** — Import and sync projects and issues from Linear into Beebole, with real-time updates via webhooks
- `integrations/quickbooks` **QuickBooks** — Import QuickBooks customers and items as Beebole project structure, and export time records back to QuickBooks with billing rate, billable/non-billable status, and the entry's comment as description, matching customers and items even at different levels of the project hierarchy; disconnect from either side (Beebole or the QuickBooks App Store)
- `integrations/xero` **Xero** — Import Xero contacts and items as Beebole project structure, keep them in sync, and export time records to Xero as invoices
- `integrations/bamboohr` **BambooHR** — Sync time-off requests from BambooHR to Beebole absences, with employee mapping, absence type mapping, and schedule-aware duration calculation
- `integrations/webhooks` **Webhooks** — Configure outgoing webhooks with signed payloads and automatic retry to push Beebole event data to external systems in real time
- `integrations/import-modes` **Configurable import modes** — For Asana, Jira, and Linear: choose whether to import external entities as Beebole projects or tasks
- `integrations/default-role` **Default role assignment** — Auto-assign a configured role to people imported from any integration

## API

- `api/graphql` **GraphQL API** — Full programmatic API for querying and mutating Beebole data, aimed at developers and API consumers

<!-- Account & Security -->

## Authentication & Security

- `auth/oauth` **OAuth sign-in** — Google and Microsoft SSO
- `auth/custom-sso` **Custom enterprise SSO** — Sign in using an enterprise identity provider (e.g. Okta, Microsoft Entra, OneLogin) via OpenID Connect, configured by administrators in account settings
- `auth/sso-only-enforcement` **SSO-only enforcement** — Require all users in the organization to sign in through a specific SSO provider, disabling interactive sign-in
- `auth/passkeys` **Passkey support** — Passwordless sign-in with fingerprint or face recognition, works across all your devices
- `auth/passwordless-email` **Passwordless email login** — Sign in via a one-time verification code sent to your inbox
- `auth/api-keys` **API keys** — Each user has one auto-created API key (**API Key** in the user menu) with copy and reset actions; no expiration setting
- `auth/account-deletion` **Account deletion** — Permanently delete your account and all associated data

## Subscription & Billing

- `subscription/tiers` **Multiple pricing tiers** — Different plan levels
- `subscription/intervals` **Monthly/annual billing intervals** — Pay month-to-month or annually
- `subscription/seat-pricing` **Seat-based pricing** — Quantity scales with team size
- `subscription/addons` **Add-ons support** — Extend a plan with optional paid add-ons
- `subscription/invoice-preview` **Invoice preview** — See the upcoming invoice amount before it is charged
- `subscription/portal` **Billing portal** — Self-service subscription management
- `subscription/free-plan` **Free plan conversion** — Switch an account to the free plan
- `subscription/promo-codes` **Promotion codes** — Apply discount codes at checkout

## Audit Trail

- `audit/logging` **Operation logging** — Every create, update, delete action is recorded
- `audit/per-user` **Per-user audit filtering** — View changes by specific person
- `audit/field-tracking` **Argument-level change tracking** — See exactly which fields changed
- `audit/timestamps` **Timestamp tracking** — When each change occurred and by whom
- `audit/last-edited` **Last-edited indicators** — Visible on all entities

## Legacy Migration

- `migration/legacy` **Legacy account migration** — Migrate your existing Beebole account data to the current platform, choosing exactly which data to bring over (people, projects, tags, schedules, budgets, time records, manager structure, and more) with live counts shown before you start; historical time records, projects, people, and settings are preserved

<!-- User Interface -->

## UI & User Experience

- `ui/personal-colour` **Personal interface color** — Each user can choose a personal accent color from a palette that overrides the organization default, tinting interactive elements throughout the interface
- `ui/theme` **Dark/light/system theme** — User-selectable appearance
- `ui/multi-language` **Multi-language UI** — English, Czech, German, Spanish, French, Hungarian, Italian, Dutch, Polish, and Portuguese
- `ui/responsive` **Responsive layout** — Resizable panels and sidebar
- `ui/keyboard` **Keyboard navigation** — Escape to close menus, keyboard shortcuts
- `ui/undo-redo` **Undo/redo** — ⌘+Z / ⌘+Shift+Z (Ctrl on Windows/Linux) with operation grouping for bulk changes
- `ui/global-search` **Panel search** — Fuzzy search within each panel/list; there is no single cross-application search
- `ui/realtime-sync` **Real-time sync** — Changes by teammates appear instantly without refreshing
- `ui/offline-fallback` **Fallback-mode indicator** — When the network blocks real-time updates, a sidebar indicator shows the app has switched to a slower fallback mode, with an explanation of what's happening and how IT can restore full speed
- `ui/connection-diagnostics` **Connection diagnostics page** — Test connectivity, latency, and storage, and clear local app data when troubleshooting
- `ui/fast-loading` **Fast loading** — Data is cached locally for near-instant page loads
- `ui/attribute-copy-paste` **Attribute copy/paste** — Copy billing, cost, budget, or quota configurations between entities
- `ui/duplication` **Entity duplication** — Duplicate entities for quick creation
- `ui/tooltips` **Tooltips** — Contextual help throughout the interface
- `ui/toasts` **Toast notifications** — In-app success/error feedback
- `ui/color-coding` **Entity color coding** — Color-coded visual identifiers
- `ui/profile-pictures` **Profile pictures** — Avatar upload with crop tool
- `ui/breadcrumbs` **Breadcrumb navigation** — Hierarchical entity paths
- `ui/version-updates` **Version update notifications** — Notifies you when a new version of the app is available and prompts a one-click reload
- `ui/support-chat` **In-app support chat** — Built-in support chat widget for reaching the Beebole team directly from the app
- `ui/onboarding` **Onboarding flow** — Guided setup wizard for new organizations covering module selection, company profile collection, and demo request routing; serves Beebole's activation funnel rather than ongoing product use

<!-- Planned -->

## Planned Features

> Confirmed in `docs/feature-requests/` but not yet found in the codebase (`prod` branch).

- `org/custom-domain` **Custom domain** — Access the platform via a custom subdomain (e.g. `timesheet.yourcompany.com`)
- `absence/accrual-engine` **Advanced absence accrual engine** — Full accrual engine with per-policy allowances at account, tag, and employee level; calendar-based or hours-tracked accrual methods; separate manual and accrued balances; carry-forward limits; and a mandatory-reason audit trail for all balance adjustments
- `org/configuration-export` **Configuration data export** — Bulk-export people, projects, tags, rates, budgets, and other account configuration as structured data
- `org/gdpr-compliance` **GDPR compliance tools** — Dedicated settings area for data protection officer contact, employee data export, and person anonymization
- `integrations/auto-sync` **Automatic daily integration sync** — Keep structure imported from integrations in sync automatically every day, without manual re-import
- `reports/revenue-at-risk` **Delivery & revenue-at-risk reporting** — Staffing-based delivery reporting that highlights revenue at risk (remainder of the staffing & delivery feature request). _(status: partial — implementation exists on the `dev` branch only, not in production)_

---

## Internal (Non User-Facing)

> These capabilities exist in the codebase but are internal development and operations concerns. They are listed here for completeness so they are not re-flagged during future syncs.

- `internal/posthog` **PostHog analytics / eventing** — Product analytics and event tracking for internal metrics
- `internal/translation-engine` **Translation engine** — Internal script (`i18trans.ts`) for managing i18n JSON files (the resulting multilingual UI is user-facing and listed as `ui/multi-language`)
- `internal/migration-optimization` **Migration batch optimization** — Internal performance tuning for the legacy migration process
- `internal/notification-outbox` **Notification outbox & retry** — Reliable delivery architecture for notifications (the notifications themselves are user-facing)
- `internal/graphql-enhanced` **GraphQL-enhanced library** — Custom GraphQL execution engine used internally
- `internal/code-formatting` **Code formatting & linting** — Prettier, TypeScript strict mode, and code style rules
- `internal/websocket` **WebSocket event system** — Real-time communication layer between server and client (enables the live updates users see)
- `internal/jwt-cookies` **JWT & cookie management** — Authentication token handling and session management internals
- `internal/file-soft-delete` **File attachment soft-delete** — Deleted file and image attachments enter a grace-period queue (`scheduleFileDeletion` / `cancelFileDeletion`) before permanent removal; recovery is handled internally
- `internal/support-panel` **Support admin panel** — Internal tool for Beebole support staff to search customer accounts, sign in as a customer for troubleshooting, manage trial periods, and export a full copy of an organization's data for support and debugging
- `internal/sample-report-seeding` **Sample report seeding** — Accounts with no saved reports automatically receive a set of pre-configured example reports to start from

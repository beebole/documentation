# Beebole Features

**Last updated:** 2026-04-01

---

<!-- Core Features -->

## 1. Time Tracking

- `time-tracking/timesheet` **Timesheet** — Weekly/daily/... time entry grid for logging hours against projects, tasks, and absence types
- `time-tracking/timer` **Timer** — Start/stop timer for real-time tracking
- `time-tracking/entry-modes` **Time entry modes** — Entry in hours (hh:mm), hours (decimals), days, or percentage of workday
- `time-tracking/duration-or-start-end` **Duration or start/end** — Enter time as a duration or with start and end times
- `time-tracking/wfh-flag` **Work from home (WFH) flag** — Mark entries as remote work
- `time-tracking/non-billable-flag` **Non-billable flag** — Mark specific entries as non-billable
- `time-tracking/row-pinning` **Row pinning** — Pin frequently used project/task combinations for quick access
- `time-tracking/comments` **Comments on time entries** — Add notes to individual time records
- `time-tracking/copy-paste` **Copy/paste time entries** — Duplicate entries across days or weeks
- `time-tracking/auto-submit` **Auto-submit** — Automatically submit timesheets after a configurable number of days
- `time-tracking/duplicate-and-start` **Duplicate and start** — Duplicate a time entry and start a new one based on it
- `time-tracking/reminders` **Timesheet reminders** — Configurable reminders for unfilled timesheets
- `time-tracking/mobile` **Mobile timesheet** — Mobile-optimised layout for phones and small tablets, with infinite scroll, swipe-to-delete, and bottom-sheet editors for adding and editing entries
- `time-tracking/score` **Timesheet score** — Per-person compliance score (0–100) tracking on-time submissions, late submissions, missed timesheets, and rejections, shown as a color-coded ring gauge on person records
- `time-tracking/custom-fields` **Custom fields on time entries** — Extend time records with organisation-defined fields (text, number, date, boolean, etc.) for capturing additional context per entry

## 2. Absence & Time-Off Management

- `absence/types` **Configurable absence types** — Vacation, sick leave, parental leave, etc.
- `absence/accrual` **Accrual policies** — Automatic time-off accrual with configurable periodicity
- `absence/carry-forward` **Carry-forward rules** — Define how unused time-off rolls over between periods
- `absence/negative-balance` **Negative balance controls** — Allow or restrict going below zero
- `absence/quotas` **Absence quotas** — Per-person allowances with period definitions
- `absence/balance-tracking` **Absence balance tracking** — Real-time view of taken, available, and accrued balances
- `absence/unit-config` **Unit configuration** — Track absences in hours or days
- `absence/approval` **Absence approval** — Integrated with the multi-stage approval workflow
- `absence/notifications` **Absence notifications** — Alerts for negative balances, advance bookings
- `absence/public-holidays` **Public holidays** — Automatically populated country-specific public holiday calendars assignable at organisation, tag, or person level
- `absence/custom-holidays` **Custom holidays** — Add or edit individual holiday entries manually

## 3. Time Entries & Absences Approval Workflows

- `approval/multi-stage` **Multi-stage approval** — Sequential approval stages (e.g., manager → project lead → admin)
- `approval/types-per-stage` **Approval types per stage** — Approvers can be: admins, project managers, people managers, task managers, tagged people, or specific named people
- `approval/quorum` **Quorum settings** — Require all approvers or any single approver per stage
- `approval/submit` **Submit for approval** — Employees submit completed timesheets for review
- `approval/actions` **Approve / Reject / Request changes** — Approvers can take action with comments
- `approval/history` **Approval history & audit trail** — Full log of approval actions with timestamps
- `approval/change-tracking` **Change tracking** — Highlights added, modified, and deleted records during approval
- `approval/force-edit` **Admin force-edit** — Admins and managers can directly edit submitted or approved time records without rejecting, via a per-person override toggle in the approval pane
- `approval/force-approve-reject` **Admin force-approve and force-reject** — Admins can approve or reject any submitted timesheet even when they are not a designated approver for the current stage, bypassing quorum requirements
- `approval/team-overview` **Team approval overview** — Managers see pending approvals across their team
- `approval/email-actions` **Email actions** — Approve or reject directly from email notifications
- `approval/reminders` **Approval reminders** — Automatic reminders for pending approvals, configurable per person or organization
- `approval/email-summary` **Timesheet summary in emails** — Approval notifications include a summary of the submitted timesheet

## 4. Planning & Tasks Management

- `tasks/kanban` **Kanban board view** — Drag-and-drop task cards by status
- `tasks/kanban-wip-limits` **Kanban WIP limits** — Set a maximum number of concurrent tasks per status column on the Kanban board
- `tasks/gantt` **Gantt chart view** — Timeline visualisation of tasks with start/end dates, canvas-rendered dependency links, and configurable time precision
- `tasks/gantt-columns` **Gantt column customisation** — Show, hide, and reorder Gantt chart columns including billing, cost, effort, dependencies, assignees, and status
- `tasks/gantt-grouping` **Gantt row grouping** — Group Gantt rows by category level, task owner, or status for a structured overview
- `tasks/gantt-keyboard` **Gantt keyboard navigation** — Navigate Gantt rows with arrow keys and expand or collapse groups without a mouse
- `tasks/views` **Saved task views** — Create, rename, and switch between multiple named views of tasks, each with its own layout (Gantt or Kanban), column selection, and grouping preferences
- `tasks/tag-filter` **Filter by tags** — Filter tasks, people, and projects by their assigned tags
- `tasks/dependencies` **Task dependencies** — Link tasks as predecessors and successors to define execution order
- `tasks/effort-occupancy` **Effort & occupancy tracking** — Allocate percentage of a person's time to specific tasks
- `tasks/hierarchy` **Hierarchical tasks** — Tasks organized under categories with nesting
- `tasks/statuses` **Task statuses** — Configurable status workflow (e.g., To Do → In Progress → Done)
- `tasks/ownership` **Task ownership** — Assign people to tasks
- `tasks/recurring` **Recurring tasks** — Set tasks to repeat on a configurable schedule (daily, weekly, monthly, yearly, or by working days)
- `tasks/custom-fields` **Task-level custom fields** — Custom attributes per task
- `tasks/descriptions` **Task descriptions** — Rich text descriptions via Lexical editor
- `tasks/move-category` **Move task between categories** — Reassign a root-level task and its subtasks to a different category via the context menu

## 5. Expense Management

- `expenses/types` **Expense types** — Define categories (travel, meals, equipment, etc.)
- `expenses/currency-unit` **Currency & unit-based expenses** — Monetary amounts or quantity-based
- `expenses/markup` **Markup settings** — Configure a markup percentage per expense type; the billed amount in reports is calculated as `expense amount × markup / 100` (default 100%, i.e. no markup)
- `expenses/records` **Expense records** — Log expenses with amounts, dates, and descriptions
- `expenses/budget-tracking` **Budget tracking for expenses** — Monitor spending against budgets

<!-- Entity Management -->

## 6. People Management

- `people/directory` **Staff directory** — Searchable list of all team members with profiles
- `people/profiles` **Person profiles** — Name, picture, color coding, contact info
- `people/role-assignment` **Role assignment** — Assign roles with specific permissions to each person
- `people/manager-assignment` **Manager assignment** — Define reporting relationships (who manages whom)
- `people/schedule-assignment` **Schedule assignment** — Assign work schedules to people (directly or via tags)
- `people/localisation` **Localisation per person** — Timezone, date format, language preferences
- `people/rates` **Billing & cost rates per person** — Hourly, daily, or fixed rates, with support for recurring patterns and effective date ranges
- `people/absence-quotas` **Absence quotas per person** — Individual time-off allowances
- `people/custom-fields` **Custom fields on persons** — Extend profiles with organization-specific data
- `people/archive` **Archive/unarchive** — Soft-delete people without losing historical data
- `people/bulk-ops` **Bulk operations** — Bulk archive, unarchive, or remove people
- `people/bulk-invite` **Bulk invitation** — Invite multiple people to your Beebole account at once
- `people/admin-takeover` **Admin takeover** — Sign in as another user for troubleshooting
- `people/overflow-archived` **Overflow to archived on seat limit** — When the subscription seat limit is reached, new people are created in an archived state so their profiles can be configured before activation

## 7. Project Management

- `projects/hierarchy` **Hierarchical projects** — Parent/child project structure (sub-projects)
- `projects/categories` **Project categories** — Organize projects into custom categories
- `projects/members` **Project members** — Assign people to projects with availability control
- `projects/managers` **Project managers** — Designate project leads
- `projects/billing-rates` **Billing rates per project** — Project-specific billing configuration
- `projects/cost-rates` **Cost rates per project** — Project-specific cost tracking
- `projects/budgets` **Budgets** — Set billing, cost, and quantity (hours) budgets per project
- `projects/budget-splits` **Budget splits** — Break budgets down by person or sub-project
- `projects/expense-types` **Expense types per project** — Control which expense types apply
- `projects/custom-fields` **Custom fields on projects** — Extend project data with custom attributes
- `projects/move-category` **Move project between categories** — Reassign a root-level project and its sub-projects to a different category via the context menu
- `projects/archive` **Archive/unarchive projects**
- `projects/time-settings` **Project-level time settings** — Override organisation defaults per project

## 9. Tags & Organisational Structure

- `tags/hierarchy` **Hierarchical tags** — Parent/child tag trees (e.g., departments, teams, locations)
- `tags/custom-labels` **Custom hierarchy labels** — Name each level (e.g., "Department" → "Team" → "Unit")
- `tags/grouping` **Tag-based grouping** — Tag people, projects, and tasks to enable report filtering, availability scoping, and approver targeting
- `tags/move-category` **Move tag between categories** — Reassign a root-level tag and its child tags to a different category via the context menu
- `tags/inheritance` **Tag inheritance & configuration** — Billing rates, cost rates, work schedules, approval stages, public holidays, and absence quotas can all be set directly on a tag and cascade automatically to every person or project in its subtree. A person can belong to multiple independent tag trees (e.g. a role-based tree and a country-based tree) and their configurations compose — making it possible to manage complex, distributed teams with almost no per-person configuration

<!-- Configuration & Attributes -->

## 10. Billing & Cost Tracking

- `billing/rates` **Billing rates** — Configurable at person, project, task, and tag levels
- `billing/cost-rates` **Cost rates** — Separate cost tracking at all levels
- `billing/rate-methods` **Rate methods** — Fixed amount, hourly, daily, or non-billable/no-cost
- `billing/rate-splits` **Rate splits** — Split by person, project, or flat
- `billing/recurring-rates` **Recurring rates** — Repeating rate patterns
- `billing/effective-dates` **Rate effective dates** — Rates valid for specific time periods

## 11. Work Schedules

- `schedules/types` **Work schedule types** — Define weekly work patterns (hours per day of week)
- `schedules/multiple` **Multiple work schedules** — Different patterns for different teams or roles
- `schedules/assignment` **Work schedule assignment** — Assign to people directly, via tags, or at org level
- `schedules/inheritance` **Work schedule inheritance** — Cascading assignment (org → tag → person)
- `schedules/flexible-length` **Flexible schedule length** — Configure schedules of any length (weekly, bi-weekly, etc.)
- `schedules/effective-dates` **Effective date ranges** — Schedules active for specific time periods

## 12. Roles & Permissions

- `roles/rbac` **Role-based access control (RBAC)** — Define roles with granular permissions
- `roles/scopes` **24+ authorization scopes** — Admin, organisation, staff, projects, tasks, time tracking, absences, expenses, custom fields, budgets, billing/costs, messages, schedules, email templates, and more
- `roles/targets` **Permission targets** — Scope access to: me only, my people, my projects, or entire organisation
- `roles/view-manage` **View vs. manage split** — Separate read and write permissions
- `roles/field-level` **Field-level permissions** — Sensitive data is automatically hidden based on role
- `roles/availability` **Availability controls** — Choose which projects, absence types, expense types, tasks, and custom fields are available by default, and override per tag, person, or project

## 13. Custom Fields

- `custom-fields/types` **Multiple field types** — Text, number, date, datetime, URL, boolean
- `custom-fields/entity-visibility` **Entity visibility** — Apply fields to persons, projects, tasks, or time records
- `custom-fields/validation` **Validation rules** — Min/max values, regex patterns, allowed value lists
- `custom-fields/defaults` **Default values & placeholders**
- `custom-fields/category-visibility` **Category-level visibility** — Show fields only for specific project/task categories
- `custom-fields/in-reports` **Custom fields in reports** — Include in reporting dimensions

## 14. Organisation Settings

- `org/feature-toggles` **Feature toggles** — Enable/disable modules: projects, tasks, schedules, absence types, expenses, custom fields
- `org/time-entry-settings` **Time entry settings** — Default periodicity, entry rules, reminder configuration
- `org/duration-format` **Duration format** — hh:mm, decimal days, hour-string-minute
- `org/localisation` **Localisation** — Organisation-wide timezone, country, currency, language, date/time format, first day of week
- `org/number-format` **Decimal/thousand separators** — Regional number formatting
- `org/time-format` **12/24 hour time format**
- `org/deletion` **Organisation deletion** — Permanently remove an organisation and all its data
- `org/gdpr` **Data export & GDPR** — Export your personal data or submit a GDPR deletion request directly from your account settings
- `org/logo` **Organisation logo** — Upload a logo for your organisation; it appears in the sidebar navigation and is automatically included in all outgoing email communications.
- `org/accent-colour` **Organisation accent colour** — Administrators can set a colour for the organisation that becomes the default interface accent for all team members.

<!-- Platform & Tools -->

## 15. Reporting

- `reports/custom` **Custom reports** — Configurable multi-dimensional reports
- `reports/dimensions` **Report dimensions** — Time records, expense records, task records
- `reports/period-grouping` **Period grouping** — Group by year, quarter, month, or week
- `reports/custom-field-integration` **Custom field integration** — Include custom fields in reports
- `reports/saved-templates` **Saved report templates** — Save and reuse report configurations
- `reports/filters` **Report filters** — Filter by person, project, task, tag, date range, etc.
- `reports/billing-cost` **Billing & cost attributes** — Include billing amounts, cost rates, and profitability in reports
- `reports/charts` **Chart visualizations** — Visualize report data with 11 chart types: bar, line, pie, area, stacked bar, stacked area, horizontal bar, scatter, radar, treemap, and waterfall; toggle between table and chart view, configure chart height
- `reports/folders` **Report folders** — Organize saved reports into folders for easy navigation and access

## 16. Journal & Communications

- `journal/activity-feed` **Activity feed** — Chronological log of team activity
- `journal/threads` **Message threads** — Conversations with replies
- `journal/rich-text` **Rich text editing** — Bold, italic, links, lists via Lexical editor
- `journal/attachments` **File attachments** — Upload documents to messages
- `journal/mentions` **@Mentions** — Reference people and entities in messages
- `journal/pinned` **Pinned messages** — Highlight important messages
- `journal/search` **Message search & filtering**
- `journal/email-replies` **Inbound email replies** — Reply to journal messages via email with automatic quoted text stripping
- `journal/watermark` **New message watermark** — "New" separator in the activity feed for unread tracking

## 17. Notifications

- `notifications/web-push` **Web push notifications** — Browser-based real-time alerts
- `notifications/email` **Email notifications** — Configurable email alerts
- `notifications/digest` **Digest batching** — Aggregate notifications into periodic digests
- `notifications/triggers` **Notification triggers** — Mentions, timesheet submissions, approval actions, team events
- `notifications/preferences` **Customizable notification preferences** — Per-user settings
- `notifications/templates` **Email templates** — Configurable email content for notifications
- `notifications/unread` **Unread counts** — Badge indicators for unread notifications
- `notifications/reliable-delivery` **Reliable delivery** — Notifications are retried automatically if delivery fails
- `notifications/unsubscribe` **One-click unsubscribe** — Easily unsubscribe from email notifications directly in your mail client
- `notifications/history` **Notification history** — Merged into journal feed with per-context read tracking

## 18. Integrations

- `integrations/asana` **Asana** — Import and sync projects, tasks, and people from an Asana workspace, with real-time updates via webhooks
- `integrations/monday` **Monday.com** — Import and sync boards and items from Monday.com into Beebole, with real-time updates
- `integrations/jira` **Jira** — Import and sync projects and issues from Jira into Beebole, with real-time updates via webhooks
- `integrations/linear` **Linear** — Import and sync projects and issues from Linear into Beebole, with real-time updates via webhooks
- `integrations/quickbooks` **QuickBooks** — Import QuickBooks customers and items as Beebole project structure, and export time records back to QuickBooks with configurable date ranges
- `integrations/bamboohr` **BambooHR** — Sync time-off requests from BambooHR to Beebole absences, with employee mapping, absence type mapping, and schedule-aware duration calculation
- `integrations/webhooks` **Webhooks** — Configure outgoing webhooks with HMAC-SHA256 payload signing and automatic retry to push event data to external systems
- `integrations/import-modes` **Configurable import modes** — For Asana, Jira, and Linear: choose whether to import external entities as Beebole projects or tasks
- `integrations/default-role` **Default role assignment** — Auto-assign a configured role to people imported from any integration

## 19. API

- `api/graphql` **GraphQL API** — Full programmatic API for querying and mutating Beebole data, aimed at developers and API consumers

<!-- Account & Security -->

## 20. Authentication & Security

- `auth/email-password` **Email/password authentication**
- `auth/oauth` **OAuth sign-in** — Google and Microsoft SSO
- `auth/custom-sso` **Custom enterprise SSO** — Sign in using an enterprise identity provider (e.g. Okta, Microsoft Entra, OneLogin) via OpenID Connect, configured by administrators in account settings
- `auth/sso-only-enforcement` **SSO-only enforcement** — Require all users in the organisation to sign in through a specific SSO provider, blocking password-based login
- `auth/passkeys` **Passkey support** — Passwordless sign-in with fingerprint or face recognition, works across all your devices
- `auth/passwordless-email` **Passwordless email login** — Sign in via a one-time verification code sent to your inbox
- `auth/api-keys` **API keys** — Generate keys with expiration for API access
- `auth/account-deletion` **Account deletion** — Permanently delete your account and all associated data

## 21. Subscription & Billing

- `subscription/tiers` **Multiple pricing tiers** — Different plan levels
- `subscription/intervals` **Monthly/annual billing intervals**
- `subscription/seat-pricing` **Seat-based pricing** — Quantity scales with team size
- `subscription/addons` **Add-ons support**
- `subscription/invoice-preview` **Invoice preview**
- `subscription/portal` **Billing portal** — Self-service subscription management
- `subscription/free-plan` **Free plan conversion**
- `subscription/promo-codes` **Promotion codes** — Apply discount codes at checkout

## 22. Audit Trail

- `audit/logging` **Operation logging** — Every create, update, delete action is recorded
- `audit/per-user` **Per-user audit filtering** — View changes by specific person
- `audit/field-tracking` **Argument-level change tracking** — See exactly which fields changed
- `audit/timestamps` **Timestamp tracking** — When each change occurred and by whom
- `audit/last-edited` **Last-edited indicators** — Visible on all entities

## 23. Legacy Migration

- `migration/legacy` **Legacy account migration** — Migrate your existing Beebole account data to the current platform, preserving all historical time records, projects, people, and settings

<!-- User Interface -->

## 24. UI & User Experience

- `ui/personal-colour` **Personal interface colour** — Each user can choose a personal accent colour from a palette that overrides the organisation default, tinting interactive elements throughout the interface.
- `ui/theme` **Dark/light/system theme** — User-selectable appearance
- `ui/multi-language` **Multi-language UI** — English, Spanish, French, German, Italian, ...
- `ui/responsive` **Responsive layout** — Resizable panels and sidebar
- `ui/keyboard` **Keyboard navigation** — Escape to close menus, keyboard shortcuts
- `ui/undo-redo` **Undo/redo** — Cmd+Z / Cmd+Shift+Z with operation grouping for bulk changes
- `ui/global-search` **Global search** — Find entities across the application
- `ui/realtime-sync` **Real-time sync** — Changes by teammates appear instantly without refreshing
- `ui/fast-loading` **Fast loading** — Data is cached locally for near-instant page loads
- `ui/attribute-copy-paste` **Attribute copy/paste** — Copy billing, cost, budget, or quota configurations between entities
- `ui/duplication` **Entity duplication** — Duplicate entities for quick creation
- `ui/tooltips` **Tooltips** — Contextual help throughout the interface
- `ui/toasts` **Toast notifications** — In-app success/error feedback
- `ui/color-coding` **Entity color coding** — Color-coded visual identifiers
- `ui/profile-pictures` **Profile pictures** — Avatar upload with crop tool
- `ui/breadcrumbs` **Breadcrumb navigation** — Hierarchical entity paths
- `ui/pwa` **Installable web app (PWA)** — Install Beebole as an app on your device from the browser
- `ui/version-updates` **Version update notifications** — Notifies you when a new version of the app is available and prompts a one-click reload
- `ui/support-chat` **In-app support chat** — Built-in support chat widget for reaching the Beebole team directly from the app
- `ui/onboarding` **Onboarding flow** — Guided setup wizard for new organisations covering module selection, company profile collection, and demo request routing; serves Beebole's activation funnel rather than ongoing product use

<!-- Planned -->

## 25. Planned Features

> Confirmed in `docs/feature-requests/` but not yet found in the codebase.

- `org/custom-domain` **Custom domain** — Access the platform via a custom subdomain (e.g. `timesheet.yourcompany.com`).
- `reports/export` **Report export via Google Sheets add-on and Excel add-in** — Connect a saved report to Google Sheets or Excel and refresh the data independently from within the spreadsheet.
- `time-tracking/calendar-integration` **Calendar integration in timesheet** — Import events from Google Calendar and Microsoft Outlook, drag-and-drop assignment to timesheet rows, and automatic detection of already-tracked events.
- `reports/budget-status` **Budget status report** — Progress-bar visualisation of budget consumption across projects, with forecast bars and threshold-based notifications.
- `org/configuration-export` **Configuration data export** — Bulk-export people, projects, tags, rates, budgets, and other account configuration as structured data.
- `org/gdpr-compliance` **GDPR compliance tools** — Dedicated settings area for data protection officer contact, employee data export, and person anonymisation.
- `reports/matrix` **Matrix report** — Grid visualisation with entities on one axis and dates on the other, showing hours, overtime, billing, or costs per cell with colour coding.
- `reports/planning-vs-real` **Planning vs. real report** — Side-by-side comparison of planned task effort against actual timesheet data, with forecasting and budget tracking.

---

## Internal (Non User-Facing)

> These capabilities exist in the codebase but are internal development and operations concerns. They are listed here for completeness so they are not re-flagged during future syncs.

- `internal/posthog` **PostHog analytics / eventing** — Product analytics and event tracking for internal metrics
- `internal/translation-engine` **Translation engine** — Internal script (`i18trans.ts`) for managing i18n JSON files (the resulting multilingual UI is user-facing and listed under Localization)
- `internal/migration-optimization` **Migration batch optimization** — Internal performance tuning for the legacy migration process
- `internal/notification-outbox` **Notification outbox & retry** — Reliable delivery architecture for notifications (the notifications themselves are user-facing)
- `internal/graphql-enhanced` **GraphQL-enhanced library** — Custom GraphQL execution engine used internally
- `internal/code-formatting` **Code formatting & linting** — Prettier, TypeScript strict mode, and code style rules
- `internal/websocket` **WebSocket event system** — Real-time communication layer between server and client (enables the live updates users see)
- `internal/jwt-cookies` **JWT & cookie management** — Authentication token handling and session management internals
- `internal/file-soft-delete` **File attachment soft-delete** — Deleted file and image attachments enter a grace-period queue (`scheduleFileDeletion` / `cancelFileDeletion`) before permanent removal; recovery is handled internally
- `internal/support-panel` **Support admin panel** — Internal tool for Beebole support staff to search customer accounts, sign in as a customer for troubleshooting, and manage trial periods

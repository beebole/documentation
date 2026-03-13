# Beebole Features

> This document lists all known features in the Beebole application, organized by category.
> Each feature is classified as **user-facing**, **grey area**, or **internal**.
> Updated by comparing the `beebole/reboot` codebase (dev branch) against this file.

**Last synced:** 2026-03-12

---

{/* Core Workflows */}

## 1. Time Tracking

- **Timesheet interface** — Weekly/daily time entry grid for logging hours against projects, tasks, and absence types
- **Timer** — Start/stop timer for real-time tracking
- **Duration modes** — Entry in hours (hh:mm), days, or percentage of workday
- **Duration or start/end** — Enter time as a duration or with start and end times
- **Work from home (WFH) flag** — Mark entries as remote work
- **Non-billable flag** — Mark specific entries as non-billable
- **Row pinning** — Pin frequently used project/task combinations for quick access
- **Comments on time entries** — Add notes to individual time records
- **Copy/paste time entries** — Duplicate entries across days or weeks
- **Auto-submit** — Automatically submit timesheets after a configurable number of days
- **Duplicate and start** — Duplicate a time entry and start a new one based on it
- **Timesheet reminders** — Configurable reminders for unfilled timesheets
- **Calendar integration** — Import events from Google Calendar and Microsoft Outlook, drag-and-drop assignment to timesheet rows, "already tracked" detection (see also §15 Integrations)

## 2. Approval Workflows

- **Multi-stage approval** — Sequential approval stages (e.g., manager → project lead → admin)
- **Approval types per stage** — Approvers can be: admins, project managers, people managers, task managers, tagged people, or specific named people
- **Quorum settings** — Require all approvers or any single approver per stage
- **Submit for approval** — Employees submit completed timesheets/expenses for review
- **Approve / Reject / Request changes** — Approvers can take action with comments
- **Stage rollback on rejection** — Rejected entries go back to the appropriate stage
- **Approval history & audit trail** — Full log of approval actions with timestamps
- **Change tracking** — Highlights added, modified, and deleted records during approval
- **Team approval overview** — Managers see pending approvals across their team
- **Dynamic approver discovery** — Resolve approvers by role: project managers, task managers, people managers, tagged people, or admins
- **Resubmission after rejection** — Rejected entries return to edit state with rejected stage tracking
- **Email actions** — Approve or reject directly from email notifications
- **Approval reminders** — Automatic reminders for pending approvals, configurable per person or organization
- **Timesheet summary in emails** — Approval notifications include a summary of the submitted timesheet

## 3. Absence & Time-Off Management

- **Configurable absence types** — Vacation, sick leave, parental leave, etc.
- **Accrual policies** — Automatic time-off accrual with configurable periodicity
- **Carry-forward rules** — Define how unused time-off rolls over between periods
- **Negative balance controls** — Allow or restrict going below zero
- **Absence quotas** — Per-person allowances with period definitions
- **Balance tracking** — Real-time view of taken, available, and accrued balances
- **Unit configuration** — Track absences in hours or days
- **Absence approval** — Integrated with the multi-stage approval workflow
- **Absence notifications** — Alerts for negative balances, advance bookings
- **Public holidays** — Country-specific public holiday calendars
- **Custom holidays** — Add or edit individual holiday entries manually

## 4. Expense Management

- **Expense types** — Define categories (travel, meals, equipment, etc.)
- **Currency & unit-based expenses** — Monetary amounts or quantity-based
- **Markup settings** — Configure markup percentages on expense types
- **Expense records** — Log expenses with amounts, dates, and descriptions
- **Budget tracking for expenses** — Monitor spending against budgets

{/* Entity Management */}

## 5. People Management

- **Staff directory** — Searchable list of all team members with profiles
- **Person profiles** — Name, picture, color coding, contact info
- **Role assignment** — Assign roles with specific permissions to each person
- **Manager assignment** — Define reporting relationships (who manages whom)
- **Schedule assignment** — Assign work schedules to people (directly or via tags)
- **Localisation per person** — Timezone, date format, language preferences
- **Billing & cost rates per person** — Hourly, daily, or fixed rates
- **Absence quotas per person** — Individual time-off allowances
- **Custom fields on persons** — Extend profiles with organization-specific data
- **Archive/unarchive** — Soft-delete people without losing historical data
- **Bulk operations** — Bulk archive, unarchive, or remove people
- **Bulk invitation** — Invite multiple people to your Beebole account at once
- **Admin takeover** — Sign in as another user for troubleshooting

## 6. Project Management

- **Hierarchical projects** — Parent/child project structure (sub-projects)
- **Project categories** — Organize projects into custom categories
- **Project members** — Assign people to projects with availability control
- **Project managers** — Designate project leads
- **Billing rates per project** — Project-specific billing configuration
- **Cost rates per project** — Project-specific cost tracking
- **Budgets** — Set billing, cost, and quantity (hours) budgets per project
- **Budget splits** — Break budgets down by person or sub-project
- **Expense types per project** — Control which expense types apply
- **Custom fields on projects** — Extend project data with custom attributes
- **Archive/unarchive projects**
- **Project-level time settings** — Override organisation defaults per project

## 7. Task Management

- **Hierarchical tasks** — Tasks organized under categories with nesting
- **Task statuses** — Configurable status workflow (e.g., To Do → In Progress → Done)
- **Task ownership** — Assign people to tasks
- **Start/end dates** — Track task timelines
- **Kanban board view** — Drag-and-drop task cards by status
- **WIP limits** — Set maximum concurrent tasks per status column on the Kanban board
- **Gantt chart view** — Timeline visualization of tasks
- **Calendar view** — Tasks displayed on a calendar
- **Task-level custom fields** — Custom attributes per task
- **Task dependencies** — Link tasks as predecessors and successors to define execution order
- **Effort & occupancy tracking** — Allocate percentage of a person's time to specific tasks
- **Task descriptions** — Rich text descriptions via Lexical editor
- **Bulk operations on tasks**
- **Planning view** — Visual resource allocation interface
- **Capacity planning** — Compare scheduled vs. actual hours
- **Workload visualization** — See team workload distribution

## 8. Tags & Organisational Structure

- **Hierarchical tags** — Parent/child tag trees (e.g., departments, teams, locations)
- **Custom hierarchy labels** — Name each level (e.g., "Department" → "Team" → "Unit")
- **Tag-based grouping** — Tag people, projects, and tasks for organizational grouping
- **Tag inheritance** — Schedules, rates, and properties cascade through tag hierarchy
- **Billing & cost rates per tag** — Set rates at the tag/department level

{/* Configuration */}

## 9. Billing & Cost Tracking

- **Billing rates** — Configurable at person, project, task, and tag levels
- **Cost rates** — Separate cost tracking at all levels
- **Rate methods** — Fixed amount, hourly, daily, or non-billable/no-cost
- **Rate splits** — Split by person, project, or flat
- **Recurring rates** — Repeating rate patterns
- **Rate effective dates** — Rates valid for specific time periods

## 10. Scheduling & Work Patterns

- **Schedule types** — Define weekly work patterns (hours per day of week)
- **Multiple schedules** — Different patterns for different teams or roles
- **Schedule assignment** — Assign to people directly, via tags, or at org level
- **Schedule inheritance** — Cascading assignment (org → tag → person)
- **Schedule length** — Configure schedules of any length (weekly, bi-weekly, etc.)
- **Time period management** — Schedules effective for specific date ranges

## 11. Roles & Permissions

- **Role-based access control (RBAC)** — Define roles with granular permissions
- **24+ authorization scopes** — Admin, organisation, staff, projects, tasks, time tracking, absences, expenses, custom fields, budgets, billing/costs, messages, schedules, email templates, and more
- **Permission targets** — Scope access to: me only, my people, my projects, or entire organisation
- **View vs. manage split** — Separate read and write permissions
- **Field-level permissions** — Sensitive data is automatically hidden based on role
- **Availability controls** — Choose which projects, absence types, expense types, tasks, and custom fields are available by default, and override per tag, person, or project

## 12. Custom Fields

- **Multiple field types** — Text, number, date, datetime, URL, boolean
- **Entity visibility** — Apply fields to persons, projects, tasks, or time records
- **Validation rules** — Min/max values, regex patterns, allowed value lists
- **Default values & placeholders**
- **Category-level visibility** — Show fields only for specific project/task categories
- **Custom fields in reports** — Include in reporting dimensions

## 13. Organisation Settings

- **Feature toggles** — Enable/disable modules: projects, tasks, schedules, absence types, expenses, custom fields
- **Time entry settings** — Default periodicity, entry rules, reminder configuration
- **Localisation** — Organisation-wide timezone, country, currency, language, date/time format, first day of week
- **Duration format** — hh:mm, decimal days, hour-string-minute
- **Decimal/thousand separators** — Regional number formatting
- **12/24 hour time format**
- **Organisation deletion** — Permanently remove an organisation and all its data

{/* Platform & Tools */}

## 14. Reporting & Analytics

- **Custom reports** — Configurable multi-dimensional reports
- **Report dimensions** — Time records, expense records, task records
- **Period grouping** — Group by year, quarter, month, or week
- **Custom field integration** — Include custom fields in reports
- **Saved report templates** — Save and reuse report configurations
- **Report categories** — Organize saved reports into categories for quick access
- **Report filters** — Filter by person, project, task, tag, date range, etc.
- **Billing & cost attributes** — Include billing amounts, cost rates, and profitability in reports

## 15. Journal & Communications

- **Activity feed** — Chronological log of team activity
- **Message threads** — Conversations with replies
- **Rich text editing** — Bold, italic, links, lists via Lexical editor
- **File attachments** — Upload documents to messages
- **@Mentions** — Reference people and entities in messages
- **Pinned messages** — Highlight important messages
- **Message search & filtering**
- **Inbound email replies** — Reply to journal messages via email (SendGrid inbound parse), with automatic quoted text stripping and sender verification
- **New message watermark** — Slack-style "new" separator in the activity feed for unread tracking

## 16. Notifications

- **Web push notifications** — Browser-based real-time alerts
- **Email notifications** — Configurable email alerts
- **Digest batching** — Aggregate notifications into periodic digests
- **Notification triggers** — Mentions, timesheet submissions, approval actions, team events
- **Customizable notification preferences** — Per-user settings
- **Email templates** — Configurable email content for notifications
- **Unread counts** — Badge indicators for unread notifications
- **Reliable delivery** — Notifications are retried automatically if delivery fails
- **One-click unsubscribe** — Easily unsubscribe from email notifications directly in your mail client
- **Notification history** — Merged into journal feed with per-context read tracking

## 17. Integrations

- **Asana** — Import projects and tasks with webhook-based sync
- **Jira** — Time tracking export to Jira
- **Linear** — Task synchronization with Linear.app
- **QuickBooks** — Export time and expense data with configurable date ranges
- **Google Calendar** — Import calendar events to timesheet with drag-and-drop (see also §1 Time Tracking)
- **Microsoft Outlook** — Import Outlook calendar events to timesheet with drag-and-drop (see also §1 Time Tracking)
- **Configurable import modes** — Choose project-level or task-level import
- **Default role assignment** — Auto-assign roles to imported users
- **Sync status indicators** — Visibility into integration health

## 18. API

- **GraphQL API** — Full programmatic API for querying and mutating Beebole data, aimed at developers and API consumers

{/* Account & Security */}

## 19. Authentication & Security

- **Email/password authentication**
- **OAuth sign-in** — Google and Microsoft SSO
- **Passkey support** — Passwordless sign-in with fingerprint or face recognition, works across all your devices
- **PIN-based authentication** — Quick sign-in with a personal PIN code
- **SSO/OpenID configuration** — Enterprise single sign-on
- **API keys** — Generate keys with expiration for API access
- **Admin takeover** — Sign in as another user for troubleshooting (see also §5 People Management)
- **Account deletion** — Permanently delete your account and all associated data
- **Session management**

## 20. Subscription & Billing

- **Stripe-powered billing** — Subscription management via Stripe
- **Multiple pricing tiers** — Different plan levels
- **Monthly/annual billing intervals**
- **Seat-based pricing** — Quantity scales with team size
- **Add-ons support**
- **Invoice preview**
- **Billing portal** — Self-service subscription management
- **Free plan conversion**
- **Promotion codes** — Apply discount codes at checkout

## 21. Audit Trail

- **Operation logging** — Every create, update, delete action is recorded
- **Per-user audit filtering** — View changes by specific person
- **Argument-level change tracking** — See exactly which fields changed
- **Timestamp tracking** — When each change occurred and by whom
- **Last-edited indicators** — Visible on all entities

## 22. Onboarding

- **Guided onboarding flow** — Step-by-step setup for new organisations
- **Feature selection** — Choose which modules to activate
- **Company profile** — Role, company size, discovery channel
- **Demo request option**
- **Invitation system** — Invite team members via email with expiration

{/* User Interface */}

## 23. UI & User Experience

- **Dark/light/system theme** — User-selectable appearance
- **Multi-language UI** — English, Spanish, French, German, Italian, Korean
- **Responsive layout** — Resizable panels and sidebar
- **Keyboard navigation** — Escape to close menus, keyboard shortcuts
- **Undo/redo** — Cmd+Z / Cmd+Shift+Z with operation grouping for bulk changes
- **Global search** — Find entities across the application
- **Real-time sync** — Changes by teammates appear instantly without refreshing
- **Fast loading** — Data is cached locally for near-instant page loads
- **Attribute copy/paste** — Copy billing, cost, budget, or quota configurations between entities
- **Entity duplication** — Duplicate entities for quick creation
- **Tooltips** — Contextual help throughout the interface
- **Toast notifications** — In-app success/error feedback
- **Entity color coding** — Color-coded visual identifiers
- **Profile pictures** — Avatar upload with crop tool
- **Breadcrumb navigation** — Hierarchical entity paths
- **Installable web app (PWA)** — Install Beebole as an app on your device from the browser

{/* Planned */}

## 24. AI Assistant (planned)

- **LangGraph + Claude integration** — Conversational AI assistant for time tracking management
- **Read & mutation tools** — Search entities, create/update records with human-in-the-loop confirmation
- **Report generation** — AI-assisted report building
- **SSE streaming** — Real-time response streaming to frontend
- **Undo/redo integration** — AI actions participate in the undo/redo system

---

## Internal (Non User-Facing)

> These capabilities exist in the codebase but are internal development and operations concerns. They are listed here for completeness so they are not re-flagged during future syncs.

- **Legacy migration tool** — One-time migration from legacy Beebole accounts; no longer relevant to current users
- **Feature preview system** — Internal mechanism for showing preview content for upcoming features
- **PostHog analytics / eventing** — Product analytics and event tracking for internal metrics
- **CI/CD pipelines** — Automated deployment workflows (e.g., `deploy-qa.yml`)
- **Translation engine** — Internal script (`i18trans.ts`) for managing i18n JSON files (the resulting multilingual UI is user-facing and listed under Localization)
- **IndexedDB web worker** — Off-main-thread caching implementation detail (the speed benefit is listed under Data Management)
- **Migration batch optimization** — Internal performance tuning for the legacy migration process
- **Database internals** — MongoDB schema, loaders, helpers, and migration scripts
- **Notification outbox & retry** — Reliable delivery architecture for notifications (the notifications themselves are user-facing)
- **GraphQL-enhanced library** — Custom GraphQL execution engine used internally
- **Code formatting & linting** — Prettier, TypeScript strict mode, and code style rules
- **WebSocket event system** — Real-time communication layer between server and client (enables the live updates users see)
- **JWT & cookie management** — Authentication token handling and session management internals

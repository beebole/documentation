# Beebole — Product Overview

Use this context to understand what Beebole does and how its concepts relate to each other. App URLs, support email, and source code repo details are in CLAUDE.md.

## Core capabilities

- **Time Tracking** — Timesheet grid (weekly/daily), real-time timer, multiple entry modes (hours, days, percentage), WFH flag, comments, auto-submit, mobile layout, and timesheet compliance scoring
- **Absence & Time-Off** — Configurable leave types, accrual policies, carry-forward rules, quotas, balance tracking, public holidays by country, and absence approval integrated with the main workflow
- **Approval Workflows** — Multi-stage approval for both time entries and absences; configurable approvers (managers, admins, named people), quorum rules, audit trail, email actions, and admin force-edit
- **Planning & Tasks** — Kanban board, Gantt chart, task dependencies, effort/occupancy tracking, hierarchical task categories, configurable statuses, and task ownership
- **Expense Management** — Expense types, monetary and quantity-based entries, markup settings, and budget tracking
- **Reporting** — Multi-dimensional custom reports with filters, period grouping, billing/cost attributes, 11 chart types, saved templates, and folder organization
- **Billing & Cost Tracking** — Configurable rates (billing and cost) at person, project, task, and tag levels; fixed/hourly/daily methods, recurring patterns, and effective date ranges
- **People Management** — Staff directory, profiles, role assignment, manager relationships, schedule assignment, per-person rates and quotas, custom fields, bulk operations, and archive
- **Project Management** — Hierarchical projects (parent/child), categories, members, managers, budgets with splits, expense types, and custom fields
- **Tags & Org Structure** — Hierarchical tag trees with custom level labels; tags cascade billing rates, schedules, approval stages, and quotas to all people and projects beneath them
- **Custom Fields** — User-defined fields (text, number, date, boolean, URL) on persons, projects, tasks, and time entries; validation rules and report integration
- **Roles & Permissions** — Role-based access control with 24+ authorization scopes, permission targets (me / my people / my projects / org), view vs. manage split, and field-level hiding
- **Journal & Communications** — Activity feed, threaded messages, rich text, file attachments, @mentions, pinned messages, and inbound email replies
- **Notifications** — Web push and email alerts, digest batching, per-user preferences, configurable email templates, and one-click unsubscribe
- **Audit Trail** — Full operation log (create/update/delete) with field-level change tracking, per-user filtering, and timestamps
- **Integrations** — Asana, Jira, Linear, QuickBooks, BambooHR, and outgoing webhooks with HMAC signing
- **API** — GraphQL API for developers
- **Authentication & Security** — Email/password, Google/Microsoft SSO, passkeys, passwordless email login, and API keys
- **Subscription & Billing** — Seat-based pricing tiers, monthly/annual billing, add-ons, self-service billing portal, and promotion codes

## Key concepts

- **Organisation** — The top-level account. All data belongs to an organisation.
- **Company** — An organisational unit that groups projects. Projects belong to companies.
- **Project** — A container for time tracking. Can have sub-projects (hierarchical) and assigned tasks.
- **Task** — An independent planning entity assigned to projects. Not a sub-element of projects.
- **Tag** — A hierarchical label applied to people and projects. Tags cascade configuration (rates, schedules, approvals, quotas) to everything beneath them. A person can belong to multiple independent tag trees.
- **Work schedule** — Defines expected working hours per day of the week. Assigned at org, tag, or person level.
- **Custom field** — Organisation-defined data field added to persons, projects, tasks, or time entries.
- **Role** — A named permission set assigned to people; controls what they can see and do across all modules.

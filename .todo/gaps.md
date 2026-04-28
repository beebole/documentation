# Gaps report

Generated: 2026-04-28
Catalog last updated: 2026-04-28

---

## Coverage gaps → undocumented features

### Section 1: Time Tracking

- [ ] Missing | `help/documentation/timesheets.mdx` | `time-tracking/wfh-flag` **Work from home (WFH) flag** — page has no dedicated section; feature only appears in a keyboard shortcut table row with no explanation
- [ ] Partial | `help/documentation/timesheets.mdx` | `time-tracking/entry-modes` **Time entry modes** — needs: hh:mm and decimal are mentioned but "percentage of workday" mode is not described; no explanation of how to switch entry modes
- [ ] Partial | `help/documentation/timesheets.mdx` | `time-tracking/duration-or-start-end` **Duration or start/end** — needs: start/end time entry is covered in timesheetSettings.mdx but timesheets.mdx itself has no walkthrough; cross-reference or summary missing
- [ ] Partial | `help/documentation/timesheets.mdx` | `time-tracking/custom-fields` **Custom fields on time entries** — needs: only a single line about required custom fields; no explanation of how time-entry custom fields are configured or used in practice

### Section 2: Absence & Time-Off Management

- [ ] Missing | `help/documentation/timeoff.mdx` | `absence/cost-tracking` **Absence cost inclusion** — paid vs unpaid absences and automatic inclusion in people cost totals is not mentioned anywhere in the time-off or costs pages
- [ ] Partial | `help/documentation/timeoff.mdx` | `absence/carry-forward` **Carry-forward rules** — needs: carry-forward is covered in accruals.mdx but timeoff.mdx has no mention or cross-reference; users on the time-off page won't find it
- [ ] Missing | `help/documentation/notifications.mdx` | `absence/excess-occurrence-notifications` **Absence frequency alerts** — not documented anywhere; feature alerts admins when a person takes absence more than N times per month/year

### Section 3: Time Entries & Absences Approval Workflows

- [ ] Partial | `help/documentation/approval.mdx` | `approval/types-per-stage` **Approval types per stage** — needs: "task managers" as an approver type is missing; page lists admin, project manager, people manager, tagged people, specific people — but not task manager
- [ ] Partial | `help/documentation/approval.mdx` | `approval/force-approve-reject` **Admin force-approve and force-reject** — needs: force-edit is documented but force-approve and force-reject as distinct bypass actions (ignoring quorum) are not described

### Section 4: Planning & Tasks Management

- [ ] Missing | `help/documentation/gantt.mdx` | `tasks/gantt-workload-heatmap` **Gantt workload heatmap** — page covers effort/capacity concepts but has no section on the color-coded group-row heatmap bars or the per-person hover breakdown
- [ ] Missing | `help/documentation/planning.mdx` | `tasks/end-date-lock` **Lock task end date** — not mentioned anywhere in planning.mdx or gantt.mdx
- [ ] Missing | `help/documentation/planning.mdx` | `tasks/custom-fields` **Task-level custom fields** — custom fields on tasks are not mentioned in planning.mdx or anywhere in the planning/tasks section
- [ ] Partial | `help/documentation/planning.mdx` | `tasks/views` **Saved task views** — needs: gantt.mdx covers named views fully, but planning.mdx (the overview page) has no mention of the saved views / named tabs feature
- [ ] Partial | `help/documentation/gantt.mdx` | `tasks/gantt-columns` **Gantt column customisation** — needs: available columns are listed but the page doesn't note that billing, cost, and effort columns may require specific permissions or plan features

### Section 5: Expense Management

_All features covered (expense types, currency/unit, markup, records, budget tracking)._

### Section 6: People Management

- [ ] Partial | `help/documentation/people.mdx` | `people/rates` **Billing & cost rates per person** — needs: recurring rate patterns and effective date ranges are not mentioned from the people page; cross-reference to billing.mdx/costs.mdx missing
- [ ] Partial | `help/documentation/people.mdx` | `people/overflow-archived` **Overflow to archived on seat limit** — needs: covered only in a brief warning callout; deserves a dedicated explanation of the seat-limit overflow scenario

### Section 7: Project Management

- [ ] Partial | `help/documentation/projects.mdx` | `projects/budget-splits` **Budget splits** — needs: cross-reference to budgets.mdx; project page doesn't mention split-by-person or split-by-sub-project
- [ ] Partial | `help/documentation/projects.mdx` | `projects/time-settings` **Project-level time settings** — needs: the projects page has only a brief mention; no list of which org-level time settings can be overridden at project level

### Section 9: Tags & Organisational Structure

_All features covered (hierarchy, custom labels, grouping, move category, inheritance)._

### Section 10: Billing & Cost Tracking

_All features covered (rates, cost rates, methods, splits, recurring rates, effective dates)._

### Section 11: Work Schedules

_All features covered (types, multiple schedules, assignment, inheritance, flexible length, effective dates)._

### Section 12: Roles & Permissions

_All features covered (RBAC, 24+ scopes, targets, view/manage split, field-level, availability controls)._

### Section 13: Custom Fields

_All features covered (types, entity visibility, validation, defaults, category-level visibility, in reports)._

### Section 14: Organisation Settings

- [ ] Missing | `help/documentation/account-settings.mdx` | `org/time-entry-settings` **Time entry settings** — account-settings.mdx has no section on org-level time entry defaults (periodicity, entry rules, reminders); these live in timesheetSettings.mdx with no cross-reference from the settings page
- [ ] Partial | `help/documentation/account-settings.mdx` | `org/gdpr` **Data export & GDPR** — needs: data-exports.mdx has a GDPR section, but account-settings has only a one-line mention; the two pages need a clearer relationship (is GDPR in settings or data exports?)

### Section 15: Reporting

- [ ] Partial | `help/documentation/reports.mdx` | `reports/charts` **Chart visualizations** — needs: reports.mdx has no mention of chart types; the 11 chart types are documented only in custom-reports.mdx with no cross-reference
- [ ] Partial | `help/documentation/reports.mdx` | `reports/saved-templates` **Saved report templates** — needs: reports.mdx links to custom-reports.mdx but doesn't summarize the saved-templates feature at all; users on the overview page won't know it exists

### Section 16: Journal & Communications

_All features covered (activity feed, threads, rich text, attachments, mentions, pinned messages, search/filter, email replies, watermark)._

### Section 17: Notifications

- [ ] Partial | `help/documentation/notifications.mdx` | `notifications/reliable-delivery` **Reliable delivery** — needs: the outbox/retry behavior is described in one paragraph but framed technically; needs rewriting as a user-visible reliability guarantee

### Section 18: Integrations

- [ ] Partial | `help/integrations/bamboohr.mdx` | `integrations/bamboohr` **BambooHR** — needs: schedule-aware duration calculation is mentioned but not explained; users need to understand how their work schedule affects imported absence durations
- [ ] Partial | `help/integrations/monday.mdx` | `integrations/import-modes` **Configurable import modes** — needs: Monday.mdx mentions "import mode" only in a passing FAQ answer; unlike Jira and Asana, there is no setup-step section explaining the projects-vs-tasks import choice

### Section 19: API

_Covered by the api/ section (GraphQL API, queries, mutations, schema explorer, examples)._

### Section 20: Authentication & Security

_All features covered (email/password, OAuth, custom enterprise SSO, SSO-only enforcement, passkeys, passwordless email, API keys, account deletion)._

### Section 21: Subscription & Billing

_All features covered (tiers, monthly/annual intervals, seat pricing, add-ons, invoice preview, billing portal, free plan conversion, promo codes)._

### Section 22: Audit Trail

- [ ] Partial | `help/documentation/audit-trail.mdx` | `audit/per-user` **Per-user audit filtering** — needs: the filter-by-person step is documented but combining filters (person + date range + entity type) is not explained
- [ ] Partial | `help/documentation/audit-trail.mdx` | `audit/timestamps` **Timestamp tracking** — needs: timestamps are mentioned in prose ("when it happened") but the display format, timezone handling, and how to interpret timestamps is not shown

### Section 23: Legacy Migration

_Fully covered._

### Section 24: UI & User Experience

- [ ] Missing | `help/documentation/concepts.mdx` | `ui/global-search` **Global search** — not documented anywhere; no page explains what global search covers or how to invoke it
- [ ] Missing | `help/documentation/concepts.mdx` | `ui/realtime-sync` **Real-time sync** — not documented; concepts.mdx covers version update banners but not live teammate sync behavior
- [ ] Missing | `help/documentation/concepts.mdx` | `ui/attribute-copy-paste` **Attribute copy/paste** — a single FAQ line in projects.mdx mentions copy for billing rates but there is no standalone documentation of the feature or its scope across entity types
- [ ] Missing | `help/documentation/concepts.mdx` | `ui/duplication` **Entity duplication** — not documented anywhere
- [ ] Missing | `help/documentation/account-settings.mdx` | `ui/support-chat` **In-app support chat** — not documented anywhere; users need to know how to reach support from within the app
- [ ] Missing | `help/documentation/concepts.mdx` | `ui/color-coding` **Entity color coding** — not documented; no explanation of how color identifiers work across the interface
- [ ] Partial | `help/documentation/concepts.mdx` | `ui/undo-redo` **Undo/redo** — needs: covered in timesheets.mdx keyboard shortcuts table; operation grouping behavior for bulk changes is mentioned only there; concepts.mdx has no reference to undo/redo scope

_Note: `ui/personal-colour`, `ui/theme`, `ui/multi-language`, `ui/responsive`, `ui/pwa`, `ui/keyboard` (Gantt), `ui/profile-pictures`, `ui/onboarding`, `ui/version-updates`, `ui/breadcrumbs` (not documented but low priority), `ui/tooltips` and `ui/toasts` (UI micro-features, acceptable gap) are either covered or low priority._

---

## Proposed page-mappings additions

The following features have no matching row in `page-mappings.md` and will not be routed correctly by keyword:

- Keywords: `absence cost, paid absence, unpaid absence, cost inclusion, paid leave` → proposed page: `help/documentation/timeoff.mdx`
- Keywords: `excess occurrence, absence frequency, attendance alert, frequency alert, absence pattern` → proposed page: `help/documentation/notifications.mdx`
- Keywords: `global search, search bar, universal search, find entities` → proposed page: `help/documentation/concepts.mdx`
- Keywords: `undo, redo, keyboard shortcuts, Cmd+Z, Ctrl+Z, operation grouping` → proposed page: `help/documentation/concepts.mdx`
- Keywords: `entity duplication, duplicate project, duplicate task, duplicate person` → proposed page: `help/documentation/concepts.mdx`
- Keywords: `attribute copy paste, copy rates, copy billing, copy budget, copy quota` → proposed page: `help/documentation/concepts.mdx`
- Keywords: `real-time sync, live updates, teammate changes, instant update` → proposed page: `help/documentation/concepts.mdx`
- Keywords: `support chat, in-app support, chat widget, contact support` → proposed page: `help/documentation/account-settings.mdx`
- Keywords: `workload heatmap, Gantt heatmap, capacity heatmap, group row color` → proposed page: `help/documentation/gantt.mdx`
- Keywords: `lock end date, pin end date, fixed end date, hard deadline task` → proposed page: `help/documentation/gantt.mdx`
- Keywords: `color coding, entity color, color identifier, color code` → proposed page: `help/documentation/concepts.mdx`

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (one per line). Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each.

**Top priority Missing entries for `/write`:**

1. `absence/cost-tracking` — `help/documentation/timeoff.mdx` — high user impact; affects cost reports and budgets
2. `absence/excess-occurrence-notifications` — `help/documentation/notifications.mdx` — entirely undocumented; unique feature
3. `tasks/end-date-lock` — `help/documentation/gantt.mdx` — entirely undocumented; planning-critical
4. `tasks/custom-fields` — `help/documentation/planning.mdx` — entirely undocumented in task context
5. `ui/global-search` — `help/documentation/concepts.mdx` — core navigation feature with zero coverage
6. `tasks/gantt-workload-heatmap` — `help/documentation/gantt.mdx` — key planning feature; no dedicated section
7. `time-tracking/wfh-flag` — `help/documentation/timesheets.mdx` — common feature; no explanation in docs
8. `ui/support-chat` — `help/documentation/account-settings.mdx` — users need to know how to get help

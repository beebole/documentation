# Gaps report

Generated: 2026-08-04
Catalog last updated: 2026-08-04

---

## Coverage gaps → undocumented features

### Time Tracking

- [ ] Missing | `help/documentation/timesheets.mdx` | `time-tracking/calendar-view` Timesheet calendar view — new section: day-by-hour calendar, drag/resize start–end, ⌘-drag duplicate, hover delete
- [ ] Missing | `help/documentation/timesheetSettings.mdx` | `time-tracking/lock-date` Lock date — new section: freeze records on/before a date, org-wide or per person/team/project, applies to admins and BambooHR sync
- [ ] Partial | `help/documentation/timesheets.mdx` | `time-tracking/clear-rows` — needs: replace the documented **Clear timesheet** action (removed from the product) with the per-section **Clear rows** button (undoable, hidden on locked periods)
- [ ] Partial | `help/documentation/timesheetSettings.mdx` | `time-tracking/entry-restrictions` — needs: add missing rules (keep entries within project/person validity dates; require a comment on submission; limit time-off to available quota balance) and rename "Only allow time entries on working days" → scheduled-working-time behavior (clock times must fall within schedule)
- [ ] Partial | `help/documentation/timesheetSettings.mdx` | `time-tracking/record-locking` — needs: locking edits once a timesheet is submitted or approved (owner/admin-only rule is already documented)

### Absence & Time-Off Management

- [ ] Partial | `help/documentation/timeoff.mdx` | `absence/carry-forward` — needs: carry-forward now functions (cap semantics, 0 = no cap, requires "valid until", reflected in booking limits and the absence quota report); un-hedge if the page still hedges it

### Planning, Tasks & Staffing

- [ ] Missing | `help/documentation/staffing.mdx` | `tasks/staffing` Staffing view — new page: timeline of who works on what, people/project grouping, drag to create/move/resize, allocation %, tag filters, past scrolling
- [ ] Missing | `help/documentation/staffing.mdx` | `tasks/staffing-bookings` Bookings — person + project + date range with no task name, auto-named across views
- [ ] Missing | `help/documentation/staffing.mdx` | `tasks/staffing-capacity` Workload & capacity — per-person load, remaining capacity, overload indicator
- [ ] Missing | `help/documentation/gantt.mdx` | `tasks/recurring` Recurring tasks — recurrence dialog in the Gantt, series behavior across views (was hidden behind a flag at overhaul time; now shipped)
- [ ] Partial | `help/documentation/gantt.mdx` | `tasks/gantt` — needs: timeline scrolls into the past; cross-link to the new Staffing view (hours/days toggle already documented)
- [ ] Partial | `help/documentation/planning.mdx` | `tasks/views` — needs: Staffing as a third saved-view layout alongside Gantt and Kanban

### People Management

- [ ] Missing | `help/documentation/people.mdx` | `people/validity-period` Person validity period — start/end dates; interaction with the validity-dates entry restriction

### Project Management

- [ ] Missing | `help/documentation/projects.mdx` | `projects/validity-period` Project validity period — start/end dates; interaction with the validity-dates entry restriction

### Work Schedules

- [ ] Partial | `help/documentation/work-schedule.mdx` | `schedules/assignment` — needs: availability split (which schedules an entity may use, "Show all schedules" toggle) vs the dated timeline; delete protection (a schedule still assigned cannot be deleted — lists what it's assigned to)

### Roles & Permissions

- [ ] Missing | `help/documentation/roles-authorisations.mdx` | `roles/assignment-permissions` Granular assignment permissions — who can assign managers, tasks, projects, schedules, time off, expenses, custom fields, tags, validity periods; permission search box

### Custom Fields

- [ ] Partial | `help/documentation/custom-fields.mdx` | `custom-fields/entity-visibility` — needs: fields on absences and absence types
- [ ] Partial | `help/documentation/custom-fields.mdx` | `custom-fields/defaults` — needs: remove **Default value** from the per-type options tables and steps (the product no longer supports default values on custom fields; placeholders remain)

### Organization Settings

- [ ] Partial | `help/documentation/assignments.mdx` | `org/secondary-projects-availability` — needs: per-entity override toggle (all/no secondary projects on a specific project, person, or tag; account-wide default is already documented)

### Reporting

- [ ] Missing | `help/documentation/reports.mdx` | `reports/planning-vs-real` Planned vs. real report — new section: planned effort vs actual timesheet data
- [ ] Missing | `help/documentation/reports.mdx` | `reports/absence-quotas` Absence quota report — new section: quota consumption bars/timeline, drill-down detail sheets
- [ ] Missing | `help/documentation/reports.mdx` | `reports/mobile` Reports on mobile — consult-and-filter experience for phones
- [ ] Partial | `help/documentation/custom-reports.mdx` | `reports/filters` — needs: "is not" exclusion filters; filtering by project/task category (category columns exist, filter semantics don't)
- [ ] Partial | `help/documentation/custom-reports.mdx` | `reports/billing-cost` — needs: verify/add newest columns — recorded start/end times (time-of-day), work-from-home share, activity, expense quantity (hourly/daily rates, markup/margin, overtime, business hours, billable % already documented)
- [ ] Partial | `help/documentation/reports.mdx` | `reports/folders` — needs: "Absence / working time" folder scope; move a report into a folder from its menu
- [ ] Partial | `help/documentation/reports.mdx` | `reports/budget-status` — needs: burn-rate forecast in alerts, drill-down detail sheets, sub-project budgets included when filtering, alerts link to the report

### AI

- [ ] Missing | `help/documentation/ai.mdx` | `time-tracking/suggestions` Suggested time entries — sources (patterns, desktop app, extension, Kanban done), tray + ghost entries, accept/edit/dismiss, privacy
- [ ] Missing | `help/documentation/ai.mdx` | `reports/nl-builder` Natural-language report builder
- [ ] Missing | `help/documentation/ai.mdx` | `approval/digest` Approval review digest — anomaly flags before approving + approver email digest
- [ ] Missing | `help/integrations/ai-assistants.mdx` | `integrations/ai-assistants` AI assistant connections — MCP server, Claude/ChatGPT setup, Connected apps list, permissions model
- [ ] Missing | `help/documentation/ai.mdx` | `ai/privacy` AI privacy stance — Beebole-operated servers, no third-party AI providers

### Journal & Communications

- [ ] Partial | `help/documentation/journal.mdx` | `journal/activity-feed` — needs: timesheet-scoped feed default (approval events + that timesheet's own changes) and the time-record change trail

### Notifications

- [ ] Partial | `help/documentation/notifications.mdx` | `notifications/email` — needs: delivery limited to actual org members (account or valid invitation); archived people excluded

### Companion Apps & Add-ins

- [ ] Missing | `help/documentation/desktop-app.mdx` | `apps/desktop` Desktop app — new page: macOS/Windows/Linux install, what it captures, suggestion flow, download from Connected apps
- [ ] Missing | `help/documentation/browser-extension.mdx` | `apps/browser-extension` Browser extension — new page: Chrome/Edge/Firefox install, API-key connect, per-site opt-in, page-text classification opt-in
- [ ] Partial | `help/documentation/mobile.mdx` | `ui/pwa` — needs: retitle/reword — page is titled "Mobile and Desktop App (PWA)", which now collides with the real desktop app; distinguish PWA install from the new companion desktop app and cross-link

### Integrations

- [ ] Partial | `help/integrations/jira.mdx` | `integrations/jira` — needs: automatic anonymization of removed Jira users' personal data
- [ ] Partial | `help/integrations/quickbooks.mdx` | `integrations/quickbooks` — needs: richer export (billing rate, billable status, comment as description, cross-level matching); disconnect from the QuickBooks side (App Store) with reconnect confirmation; verify menu label after the "QuickBooks Online" → "QuickBooks" rename

### Legacy Migration

- [ ] Partial | `help/documentation/legacy-migration.mdx` | `migration/legacy` — needs: granular selection of what to import with live counts; re-verify the "can only be performed once" claim against the current flow

### UI & User Experience

- [ ] Missing | `help/documentation/concepts.mdx` | `ui/offline-fallback` Fallback-mode indicator — sidebar notice when real-time updates are blocked
- [ ] Missing | `help/documentation/concepts.mdx` | `ui/connection-diagnostics` Connection diagnostics page
- [ ] Partial | `help/documentation/account-settings.mdx` | `ui/multi-language` — needs: the full 10-language list (EN, CS, DE, ES, FR, HU, IT, NL, PL, PT)

_All other sections (Expense Management, Tags, Billing & Cost Tracking, API, Authentication & Security, Subscription & Billing, Audit Trail): all features covered._

---

## Proposed page-mappings additions

- Keywords: `staffing, staffing view, booking, resource planning, capacity, allocation` → proposed page: `help/documentation/staffing.mdx`
- Keywords: `AI, Beebole AI, suggested entries, suggestion, natural language report, approval digest, AI privacy` → proposed page: `help/documentation/ai.mdx`
- Keywords: `MCP, Claude, ChatGPT, AI assistant, connected apps, assistant connection` → proposed page: `help/integrations/ai-assistants.mdx`
- Keywords: `desktop app, activity capture, automatic time tracking` → proposed page: `help/documentation/desktop-app.mdx`
- Keywords: `browser extension, Chrome extension, Firefox extension` → proposed page: `help/documentation/browser-extension.mdx`
- Keywords: `lock date, freeze records, locked period` → proposed page: `help/documentation/timesheetSettings.mdx`
- Keywords: `validity period, valid from, valid until, person start date, project end date` → proposed pages: `help/documentation/people.mdx`, `help/documentation/projects.mdx`
- Keywords: `planned vs real, absence quota report, mobile reports` → proposed page: `help/documentation/reports.mdx`
- Keywords: `recurring task, recurrence, repeat task` → proposed page: `help/documentation/gantt.mdx`
- Keywords: `language, multi-language, localization, interface language` → proposed page: `help/documentation/account-settings.mdx`
- Keywords: `fallback mode, connection diagnostics, offline, blocked connection` → proposed page: `help/documentation/concepts.mdx`
- Keywords: `calendar view, day view, drag entries` → proposed page: `help/documentation/timesheets.mdx`

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (one per line). Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each.

**Nav placement for new pages (approved 2026-08-04 — keep `help/documentation/` flat, organize via `docs.json` groups):**

- `help/documentation/staffing.mdx` → existing **Tasks & Planning** group (after `gantt`/`kanban`)
- `help/documentation/ai.mdx` → new one-page **AI** group (after **Reporting**)
- `help/documentation/desktop-app.mdx`, `help/documentation/browser-extension.mdx` → **Devices** group renamed **Apps & Devices** (alongside `mobile`)
- `help/integrations/ai-assistants.mdx` → Integrations tab, alongside existing integrations

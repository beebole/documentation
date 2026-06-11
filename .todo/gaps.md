# Gaps report

Generated: 2026-06-10
Catalog last updated: 2026-06-10

---

## Coverage gaps → undocumented features

### Section 2: Absence & Time-Off Management

- [x] Missing | `help/documentation/timeoff.mdx` | Archive/unarchive absence types — soft-delete absence types without losing historical data
- [x] Partial | `help/documentation/public-holidays.mdx` | Public holidays — needs: once a calendar is configured, its country is locked to protect holidays in past years (page instead instructs picking a country each year with no mention of the lock)

### Section 3: Time Entries & Absences Approval Workflows

- [x] Partial | `help/documentation/approval.mdx` | Approve / Reject / Request changes — needs: document the "Request changes" action (page only documents Approve and Reject; "changes are requested" is mentioned in passing but never explained as an approver action)
- [x] Partial | `help/documentation/approval.mdx` | Approval reminders — needs: per-person reminder configuration (catalog: "configurable per person or organization"; page only covers org-level settings in Settings > Approval)

### Section 4: Planning & Tasks Management

- [x] Partial | `help/documentation/planning.mdx` | Add task — needs: importing multiple tasks at once from a CSV file (manual creation is covered in Gantt/Kanban pages; bulk import is not documented)
- [x] Missing | `help/documentation/planning.mdx` | Archive/unarchive tasks — soft-delete tasks without losing historical data (Kanban page only documents permanent delete)

### Section 9: Tags & Organisational Structure

- [x] Partial | `help/documentation/tags.mdx` | Add tag — needs: importing multiple tags at once from a CSV file
- [x] Partial | `help/documentation/tags.mdx` | Tag inheritance & configuration — needs: approval stages, public holidays, and absence quotas in the inheritance table (page lists only schedules, billing, cost rates, assignments), plus multi-tree composition (a person in multiple independent tag trees whose configurations compose)

### Section 11: Work Schedules

- [ ] Missing | `help/documentation/work-schedule.mdx` | Archive/unarchive work schedules — soft-delete schedules without losing historical data

### Section 15: Reporting

- [ ] Missing | `help/documentation/custom-reports.mdx` | Matrix report — grid visualisation with entities or calendar periods on each axis, hours/billing/costs per cell, optional heat-map overlay, one-click row/column swap
- [ ] Partial | `help/documentation/reports.mdx` | Budget status report — needs: progress-bar view with actuals, forecast bars, hierarchy roll-up, and automatic alerts at threshold/over-budget (page only lists a "Budget progress" built-in report row)

### Section 18: Integrations

- [x] Missing | `help/integrations/xero.mdx` | Xero — import Xero contacts and items as Beebole project structure, keep them in sync, and export time records to Xero as invoices (page does not exist)

### Section 24: UI & User Experience

- [x] Missing | `help/documentation/concepts.mdx` | Fast loading — data is cached locally for near-instant page loads

_(Tooltips, toast notifications, and breadcrumb gaps dropped at Checkpoint 1 — generic UI affordances, curator decision 2026-06-10.)_

---

## Proposed page-mappings additions

- Keywords: `xero, xero contacts, xero items, invoice export` → proposed page: `help/integrations/xero.mdx`
- Keywords: `matrix report, matrix, grid report, heat map report, row column swap` → proposed page: `help/documentation/custom-reports.mdx`
- Keywords: `budget status report, budget progress, budget alert, forecast bar, budget threshold` → proposed page: `help/documentation/reports.mdx`
- Keywords: `api, graphql, developer API, API consumer` → proposed page: `help/api/introduction.mdx`
- Keywords: `fast loading, local cache, caching, performance` → proposed page: `help/documentation/concepts.mdx`
- Keywords: `tooltip, toast, breadcrumb, in-app feedback` → proposed page: `help/documentation/concepts.mdx`
- Keywords: `profile picture, avatar, crop tool` → proposed page: `help/documentation/account-settings.mdx`
- Keywords: `archive absence type, archive schedule, archive task, unarchive` → proposed page: `help/documentation/timeoff.mdx`, `help/documentation/work-schedule.mdx`, `help/documentation/planning.mdx`
- Keywords: `CSV import, bulk import, import tasks, import tags` → proposed page: `help/documentation/planning.mdx`, `help/documentation/tags.mdx`

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (one per line). Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each.

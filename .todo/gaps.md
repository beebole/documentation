# Gaps report

Generated: 2026-08-17
Catalog last updated: 2026-08-17

---

## Coverage gaps → undocumented features

All gaps this run are **Partial** — every feature maps to an existing page; the pages predate the 2026-08-11/13/16 production deploys.

### Reporting

- [ ] Partial | `help/documentation/reports.mdx` | Revenue at Risk report — needs: new section — hourly/daily-billed projects with an end date, unconsumed budgeted hours projected to the end date and converted to revenue at risk, portfolio totals, skipped projects (no end date / mixed currencies)
- [ ] Partial | `help/documentation/reports.mdx` | Billable utilization report — needs: new section — billable hours ÷ scheduled capacity per person per month, capacity net of time off, next-month projection from planned bookings, export
- [ ] Partial | `help/documentation/reports.mdx` | Timesheet compliance report — needs: new section — person × period grid of on-time/late/missed submissions, per-person score, hover details, filters, last-6-months default, dedicated permission (managers see their people)
- [ ] Partial | `help/documentation/reports.mdx` | Planned vs. real report update — needs: five measures (hours, days, billing, cost, margin), several plans at once, cumulative vs remaining views, ideal line, forecast, pace headline (Behind / On track / Ahead), time over/under plan per person

### Time Tracking

- [ ] Partial | `help/documentation/timesheets.mdx` | Calendar view update — needs: Favorites bar (pin and drop favorites, click to create with learned start time/duration), drag opens full entry popup, group selection (shift/⌘-click, batch move/duplicate/resize/delete, single undo), one activity per entry
- [ ] Partial | `help/documentation/timesheetSettings.mdx` | Auto Timesheet from Planning — needs: new "Auto Timesheet from planning" option alongside the Kanban statuses flow; panel renamed "Timesheet and Planning Settings"; new restriction keeping start/end times inside scheduled hours (warn or block)

### Planning, Tasks & Staffing

- [ ] Partial | `help/documentation/planning.mdx` | Plannings rename — needs: task categories are now called "Plannings" in the app (sidebar area is "Planning"); update labels like "Name of a new plan" → current UI wording; unassigned task warnings (days-before setting, email to everyone involved)
- [ ] Partial | `help/documentation/staffing.mdx` | Staffing update — needs: dependency links drawn and draggable in Staffing (no longer Gantt-only), unassigned row, move bookings between rows to reassign, tentative bookings, allocation as %/hours-per-day/total, capacity finder with forward ranges, fixed-period view, copy previous period, multi-select operations
- [ ] Partial | `help/documentation/gantt.mdx` | Gantt update — needs: fixed-period view (week/month/quarter/year), multi-select drag/copy/resize, cut-off bars with jump chevrons, filters button, rich hover tooltip

### Companion Apps

- [ ] Partial | `help/documentation/desktop-app.mdx` | Opt-in tracking — needs: tracking is off until explicitly enabled, explainer card after first hour, pause/stop from menu bar/tray icon, tracking status on the Beebole AI page

### Roles & Permissions

- [ ] Partial | `help/documentation/roles-authorisations.mdx` | Role targets reorganisation — needs: verify targets table against the new managed-vs-colleagues split (managed projects/tasks/people vs colleagues; tasks you own vs tasks you manage); timesheet-compliance report permission

### Absence & Time-Off

- [ ] Partial | `help/documentation/public-holidays.mdx` | Country unlock — needs: calendar country/region can be changed at any time (no longer locked once loaded), year dropdown covers two years back / three ahead

---

## Proposed page-mappings additions

- Keywords: `revenue at risk, unconsumed hours, budget hours at risk` → proposed page: `help/documentation/reports.mdx`
- Keywords: `utilization, billable utilization, scheduled capacity` → proposed page: `help/documentation/reports.mdx`
- Keywords: `timesheet compliance report, compliance grid, late submission` → proposed page: `help/documentation/reports.mdx`
- Keywords: `auto timesheet, automatic timesheet, autopilot, auto timesheet from planning` → proposed page: `help/documentation/timesheetSettings.mdx`
- Keywords: `unassigned task, untaken task, unassigned warning` → proposed page: `help/documentation/planning.mdx`
- Keywords: `favorites, favorites bar, pinned favorites` → proposed page: `help/documentation/timesheets.mdx`

---

## Handoff to /write

No **Missing** entries this run — `/write` (no args) has nothing to draft. All 12 entries are **Partial**: run `/write <path>` per entry with its `needs:` note (the `/release` pipeline does this automatically).

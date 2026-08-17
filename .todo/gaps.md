# Gaps report

Generated: 2026-08-17 (verification pass, release run)
Catalog last updated: 2026-08-17

---

## Coverage gaps → undocumented features

_All features covered._

Every entry in the catalog's user-facing sections maps to a documentation page and is classified **Covered**. The 12 Partial entries from this run's earlier report (2026-08-11/13/16 production deploys) were all resolved in the same run:

- Three new report sections (Revenue at Risk, Utilization, Timesheet Compliance) and the Planned vs. Real rewrite — `reports.mdx`
- Calendar-view favorites, group editing, one-activity rule — `timesheets.mdx`
- Auto Timesheet from Planning, panel rename, scheduled-hours restriction, unassigned-task warnings — `timesheetSettings.mdx`
- Plannings rename — `planning.mdx` (plus `kanban.mdx`, `gantt.mdx`, `staffing.mdx`, `assignments.mdx`, guides, and panel-name references site-wide)
- Staffing dependencies, unassigned row, tentative bookings, capacity finder, period lock, copy previous period — `staffing.mdx`
- Gantt fixed periods, multi-select, cut-off bars, filters, rich tooltips — `gantt.mdx`
- Opt-in tracking — `desktop-app.mdx`
- Role-target rename (managed vs colleagues, owned vs managed tasks) and the two new report permissions — `roles-authorisations.mdx`
- Public-holiday country unlock — `public-holidays.mdx`

**Intentionally undocumented (status-flagged in the catalog — not gaps):**

- `tasks/recurring` — _(status: hidden-flag)_ recurrence creation still behind `SHOW_TASK_RECURRENCE = false`; do not document until creation ships.
- `org/gdpr` — _(status: placeholder-ui)_ the Export your data / GDPR menu entries are inert; deliberately not documented.
- `absence/accrual` — _(status: partial)_ documented hedged on `accruals.mdx` (manual **Accrued** adjustments only); un-hedge when the awarding engine ships.

**Skipped sections:** Planned Features (8 entries), Internal (11 entries) — per skill rules.

---

## Proposed page-mappings additions

_No new mappings needed._ (Six rows were added earlier in this run for the new reports, auto timesheet, unassigned tasks, and favorites.)

---

## Handoff to /write

Nothing to draft. Next `/sync-features --incremental` after the next prod deploy will surface new work; re-run `/find-gaps` after it.

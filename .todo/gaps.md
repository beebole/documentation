# Gaps report

Generated: 2026-08-31 (verification pass, release run)
Catalog last updated: 2026-08-31

---

## Coverage gaps → undocumented features

_All features covered._

The 13 Partial entries from this run's earlier report (2026-08-30 production deploy) were all resolved in the same run:

- Task start and end times — new **Giving a task hours** section on `gantt.mdx`, cross-referenced from `planning.mdx` and `staffing.mdx`
- Staffing bars for timed tasks drawn on the real clock with non-working stretches hatched — `staffing.mdx`
- Timeline window of 1/2/3/4/6 weeks with period paging — `gantt.mdx` + `staffing.mdx`
- **Copy the previous period** filling every empty period back to the last with bookings — `staffing.mdx`
- Multi-select delete of bookings and tasks — `staffing.mdx` + `gantt.mdx`
- Task color inherited from project, owner, or parent task — `planning.mdx`
- Owned dated tasks arriving as suggestions instead of auto-added rows — `planning.mdx`
- Calendar as the default timesheet view — `timesheets.mdx`
- Timer started from a calendar entry, a favorite chip, or a suggestion — `timesheets.mdx` + `ai.mdx`
- Planned forecast cards on future days, entity-aware suggestion cards, favorite-drop retargeting, undoable accept/edit/dismiss — `ai.mdx`
- Force-edit no longer admin-only, with both restrictions spelled out — `approval.mdx`
- Allowance fields stating their unit; **Available**/**Consumed**/**Accrued** at the top of the card — `timeoff.mdx`
- Report folder record scope (**Absence/working time**) — `reports.mdx`
- Asana sync robustness (archive-on-delete, deduplicated deliveries, rate-limit retry, real error messages, toggle no longer stuck) — `asana.mdx`

Corrections applied in the same run, found against prod code rather than reported as gaps:

- **Period lock options were wrong** on both `gantt.mdx` and `staffing.mdx` (documented as week/month/quarter/year; the app offers **Infinite by day**, **Infinite by week**, **Week**, **2 weeks**, **3 weeks**, **4 weeks**, **6 weeks**). Fixed in the body and in the Gantt FAQ.
- **Stale toast label** on `staffing.mdx`: "The previous period has no bookings to copy" → **No earlier bookings to copy**.
- **Paid vs. unpaid absences removed** from `timeoff.mdx`, `costs.mdx`, and `bamboohr.mdx` — the **Is paid (included in people costs)** checkbox is suppressed on production hosts, so the documented steps could not be followed. Replaced with an accurate description of how time off is valued in people costs.
- Two broken in-page anchors on `custom-reports.mdx` (`#report-dimensions`, `#filtering-your-report`) repointed to the headings that exist.

**Intentionally undocumented (status-flagged in the catalog — not gaps):**

- `org/configuration-export` **Master data review** — _(status: hidden-flag)_ Settings entry suppressed on production hosts, despite appearing in the 2026-08-30 production note.
- `absence/cost-tracking` — _(status: hidden-flag)_ the per-type cost checkbox is suppressed in production; the resulting behavior is documented, the control is not.
- `tasks/recurring` — _(status: hidden-flag)_ recurrence creation still behind `SHOW_TASK_RECURRENCE = false`.
- `org/gdpr` — _(status: placeholder-ui)_ inert menu entries.
- `absence/accrual` — _(status: partial)_ documented hedged on `accruals.mdx`.
- `reports/schedule-email` — _(status: hidden-flag)_ **Schedule** action gated off in production builds.
- `reports/money-authorisations` — Planned-section entry _(status: partial — frontend guard only)_.

---

## Proposed page-mappings additions

_No new mappings needed — the three proposed this run were applied to `page-mappings.md`._

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (one per line). Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each.

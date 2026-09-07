# Gaps report

Generated: 2026-09-07 (verification pass — 2026-09-07 release run)
Catalog last updated: 2026-09-07

Scope note: this is the **verification pass** of the 2026-09-07 release run. It re-opened every entry listed in the earlier report of this run (2 Missing, 24 Partial) and checked the mapped page text for the capability named in its `needs:` note. Catalog format guard passed (27 sections, 286 bullets); catalog freshness 0 days. Entries carrying a `_(status: …)_` suffix, plus everything under **Planned Features** and **Internal (Non User-Facing)**, were excluded from classification.

Result: **26 of 26 previous entries Resolved. 0 previous entries still open.** Two new factual defects were found on pages that were not previous-run entries; both are listed below.

---

## Verification of the previous run's entries

### Time Tracking

- Resolved | `help/documentation/timesheets.mdx` | Timer — multiple timers via ⌘/Ctrl-click, floating shelf with per-activity lines and **Pause all**, browser tab title, and the "only one timer" contradiction removed.
- Resolved | `help/documentation/timesheets.mdx` | Timesheet calendar view — one-click empty slot pre-filled with the day's missing time, ⌘ whole-hour snap, untimed entry adopting the drop time, shared day headers with schedule totals and progress bars.
- Resolved | `help/documentation/timesheetSettings.mdx` | Lock date — locked period cannot be submitted, with the exact message.
- Resolved | `help/documentation/timesheetSettings.mdx` | Auto-submit — single most-recent overdue period only; empty periods never submitted.
- Resolved | `help/documentation/timesheetSettings.mdx` | Time entry restrictions — validity dates, time-off quota balance, all-or-nothing bulk delete validation.

### Approval Workflows

- Resolved | `help/documentation/approval.mdx` | Email actions — reply with approve / reject + reason, sender and mail-server verification, receipt in thread, buttons landing on the acted-on timesheet.
- Resolved | `help/documentation/approval.mdx` | Team approval overview — bulk **Approve** / **Reject** / **Remind** scoped to applicable people and strictly to the period on screen.
- Resolved | `help/documentation/approval.mdx` | Force-edit a team member's timesheet — highlight tint across grid, calendar, and pickers, tied to one person.

### Planning, Tasks & Staffing

- Resolved | `help/documentation/task-list.mdx` | Task list view — new 219-line page covering sorting, column reorder/resize, in-place editing, ⌘/Shift multi-row single-undo mass edits; in `docs.json` under **Tasks & Planning**.
- Resolved | `help/documentation/gantt.mdx` | Gantt chart view — in-place column editing, ⌘/Shift selection mass edits, header-cell zoom, month boundary line and pill, off-screen **Show in the chart** arrow.
- Resolved | `help/documentation/gantt.mdx` | Gantt column customization — reorder, resize, three-state header sort, sort-plus-grouping with sequence numbers replacing drag handles.
- Resolved | `help/documentation/gantt.mdx` | Task dependencies — handle drag, ⌘-chaining, line routing around bars and group headers, rescheduling onto the owner's working calendar with planned hours preserved. The duplicate **Dependent tasks movement options** location is gone; it now lives only under "How dependent tasks move".
- Resolved | `help/documentation/staffing.mdx` | Staffing view — part-day clock drag with quarter-hour snap over breaks, whole-day movement once the pointer leaves the cell, ⌘-drag copy landing after its source, **Lowest level** project grouping, period-scoped Unassigned count.

### Project Management

- Resolved | `help/documentation/projects.mdx` | Hierarchical projects — "Only the lowest level accepts time" section, with the refusal message and the same rule stated for tasks.

### Roles & Permissions

- Resolved | `help/documentation/assignments.mdx` | Availability controls — **Record time on these plannings** documented on `assignments.mdx` with save-time enforcement following the timesheet's owner, and linked from `roles-authorisations.mdx`.

### Custom Fields

- Resolved | `help/documentation/custom-fields.mdx` | Entity visibility — **Visible for Absence types** added to the creation Steps and correctly described as applying to absences of that type; time-record fields follow the timesheet's owner across every link.

### Organization Settings

- Resolved | `help/documentation/master-data.mdx` | Master data review — new 214-line page covering entity picker, column building with nested search and sibling picker, custom field columns, filters/archived/period, saved personal reviews, inherited-value origin, struck-through subtractions, entity badges, JSON/CSV/TSV/Excel/PDF export, plain-language build, update mode with before/after preview, skipped rows with reasons, single undo; in `docs.json` under **Configuration**.

### Reporting

- Resolved | `help/documentation/reports.mdx` | Budget status report — instant filter/sort/archived, hierarchy-wide project and tag filters, sort at every level, exactly-100% counts as on budget, split-by-project actuals without double-counting, and "no setting to switch on". `budgets.mdx` now states plainly that budget notifications are not available.
- Resolved | `help/documentation/custom-reports.mdx` | Report filters — project/tag/category filters covering subtrees and task-linked time, tag hierarchy and tagged-parent subtree, project category and planning filter types, **is not** exclusions.
- Resolved | `help/documentation/data-exports.mdx` | Report downloads — Excel widths measured from every row, PDF embedded font coverage, landscape + first-column repeat across pages, explicit failure message.

### Billing & Cost Tracking

- Resolved | `help/documentation/costs.mdx` | Rate splits — the split type and its badges are shown in the rate card summary.

### AI

- Resolved | `help/documentation/ai.mdx` | Suggested time entries — "Suggestions for a task you cannot book" section, **Log this time as**, the kept link to the planned task for Planned vs. Real, and **Accept all** skipping them.
- Resolved | `help/documentation/ai.mdx` | Natural-language report builder — organization vocabulary, custom field grouping, clarifying question instead of guessing, definitions-only request.
- Resolved | `help/documentation/ai.mdx` | AI privacy stance — self-hosted Beebole models in your data region, nothing to a third-party provider, figures computed by Beebole's engine.
- Resolved | `help/integrations/mcp-server.mdx` | AI assistant connections — full grouped tool table, "covers the main ones rather than every tool" replacing the completeness implication, OAuth 2.1 named.

### Legacy Migration

- Resolved | `help/documentation/legacy-migration.mdx` | Legacy account migration — rewritten around the support-run import: no in-app Steps, no phases list, no API-key prerequisites, no tool FAQ. Adds rate splits and currency fallback, clock times, "Specific tasks", custom field history, approved-and-locked history, lock date at the last imported day, scores ignoring pre-import periods. `help/guides/migration.mdx` now says migrations are run by support, "not by a tool in the app", in both the transition list and the FAQ.

---

## Release-specific confirmations

| Check | Result |
| --- | --- |
| `task-list.mdx` and `master-data.mdx` exist, substantial, in `docs.json` | Pass — 219 and 214 lines; `docs.json:109` (Tasks & Planning) and `docs.json:157` (Configuration) |
| **List** view in every Planning-views enumeration | Pass — `planning.mdx`, `gantt.mdx`, `staffing.mdx`, `kanban.mdx` all read "four views" and link `/help/documentation/task-list`; `planning.mdx` **Add a view** list and the Related-content cards include it |
| No self-service migration tool, Legacy API Key, or "coming soon" tool | Pass — no match anywhere in `help/**` outside the frozen `help/legacy/` archive. The two remaining "coming soon" strings in `migration.mdx` (~126, ~162) are about accruals and expense budget impact, not migration |
| No configurable budget threshold alerts / push notifications / **Is paid** absence checkbox | Mostly pass — no page offers a budget-alert or push-notification setting, and `timeoff.mdx` states explicitly there is no per-type cost switch. Two residual defects below |

---

## Coverage gaps → undocumented features

### Billing & Cost Tracking

- [ ] Partial | `help/documentation/costs.mdx` | Time off in people costs — needs: the **Time Off** related-content card (~126) reads "Configure absence types, including whether paid leave counts toward people costs", which offers a setting that is suppressed on production hosts (`absence/cost-tracking`, hidden-flag) and contradicts `timeoff.mdx` (~131). Reword to point at time off types without implying a paid/unpaid cost switch.

### News

- [ ] Partial | `help/news/releases.mdx` | Budget status report — needs: the entry at ~158 ("[Budget alerts](/help/documentation/budgets) now include a burn-rate forecast that warns you when current spending is on track to exceed a budget") presents budget alerts as a live feature, while `reports/budget-status` records the alert notifications as hidden-flag and both `budgets.mdx` and `reports.mdx` now say there is nothing to switch on. Recast the entry around the Budget Status report's forecast bar.

**Intentionally undocumented (status-flagged in the catalog — not gaps):** `absence/cost-tracking` (hidden-flag — **Involve costs** suppressed in production), `absence/accrual` (partial — awarding engine not implemented; hedged on `accruals.mdx`), `tasks/recurring` (hidden-flag), `org/gdpr` (placeholder-ui), `reports/schedule-email` (hidden-flag), `notifications/web-push` (hidden-flag — **Push notifications** channel suppressed in production, flagged 2026-09-07), budget threshold alert notifications inside `reports/budget-status` (hidden-flag, flagged 2026-09-07 — the report itself is fully live and documented), `reports/money-authorisations` (Planned, partial).

**Excluded by the skill (Planned Features / Internal):** `time-tracking/attendance`, `auth/ms365-provisioning`, `integrations/quickbooks-export-precheck`, `internal/server-maintenance`, `internal/worktree-switcher`. These are new in the 2026-09-07 catalog but sit in the two skipped sections — do not treat their absence from `help/**` as a gap.

---

## Proposed page-mappings additions

_No new mappings needed._ Both rows proposed by the earlier pass of this run are now present in `.claude/context/page-mappings.md` (lines 94-95): the List view row and the Master data review row.

---

## Handoff to /write

No **Missing** entries remain, so `/write` with no arguments has nothing to draft. The two **Partial** entries above are single-sentence factual corrections rather than content gaps — hand each to `/write <path>` with the note as written, or fold them into the next release's review step.

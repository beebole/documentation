# Gaps report

Generated: 2026-09-07 (release run)
Catalog last updated: 2026-09-07

Scope note: the previous verification pass (2026-08-31) found every catalog entry covered, and no `help/**` page changed since except a wording tweak on `ai.mdx`. This pass therefore classified the entries the 2026-09-07 catalog sync added or changed (production deploys 2026-09-01 and 2026-09-06) against their mapped pages; unchanged entries keep their Covered status.

---

## Coverage gaps → undocumented features

### Time Tracking

- [ ] Partial | `help/documentation/timesheets.mdx` | Timer — needs: several timers at once via ⌘/Ctrl-click on any play button; floating timer as a shelf with one line per activity, live counter, play to resume a paused one, pause-all; browser tab title shows elapsed time or timer count. Fix contradiction at line ~121 ("Only one timer runs at a time").
- [ ] Partial | `help/documentation/timesheets.mdx` | Timesheet calendar view — needs: click an empty slot inserts an entry pre-filled with the day's remaining scheduled time; ⌘ while dragging an edge snaps to whole hours; dropping an untimed entry adopts the clock time where released; calendar shares the grid's day headers, schedule totals, and progress bars.
- [ ] Partial | `help/documentation/timesheetSettings.mdx` | Lock date — needs: a period whose last day is on or before the lock date can no longer be submitted ("This period is locked").
- [ ] Partial | `help/documentation/timesheetSettings.mdx` | Auto-submit — needs: only the single period whose deadline has passed is submitted; empty periods are never auto-submitted.
- [ ] Partial | `help/documentation/timesheetSettings.mdx` | Time entry restrictions — needs: keep entries within a project's or person's validity dates; limit time-off bookings to the available quota balance; deleting several entries validates every entry first (one locked/invalid entry stops the whole deletion).

### Approval Workflows

- [ ] Partial | `help/documentation/approval.mdx` | Email actions — needs: reply to the approval email with "approve" or "reject <reason>", sender verification, confirmation email back; email buttons land on the timesheet they acted on.
- [ ] Partial | `help/documentation/approval.mdx` | Team approval overview — needs: bulk **Approve** / **Reject** / **Remind** in the **Team** pane acting only on the people they apply to (locked people never reminded) and strictly on the period on screen.
- [ ] Partial | `help/documentation/approval.mdx` | Force-edit a team member's timesheet — needs: consistent highlight tint across grid, calendar, and pickers while in override mode, tied to the chosen person.

### Planning, Tasks & Staffing

- [ ] Missing | `help/documentation/task-list.mdx` | Task list view — sortable, spreadsheet-like table sharing the Gantt's rows, columns, grouping, and expansion; click a header to sort (row numbers return to manual order); drag to reorder and resize columns; in-place editing of owner, status, dates, Planned, occupation, potential owners, tags, and each project category; ⌘/Ctrl-click or Shift-click multi-row selection for single-undo mass edits. Also add **List** to every "three views" enumeration: `planning.mdx` (~14, ~189, ~191-203), `gantt.mdx` (~11, ~22, ~218-228), `staffing.mdx` (~11, ~14, ~179-192), `kanban.mdx` (~11, ~22); add the page to `docs.json` next to Gantt/Kanban/Staffing.
- [ ] Partial | `help/documentation/gantt.mdx` | Gantt chart view — needs: in-place editable task cells (Planned, occupation, status, owner, period, projects, tags, access); ⌘/Ctrl-click and Shift-click row/range selection for mass edits as one undo step; click a timeline header cell to zoom one level into that period; month boundary line and label; arrow next to an off-screen task's dates that jumps to its bar.
- [ ] Partial | `help/documentation/gantt.mdx` | Gantt column customization — needs: drag to reorder columns; resize every column; click a header to sort ascending / descending / back to manual order; sorting and grouping work together (rows show sequence numbers instead of drag handles while sorted).
- [ ] Partial | `help/documentation/gantt.mdx` | Task dependencies — needs: draw a link by dragging the handle on a task bar onto another task (⌘ on drop to chain several); lines route around bars and group headers; dependants rescheduled against their owners' working calendars; a drag the owner's calendar cannot absorb leaves the task in place and keeps Planned hours. Reconcile the two locations given for **Dependent tasks movement options** (~109 vs ~240).
- [ ] Partial | `help/documentation/staffing.mdx` | Staffing view — needs: part-day booking dragged within its day follows the pointer on that day's clock (quarter-hour snap, steps over breaks) and moves by whole days once the pointer leaves the cell; ⌘-drag copy inside the same cell drops right after its source; project grouping shows leaf projects only; Unassigned row counts only bookings visible in the period.

### Project Management

- [ ] Partial | `help/documentation/projects.mdx` | Hierarchical projects — needs: only leaf projects accept time entries; a parent project aggregates its children and cannot be recorded against (same rule as parent tasks).

### Roles & Permissions

- [ ] Partial | `help/documentation/roles-authorisations.mdx` | Availability controls — needs: per-person **Record time on these plannings** restriction and its enforcement on save, not only in the pickers (place on `assignments.mdx` if that is where availability lives, and link from roles).

### Custom Fields

- [ ] Partial | `help/documentation/custom-fields.mdx` | Entity visibility — needs: a field assigned to an absence type is asked only on absences of that type (fix ~108, which describes them as data about the types themselves); time-record fields follow the person the timesheet belongs to and honour assignments made through people, tags, projects, tasks, and absence types; the first creation Steps block (~21-37) omits **Visible for Absence types**.

### Organization Settings

- [ ] Missing | `help/documentation/master-data.mdx` | Master data review — Settings screen (now live in production): pick an entity (people, projects, tasks, tags, time off types, expense types, custom fields, roles, work schedules); build columns by walking fields and relations, with nested search showing match paths and "Other … column" to pick a sibling field; custom field values as columns (only applicable fields offered); filters, archived records, period; saved personal reviews; inherited-value origin with source link; readable labels (durations, colours, units, formats, days, authorisations), struck-through subtracted values; clickable entity badges; live re-run; download as JSON, CSV, TSV, Excel, PDF; plain-language build/refine; update mode (set or clear a value or custom field, add text around existing values) with before/after preview, skipped rows with reasons, single undo. Add to `docs.json` under Documentation near account-settings.

### Reporting

- [ ] Partial | `help/documentation/reports.mdx` | Budget status report — needs: filter, sort, and archived toggle apply instantly; project and tag filters cover the whole hierarchy; sort applies at every level; a budget consumed exactly to 100% counts as on budget; split-by-project lines show real actuals for descendant projects without double-counting; alerts are off by default. Fix `budgets.mdx` (~91-96, FAQ ~131-133), which presents alerts as active out of the box.
- [ ] Partial | `help/documentation/custom-reports.mdx` | Report filters — needs: project / project-tag / project-category filters also include time logged on tasks linked to those projects; tag filters cover descendant tags and the subtree of a tagged parent project; project category and task category filter types; "is not" exclusions.
- [ ] Partial | `help/documentation/data-exports.mdx` | Report downloads — needs: Excel column widths sized from every row; PDF renders accented, Cyrillic, Greek, and currency characters; wide PDF tables split across pages with the first column repeated; clear message when an export cannot be produced.

### Billing & Cost Tracking

- [ ] Partial | `help/documentation/costs.mdx` | Rate splits — needs: the split (person or project) is shown directly in the rate card summary.

### AI

- [ ] Partial | `help/documentation/ai.mdx` | Suggested time entries — needs: a suggestion for a task you may not book stays visible with the planned task for context; accepting it asks you to pick the project while keeping the link to the planned task for Planned vs. Real; **Accept all** skips these.
- [ ] Partial | `help/documentation/ai.mdx` | Natural-language report builder — needs: understands your vocabulary ("by client", "per cost centre" group on that hierarchy level); group by a custom field's values; asks a clarifying question instead of guessing (e.g. tag-based grouping); only the question, report structure, and category/custom field names reach the model, numbers come from Beebole's engine.
- [ ] Partial | `help/documentation/ai.mdx` | AI privacy stance — needs: only definitions are sent (question, report or review structure, category and custom field names), never time records, values, or entity names; self-hosted models on firewalled Beebole infrastructure in your data region; keys and data never touch a browser or an external AI API.
- [ ] Partial | `help/integrations/mcp-server.mdx` | AI assistant connections — needs: the expanded toolset — organisation context (vocabulary, periodicity, rules), read/set rates, set custom field values, assign/unassign, update/copy/move/delete time entries, timesheet days and status, submit, absence balances, expenses, team timesheets and reminders, approve/reject and approval history, planning tasks, suggestions, budget status, audit trail, plain-language reports; soften "a full working toolkit" (~21) which implies the five-row table is complete; name OAuth 2.1.

### Legacy Migration

- [ ] Partial | `help/documentation/legacy-migration.mdx` | Legacy account migration — needs: rewrite around support-run migration (the self-service **Legacy Migration** tool was removed from Settings in September 2026): remove the in-app Steps (~55-86), phases list (~90-112), API-key prerequisites (~44-53) and tool-based FAQ (~138-154); add what is migrated (rates with per-subproject splits, currency fallback to the account's currency, clock-in/out times, "Specific tasks" as per-project activity restrictions, custom field history), history approved and locked at cut-over, lock date set to the last imported day, timesheet scores ignoring pre-import periods. Also update `help/guides/migration.mdx` (~32-34, ~41, ~48, ~231-233, ~240), which still announces the self-service tool as "coming soon".

**Intentionally undocumented (status-flagged in the catalog — not gaps):** `absence/cost-tracking` (hidden-flag), `tasks/recurring` (hidden-flag), `org/gdpr` (placeholder-ui), `absence/accrual` (partial, hedged on `accruals.mdx`), `reports/schedule-email` (hidden-flag), `reports/money-authorisations` (Planned, partial).

---

## Proposed page-mappings additions

- Keywords: `list view, task list, table view, sortable tasks, spreadsheet view` → proposed page: `help/documentation/task-list.mdx`
- Keywords: `master data, master data review, bulk update, configuration review, review master data` → proposed page: `help/documentation/master-data.mdx`

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (one per line). Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each.

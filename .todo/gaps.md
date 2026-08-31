# Gaps report

Generated: 2026-08-31 (release run)
Catalog last updated: 2026-08-31

---

## Coverage gaps → undocumented features

Every gap in this run comes from the 2026-08-30 production deploy. All of them attach to
pages that already exist, so they are Partial (a section to add or correct), not Missing.

### Planning, Tasks & Staffing

- [ ] Partial | `help/documentation/gantt.mdx` | `tasks/hours` Task start and end times — needs: new section on giving a task exact hours (uncheck **All day** in the task date panel, times pre-filled from the owner's working hours), how dragging/resizing/splitting/copying keep the hours, how typing **Planned hours** reflows a timed task minute by minute around breaks, days off and time off, and how times outside the owner's working hours are highlighted with the reason
- [ ] Partial | `help/documentation/planning.mdx` | `tasks/hours` Task start and end times — needs: mention in the task-dates overview that a task can carry hours as well as dates, linking to the Gantt page for the detail
- [ ] Partial | `help/documentation/staffing.mdx` | `tasks/staffing` Staffing refinements — needs: bars for timed tasks drawn at their real clock position inside the day column with non-working stretches hatched; the fixed window now also takes 1, 2, 3, 4 or 6 weeks and pages one period at a time; **Copy the previous period** looks back to the last period that actually holds bookings and fills every empty period in between; select several bookings and press Delete to remove them in one undoable batch
- [ ] Partial | `help/documentation/gantt.mdx` | `tasks/gantt` Timeline window — needs: the fixed window also takes a set number of weeks (1, 2, 3, 4, 6) and pages one period at a time
- [ ] Partial | `help/documentation/planning.mdx` | `tasks/colour` Task colour inheritance — needs: a task takes its colour from its project, owner, or parent task rather than getting one of its own, and shows that colour everywhere
- [ ] Partial | `help/documentation/planning.mdx` | `tasks/ownership` Owned dated tasks — needs: tasks you own with dates are no longer added to your timesheet as rows automatically; they arrive as suggestion cards and stay listed first in the add-task picker

### Time Tracking

- [ ] Partial | `help/documentation/timesheets.mdx` | `time-tracking/calendar-view` Calendar as default — needs: the calendar is now the default timesheet view for everyone (the page still says Beebole remembers your last view), the day grid is taller, and a full day fills its column exactly to the end of your schedule
- [ ] Partial | `help/documentation/timesheets.mdx` | `time-tracking/timer` Timer entry points — needs: start or pause a timer from a calendar entry (hover for play/pause, pulsing red dot on the recording entry, duration ticking up in place) and from a favourite chip; the current section only covers the row timer button

### AI

- [ ] Partial | `help/documentation/ai.mdx` | `time-tracking/suggestions` Suggestion handling — needs: planned staffing shows on future days as read-only forecast cards that become actionable on the day; reopening a draft or rejected past week regenerates its planned suggestions; cards carry the project or task picture and colour, and calendar entries show a ring comparing logged time against planned hours; dropping a favourite onto a suggestion retargets and accepts it; a play button accepts a suggestion and starts its timer in one step; accepting, editing and dismissing are all undoable

### Approval Workflows

- [ ] Partial | `help/documentation/approval.mdx` | `approval/force-edit` Force-edit a team member's timesheet — needs: managers and approvers (not only admins) can open and edit a team member's timesheet from the **Approval** and **Team** panes; stage rules still apply — locked once approved, and the **Only an admin can edit someone else's timesheet** restriction still wins when it is on

### Absence & Time-Off Management

- [ ] Partial | `help/documentation/timeoff.mdx` | `absence/cost-tracking` Paid vs. unpaid absences — needs: **correction.** The **Is paid (included in people costs)** checkbox is suppressed on production hosts (`isProduction()` in `absence-type-unit.ts`, deliberate since 2026-06-23), so the documented step cannot be followed. Remove or hedge the "Paid vs. unpaid absences" section and its step, and the matching passages in `costs.mdx` (body + FAQ)
- [ ] Partial | `help/documentation/timeoff.mdx` | `absence/balance-tracking` Allowance units — needs: every allowance field (available, accrued, carry-forward limit, consumed) states its own unit in the input and in the card summary; **Available**, **Consumed** and **Accrued** now sit at the top of the card

### Reporting

- [ ] Partial | `help/documentation/reports.mdx` | `reports/folder-sharing` Folder settings — needs: a folder carries a third setting alongside period and filters — the **Absence / working time** record scope — applied to every report inside it

### Integrations

- [ ] Partial | `help/integrations/asana.mdx` | `integrations/asana` Sync robustness — needs: deleting an Asana project or task that already has time logged archives it in Beebole instead of failing; repeated deliveries no longer create duplicates; tasks moved between projects keep syncing; rate limits are retried and Asana errors report the real reason; enabling or disabling no longer leaves the switch stuck on "updating"

---

## Proposed page-mappings additions

- Keywords: `task hours, task start time, task end time, all day task, timed task` → proposed page: `help/documentation/gantt.mdx`
- Keywords: `calendar timer, play button, start timer from calendar, favourite timer` → proposed page: `help/documentation/timesheets.mdx`
- Keywords: `forecast card, planned forecast, undo suggestion, retarget suggestion` → proposed page: `help/documentation/ai.mdx`

---

## Intentionally undocumented (status-flagged in the catalog — not gaps)

- `org/configuration-export` **Master data review** — _(status: hidden-flag)_ Settings entry suppressed on production hosts; announced in the 2026-08-30 production note but not reachable by users. Do not document, do not announce.
- `absence/cost-tracking` — _(status: hidden-flag)_ newly flagged this run; see the correction entry above.
- `tasks/recurring` — _(status: hidden-flag)_ recurrence creation still behind `SHOW_TASK_RECURRENCE = false`.
- `org/gdpr` — _(status: placeholder-ui)_ inert menu entries.
- `absence/accrual` — _(status: partial)_ documented hedged on `accruals.mdx`.
- `reports/schedule-email` — _(status: hidden-flag)_ **Schedule** action gated off in production builds.
- `reports/money-authorisations` — Planned-section entry _(status: partial — frontend guard only)_.

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (one per line). Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each.

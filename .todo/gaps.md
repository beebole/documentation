# Gaps report

Generated: 2026-10-04 (2026-10-04 release run)
Catalog last updated: 2026-10-04

Scope note: the 2026-09-28 release run closed with a verification pass that found every classified catalog entry covered, and `help/**` has only received screenshot batches since. This run's `/sync-features --incremental` touched 12 entries for the 2026-10-04 production deploy (10 user-facing rewordings, 2 new internal entries), so this pass classifies the 10 user-facing entries against their mapped pages and treats the rest of the catalog as still covered by the 2026-09-28 verification. Catalog format guard passed (27 sections, 295 bullets); catalog freshness 0 days. Entries under **Planned Features** and **Internal (Non User-Facing)** were excluded (`internal/usage-metrics`, `internal/server-logging` are new internal entries).

Excluded as release-note-only refinements (covered by the October news block, no documented behaviour to correct): performance improvements, the end-time stale-value fix, suggestion popup staying with its record, archived tasks showing their name, number fields accepting the local decimal format, +/− buttons on time fields, single-edit undo of start/end/duration, and Okta/OpenID SSO compatibility fixes.

Result: **0 Missing, 14 Partial** (on 12 pages) across 8 sections.

**Verification pass (2026-10-04):** every one of the 14 Partial entries was re-opened after `/write` and `/review`. The stale claims are gone site-wide (favorite click logging an entry, the score ring in team panes, "every planning starts as Tasks", "only the deepest level can be removed", badge initials, "no per-type switch" for time off costs, "six custom field types"), and each capability named in a `needs:` note is on its page. **14 of 14 Resolved, 0 still open.** One extra stale link found by the sweep was fixed in the same pass: `legacy-migration.mdx` linked "timesheet score" to the approval page; it now points to `timesheets#timesheet-score`. The stale claim also existed on `integrations/bamboohr.mdx` (FAQ and callout) and was fixed during `/write` and `/review`.

Code checks during writing and review narrowed three entries, and the catalog was reworded to match:
- On someone else's timesheet, a task grants access to an entry only when it is a managed task, but managing the person or one of the entry's projects still grants it (`timeRecordValidator`). The release note's "managers can only record time on tasks they manage" was too broad.
- Unique ID matching trims spaces before and after the value; spaces inside it still count.
- New time off types are paid by default (`involveCosts: true`); BambooHR-created types too, while types matched by name keep their own setting.

---

## Coverage gaps → undocumented features (verification: all resolved)

### Time Tracking

- [x] Resolved | `help/documentation/timesheets.mdx` | Timesheet calendar view — needs: (1) **accuracy fix**: a plain click on a favorite chip no longer adds an entry; favorites create an entry only when dragged onto the calendar (play button on the chip still starts a timer). Fix line 28 (table "Click a favorite"), lines 90–95 (the **Click a favorite** bullet and "Either way"), line 414 ("one-click favorites") and line 438 ("click a favorite"). Verify in `../reboot/frontend/src/components/timesheet/calendar/favorites.ts`. (2) The **+** button on each day's header (**Add an entry**, label `timesheet.addEntry`) adds an entry even when the day is already full. (3) Zoom into a single hour with **Open this hour** (label `timesheet.zoomHour`): a five-minute grid for very short entries (read, drag, resize); how to get back out. (4) Short entries that follow each other closely sit side by side instead of hiding one another. Verify in `calendar/index.ts`, `calendar-layout.ts`, `calendar-state.ts`.
- [x] Resolved | `help/documentation/timesheets.mdx` | Timer — needs: in **The floating timer** section, each line shows the project the timer belongs to (parent projects as short initials, the full path on hover), and the panel is dragged by its label. Verify in `../reboot/frontend/src/components/timesheet/main/floating-timer.ts`.
- [x] Resolved | `help/documentation/timesheets.mdx` | Timesheet score — needs: **accuracy fix**: the colored ring around each person's avatar in the team panes was removed (the `bb-timesheet-score` component and its labels were deleted on 2026-09-29; `member-item.ts` now shows a plain picture). The **Timesheet score** section (line 385 onward) must say where the score lives now: the **Score** column of the Timesheet compliance report (`reports.mdx`, **Compliance** entry) and the API (`getTimesheetScore`). Drop the ring colours and hover breakdown labels **On time** / **Late submissions** / **Not submitted** / **Rejections** as a hover tooltip (they no longer exist as labels in the app; check what the compliance report shows instead).
- [x] Resolved | `help/documentation/reports.mdx` | Timesheet score (compliance report) — needs: **accuracy fix** at line 291: "the detailed view behind the timesheet score shown on person records" — the score is no longer shown on person records or in the team panes; the compliance report is now where you see it. Reword and fix the link.
- [x] Resolved | `help/guides/team-leader.mdx` | Timesheet score — needs: **accuracy fix**: lines 47 and 85 say the score is shown on the team and approval views. Point to the **Compliance** report instead (keywords line 5 can keep "timesheet score").
- [x] Resolved | `help/guides/migration.mdx` | Timesheet score — needs: **accuracy fix** at line 132: "It appears on team members in the team and approval views." Replace with the compliance report.

### Absence & Time-Off Management

- [x] Resolved | `help/documentation/timeoff.mdx` | Absence cost inclusion — needs: **accuracy fix** at lines 139–144 ("There is no per-type switch for this today: every time off type is treated the same way"). Each time off type now has an **Is paid (included in people costs)** checkbox (label `absenceType.participate`, panel in `absence-type-unit.ts`); only absences of paid types are valued with the cost rate and counted in people cost totals in reports and budgets. Also check the screenshot alt text at line 51 (already mentions the checkbox) and the FAQ. Verify in `../reboot/backend/src/application/reporting/engine/timeRecord.ts` and `helpers.ts` (`involveCosts`), including what an unticked type contributes. Cross-check `help/documentation/costs.mdx` for the same claim.

### Planning, Tasks & Staffing

- [x] Resolved | `help/documentation/planning.mdx` | Planning mode: Tasks or Bookings — needs: **accuracy fix** at line 313 ("Every Beebole planning starts as Tasks"): a new planning opens in the mode you last picked, **Bookings** by default. Check the planning-mode section near line 61 for the same claim. Verify in `../reboot` commit `0a8f66cda` ("set planning mode to booking by default") and `frontend/src/services/task.ts` / the add-planning flow.

### Project Management / Tags & Organizational Structure

- [x] Resolved | `help/documentation/projects.mdx` | Custom hierarchy labels — needs: **accuracy fix** at line 105 ("only the deepest level can be removed"): in the **Level names** dialog every level below the category row can be renamed, removed, and dragged (gripper on hover) into a new order; Escape cancels a rename without closing the window. New **Only named levels** toggle (labels `categoryLevels.namedLevelsOnly`, `namedLevelsOnlyHint`: "Nothing can be added below the last level. Add a level here to go deeper."): when on, nothing can be added, moved or copied below the last named level, and clicking **+** on a row at that level shows **No lower level available, see [category] settings** (`noLowerLevelAvailable`). Verify in `../reboot/frontend/src/components/entity/category-levels-modal.ts`. The screenshot caption at line 97/98 mentions "a remove button on the last row" — note for `/illustrate`.
- [x] Resolved | `help/documentation/tags.mdx` | Custom hierarchy labels — needs: same as `projects.mdx`: fix line 78 ("only the deepest level can be removed"), add reorder/rename/remove of any level and the **Only named levels** setting.

### Roles & Permissions

- [x] Resolved | `help/documentation/roles-authorisations.mdx` | Permission targets — needs: when someone records time on another person's timesheet against a task, the task must be one they manage (target **Managed tasks**); time records on any other task are refused. Owned or assigned tasks don't count for someone else's timesheet. Verify in `../reboot/backend/src/lib/authorisations.ts` (`fieldApproved` with `onlyManagedEntities`, `timeRecordValidator`). Consider a one-line cross-reference from `approval.mdx` (force-edit a team member's timesheet).

### Custom Fields

- [x] Resolved | `help/documentation/custom-fields.mdx` | Multiple field types — needs: the new **Unique ID** field type (label `customField.uniqueId`, help `uniqueIdHelp`): each non-empty value can belong to only one person, project, task, tag, time entry, or time off type; matching ignores upper/lower case and extra spaces; archived items still count; options are a validation pattern and a placeholder (no allowed-values list); a taken value shows **This ID is already used by [item].** when you may see the item, otherwise **This ID is already used by another item.**; a field can't be switched to Unique ID while its existing values contain duplicates. Update the type lists at lines 29, the type table (~48), the options table (~65), and the FAQ at line 163 ("six custom field types" → seven). Verify in `../reboot/frontend/src/components/attributes/custom-field-details.ts`, `backend/src/application/entities/customFieldValue.ts`, `backend/src/lib/customField.ts`.

### Authentication & Security

- [x] Resolved | `help/documentation/authentication.mdx` | Passwordless email login — needs: in **Email code** (line 32): a code only works in the browser that asked for it and stops working after several wrong attempts; asking for a new code (or reloading, or switching devices) resends the same code with a fresh expiry, so every email you received holds a working code; too many requests for one address show how many minutes to wait. Re-verify the "expires after 5 minutes" figure. Verify in `../reboot/backend/src/application/authentication.ts` (commits `8f727b460`, `1dc6c4617`) and `frontend/src/app/sign-in-up.ts`.

### UI & User Experience

- [x] Resolved | `help/documentation/concepts.mdx` | Breadcrumb navigation — needs: **accuracy fix** at line 244: badges no longer fall back to the initials of the parent levels; a long parent path is cut short with "…", and the tooltip shows the full path. Also: hovering a project or task name (in a badge or in the timesheet popup header) shows its description. Verify in `../reboot/frontend/src/components/entity/entity-badge.ts` and `bb-tooltip.ts`.

---

## Proposed page-mappings additions

_No new mappings needed._ Every reworded entry already routes through an existing row; the score fixes on `reports.mdx` and the two guides were found by searching for the stale claim.

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (none this run). Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each.

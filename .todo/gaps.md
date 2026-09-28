# Gaps report

Generated: 2026-09-28 (2026-09-28 release run)
Catalog last updated: 2026-09-28

Scope note: the 2026-09-21 release run closed with a verification pass that found every classified catalog entry covered. This run's `/sync-features --incremental` touched 12 entries (3 new, 9 reworded) for the 2026-09-28 production deploy, so this pass classifies those entries against their mapped pages and treats the rest of the catalog as still covered by the 2026-09-21 verification. Catalog format guard passed (27 sections, 293 bullets); catalog freshness 0 days. Entries under **Planned Features** and **Internal (Non User-Facing)** were excluded (`auth/ms365-provisioning` was reworded but stays Planned — no code; `internal/request-entity-cache` is internal).

Excluded as bug fixes with no documented behaviour to correct: date pickers landing a day early west of UTC, and menus/popups opening slightly off during their animation.

Result of the first pass: **0 Missing, 9 Partial** across 6 sections. **Verification pass (2026-09-28):** every one of the 9 Partial entries was re-opened after `/write` and `/review`; the capability named in each `needs:` note is now present on the mapped page, and the stale inline level-name editing claims on `projects.mdx` and `tags.mdx` are gone (`planning.mdx` never made that claim). **9 of 9 Resolved, 0 still open.** Two code checks during writing and review corrected the drafts: adding from a Gantt project group opens the mode's add form with the project prefilled rather than creating the item outright (`gantt-group-header.ts`), and level names exist only on project and tag categories — a planning's settings dialog holds its mode and statuses (`category-entity-header.ts` `openCategorySettings`). The catalog entries `tasks/planning-mode` and `tags/custom-labels` were reworded accordingly.

---

## Coverage gaps → undocumented features (verification: all resolved)

### Planning, Tasks & Staffing

- [x] Resolved | `help/documentation/planning.mdx` | Planning mode: Tasks or Bookings — needs: a section on the planning mode. Each planning holds either **Tasks** (a to-do list, issues, tickets: items with a name and a status) or **Bookings** (people on projects: person, project, start date, duration, allocation), chosen under **What this planning holds** in the planning's settings (labels `task.planningMode`, `modeTasks`/`modeTasksHint`, `modeBookings`/`modeBookingsHint`, `planningModeNote`). The mode decides what the add button opens (**Add Task** vs **Add Booking**) and whether items carry their own name; Gantt, Kanban, List and Staffing stay available on every planning. Switching keeps every stored name: a booking shows its project and person instead, and its own name comes back if the planning returns to Tasks. Adding from a project group in the Gantt creates the right kind of item for the mode. Verify in `../reboot/frontend/src/components/task/planning-mode.ts`, `planning-mode-picker.ts`, `booking-add-form.ts`, `task-add-form.ts`.
- [x] Resolved | `help/documentation/staffing.mdx` | Bookings — needs: (1) **accuracy fix** — line 84 says you can name a booking later "exactly as you would rename a task"; in a Bookings planning a booking is always named after its project and person and cannot be renamed (`cantNameTaskInBookingsPlanning`, `bookingNameFixed`), and a stored name only comes back if the planning switches back to Tasks; (2) the last start date and duration you used are remembered for the next booking; (3) dragging on the Staffing timeline in a **Tasks** planning opens the add form with the dates and person already filled in, instead of creating an unnamed row. Link the planning-mode section on `planning.mdx`.
- [x] Resolved | `help/documentation/gantt.mdx` | Gantt chart view (locate a task) — needs: locating a task from anywhere (the **Show in the chart** button, line 245, and the off-screen arrow) moves the timeline onto the period holding the task and scrolls smoothly instead of jumping, even when the task lies outside the period currently shown (including with a fixed period window). Verify in `frontend/src/components/task/gantt/gantt-fit.ts` and `scroll-cycler.ts`.

### Project Management

- [x] Resolved | `help/documentation/projects.mdx` | Tasks and bookings on a project — needs: the new **Tasks and bookings** attribute on a project's panel (label `task.project-tasks`): lists every active task and booking linked to the project, grouped by planning, with an add button per planning (a Bookings planning asks for a person and a period, a Tasks planning for a name) and a remove action on each item. Verify in `frontend/src/components/attributes/project-tasks.ts`. Also: level names are no longer edited inline — line 84 ("click the level name shown above its children — the tooltip reads **Click to edit the level name for the whole category**") is stale; they are edited from the category's settings dialog (**\[category] settings** in the category menu, label `categorySettings`) in a **Level names** list (`categoryLevels.levelNames`, placeholder **Add new level**) that lists every level, lets you add a level and remove the deepest one; every row in the list has an add-child button. Verify in `frontend/src/components/entity/category-levels-modal.ts` and `category-entity-header.ts`.

### Tags & Organizational Structure

- [x] Resolved | `help/documentation/tags.mdx` | Custom hierarchy labels — needs: **accuracy fix** — line 58 still describes inline editing of a level name with the **Click to edit the level name for the whole category** tooltip; replace with the **Level names** list in the category's settings dialog (same behaviour as on `projects.mdx`). Check `planning.mdx` line 37 area for any similar inline-edit claim and fix it the same way.

### Reporting

- [x] Resolved | `help/documentation/reports.mdx` | Budget status report — needs: the new table layout: one row per project with each measure (hours, billing, costs) in its own column (**One column per measure**), or **Stack the measures in one column** to read them top to bottom; bars scale against their parent so a project and its sub-projects can be compared at a glance; **No projects with budgets found.** empty state. Verify in `frontend/src/components/reports/budget-status-table.ts` and `budget-status-report.ts` (how the layout toggle is exposed).

### Companion Apps & Add-ins

- [x] Resolved | `help/documentation/excel-addin.mdx` | Excel add-in — needs: the add-in detects which Beebole region (Europe or America) your API key belongs to automatically; no manual region choice; the region in use is shown in the add-in's settings, and a key no server accepts is reported clearly. Remove any step asking to pick a region or server if present. Verify in `../reboot/excel-addin/src/api.ts`, `taskpane.ts`, `taskpane.html`.
- [x] Resolved | `help/documentation/gsheets-addon.mdx` | Google Sheets add-on — needs: same region auto-detection as the Excel add-in (region shown in settings, clear error for a key no server accepts). Verify in `../reboot/gsheets-addin/src/server/api.ts`, `src/client/main.ts`, `taskpane.html`.

### AI

- [x] Resolved | `help/integrations/mcp-server.mdx` | AI assistant connections — needs: (1) `set_schedule` — create or rewrite a work schedule: a weekly cycle keyed by weekday with hours, time pairs and work-from-home per day, or a rotating cycle of any length; the whole cycle is replaced on each call; creating one puts nobody on it (assign with `assign`, relation `schedule_to_person`); (2) `archive`, `unarchive` and `delete` now also cover roles, time off types, expense types, work schedules and custom fields (line 34 lists the tools but not the wider scope); (3) a delete refused because the item is still in use — time entries, expenses, quotas, custom field values, or people assigned to a role or schedule — comes back with the reason and a suggestion to archive instead. Verify in `../reboot/backend/src/server/mcp/schedule.ts` and `entities.ts`.

### UI & User Experience

- [x] Resolved | `help/documentation/concepts.mdx` | Version update notifications — needs: line 234 — the **Update available** banner now appears only when a new build really is live, and can be dismissed with **Escape** instead of forcing an immediate reload (the prompt returns on the next reconnect or tab focus if the tab is still stale). Verify in `frontend/src/utils/versionchecker.ts`.

---

## Proposed page-mappings additions

Applied unattended (release run) — three rows appended to `page-mappings.md`:
- Keywords: `planning mode, tasks or bookings, what this planning holds, bookings planning, tasks planning` → `help/documentation/planning.mdx`, `help/documentation/staffing.mdx`
- Keywords: `level names, hierarchy levels, category settings, rename level` → `help/documentation/projects.mdx`, `help/documentation/tags.mdx`, `help/documentation/planning.mdx`
- Keywords: `version update, update available, new version prompt, reload prompt` → `help/documentation/concepts.mdx`

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (one per line). Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each.

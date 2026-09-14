# Gaps report

Generated: 2026-09-14 (verification pass — 2026-09-14 release run)
Catalog last updated: 2026-09-14

Scope note: the previous release run (2026-09-07) closed with a verification pass that found every classified catalog entry covered. This run's `/sync-features --incremental` touched 16 entries (6 new, 10 reworded) for the 2026-09-10 production deploy, so this pass classifies those entries against their mapped pages and treats the rest of the catalog as still covered by the 2026-09-07 verification. Catalog format guard passed (27 sections, 289 bullets); catalog freshness 0 days. Entries under **Planned Features** and **Internal (Non User-Facing)** were excluded.

Result of the first pass: **0 Missing, 17 Partial** across 7 sections. **Verification pass:** every one of the 17 Partial entries was re-opened after `/write` and `/review`; the capability named in each `needs:` note is now present on the mapped page. **17 of 17 Resolved, 0 still open.** Two scope corrections surfaced by code checks during writing: the item-side **Who has access?** panel does not accept whole categories (only the person/tag **Show or hide** selectors and the **Manages** panel do), and custom-field and report-folder deletions are refused with a plain message without a link to the blocker — pages, catalog, and news were aligned accordingly. One out-of-scope fix: recurring-task rows on `staffing.mdx` (hidden behind `SHOW_TASK_RECURRENCE = false`) were removed per the feedback rule on production-suppressed controls.

---

## Coverage gaps → undocumented features (verification: all resolved)

### Time Tracking

- [x] Resolved | `help/documentation/timesheetSettings.mdx` | Non-billable flag — needs: the new **Hide the non-billable option** Timesheet setting (label `restrictNonBillable`): the non-billable checkbox disappears from the entry form, records can no longer be marked non-billable (message "Your timesheet settings do not offer the non-billable option."), and cloned entries come across without the flag. Cross-link from `costs.mdx` where the non-billable flag is described.
- [x] Resolved | `help/documentation/ai.mdx` | Timer — needs: in start/end mode, the play button on a suggestion now starts (and stops) the timer on that task or project instead of also creating a separate entry; the draft shrinks as tracked time covers it and the button switches to pause while running. The current "Start it" bullet (accepts the suggestion and keeps a timer running) describes the old behaviour.
- [x] Resolved | `help/documentation/ai.mdx` | Suggested time entries — needs: the "Planned work on future days" section says forecast cards are read-only until the day arrives; now, when the timesheet settings allow logging ahead, future-day cards can be accepted, edited, or dismissed, and the quick lines in the add-time popup look 30 days ahead. Also: removing the task or project from a suggestion without picking a replacement makes **Accept** / **Accept all** stop and ask for a target.

### Planning, Tasks & Staffing

- [x] Resolved | `help/documentation/gantt.mdx` | Task view keyboard navigation — needs: the keyboard table lacks Shift+arrow / ⌘+arrow extending a multi-selection and the detail panel following the cursor as it moves; state that the same keys work in all four task views.
- [x] Resolved | `help/documentation/kanban.mdx` | Task view keyboard navigation — needs: a short "Keyboard navigation" section (arrow keys move the cursor through cards, Enter opens/closes the task panel, Shift/⌘+arrow extends the selection), linking to the Gantt table for the tree-only keys.
- [x] Resolved | `help/documentation/staffing.mdx` | Task view keyboard navigation — needs: a short "Keyboard navigation" section (arrow keys move the cursor through rows/bars, Enter opens/closes the task panel, Shift/⌘+arrow extends the selection).
- [x] Resolved | `help/documentation/gantt.mdx` | Gantt chart view — needs: (1) the **Access** cell has separate add-person and add-tag buttons with their own pickers; (2) a person, tag, or project badge can be removed straight from the row by hovering it and clicking the X, on single badges and stacked groups alike, without opening the cell editor; (3) the **Planned in hours or days** toggle converts using each person's own working calendar (not a fixed 8-hour day), so Planned figures, bars, tooltips, the workload heatmap, and Staffing capacity agree.
- [x] Resolved | `help/documentation/staffing.mdx` | Staffing view — needs: (1) the **Unassigned** row can be pinned under the header so its bars stay in reach while scrolling; (2) the booking editor lets you set both the person and the activity on any booking, whatever the grouping; (3) dragging a bar sideways keeps its exact length and starting weekday instead of snapping to the grid, and at week precision bookings move a whole week at a time.

### Tags & Organizational Structure

- [x] Resolved | `help/documentation/tags.mdx` | Tag exclusions — needs: the Info "An inherited tag … can only be removed on the parent" is outdated. Removing an inherited tag from a specific task, project, or person now shows an explicit exclusion badge (click it to give the tag back), shown everywhere tags are listed; excluded tags no longer count as assigned in Kanban cards, Gantt rows, task sheets, or custom-field matching.
- [x] Resolved | `help/documentation/projects.mdx` | Category colours — needs: in "Managing categories and level names", every project, task, and tag category has a colour of its own (assigned automatically, changed from the category menu's palette ball), shown on the category menu, in selector rows, and on filter chips.
- [x] Resolved | `help/documentation/projects.mdx` | Whole-category managers & assignments — needs: in the categories section, a whole category can be picked wherever single items were picked (one click on the category row); a manager of a category manages everything inside it, now and in the future; the badge shows the category in its colour and its members are no longer offered separately once picked.
- [x] Resolved | `help/documentation/assignments.mdx` | Whole-category managers & assignments — needs: **Who has access?** and the person/tag assignment pickers accept a whole project, secondary-project, or task category, so every entity in that category follows, including anything added later.

### Roles & Permissions

- [x] Resolved | `help/documentation/assignments.mdx` | Availability controls — needs: **Show all tasks** now genuinely grants every task; when unchecked, only tasks assigned to, owned by, or managed by the person are visible (current row text is the generic "available to everyone by default").
- [x] Resolved | `help/documentation/projects.mdx` | Availability controls — needs: a project's **Who has access?** setting applies to its whole subtree, so subprojects follow the parent's setting.

### Organization Settings

- [x] Resolved | `help/documentation/concepts.mdx` | Delete protection with named blockers — needs: a cross-cutting section: when a delete is refused because something still refers to the item (time off / expense type used by allowances or records, report folder with reports, custom field with values, person or project referenced by time settings, task status, schedule assignments, managers, task owners, or task projects), the message names the blocking item and links to the panel where the reference can be removed. Link from `planning.mdx` (task deletion) and `custom-fields.mdx` (field deletion), which already describe two cases.
- [x] Resolved | `help/documentation/master-data.mdx` | Master data review — needs: (1) the explicit **Read your data** / **Change your data** tabs replacing the "Modify this data…" link; (2) a change can target named rows only ("set the external ID of Anna to abc"), fill a field with an incremental counter ("ext-3, then ext-4, …"), optionally only where the field is still empty; (3) a request for a value no column can hold gets an explanation (and a custom-field hint where applicable), and a request that changes nothing reports "Nothing changed."; (4) rows split line by line so values from the same underlying list line up across columns, rows are banded, and inherited values name their source in the export; (5) a configuration the server refuses as too heavy keeps the previous results and rolls the setting back.

### Integrations

- [x] Resolved | `help/integrations/quickbooks.mdx` | QuickBooks — needs: (1) structure sync also imports employees added in QuickBooks after the integration was set up, created as people matched by email with the configured default role ("Keeping customers and items in sync" only mentions customers and items); (2) exporting time runs a structure sync first and stops with an explanatory message if that sync reports errors, so entries are never exported against stale structure.

### UI & User Experience

- [x] Resolved | `help/documentation/concepts.mdx` | Attribute deep links — needs: the URL follows the attribute you are reading as you scroll an entity's panel, so a shared link opens on the section that was on screen; the same section stays in view when you switch entity; an attribute opened from a link stays at the top of the panel until you scroll, click, or type.

---

## Proposed page-mappings additions

- Keywords: `delete blocked, cannot be deleted, still in use, referenced, delete protection` → proposed page: `help/documentation/concepts.mdx` — **applied** (release run override)
- Keywords: `attribute link, deep link, panel URL, URL follows, share a link to an attribute` → proposed page: `help/documentation/concepts.mdx` — **applied** (release run override)

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (one per line) — none this run. Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each. In a release run, every Partial entry above is drafted with `/write <path>` using its `needs:` note.

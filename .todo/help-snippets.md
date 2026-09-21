# In-app help snippet audit

Checked: 2026-09-21 against ../reboot @ 0917e9846 (prod, clean tree) and ../md @ aa674e3 (clean tree, unchanged since the 2026-09-14 audit)

Standalone run requested by Yves after the 2026-09-21 release (the `/release` run had to skip this step). Report-only: nothing in `../md` or `../reboot` was modified.

Scope measured: 36 attributes declared by `getAllEntityAttributes()` (34 rendered in production; `absence-type-accrual` and `absence-type-notification` sit behind the `isProduction()` guard), 60 `MD_PATH_DICTIONARY` entries (37 help + 23 preview), 600 snippet files in `../md` (370 help + 230 preview).

## Missing help snippets

All clear. Every one of the 34 attributes rendered in production resolves to a `help-<value>-en` dictionary entry, and so do the 2 dev-only accrual attributes. `Preview` is the pseudo-attribute for upgrade cards and is correctly excluded.

## Missing preview snippets

All clear. Covered and verified against the dictionary:

- The 11 attributes for which `getRequiredFeature()` returns a feature (`expense-records`, `expense-type-details`, `absence-type-accrual`, `absence-type-quota`, `approval-stages`, `billing`, `budget`, `cost`, `custom-field-details`, `custom-field-values`, `custom-field-visibility`).
- The 14 attributes available on the **tag** entity other than `Tagged`, all gated by `tagsAdvanced` (`absence-type-quota`, `approval-stages`, `billing`, `cost`, `description`, `email-templates`, `localisation`, `managed-by`, `notification`, `options`, `public-holidays`, `schedule-type-relations`, `time-settings`, `validity-period`).
- Both `previewKey` values in `builtin-reports.ts` (`absence-type-quota`, `budget`).
- The only non-null `featurePreviewKey` assignment, `EntityType.customField` (`settings-menu.ts`, `connected-person-sheet.ts`) → `preview-CustomField-en`.

## Broken dictionary paths

All clear. All 60 dictionary paths exist as files in `../md`, including the two intentional aliases (`help-managed-by-en` → `help/help-project-managed-by-en.md`, `help-sso-en` → `help/help-openid-en.md`).

## Incomplete language sets

All clear. 60 keys × 10 languages = 600 files, all present.

## Orphaned files

All clear.

## Notes (not errors, no action required for coverage)

- No new `AttributeName` value, dictionary entry, preview key, or `md.ts` change since the 2026-09-14 audit (`e0f50fece..0917e9846`). The only changes in the audited files are the help-box reveal behaviour in `entity-attributes.ts` (scroll into view, kept off the popup stack) and type comments in `types.ts`; neither adds or renames an attribute.
- The two spare entries flagged last time still stand: `help-projects-allowed-en` (matches the `projectsAllowed` authorisation, no current call site) and `preview-ExpenseType-en` (no code path passes `EntityType.expenseType` to the preview fetch).

## Content follow-up (stale wording, outside this check's scope)

Coverage is complete, but two snippets no longer describe the panel they sit on. Fixing them means editing 10 files each in `../md`; drafts follow the sibling-file conventions if you want them written.

- `help-time-settings-*` — says the options include "which day the week starts on" (that setting lives in **Localization**, not here) and never mentions the panel's four tabs (**Period & submission**, **Categories**, **Time entry**, **Reminders**) nor its main controls: **Lock date**, **Auto-submit timesheets after X days**, the **Restrictions** list (including the new **Hide the non-billable option**), **Record time on these project categories** / **Record time on these plannings**, and **Auto Timesheet from Planning**. Suggested EN text: "Timesheet and Planning Settings control how time is recorded and submitted: the timesheet period and auto-submit, the lock date, entry restrictions, the unit and format for durations, the timer and start/end times, the project categories and plannings people can track time on, and reminder emails. Settings are inherited from the organization and can be overridden per tag or per person."
- `help-manager-*` — describes people, projects, tasks, and tags but not that a whole project, task, or tag **category** can be picked, which makes the person manager of everything inside it now and in the future (`manager.ts`, `managerOfCategoryMutation`). One added sentence covers it.

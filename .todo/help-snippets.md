# In-app help snippet audit

Checked: 2026-09-28 against ../reboot @ 17703a17a (prod, clean tree) and ../md @ aa674e3 (clean tree, unchanged since the 2026-09-14 audit)

Run as step 9 of the 2026-09-28 `/release` pipeline. Report-only: nothing in `../md` or `../reboot` was modified.

Scope measured: 37 attributes declared by `getAllEntityAttributes()` (one more than on 2026-09-21: `project-tasks`, added by the 2026-09-28 deploy), 60 `MD_PATH_DICTIONARY` entries (37 help + 23 preview, unchanged), 600 snippet files in `../md` (370 help + 230 preview, unchanged).

## Missing help snippets

- `project-tasks` — shown on **projects** (the new **Tasks and bookings** attribute, `services/entity/attributes.ts:625`, rendered by `entity-attributes.ts:436` as `<project-tasks-attribute>`); needs `help/help-project-tasks-{en,cs,de,es,fr,hu,it,nl,pl,pt}.md` + a `'help-project-tasks-en': 'help/help-project-tasks-en.md'` dictionary entry in `frontend/src/i18n/md.ts`. Until then the **?** on that attribute header renders **[help-project-tasks-en] content not found** in production (`fetchLocalisedContent` returns the missing label when the key is absent from the dictionary). Suggested EN text, following the sibling convention (2–4 sentences + `---` + "Read more in the documentation →" link to `beebole.com/help/documentation/projects`): "Tasks and bookings lists every active task and booking linked to this project, grouped by planning. Add one straight from here — a Bookings planning asks for a person and a period, a Tasks planning for a name — or remove a link without deleting the task. Time on a booking is recorded on the project; time on a task stays on the task."

## Missing preview snippets

All clear. `project-tasks` is not feature-gated (`getRequiredFeature()` returns nothing for it and it is not a tag attribute), so it needs no preview. The set verified on 2026-09-21 is unchanged: `entity-attributes.ts` changed only by the two-line `ProjectTasks` render case, `builtin-reports.ts` and the `featurePreviewKey` assignments (`settings-menu.ts`, `connected-person-sheet.ts`) are untouched since `0917e9846`.

## Broken dictionary paths

All clear. All 60 dictionary paths exist as files in `../md`, including the two intentional aliases (`help-managed-by-en` → `help/help-project-managed-by-en.md`, `help-sso-en` → `help/help-openid-en.md`).

## Incomplete language sets

All clear. 60 keys × 10 languages = 600 files, all present.

## Orphaned files

All clear.

## Notes (not errors, no action required for coverage)

- The two spare entries flagged on earlier runs still stand: `help-projects-allowed-en` (matches the `projectsAllowed` authorisation, no current call site) and `preview-ExpenseType-en` (no code path passes `EntityType.expenseType` to the preview fetch).

## Content follow-up (stale wording, outside this check's scope)

Carried over from 2026-09-21, still open (no `../md` commit since):

- `help-time-settings-*` — still says the options include "which day the week starts on" (that setting lives in **Localization**) and never mentions the panel's four tabs nor its main controls (**Lock date**, **Auto-submit timesheets after X days**, the **Restrictions** list, **Record time on these plannings**, **Auto Timesheet from Planning**).
- `help-manager-*` — does not mention that a whole project, task, or tag **category** can be picked as the managed scope.
- New this run: `help-levels-*` / any snippet describing level names as edited inline under an expanded row would now be stale — the 2026-09-28 deploy moved level names into the category's settings dialog (**Level names** list). No dictionary key mentions levels today, so nothing to fix; noted in case a snippet is added.

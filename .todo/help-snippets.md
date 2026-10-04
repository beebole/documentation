# In-app help snippet audit

Checked: 2026-10-04 against ../reboot @ f060f226b (prod, up to date with origin/prod) and ../md @ ab75022 (main, up to date with origin/main after fetch)

Run as a step of the 2026-10-04 `/release` pipeline. Report-only: nothing in `../md` or `../reboot` was modified.

Scope measured: 37 attributes declared by `getAllEntityAttributes()` (unchanged since 2026-09-28), 60 `MD_PATH_DICTIONARY` entries (37 help + 23 preview, unchanged, `md.ts` not touched since `17703a17a`), 610 snippet files in `../md` (380 help + 230 preview, +10 since last run: `ab75022` "Add project-tasks help snippet in 10 languages").

This release added no new attribute key. The `AttributeName` enum, `entity-attributes.ts`, `builtin-reports.ts` and the `featurePreviewKey` assignments are unchanged since `17703a17a`. The three features named in the release land inside existing attributes or outside the attribute system:

- Unique ID custom field type (`CustomFieldType.uniqueId`, `uniqueIdOptions`): a new field type inside the existing **custom-field-details** attribute, same help and preview keys.
- **Only named levels** (`Category.namedLevelsOnly`): a setting in the category's level dialog (`category-levels-modal.ts`), not an entity attribute, so no help key.
- Absence type **Is paid (included in people costs)** checkbox: un-gated from non-production in `absence-type-unit.ts` (`8dffbabce`), inside the existing **absence-type-unit** attribute.

## Missing help snippets

- `project-tasks` (carried over from 2026-09-28, now half-fixed): shown on projects (the **Tasks and bookings** attribute, `services/entity/attributes.ts:629`). The 10 snippet files now exist in `../md` (`ab75022`), but `frontend/src/i18n/md.ts` still has no `'help-project-tasks-en': 'help/help-project-tasks-en.md'` entry, so the **?** on that attribute header still renders **[help-project-tasks-en] content not found** in production (`fetchLocalisedContent` returns the missing label when the key is absent from the dictionary). Only the one-line dictionary entry in `../reboot` remains.

## Missing preview snippets

All clear. Every gated attribute (`getRequiredFeature()`: expense-records, expense-type-details, absence-type-accrual, absence-type-quota, approval-stages, billing, budget, cost, custom-field-details/values/visibility), every tag attribute except `tagged` (all gated by `tagsAdvanced`), the `builtin-reports.ts` preview keys (absence-type-quota, budget) and the `featurePreviewKey` assignments (`CustomField` in `settings-menu.ts` and `connected-person-sheet.ts`) resolve to a `preview-…-en` entry.

## Broken dictionary paths

All clear. All 60 dictionary paths exist as files in `../md`, including the two intentional aliases (`help-managed-by-en` → `help/help-project-managed-by-en.md`, `help-sso-en` → `help/help-openid-en.md`).

## Incomplete language sets

All clear. 60 keys × 10 languages = 600 files, all present.

## Orphaned files

- `help/help-project-tasks-{en,cs,de,es,fr,hu,it,nl,pl,pt}.md` (10 files): added in `ab75022` ahead of the matching dictionary entry. Not a stale file: they become live as soon as the `help-project-tasks-en` entry above is added to `md.ts`.

## Notes (not errors, no action required for coverage)

- The two spare entries flagged on earlier runs still stand: `help-projects-allowed-en` (matches the `projectsAllowed` authorisation, no current call site) and `preview-ExpenseType-en` (no code path passes `EntityType.expenseType` to the preview fetch).
- `absence-type-accrual` and `absence-type-notification` are still declared only outside production (`isProduction()` guard in `attributes.ts`), so their snippets are not reachable on prod yet. Coverage is complete for when they ship.

## Content follow-up (stale wording, outside this check's scope)

New this run:

- `help-custom-field-details-*`: lists the field types as "text, number, date, URL, boolean, or datetime" and does not mention the new **Unique ID** type (labels.json: "Unique ID", "Each non-empty value must be unique across all entities this field is used on."). `preview-custom-field-details-*` lists "text, number, date, dropdown or checkbox fields", same gap.
- `help-absence-type-unit-*`: already says time of this type can be marked as paid and included in people costs, which is now accurate on prod since the **Is paid (included in people costs)** checkbox shipped. No change needed.

Carried over from 2026-09-21, still open (the snippets have not changed since `9d5a2bc`):

- `help-time-settings-*`: still says the options include "which day the week starts on" (that setting lives in **Localization**) and never mentions the panel's four tabs nor its main controls (**Lock date**, **Auto-submit timesheets after X days**, the **Restrictions** list, **Record time on these plannings**, **Auto Timesheet from Planning**).
- `help-manager-*`: does not mention that a whole project, task, or tag **category** can be picked as the managed scope.
- Levels: no dictionary key covers category levels (names moved to the settings dialog on 2026-09-28, **Only named levels** added this release). Nothing to fix; noted in case a snippet is added.

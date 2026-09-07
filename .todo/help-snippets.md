# In-app help snippet audit

Checked: 2026-09-07 against ../reboot @ d47833886 (prod, clean tree) and ../md @ aa674e3

Run as step 9 of the `/release` pipeline (post-deploy audit for the 2026-09-01 and 2026-09-06 production deploys). Report-only: nothing in `../md` or `../reboot` was modified.

Scope measured: 36 attributes rendered by `allEntityAttributes`, 60 `MD_PATH_DICTIONARY` entries (37 help + 23 preview), 600 snippet files in `../md` (370 help + 230 preview).

## Missing help snippets

All clear. Every one of the 36 `AttributeName` values rendered by `allEntityAttributes` resolves to a `help-<value>-en` dictionary entry. The only enum value without one is `Preview`, which is the pseudo-attribute for upgrade cards and is correctly excluded.

## Missing preview snippets

All clear. Covered and verified:

- The 11 attributes for which `getRequiredFeature()` returns a feature (`expense-records`, `expense-type-details`, `absence-type-accrual`, `absence-type-quota`, `approval-stages`, `billing`, `budget`, `cost`, `custom-field-details`, `custom-field-values`, `custom-field-visibility`).
- The 14 attributes available on the **tag** entity other than `Tagged`, all gated by `tagsAdvanced` (`approval-stages`, `managed-by`, `localisation`, `notification`, `email-templates`, `schedule-type-relations`, `description`, `billing`, `cost`, `validity-period`, `absence-type-quota`, `time-settings`, `public-holidays`, `options`).
- Both `previewKey` values in `builtin-reports.ts` (`AbsenceQuota`, `Budget`).
- The only `featurePreviewKey` assignment that is not `null`: `EntityType.customField`, in `settings-menu.ts` (Custom fields menu entry) and `connected-person-sheet.ts` — resolves to `preview-CustomField-en`.

## Broken dictionary paths

All clear. All 60 dictionary paths exist as files in `../md`, including the two intentional aliases (`help-managed-by-en` → `help/help-project-managed-by-en.md`, `help-sso-en` → `help/help-openid-en.md`).

## Incomplete language sets

All clear. Every dictionary-referenced English file has all 9 sibling localisations (`cs de es fr hu it nl pl pt`) — 60 keys x 10 languages = 600 files, all present. The `validity-period` help and preview snippets added in `../md` on 2026-09-02 landed in all 10 languages.

## Orphaned files

All clear. Every file in `../md/help` and `../md/preview` is reached by a dictionary entry, directly or via the language-suffix swap.

## Notes (not errors, no action required)

- `help-projects-allowed-en` is a live dictionary entry with 10 files, but `projects-allowed` is not an `AttributeName` — it matches the `projectsAllowed` authorisation in `shared/authorisations.ts`. No current call site can request it. Leave in place unless the authorisation help box is confirmed dead.
- `preview-ExpenseType-en` has 10 files and a dictionary entry, but no code path passes `EntityType.expenseType` to `fetchPreviewContent` (only `EntityType.customField` is used that way). The Expense types settings entry is gated by `authGate(auths.ExpenseType)`, not by a feature preview. Either wire it up or accept it as a spare.
- `AbsenceAccrual` and `AbsenceNotification` are excluded from `allEntityAttributes` in production (`SWEEP-UNDER-THE-RUG` / `isProduction()` guard). Their help and preview snippets already exist in all 10 languages, so accruals will be covered when the feature ships. Consistent with accruals not being live.
- The 2026-09-01 and 2026-09-06 deploys added no new `AttributeName` values. Checked specifically: the **Master data review** settings page (`components/settings/master-data/`) renders its own UI and does not mount `entity-attributes`, so it needs no attribute help snippets; the task **List** view reuses `AttributeName.Options` via `gantt/cells/gantt-access.ts`, already covered by `help-options` and `preview-options`; custom fields on absence types are covered by `CustomFieldValues`, whose `entityTypes` now include `absenceType` and whose help and preview snippets both exist. The 2026-09-03 commit that removed the per-absence-type approval settings left no dangling dictionary entry.

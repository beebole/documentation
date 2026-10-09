# In-app help snippet audit

Checked: 2026-10-09 against ../reboot @ 0d4e85aac (detached worktree of origin/prod, includes the 2026-10-08 deploy; Yves' ../reboot working tree was not read) and ../md @ 4fb0292 (main, up to date with origin/main). Fixes pushed as ../md @ e22bc65.

Run as step 12 of the 2026-10-08 `/release` pipeline, in `--fix` mode.

Scope measured: 37 attributes declared by `getAllEntityAttributes()` (unchanged since the last audit), 60 `MD_PATH_DICTIONARY` entries (37 help + 23 preview), 610 snippet files in `../md` (380 help + 230 preview). Since the 2026-10-04 audit, prod received `2a293b716` ("register project-tasks, drop projects-allowed"), which closed the one open finding of that report. The 2026-10-08 deploy added no attribute key: `types.ts` only swapped the `onlyAdminCanEditTimesheet` time setting for `plannedTasksOnly`, and `entity-attributes.ts`, `builtin-reports.ts` and the `featurePreviewKey` assignments are unchanged. The attribute components it touched are `notification.ts` (push for everyone, device list) and `time-settings.ts` (Allow only planned tasks, DCAA compliance bundle, merged edit restriction), plus label changes for `approvalStages.noStages` (no workflow = no submission) and `localisation.timeFormat` ("Clock format").

## Missing help snippets

All clear. All 37 attributes resolve to a `help-…-en` entry, including `help-project-tasks-en` (registered on prod since `2a293b716`, so the **?** on **Tasks and bookings** no longer shows "content not found").

## Missing preview snippets

All clear. Every gated attribute (`getRequiredFeature()`), every tag attribute except `tagged` (14 keys, all gated by `tagsAdvanced`), the `builtin-reports.ts` preview keys (absence-type-quota, budget) and the `featurePreviewKey` assignments (`CustomField`) resolve to a `preview-…-en` entry.

## Broken dictionary paths

All clear. All 60 paths exist in `../md`, including the two intentional aliases (`help-managed-by-en`, `help-sso-en`).

## Incomplete language sets

All clear. 60 keys × 10 languages = 600 files, all present.

## Orphaned files

- `help/help-projects-allowed-{en,cs,de,es,fr,hu,it,nl,pl,pt}.md` (10 files): their dictionary entry was dropped on prod in `2a293b716` (no call site). Not deleted, per the rules; they can be removed from `../md` whenever Yves wants.

## Stale wording

Checked every attribute the 2026-10-08 deploy touched, plus the follow-ups carried over from 2026-10-04.

- `help-notification-*`: said the settings control "email notifications" only. Push notifications are now available to everyone: the panel has two channels, **Email** and **Push notifications**, and in your own settings a device list (**This device**, **Enable on this device**, **Other devices**). Fixed.
- `help-approval-stages-*`: did not say what happens with no stage. Without an approval workflow nobody can submit a timesheet, and periods close only through **Auto-submit timesheets after X days**, when set (`approvalStages.noStages`, `hasWorkflow`). Fixed.
- `preview-approval-stages-*`: opened with "Route submitted timesheets…", but on the Free plan (no `approval` feature, so no workflow) nobody can submit any more. Now opens with approval letting people submit for review. Fixed.
- `help-time-settings-*`: Add restriction gained **Allow only planned tasks in the timesheet** and the **DCAA compliance** choice (turns on two restrictions at once). The snippet now names both. The removed "Only an admin can edit someone else's timesheet" restriction was not named in any snippet.
- `help-localisation-*`: listed currency, time zone, date format, number format and first day of the week, with no mention of the clock setting, renamed **Clock format** this release. Now lists every field of the panel, including **Clock format** (12-hour or 24-hour). Fixed.

Checked and still accurate: `help-task-date-status`, `help-task-owner`, `help-task-project`, `help-project-tasks` (Done/Reopen and the booking date range don't change what these say: none of them used the word archive, and "active" still matches the filter on tasks not marked done), `help-manager`, `help-project-managed-by`, `help-email-templates`, `help-validity-period` (its "without archiving" refers to projects, which still archive). Carried over from 2026-10-04 and already fixed in `../md` `4fb0292`: `help-custom-field-details` / `preview-custom-field-details` (Unique ID), `help-time-settings` (first day of week, tabs), `help-manager` (whole categories).

"Read more" links: all 21 target pages exist on the live site (`main` of the documentation repo). The rewritten snippets keep their page-level links, with no anchor. On `main` those pages still show the pre-deploy behavior: notifications has no push section, approval says timesheets are auto-approved when there is no workflow, timesheetSettings lists the old restriction, and account-settings says "Time format". The release PR fixes all four. Its push section anchor (`#push-notifications-on-your-devices`) exists only on the branch, which is why no anchor was used.

## Fixes applied

- ../md @ e22bc65, pushed to main: 50 files, first paragraph rewritten in all 10 languages with each language's labels from `shared/i18n/<lang>/labels.json`:
  - `help/help-notification-{en,cs,de,es,fr,hu,it,nl,pl,pt}.md`
  - `help/help-approval-stages-{en,cs,de,es,fr,hu,it,nl,pl,pt}.md`
  - `preview/preview-approval-stages-{en,cs,de,es,fr,hu,it,nl,pl,pt}.md` (first sentence only)
  - `help/help-time-settings-{en,cs,de,es,fr,hu,it,nl,pl,pt}.md`
  - `help/help-localisation-{en,cs,de,es,fr,hu,it,nl,pl,pt}.md`
- ../reboot: skipped. The working tree has Yves' uncommitted work (dirty tree), so the preflight fails. Nothing was switched, edited or committed there. No dictionary entry is missing on prod anyway, so nothing waits for later.
- Not fixed: orphaned `help/help-projects-allowed-*` (10 files). The rules say never delete.

## Notes (no action required)

- Spare entry `preview-ExpenseType-en`: no code path passes `EntityType.expenseType` to the preview fetch. The file exists, so the entry is harmless.
- `absence-type-accrual` and `absence-type-notification` are still declared only outside production (`isProduction()` guard in `attributes.ts`). Their snippets are complete for when they ship.
- Budget threshold alerts are still hidden on prod (`visibleTypes` in `notification.ts`), so `help-notification` leaves them out on purpose.

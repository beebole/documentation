# Documentation account

- QA organisation `6abb86369d045d1d6a183151` on `qa.beebole.com`, named AnyCompany (obviously fictional, decided by Yves 2026-09-29). Acme Corp stays an example client, as in the docs.
- Admin: Yves' account, shown in the app as Jordan Reed. Key: `BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY` in `~/.config/beebole/.env`.
- Company profile: a New York based agency (US time zone, USD, 12-hour clock, Sunday-first weeks) with offices in New York, London and Lisbon; divisions Engineering, Design, Sales, each split into teams.

## What builds it

1. `seed.mjs full`: people, clients and projects, tasks, tags, rates, schedules, a year of time, absences, expenses, budgets. Adapted from reboot's `seed-demo.mjs` on 2026-09-29: key from the environment, organisation guard, approval guard, account-management time logged on each client's main engagement, the organisation schedule assigned through the renamed timeline mutations (`resetOrganisationScheduleTimelineRelations`, `assignScheduleTimelineToOrganisation`), absences kept off public holidays, and the wipe deleting only rates defined on each project. A `full` run ends with zero GraphQL errors; keep it that way.
2. `layer.mjs`: organisation name, Department teams, Location offices, memberships, colours (rules from `claude-plugins/plugins/growth/skills/generate-dummy-data/references/entity-colors.md`).

## App state the scenes rely on

- Jordan Reed's timesheet opens in **Grid view** (the Timesheets scenes switch to it; a Calendar view scene must switch back in its `teardown`).
- Elena Rossi's person panel may remember the Tags panel as open; scenes open panels idempotently.

## Data rules

- Only add. Top-ups add time after the last recorded day; nothing is edited or deleted.
- Planning moves forward by adding tasks with future dates, when the first planning scene needs it.
- Top up only when a date-dependent scene is being recaptured.
- Anything a scene needs goes into `layer.mjs`, never into the app by hand.

## Full reset

Once approvals exist, `full` refuses. A reset then means:
1. Create a new QA organisation through the API (`requestSignup` returns `debugPin` on QA, then `signup`).
2. Create an API key for its admin, store it as `BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY`, update `ORG_ID` in `guards.mjs` and `../illustrate/runner/lib/session.mjs`.
3. `seed.mjs full`, then recapture every scene (`screenshots.mjs capture all`).

## Approvals

- Run once on 2026-09-29 (`seed.mjs approve`): the 18 team members' weeks submitted (593), older weeks approved (567), the last three weeks mixed (pending ones show in the approvals panes). Jordan Reed's weeks are not touched, so the Timesheets scenes keep an editable draft week.
- Periods must match the app exactly: weeks start on the organisation's first day (Sunday here) and end at 23:59:59.999 on the last day (`timesheetService.getTimesheetPeriod`). A range ending at the next midnight is a different period the app never shows; seed-demo had both mistakes (Monday start, midnight end), fixed here. The first run on 2026-09-29 used the wrong end and left 597 invisible submissions; they cannot be removed and do no harm.
- Timesheet score rings are low (red) for everyone: the score rewards submitting on time, and the whole history was submitted on one day through the API, which cannot backdate. Do not use score-ring shots until the account has a real submission rhythm.
- Scenes that need a week submitted or approved do it in their `prepare` step (permanent, never undone) with the same period bounds.

## History

- 2026-09-29: created ("Illustrate 2026-09-29"), seeded with seed-demo, layer applied, renamed AnyCompany; rebuilt with `seed.mjs full` after the fixes; approvals run (see above). `full` refuses from now on.
- The seed retries network failures (QA sometimes drops connections for a few seconds).

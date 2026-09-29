# Documentation account

- QA organisation `6abb86369d045d1d6a183151` on `qa.beebole.com`, named AnyCompany (obviously fictional, decided by Yves 2026-09-29). Acme Corp stays an example client, as in the docs.
- Admin: Yves' account, shown in the app as Jordan Reed. Key: `BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY` in `~/.config/beebole/.env`.
- Company profile: a New York based agency (US time zone, USD, 12-hour clock, Sunday-first weeks) with offices in New York, London and Lisbon; divisions Engineering, Design, Sales, each split into teams.

## What builds it

1. `seed.mjs full`: people, clients and projects, tasks, tags, rates, schedules, a year of time, absences, expenses, budgets. Adapted from reboot's `seed-demo.mjs` on 2026-09-29: key from the environment, organisation guard, approval guard, account-management time logged on each client's main engagement, the organisation schedule assigned through the renamed timeline mutations (`resetOrganisationScheduleTimelineRelations`, `assignScheduleTimelineToOrganisation`), absences kept off public holidays, and the wipe deleting only rates defined on each project. A `full` run ends with zero GraphQL errors; keep it that way.
2. `layer.mjs`: organisation name, Department teams, Location offices, memberships, colours (rules from `claude-plugins/plugins/growth/skills/generate-dummy-data/references/entity-colors.md`).

## Data rules

- Only add. Top-ups add time after the last recorded day; nothing is edited or deleted.
- Planning moves forward by adding tasks with future dates, when the first planning scene needs it.
- Top up only when a date-dependent scene is being recaptured.
- Anything a scene needs goes into `layer.mjs`, never into the app by hand.

## Full reset

Once approvals exist, `full` refuses. A reset then means:
1. Create a new QA organisation through the API (`requestSignup` returns `debugPin` on QA, then `signup`).
2. Create an API key for its admin, store it as `BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY`, update `ORG_ID` in `seed.mjs`, `layer.mjs` and `../illustrate/runner/lib/session.mjs`.
3. `seed.mjs full`, then recapture every scene (`screenshots.mjs capture all`).

## History

- 2026-09-29: created ("Illustrate 2026-09-29"), seeded with seed-demo, layer applied, renamed AnyCompany; rebuilt with `seed.mjs full` after the fixes.

# Illustrate scenario (QA screenshot account)

One fictional company for every docs screenshot, so pages stay coherent with each other.

## Account

- QA organisation `6abb86369d045d1d6a183151` on `qa.beebole.com`, named "Halvora" (an invented digital agency; created as "Illustrate 2026-09-29"). The admin shows in the UI as Jordan Reed.
- API key: `BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY` in `~/.config/beebole/.env`.

## Rebuild the data (all through the API)

1. `node ../../../../../reboot/scripts/seed-demo.mjs "$BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY" qa` (full reset, about 2 minutes). Never `--approve`: it is one-way and blocks later resets.
2. `node screenshot-layer.mjs` (idempotent). Sets the organisation name, adds the Department teams, the Location category (Brussels, London, Lisbon), team and office memberships, and colours following `claude-plugins/plugins/growth/skills/generate-dummy-data/references/entity-colors.md`.

Known gap: seed-demo logs time directly on the four client parent projects, which the backend now rejects (`timeRecordOnParentProject`), so about 1,500 of 5,445 time records are missing. Fix in reboot before timesheet or report screenshots.

## Sign in the headless browser (no email step)

From a page on `https://qa.beebole.com`, with credentialed `fetch('/graphql')` and a `csrftoken` header taken from `{ currentSession { csrftoken } }`:

1. `getAccounts(email: "yves@beebole.com")` and pick the account whose `organisationId` is the one above.
2. `requestSignin(email, accountId) { debugPin }` (QA returns the PIN; it also emails it).
3. `signin(pin) { expire { ts } }` sets the session cookie.

## Framing rules

- DPR 2 always. Full views at 1440×900; below 1440 wide the app switches to its compact layout and hides the sidebar.
- Panels and dialogs: capture a clip of the element, not a crop. Dialogs get a 24 px margin so the overhanging close button is not cut. Open dialogs with no side panel behind them, so the dimmed margin stays clean.
- Hide the Intercom launcher and the Beta badge with the style in `../SKILL.md` before each capture. Move the mouse to an empty corner so no hover state leaks in.
- Show the state the page describes (expanded hierarchy, a person with tags from several categories).

## Scenes done

| Page | Image | Scene |
| --- | --- | --- |
| `help/documentation/tags.mdx` | `tags/tags-list.webp` | Tags, Department, all three divisions expanded, Engineering clicked (detail panel open), 1440×900 |
| `help/documentation/tags.mdx` | `tags/tags-level-names-dialog.webp` | Tags, gear next to Department (no panel open), dialog clip |
| `help/documentation/tags.mdx` | `tags/tags-person-panel.webp` | People, Elena Rossi, Tags panel, clip of the panel section |

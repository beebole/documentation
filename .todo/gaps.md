# Gaps report

Generated: 2026-08-24 (release run, production deploy 2026-08-23)
Catalog last updated: 2026-08-24

---

## Coverage gaps → undocumented features

Unchanged catalog entries were verified Covered in the 2026-08-17 release run and re-checked only where this deploy touched them; the entries below come from the 2026-08-24 catalog sync.

### Time Tracking

- [ ] Partial | `help/documentation/ai.mdx` | `time-tracking/suggestions` — needs: add the **Planned** source (tasks planned for you become suggestions) and the **Web** badge name to the sources table; describe merged/ranked suggestion cards (overlaps merge into one card, measured activity outranks assumptions, reduced by time already logged); per-source **Why?** evidence (planned dates and share, habit weeks seen, sites/apps behind tracked time); live refresh and the rule that suggestions never land on locked days, holidays, full-day absences, or submitted periods
- [ ] Partial | `help/documentation/timesheetSettings.mdx` | `time-tracking/suggestion-autopilot` — needs: Auto-submit section must say the deadline now converts pending suggestions into real entries and submits through the normal approval flow; failed periods stay drafts badged "Auto-submit failed" with admins notified; reminders announce the auto-submit deadline. Cross-check `help/documentation/ai.mdx` for any "nothing is submitted automatically" claim and update it to reflect auto-submit
- [ ] Partial | `help/documentation/timesheetSettings.mdx` | `time-tracking/auto-timesheet` — needs: Kanban auto-timesheet always proposes suggestions now — it never writes entries directly; accepted entries record their source
- [ ] Partial | `help/documentation/timesheetSettings.mdx` | `time-tracking/entry-restrictions` — needs: new restriction **Only an admin can edit someone else's timesheet**

### Reporting

- [ ] Partial | `help/documentation/reports.mdx` | `reports/folders` — needs: folders are personal — you see your own folders plus folders shared with you
- [ ] Partial | `help/documentation/reports.mdx` | `reports/folder-sharing` — needs: new section on sharing a folder (**Share** action) with specific people or tags (a tag includes its sub-tags); shared folders are view-only for recipients, owner keeps control
- [ ] Partial | `help/documentation/reports.mdx` | `reports/timesheet-compliance` — needs: the "no time record yet" footnote expands to list the people who haven't started tracking time

### Project Management

- [ ] Partial | `help/documentation/budgets.mdx` | `projects/budgets` — needs: budgets carry a start date (a project can hold several budgets over time, each applying from its date; "From the start" is the default); quantity can be stated in hours or days (days measured against each person's schedule); free-text note per budget shown on its card; quantity/billing/cost fields can be left empty

### Authentication & Security

- [ ] Partial | `help/documentation/authentication.mdx` | `auth/passkeys` — needs: signing in to the desktop app hands off to the browser, so passkeys and SSO work there (mention on `help/documentation/desktop-app.mdx` too)

**Intentionally undocumented (status-flagged in the catalog — not gaps):**

- `tasks/recurring` — _(status: hidden-flag)_ recurrence creation still behind `SHOW_TASK_RECURRENCE = false`.
- `org/gdpr` — _(status: placeholder-ui)_ inert menu entries; deliberately not documented.
- `absence/accrual` — _(status: partial)_ documented hedged on `accruals.mdx`.
- `reports/money-authorisations` — Planned-section entry _(status: partial — frontend guard only)_; do not document until the all-channel enforcement ships.

**Skipped sections:** Planned Features (7 entries), Internal (11 entries) — per skill rules.

---

## Proposed page-mappings additions

- Keywords: `report folder sharing, share folder, shared folder, folder share` → proposed page: `help/documentation/reports.mdx`
- Keywords: `plan on non-working days, non-working days, task calendar` → proposed page: `help/documentation/gantt.mdx`

---

## Handoff to /write

Next step: run `/write <path>` for each **Partial** entry above with its `needs:` note (release run: Partial entries are not skipped). No **Missing** entries this run.

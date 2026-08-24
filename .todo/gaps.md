# Gaps report

Generated: 2026-08-24 (verification pass, release run)
Catalog last updated: 2026-08-24

---

## Coverage gaps → undocumented features

_All features covered._

The 9 Partial entries from this run's earlier report (2026-08-23 production deploy) were all resolved in the same run:

- Five suggestion sources with badges, merged/ranked cards, per-source **Why?** evidence, refresh behavior — `ai.mdx`
- Suggestion autopilot (auto-submit converts pending suggestions, **Auto-submit failed** badge, deadline reminders) — `timesheetSettings.mdx` + `ai.mdx`
- Kanban auto-timesheet always suggesting (direct fill removed) — `timesheetSettings.mdx`
- New restriction **Only an admin can edit someone else's timesheet** — `timesheetSettings.mdx`
- Personal report folders + new **Share a report folder** section — `reports.mdx`
- Compliance footnote expandable people list — `reports.mdx`
- Budget start dates, hours/days unit, notes, empty targets, several budgets over time — `budgets.mdx`
- Desktop app browser-handoff sign-in (passkeys/SSO) — `authentication.mdx` + `desktop-app.mdx`

The review pass additionally corrected pre-existing drift found against prod code (sample report folders, report filters, Budget Status **Time** label, Planned vs. Real single-plan selector, passkey once-per-account, API-key label, email-code expiry, approval email description, budget **From** default).

**Intentionally undocumented (status-flagged in the catalog — not gaps):**

- `tasks/recurring` — _(status: hidden-flag)_ recurrence creation still behind `SHOW_TASK_RECURRENCE = false`.
- `org/gdpr` — _(status: placeholder-ui)_ inert menu entries; deliberately not documented.
- `absence/accrual` — _(status: partial)_ documented hedged on `accruals.mdx`.
- `reports/money-authorisations` — Planned-section entry _(status: partial — frontend guard only)_.
- `reports/schedule-email` — _(status: hidden-flag, flagged 2026-08-24)_ the **Schedule** action is gated off in production; the reports.mdx section documenting it was removed this run. Re-document when the gate lifts.

**Skipped sections:** Planned Features (7 entries), Internal (11 entries) — per skill rules.

---

## Proposed page-mappings additions

_No new mappings needed._ (Two rows were added earlier in this run for report folder sharing and plan-on-non-working-days.)

---

## Handoff to /write

Nothing to draft. Next `/sync-features --incremental` after the next prod deploy will surface new work; re-run `/find-gaps` after it.

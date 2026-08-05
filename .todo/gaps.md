# Gaps report

Generated: 2026-08-05
Catalog last updated: 2026-08-04

---

## Coverage gaps → undocumented features

_All features covered._

Every entry in the catalog's user-facing sections maps to a documentation page and is classified **Covered** (verified 2026-08-05, following the 2026-08-04 write batch, review fixes, and Partial-entry passes).

**Intentionally undocumented (status-flagged in the catalog — not gaps):**

- `tasks/recurring` — _(status: hidden-flag)_ recurrence creation is still behind `SHOW_TASK_RECURRENCE = false`; do not document until creation ships.
- `org/gdpr` — _(status: placeholder-ui)_ the Export your data / GDPR menu entries are inert; deliberately not documented.
- `absence/accrual` — _(status: partial)_ documented hedged on `accruals.mdx` (manual **Accrued** adjustments only); un-hedge when the awarding engine ships.

**Skipped sections:** Planned Features (7 entries), Internal (11 entries) — per skill rules.

---

## Proposed page-mappings additions

_No new mappings needed._

---

## Handoff to /write

Nothing to draft. Next `/sync-features` (recommended `--incremental` after the next prod deploy) will surface new work; re-run `/find-gaps` after it.

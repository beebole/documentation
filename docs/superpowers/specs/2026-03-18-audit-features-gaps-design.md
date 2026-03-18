# Design: `audit-features-gaps` skill

**Date:** 2026-03-18
**Status:** Approved

---

## Purpose

A slash command (`/audit-features-gaps`) that audits the documentation repository against `.features/features.md` at the sub-feature level. For every user-facing feature bullet that is missing or only partially documented, it generates a numbered plan of action and a compact quick-reference index.

---

## SKILL.md structure

The resulting SKILL.md must begin with YAML frontmatter:

```yaml
---
name: audit-features-gaps
description: "Check .features/features.md against the documentation and produce a numbered plan of action for every undocumented or partially documented sub-feature. Use when asked which features are missing from the docs, what needs to be written, or to get a coverage audit."
disable-model-invocation: true
---
```

`disable-model-invocation: true` ensures the skill only runs when explicitly invoked via `/audit-features-gaps`.

---

## Inputs

- `.features/features.md` — source of truth for all features
- `help/documentation/*.mdx`, `help/guides/*.mdx`, `help/integrations/*.mdx`, `help/api/*.mdx` — pages to check coverage against
- `.claude/context/page-mappings.md` — updated as a side effect

No user arguments required. The skill is self-contained.

---

## Exclusions

The following sections of `features.md` are **skipped entirely**:

- **Section 25 — Planned Features** — not yet shipped, no docs needed yet
- **Internal (Non User-Facing)** — infrastructure concerns, not documented for end users

---

## Workflow

### Step 1 — Parse features.md

Read `.features/features.md`. Extract all bullet points from sections 1–24. Ignore sections 25 (Planned Features) and the Internal section at the bottom.

For each bullet, record:

- Parent section number and name
- Bullet text (feature name + description)

**Format guard:** After parsing, count extracted sections and bullets. If section count is not between 20 and 26, or bullet count is below 100, halt immediately and print:

> "Warning: features.md may have changed format. Found N sections and N bullets — expected 20–26 sections and 100+ bullets. Please check the file before re-running."

**Section matching:** Match sections by their number (e.g., `## 3.`). Section names in the mapping table below are for human reference only — use the number as the authoritative key.

### Step 2 — Verify the mapping table is complete

Before applying the static mapping, list all files under:

- `help/documentation/`
- `help/guides/`
- `help/integrations/`
- `help/api/`

Compare against the mapping table below. For any file found on disk that is not in the table, reason about which feature section it belongs to and include it in the read list for that section. Log a note in the output: "Note: unmapped page `X` was found and added to section Y during this run."

### Step 3 — Map feature sections to pages

Use the mapping table below. Sections flagged "Page does not exist" are **full gaps** — all bullets in that section are automatically Missing; skip to Step 5 for those sections.

| Section | Pages to read | Notes |
| --- | --- | --- |
| 1. Time Tracking | `help/documentation/timesheets.mdx`, `help/documentation/timesheetSettings.mdx`, `help/documentation/mobile.mdx` | |
| 2. Absence & Time-Off Management | `help/documentation/timeoff.mdx`, `help/documentation/accruals.mdx`, `help/documentation/public-holidays.mdx` | |
| 3. Time Entries & Absences Approval Workflows | `help/documentation/approval.mdx` | |
| 4. Planning & Tasks | `help/documentation/planning.mdx`, `help/documentation/kanban.mdx`, `help/documentation/gantt.mdx`, `help/documentation/assignments.mdx` | |
| 5. Expense Management | `help/documentation/expenses.mdx` | |
| 6. People Management | `help/documentation/people.mdx` | |
| 7. Project Management | `help/documentation/projects.mdx` | |
| 8. Task Management | `help/documentation/tasks.mdx` | Page does not exist → full gap |
| 9. Tags & Organisational Structure | `help/documentation/tags.mdx` | |
| 10. Billing & Cost Tracking | `help/documentation/billing.mdx`, `help/documentation/costs.mdx`, `help/documentation/budgets.mdx` | |
| 11. Work Schedules | `help/documentation/work-schedule.mdx` | |
| 12. Roles & Permissions | `help/documentation/roles-authorisations.mdx` | |
| 13. Custom Fields | `help/documentation/custom-fields.mdx` | |
| 14. Organisation Settings | `help/documentation/account-settings.mdx`, `help/documentation/timesheetSettings.mdx` | |
| 15. Reporting | `help/documentation/reports.mdx`, `help/documentation/custom-reports.mdx`, `help/documentation/data-exports.mdx`, `help/documentation/excel-addin.mdx`, `help/documentation/gsheets-addon.mdx` | |
| 16. Journal & Communications | `help/documentation/journal.mdx` | |
| 17. Notifications | `help/documentation/notifications.mdx` | |
| 18. Integrations | `help/integrations/introduction.mdx`, `help/integrations/asana.mdx`, `help/integrations/jira.mdx`, `help/integrations/linear.mdx`, `help/integrations/quickbooks.mdx`, `help/integrations/custom-integrations.mdx`, `help/integrations/google.mdx`, `help/integrations/microsoft.mdx`, `help/integrations/google-calendar.mdx`, `help/integrations/microsoft-calendar.mdx` | BambooHR: check custom-integrations.mdx |
| 19. API | `help/api/introduction.mdx`, `help/api/queries.mdx`, `help/api/mutations.mdx`, `help/api/schema-explorer.mdx` | |
| 20. Authentication & Security | `help/documentation/authentication.mdx`, `help/documentation/sso.mdx`, `help/documentation/custom-domain.mdx` | |
| 21. Subscription & Billing | `help/documentation/subscription.mdx` | |
| 22. Audit Trail | `help/documentation/audit-trail.mdx` | |
| 23. Legacy Migration | `help/guides/legacy-migration.mdx` | Page does not exist → full gap |
| 24. UI & User Experience | `help/documentation/ui-experience.mdx` | Page does not exist → full gap |

### Step 4 — Read pages and classify sub-features

For each section that has at least one existing mapped page, read those pages. Then evaluate each feature bullet against the content.

Classify each bullet as:

- **Covered** — the feature has at least one dedicated paragraph, a named heading, or a step-by-step explanation. Brief but deliberate coverage counts.
- **Partial** — the feature appears only as a passing mention, a single sentence with no how-to, or a list item with no elaboration.
- **Missing** — no mention or coverage found anywhere in the mapped pages.

Decision rule for the Covered/Partial boundary: if a reader could understand *how* to use the feature from what's written, it's Covered. If they'd only know the feature *exists*, it's Partial.

Only **Missing** and **Partial** bullets produce plan entries. Covered bullets are silently skipped.

For sections whose mapped page does not exist, all bullets in that section are automatically **Missing**.

### Step 5 — Write `.todo/coverage-gaps.md`

If `.todo/` does not exist, create it first.

Overwrite (do not append) `.todo/coverage-gaps.md` with two blocks:

#### Block 1 — Plan of action

```markdown
# Feature Coverage Gaps

Generated: YYYY-MM-DD
Features audited: N user-facing feature bullets
Gaps found: N (N missing, N partial)

---

## Plan of action

1. **[Section name] Short action title** — One sentence describing what to write or add.
2. ...
```

Items are ordered by feature section (1 → 24). Within each section, Missing items come before Partial items.

Each item must include:

- Section name in brackets
- An actionable title (e.g. "Create `tasks.mdx`", "Document timesheet score", "Add WFH flag to timesheets.mdx")
- A one-sentence description of what's needed

For sections with no existing page, produce a single plan item: "Create `<path>` — Document all N features in this section: [comma-separated list of feature names]."

#### Block 2 — Quick-reference index

```markdown
## Quick reference

1. Create tasks.mdx
2. Timesheet score
3. Admin force-edit
...
```

Same numbers as Block 1. One line per item, no descriptions. Used for referencing items during execution (e.g. "work on item 7").

### Step 6 — Update `.claude/context/page-mappings.md`

After writing the output, update the keyword→page table in `page-mappings.md`:

- Add any keyword→page relationships discovered during the audit that are not already in the table
- Add rows for the three planned new pages so future skills know they're expected:
  - `task, task management` → `help/documentation/tasks.mdx`
  - `legacy, migration, legacy account` → `help/guides/legacy-migration.mdx`
  - `ui, interface, theme, dark mode, undo, search` → `help/documentation/ui-experience.mdx`
- New rows must follow the existing format: `| keywords, comma-separated | \`path(s)\` |`
- Check for semantic overlap with existing rows before adding — don't duplicate a keyword that already maps to the same page
- Never remove or overwrite existing rows

### Step 7 — Print to chat

Print both blocks to chat. Also print a one-line summary at the top:

> "Found N gaps (N missing, N partial) across N feature sections. Full plan saved to `.todo/coverage-gaps.md`."

---

## Output files

| File | Purpose |
| --- | --- |
| `.todo/coverage-gaps.md` | Primary output — plan + quick reference (overwritten each run) |
| `.claude/context/page-mappings.md` | Updated keyword→page routing table (additive only) |

---

## Rules

- **Read-only on doc pages.** Never modify documentation files during this audit.
- **Sub-feature granularity.** Each bullet in features.md is evaluated independently — don't collapse multiple bullets into one gap entry unless the entire section has no page.
- **Be specific.** Each plan item must name the exact page and feature, not just the section.
- **Don't invent gaps.** If a feature is reasonably covered even without matching exact wording, classify it as Covered.
- **Ordered output.** Plan items follow section order (1–24) for predictability.
- **Idempotent.** Re-running the skill overwrites `.todo/coverage-gaps.md` with a fresh audit. It does not append.

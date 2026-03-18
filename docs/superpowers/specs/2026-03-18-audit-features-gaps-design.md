# Design: `audit-features-gaps` skill

**Date:** 2026-03-18
**Status:** Approved

---

## Purpose

A slash command (`/audit-features-gaps`) that audits the documentation repository against `.features/features.md` at the sub-feature level. For every user-facing feature bullet that is missing or only partially documented, it generates a numbered plan of action and a compact quick-reference index.

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

### Step 2 — Map feature sections to pages

Use the static mapping table below to determine which page(s) to read for each section. Sections with no matching page are flagged immediately as **full gaps** — no reading required.

| Section | Pages to read | Notes |
|---|---|---|
| 1. Time Tracking | `help/documentation/timesheets.mdx`, `help/documentation/timesheetSettings.mdx`, `help/documentation/mobile.mdx` | |
| 2. Absence & Time-Off | `help/documentation/timeoff.mdx`, `help/documentation/accruals.mdx`, `help/documentation/public-holidays.mdx` | |
| 3. Approval Workflows | `help/documentation/approval.mdx` | |
| 4. Planning & Tasks | `help/documentation/planning.mdx`, `help/documentation/kanban.mdx`, `help/documentation/gantt.mdx` | |
| 5. Expense Management | `help/documentation/expenses.mdx` | |
| 6. People Management | `help/documentation/people.mdx` | |
| 7. Project Management | `help/documentation/projects.mdx` | |
| 8. Task Management | `help/documentation/tasks.mdx` | Page does not exist → full gap |
| 9. Tags | `help/documentation/tags.mdx` | |
| 10. Billing & Cost | `help/documentation/billing.mdx`, `help/documentation/costs.mdx` | |
| 11. Work Schedules | `help/documentation/work-schedule.mdx` | |
| 12. Roles & Permissions | `help/documentation/roles-authorisations.mdx` | |
| 13. Custom Fields | `help/documentation/custom-fields.mdx` | |
| 14. Organisation Settings | `help/documentation/account-settings.mdx`, `help/documentation/timesheetSettings.mdx` | |
| 15. Reporting | `help/documentation/reports.mdx`, `help/documentation/custom-reports.mdx` | |
| 16. Journal | `help/documentation/journal.mdx` | |
| 17. Notifications | `help/documentation/notifications.mdx` | |
| 18. Integrations | `help/integrations/asana.mdx`, `help/integrations/jira.mdx`, `help/integrations/linear.mdx`, `help/integrations/quickbooks.mdx`, `help/integrations/custom-integrations.mdx` | BambooHR: check custom-integrations.mdx |
| 19. API | `help/api/introduction.mdx` | |
| 20. Authentication & Security | `help/documentation/authentication.mdx`, `help/documentation/sso.mdx` | |
| 21. Subscription & Billing | `help/documentation/subscription.mdx` | |
| 22. Audit Trail | `help/documentation/audit-trail.mdx` | |
| 23. Legacy Migration | `help/guides/legacy-migration.mdx` | Page does not exist → full gap |
| 24. UI & UX | `help/documentation/ui-experience.mdx` | Page does not exist → full gap |

### Step 3 — Read pages and classify sub-features

For each section that has at least one existing mapped page, read those pages. Then evaluate each feature bullet against the content.

Classify each bullet as:

- **Covered** — the feature is clearly documented, even if briefly
- **Partial** — the topic is mentioned but lacks meaningful explanation (e.g. only a passing reference, no how-to)
- **Missing** — no mention or coverage found

Only **Missing** and **Partial** bullets produce plan entries. Covered bullets are silently skipped.

For sections whose mapped page does not exist, all bullets in that section are automatically classified as **Missing**.

### Step 4 — Write `.todo/coverage-gaps.md`

Write the output file with two blocks:

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

#### Block 2 — Quick-reference index

```markdown
## Quick reference

1. Create tasks.mdx
2. Timesheet score
3. Admin force-edit
...
```

Same numbers as Block 1. One line per item, no descriptions. Used for referencing items during execution (e.g. "work on item 7").

### Step 5 — Update `.claude/context/page-mappings.md`

After writing the output, update the page-mappings.md keyword table:

- Add any missing keyword→page rows discovered during the audit
- Add rows for the three planned new pages (`tasks.mdx`, `legacy-migration.mdx`, `ui-experience.mdx`) so future skills know they exist
- Do not remove or overwrite existing rows — only add or correct

### Step 6 — Print to chat

Print both blocks (plan of action + quick reference) to the chat after saving the file. Also print a one-line summary:

> "Found N gaps across N feature sections. Saved to `.todo/coverage-gaps.md`."

---

## Output files

| File | Purpose |
|---|---|
| `.todo/coverage-gaps.md` | Primary output — plan + quick reference |
| `.claude/context/page-mappings.md` | Updated keyword→page routing table |

---

## Rules

- **Read-only on doc pages.** Never modify documentation files during this audit.
- **Sub-feature granularity.** Each bullet in features.md is evaluated independently — don't collapse multiple bullets into one gap entry unless they all belong to a page that simply doesn't exist.
- **Be specific.** Each plan item must name the exact page and feature, not just the section.
- **Don't invent gaps.** If a feature is reasonably covered even without matching exact wording, classify it as Covered.
- **Ordered output.** Plan items follow section order (1–24) for predictability.
- **Idempotent.** Re-running the skill overwrites `.todo/coverage-gaps.md` with a fresh audit. It does not append.

---
name: propose-updates
description: Map tracked app changes to documentation pages, audit them against source code, and produce a prioritized report of proposed updates
disable-model-invocation: true
---

# Propose Documentation Updates

Read the app changes tracker, map each change to affected documentation pages, audit those pages against the source code, and produce a prioritized report of proposed documentation updates — without making any changes.

## When to use

When the user runs `/propose-updates` or asks to "propose doc updates", "what docs need updating", "map changes to docs", or "what should we update".

## Prerequisites

- `.todo/app-changes.md` must exist and contain tracked app changes. If it doesn't exist or is empty, run the `/track-app-changes` skill first to populate it.
- `gh` CLI must be installed and authenticated (used to fetch source code from GitHub for verification).

## Inputs

The user may optionally provide:
- **A date range** — only consider app changes within this range (e.g., "since March 3")
- **A feature filter** — only consider changes matching a keyword (e.g., "just approval changes")
- **`--all`** — ignore the cursor and reprocess all changes from scratch

If no inputs are given, process only changes since the last run.

## Workflow

### 1. Determine which changes to process

#### 1a. Find the cursor

Check if `.todo/proposed-updates.md` exists.

- **If it exists:** Read the `Last proposed up to:` date at the top. This is the cursor — only process app changes **after** this date.
- **If it does not exist:** This is the first run. Process all entries in `.todo/app-changes.md`.

#### 1b. Collect new changes

Read `.todo/app-changes.md` and collect only entries with dates **after** the cursor date. If the user provided a date range or keyword filter, apply it on top.

If there are no new entries to process, report "No new app changes to analyze since [cursor date]" and stop.

### 2. Map changes to documentation pages

For each app change entry, determine which documentation page(s) it affects.

#### Mapping strategy

1. **Keyword matching** — Match the change description against existing page titles, filenames, and frontmatter descriptions across `help/documentation/`, `help/guides/`, `help/integrations/`, and `help/api/`.
2. **Feature area inference** — Use these common mappings:

   | Keywords in change | Likely page(s) |
   |---|---|
   | approval, approve, pending | `help/documentation/approval.mdx` |
   | timesheet, time entry | `help/documentation/timesheets.mdx` |
   | project, sub-project | `help/documentation/projects.mdx` |
   | tag, tagging, classify | `help/documentation/tags.mdx` |
   | schedule, work schedule | `help/documentation/work-schedule.mdx` |
   | report, reporting, custom report | `help/documentation/reports.mdx`, `help/documentation/custom-reports.mdx` |
   | custom field | `help/documentation/custom-fields.mdx` |
   | time off, absence, leave, accrual | `help/documentation/timeoff.mdx`, `help/documentation/accruals.mdx` |
   | people, person, user, archive | `help/documentation/people.mdx` |
   | notification, reminder, email | `help/documentation/journal.mdx` or new page |
   | journal, feed | `help/documentation/journal.mdx` |
   | planning, task, gantt, kanban | `help/documentation/planning.mdx`, `help/documentation/gantt.mdx`, `help/documentation/kanban.mdx` |
   | budget | `help/documentation/budgets.mdx` |
   | cost, rate, billing | `help/documentation/costs.mdx` |
   | integration, jira, asana, linear | `help/integrations/*.mdx` |
   | onboarding, signup | `help/documentation/quickstart.mdx` |
   | SSO, passkey, login, auth | `help/documentation/sso.mdx` or `help/documentation/account-settings.mdx` |
   | role, permission, authorisation | `help/documentation/roles-authorisations.mdx` |
   | expense | `help/documentation/expenses.mdx` |
   | export | `help/documentation/data-exports.mdx` |
   | public holiday | `help/documentation/public-holidays.mdx` |
   | subscription, billing, plan | `help/documentation/subscription.mdx`, `help/documentation/billing.mdx` |

3. **No match found** — If a change doesn't map to any existing page, flag it as a potential **new page** or **new section** candidate.

#### Skip non-doc changes

Exclude changes that don't need documentation updates:
- CSS-only fixes with no behavioral change
- Internal tooling (translation tooling, analytics, CI/CD)
- Infrastructure-only changes (websockets, reverse proxy) unless they introduce user-visible behavior

### 3. Assess each affected page

For each documentation page identified in step 2, assess its current state:

#### 3a. Read the page

Read the `.mdx` file. Classify it as:
- **Stub** — Only frontmatter, no body content
- **Draft** — Has content but includes writing guidance, placeholders, or TODO markers
- **Published** — Has real, user-facing content

#### 3b. Check content against the change

For each mapped app change, determine:
- **Already documented** — The page already covers this behavior accurately
- **Needs update** — The page exists and has content, but the specific change is not reflected
- **Needs new section** — The page exists but the change requires a new section (not just an edit)
- **Page is a stub/draft** — The entire page needs to be written; the change is just one of many gaps

#### 3c. Verify against source code (when needed)

For changes that are ambiguous from the changelog description alone, fetch the relevant source code to understand what actually changed:

```bash
# Fetch i18n labels for UI terminology
gh api repos/beebole/reboot/contents/shared/i18n/languages/en.json --jq '.content' | base64 -d

# Search for relevant source files
gh api "repos/beebole/reboot/git/trees/master?recursive=1" --jq '.tree[].path' | grep -i KEYWORD

# Read a specific source file
gh api repos/beebole/reboot/contents/{path} --jq '.content' | base64 -d
```

Only do this when the changelog entry is vague and you need to understand the actual feature behavior. Don't fetch source code for changes that are self-explanatory.

### 4. Compile the proposal report

**Do NOT make any changes to documentation files.** Present findings as a structured report.

Group proposed updates by priority:

```
## Proposed documentation updates

**Based on:** [count] app changes from .todo/app-changes.md
**Period:** [earliest date] to [latest date]
**Pages affected:** [count]

---

### Priority 1 — Stub pages that need writing

These pages exist but have no content. The app changes make them more urgent.

| Page | Status | Related app changes | What to write |
|------|--------|-------------------|---------------|
| `help/documentation/approval.mdx` | Stub | Approval reminders, approval routing, approval UI | Full page: approval workflow, reminder settings, navigation |

### Priority 2 — Existing pages that need updates

These pages have published content but are missing information about recent changes.

| Page | What changed in the app | What to update in the docs |
|------|------------------------|---------------------------|
| `help/documentation/tags.mdx` | Tags as relations with date overlaps | Add new section on relational tags |

### Priority 3 — New pages or sections needed

These changes don't map to any existing page.

| App change | Recommendation |
|-----------|---------------|
| Passkey authentication | Add section to SSO page or create new auth page |

### Priority 4 — Minor or no doc impact

These changes were reviewed and determined to need no documentation update, or only cosmetic changes.

| App change | Reason skipped |
|-----------|---------------|
| CSS fixes | No behavioral change |

---

### Recommended next steps

1. [Ordered list of what to work on first, based on user impact]
2. ...

Want me to start working on any of these? I can write pages, update sections, or run `/audit-code` on specific pages for a deeper cross-reference.
```

### 5. Save the proposal and advance the cursor

Write results to two files:

- **`.todo/proposed-updates.md`** — The active, actionable file. Contains only the cursor and the current proposals with statuses.
- **`.todo/proposed-log.md`** — Append-only audit trail. Each run appends the processed changes mapping so there's a historical record.

#### Format of `.todo/proposed-updates.md`

```markdown
# Proposed Documentation Updates

Last proposed up to: YYYY-MM-DD
Last generated: YYYY-MM-DD

[The full report from step 4, with a Status column on every proposal table]
```

Every proposal row must include a **Status** column with one of: `pending`, `in progress`, `done`, `skipped`. New proposals start as `pending`. When the user works on an item (via `/draft`, manual edit, etc.), update the status accordingly.

**Cursor rule:** Set `Last proposed up to:` to the **date of the most recent app change entry** that was processed in this run. On the next run, only entries after this date will be picked up.

**Appending vs overwriting:** On subsequent runs, **merge** new proposals into the existing file — add new rows, keep existing rows and their statuses intact, and update the cursor. Do not duplicate proposals that already exist.

#### Format of `.todo/proposed-log.md`

```markdown
# Proposed Updates Log

## Run: YYYY-MM-DD

**Changes processed:** [count] from [earliest date] to [latest date]

- **YYYY-MM-DD** — [change description] → [mapped page or "new page needed"] — [assessment: stub/needs update/needs section/no impact]
- ...

## Run: YYYY-MM-DD (previous run)
...
```

Each run appends a new `## Run:` section at the top (reverse chronological). This file is never edited — only appended to.

### 6. Output

After saving, print the report to the user and ask:

> "Want me to start working on any of these? I can tackle them in priority order, or you can pick specific items."

Do NOT make any documentation changes until the user confirms.

## Rules

- **Read-only by default.** Never modify documentation files. Only write to `.todo/proposed-updates.md`.
- **Be specific.** For each proposed update, state exactly what content needs to change and why.
- **Don't invent features.** Only propose updates based on what the app changelog says and what the source code confirms. If unsure, mark as "needs verification".
- **Group related changes.** Multiple changelog entries about the same feature should produce one proposal, not duplicates.
- **Consider all three languages.** When proposing an update, note that FR and ES versions will also need the same change.
- **Respect scope.** Only propose changes that relate to tracked app changes. Don't expand into a full site audit — that's what `/audit-code` and `/audit-seo-geo` are for.

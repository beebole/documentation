# Docs signals

Proposed fixes from reader signals outside the docs assistant: Intercom support conversations, Mintlify searches with no click, page feedback, and 404s on `/help/*`. Written by `/mine-signals`; see that skill for the sources and the method.

Mined through: 2026-10-04T21:00:00Z
Mode: report-only (trial since 2026-10-04)

Tick an entry to approve it. Nothing here is applied automatically: approved fixes are made by hand or with `/write <path>`, and the entry is then marked `Done YYYY-MM-DD (PR #N)` (see "Tracking entries" in the mine-signals skill).

---

## Run 2026-10-04

First run, window 2026-09-04 → 2026-10-04 (30 days). All eight fixes were approved by Yves and applied the same day.

### Proposed fixes

- [x] HIGH | `docs.json` | Add a redirect `/help/faq` → `/help/guides/faq`. — evidence: 404s: 5 views by 5 visitors (2026-09-04 to 2026-10-02), arriving from Google and from beebole.com/about. The FAQ lives at `/help/guides/faq`; nothing answers `/help/faq`. Done 2026-10-04 (PR #59).
- [x] HIGH | `help/documentation/timesheets.mdx` (FAQ) and `help/guides/faq.mdx` | Add "Can I import hours from Excel or a CSV file?": no, the timesheet has no file import for hours (as the page already says at "The timesheet itself has no import button…"); to load many entries at once, use the [MCP server](/help/integrations/mcp-server) or the API, which accept many time entries in one request; pasting from a spreadsheet only adds people, projects, tags and tasks. Add `import hours`, `import time from Excel`, `CSV` to the keywords. — evidence: searches: "how to import time from excel" (6, readers clicked the Planning task-import FAQ) and "bulk import of hours" (6, clicked the public holidays import FAQ); Intercom: 2 conversations (2026-09-16) asking how to bring time entries from a CSV or another Beebole account. The answer exists, readers land on the wrong page. Done 2026-10-04 (PR #59): the timesheets FAQ already existed ("Can I bulk import time entries from a file or spreadsheet?", answering yes through the MCP server or the API), so it was retitled "Can I import hours from Excel, a CSV file, or a spreadsheet?", the keywords got import hours, import time from Excel and CSV import, and guides/faq.mdx got "Can I import hours from Excel or a CSV file?" linking to it.
- [x] MEDIUM | `help/integrations/microsoft-calendar.mdx` and `help/integrations/google-calendar.mdx` | In the section on assigning events, say that the calendar pane is in the grid view only: in the calendar view, switch with the **Grid view** button first (as `timesheets.mdx` states in its view comparison table). — evidence: Intercom: 1 conversation (2026-09-23), a customer could not drag Outlook events while in the calendar view and pointed out that `microsoft-calendar#drag-to-assign` does not say which view; support confirmed grid only. Done 2026-10-04 (PR #59): also said in the "Open the calendar pane" step of both pages.
- [x] MEDIUM | `help/documentation/timesheets.mdx` | Document the task row menu action **Set as done**: it archives the task (shown to people who can manage tasks), the row leaves the timesheet, and hours already logged on the task stay on the timesheet and in reports (the timesheet loads archived tasks that entries refer to, `frontend/src/services/timesheet.ts`). — evidence: Intercom: 2 conversations (2026-09-15, 2026-09-27), "the task completely disappears" and "does the time disappear before I submit?". Done 2026-10-04 (PR #59).
- [x] MEDIUM | `help/documentation/reports.mdx` (FAQ) | Add "Why do report hours look different from my timesheet?": reports always show hours as decimals with two places, whatever the timesheet's **Duration format**, so 3:15 on the timesheet is 3.25 in a report (`report-matrix.ts`). — evidence: Intercom: 1 conversation (2026-09-18), a payroll run where reports seemed 0.1 h off per person; support found the totals matched and the difference was hh:mm against decimals. Done 2026-10-04 (PR #59).
- [x] LOW | `help/documentation/timesheets.mdx` (FAQ) | Add "Why does the timer round my time up?": the timer rounds to the **Minimum time interval accepted** set by an administrator in Timesheet settings (15 minutes is common); lowering it changes the rounding. The page says it only inside the timer steps. — evidence: Intercom: 1 conversation (2026-09-16), "the timer rounds up to the nearest 15 minutes, can I turn that off?". Done 2026-10-04 (PR #59).
- [x] LOW | `help/integrations/quickbooks.mdx` | Add `QBO` and `QuickBooks Desktop` to the keywords and a FAQ "Does Beebole work with QuickBooks Desktop?" (no: the integration connects to QuickBooks Online). — evidence: searches: "quickbooks" (3), "qbo" (1), "qbd" (1), all without a click. Done 2026-10-04 (PR #59): the FAQ "Does the integration work with QuickBooks Desktop?" already existed, so only the keywords QBO, QuickBooks Desktop and QBD were added.
- [x] LOW | `docs.json` | Add a redirect `/help/tags` → `/help/documentation/tags`. — evidence: 404s: 1 visitor (2026-09-29), a short URL that guesses the page. Done 2026-10-04 (PR #59).

### No action

- 404 `/help/integrations/mcp-serve` (2 views): a typo of `mcp-server`.
- 404 `/help/googleFolders` (1 view): an old Legacy in-app help key (Google Drive folders, a Legacy feature).
- 404 `/help/contact` (2 views, after Legacy pages): no contact page exists, and the docs' **Contact us** link is a mailto in the navigation; nothing in `help/**` links to `/help/contact`.
- Long sentence-like searches with no click ("a pie chart of only my hours…", "a report of all the time booked for one client", "a report to show all active subprojects", "as an admin, how to undo timesheet approval"): typed into the search bar and handed to the assistant, so `/mine-conversations` covers them. The approval FAQ already answers undoing an approval ("How do I reopen an approved timesheet…").
- Searches in French ("comment puis-je actualiser", "soumettre"): language demand, the site is English-only for now.
- Not a doc fix, product (bugs, reported to the team by support): timesheet date off by one day, timesheet period selector not syncing, scrollbar disappearing after "sign in as", start and end times lost after editing, time entry text disappearing, project manager time entry error, tag folder access, Excel add-in error after a reports change, QuickBooks export rounding minutes (fixed).
- Not a doc fix, feature requests: default value for a checkbox custom field, a picture on a custom field, Gantt export to PDF or Excel, report export to SharePoint, landscape PDF, daily totals without time off, saved Journal views, a denser layout.
- Not a doc fix, account and access: sign-in, email code, password reset and SSO problems (6), Microsoft 365 admin consent for the calendar (tenant setting, answered by support), the expired certificate on beebole-apps.com (2).
- Not a doc fix, sales and billing: Legacy-to-new migration and subscription switches (about 15), invoices, refunds and seat counts.

### Sources

- Intercom: 186 conversations updated in the window; 32 dropped as noise (sales form and n8n 8, Beebole staff 21, Mintlify form relays 3); 130 created in the window read; 12 about documentation; about 35 spam or vendor pitches. Support replies linked a docs page twice (`approval`, and a Legacy API page).
- Searches: 178 searches, 152 distinct strings, 51 terms after folding typing prefixes; 30 without a click.
- Feedback: 0 votes. The Mintlify feedback API returns nothing at all (feedback collection is probably off in the Mintlify dashboard), and PostHog autocapture recorded no thumbs click on `/help/*` in the window.
- 404s: 5 paths, 11 views (PostHog PROD).

### Release follow-ups

- Production release 2026-10-04: 5 internal notes left in Intercom with a draft reply (1 confirmed, 4 likely), 3 possible matches listed in the run output. Posted 2026-10-04 as a first run of the step.

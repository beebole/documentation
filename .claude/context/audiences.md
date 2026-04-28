# Documentation Audiences

Use this context to tailor language, depth, and assumptions based on who the page is for. Voice rules common to all audiences live in `brand.md`; this file only covers what differs per audience.

## Primary audience: Account administrators

The main readers of the Documentation tab. Office managers, team leads, project managers, accountants, HR staff, or business owners who set up and configure Beebole for their organization.

**What they need:** Full picture of account setup, configuration, permissions, billing, and all features. Comfortable with concepts like rights, approval flows, and reporting.

## Secondary audiences

| Audience | Typical content | Tab |
|----------|----------------|-----|
| **Team leaders / Project managers** | Approving timesheets, running reports, managing their team | Guides |
| **Employees** | Recording time, submitting timesheets, requesting time off | Guides |
| **Developers** | API authentication, queries, mutations | API |
| **Evaluators** (prospects landing from search or AI answers) | What Beebole does, whether it fits their use case | Documentation, Integrations |

## Reading-level and depth targets

| Audience    | Reading level | Sentence length | Concept depth                                    |
| ----------- | ------------- | --------------- | ------------------------------------------------ |
| Admins      | ~10th grade   | 15–20 words     | Can reference permissions, roles, settings paths |
| Managers    | ~9th grade    | 15–18 words     | Day-to-day vocabulary; assume account is set up  |
| Employees   | ~8th grade    | ≤15 words       | Task-focused; minimal Beebole vocabulary         |
| Developers  | No limit      | No limit        | Technical terms expected                         |
| Evaluators  | ~9th grade    | 15–18 words     | Frame around outcomes, not configuration         |

## Writing for each audience

**Admin pages.** Reference settings, permissions, and configuration freely. Explain *why* a setting matters, not just where it lives. Admins are often making decisions for an entire organization.

**Manager pages.** Focus on oversight tasks: approvals, reports, exceptions. Assume someone else built the account. Skip configuration unless the manager controls it.

**Employee pages.** Simplest language. Assume minimal familiarity. One task per page when possible. Avoid Beebole-specific terms where a plain word works ("hours" instead of "time entries" if the meaning is clear in context).

**API pages.** Technical language is fine. Use code samples liberally. Assume the reader knows GraphQL basics.

**Evaluator-facing content** (overviews, integration landing pages, capability summaries). Lead with outcomes ("track time across projects and bill clients accurately"), not features. Defer configuration detail to deeper pages.

## Tone shifts by audience — examples

Same instruction, three audiences:

- **Admin (configuring approval flow):** Approval rules let you decide who validates timesheets before they're locked. Set them in **Settings → Approval rules** to match your reporting hierarchy.
- **Manager (using the flow):** Open **Approvals** in the sidebar to see timesheets waiting for your review. Click **Approve** to validate, or **Reject** to send it back with a comment.
- **Employee (submitting):** When your week is complete, click **Submit**. Your manager reviews it next.

Notice the shift: admins get the *why* and configuration path; managers get the *task and decision*; employees get the *single action*.

## Multi-audience pages

When a page is read by more than one audience, decide which one *acts on the page* and write for them:

- **Admin-configured but employee-used** (e.g., absence types) → Lead with the employee experience. Put admin setup in a separate page or a clearly-scoped section ("For administrators").
- **Manager-only with admin caveats** (e.g., approval workflow) → Write for managers. Reference the admin setup page rather than inlining it.
- **Cross-cutting feature pages** (e.g., custom fields) → Write a neutral overview, then split by role with `<Tabs>` or sibling pages.

If you can't decide, the audience whose *daily work changes* wins over the audience who *configured it once*.

## Locale notes

Audience mix may shift across English, French, and Spanish markets (e.g., more SMB owners in some regions). Locale-specific framing decisions belong in `translation-notes.md`, not here.

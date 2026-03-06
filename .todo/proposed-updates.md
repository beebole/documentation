# Proposed Documentation Updates

Last proposed up to: 2026-03-05
Last generated: 2026-03-06

**Based on:** 27 app changes | **Period:** 2026-03-01 to 2026-03-05 | **Pages affected:** 11

---

## Priority 1 — Stub pages that need writing

These pages exist but have no real content. The app changes make them more urgent.

| Page | Related app changes | What to write | Status |
|------|---------------------|---------------|--------|
| `help/documentation/approval.mdx` | Approval UI, reminders, routing, events (4 changes) | Full page: approval workflow, reminders config, routing, pending view | pending |
| `help/documentation/tags.mdx` | Relational tags, date overlaps, schedule support (3 changes) | Full page: tag management, new relational tags feature | pending |
| `help/documentation/work-schedule.mdx` | Exclusive logic, startTime tags, default on signup (3 changes) | Full page: schedules, assignment, exclusivity, defaults | pending |
| `help/documentation/journal.mdx` | Journal improvements, notification system merged (2 changes) | Full page: journal feed, notification settings, email templates | pending |
| `help/documentation/reports.mdx` | Custom fields in reporting (1 change) | Full page: built-in reports, custom field support | pending |
| `help/documentation/custom-reports.mdx` | Custom fields in reporting (2 changes) | Full page: report builder, custom field columns | pending |
| `help/documentation/custom-fields.mdx` | Custom fields in reporting (1 change) | Full page: creating/managing custom fields | pending |
| `help/documentation/timesheets.mdx` | UI polish (minor) | Core page — needs writing regardless | pending |
| `help/documentation/planning.mdx` | Archived entities in tasks (1 change) | Full page: resource planning, archived entity support | pending |
| `help/documentation/sso.mdx` | Passkey auth improvements (1 change) | Full page: SSO setup, passkey/WebAuthn | pending |
| `help/documentation/account-settings.mdx` | Passkey auth (shared) | Full page: account settings, security | pending |

## Priority 2 — Existing pages that need updates

These pages have content but are missing information about recent changes.

| Page | What changed in the app | What to update in the docs | Status |
|------|------------------------|---------------------------|--------|
| `help/documentation/people.mdx` | Archived people can now be revived/restored | Add section on restoring archived people | pending |
| `help/documentation/quickstart.mdx` | Onboarding UI (Toggle → Checkbox), labels reviewed | Review screenshots and UI references | pending |

## Priority 3 — New pages or sections needed

These changes don't map cleanly to an existing page.

| App change | Recommendation | Status |
|-----------|---------------|--------|
| Notifications system (email templates, absence quotas, settings) | Standalone page or major section in Journal — needs source code verification | pending |
| Navigation improvements (click/meta-click/shift-click) | Add as tips in quickstart or timesheets | pending |
| Mentions feature (editor bug fixes) | Verify if @mentions are user-facing; may need docs | pending |

## Priority 4 — No doc impact

| App change | Reason skipped |
|-----------|---------------|
| Websocket notifications | Infrastructure |
| Timesheet UI polish / CSS fixes | CSS only |
| Translation/language tool | Internal tooling |
| Toast notification revamp | UI chrome |
| Translation engine integration | Internal tooling |
| PostHog analytics | Infrastructure |
| CSS fixes | CSS only |
| Editor/tooltip improvements | UI polish |
| Entity attribute/CSS bug fixes | Bug fix/CSS |
| Linear integration | Already documented |

---

## Recommended next steps

1. **Write the Approval page** — most changes, core feature
2. **Write the Tags page** — new relational tags feature
3. **Write the Work Schedule page** — 3 changes, foundational
4. **Write the Journal & Notifications page** — new notification system
5. **Write Reports + Custom Reports** — custom fields in reporting
6. **Update People page** — quick win, add restore section
7. **Write SSO / Account Settings** — passkey auth
8. **Write remaining stubs** — Timesheets, Planning, Custom Fields

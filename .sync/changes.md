## Sync Report

**Period:** 2026-01-07 to 2026-04-07
**New commits analyzed:** 1,621
**User-facing changes:** ~120 grouped entries
**Pages affected:** 28+

---

### Priority 1 — Stub pages that need writing

| Page | Status | Related changes | What to write |
|------|--------|----------------|---------------|
| `help/documentation/sso.mdx` | **Stub (4 lines)** | ~60 commits: custom SSO providers, auto-user creation, SSO identity binding, multi-org picker, Google Marketplace install flow, domain hints, SSO-only enforcement | Full page: Google/Microsoft/Custom SSO setup, provider configuration (3-tab UI), domain linking, auto-user creation, SSO-only mode, multi-org sign-in, error handling |
| `help/integrations/bamboohr.mdx` | **Missing** | ~10 commits: employee import, absence types, individual schedules, daily absence calculation | New page: BambooHR integration setup, employee sync, absence type import, schedule sync |
| `help/integrations/monday.mdx` | **Missing** | ~5 commits: basic integration scaffolding | New page: Monday.com integration (may be early — verify feature completeness) |

---

### Priority 2 — Existing pages that need major updates

| Page | What changed in the app | What to update in the docs |
|------|------------------------|---------------------------|
| `help/documentation/timesheets.mdx` | Complete UI overhaul (pinned rows, today bold, copy/paste entries, undo/redo, single API call), auto-submit setting, timer redesign (floating, cross-device sync, pulse animation, browser title), reminder with summary before submit, inputs disabled on incomplete rows | Rewrite layout section, add timer section, add auto-submit, add copy/paste, add undo/redo, update screenshots |
| `help/documentation/gantt.mdx` | Canvas-based rendering, dependency arrows, drag-to-move with cascade, grouping (by owner/status/category/tags), per-group expand/collapse, effort display, weekly view for absences | Major rewrite: grouping options, dependency management, drag behavior, effort display |
| `help/documentation/kanban.mdx` | Launched kanban: draggable cards, multi-select drag, column reordering, tag badges, filter by project/person/tag/status, action buttons (archive/delete) | Major rewrite: full kanban workflow, card interactions, filtering, actions |
| `help/documentation/planning.mdx` | Tasks as independent entities with statuses, repetitive/recurring tasks, multi-view (toggle between views), task tags, task assignment, manager-of, related-persons, billing/cost on tasks, effort stored as float | Major rewrite: task lifecycle, statuses, views, assignment, billing |
| `help/documentation/approval.mdx` | Multi-stage approval fully built: configure stages, sequential approve/reject, undo/redo, mobile approval sheet (pending/team tabs), bulk approve/reject, redirect after approval | Update with multi-stage configuration, mobile approval workflow, bulk actions |
| `help/documentation/subscription.mdx` | Stripe integration launched: checkout, seat management, plan changes (free/starter/pro), monthly/yearly toggle, trial, cancel flow, addon management, feature gating with upgrade prompts, seat limit enforcement | Major rewrite: pricing plans, checkout flow, seat management, feature gating, plan changes |
| `help/documentation/mobile.mdx` | Full-width timesheet, review mode for submitted periods, timer with live sync, approval sheet with pending/team tabs, bulk approve/reject, edit project/task inline, PTO on mobile | Major rewrite: mobile timesheet, approval, timer, PTO workflows |
| `help/documentation/timesheetSettings.mdx` | Timer toggle, start/end time mode, auto-submit setting, auto-timesheet settings | Add timer settings section, auto-submit configuration |
| `help/documentation/reports.mdx` | Rebuilt reporting: table+chart together, category levels, custom fields in reports, expense billing, absence in reports, tasks as effort, filters redesign | Major rewrite: report builder, chart types, new dimensions (tasks, expenses, absences, custom fields) |
| `help/documentation/notifications.mdx` | Rebuilt notification system: channels, typed messages, approval notifications, task assignment notifications, toast stack redesign, unsubscribe | Update notification types, channels, unsubscribe flow |
| `help/documentation/tags.mdx` | Tags refactored to relations, date ranges, overlap validation, hierarchy ordering, tag filters in tasks/gantt/kanban | Update tag model, add date ranges, filtering |
| `help/documentation/journal.mdx` | Redesigned as sibling panel, draft saving, inline editor, mentions, PDF download, messages from children on parent | Rewrite journal section, add PDF export, mention navigation |
| `help/documentation/people.mdx` | Profile picture crop/background removal, self-manager, duplicate modal improvements, language sync across devices | Update profile section, add image editing, self-manager |
| `help/documentation/expenses.mdx` | Editor refactored to list-attribute pattern, removable badges, comment editor, note label layout, expense billing in reports | Update expense editing workflow |
| `help/documentation/costs.mdx` | Rate badge pattern (removable), billing/cost on tasks, currency formatter, project priority for rate lookup | Update rate assignment, add task-level rates |
| `help/documentation/custom-fields.mdx` | Custom fields on time records, dropdown type, regex validation, feature gating behind subscription | Add time record custom fields, dropdown type, validation rules |
| `help/documentation/authentication.mdx` | Passkey/WebAuthn, new sign-in page design (indigo theme), pin code in sign-in flow, language-specific signup, Google Marketplace install | Update sign-in flow, add passkey section |
| `help/documentation/work-schedule.mdx` | Individual schedules per person (BambooHR), schedule fallback to 24/7, exclusive logic for schedule tags | Update schedule assignment, add individual schedules |
| `help/documentation/audit-trail.mdx` | Frontend redesign, new entity types tracked (absenceType, expenseType, customField), SSO binding logged | Update entity coverage, add SSO audit events |
| `help/documentation/account-settings.mdx` | New sign-in page, language preference synced across devices | Update sign-in section |

---

### Priority 3 — New pages or sections needed

| App change | Recommendation |
|-----------|---------------|
| Legacy data migration (60+ commits) — admin-only feature to migrate from old Beebole to new platform with progress tracking, checkpoint/resume, completion screen | New page: `help/documentation/migration.mdx` or guide — covers the migration wizard, what gets migrated, progress tracking |
| Feature gating & upgrade prompts — subscription-tier-based feature access with upgrade UI | New section in `help/documentation/subscription.mdx` — explain what's available per plan |
| Undo/redo system — cross-module undo/redo for timesheet, tasks, approval | New section in relevant pages (timesheets, planning) — explain undo/redo behavior |
| Google Marketplace install flow | New section in `help/integrations/google.mdx` — Step 7 install flow, domain linking |

---

### Priority 4 — Minor or no doc impact

| App change | Reason skipped |
|-----------|---------------|
| Canvas-based Gantt rendering engine | Internal performance improvement, no user-visible behavior change beyond speed |
| Flatpickr navigation button grouping | Minor cosmetic change |
| Entity-paste infrastructure | Internal pattern, user sees copy/paste which is documented above |
| Rate badge UI pattern refactor | Visual change covered in costs/expenses page updates above |
| Axios pinned to 1.13.5 (CVE) | Security dependency, no user impact |
| Various CI/CD and deploy fixes | Infrastructure only |
| SSO OAuth refactoring (shared helpers) | Internal code cleanup, no user-facing change |
| Lit update warnings fixed | Framework internals |

---

### Unmapped features needing page-mappings.md entries

| Keywords | Suggested page |
|----------|---------------|
| `bamboohr, bamboo, employees` | `help/integrations/bamboohr.mdx` _(new page needed)_ |
| `monday, monday.com` | `help/integrations/monday.mdx` _(new page needed)_ |
| `migration, legacy, migrate` | `help/documentation/migration.mdx` _(new page needed)_ |
| `feature gating, upgrade, hasFeature` | `help/documentation/subscription.mdx` |
| `undo, redo` | `help/documentation/timesheets.mdx`, `help/documentation/planning.mdx` |
| `passkey, webauthn` | `help/documentation/authentication.mdx` |
| `google marketplace, marketplace install` | `help/integrations/google.mdx` |

---

### Recommended next steps

1. **Write `sso.mdx`** — Currently a 4-line stub despite ~60 commits of SSO work. Highest priority.
2. **Rewrite `timesheets.mdx`** — The app's core feature had a complete UI overhaul + timer redesign.
3. **Rewrite `subscription.mdx`** — Stripe billing is entirely new; current page likely doesn't reflect it.
4. **Update `gantt.mdx` and `kanban.mdx`** — Both views were rebuilt with major new capabilities.
5. **Update `approval.mdx`** — Multi-stage approval is a key workflow change.
6. **Update `planning.mdx`** — Tasks are now independent entities with statuses, views, and billing.
7. **Rewrite `mobile.mdx`** — Mobile experience was significantly expanded.
8. **Create `bamboohr.mdx`** — Integration exists but has no doc page.
9. **Update `reports.mdx`** — Reporting was rebuilt with new dimensions.
10. **Update remaining pages** (notifications, journal, tags, authentication, etc.) in priority order.

Want me to start working on any of these? I can draft pages, update sections, or run `/audit` on specific pages.

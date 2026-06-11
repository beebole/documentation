# Feedback rules

Rules filed by `/triage` from `docs/feedback/`. Skills load this file and read the section relevant to what they're working on:

- `/write` and `/review` on page X load `## Site-wide` plus `### X` (if it exists).
- `/translate` ignores this file and reads `translation-notes.md` instead.

If a rule applies to every page, file it under `## Site-wide`. If it applies to one page only, file it under `## Per-page` as a bullet inside an `### <URL path>` H3 (create the H3 on first entry; remove it when the last bullet leaves).

If a rule is about FR or ES translation specifically — recurring terminology, translation patterns — file it in `translation-notes.md` instead.

If a note is just wrong content with no rule that generalizes, fix the page directly (inline-fix). It does not belong here.

## Site-wide

- **Don't invent features from SaaS clichés.** If a feature, label, settings path, plan tier, or workflow isn't in `../reboot`, it doesn't exist. Don't borrow what "most SaaS apps have." This includes planned-but-unshipped features: document only what's in the code today. Past leaks: "Pro and Enterprise plans", `Settings > Audit trail`, "Request changes" approval action, password-based sign-in (Beebole has **no passwords** — sign-in is a one-time 6-digit code emailed to the user, plus passkeys, Google/Microsoft, SSO), calendar views in Gantt/Kanban, diamond milestone markers — none of these are in code. (Google/Microsoft Calendar integration was on this list but **shipped in 2026**: it lives in the timesheet's external-calendar pane — `frontend/src/components/integrations/calendar/` — NOT under Settings > Integrations; it is per-user, read-only, click/drag events onto timesheet rows.)
  - **Why:** The audit found ~30 fabricated claims following this exact pattern. Documentation describes what the app does, not what it could plausibly do.
  - **How to apply:** Before writing any factual claim, find a backing reference in `../reboot` (`labels.json` entry, component file, backend entity, or `features.md`). If none exists, omit the claim or mark it `[VERIFY:]`.

- **Copy UI labels verbatim from `../reboot/shared/i18n/en/labels.json`.** Never paraphrase, retitle, or guess.
  - **Why:** Paraphrased labels (e.g. "Add a Gantt" vs the real **Add a Gantt chart**, "Send Invitation" vs **Invite by email**, "Connect" vs **Connect to QB Online**, "Workspace" vs **Asana workspace**, "Load Public Holidays" vs **Load holidays**, theme **System** vs **Auto**) all break the user's ability to find the control in the UI.
  - **How to apply:** Grep `labels.json` before bolding any UI string. The displayed value is the right-hand side of the JSON entry, not the key.

- **Route navigation through the right place: sidebar vs Account Settings.** Beebole has two top-level navigation surfaces and they hold different things. Don't mix them up.
  - **Sidebar** (left nav, per `../reboot/frontend/src/app/side-bar.ts`): **People**, **Projects**, **Tags** (auth-gated), plus **Tasks**, **Timesheet**, **Reports**, **Journal** (always). Write *"click **X** in the sidebar"*.
  - **Settings menu** (per `../reboot/frontend/src/components/settings/settings-menu.ts`; displayed values from `settingsMenu` labels, verified 2026-06-11): opened from the button with the user's initials at the bottom of the sidebar. Items verbatim: **Account Settings**, **Subscription**, **Person Roles**, **Work Schedules**, **Integrations**, **Export your data**, **GDPR**, **Time Off**, **Expense Type**, **Custom Field**, **Delete Account**, **Release Notes**. Note the singulars: **Custom Field** and **Expense Type** (the features are still called custom fields/expense types in prose — only the menu label is singular). Write *"go to **Settings** > **X**"* — and never "Settings > Account": the org-settings page is the **Account Settings** menu item.
  - **Inside an entity's settings panel** (not a top-level menu): some configuration lives as attributes on the Organisation entity itself — for example **SSO**, opened from the org-settings panel rather than a discrete menu entry. Verify the entry-point in code before describing the path.
  - **Why:** Past audits found "Settings > People" / "Settings > Tags" (sidebar items routed through Settings), and the inverse — "click Custom Fields in the sidebar" (a Settings-menu item described as a sidebar item). Both break the user's ability to follow the instruction.
  - **How to apply:** Before writing any navigation step, check both files above. If the route isn't in either, it's likely an entity-attribute or a sub-page — verify in code, don't guess.

- **Plan claims must match `../reboot/shared/subscription.ts`.** Don't paste in generic SaaS tier names (e.g. "Enterprise", "Team", "Business") that aren't in the code. Don't claim a feature requires plan X unless the gating exists.
  - **Why:** "Pro and Enterprise plans" appeared on 6+ integration pages despite no Enterprise tier ever existing. Plan names also change over time.
  - **How to apply:** Read `subscription.ts` before naming any tier. If you can't find a feature's plan gating in code, omit the claim — don't invent one.

- **Use American English in prose.** No British spellings: organisation → organization, authorise → authorize, localisation → localization, colour → color, behaviour → behavior, sub-project → subproject.
  - **Why:** Reviewer feedback (Helen, 2026-04): the docs mixed British and American conventions. The app's own displayed UI strings are predominantly American ("Subprojects available", "this organization").
  - **How to apply:** Write American forms in all prose. Exception: a UI label quoted verbatim from `labels.json` keeps its exact spelling even if British. URL slugs never change (`/help/documentation/roles-authorisations` keeps its spelling).

- **Step-by-step instructions include every click, including overflow menus.** If a control sits behind a kebab/three-dot menu, say so before naming it.
  - **Why:** Reviewer feedback: "open their profile and click Archive" fails because **Archive** only appears after opening the action menu (`entity-name.ts` renders it inside `bb-action-menu-button`). Same for assigning tags on a profile.
  - **How to apply:** Walk the real click path in code before writing steps. Pattern: *"click the **⋯** action menu, then **Archive**"*.

- **Name add-controls by their label, not "the [+] icon".** Every add control has a text label or tooltip in `labels.json` (e.g. **Add person**, **Add Task**, **Add tag**) — use it.
  - **Why:** Both reviewers flagged bare "[+]" as confusing. Some add buttons are icon-only in the UI, but each still has a labeled tooltip the user can see.
  - **How to apply:** Write *"click **+ Add person**"* (or *"click the **+** button (**Add person**)"* for icon-only controls). Never describe a control by its shape alone.

- **Card and link descriptions must match the target page's actual content.** Don't describe what a page could plausibly cover — describe what it covers.
  - **Why:** Landing-page cards described tasks on a page that doesn't cover tasks, and "scheduling tools" on a page that's mostly about task planning.
  - **How to apply:** Before writing a `<Card>` description or link blurb, skim the target page's H2s and describe those.

- **No intro text that merely restates the heading.** If the first paragraph under a heading adds nothing the heading didn't say, delete it.
  - **Why:** Reviewer feedback found several pages opening with filler that repeats the page title or subheading.
  - **How to apply:** After drafting, reread each section opener and cut it if it carries no new information.

- **Examples should match the sample data a new account contains.** Prefer the seeded names over invented ones.
  - **Why:** A new account is seeded (see `../reboot/scripts/seed-demo.mjs` / `seed-mini.mjs`) with categories **Clients**, **Internal**, **Activities** (per `../reboot/shared/i18n/en/config.json`) and projects like **Acme Corp**, **Website Redesign**, **Development** — examples that match what the reader actually sees on screen.
  - **How to apply:** When inventing an example category/project/person, check the seed scripts first and reuse those names where natural.

- **Entity-attribute options vary by entity type — verify per entity.** The same attribute panel (Show or hide, billing rates, availability toggles…) offers different options on a person, project, tag, or task.
  - **Why:** The projects page listed absence types and tasks under **Show or hide** — options that exist for people, not projects (`frontend/src/components/attributes/options.ts` switches on `EntityType`).
  - **How to apply:** Before listing an attribute's options, read the component's `case EntityType.<x>` branch for the specific entity being documented.

- **Place callouts in the section about their topic.** A `<Tip>`/`<Info>` about roles belongs in the roles section, not at the top of the page.
  - **Why:** Reviewer feedback: a roles callout at the top of the People page felt out of place with a roles section further down.
  - **How to apply:** When adding a callout, attach it to the heading that covers the same topic; if no section exists, reconsider whether the callout belongs on the page.

- **Beebole saves most changes automatically — only write "Click Save" when that form really has a Save button.** Attribute edits commit via auto-saved mutations; add-forms have explicit submit buttons (labeled **Add**, not **Save**).
  - **Why:** Three pages instructed users to click a **Save** button that doesn't exist (work schedules, custom fields, assignments).
  - **How to apply:** Check the component before writing a save step. For auto-saved settings write *"the change is saved automatically"*; for add-forms name the real submit label.

- **Use "task" only for the Planning entity.** Tasks in Beebole are independent planning entities (planned, scheduled, assigned, time-trackable) — never use "task" as a generic word for work items or as a sub-element of projects.
  - **Why:** Reviewer feedback (Miguel): loose "tasks" phrasing ("internal administrative tasks", "Sub-projects — Tasks or activities…") blurs the distinction between subprojects and the Task entity.
  - **How to apply:** For generic work, write "work", "activities", or "work items". Reserve "task" for the entity managed in Planning/Gantt/Kanban; note that time can be tracked on tasks as well as projects.

- **Use `<Info>`, never `<Note>`. Use the em-dash `—`, never `--`.**
  - **Why:** `<Info>`-only is a project rule (`documentation-structure.md:66`) for cross-site consistency. `--` renders inconsistently across browsers and is a typewriter stand-in, not real punctuation.
  - **How to apply:** No `<Note>` in any new draft. Type `—` or use Option-Shift-Hyphen on macOS.

- **Title format: `Feature Name — Beebole`, 50–60 characters — AND always pair it with a short `sidebarTitle`.**
  - **Why:** SEO/GEO target — search results truncate around 60 chars; including "Beebole" on every title strengthens entity recognition. But Mintlify renders `title` in the sidebar navigation, and 50–60-char titles wrap to 2–3 lines and wreck the nav (Yves, 2026-06-11). `sidebarTitle` keeps the nav clean while `title` serves SEO.
  - **How to apply:** Build the title as `<Feature> — Beebole` first; expand the feature side if under ~50 chars. API title format is `<Topic> — Beebole API`. Then ALWAYS add `sidebarTitle: "<1–3 title-case words>"` (e.g. `Quickstart`, `Timesheet Settings`, `Kanban Board`) matching the sidebar's existing style. Every content page needs both fields.

## Per-page

### /help/documentation/roles-authorisations

- **Organize this page by permission type.** Readers look up what a specific permission means; structure the body as one section per permission group (Approval events / Approval workflow, Billing rates / Costs, Custom Fields, Expenses, People details, Project details / Tasks / Budgets, Timesheet entries / Time off / Schedules, Journal feed, Reports, admin settings), each explaining that permission's meaning and its view/manage controls. Keep sections for creating and managing roles, assigning roles to people, and best practices. Permission names come from the `authorization` labels in `labels.json` (e.g. **Approval events**, **Billing rates**, **Define Custom Fields**, **Timesheet entries**, **Time off records**).

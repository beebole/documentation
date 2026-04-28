# Feedback rules

Rules filed by `/triage` from `docs/feedback/`. Skills load this file and read the section relevant to what they're working on:

- `/write` and `/review` on page X load `## Site-wide` plus `### X` (if it exists).
- `/translate` ignores this file and reads `translation-notes.md` instead.

If a rule applies to every page, file it under `## Site-wide`. If it applies to one page only, file it under `## Per-page` as a bullet inside an `### <URL path>` H3 (create the H3 on first entry; remove it when the last bullet leaves).

If a rule is about FR or ES translation specifically — recurring terminology, translation patterns — file it in `translation-notes.md` instead.

If a note is just wrong content with no rule that generalizes, fix the page directly (inline-fix). It does not belong here.

## Site-wide

- **Don't invent features from SaaS clichés.** If a feature, label, settings path, plan tier, or workflow isn't in `../reboot`, it doesn't exist. Don't borrow what "most SaaS apps have." Past leaks: "Pro and Enterprise plans", `Settings > Audit trail`, "Request changes" approval action, PIN-based sign-in, calendar views in Gantt/Kanban, diamond milestone markers, Google/Microsoft Calendar integrations — none of these are in code.
  - **Why:** The audit found ~30 fabricated claims following this exact pattern. Documentation describes what the app does, not what it could plausibly do.
  - **How to apply:** Before writing any factual claim, find a backing reference in `../reboot` (`labels.json` entry, component file, backend entity, or `features.md`). If none exists, omit the claim or mark it `[VERIFY:]`.

- **Copy UI labels verbatim from `../reboot/shared/i18n/en/labels.json`.** Never paraphrase, retitle, or guess.
  - **Why:** Paraphrased labels (e.g. "Add a Gantt" vs the real **Add a Gantt chart**, "Send Invitation" vs **Invite by email**, "Connect" vs **Connect to QB Online**, "Workspace" vs **Asana workspace**, "Load Public Holidays" vs **Load holidays**, theme **System** vs **Auto**) all break the user's ability to find the control in the UI.
  - **How to apply:** Grep `labels.json` before bolding any UI string. The displayed value is the right-hand side of the JSON entry, not the key.

- **No `Settings > X` framing for top-level sidebar items.** Items like People, Projects, Tags, Time Off, Custom Fields, Audit Trail, SSO, Reports, Planning live directly in the left sidebar — users click them, not a Settings menu first.
  - **Why:** "Settings > X" is the SaaS-default IA, but Beebole's IA is sidebar-first. Repeated misrouting on tags, people, custom-fields, kanban, time-off pages.
  - **How to apply:** Verify against `../reboot/frontend/src/app/side-bar.ts` (or current equivalent). If the item is in the sidebar, write *"click **X** in the sidebar"*.

- **Plan claims must match `../reboot/shared/subscription.ts`.** Don't paste in generic SaaS tier names (e.g. "Enterprise", "Team", "Business") that aren't in the code. Don't claim a feature requires plan X unless the gating exists.
  - **Why:** "Pro and Enterprise plans" appeared on 6+ integration pages despite no Enterprise tier ever existing. Plan names also change over time.
  - **How to apply:** Read `subscription.ts` before naming any tier. If you can't find a feature's plan gating in code, omit the claim — don't invent one.

- **Use `<Info>`, never `<Note>`. Use the em-dash `—`, never `--`.**
  - **Why:** `<Info>`-only is a project rule (`documentation-structure.md:66`) for cross-site consistency. `--` renders inconsistently across browsers and is a typewriter stand-in, not real punctuation.
  - **How to apply:** No `<Note>` in any new draft. Type `—` or use Option-Shift-Hyphen on macOS.

- **Title format: `Feature Name — Beebole`, 50–60 characters.**
  - **Why:** SEO/GEO target — search results truncate around 60 chars; including "Beebole" on every title strengthens entity recognition. Already in `seo-geo.md` and `documentation-structure.md`, but consistently violated.
  - **How to apply:** Build the title as `<Feature> — Beebole` first. If the result is shorter than ~50 chars, expand the feature side (e.g. "Custom Fields — Beebole" → "Custom fields for projects, people, and tasks — Beebole"). API title format is `<Topic> — Beebole API`.

## Per-page

*No rules filed yet. Entries appear as `### /help/...` H3 sections, each with a bullet list.*

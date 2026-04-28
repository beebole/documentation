# Brand, voice, and writing rules

Apply these rules when writing or reviewing any documentation page.

## Brand identity

- **Brand color:** #4338CA
- **Support email:** support@beebole.com

## Voice and tone

- **Professional but approachable.** Write as a knowledgeable colleague, not a manual.
- **Concise and reassuring.** Every sentence earns its place. When a feature involves data changes, explain what happens clearly.
- Lead with what the user can do ("To create a project, click **Projects**"), not abstract descriptions.

## Writing rules

1. Active voice: "Click **Save**" not "The Save button should be clicked."
2. Second person: Address the reader as "you."
3. Bold all UI labels exactly as they appear in the app.
4. Present tense: "The timesheet displays" not "will display."
5. One idea per sentence.
6. No jargon in user-facing docs (API section is the exception).
7. Don't assume prior knowledge — explain what a feature does before how to use it.
8. Define key terms before first use.

## Vocabulary

Site-wide word-choice rules. Page-specific terminology overrides go into `.claude/context/feedback.md` (per-page H3).

- **Product name.** Always "Beebole" — never "BeeBole" or "BEEBOLE".
- **Use "Beebole" by name** in introductions, FAQ answers, and key definitions — not just in the page title.
- **"In Beebole"** or **"in your Beebole account"** — not "in the app."
- **Sidebar items, not Settings.** Top-level features — **People**, **Projects**, **Tags**, **Time Off**, **Custom Fields**, **Audit Trail**, **SSO**, **Reports**, **Planning**, and others — live in the left sidebar. Write *"click **People** in the sidebar"*, never *"go to **Settings > People**"*. Verify against `../reboot/frontend/src/app/side-bar.ts` (or current equivalent) before writing any navigation step. The same rule replaces the older "modules" framing — don't expose internal vocabulary like "modules" either.
- **Mention related Beebole features by name** when they connect to the current page.

## Plans

Plan names and feature gating must come from `../reboot/shared/subscription.ts`. Read that file before naming any tier or claiming a feature requires a specific plan.

- **Don't paste in generic SaaS tier names** that aren't in the code (e.g. "Enterprise", "Team", "Business"). The audit found "Pro and Enterprise plans" repeated across six integration pages despite no Enterprise tier existing.
- **Don't claim a feature requires plan X** unless the gating exists in code. If you can't find it, omit the claim.
- **Don't hardcode the current plan list** in long-form prose either — the lineup will change. Refer to it abstractly ("higher-tier plans") and let the source of truth speak.

## Don't invent

This is the load-bearing rule for documentation: **describe what the Beebole app actually does, not what a similar SaaS app might do.**

- If a feature, label, settings path, plan tier, or workflow isn't in `../reboot`, it doesn't exist. Don't write it.
- "Coming soon" labels in the app (`comingSoon`, "to be developed") mean *don't ship a doc page* — surface a gap instead.
- When in doubt, mark `[VERIFY:]` and stop. Never paraphrase a SaaS-default version into the page.

The recurring failure mode is plausible-sounding content drifting in from the model's general SaaS prior. The fix is to ground every claim in `../reboot` before writing it.

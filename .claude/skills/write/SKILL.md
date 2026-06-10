---
name: write
description: 'Produce publishable documentation pages. Autonomous by default — with no arguments, reads `.todo/gaps.md` and drafts every Missing entry in sequence. With a path, drafts one page autonomously. Use `--interactive` for opt-in checkpoint flow. Includes SEO/GEO/FAQ inline. Use when asked to write pages, draft documentation, fill coverage gaps, or create content.'
---

# Write — Autonomous Documentation Author

Produce full `.mdx` pages — frontmatter, intro, sections, FAQ, callouts — with SEO/GEO baked in. Default mode is autonomous batch from `.todo/gaps.md`. Interactive checkpoint mode is opt-in.

## Context

Before starting, read these context files:

- `.claude/context/brand.md` — voice, tone, writing rules
- `.claude/context/audiences.md` — who pages are for
- `.claude/context/documentation-structure.md` — page structure template
- `.claude/context/mintlify-components.md` — component usage
- `.claude/context/seo-geo.md` — SEO frontmatter and GEO writing patterns
- `.claude/context/product.md` — Beebole product overview

**Feedback-aware loading.** After each target page path is known, also read `.claude/context/feedback.md`:

- The `## Site-wide` section — applies to every page.
- The `### <URL path>` block under `## Per-page` matching the target. Skip silently if no matching H3 exists.

Treat these as authoritative — if a feedback rule contradicts a general guideline, the more specific rule wins.

## Grounding contract

Documentation is a description of what the Beebole app actually does, not a brainstorm of plausible behavior. **Every factual claim in a draft must be backed by code or labels in `../reboot`.** If a claim has no backing, do not paraphrase a SaaS-default version into the page — leave a gap, mark it `[VERIFY:]`, or skip it.

These rules are non-negotiable. Apply them before drafting any sentence:

1. **Don't invent features from SaaS clichés.** If a feature, label, menu path, plan tier, or workflow isn't in `../reboot`, it doesn't exist. Common cliché traps caught in past audits: "Pro and Enterprise plans", `Settings > Audit trail`, "Request changes" approval action, PIN-based sign-in, calendar views in Gantt/Kanban, diamond milestone markers, self-service custom-domain flows. None of these exist in code. Don't add new ones. (The current past-leaks list lives in `feedback.md` site-wide rule #1 — that file is authoritative when the two disagree.)

2. **UI labels are copied verbatim from `../reboot/shared/i18n/en/labels.json`** — never paraphrased, retitled, or guessed. Past slips: `Add a Gantt` (paraphrase) vs **Add a Gantt chart** (real); `Send Invitation` vs **Invite by email**; `Connect` vs **Connect to QB Online**; `Load Public Holidays` vs **Load holidays**; `Workspace` vs **Asana workspace**; `System` (theme) vs **Auto**. Grep before bolding.

3. **Route navigation through the right surface.** The sidebar holds **People**, **Projects**, **Tags**, **Tasks**, **Timesheet**, **Reports**, **Journal** (verify against `../reboot/frontend/src/app/side-bar.ts`); the Settings menu (initials button at the bottom of the sidebar) holds **Account Settings**, **Subscription**, **Person Roles**, **Work Schedules**, **Integrations**, **Export data**, **GDPR**, **Time Off**, **Expense Type**, **Custom Fields**, **Delete Account** (verify against `settings-menu.ts`); everything else is an attribute panel on an entity (e.g. SSO on Account Settings). Never write `Settings > X` for a sidebar item or vice versa — `feedback.md`'s navigation rule has the full breakdown.

4. **Plan claims must match `../reboot/shared/subscription.ts`.** Read the file before naming a tier or asserting that a feature requires a specific plan. Never paste in generic SaaS names ("Enterprise", "Team", "Business") that aren't in code. If you can't find the gating, omit the claim — don't invent one.

5. **"Coming soon" labels mean don't ship a doc.** If `../reboot` returns `comingSoon`, `to be developed`, or similar placeholder strings for a feature (`grep -ri "coming soon\|to be developed" ../reboot/shared/i18n/en/labels.json` is the quick check), refuse to draft a page for it. Surface it as a gap instead.

6. **`<Info>`, never `<Note>`. `—`, never `--`.** Both are existing project rules (`documentation-structure.md:66` for the callout; typography norm for the em-dash). Enforcing them at draft time eliminates the recurring `/review` cleanup loop.

If a draft would violate any of the above, stop and report the gap rather than paraphrase your way around it.

## Modes

- **Default (no args) — autonomous batch:** read `.todo/gaps.md`, parse every `- [ ] Missing | …` line, draft each page end-to-end without checkpoints, produce a consolidated summary.
- **Single page (autonomous):** `/write <path>` — draft that page end-to-end without checkpoints.
- **Interactive:** `/write --interactive <path>` — outline checkpoint → draft checkpoint → iterate. Opt-in only.

## Prerequisites

`gh` CLI installed and authenticated (`gh auth status`). If unavailable, skip source-code exploration and note this in the draft's `[VERIFY]` markers.

## Workflow — default (batch)

### 1. Read `.todo/gaps.md`

If the file does not exist, stop and tell the user to run `/find-gaps` first.

Parse every line matching this exact format:

```
- [ ] Missing | `<path>` | <feature> [| from commit <sha-short>]
```

For each match, extract:
- `<path>` — the proposed `.mdx` target (always inside backticks).
- `<feature>` — short feature label.
- `<sha-short>` — optional; if present, treat the commit as relevant context for the draft.

**Do NOT process Partial entries in batch mode.** Partial entries (`- [ ] Partial | …`) require curator judgment about what specifically to add. Skip them and surface the count in the final summary so the user knows to run `/write <path>` for each with explicit notes.

If parsing finds zero Missing entries, report "No Missing entries in `.todo/gaps.md`" and stop.

### 2. For each Missing entry, draft autonomously

Per page:

1. **Research phase (parallel):**
   - Read `../reboot/shared/i18n/en/labels.json` for the feature's labels
   - Read relevant components in `../reboot/frontend/src/components/`
   - Read backend entities in `../reboot/backend/src/application/entities/`
   - Read `../reboot/frontend/src/models/types.ts`
   - Check design docs in `../reboot/docs/`
   - If a `<sha-short>` was attached, read that commit (`git -C ../reboot show <sha-short>`) for direct context.
   - Fallback: `gh api repos/beebole/reboot/contents/<path> --jq '.content' | base64 -d`

2. **Write the full `.mdx`** following all conventions:
   - Frontmatter: `title` (50-60 chars), `description` (120-160 chars), `keywords` (3-8 terms incl. "beebole")
   - Intro paragraph (2-4 sentences, definition-style, mentions "Beebole")
   - Body sections per `documentation-structure.md`
   - Bold UI labels from `labels.json`
   - Screenshot placeholders with descriptive alt text: `![Descriptive alt](/help/images/feature/context.webp)`
   - FAQ section with 3-5 Q&A pairs in `<AccordionGroup><Accordion>`
   - Callouts (`<Tip>`, `<Warning>`, `<Info>`) placed near relevant content — never `<Note>` (banned for site-wide consistency)
   - `[VERIFY: description]` markers for uncertain claims

3. **Self-verify before moving to the next page.** Mechanical sweep over the file as a whole — these are not judgment calls and must not be papered over with `[VERIFY:` markers:

   - **Section order.** The H2 sequence must end with `## Related content` then `## Frequently asked questions`. API pages omit FAQ. When appending to an existing page, FAQ must remain last.
   - **UI labels are verbatim.** Every bolded term that names a button, tab, menu, setting, or checkbox must match a value in `../reboot/shared/i18n/en/labels.json` exactly — not the JSON key, the displayed value. Past slips caught in `/review`: `Lite` (key) vs **Light** (displayed), `Email Templates` vs **Email templates**, `Add a Gantt` vs **Add a Gantt chart**, `[+]` (not a label — use **Add**).
   - **Match the existing file's conventions when expanding.** If the page existed before this edit, scan it once and align: spelling variant (UK *organisation/colour/recognise* vs US), dash style (`—` em-dash vs `--`), whether `<Card>` entries use `icon=`, bolding patterns. Don't introduce a second style.
   - **Re-read the existing FAQ when expanding.** If new sections changed any fact the FAQ relies on — entity counts, supported options, default behaviors, terminology — update the FAQ in the same edit. A new section that says "four entities" beside an FAQ that asks about "three entities" is a /review-blocker.
   - **Cross-page consistency for shared concepts.** If the new content covers something a sibling page also covers (heatmap colours on `gantt` ↔ `planning`, kanban behavior on `kanban` ↔ `planning`, timesheet rules on `timesheets` ↔ `timesheetSettings`), open the sibling first and align terminology before saving.

4. **Update `docs.json` navigation** if the page is new — mirror placement of similar pages in the correct language section.

### 3. Delete `.todo/gaps.md`

After all Missing entries are drafted, delete `.todo/gaps.md`. The file is single-use: `/find-gaps` rebuilds it from scratch on the next run, comparing the (now-updated) pages against the catalog. Keeping it around invites confusion — partially stale entries, accidental re-drafts, mixed signals about what's still missing.

Skip this step only if any Missing entry failed to draft (research blocked, file write error, etc.). In that case, leave `gaps.md` intact and surface the failures in the summary so the user can retry.

### 4. Consolidated summary

After all pages are drafted:

```
## Write complete (batch)

**Pages drafted:** N
**Pages by section:**
- Documentation: X
- Guides: Y
- Integrations: Z

**Partial entries skipped:** P (run `/write <path>` per entry with explicit notes)

**`.todo/gaps.md`:** deleted — re-run `/find-gaps` to regenerate against the updated pages.

**Next steps:**
- Run `/review` to audit the N session-scope pages.
- Run `/illustrate` to capture screenshots for placeholders.
- Run `/translate` to sync FR/ES once EN is reviewed.
- Run `/find-gaps` to confirm the drafted pages closed their gaps and surface remaining Partial work.

**[VERIFY] markers in drafts:** M (list at end of report)
**Existing feedback rules applied:** K
```

## Workflow — single page (autonomous)

Same as batch, but operating on one path passed as argument. No gaps.md read. Input for the page comes from:

1. User-provided notes in the conversation (if any), OR
2. The matching entry in `.todo/gaps.md` (if it exists — search both Missing and Partial), OR
3. Pure code exploration + proposed content based on the feature catalog

Skip `docs.json` update if the page already exists.

## Workflow — interactive mode

### 1. Collect inputs

Ask ONLY if missing:

- Target file path
- New page or rewrite?
- Target audience
- Specific screenshots/videos to include?
- Anything the input misses?

### 2. Research phase (parallel)

Same as autonomous.

### 3. Clean and analyze the input

Remove filler, identify core topics, note ambiguities.

### CHECKPOINT 1 — Proposed outline

Present:
1. Proposed H2 sections
2. Code findings
3. Open questions

Ask: _"Does this outline capture everything?"_

**Wait for user's response.**

### 4. Write the first draft

After outline approval, write the full `.mdx`.

### CHECKPOINT 2 — Draft review

Present summary. Ask for revisions.

**Wait for user's response.**

### 5. Iterate

Apply feedback, summarize changes, ask again.

### 6. Finalize

Write the file. Update `docs.json`. Print summary.

## Rules

- **English only.** Never produce French or Spanish versions. `/translate` handles FR/ES after.
- **Do not invent features (hard).** See *Grounding contract* above. If a feature, label, settings path, plan tier, or workflow isn't in `../reboot`, drop it or mark `[VERIFY:]` — never paraphrase a SaaS-default version into the page.
- **Preserve intent.** Restructure and rewrite, but don't change meaning.
- **Use exact UI labels** from `labels.json`, not approximate wording.
- **Mark uncertain content** with `[VERIFY: description]` inline.
- **Autonomous modes never ask mid-flow.** They produce the full output and report.
- **Interactive mode requires user response at both checkpoints.** Never skip CHECKPOINT 1 or 2.
- **Batch mode parses the exact `/find-gaps` handoff format.** Never substitute fuzzy prose extraction — if a line doesn't match `- [ ] Missing | \`<path>\` | <feature>`, it isn't a batch target.

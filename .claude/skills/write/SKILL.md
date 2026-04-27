---
name: write
description: 'Produce publishable documentation pages. Autonomous by default — with no arguments, reads `.todo/discovery.md` and drafts every Missing entry in sequence. With a path, drafts one page autonomously. Use `--interactive` for opt-in checkpoint flow. Includes SEO/GEO/FAQ inline. Use when asked to write pages, draft documentation, fill coverage gaps, or create content.'
---

# Write — Autonomous Documentation Author

Produce full `.mdx` pages — frontmatter, intro, sections, FAQ, callouts — with SEO/GEO baked in. Default mode is autonomous batch from `.todo/discovery.md`. Interactive checkpoint mode is opt-in.

## Context

Before starting, read these context files:

- `.claude/context/brand.md` — voice, tone, writing rules
- `.claude/context/audiences.md` — who pages are for
- `.claude/context/documentation-structure.md` — page structure template
- `.claude/context/mintlify-components.md` — component usage
- `.claude/context/seo-geo.md` — SEO frontmatter and GEO writing patterns
- `.claude/context/product.md` — Beebole product overview
- `.claude/context/terminology.md` — cross-cutting vocabulary rules

**Feedback-aware loading.** After each target page path is known, also read:

- `.claude/context/modules/<entity>.md` for every module listed for the page in `page-mappings.md`'s "Page → Module routing" table. Skip silently if no row exists or the file is absent.
- The H2 section of `.claude/context/page-notes.md` matching the target URL path. Skip silently if no matching H2 exists.

Treat these as authoritative — if a module or page-note rule contradicts a general guideline, the more specific rule wins.

## Modes

- **Default (no args) — autonomous batch:** read `.todo/discovery.md`, parse every `- [ ] Missing | …` line, draft each page end-to-end without checkpoints, produce a consolidated summary.
- **Single page (autonomous):** `/write <path>` — draft that page end-to-end without checkpoints.
- **Interactive:** `/write --interactive <path>` — outline checkpoint → draft checkpoint → iterate. Opt-in only.

## Prerequisites

`gh` CLI installed and authenticated (`gh auth status`). If unavailable, skip source-code exploration and note this in the draft's `[VERIFY]` markers.

## Workflow — default (batch)

### 1. Read `.todo/discovery.md`

If the file does not exist, stop and tell the user to run `/discover` first.

Parse every line matching this exact format:

```
- [ ] Missing | `<path>` | <feature> [| from commit <sha-short>]
```

For each match, extract:
- `<path>` — the proposed `.mdx` target (always inside backticks).
- `<feature>` — short feature label.
- `<sha-short>` — optional; if present, treat the commit as relevant context for the draft.

**Do NOT process Partial entries in batch mode.** Partial entries (`- [ ] Partial | …`) require curator judgment about what specifically to add. Skip them and surface the count in the final summary so the user knows to run `/write <path>` for each with explicit notes.

If parsing finds zero Missing entries, report "No Missing entries in `.todo/discovery.md`" and stop.

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
   - Callouts (`<Tip>`, `<Warning>`, `<Info>`, `<Note>`) placed near relevant content
   - `[VERIFY: description]` markers for uncertain claims

3. **Update `docs.json` navigation** if the page is new — mirror placement of similar pages in the correct language section.

### 3. Consolidated summary

After all pages are drafted:

```
## Write complete (batch)

**Pages drafted:** N
**Pages by section:**
- Documentation: X
- Guides: Y
- Integrations: Z

**Partial entries skipped:** P (run `/write <path>` per entry with explicit notes)

**Next steps:**
- Run `/review` to audit the N session-scope pages.
- Run `/illustrate` to capture screenshots for placeholders.
- Run `/translate` to sync FR/ES once EN is reviewed.

**[VERIFY] markers in drafts:** M (list at end of report)
**Existing module rules applied:** K
```

## Workflow — single page (autonomous)

Same as batch, but operating on one path passed as argument. No discovery.md read. Input for the page comes from:

1. User-provided notes in the conversation (if any), OR
2. The matching entry in `.todo/discovery.md` (if it exists — search both Missing and Partial), OR
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
- **Do not invent features.** Only document what input describes + code findings the user approved (interactive) or the research surfaced (autonomous).
- **Preserve intent.** Restructure and rewrite, but don't change meaning.
- **Use exact UI labels** from `labels.json`, not approximate wording.
- **Mark uncertain content** with `[VERIFY: description]` inline.
- **Autonomous modes never ask mid-flow.** They produce the full output and report.
- **Interactive mode requires user response at both checkpoints.** Never skip CHECKPOINT 1 or 2.
- **Batch mode parses the exact `/discover` handoff format.** Never substitute fuzzy prose extraction — if a line doesn't match `- [ ] Missing | \`<path>\` | <feature>`, it isn't a batch target.

# Feedback Architecture for EN Documentation Automation

**Date:** 2026-04-23
**Status:** Design approved — ready for implementation plan
**Owner:** Yves Hiernaux

## Context

Three people (Yves + two colleagues) work on the Beebole documentation. The long-term goal is to automate English page generation via Claude — drafting, auditing, and maintaining pages based on the application source code at `../reboot`.

Initial results are acceptable but inconsistent. Claude sometimes reads the right source files, sometimes not. Reviewers produce feedback of several kinds: generic writing rules, domain-level corrections, and one-off factual fixes. Without a durable place to file these, the same feedback gets raised repeatedly and none of it shapes future generation.

This spec defines where feedback lives, what it looks like, how skills consume it, and how the team triages it — for the **English content automation pipeline only**. Translation (FR/ES) is a separate pipeline with its own feedback file and its own skill integration.

## Goals

- Give reviewers a clear, low-friction way to submit feedback.
- Give Yves a clear triage workflow that scales to two colleagues submitting in parallel.
- Give Claude a consistent place to discover durable guidance when drafting, reviewing, auditing, syncing, and translating pages.
- Keep `CLAUDE.md` stable — it describes what the project is, not what reviewers have taught us.
- Keep the `help/` content tree clean — no feedback files mixed into the published docs.
- Capture translation-specific feedback in its own file so content feedback (EN) and translation feedback (FR/ES) never bleed into each other.

## Non-goals

- Building a structured feedback database, ticket tracker, or UI. The intake is a folder of plain markdown files.
- Live/synchronous review pairing. Triage is async and batched.
- Automating the triage decision itself — the `/triage` skill proposes, Yves approves.
- Defining how `/translate` consumes `translation-notes.md` internally. This spec defines where translation feedback lives; wiring it into the translation workflow is the `/translate` owner's job.

## Three feedback buckets

Every piece of durable feedback falls into one of three buckets:

1. **Generic rules** — apply across the whole site (voice, structure, SEO, components).
2. **Module rules** — apply across all pages touching a product domain (absences, billing, projects…).
3. **Page one-offs** — apply to a single page only (factual correction, outdated screenshot note).

A fourth case, **inline fix**, means the feedback is just a bug on the page itself; no rule to file, just commit a fix. The `/triage` skill can choose this option.

## File layout

All feedback lives inside `.claude/context/`. Feedback *is* context for Claude — splitting into a separate `feedback/` tree would add a second directory for skills to read without architectural benefit.

```
.claude/context/
  brand.md                    ← generic voice/tone rules merged here
  documentation-structure.md  ← generic page-structure rules merged here
  seo-geo.md                  ← generic SEO/GEO rules merged here
  mintlify-components.md      ← generic component-usage rules merged here
  audiences.md                (unchanged)
  product.md                  (unchanged)
  page-mappings.md            (unchanged)

  terminology.md              ← NEW — cross-cutting vocabulary rules that
                                don't fit any existing topical file
  modules/                    ← NEW — directory created empty;
                                files added by /triage as rules land
                                (e.g. absences.md, billing.md, projects.md,
                                timesheets.md — only when first rule is filed)
  page-notes.md               ← NEW — single registry, one H2 per page;
                                created empty
  translation-notes.md        ← NEW — FR/ES-specific feedback;
                                created empty, read ONLY by /translate
```

**Sharding rule:** `page-notes.md` starts as a single file. If it grows past roughly 500 lines, shard into a `page-notes/` subdirectory with one file per tab (`documentation.md`, `guides.md`, `integrations.md`, `api.md`, `news.md`). The shape of rule consumers doesn't change — they just glob the directory.

**Module file lifecycle:** module files are created lazily by `/triage` the first time a rule is filed into them. No empty placeholder files. The domain names mirror the app's entity taxonomy from `../reboot/shared/i18n/en/labels.json` and `../reboot/frontend/src/models/types.ts`.

## Entry formats

### Module files (`modules/<entity>.md`)

Three fixed H2 sections. Omit any section that has no entries.

```markdown
# <Entity> — module rules

## Terminology
- "Absence request" ≠ "absence entry". Request = pending; entry = approved and logged.

## Facts
- Beebole does not prorate mid-month; charges apply at plan cycle start.

## Structural
- Pages touching absences should link to /help/documentation/absences/overview.
```

The three sections answer a clean triage question: *is this a terminology issue, a factual issue, or a structural rule?* They also map onto the kinds of mistakes the `/review` skill audits for.

### Page notes (`page-notes.md`)

One H2 per page, keyed by URL path. Bullet list of one-off rules or reminders.

```markdown
# Page-specific notes

## /help/documentation/billing
- Remove all "prorated charges" language — Beebole charges full cycle.
- "Plans" screenshot outdated as of 2026-Q1 UI (regenerate when touched).

## /help/documentation/timesheet/daily
- The "hours vs days" example is too Europe-centric; add a non-DMY example.
```

The URL path is stable (matches internal link targets used elsewhere) and greppable. Skills that touch a page resolve its entry by exact match on the H2.

### Generic files (`brand.md`, `documentation-structure.md`, `seo-geo.md`, `mintlify-components.md`, `terminology.md`)

No special format. Triage appends rules into the existing structure of each file. Over time, the existing topical narrative absorbs new rules naturally.

### Translation notes (`translation-notes.md`)

One H2 per language, each with two fixed H3 sections (Terminology, Page notes). Page notes use an H4 per page keyed by the EN URL path.

```markdown
# Translation notes

## French (FR)

### Terminology
- Use "chantier" not "projet" for construction clients.

### Page notes

#### /help/documentation/billing
- Section title should be "Facturation" not "Facture".

## Spanish (ES)

### Terminology
- (none yet)

### Page notes
- (none yet)
```

Keying page notes by the EN URL path (rather than the translated slug) is deliberate — `/translate` already works from the EN master, and this avoids a separate index per language. Same sharding rule as `page-notes.md`: shard into `translation-notes/fr.md`, `translation-notes/es.md` only if the single file grows past roughly 500 lines.

## Skills integration

| Skill         | Feedback files read                                                                    |
| ------------- | -------------------------------------------------------------------------------------- |
| `/draft`      | all `.claude/context/*.md` (baseline) + relevant `modules/<entity>.md` + the `page-notes.md` entry for the target path if present |
| `/review`     | same as `/draft` — the feedback *is* the review checklist                              |
| `/audit`      | same, when auditing a single page; loads all `modules/*.md` when auditing coverage     |
| `/sync`       | reads `modules/*.md` to decide which app-repo changes warrant a rule-level review      |
| `/translate`  | reads `translation-notes.md` ONLY — does not read content-feedback files               |
| `/screenshot` | no feedback coupling                                                                   |
| `/triage`     | NEW — see next section                                                                 |

**How skills pick the relevant module:** via `.claude/context/page-mappings.md`, which already routes keywords to pages. Extend it with a per-page `modules:` field listing the module file names whose rules apply. A page may map to more than one module.

**CLAUDE.md change:** add one line to the Writing guide table pointing at `modules/` and `page-notes.md`. No new top-level section.

**Per-skill change:** each existing skill's `SKILL.md` gets a short "Before acting, read these feedback files…" block. This is mechanical — no skill logic changes.

## Triage workflow

### Intake — colleagues

Colleagues drop markdown files into `docs/feedback/`. No filename convention, no internal schema. Whatever is in the folder is the queue.

Reviewers may use any format — a copy of the `.mdx` with inline strikethroughs and additions, prose notes referencing page paths, margin commentary, mixed. They can name files however they want (date, page slug, their name, a random word — any of these or none). `/triage` reads each file's free-form content and figures out what it's about.

### `/triage` skill — new

Lives at `.claude/skills/triage/SKILL.md`. Runs interactively. Its loop:

1. List every file in `docs/feedback/`. Show the queue to Yves.
2. For each file: read it, figure out which page(s) it references, and for each distinct note propose one of five filings:
   - **Extend a generic file** (`brand.md`, `documentation-structure.md`, `seo-geo.md`, `mintlify-components.md`, or `terminology.md`).
   - **Add to a module file** (`modules/<entity>.md`) under Terminology / Facts / Structural.
   - **Add to `page-notes.md`** under the page's H2 (create the H2 if absent).
   - **Add to `translation-notes.md`** when the note is FR- or ES-specific — routed to the right language H2 and section (Terminology or Page notes).
   - **Inline fix** — edit the page directly; no rule filed.
3. Present each proposal as a unified diff. Yves approves / edits / skips per item.
4. Apply approved changes. Delete the source feedback file from `docs/feedback/` once all its notes are either filed or explicitly skipped. Git history preserves the raw feedback if it's ever needed.
5. Commit: one commit per source feedback file, message `feedback(<topic>): N filed rules, M inline fixes`.

The skill has `disable-model-invocation: true` — it runs only when Yves types `/triage`.

### Parallelism

Three people can work without coordination:

- Two colleagues can drop files into `docs/feedback/` at any time. The folder is the whole queue; no filename rules to remember.
- Yves runs `/triage` in batches — could do it weekly, or after each feedback drop. Batches are small, so triage sessions stay short.
- Filed rules are localized edits across many files; git merges cleanly if multiple `/triage` sessions are ever in flight on different branches (should be rare — Yves is the sole triage runner in practice).

## Mintlify build safety

The `docs/` directory sits outside `help/` and is already not published. No Mintlify configuration change needed. The published content tree (`help/`, `snippets/`) is untouched by this design — nothing new is introduced there.

## Translation feedback — in scope for filing, out of scope for consumption

This spec creates `translation-notes.md` and teaches `/triage` to file FR/ES-specific notes into it. That way, translation feedback goes through the same intake and triage as content feedback — no parallel system for colleagues to learn.

What is *not* in scope: how `/translate` reads and applies `translation-notes.md` internally. That wiring belongs to whoever evolves `/translate` next — this spec just guarantees the file exists with a defined shape and the rules land there cleanly. No content skill (`/draft`, `/review`, `/audit`, `/sync`) reads `translation-notes.md`.

## Open questions

None at design level. `/triage` makes its best-guess routing proposals based on the feedback content and `page-mappings.md`; Yves validates each one. That's the whole contract — no separate ambiguity-resolution rule needed. Cadence is a personal workflow matter, not a design concern: triage runs when Yves runs it.

## Success criteria

- A new rule filed in a module file changes the output of the next `/draft` of any page touching that module, without Yves having to mention the rule again.
- A page one-off filed in `page-notes.md` is applied whenever `/draft` or `/review` next touches that page.
- A colleague unfamiliar with Claude can submit feedback by dropping a markdown file in `docs/feedback/` — no other tooling required.
- Translation feedback and content feedback go through the same inbox and the same triage, and land in their correct files without leaking into each other.
- A `/triage` session always finishes with `docs/feedback/` empty (or with only items explicitly skipped by Yves).

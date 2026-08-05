---
name: news
description: 'Draft monthly release-notes entries in help/news/releases.mdx from the pre-generated production release notes in ../reboot/frontend/public/release-notes/production/. Default: cover every production note newer than the news-cursor marker, grouped one <Update> block per month. `--month YYYY-MM` re-drafts a single month.'
disable-model-invocation: true
---

# News — Release Notes Author

Turn the app repo's auto-generated production release notes into monthly `<Update>` blocks in `help/news/releases.mdx`. The heavy lifting (diffing deploys, enumerating changes) is already done by the app's release pipeline — this skill's job is **curation**: pick what end users care about, group it by month, and write it in the docs voice. Autonomous by default — Yves reviews and publishes separately.

## Source of truth

Every push to production generates a markdown release note in the app repo:

```
../reboot/frontend/public/release-notes/
  _index.json        # [{file, date, environment}, ...] newest first
  production/        # one YYYY-MM-DD.md per production deploy  ← the only input
  qa/                # QA deploys — NEVER use these
```

Each production file has frontmatter (`date`, `environment`, `from`, `to` commit range) followed by `### Category` sections with bullets. These notes aim for **completeness** (every change in the deploy); the docs changelog aims for **relevance** — most of the curation work is deciding what to drop.

**Do not scan git commits.** The old commit-based flow (`detect-reboot-changes.sh`) is retired. Do not switch the reboot checkout's branch — the `production/` folder is authoritative on any branch.

**Fallback** if `../reboot` is missing: `gh api repos/beebole/reboot/contents/frontend/public/release-notes/production` and fetch each file. If both fail, report "cannot read release notes" and stop — never produce an empty entry.

## Interface

- **Default (no args):** `/news` — cover every production note newer than the cursor (see below), grouped into one `<Update>` block per calendar month.
- **`--month YYYY-MM`:** re-draft that single month from scratch (replace its existing block if present). Use for corrections or backfills.

## Workflow

### 1. Determine the cursor

The newest generated block in `help/news/releases.mdx` carries an MDX comment marker as its last line:

```mdx
  {/* news-cursor: YYYY-MM-DD */}
```

- **Cursor found:** cover every `production/*.md` with `date` > cursor.
- **No marker anywhere** (only hand-written blocks, e.g. the launch note): start from `2026-05-30` — the launch note covers everything up to and including the 2026-05-29 launch deploy.
- New notes may land in a month you already published (deploy dates are unpredictable): if a covered note falls in the same month as the newest existing block, **merge** the new items into that block instead of creating a duplicate; months after it get fresh blocks.

After drafting, move the marker: remove it from the previous block and place it (with the newest covered note date) as the last line inside the newest block.

### 2. Curate — the relevance filter

Go through every bullet of every covered note and keep only what an end user would care to read. Rough yield: **half or less** of the source bullets survive.

**Keep:**
- New features, views, and integrations
- Behavior changes users will notice in their daily flow (defaults, renames, new restrictions admins can set)
- Improvements to visible workflows (fewer clicks, clearer states, new columns/filters)
- Fixes **only** when the broken behavior was prominent enough that users likely hit it

**Drop:**
- Edge-case and cosmetic fixes ("tooltip no longer overlaps…", input-revert fixes, layout nits)
- Internal plumbing: network/WebSocket fallbacks, diagnostics pages, performance/stability fixes, audit-of-internals
- Subscription, trial, and paywall mechanics
- Anything only meaningful pre-launch or to the dev team
- Duplicates: the same feature often appears in consecutive deploys (shipped, then refined) — merge into one item in its strongest form

**Rewrite, don't copy.** The generated notes sometimes use the internal codename **"Reboot" — this must never appear**; it's always "Beebole". Same for any internal vocabulary (`entity`, `modules/`, category-as-plan internals). Verify feature names against `../reboot/shared/i18n/en/labels.json` and bold them.

### 3. Draft one `<Update>` block per month

Insert newest-first, immediately after the frontmatter's closing `---` (before the first existing `<Update>`):

```mdx
<Update label="<Month YYYY>" tags={["<Tag1>", "<Tag2>", "<Tag3>"]}>
  <1–2 sentence intro naming the month's headline feature(s).>

  ### <Theme>

  - <One bullet per user-visible change. Bold **UI labels**, link `/help/...` pages.>

  {/* news-cursor: YYYY-MM-DD */}   ← newest block only
</Update>
```

Writing rules:

- **Structure like the launch note:** short intro, then `###` theme headings with bullets. A thin month (few surviving items) can skip headings and use a plain bullet list.
- **Size:** ~15–25 bullets max per month, 3–6 themes. If you're over, cut deeper — this is a highlights reel, not the deploy log.
- **Themes** are reader-facing groupings (e.g. "Timesheets & approvals", "Reports & budgets", "Planning", "Integrations & apps") — don't just mirror the source categories.
- **Link to docs** whenever a page exists: check `help/documentation/`, `help/integrations/`, `help/guides/` for the feature's page and link it as `[feature](/help/...)`. Don't invent paths.
- **Tags:** 3–5 per block, `tags={[...]}`. Reuse the existing vocabulary in the file before inventing a new tag. Current vocabulary: `Launch`, `Timesheet`, `Time off`, `Planning`, `Reports`, `Budgets`, `Integrations`, `AI`, `Languages`, `Settings`, `Security`, `Mobile`.
- Active voice, second person, present tense, no jargon.

### 4. Report

```
## News drafted

**File:** help/news/releases.mdx
**Blocks:** <Month YYYY> (new|merged), …
**Source notes covered:** production/<date>.md … (N deploys)
**Cursor:** <old> → <new>
**Kept / dropped:** X items kept, Y dropped as not user-relevant
**Tags applied:** [...]

**Dropped highlights worth a second opinion:** <1–3 borderline items you excluded, so Yves can rescue them>
```

## Rules

- **Autonomous — no checkpoints.** Produce the full draft. Yves reviews after.
- **Never push.** Write the file; committing is Yves's decision.
- **`production/` only.** QA notes describe unreleased work.
- **Monthly grouping, always.** Never one block per deploy — deploy dates are unpredictable and not meaningful to readers.
- **Don't touch frontmatter** of `releases.mdx` (`title`, `tag`, `rss`, description, SEO fields).
- **Don't touch the launch note** (`June 2026` welcome block) — it's hand-written and permanent.
- **English only.** There are no FR/ES translations to sync.
- **Never include internal jargon or the "Reboot" codename** in user-facing output.

# Lifecycle Skills Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the content-lifecycle skills around five intent-driven names (`/discover`, `/write`, `/review`, `/illustrate`, `/translate`) plus `/news`. Make `/write` autonomous by default. Consolidate `/audit` into `/review`. Reframe CLAUDE.md as an automation engine.

**Architecture:** Create new skill directories (`discover`, `write`, `illustrate`, `news`) by lifting and reorganizing content from today's `sync`, `draft`, `screenshot`, and `audit` skills. Expand `review` to absorb `audit page` + `audit seo` checks. Extract shared app-repo change-detection into a standalone bash script consumed by both `/discover` and `/news`. Update cross-references in CLAUDE.md, page-mappings.md, and /triage. Delete the old skill directories last.

**Tech Stack:** Markdown-with-YAML-frontmatter SKILL.md files. Bash for the shared script. Git for version control. The `gh` CLI for app-repo fallback (pre-existing). Mintlify for documentation rendering (unchanged by this plan).

---

## File Structure

Files created by this plan:

| Path | Responsibility |
|---|---|
| `.claude/scripts/detect-reboot-changes.sh` | Detect commits in `../reboot` since a cursor (SHA or date). Single source of truth for both `/discover --changes` and `/news`. |
| `.claude/skills/discover/SKILL.md` | `/discover` skill — recent app-repo changes + feature-catalog coverage gaps. |
| `.claude/skills/write/SKILL.md` | `/write` skill — autonomous batch default, single-path, and interactive modes. |
| `.claude/skills/illustrate/SKILL.md` | `/illustrate` skill — identify screenshot needs + capture via Playwright. |
| `.claude/skills/news/SKILL.md` | `/news` skill — draft release notes from app-repo changes with auto-cursor. |

Files modified by this plan:

| Path | Change |
|---|---|
| `.claude/skills/review/SKILL.md` | Absorb `/audit page` (undocumented/deprecated checks) and `/audit seo`. Add session-scope default + `--all` flag. |
| `.claude/skills/triage/SKILL.md` | Update skill-name references (if any refer to `/draft`, `/sync`, etc.). |
| `.claude/context/page-mappings.md` | Update the "used by" note (`/audit coverage` → `/discover`, `/sync` → `/discover`). |
| `CLAUDE.md` | Add automation-engine framing. Replace slash commands table with new six + `/triage`. Update prereqs table to reflect new skill names. |

Files deleted by this plan:

| Path | Reason |
|---|---|
| `.claude/skills/sync/` | Content migrated to `/discover` and `/news`. |
| `.claude/skills/draft/` | Content migrated to `/write`. |
| `.claude/skills/screenshot/` | Content migrated to `/illustrate`. |
| `.claude/skills/audit/` | Content migrated to `/discover` (coverage mode) and `/review` (page + seo modes). |

---

## Task 1: Extract shared change-detection script

Before any skill is created or modified, extract the app-repo change-detection logic from today's `/sync` into a standalone script. Both `/discover` and `/news` will call it.

**Files:**
- Create: `.claude/scripts/detect-reboot-changes.sh`

- [ ] **Step 1: Read the existing sync workflow to understand today's change-detection logic**

Run: `sed -n '20,100p' .claude/skills/sync/SKILL.md`
Expected: sees the workflow section that computes commit range, reads `.sync/state.json` for cursor, etc.

- [ ] **Step 2: Verify the shared script doesn't exist yet**

Run: `test -f .claude/scripts/detect-reboot-changes.sh && echo "EXISTS" || echo "ABSENT"`
Expected: `ABSENT`

- [ ] **Step 3: Create the script**

Write `.claude/scripts/detect-reboot-changes.sh`:

```bash
#!/usr/bin/env bash
# detect-reboot-changes.sh — list commits in ../reboot since a cursor
#
# Usage:
#   ./detect-reboot-changes.sh                # uses .sync/state.json cursor, or 3 months if absent
#   ./detect-reboot-changes.sh --since <sha>  # explicit SHA cursor
#   ./detect-reboot-changes.sh --since <date> # explicit date cursor (git-compatible, e.g. 2026-01-01)
#
# Output (stdout): one JSON object per commit, one per line:
#   {"sha":"abc123","date":"2026-04-20","subject":"feat: ...","files":["a","b"]}
#
# Exit codes:
#   0 — success (may be empty output if no commits)
#   1 — ../reboot not accessible
#   2 — bad arguments

set -euo pipefail

REBOOT_DIR="../reboot"
STATE_FILE=".sync/state.json"
CURSOR=""

# Parse --since
while [[ $# -gt 0 ]]; do
  case "$1" in
    --since)
      CURSOR="$2"
      shift 2
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

# Verify access to ../reboot
if [[ ! -d "$REBOOT_DIR/.git" ]]; then
  echo "error: $REBOOT_DIR is not a git repository" >&2
  exit 1
fi

# Determine cursor if not explicitly provided
if [[ -z "$CURSOR" ]]; then
  if [[ -f "$STATE_FILE" ]]; then
    CURSOR="$(python3 -c "import json,sys; print(json.load(open('$STATE_FILE'))['last_synced_sha'])" 2>/dev/null || true)"
  fi
  if [[ -z "$CURSOR" ]]; then
    CURSOR="3 months ago"
  fi
fi

# Emit one JSON object per commit
cd "$REBOOT_DIR"

# git log produces tab-separated records; jq builds JSON
git log --since="$CURSOR" --no-merges \
  --pretty=format:'%H%x09%ai%x09%s' \
  --name-only -z \
  | awk -v RS='\0' -v FS='\t' '
      {
        # Each record: SHA\tDATE\tSUBJECT\nFILE1\nFILE2\n...
        n = split($0, lines, "\n")
        header_parts = split(lines[1], h, "\t")
        sha = h[1]; date = substr(h[2], 1, 10); subject = h[3]
        gsub(/"/, "\\\"", subject)
        files_json = "["
        for (i = 2; i <= n; i++) {
          if (lines[i] == "") continue
          if (files_json != "[") files_json = files_json ","
          f = lines[i]; gsub(/"/, "\\\"", f)
          files_json = files_json "\"" f "\""
        }
        files_json = files_json "]"
        printf "{\"sha\":\"%s\",\"date\":\"%s\",\"subject\":\"%s\",\"files\":%s}\n", sha, date, subject, files_json
      }
    '
```

- [ ] **Step 4: Make it executable**

Run: `chmod +x .claude/scripts/detect-reboot-changes.sh`

- [ ] **Step 5: Smoke test**

Run: `.claude/scripts/detect-reboot-changes.sh --since "3 months ago" | head -3`
Expected: between 0 and 3 lines of JSON. Each line valid JSON with `sha`, `date`, `subject`, `files`. No error output. (If `../reboot` is unavailable, exit code 1 — that's acceptable; document the expectation but don't fail on it if the environment lacks the sibling repo.)

- [ ] **Step 6: Commit**

```bash
git add .claude/scripts/detect-reboot-changes.sh
git commit -m "feat: extract shared reboot change-detection script"
```

---

## Task 2: Create `/discover` skill

Absorb `/sync`'s change detection and `/audit coverage`'s feature-catalog comparison into one skill. Default runs both; flags scope.

**Files:**
- Create: `.claude/skills/discover/SKILL.md`

- [ ] **Step 1: Verify the skill doesn't exist yet**

Run: `test -f .claude/skills/discover/SKILL.md && echo "EXISTS" || echo "ABSENT"`
Expected: `ABSENT`

- [ ] **Step 2: Read source material**

Run: `ls .claude/skills/sync/ .claude/skills/audit/`
Expected: sees current `sync/SKILL.md` and `audit/SKILL.md` contents available as reference.

- [ ] **Step 3: Create directory + SKILL.md**

Run: `mkdir -p .claude/skills/discover`

Write `.claude/skills/discover/SKILL.md`:

````markdown
---
name: discover
description: 'Detect what the documentation needs. Scans `../reboot` for recent commits that affect pages AND cross-references the full feature catalog against existing documentation to find gaps. Produces `.todo/discovery.md` — the handoff consumed by `/write`. Use when asked to sync docs with the app, find documentation gaps, check what changed, or prepare the next batch of pages to write.'
disable-model-invocation: true
---

# Discover — Find What the Docs Need

Produce a single discovery report covering two questions:

1. **What changed in the app?** — recent commits in `../reboot` that affect documented pages.
2. **What's undocumented?** — features in the catalog with no or partial coverage in the docs.

Output is a single file `.todo/discovery.md` with both sections, formatted as a handoff that `/write` (no-args default) consumes directly.

## Context

Before running, read:

- `.claude/context/product.md` — Beebole product overview
- `.claude/context/page-mappings.md` — keyword routing + Page → Module routing
- `.claude/context/brand.md` — voice/tone rules (applied if drafting any proposals inline)
- `.claude/context/terminology.md` — cross-cutting vocabulary rules

**Feedback-aware loading.** Read ALL files in `.claude/context/modules/`. When a change or coverage gap touches a module with accumulated rules, flag it in the report as **Rule-level review** — the module rules may also need to be updated, not just the pages.

## Modes

- **Default (no args):** run both change detection and full coverage analysis.
- **`--changes`:** only recent app-repo changes.
- **`--coverage`:** only feature-catalog vs. documentation comparison.
- **`--all`:** ignore the sync cursor and rescan from 3 months of history (for full reprocess).

## Workflow

### 1. Determine the cursor for change detection

Read `.sync/state.json` if it exists. Use `last_synced_sha` as the cursor. If absent or `--all`, fall back to 3 months.

### 2. Run change detection (unless `--coverage`)

Invoke the shared script:

```bash
.claude/scripts/detect-reboot-changes.sh
```

(Or `.claude/scripts/detect-reboot-changes.sh --since <sha>` if `--all` mode.)

Parse the one-JSON-per-line output. For each commit:
- Read `page-mappings.md` and semantically match the commit's files + subject line to documentation pages.
- Group affected pages by commit.
- Flag modules (from "Page → Module routing") whose rules may need review.

### 3. Run coverage analysis (unless `--changes`)

Read `.features/features.md` (symlink to the reboot repo's feature catalog). Extract every bullet from sections 1–24. Skip section 25 (Planned Features) and the Internal section.

For each feature:
- Match it to a documentation page via `page-mappings.md` (semantic match on keywords).
- If mapped page exists: read it and classify the feature as **Covered**, **Partial**, or **Missing**.
- If mapped page doesn't exist: classify as **Missing** (full gap).
- If no mapping row: flag the page-mapping gap as a separate issue.

### 4. Write `.todo/discovery.md`

Overwrite with:

```markdown
# Discovery report

Generated: YYYY-MM-DD
Mode: [full|changes-only|coverage-only]
Cursor: <sha or date>

---

## Recent changes → affected pages

[For each commit that affected pages:]
- **<sha-short>** (<date>) — <subject>
  - Pages: `<path>`, `<path>`
  - Module(s): `modules/<entity>.md` (rule-level review recommended)
  - Files in change: <count> files including <top 3>

[If no changes since cursor:]
_No commits since cursor._

---

## Coverage gaps → undocumented features

[For each gap, grouped by feature section:]

### Section N: <section name>

- **Missing:** <feature> — proposed page: `<path>`
- **Partial:** <feature> on `<path>` — add: <what's missing>

[If no gaps:]
_All features covered._

---

## Rule-level review recommended

[For each module whose rules may need revisiting:]
- `modules/<entity>.md` — <why: which change or gap affected it>

---

## Handoff to /write

Next step: run `/write` (no args) to draft all Missing gaps. Partial gaps require `/write <path>` with explicit notes.
```

### 5. Update the sync cursor

After the report is written, update `.sync/state.json` with the latest commit SHA observed (only if change-detection ran). Do NOT update if run with `--coverage` only.

### 6. Print summary

```
Discovery complete.

Changes: N commits affecting M pages across P modules.
Coverage: X missing, Y partial across Z sections.
Report written to .todo/discovery.md.

Next step: /write to draft the missing pages.
```

## Rules

- **Always write `.todo/discovery.md`.** Even if both sections are empty, write the file so `/write` has a consistent input contract.
- **Don't modify documentation pages.** `/discover` is read-only — no edits to `help/**`.
- **Graceful degradation.** If `../reboot` is not available, emit `_Change detection skipped: ../reboot not found_` and continue with coverage analysis using `.features/features.md` (which may also be a broken symlink). Report what was skipped.
- **Never silently merge features.** Every feature in the catalog either maps to a page or is flagged as a gap.
````

- [ ] **Step 4: Verify structure**

Run: `grep -c "^## Context\|^## Workflow\|^## Rules\|disable-model-invocation: true" .claude/skills/discover/SKILL.md`
Expected: at least `4`.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/discover/SKILL.md
git commit -m "feat(discover): add skill for app-repo changes + coverage gaps"
```

---

## Task 3: Create `/write` skill

Autonomous-by-default replacement for `/draft`.

**Files:**
- Create: `.claude/skills/write/SKILL.md`

- [ ] **Step 1: Verify absent**

Run: `test -f .claude/skills/write/SKILL.md && echo "EXISTS" || echo "ABSENT"`
Expected: `ABSENT`

- [ ] **Step 2: Read source material**

Run: `cat .claude/skills/draft/SKILL.md | head -50`
Expected: existing draft skill visible for reference.

- [ ] **Step 3: Create the skill**

Run: `mkdir -p .claude/skills/write`

Write `.claude/skills/write/SKILL.md`:

````markdown
---
name: write
description: 'Produce publishable documentation pages. Autonomous by default — with no arguments, reads `.todo/discovery.md` and drafts every gap in sequence. With a path, drafts one page autonomously. Use `--interactive` for opt-in checkpoint flow. Includes SEO/GEO/FAQ inline. Use when asked to write pages, draft documentation, fill coverage gaps, or create content.'
---

# Write — Autonomous Documentation Author

Produce full `.mdx` pages — frontmatter, intro, sections, FAQ, callouts — with SEO/GEO baked in. Default mode is autonomous batch. Interactive checkpoint mode is opt-in.

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

- **Default (no args) — autonomous batch:** Read `.todo/discovery.md`, draft every Missing gap end-to-end without checkpoints, produce a consolidated summary.
- **Single page (autonomous):** `/write <path>` — draft that page end-to-end without checkpoints.
- **Interactive:** `/write --interactive <path>` — outline checkpoint → draft checkpoint → iterate. Opt-in only.

## Prerequisites

`gh` CLI installed and authenticated (`gh auth status`). If unavailable, skip source-code exploration and note this in the draft's `[VERIFY]` markers.

## Workflow — default (batch)

### 1. Read `.todo/discovery.md`

Extract Missing gaps with their proposed page paths. Partial gaps are skipped in batch mode (they need explicit user notes; run `/write <path>` for those).

### 2. For each Missing gap, draft autonomously

Per page:

1. **Research phase (parallel):**
   - Read `../reboot/shared/i18n/en/labels.json` for the feature's labels
   - Read relevant components in `../reboot/frontend/src/components/`
   - Read backend entities in `../reboot/backend/src/application/entities/`
   - Read `../reboot/frontend/src/models/types.ts`
   - Check design docs in `../reboot/docs/`
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
2. The page's entry in `.todo/discovery.md` (if it exists), OR
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
````

- [ ] **Step 4: Verify**

Run: `grep -c "^## Context\|^## Modes\|^## Workflow\|^## Rules" .claude/skills/write/SKILL.md`
Expected: at least `4`.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/write/SKILL.md
git commit -m "feat(write): add autonomous-default author skill"
```

---

## Task 4: Expand `/review` skill

Fold `/audit page` (undocumented + deprecated checks) and `/audit seo` (no new checks, just scope) into `/review`. Add session-scope default and `--all` flag.

**Files:**
- Modify: `.claude/skills/review/SKILL.md`

- [ ] **Step 1: Read current state**

Run: `wc -l .claude/skills/review/SKILL.md && head -35 .claude/skills/review/SKILL.md`
Expected: current review skill visible with its workflow.

- [ ] **Step 2: Rewrite the skill with absorbed modes**

Use the Write tool to replace `.claude/skills/review/SKILL.md` entirely with the expanded version. (Full replacement is cleaner than multiple surgical edits since several sections interleave.)

First read the current file completely:

Run: `cat .claude/skills/review/SKILL.md`

Then write the new version:

````markdown
---
name: review
description: 'Comprehensive pre-publish audit — spelling, style, structure, SEO, GEO, images, FAQ, translations, code accuracy, undocumented features, deprecated content. Default scope is the git session (working tree + staged). Use `/review <path>` for specific pages or `/review --all` for the full site. Absorbs what used to be /audit page and /audit seo.'
---

# Review — Comprehensive Documentation Audit

Run every pre-publish check against a documentation page or set of pages. One audit engine, three scopes. Read-only by default — changes applied only after user approval.

## Context

Before running checks, read:

- `.claude/context/brand.md` — voice, tone, writing rules
- `.claude/context/audiences.md` — audience expectations per tab
- `.claude/context/documentation-structure.md` — page structure template
- `.claude/context/mintlify-components.md` — correct component usage
- `.claude/context/seo-geo.md` — SEO frontmatter + GEO writing patterns
- `.claude/context/product.md` — Beebole product overview
- `.claude/context/terminology.md` — cross-cutting vocabulary rules
- `.claude/context/page-mappings.md` — for Page → Module routing resolution

**Feedback-aware loading.** For each target page, also read:

- `.claude/context/modules/<entity>.md` for every module listed for this page in `page-mappings.md`. Skip silently if no row or file.
- The H2 section of `.claude/context/page-notes.md` matching the target URL path. Skip silently if no matching H2.

Feedback rules ARE the review checklist — every module/page-note rule becomes an additional check. A violation of a filed rule is a critical issue, not a warning.

## Scopes

- **Default (no args) — session scope:** audit every `.mdx` under `help/` with uncommitted modifications OR new files in git working tree + staged changes. Typical use: run after `/write` to audit what was just produced.
- **Explicit paths:** `/review <path> [paths…]` — audit specific pages.
- **Full site:** `/review --all` — every `.mdx` under `help/`. Expensive; runs via parallel subagents in batches of 5-10.

## Workflow

### 1. Resolve target pages

For each scope:

- **Session:** `git diff --name-only HEAD && git diff --cached --name-only && git ls-files --others --exclude-standard -- help/` and filter to `.mdx` files under `help/`.
- **Explicit:** use the provided path(s).
- **`--all`:** `find help -name '*.mdx'`.

For each target page, also resolve:
- FR translation at `help/fr/<same-path>`
- ES translation at `help/es/<same-path>`

### 2. Run all checks per page

Read the full `.mdx` file and run every check.

#### 2.1 Spelling and grammar

- Scan for typos, spelling errors, grammatical mistakes
- Flag awkward phrasing or overly complex sentences
- Check Mintlify component syntax (unclosed tags, wrong component names)

#### 2.2 Style and writing rules

- Active voice throughout
- Second person ("you") — not "the user"
- UI labels bolded, matching exact text in `../reboot/shared/i18n/en/labels.json`
- Present tense (not future)
- One idea per sentence
- No jargon in user-facing docs (API section exempt)
- No placeholder text, TODOs, or draft notes
- Callouts (`<Tip>`, `<Warning>`, `<Info>`, `<Note>`) placed near relevant content, not grouped
- Steps use `<Steps>`/`<Step>` with one action per step, starting with a verb
- Internal repo vocabulary (`modules/`, `entity`) never appears in user-facing content

#### 2.3 Page structure

- Frontmatter has `title`, `description`, `keywords`
- Introduction paragraph exists (2-4 sentences, definition-style, mentions "Beebole")
- Logical heading hierarchy (no skipped levels)
- Section flow: intro → core tasks → configuration → advanced → troubleshooting → FAQ → related links

#### 2.4 SEO metadata (from former `/audit seo`)

- `title` exists, 50-60 chars, includes feature name
- `description` exists, 120-160 chars, reads as search snippet
- `keywords` array with 3-8 terms including "beebole"
- FR/ES have translated metadata (not English copies)

#### 2.5 GEO compliance

- Intro is definition-style and mentions "Beebole"
- Sections lead with direct answers (LLM-extractable)
- Paragraphs are self-contained
- Headings are clear and descriptive with search terms

#### 2.6 FAQ section

- Exists (API pages exempt)
- Uses `<AccordionGroup>` with `<Accordion>`, 3-5 Q&A pairs
- Questions natural language, answers self-contained mentioning "Beebole"
- Exists in FR/ES too

**If FAQ is missing:** generate it inline as part of the review. 3-5 Q&A pairs based on the page content:
- Questions as real users would ask ("Can I…", "How do I…", "What happens when…")
- Each answer self-contained, 1-3 sentences, links to other pages for details
- Cover permissions, limits, edge cases, common confusion
- Do not invent features
- Use the same UI labels and bold formatting
- Include the generated FAQ in the report as a proposed addition

#### 2.7 Images and alt text

- All referenced images exist in `help/images/`
- WebP format, under 200 KB
- Kebab-case naming with feature context
- Descriptive alt text with keywords (not empty, not "screenshot")

If unoptimized images found, run: `bash .claude/scripts/optimize-images.sh`

#### 2.8 Internal linking

- Links use descriptive anchor text (not "click here")
- All links start with `/help/`

#### 2.9 Translation status

- FR and ES versions exist
- Frontmatter translated (not English copies)
- Content translated (not stale English text)
- Check staleness via `bash .claude/scripts/translate.sh` if in session or explicit-path scope

#### 2.10 Code accuracy

Use the sibling repo at `../reboot`:

- **UI labels** — every bolded label matches `../reboot/shared/i18n/en/labels.json`
- **Feature behavior** — documented workflows match actual code logic
- **Settings & options** — configurable options in code match docs
- **Permissions & roles** — checked against access control logic
- **Defaults & limits** — match model/form defaults and validation rules

**Fallback:** if `../reboot` unavailable, `gh api repos/beebole/reboot/contents/{path} --jq '.content' | base64 -d`. If unavailable, skip this section and note "Code accuracy: Skipped (../reboot not found)".

#### 2.11 Undocumented features (from former `/audit page`)

Features discoverable in code (components, entities, permissions) but not mentioned in the page. Flag as: "Missing from doc — consider adding."

#### 2.12 Deprecated content (from former `/audit page`)

Things documented but no longer in code (removed features, renamed labels). Flag as: "Stale — in docs, not in code. Consider removing or updating."

### 3. Compile the report

**Do NOT make any changes.** Present findings:

```
## Review Report

**Scope:** [session|paths|--all]
**Pages audited:** N
**Date:** YYYY-MM-DD

### Summary
| Check | Issues |
|---|---|
| Spelling & grammar | X |
| Style & writing rules | X |
| Page structure | X |
| SEO metadata | X |
| GEO compliance | X |
| FAQ | Present / Generated / Missing-API-exempt |
| Images | X |
| Internal linking | X |
| Translations (FR) | Up-to-date / Stale / Missing |
| Translations (ES) | Up-to-date / Stale / Missing |
| Code accuracy | X / Skipped |
| Undocumented features | X |
| Deprecated content | X |
| Feedback-file rules | X violations (critical) |

### Critical (must fix before publishing)
[Numbered list with specific details]

### Warnings (should fix)
[Numbered list]

### Suggestions (nice to have)
[Numbered list]

### Generated FAQ (if missing)
[Full markup]

### Recommended actions
[Specific text corrections, tool invocations like `/illustrate`, `/translate`, etc.]
```

### 4. Ask before acting

After the report, ask:

> "Would you like me to fix these issues? I can apply all fixes, or you can pick specific ones."

Only proceed after confirmation. When applying fixes:

- FAQ → insert at bottom (before "Related links" if present)
- Image optimization → run `bash .claude/scripts/optimize-images.sh`
- Translation issues → delegate to `/translate`
- Screenshots → delegate to `/illustrate`
- Spelling/grammar/style/SEO/GEO/structure/label mismatches → apply edits directly
- Undocumented/deprecated → propose content edits

## Rules

- **Read-only by default.** No file modifications until user approves.
- **Be specific.** "Line 42: 'will display' → 'displays' (present tense)" not "fix tenses."
- **Don't invent problems.** Only flag genuine issues.
- **Prioritize clearly.** Critical blocks publishing; warnings improve quality; suggestions are optional.
- **Feedback-file rule violations are CRITICAL.** If a module or page-note rule is broken, it's not a warning.
- **Generate FAQs inline.** Include in the report as a proposed addition.
- **Graceful degradation.** If `../reboot` is missing, skip code accuracy + undocumented + deprecated. Note in report what was skipped.
- **`--all` batching.** Process pages in batches of 5-10 using parallel subagents. Each subagent gets the full check list.
````

- [ ] **Step 3: Verify**

Run: `grep -c "^## Scopes\|^## Workflow\|^## Rules\|Undocumented features\|Deprecated content" .claude/skills/review/SKILL.md`
Expected: at least `5`.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/review/SKILL.md
git commit -m "feat(review): absorb /audit page + /audit seo; add session + all scopes"
```

---

## Task 5: Create `/illustrate` skill

Rename and mildly extend `/screenshot`.

**Files:**
- Create: `.claude/skills/illustrate/SKILL.md`

- [ ] **Step 1: Verify absent**

Run: `test -f .claude/skills/illustrate/SKILL.md && echo "EXISTS" || echo "ABSENT"`
Expected: `ABSENT`

- [ ] **Step 2: Read source**

Run: `cat .claude/skills/screenshot/SKILL.md`
Expected: existing screenshot skill content visible.

- [ ] **Step 3: Create the new skill**

Run: `mkdir -p .claude/skills/illustrate`

Write `.claude/skills/illustrate/SKILL.md`:

````markdown
---
name: illustrate
description: 'Identify screenshot needs on documentation pages and capture them via Playwright. Default: identify + capture for the given page(s). Use `--identify` to list needs only; `--capture` to run against a pre-built list. Replaces the /screenshot skill with the needs/capture split made explicit.'
disable-model-invocation: true
---

# Illustrate — Screenshot Identification + Capture

Make sure every page has the screenshots it needs. Identify placeholders or explicit "needs screenshot" markers, capture via Playwright against `app.beebole.com`, optimize to WebP, place in `help/images/<section>/`.

## Context

- `.claude/context/documentation-structure.md` — page structure template (for placeholder conventions)
- `.claude/context/mintlify-components.md` — `<Frame>` and image component usage

## Modes

- **Default:** `/illustrate <path>` — identify needs on the page, then capture and place.
- **`--identify`:** `/illustrate --identify [<path>]` — list needs only; no capture. Outputs to chat. If no path, scan all `.mdx` under `help/`.
- **`--capture`:** `/illustrate --capture <needs-file>` — run Playwright against a list produced by `--identify` or by `/write`.
- **`--optimize`:** `/illustrate --optimize` — run `bash .claude/scripts/optimize-images.sh` against all images in `help/images/**`. Use when images were added manually or a batch needs recompressing.

## What counts as a "screenshot need"

Scan target pages for:

1. **Placeholder images** — markdown `![alt](/help/images/<section>/<file>.webp)` where `<file>` does not exist on disk.
2. **Explicit markers** — lines containing `[SCREENSHOT: description]` or `<!-- TODO: screenshot -->` or `![TBD: description]`.
3. **Missing illustrative content** — flag pages with `<Steps>` but no illustrative images if the page is in Documentation or Integrations tabs (heuristic; mark as optional need).

## Workflow — default

### 1. Identify needs

For the target page(s):
- Parse the `.mdx` for the three patterns above.
- For each need, extract: target file path (`/help/images/<section>/<file>.webp`), alt text, surrounding context (which section / step).

### 2. Capture

For each identified need:
- Resolve a Playwright recipe based on the surrounding context (which page of app.beebole.com, which UI state).
- Run Playwright to capture. Save to `help/images/<section>/<file>.webp` (or `.png` pre-optimization).
- Optimize to WebP via `bash .claude/scripts/optimize-images.sh` if the output isn't already WebP.

### 3. Verify and report

After capture:
- Verify the target file exists and is under 200 KB.
- Report what was captured, what was skipped, what remains needed (e.g., if Playwright couldn't reach a specific UI state).

```
## Illustrate complete

**Pages scanned:** N
**Needs found:** X
**Captured:** Y
**Skipped (manual required):** Z
**Total image weight:** XXX KB

**Still needed:**
- `/help/images/billing/plan-upgrade.webp` — needs org admin UI
```

## Workflow — --identify only

Same as step 1, but output to chat (or to a file if specified):

```
## Screenshot needs

**Pages scanned:** N

### help/documentation/billing.mdx
- `/help/images/billing/plan-upgrade.webp` (alt: "Plan upgrade dialog")
- `[SCREENSHOT: invoice detail view]` (at line 142)

### help/documentation/timesheet/daily.mdx
- `/help/images/timesheets/daily-entry.webp` (alt: "Entering time for today")
```

## Workflow — --capture only

Read the needs file, run Playwright for each, optimize, report.

## Prerequisites

- `cwebp` — for WebP optimization. Auto-install on macOS: `brew install webp`.
- Playwright — must be set up. (Detailed Playwright setup is out of scope for this skill; assume it works.)
- `bash .claude/scripts/optimize-images.sh` — existing script; no changes.

## Rules

- **Always optimize to WebP** before committing. `.png`/`.jpg` in `help/images/` is a defect.
- **Under 200 KB per image.** If a capture exceeds this, re-optimize or re-capture at lower resolution.
- **Kebab-case filenames** with feature context: `plan-upgrade.webp`, not `screenshot-1.webp`.
- **Descriptive alt text.** Never "screenshot" or empty. Match the page's context.
- **Graceful degradation.** If Playwright isn't set up or the target UI state isn't reachable, report as skipped with specifics — don't silently omit.
````

- [ ] **Step 4: Verify**

Run: `grep -c "^## Context\|^## Modes\|^## Workflow\|^## Rules\|disable-model-invocation: true" .claude/skills/illustrate/SKILL.md`
Expected: at least `4`.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/illustrate/SKILL.md
git commit -m "feat(illustrate): add skill with explicit identify + capture split"
```

---

## Task 6: Create `/news` skill

Release-notes author. Auto-cursor from last `help/news/` entry.

**Files:**
- Create: `.claude/skills/news/SKILL.md`

- [ ] **Step 1: Verify absent**

Run: `test -f .claude/skills/news/SKILL.md && echo "EXISTS" || echo "ABSENT"`
Expected: `ABSENT`

- [ ] **Step 2: Understand the cursor heuristic — check existing news structure**

Run: `ls help/news/ 2>/dev/null | head -5`
Expected: sees existing news files (may be dated in filename like `2026-01-15-foo.mdx`, or use frontmatter date field).

- [ ] **Step 3: Create the skill**

Run: `mkdir -p .claude/skills/news`

Write `.claude/skills/news/SKILL.md`:

````markdown
---
name: news
description: 'Draft a release-notes entry in help/news/ from recent app-repo commits. Default: use the most recent news entry''s date as the cursor, draft new entry for commits since then. `--since <date|sha>` overrides the cursor explicitly. Uses the same change-detection script as /discover. Replaces the former /sync --news mode.'
disable-model-invocation: true
---

# News — Release Notes Author

Draft a release-notes `.mdx` in `help/news/` summarizing app-repo commits since the last published news entry. Autonomous by default — Yves reviews and publishes separately.

## Context

- `.claude/context/brand.md` — voice, tone, entity attribution rules
- `.claude/context/documentation-structure.md` — page structure (news entries have their own conventions, see below)
- `.claude/context/seo-geo.md` — SEO frontmatter
- `.claude/context/product.md` — Beebole product overview

## Interface

- **Default (no args):** `/news` — read the most recent file under `help/news/`, use its publication date as the cursor, draft a new entry for commits since then.
- **`--since <date|sha>`:** explicit cursor. Use for re-drafting a window, covering a specific feature release, or backfilling.

## Workflow

### 1. Determine the cursor

**Default:**
- List files under `help/news/` excluding any `index.mdx`.
- Find the most recent by frontmatter `date` field (preferred) or filename date prefix (fallback).
- Use that date as the cursor.

**`--since <date|sha>`:** use the explicit value.

**First-ever run (no news entries exist):** default to 3 months ago. Print a warning.

### 2. Detect changes

Invoke the shared script:

```bash
.claude/scripts/detect-reboot-changes.sh --since <cursor>
```

Parse the one-JSON-per-line output.

### 3. Group commits by category

For each commit, classify by subject prefix + path analysis:

- `feat:` → **New features**
- `fix:` → **Fixes**
- `perf:` → **Performance**
- `docs:` → skip (doc-only changes don't go in release notes)
- `chore:` / `refactor:` → skip unless the path suggests user-facing impact
- Other / no prefix → read the subject + top files; classify by hand (New features, Fixes, Changes).

### 4. Write the entry

Path: `help/news/<YYYY-MM-DD>-release-<slug>.mdx` where `<slug>` is a short descriptor of the theme (e.g., `absences-improvements`, `billing-overhaul`, or just `updates` for mixed releases).

Structure:

```mdx
---
title: "<Headline summary — e.g., 'April updates: approvals, billing, and mobile'>"
description: "<One-sentence summary for SEO, 120-160 chars>"
date: "YYYY-MM-DD"
keywords: ["beebole", "<main-theme>", "release-notes", "updates"]
---

# <Title>

<1-2 sentence intro framing the release theme. Mention "Beebole".>

## New features

- **<Feature name>** — <What it does, one sentence. Link to relevant doc page.>
- **<Feature name>** — ...

## Improvements

- <Change, one sentence.>

## Fixes

- <Fix, one sentence.>
```

Rules for writing:
- Use the same voice/tone rules as the rest of the docs (per `brand.md`).
- Link every feature bullet to the relevant `/help/documentation/...` page where the feature is documented.
- Bold UI labels from `labels.json`.
- Group related commits into a single bullet if they describe one user-visible change.
- Skip commits that are purely internal (refactors, dependency bumps, test-only changes).

### 5. Update `docs.json` navigation

Add the new entry under `navigation.languages.en` in the News tab, in chronological order (newest first).

### 6. Report

```
## News entry drafted

**File:** help/news/<file>.mdx
**Cursor:** <date or sha>
**Commits covered:** N
**Grouped into:**
- New features: X bullets
- Improvements: Y bullets
- Fixes: Z bullets
- Skipped (non-user-facing): W commits

**Next step:** review the draft, then `/translate` to produce FR/ES.
```

## Rules

- **Autonomous — no checkpoints.** Produce the full draft. User reviews after.
- **Never push.** Write the file and update `docs.json`. Committing is Yves's decision.
- **Link features to their doc pages.** Every **New features** bullet should link to the relevant `/help/documentation/...` page.
- **Skip the noise.** Dependency bumps, refactors, test-only changes, doc-only changes — don't include.
- **Graceful degradation.** If `../reboot` isn't accessible, fall back to `gh api` via the shared script. If both fail, report "cannot detect changes" and don't produce an empty release note.
- **Never include internal jargon.** Keep the language user-facing (no `modules/`, no `entity`, no skill names).
````

- [ ] **Step 4: Verify**

Run: `grep -c "^## Context\|^## Interface\|^## Workflow\|^## Rules\|disable-model-invocation: true" .claude/skills/news/SKILL.md`
Expected: at least `4`.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/news/SKILL.md
git commit -m "feat(news): add release-notes skill with auto-cursor"
```

---

## Task 7: Update `page-mappings.md` skill references

The "used by" note still references old skill names.

**Files:**
- Modify: `.claude/context/page-mappings.md`

- [ ] **Step 1: Grep for old skill references**

Run: `grep -n "/sync\|/audit\|/draft\|/screenshot" .claude/context/page-mappings.md`
Expected: one or more matches in the prose (particularly around "used by" notes).

- [ ] **Step 2: Edit each match to new names**

Use the Edit tool for each occurrence:
- `/sync` → `/discover`
- `/audit coverage` → `/discover`
- `/audit page` → `/review`
- `/audit seo` → `/review`
- `/draft` → `/write`
- `/screenshot` → `/illustrate`

Use `grep -n` output to find exact line positions. For each, use Edit with enough surrounding context to make each occurrence unique.

- [ ] **Step 3: Re-grep to confirm**

Run: `grep -n "/sync\|/audit\|/draft\|/screenshot" .claude/context/page-mappings.md || echo "CLEAN"`
Expected: `CLEAN`.

- [ ] **Step 4: Commit**

```bash
git add .claude/context/page-mappings.md
git commit -m "refactor: update skill names in page-mappings.md"
```

---

## Task 8: Update `/triage` SKILL.md skill references

The `/triage` skill references sibling skill names in its "translation-only routing" rule and possibly elsewhere.

**Files:**
- Modify: `.claude/skills/triage/SKILL.md`

- [ ] **Step 1: Grep for old skill names**

Run: `grep -n "/sync\|/audit\|/draft\|/screenshot" .claude/skills/triage/SKILL.md`
Expected: may find zero hits (the skill mostly references its targets by file path, not by skill name) or a few.

- [ ] **Step 2: If matches found, edit each**

For each match, apply this rename map via the Edit tool (with enough surrounding context to make each replacement unique):

- `/sync` → `/discover`
- `/audit coverage` → `/discover`
- `/audit page` → `/review`
- `/audit seo` → `/review`
- `/draft` → `/write`
- `/screenshot` → `/illustrate`

If no matches in Step 1, skip to Step 3.

- [ ] **Step 3: Verify clean**

Run: `grep -n "/sync\|/audit\|/draft\|/screenshot" .claude/skills/triage/SKILL.md || echo "CLEAN"`
Expected: `CLEAN`.

- [ ] **Step 4: Commit (only if changes made)**

```bash
git add .claude/skills/triage/SKILL.md
git commit -m "refactor(triage): update sibling skill names"
```

If no changes, skip the commit.

---

## Task 9: Update CLAUDE.md — framing + skill references

- [ ] **Step 1: Read current state around the affected sections**

Run: `sed -n '1,20p' CLAUDE.md && echo "---" && sed -n '35,48p' CLAUDE.md && echo "---" && sed -n '143,155p' CLAUDE.md`
Expected: sees the opening, slash commands table, and prerequisites table.

- [ ] **Step 2: Add automation-engine framing after "What is this project?"**

Use Edit tool. Find (keeping some surrounding context to uniquely match):

```markdown
A curated **features reference** is available at `.features/features.md` (symlink to the reboot repo). Use it as a quick overview of what Beebole supports — it's faster than browsing the full source.

## App repository access
```

Replace with:

```markdown
A curated **features reference** is available at `.features/features.md` (symlink to the reboot repo). Use it as a quick overview of what Beebole supports — it's faster than browsing the full source.

**This is an automation engine.** Claude is the default author of English pages. The lifecycle — `/discover` → `/write` → `/review` → `/illustrate` → `/translate` — runs with minimal human intervention. Humans are in the loop at two moments: `/review` (quality gate after writing) and `/triage` (filing accumulated editorial feedback). Every other step is autonomous by default. Interactive/co-author modes exist as opt-ins for cases where a human wants to drive a specific page.

## App repository access
```

- [ ] **Step 3: Replace the slash commands table**

Find the existing table (lines ~39-47). Use Edit tool to replace the entire block:

```markdown
| Stage        | Command       | What it does                                                                                                         |
| ------------ | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Write**    | `/draft`      | Turn raw dictation/notes into a complete documentation page (English only), pulling context from the app source code |
| **Check**    | `/review`     | Full pre-publish audit (spelling, style, SEO, GEO, images, FAQ generation, translations, code accuracy)              |
|              | `/audit`      | Unified audit: `/audit page <path>` (code accuracy), `/audit coverage` (feature gaps), `/audit seo` (SEO & GEO)      |
| **Publish**  | `/translate`  | Detect stale translations and sync FR/ES with English                                                                |
|              | `/screenshot` | Capture screenshots via Playwright, optimize images, embed Arcade demos                                              |
| **Maintain** | `/sync`       | Detect app repo changes, map to affected doc pages, propose updates. `--news` to draft release notes                 |
|              | `/triage`     | Process marked-up feedback files in `docs/feedback/` and file each note into the right context location              |
```

With:

```markdown
| Step            | Command        | What it does                                                                                              |
| --------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| 1. Discover     | `/discover`    | Find what the docs need — recent app changes AND feature-catalog coverage gaps. Writes `.todo/discovery.md`. |
| 2. Write        | `/write`       | Autonomous default: drafts every gap from discovery.md. `/write <path>` for one page. `--interactive` opts into checkpoints. |
| 3. Review       | `/review`      | Comprehensive audit (style, SEO, GEO, FAQ, images, translations, code accuracy). Default scope: session changes. `--all` for full site. |
| 4. Illustrate   | `/illustrate`  | Identify screenshot needs and capture via Playwright. `--identify` or `--capture` to split.                |
| 5. Translate    | `/translate`   | Sync FR/ES with EN master. Reads `translation-notes.md` only.                                             |
| —               | `/news`        | Draft release notes from app-repo commits. Default cursor is the last `help/news/` entry's date.           |
| Orthogonal      | `/triage`      | Process marked-up feedback files in `docs/feedback/` and file each note into the right context location.  |
```

- [ ] **Step 4: Update the prerequisites table**

Find:

```markdown
| `gh` (GitHub CLI) | `/translate`, `/sync` (fallback), app terminology lookups | `command -v gh`       | `brew install gh && gh auth login`                      |
| `python3`         | `/translate` (JSON escaping in scripts)                   | `command -v python3`  | Pre-installed on macOS; otherwise `brew install python` |
| `mintlify`        | Local preview (`mintlify dev`)                            | `command -v mintlify` | `npm install -g mintlify`                               |
```

Replace with:

```markdown
| `gh` (GitHub CLI) | `/translate`, `/discover` (fallback), `/news` (fallback), app terminology lookups | `command -v gh`       | `brew install gh && gh auth login`                      |
| `python3`         | `/translate` (JSON escaping in scripts), `/discover` (cursor parsing)             | `command -v python3`  | Pre-installed on macOS; otherwise `brew install python` |
| `mintlify`        | Local preview (`mintlify dev`)                                                    | `command -v mintlify` | `npm install -g mintlify`                               |
```

- [ ] **Step 5: Update the `/screenshot` reference in the Images quick-reference**

Find: `Run `/screenshot optimize` before committing.`

Replace with: `Run `/illustrate --optimize` before committing.`

- [ ] **Step 6: Verify no stale skill names remain**

Run: `grep -n "/sync\|/audit\|/draft\|/screenshot" CLAUDE.md || echo "CLEAN"`
Expected: `CLEAN`.

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: reframe CLAUDE.md as automation engine; update commands table"
```

---

## Task 10: Delete old skill directories

Clean cutover — old skills stop working.

**Files:**
- Delete: `.claude/skills/sync/`
- Delete: `.claude/skills/draft/`
- Delete: `.claude/skills/screenshot/`
- Delete: `.claude/skills/audit/`

- [ ] **Step 1: Confirm new skills exist and old skills are no longer referenced**

Run:

```bash
for d in discover write illustrate news; do
  test -f .claude/skills/$d/SKILL.md && echo "OK: $d" || echo "MISSING: $d"
done
grep -rn "/sync\|/audit\|/draft\|/screenshot" .claude/ CLAUDE.md 2>/dev/null | grep -v '/vendor/' | grep -v '/skills/sync/' | grep -v '/skills/audit/' | grep -v '/skills/draft/' | grep -v '/skills/screenshot/' || echo "NO_REFERENCES"
```

Expected: all four `OK:` lines, then `NO_REFERENCES` (the `/vendor/` grep exclusion and the self-references in the about-to-be-deleted directories are fine to ignore). If other references remain, stop and fix them in a prior task before proceeding.

- [ ] **Step 2: Delete the directories**

Run:

```bash
rm -rf .claude/skills/sync .claude/skills/draft .claude/skills/screenshot .claude/skills/audit
```

- [ ] **Step 3: Verify absent**

Run:

```bash
for d in sync draft screenshot audit; do
  test -d .claude/skills/$d && echo "STILL_PRESENT: $d" || echo "OK: $d"
done
```

Expected: four `OK:` lines.

- [ ] **Step 4: Commit**

```bash
git add -A .claude/skills/
git commit -m "refactor: remove /sync /draft /screenshot /audit (cutover)"
```

---

## Task 11: Smoke test the new skill set

- [ ] **Step 1: Verify all six new skills parse**

Run:

```bash
for d in discover write review illustrate translate news; do
  head -5 .claude/skills/$d/SKILL.md | grep -q "^name: $d" && echo "OK: $d frontmatter" || echo "FAIL: $d"
done
```

Expected: six `OK:` lines.

- [ ] **Step 2: Verify `/triage` still has valid frontmatter**

Run: `head -5 .claude/skills/triage/SKILL.md | grep -q "^name: triage" && echo "OK: triage" || echo "FAIL: triage"`
Expected: `OK: triage`.

- [ ] **Step 3: Verify the shared script is executable and callable**

Run:

```bash
test -x .claude/scripts/detect-reboot-changes.sh && echo "OK: script executable" || echo "FAIL"
.claude/scripts/detect-reboot-changes.sh --since "3 months ago" 2>&1 | head -3
```

Expected: `OK: script executable`. Then zero or more lines of JSON (or the graceful-degradation error if `../reboot` missing).

- [ ] **Step 4: Verify no stale skill names anywhere in .claude or CLAUDE.md**

Run:

```bash
grep -rn "/sync\b\|/audit\b\|/draft\b\|/screenshot\b" .claude/ CLAUDE.md 2>/dev/null \
  | grep -v '/vendor/' \
  | grep -v 'docs/superpowers/' \
  || echo "CLEAN"
```

Expected: `CLEAN`. (The `/vendor/` exclusion keeps third-party docs out; `docs/superpowers/` keeps old specs and plans out since they're historical.)

- [ ] **Step 5: Verify CLAUDE.md's automation-engine framing is present**

Run: `grep -c "automation engine" CLAUDE.md`
Expected: `1` or more.

- [ ] **Step 6: Final summary to user**

Report:

```text
Lifecycle skills reorganization complete.

New skills:
  .claude/skills/discover/SKILL.md
  .claude/skills/write/SKILL.md
  .claude/skills/illustrate/SKILL.md
  .claude/skills/news/SKILL.md

Modified:
  .claude/skills/review/SKILL.md (absorbed /audit page + /audit seo)
  .claude/skills/triage/SKILL.md (skill-name refs updated if needed)
  .claude/context/page-mappings.md (skill-name refs)
  CLAUDE.md (automation-engine framing + new commands table + prereqs)

New shared script:
  .claude/scripts/detect-reboot-changes.sh

Deleted:
  .claude/skills/sync/
  .claude/skills/draft/
  .claude/skills/screenshot/
  .claude/skills/audit/

Next step for you: try /discover to run the first end-to-end cycle on the new skill set.
```

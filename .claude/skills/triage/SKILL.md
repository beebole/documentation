---
name: triage
description: 'Process marked-up review files in docs/feedback/ and file each note into the correct context location (generic topical file, module file, page-notes.md, translation-notes.md, or inline page fix). Use when asked to triage feedback, process the feedback inbox, or file review notes.'
disable-model-invocation: true
---

# Triage — Process the Feedback Inbox

Read marked-up feedback files from `docs/feedback/`, propose how each distinct note should be filed, apply the filings Yves approves, and delete the source files when done.

## Context

Before running, read these files so proposals land in the right place:

- `.claude/context/brand.md` — generic voice/tone rules
- `.claude/context/documentation-structure.md` — generic structure rules
- `.claude/context/seo-geo.md` — generic SEO/GEO rules
- `.claude/context/mintlify-components.md` — generic component-usage rules
- `.claude/context/terminology.md` — cross-cutting vocabulary rules
- `.claude/context/page-notes.md` — existing page-specific notes
- `.claude/context/page-mappings.md` — keyword routing + Page → Module routing
- `.claude/context/translation-notes.md` — existing FR/ES-specific notes
- All files in `.claude/context/modules/` — existing module rules

## Inputs

No arguments. The queue is whatever is in `docs/feedback/` (excluding `README.md`).

## Workflow

### 1. List the queue

Show Yves the files currently in `docs/feedback/`:

```bash
ls docs/feedback/ | grep -v '^README.md$'
```

Present the count and filenames. If the folder is empty, report "Inbox is empty — nothing to triage" and stop.

### 2. Process each file

For each file in the queue (any order — no date convention):

#### 2a. Read and parse

- Read the file in full.
- Identify which page(s) it references. Heuristics:
  - Explicit URL path like `/help/documentation/billing`.
  - A bolded page title that matches a page.
  - A file reference like `help/documentation/billing.mdx`.
  - For marked-up copies of `.mdx` files, infer from frontmatter `title` or the file's implicit source.
- Split the file content into **distinct notes**. A note is one discrete piece of feedback — a single correction, rule, or observation. Prose paragraphs may contain several notes; a bulleted list usually one per bullet.

#### 2b. For each distinct note, propose ONE filing

Choose among these five options. Reasoning is required; state which option and why.

1. **Extend a generic file** — the rule applies site-wide and fits an existing topical file:
   - Voice/tone → `brand.md`
   - Page structure → `documentation-structure.md`
   - SEO/GEO → `seo-geo.md`
   - Mintlify components → `mintlify-components.md`
   - Cross-cutting vocabulary with no better home → `terminology.md`

2. **Add to a module file** — the rule applies whenever any page touches a product domain. File under `.claude/context/modules/<entity>.md` in one of three H2 sections:
   - `## Terminology` — vocabulary rules specific to this domain
   - `## Facts` — factual/behavioral rules (e.g., "Beebole doesn't prorate")
   - `## Structural` — cross-page structural requirements (e.g., "always link to X")

   To pick the `<entity>`: first look at `page-mappings.md`'s "Page → Module routing" table for the referenced page. If a module is listed, use it. If multiple, pick the most specific. If no row exists, propose a new entity name (kebab-case, mirroring `../reboot/shared/i18n/en/labels.json` top-level keys) and flag it for Yves's confirmation. **Also add a row to `page-mappings.md` when a new module is introduced.**

3. **Add to `page-notes.md`** — the rule applies only to this one page. Add a bullet under the H2 matching the page's URL path. Create the H2 if it doesn't exist.

4. **Add to `translation-notes.md`** — the note is explicitly about an FR or ES translation (language named, translated text quoted, or the marked-up file is from `help/fr/` or `help/es/`). Route to the right language H2 and the right H3 section (Terminology or Page notes). Page notes use an H4 keyed by the EN URL path.

5. **Inline fix** — the note is simply wrong content on the page; no rule generalizes. Edit the page directly.

#### 2c. Present the proposal as a diff

For each note, show:
- The note itself (verbatim excerpt from the feedback file).
- The proposed filing (option + target file + exact insertion point).
- A unified diff of the change.

Example:

```
Note 2 of 4 from feedback-billing-alice.md:
> "The prorated charges paragraph is wrong — Beebole charges the full cycle."

Proposal: Option 2 (module file) → .claude/context/modules/billing.md → ## Facts

Diff:
--- a/.claude/context/modules/billing.md    (new file)
+++ b/.claude/context/modules/billing.md
@@ -0,0 +1,5 @@
+# Billing — module rules
+
+## Facts
+- Beebole charges the full plan cycle; does not prorate mid-month.

(Also adding to page-mappings.md Page → Module routing:)
+| `/help/documentation/billing` | billing |

Approve / edit / skip?
```

#### 2d. Get approval per note

Yves answers `approve`, `edit`, or `skip` per note.

- **approve** — apply the diff as shown.
- **edit** — Yves provides corrections; apply the corrected version.
- **skip** — don't file this note. Track it as skipped so the source file is still eligible for deletion.

#### 2e. Apply approved changes

- Create `.claude/context/modules/` directory if it doesn't exist and a module filing is approved.
- Create module files lazily (first rule in that module creates the file, using the Module file template below).
- Create H2 sections in `page-notes.md` when a new page is first mentioned.
- Create H4 subsections in `translation-notes.md` as needed.

#### 2f. Delete the source file and commit

When every note in the file has been resolved (filed or skipped):

```bash
rm docs/feedback/<filename>
git add .claude/context/ .claude/skills/ docs/feedback/ CLAUDE.md
git commit -m "feedback(<topic>): N filed rules, M inline fixes"
```

`<topic>` is a short slug describing what the feedback was about (e.g., `billing`, `absences`, `multi`). One commit per source feedback file.

### 3. Final report

After all files are processed:

```
## Triage complete

**Files processed:** N
**Rules filed:**
- Generic: X (brand: a, documentation-structure: b, seo-geo: c, mintlify-components: d, terminology: e)
- Module: Y (across Z module files)
- Page notes: V
- Translation notes: W
**Inline fixes:** M
**Skipped notes:** S

**Inbox after triage:** [file list — should be empty or only contain README.md]
```

## Module file template

When creating a new module file for the first time, use:

```markdown
# <Entity> — module rules

## Terminology

## Facts

## Structural
```

Omit any section that has no entries initially — the triage proposal will create the section it's filing into.

## Rules

- **Never delete a source feedback file** until every note in it has been resolved (approved or explicitly skipped).
- **One commit per source feedback file** — don't batch multiple files into one commit.
- **Never auto-approve.** Every filing requires Yves's explicit response.
- **Translation-only routing.** If a note is clearly about an FR/ES translation, route to `translation-notes.md` and nowhere else. Do not also file it as a content rule.
- **Module name consistency.** Reuse existing module names when the entity already has a file. Propose a new name only if no existing module fits.
- **Page-mappings updates.** When a new module is introduced, also add a row to `page-mappings.md`'s "Page → Module routing" table so content skills can find it.
- **README.md is not feedback.** Skip `docs/feedback/README.md` in the queue listing.

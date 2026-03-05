# Generate News Update

Analyze recent documentation changes to infer what changed in the Beebole app, then draft product-focused news entries for the releases page.

## When to use

When the user runs `/generate-news` or asks to "update the news", "write release notes", or "add a news entry".

## Core principle

Documentation changes are **signals of product changes**. The news page communicates what changed in the Beebole app — not what changed on the documentation website. Your job is to reverse-engineer the product changes from the doc diffs.

Examples of this reasoning:
- A new integration page was added → the app likely added a new integration
- An existing feature page was heavily rewritten → the feature likely changed significantly in the app
- A new section about permissions was added to a page → the app likely introduced new permission controls for that feature
- A page got a few FAQ additions or typo fixes → nothing changed in the app, skip it

## Workflow

### 1. Find the date of the last news entry

Read `help/news/releases.mdx` and extract the `label` from the first `<Update>` component (e.g., "March 2025"). This is the most recent published update.

### 2. Get commits since the last news entry

Use `git log` to list all commits on the main branch since the 1st of the month of the last news entry. Focus on commits that changed documentation content files (`help/**/*.mdx`), excluding the news files themselves and translation-only commits.

```bash
git log --oneline --after="YYYY-MM-01" -- 'help/**/*.mdx' ':!help/news/' ':!help/fr/' ':!help/es/'
```

### 3. Analyze the changes and infer product updates

For each relevant commit, inspect what changed:

```bash
git diff <commit>^ <commit> --stat -- 'help/**/*.mdx' ':!help/news/' ':!help/fr/' ':!help/es/'
```

For significant changes, read the actual content diff to understand what was added or rewritten:

```bash
git diff <commit>^ <commit> -- 'help/**/*.mdx' ':!help/news/' ':!help/fr/' ':!help/es/'
```

For each significant change, ask: **"What must have changed in the Beebole app to require this documentation update?"**

Categorize inferred product changes into:
- **New features / integrations** — a new doc page suggests a new capability in the app
- **Major feature updates** — a heavily rewritten page suggests the feature changed significantly
- **Not product-related** — SEO tweaks, FAQ additions, typo fixes, structural refactors, image optimizations, metadata updates → skip these

### 4. Propose the news entry

Present a summary to the user before writing anything. Frame everything as **product changes**, not documentation changes:

```
## Proposed news entry

**Period:** [Month Year]
**Commits analyzed:** [count]

### Inferred product changes:
1. [What likely changed in the app] — inferred from [brief evidence]
2. [What likely changed in the app] — inferred from [brief evidence]
...

### Skipped (no product change detected):
- [reason] — [commit summary]

Shall I draft the update entry?
```

Wait for user confirmation and feedback before proceeding. The user may correct your inferences (e.g., "actually the Asana integration didn't change, we just documented the existing one better").

### 5. Draft the update

Once confirmed, write the `<Update>` block. Follow the existing format in `releases.mdx`:

```mdx
<Update label="[Month Year]" tags={["Tag1", "Tag2"]}>
  Short, user-facing description of product change 1.

  Short, user-facing description of product change 2.
</Update>
```

Rules for writing update entries:
- **Write as product announcements.** "You can now connect Beebole to Jira..." or "New planning features let you..." — not "Added documentation for..."
- **Focus on what the user can now do in the app**, not what they can read about.
- **Use tags** that match the feature area (e.g., "Timesheet", "Reports", "Planning", "Projects", "API", "Integrations"). Use tags already present in the file when possible.
- **Keep each item to 1-2 sentences.** Be concise.
- **Do NOT include items where no product change occurred** (documentation-only improvements).

### 6. Update all three language files

Insert the new `<Update>` block at the top of the updates list (after the frontmatter) in all three files:
- `help/news/releases.mdx` (English)
- `help/fr/news/releases.mdx` (French — translate the content, use French month name)
- `help/es/news/releases.mdx` (Spanish — translate the content, use Spanish month name)

Translate the update descriptions naturally. Use localized month names:
- EN: January, February, March, April, May, June, July, August, September, October, November, December
- FR: Janvier, Février, Mars, Avril, Mai, Juin, Juillet, Août, Septembre, Octobre, Novembre, Décembre
- ES: Enero, Febrero, Marzo, Abril, Mayo, Junio, Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre

### 7. Output

Print a summary after writing:

```
## News updated

**Label:** [Month Year]
**Tags:** [list]
**Items:** [count]
**Files updated:**
- help/news/releases.mdx
- help/fr/news/releases.mdx
- help/es/news/releases.mdx
```

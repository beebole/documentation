---
name: generate-news
description: Draft product-focused news entries for the releases page based on tracked app changes, with user validation before publishing
disable-model-invocation: true
---

# Generate News Update

Use the app changes tracker to draft product-focused news entries for the releases page, with user validation before publishing.

## When to use

When the user runs `/generate-news` or asks to "update the news", "write release notes", or "add a news entry".

## Prerequisites

- `.todo/app-changes.md` must exist and contain tracked app changes. If it doesn't exist or is empty, run the `/track-app-changes` skill first to populate it.

## Workflow

### 1. Find the date of the last news entry

Read `help/news/releases.mdx` and extract the `label` from the first `<Update>` component (e.g., "March 2025"). This is the most recent published update.

### 2. Read app changes since the last news entry

Read `.todo/app-changes.md` and collect all entries dated after the last published news entry. These are the product changes that need to be communicated.

If there are no new entries since the last news update, report "No new app changes to report" and stop.

### 3. Group and select newsworthy changes

Not every app change deserves a news entry. Filter and group:

**Include:**
- New features or capabilities users can now access
- Significant improvements to existing features
- New integrations
- Changes to workflows users will notice

**Exclude:**
- Internal infrastructure, CI/CD, or code quality changes
- Minor CSS fixes or polish (unless part of a larger UX overhaul)
- Translation/i18n tooling changes (not user-facing)
- Analytics or tracking additions
- Bug fixes that users wouldn't have noticed

Group related changes into single news items (e.g., multiple "tags as relations" entries become one announcement).

### 4. Present the draft to the user for validation

Present the proposed news entry to the user **before writing any files**. Use this format:

```
## Proposed news entry

**Period:** [Month Year]
**Based on:** [count] app changes from .todo/app-changes.md

### Proposed items:
1. [News item as it would appear in the update] — based on: [source entries from app-changes.md]
2. [News item] — based on: [source entries]
...

### Excluded (not newsworthy):
- [reason] — [change summary]

### Proposed tags: [Tag1, Tag2, ...]

Do you want me to proceed? You can:
- Remove or edit any item
- Add items I missed
- Change the wording
- Adjust the tags
```

**Wait for explicit user confirmation before proceeding.** Do not write any files until the user approves or adjusts the draft.

### 5. Draft the update

Once the user confirms (with any adjustments), write the `<Update>` block following the existing format in `releases.mdx`:

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

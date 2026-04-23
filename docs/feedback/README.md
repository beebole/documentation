# Feedback inbox

Drop your marked-up review files here. Yves runs `/triage` periodically to file the feedback into the right `.claude/context/` location.

## How to submit feedback

1. Copy the `.mdx` page you reviewed (or write prose notes — any format works).
2. Mark it up however you want: inline strikethroughs, additions, margin notes, bullet lists referencing page paths.
3. Save it in this folder. Name the file however you like — no convention required.

That's it. No tooling, no format, no ticket. Just a markdown file in a folder.

## What happens next

Yves runs `/triage`, which:

- Reads each file in this folder.
- Proposes where each note should land: a generic rule (extends `brand.md` etc.), a module rule (`.claude/context/modules/<entity>.md`), a page-specific note (`page-notes.md`), a translation note (`translation-notes.md`), or an inline page fix.
- Applies the approved proposals.
- Deletes the source feedback file once processed (git history preserves it if ever needed).

## Scope

- **English content feedback** and **FR/ES translation feedback** both go through this inbox.
- One-off fixes to a specific sentence on a page are fine — `/triage` can choose to apply them directly without filing a rule.

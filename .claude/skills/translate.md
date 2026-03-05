# Translate — Sync Translations

Detect and update stale French and Spanish translations to match the English source files.

## When to use

When the user asks to "translate", "sync translations", "update translations", or similar.

## How it works

English (`help/`) is the master language. A translation is **stale** when:
- The EN file was committed more recently than the translation (`committed_after`), OR
- The EN file has uncommitted working-tree changes (`working_tree_changes`)

## Workflow

1. Run the detection script:
   ```bash
   bash scripts/translate.sh
   ```

2. Parse the JSON output. For each file in the `stale` array, process each language:
   - Read the full current EN file
   - Read the existing translation file (for tone/terminology reference)
   - Review the `diff` field to understand what specifically changed
   - Write a complete updated translation of the full EN page

3. After all translations are written, update `docs.json` if any new pages were added. Ensure every translated page appears in the correct language navigation section (`navigation.languages.fr` / `navigation.languages.es`) mirroring its position in the English navigation.

4. Print a summary table at the end.

## Translation rules

- **Translate all text content** including frontmatter (`title`, `description`, `keywords`)
- **Keywords must reflect natural search terms** in the target language — not literal translations
- **Preserve all Mintlify components, image paths, links, and code blocks unchanged**
- **Use the correct localized UI labels** from the app's i18n files:
  - French: `gh api repos/beebole/reboot/contents/shared/i18n/languages/fr.json --jq '.content' | base64 -d`
  - Spanish: `gh api repos/beebole/reboot/contents/shared/i18n/languages/es.json --jq '.content' | base64 -d`
- **Write natural, idiomatic prose** — not literal word-for-word translations
- **Maintain the same page structure** (headings, step order, callout placement)

## Report

```
## Translation Sync Report

**Stale files detected:** X
**Files translated:** X
**Languages updated:** FR, ES

### Details
| English source file | FR | ES | Reason |
|---------------------|----|----|--------|
| help/documentation/timesheets.mdx | Updated | Updated | committed_after |

### Summary
- X files updated in French
- X files updated in Spanish
- X files were already up to date (skipped)
```

If no stale translations are found, state: "All translations are up to date. Nothing to sync."

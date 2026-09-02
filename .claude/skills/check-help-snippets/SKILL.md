---
name: check-help-snippets
description: 'Audit the in-app contextual help snippets (the `beebole/md` repo) against the reboot codebase: every attribute help box and feature preview in the app must resolve to a snippet file, in all 10 languages. Report-only — writes `.todo/help-snippets.md`; fixing means adding files in `../md` and dictionary entries in `../reboot`, which is a separate decision. Runs as a step of `/release`, or standalone when asked to check/audit the in-app help snippets. Run only when explicitly invoked by the user or as a step of /release — do not auto-trigger from conversation.'
disable-model-invocation: true
---

# Check Help Snippets — In-App Contextual Help Coverage

The Beebole app shows two kinds of markdown snippets fetched at runtime from the GitHub repo `beebole/md` (local sibling: `../md`):

- **Help snippets** (`help/help-<key>-<lang>.md`) — shown when a user clicks the **?** on an attribute header. Every non-preview attribute rendered by `entity-attributes.ts` has one.
- **Preview snippets** (`preview/preview-<key>-<lang>.md`) — upsell cards shown in place of an attribute, report, or settings page when the org's plan lacks the feature.

The app resolves keys through `MD_PATH_DICTIONARY` in `../reboot/frontend/src/i18n/md.ts`. A key absent from the dictionary, or a dictionary path with no file, renders as **"[help-…] content not found"** in production — that is what this audit catches. New app features regularly add attributes without anyone adding snippets; this skill closes that loop after each release.

## Sources of truth

| What | Where |
|------|-------|
| Attribute keys (help + preview) | `AttributeName` enum in `../reboot/frontend/src/models/types.ts` |
| Attributes actually rendered (per entity type) | `allEntityAttributes` in `../reboot/frontend/src/services/entity/attributes.ts` |
| Feature gating (which attributes can show as preview) | `getRequiredFeature()` and the tag rule in `../reboot/frontend/src/components/entity/entity-attributes.ts` |
| Other preview call sites | `previewKey` in `../reboot/frontend/src/components/reports/builtin-reports.ts`; `featurePreviewKey.value = …` assignments (grep the frontend) |
| Key → file mapping | `MD_PATH_DICTIONARY` in `../reboot/frontend/src/i18n/md.ts` |
| Snippet files | `../md/help/`, `../md/preview/` |

Languages: `en` (master) + `cs de es fr hu it nl pl pt` — 10 files per key. Missing localized files silently fall back to English (acceptable), but flag them so translations can follow.

Known intentional aliases (not errors): `help-managed-by-en` → `help/help-project-managed-by-en.md`; `help-sso-en` → `help/help-openid-en.md`. The dictionary is keyed on the English name; localized files share the filename with the language suffix swapped.

## Checks

1. **Missing help entries** — every `AttributeName` value that appears in `allEntityAttributes` must have a `help-<value>-en` dictionary entry (pseudo-attributes like `Preview` excluded — preview-mode attributes show an upgrade button, not a help button).
2. **Missing preview entries** — every key that can be requested as a preview must have a `preview-<key>-en` dictionary entry: attributes where `getRequiredFeature()` returns a feature, every attribute available on the **tag** entity except `Tagged` (all gated by `tagsAdvanced`), every `previewKey` in `builtin-reports.ts`, and every `featurePreviewKey` assignment.
3. **Broken dictionary paths** — every path in `MD_PATH_DICTIONARY` must exist as a file in `../md`.
4. **Incomplete language sets** — for every English file referenced by the dictionary, list languages among the 10 with no sibling file.
5. **Orphaned files** — files in `../md/help` and `../md/preview` whose path no dictionary entry resolves to (directly or via language suffix). Report them; never delete.

## Output

Write `.todo/help-snippets.md`:

```markdown
# In-app help snippet audit

Checked: YYYY-MM-DD against ../reboot @ <short commit> and ../md @ <short commit>

## Missing help snippets
- `<attribute key>` — shown on <entity types>; needs `help/help-<key>-{en,…}.md` + dictionary entry

## Missing preview snippets
- …

## Broken dictionary paths
- …

## Incomplete language sets
- `<key>` — missing: <langs>

## Orphaned files
- `<path>` — <best guess why, e.g. attribute removed/renamed>

(or "All clear." under any empty section)
```

If everything passes, the report is a one-liner per section — still write it, so the release PR shows the check ran.

## Rules

- **Report-only.** Fixes live in `../md` (snippet files) and `../reboot` (`md.ts` dictionary) — other repos with their own rules. In a `/release` run, never write to them; the report is committed with the release PR and acting on it is a separate decision.
- Standalone runs may draft the missing snippets when the user asks — follow the established conventions by copying from sibling files: help = 2–4 sentences + `---` + localized "Read more in the documentation →" link to a `beebole.com/help/documentation/…` page; preview = localized **What it does** / **Why use it** headings, 3 bold-led bullets, `---`, the exact localized plan-availability footer used by sibling previews for the same feature. Align terminology with `../reboot/shared/i18n/<lang>/labels.json`.
- If `../reboot` or `../md` is missing, report which checks were skipped — never silently degrade.

---
name: check-help-snippets
description: 'Audit the in-app contextual help snippets (the `beebole/md` repo) against the reboot codebase: every attribute help box and feature preview in the app must resolve to a snippet file, in all 10 languages, and its wording must match the app. Default: audit only, writes `.todo/help-snippets.md`. `--fix` (what `/release` runs): audit, then fix right away: write missing and stale snippets in `../md` and push them, prepare missing dictionary entries in `../reboot` for a commit Yves approves. Run only when explicitly invoked by the user or as a step of /release — do not auto-trigger from conversation.'
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
6. **Stale wording** — for every attribute or feature the release touched (the production notes newer than the last audit, plus anything a previous report carried over under "Content follow-up"), read the English snippet against the app: labels in `../reboot/shared/i18n/en/labels.json`, the attribute's component, the documentation page its "Read more" link points to. Flag a snippet that names a setting that moved, misses a new option of its attribute, or describes behavior the code no longer has.

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

## Stale wording
- `<key>` — <what the snippet says vs what the app does>

## Fixes applied            (only with --fix)
- ../md @ <short commit>, pushed: <files added or rewritten, per key>
- ../reboot: <dictionary entries added, committed @ <short commit> / left uncommitted, waiting for approval>
- Not fixed: <finding> — <reason>

(or "All clear." under any empty section)
```

If everything passes, the report is a one-liner per section — still write it, so the release PR shows the check ran.

## Fix mode (`--fix`)

Run the audit and write the report first, then act on every finding in the same run. Nothing waits for a later decision except the `../reboot` commit, which that repo's rules reserve for Yves.

### In `../md` (fixed and pushed)

1. **Preflight:** `../md` is on `main`, `git status --porcelain` is empty, `git pull --ff-only` succeeds. If not, skip the `../md` fixes and record why under "Not fixed". Never stash or switch branches.
2. **Missing help or preview snippet:** write the English file, then the 9 localized siblings.
3. **Incomplete language set:** write each missing localized file from the English one.
4. **Broken dictionary path:** if the key is still used by the app, write the missing file. If the key is dead, leave the file side alone and handle it in `../reboot` (below).
5. **Stale wording:** rewrite the English snippet so it matches the app, then apply the same change to all 9 localized files so the languages never drift apart.
6. **Orphaned files:** never delete. Report only.
7. Commit only the files written, with message `Help snippets: <what changed> (docs release YYYY-MM-DD)` (or `(audit YYYY-MM-DD)` standalone), then `git push`. `main` is what the app serves (it reads `beebole/md` through the GitHub contents API), so the fix is live as soon as the push lands. That is the intent.

Writing conventions, copied from sibling files: help = 2–4 sentences + `---` + localized "Read more in the documentation →" link to a `beebole.com/help/documentation/…` page; preview = localized **What it does** / **Why use it** headings, 3 bold-led bullets, `---`, the exact localized plan-availability footer used by sibling previews for the same feature. Use the exact UI labels of each language from `../reboot/shared/i18n/<lang>/labels.json`, and describe only what the code does — never invent a feature.

### In `../reboot` (prepared, committed only on Yves' approval)

`../reboot` has its own rules: one command per Bash call (no `&&`, no `;`, no `cd … &&`), **ask before every commit, never push**.

1. **Preflight:** `git status --porcelain` in `../reboot` is empty. If not, skip and record why.
2. `git fetch origin`, `git switch dev`, `git pull --ff-only` (dictionary changes land on `dev`, like every app change; `prod` is only reached through a deploy).
3. Add each missing `'help-<key>-en'` / `'preview-<key>-en'` entry to `MD_PATH_DICTIONARY` in `frontend/src/i18n/md.ts`, pointing at the English file (which must exist in `../md` by now). Remove an entry only when its key has no call site left and its file is gone too. Keep the file's existing order and formatting, and run `npx prettier --check frontend/src/i18n/md.ts`.
4. Show the diff and ask Yves to approve the commit (message `Add <key> help snippet dictionary entries`). On yes, commit and give him `git -C ../reboot push` to run himself. On no, or when the run is unattended (as in `/release`, which asks at the end instead), leave the change uncommitted on `dev` and say so in the report.

## Rules

- **Default mode is report-only.** Without `--fix`, never write to `../md` or `../reboot`.
- **`--fix` pushes `../md` straight to `main`**, which is live in the app at once. That is why every rewrite stays strictly within what the code and `labels.json` support.
- **Never push `../reboot`, never commit there without Yves' in-the-moment approval.**
- If `../reboot` or `../md` is missing, report which checks were skipped — never silently degrade.

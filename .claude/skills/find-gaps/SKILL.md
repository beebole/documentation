---
name: find-gaps
description: 'Compare the Beebole feature catalog (`.claude/context/features.md`) against the documentation in `help/**` and write `.todo/gaps.md` listing every Missing or Partial page. The handoff is consumed by `/write` to draft pages in batch. Use when asked to find documentation gaps, check coverage, or prepare the next batch of pages to write.'
disable-model-invocation: true
---

# Find Gaps — Detect Documentation Coverage Gaps

Compare the canonical feature catalog to the existing documentation and emit a structured handoff that `/write` consumes directly.

This skill is read-only — it never modifies pages in `help/**`. It assumes `features.md` is reasonably fresh; run `/sync-features` first if the catalog is stale.

## Context

Before running, read:

- `.claude/context/product.md` — Beebole product overview
- `.claude/context/page-mappings.md` — Keyword → Page routing + Page → Module routing
- `.claude/context/brand.md` — voice/tone rules
- `.claude/context/terminology.md` — cross-cutting vocabulary rules

**Feedback-aware loading.** Read ALL files in `.claude/context/modules/`. Skip silently if the directory is absent or empty — it's lazy-created by `/triage` and may not exist yet. When a coverage gap touches a module with accumulated rules, flag it in the report as **Rule-level review** — the module rules may also need updating, not just the pages.

## Workflow

### 1. Read the catalog

Read `.claude/context/features.md`.

**Format guard:** if the catalog has fewer than 20 or more than 26 sections, or fewer than 100 bullets total, halt and warn the user — the catalog format has drifted and classification may be unreliable.

**Freshness check:** read the `**Last updated:** YYYY-MM-DD` line. If it is more than 90 days old, warn the user and suggest running `/sync-features` first. Continue anyway if the user accepts.

### 2. Classify each feature

Extract every bullet from sections 1–24 of the catalog. Skip section 25 (Planned Features) and any Internal section.

For each feature:

- Match it to a documentation page via `page-mappings.md` (semantic match on keywords).
- If a mapped page exists: read it and classify the feature as **Covered**, **Partial**, or **Missing**.
- If a mapped page does not exist: classify as **Missing** (full gap).
- If no mapping row exists for the feature: flag the page-mapping gap as a separate proposed addition.

### 3. Write `.todo/gaps.md`

Overwrite with:

```markdown
# Gaps report

Generated: YYYY-MM-DD
Catalog last updated: YYYY-MM-DD

---

## Coverage gaps → undocumented features

[For each gap, grouped by feature section. Format is fixed so `/write` can parse reliably.
Each line starts with `- [ ] <Kind> | <path> | ` — pipe-delimited, stable anchors.]

### Section N: <section name>

- [ ] Missing | `<path>` | <feature>
- [ ] Partial | `<path>` | <feature> — needs: <what to add>

[If no gaps:]
_All features covered._

---

## Rule-level review recommended

[For each module whose rules may need revisiting because a gap touches it:]
- `modules/<entity>.md` — <why: which gap affected it>

[If none:]
_No module rules flagged._

---

## Proposed page-mappings additions

[For each feature with no row in page-mappings.md's Keyword→Page table:]
- Keywords: `<keyword-list>` → proposed page: `<path>`

[If none:]
_No new mappings needed._

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (one per line). Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each.
```

**After writing the file, ask the user to approve any Proposed page-mappings additions** before modifying `page-mappings.md`. If approved, add the rows and commit `page-mappings.md` alongside `.todo/gaps.md`.

### 4. Print summary

```
Find-gaps complete.

Coverage: X missing, Y partial across Z sections.
Report written to .todo/gaps.md.

Next step: /write to draft the missing pages.
```

## Rules

- **Always write `.todo/gaps.md`.** Even if there are no gaps, write the file so `/write` has a consistent input contract.
- **Don't modify documentation pages.** This skill is read-only — no edits to `help/**`.
- **Graceful degradation.** If `../reboot` is unavailable, the catalog is still usable on its own. Report it but do not block — the catalog is the source of truth here, not reboot.
- **Never silently merge features.** Every feature in the catalog either maps to a page or is flagged as a gap.
- **Don't re-do `/sync-features`'s job.** This skill only consumes the catalog — it never reads from `../reboot` directly to identify features.

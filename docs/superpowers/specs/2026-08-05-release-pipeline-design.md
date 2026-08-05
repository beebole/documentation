# /release — post-deploy documentation pipeline (design)

**Date:** 2026-08-05
**Status:** Approved by Yves (conversation, 2026-08-05)

## Problem

When the app ships to production, updating the docs requires manually chaining
`/sync-features` → `/news` → `/find-gaps` → `/write` → `/review` → `/find-gaps`,
then packaging the result for human review. This should be one manual command
that ends in a PR assigned to Yves.

## Decision

A new orchestrator skill at `.claude/skills/release/SKILL.md`, launched manually
with `/release`. It runs the existing lifecycle skills in sequence in one session
(shared context between steps), on a dedicated branch, and opens a PR as the human
review gate. Alternatives rejected: shell script chaining headless `claude -p`
calls (isolated sessions, no shared context), scheduled cloud agent (user wants
manual trigger).

## Scope decisions (confirmed with Yves)

- **/news included** — the release run drafts the monthly changelog entry too.
- **/review auto-applies fixes** — no mid-run approval; the PR is the approval gate.
- **/illustrate identify-only** — screenshot needs listed in the PR body; capture
  happens later with `/illustrate --capture` when the app is running.
- **No translations** — site is EN-only.
- **No auto-merge, no scheduling.**

## Pipeline

1. **Preflight:** `../reboot` reachable, docs tree clean on up-to-date `main`,
   `gh` authenticated, and new production notes exist in
   `../reboot/frontend/public/release-notes/production/` since the last covered
   date. Nothing new → report "nothing to release" and stop (no empty PR).
2. **Branch:** `docs/release-YYYY-MM-DD` from fresh `main`. One commit per step.
3. **Steps:** `/sync-features --incremental` → `/news` → `/find-gaps` → `/write`
   (Missing in batch, Partial one-by-one) → `/review` (session scope, auto-apply,
   log fixes) → `/illustrate --identify` → final `/find-gaps` verification
   (one `/write` retry if not clean, then flag leftovers in the PR).
4. **PR:** push branch, `gh pr create --assignee @me`, structured body: deploys
   covered, pages added/updated, review fixes, screenshot needs, remaining gaps.
5. **Failure handling:** any step fails → commit what's done, push, open a
   **draft** PR noting "stopped at step X because Y".

## Sub-skill overrides

The run is unattended, so interactive gates inside sub-skills are overridden:
`/find-gaps` page-mapping additions are applied without asking (visible in the
PR diff); `/review` applies its fixes without asking and records them for the
PR body.

## Branch lifecycle

Repo setting "Automatically delete head branches" is enabled as part of setup.
Merged release branches self-delete; the PR (diff, description, comments)
remains on GitHub permanently as the release record.

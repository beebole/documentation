---
description: Audit CLAUDE.md files for quality, completeness, and currency against the codebase
allowed-tools: Read, Edit, Glob, Grep, Bash
---

Use the `claude-md-improver` skill from `.claude/vendor/claude-md-management/skills/claude-md-improver/SKILL.md` to audit and improve CLAUDE.md files in this repository.

Read that SKILL.md file and follow its workflow exactly:

1. **Discovery** — Find all CLAUDE.md files in the repo
2. **Quality Assessment** — Score each file against the quality criteria (commands, architecture, patterns, conciseness, currency, actionability)
3. **Quality Report** — Output the full report with scores and grades BEFORE proposing any changes
4. **Targeted Updates** — Propose specific, minimal additions with diffs
5. **Apply with Approval** — Only edit files the user approves

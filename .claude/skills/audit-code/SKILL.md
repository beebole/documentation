---
name: audit-code
description: Cross-reference a documentation page against the Beebole application source code to find inaccuracies, missing features, outdated content, and undocumented behavior
disable-model-invocation: true
---

# Code Audit — Cross-reference Documentation Against Source Code

Audit a documentation page by comparing it against the Beebole application source code (https://github.com/beebole/reboot). Identifies inaccuracies, missing features, outdated content, and undocumented behavior.

## When to use

When the user asks to "audit against code", "check code accuracy", "cross-reference with code", "code audit", "verify against source", or similar.

## Inputs

The user provides:
- **One or more page paths** (e.g., `help/documentation/projects.mdx`)
- If no path is given, ask which page(s) to audit

## Prerequisites

- `gh` CLI must be installed and authenticated (used to fetch source code from GitHub)
- Test with: `gh api repos/beebole/reboot/contents/README.md --jq '.name'`

## Workflow

### 1. Read the documentation page

Read the full `.mdx` file. Identify:
- **Which feature** is being documented (e.g., projects, timesheets, absences, settings)
- **Key claims** made in the page: behavior descriptions, options/settings listed, permissions mentioned, default values, limits, validation rules, workflows
- **UI labels** referenced (bolded text)

### 2. Locate the relevant source code

Use the GitHub API to explore the `beebole/reboot` repository and find code related to the documented feature.

#### Strategy for finding relevant code

Start by exploring the repository structure:
```bash
gh api repos/beebole/reboot/git/trees/master?recursive=1 --jq '.tree[].path' | head -200
```

Then narrow down using the feature name. Common places to look:
- **Frontend components** — UI screens, forms, settings panels
- **Backend logic** — API resolvers, business logic, validation
- **i18n labels** — `shared/i18n/languages/en.json` (and `fr.json`, `es.json`)
- **GraphQL schema** — Type definitions, queries, mutations
- **Database models** — Field definitions, defaults, constraints

Fetch specific files with:
```bash
gh api repos/beebole/reboot/contents/{path} --jq '.content' | base64 -d
```

For large files, search for relevant sections:
```bash
gh api repos/beebole/reboot/search/code?q={keyword}+repo:beebole/reboot --jq '.items[].path'
```

### 3. Cross-reference: documentation vs code

For each documented claim, verify against the source code:

#### 3.1 UI labels accuracy
- Fetch the i18n file for each relevant language:
  ```bash
  gh api repos/beebole/reboot/contents/shared/i18n/languages/en.json --jq '.content' | base64 -d
  ```
- Compare every **bolded label** in the doc page against the actual i18n strings
- Flag labels that don't match the app's current wording

#### 3.2 Feature behavior
- Compare documented workflows with actual code logic
- Check if described steps match the real UI flow (component rendering, navigation)
- Verify conditional behavior ("if you enable X, then Y happens") against code

#### 3.3 Settings and options
- List all configurable options found in the code for this feature
- Compare against what the documentation describes
- Flag undocumented settings, toggles, or options

#### 3.4 Permissions and roles
- Check permission checks in the code (role guards, access control logic)
- Compare against any permissions documented on the page
- Flag missing or incorrect permission information

#### 3.5 Default values and limits
- Look for default values in code (model defaults, form defaults)
- Look for validation rules (min/max, required fields, format constraints)
- Compare against documented defaults and limits

#### 3.6 Undocumented features
- Identify functionality in the code that relates to this feature but is not mentioned in the docs
- This includes: sub-features, edge cases, related settings, integrations with other features

#### 3.7 Deprecated or removed functionality
- Check if anything documented on the page no longer exists in the code
- Flag references to removed settings, old workflows, or renamed concepts

## 4. Compile the report

**Do NOT make any changes.** Present findings as a structured report:

```
## Code Audit Report

**Page:** [path]
**Date:** [today]
**Feature area:** [identified feature]
**Source files examined:** [list of key files checked in beebole/reboot]

### Overview
| Check | Status |
|-------|--------|
| UI labels | Match / X mismatches |
| Feature behavior | Accurate / X issues |
| Settings & options | Complete / X undocumented |
| Permissions & roles | Accurate / X issues |
| Defaults & limits | Accurate / X issues |
| Undocumented features | None / X found |
| Deprecated content | None / X items |

### Issues found

#### Critical (documentation is wrong)
- [Behavior/label/permission that contradicts the source code]

#### Missing (feature exists in code but not in docs)
- [Undocumented settings, options, or features]

#### Stale (documented but no longer in code)
- [Removed features, renamed labels, old workflows]

#### Minor (cosmetic or low-impact)
- [Label casing differences, minor wording mismatches]

### Recommended actions
For each issue, state what to change in the documentation. Include:
- The specific text to update and what it should say
- New sections to add for undocumented features
- Content to remove for deprecated features
```

## 5. Ask before acting

After presenting the report, ask the user:

> "Would you like me to fix these documentation issues? I can apply all fixes, or you can pick specific ones."

Only proceed with changes after the user confirms.

## Rules

- **Read-only by default.** Never modify documentation files until the user approves.
- **Be specific.** Quote the exact doc text that's wrong and the code that proves it. Include file paths and line references for both.
- **Don't invent issues.** Only flag things where the code clearly contradicts or supplements the documentation. If the code is ambiguous, note it as "needs verification" rather than flagging it as wrong.
- **Respect scope.** Only audit what the page documents — don't expand into unrelated features just because the code touches them.
- **Prioritize user-facing impact.** A wrong UI label or incorrect workflow is critical. An undocumented internal setting that users never see is minor.
- **Don't expose internal code details.** The documentation is for end users. Recommendations should be written in user-facing language, not developer terms (except for API pages).

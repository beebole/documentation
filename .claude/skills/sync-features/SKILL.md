---
name: sync-features
description: "Sync features.md against the Beebole app codebase to find new or changed features. Use when asked to sync features, update the feature list, check for new features in the reboot repo, review the feature inventory, or compare docs against the codebase."
---

# Sync Reboot Features

## Prerequisites

- `gh` CLI must be installed and authenticated (`gh auth status`)
- `.features/features.md` must exist. If it doesn't, ask the user whether to create it from scratch or if the file is expected to be somewhere else.

## Context

Before syncing features, read this context file:
- `.claude/context/product.md` — Beebole product overview and key concepts (helps classify features)

## Overview

Compare the reboot codebase (`beebole/reboot` on GitHub, dev branch) against `.features/features.md` and propose updates for missing or changed features.

## Classification Rules

**The features.md is a comprehensive inventory of all capabilities found in the codebase.** Every entry is classified into one of two tiers:

### User-facing (numbered sections)
- Features customers interact with directly (UI, workflows, integrations)
- Capabilities that affect the end-user experience
- Security features users benefit from (SSO, passkeys, etc.)
- Billing and subscription features
- Developer-facing capabilities relevant to a subset of users (e.g., API)
- Performance improvements that are user-perceptible (e.g., fast loading, real-time sync)

### Internal / non user-facing (last section)
- **Translation/localisation engine** — internal dev workflow (but the resulting multilingual UI IS user-facing under Localization)
- **Product analytics / PostHog eventing** — internal tracking
- **CI/CD pipelines, build tooling, dev scripts**
- **Internal documentation or architecture decisions**
- **Database internals, caching strategies** — implementation details
- **Code quality tools, linters, test infrastructure**
- **Infrastructure layers** (WebSocket, JWT, outbox) — the features they enable are listed in user-facing sections
- **One-time or transitional tools** (e.g., legacy migration) that are no longer relevant to current users

Items in the internal section are kept so they are **not re-flagged during future syncs**.

### Ambiguous items

When a new feature doesn't clearly fit into either tier, **do not guess** — add it to the proposal table as "Needs clarification" and ask the user to decide. There is no grey area tier; every item must be resolved as user-facing or internal before applying changes.

## Process

### Step 1: Explore the reboot repo on GitHub

Use the GitHub CLI to browse the `beebole/reboot` repo's `dev` branch directly on GitHub.com. No local clone is needed.

**Fetch recent commits:**
```
gh api repos/beebole/reboot/commits?sha=dev&per_page=100 --jq '.[].commit.message'
```

**Browse the file tree:**
```
gh api repos/beebole/reboot/git/trees/dev?recursive=1 --jq '.tree[].path'
```

**Read specific files:**
```
gh api repos/beebole/reboot/contents/<path>?ref=dev --jq '.content' | base64 -d
```

Use an Explore agent (very thorough) with the above commands to scan for:
- Recent commit history (~200 commits, paginate with `&page=2` if needed)
- Frontend routes, pages, and components for new UI features
- Backend GraphQL schema and application entities for new capabilities
- New integrations, entity types, or modules
- Documentation files (CLAUDE.md, SKILL.md, changelogs)

### Step 2: Read current features.md

Read `.features/features.md` in full.

### Step 3: Diff and classify

Compare what exists in the codebase against what's documented. For each gap:
1. Classify as **user-facing** or **internal** using the classification rules above
2. If a feature is ambiguous, mark it as **needs clarification** — do not place it in either tier without asking
3. All tiers go into the proposal — nothing is discarded

### Step 4: Present changes and ASK before editing

Present a structured summary to the user:

**New user-facing entries:**
| Section | Proposed entry | Source |
|---------|---------------|--------|

**New internal entries:**
| Proposed entry | What it does internally |
|----------------|------------------------|

**Needs clarification (ambiguous — user must decide):**
| Proposed entry | Why it's ambiguous | Suggested tier |
|----------------|--------------------|----------------|

**Reclassifications (moved between tiers):**
| Entry | From | To | Reason |

Then ask: "Should I proceed with these changes? For the items needing clarification, please tell me whether each should be user-facing or internal."

### Step 5: Apply changes only after approval

Edit `.features/features.md` only after the user confirms (including resolution of all ambiguous items). Update the `**Last synced:**` date at the top of the file to today's date (YYYY-MM-DD format). Maintain the existing format:
- `## N. Section Name` for user-facing sections
- `## Internal (Non User-Facing)` as the last section
- `- **Feature name** — short description` for entries
- Keep descriptions concise (one line) and benefit-oriented for user-facing entries
- Internal entries include a brief note on what they do, so they aren't re-flagged in future syncs

## Writing Style

- Professional but approachable (Beebole voice)
- Describe what the feature **does for the user**, not how it's built
- Avoid technical implementation details (no "JWT", "WebSocket", "GraphQL" in descriptions)
- Use active, clear language

### Examples

```markdown
# Bad (developer-facing)
- **Outbox architecture** — reliable delivery pipeline with retry

# Good (user-facing)
- **Reliable delivery** — notifications are retried automatically if delivery fails

# Bad (too technical)
- **Passkey/WebAuthn support** — passwordless authentication with discoverable credentials, clone detection, and multi-device support

# Good (user-facing)
- **Passkey support** — passwordless sign-in with fingerprint or face recognition, works across all your devices
```

## Common Mistakes

- Adding internal dev tools as features (translation engine, analytics pipeline)
- Using developer jargon in descriptions (JWT, SSE, HMAC, RFC numbers)
- Making changes without asking first
- Missing new features because only recent commits were checked (scan broadly, not just last 20 commits)
- Adding planned/unshipped features without flagging them as such
- Not handling `gh` API failures — if the GitHub API is rate-limited or unavailable, report what could not be checked rather than proceeding with incomplete data

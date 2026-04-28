---
name: sync-features
description: 'Refresh `.claude/context/features.md` — the canonical Beebole feature catalog — by scanning the `../reboot` codebase. Default is a full scan from scratch. Use `--incremental` to only inspect commits since the catalog''s `Last updated:` date. Output is a structured, non-technical catalogue grouped by functional area.'
disable-model-invocation: true
---

# Sync Features — Refresh the Beebole Feature Catalog

Scan `../reboot` and maintain `.claude/context/features.md` — a structured, non-technical catalogue of all Beebole features grouped by functional area.

This skill produces the catalog that `/find-gaps` consumes to detect documentation coverage gaps. The catalog is the canonical source of truth for "what does Beebole do?" — the docs and marketing are downstream.

## Modes

- **Default (no args)** — full scan of the entire `../reboot` codebase. Ignores the `Last updated:` date in `features.md`. Recreates the file if absent.
- **`--incremental`** — scoped scan: reads `Last updated:` from `features.md` and inspects only `../reboot` commits since that date. Order of magnitude faster on small updates, but only catches drift in changed areas.

---

## Source of truth: local `../reboot` only

Always read code from the local sibling repo at `../reboot`. **Never use the GitHub API** (`gh api repos/beebole/reboot/...`) for this skill — a full audit reads thousands of files, which would be impractically slow and rate-limit-heavy via the API.

If `../reboot` is unavailable or not a git repo, halt and tell the user to clone or symlink it. Do not silently fall back to GitHub.

---

## What counts as a feature?

One bullet = one distinct capability. What qualifies depends on the category:

| ✅ Counts as a feature                                         | ❌ Does not count                     |
| -------------------------------------------------------------- | ------------------------------------- |
| Multi-stage approval workflow (user-facing)                    | GraphQL resolver for approvals        |
| Timesheet compliance score shown as a ring gauge (user-facing) | MongoDB index on time records         |
| SSO login via Google or Microsoft (user-facing)                | JWT token refresh mechanism           |
| WebSocket real-time notification layer (internal)              | Individual WebSocket event handler    |
| PostHog analytics pipeline (internal)                          | A single tracking call in a component |

**When in doubt whether something qualifies, or whether it is one entry or two — do not guess. Add it to the clarification table in the plan.**

---

## `features.md` Format

### Header

```markdown
# Beebole Features

**Last updated:** YYYY-MM-DD

---
```

### Categories (in this order)

1. **User-facing features** — capabilities visible to administrators and team members
2. **Internal / Technical features** — implementation details kept for audit continuity
3. **Planned features** — confirmed in `../reboot/docs/feature-requests/` but not yet found in code
4. **Deprecated features** — previously implemented, no longer present in the codebase

### Entry format

```markdown
- `category/feature-slug` **Feature name** — One-sentence description from the administrator's perspective.
```

Every feature has a unique **key** in backticks before the bold name. The key uses the format `category/feature-slug` where:

- `category` is the lowercase kebab-case functional area (e.g., `time-tracking`, `absence`, `approval`, `tasks`, `people`, `projects`, `tags`, `billing`, `schedules`, `roles`, `custom-fields`, `org`, `reports`, `journal`, `notifications`, `integrations`, `api`, `auth`, `subscription`, `audit`, `migration`, `ui`, `planned`, `internal`)
- `feature-slug` is a short lowercase kebab-case identifier for the feature

Keys are **stable identifiers** — they must not change when a feature's name or description is reworded. When adding new features, choose a key that is concise, descriptive, and unlikely to collide. When moving a feature between categories, **keep its existing key** to preserve external references.

### Deprecated entry format

```markdown
- `category/feature-slug` **Feature name** — Description. _(Last seen: approx. YYYY-MM)_
```

Features are organised by functional area using plain English group headings (e.g., `## Time Tracking`).

---

## Full Scan Workflow (default mode)

Execute every step in order. **Do not modify `features.md` at any point — produce a plan and wait for user confirmation.**

1. **Check for `.claude/context/features.md`** — if absent, note it will be created from scratch.

2. **Scan the entire `../reboot` codebase** — read backend entities, frontend components, services, and routes to identify every user-facing and admin-facing capability currently implemented. Use paths like `../reboot/backend/src/application/entities/`, `../reboot/frontend/src/components/`, `../reboot/frontend/src/models/types.ts`.

3. **Scan `../reboot/docs/feature-requests/`** — for each entry, verify whether the described feature exists in the code:
    - Found in code → classify as user-facing or internal.
    - Not found in code → add to the **Planned** category.
      Do not treat a `docs/feature-requests/` entry as implemented without verifying in code.

4. **Build a raw feature list** — list every candidate feature with its proposed category, functional group, and a draft description.

5. **Existing-entry verification** — for every feature already in `features.md`, run two checks against the `../reboot` codebase:
    - **Removal check:** does the underlying code still exist? If not, the feature is a candidate for the **Deprecated** category — never silently delete entries; always move them with the appropriate `_(Last seen: approx. YYYY-MM)_` suffix. Removal candidates surface in the numbered proposal alongside additions.
    - **Description accuracy check:** does the description still accurately reflect what the code does? Flag descriptions that are wrong, incomplete, misleading, or use jargon banned by the Writing Style section. Do not assume existing descriptions are correct — treat them as hypotheses to be verified against the codebase.

6. **Ambiguity check** — for any feature where the category or description cannot be determined with confidence, mark it `Needs clarification`. Collect all such items into a clarification table (see step 10). **Do not guess.**

7. **Redundancy check** — identify features that overlap significantly or could be merged. Explain why and propose the merged entry.

8. **Consistency check** — identify features with inconsistent naming, wrong category, or technical jargon in descriptions. Propose corrections with a brief rationale.

9. **Build the numbered proposal** — an ordered plan of all proposed additions, moves, merges, rewrites, and deletions. Each item must state:
    - What the change is
    - Why it is proposed
    - Target category and functional group

10. **Clarification table** — immediately before the plan summary, a table of every `Needs clarification` item with:
    - Feature name
    - Why it is ambiguous
    - Two or three candidate classifications with brief rationale for each

11. **Plan summary** — a short numbered list at the end repeating every proposed action (same numbering as the full plan).

12. **Wait for confirmation** — do not touch `features.md` until the user explicitly approves. Apply only the approved items; flag any the user skips for the next revision.

---

## Incremental Workflow (`--incremental`)

Execute every step in order. **Do not modify `features.md` without user confirmation.**

1. **Read `.claude/context/features.md`** — extract the `Last updated:` date.

2. **Identify changed commits** — run:

    ```bash
    git -C ../reboot log --since="YYYY-MM-DD" --name-only --pretty=format:""
    ```

    If `../reboot` is unavailable or git history is unreadable, report what could not be checked and list those areas as requiring manual review rather than proceeding silently.

3. **Scan changed files** — for each changed file, determine whether it introduces, modifies, or removes a user-facing or admin-facing capability.

4. **Scan `../reboot/docs/feature-requests/` for new files** — check for files added since the last update date. Verify in code before adding to Planned.

5. **Check for removals** — for every feature currently in `features.md`, verify the underlying code still exists in `../reboot`. Features whose code has been deleted are candidates for the **Deprecated** category — never silently delete entries; always move them with the appropriate `_(Last seen: approx. YYYY-MM)_` suffix. Even in incremental mode, run this check across the full catalog: removals can happen in commits not tied to obvious feature areas.

6. **Continue with steps 5–12 from the Full Scan Workflow** (description accuracy check → ambiguity check → redundancy → consistency → numbered proposal → clarification table → plan summary → wait for confirmation).

---

## Classification Rules

### User-facing

Capabilities that any user — administrators, managers, or team members — interacts with directly. Includes: UI workflows, third-party integrations, security features users benefit from (SSO, passkeys, MFA), billing management, API access, and user-perceptible performance improvements.

### Internal / Technical

Implementation details kept solely to prevent re-flagging in future syncs. Includes: translation/localisation engine, analytics pipelines, CI/CD, database internals, caching strategies, queue infrastructure, code quality tools, WebSocket engine, JWT system, outbox pattern.

### Planned

Features confirmed in `../reboot/docs/feature-requests/` that are **not yet found in the codebase**. Never assume a `docs/feature-requests/` entry is shipped — always verify in code first.

### Deprecated

Features previously implemented that no longer exist in the codebase. Move here instead of deleting.

### Ambiguous / Needs clarification

When a feature does not clearly fit any category, **do not guess**. Add it to the clarification table. **An unclear category is never an acceptable final state.**

---

## Writing Style

- **Audience:** administrators and managers evaluating or configuring the product — not developers.
- Describe what the feature **does for the user**, not how it is built.
- Avoid technical terms: no "JWT", "WebSocket", "GraphQL", "SSE", "HMAC", "RFC", "OAuth", "DataLoader", or similar jargon.
- Use active, clear language.

```markdown
# Bad — developer-facing

- **Outbox architecture** — reliable delivery pipeline with retry and deduplication

# Good — user-facing

- **Reliable delivery** — notifications are retried automatically if delivery fails

# Bad — too technical

- **Passkey/WebAuthn support** — passwordless authentication with discoverable credentials

# Good — user-facing

- **Passkey support** — sign in with your fingerprint or face recognition, works across all your devices
```

---

## On completion

After applying approved changes, update the `**Last updated:** YYYY-MM-DD` line at the top of `features.md` to today's date.

---

## Common Mistakes

- Adding internal dev tools as user-facing features (translation engine, analytics pipeline, CI scripts)
- Using developer jargon in descriptions (JWT, SSE, HMAC, RFC numbers, GraphQL, WebSocket)
- **Making changes without user confirmation** — never update `features.md` before the plan is approved
- In full mode: scanning only recent commits instead of the entire codebase
- Treating `docs/feature-requests/` entries as implemented — always verify in code first
- **Guessing on ambiguous items** — always surface them in the clarification table
- **Falling back to the GitHub API** — always read locally from `../reboot`; halt if unavailable rather than degrading silently
- **Silently deleting catalog entries** — features removed from the codebase must move to **Deprecated** with a `_(Last seen)_` suffix, never disappear
- Not handling git failures — report gaps rather than proceeding with incomplete data
- Conflating a performance improvement or bug fix with a new feature — add to the clarification table when in doubt
- **Changing or omitting feature keys** — every feature must have a `category/feature-slug` key; existing keys must never be renamed (they are stable identifiers used elsewhere)
- Assigning duplicate keys — each key must be unique across the entire file

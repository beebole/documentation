---
name: illustrate
description: 'Identify screenshot needs on documentation pages and capture them via Playwright. Default: identify, present a plan, then capture once the user confirms the app is running. Use `--identify` to list needs only; `--capture` to run against a pre-built list; `--optimize` to recompress all images; `--arcade <url>` to generate an embed snippet. Replaces the /screenshot skill with the needs/capture split made explicit.'
disable-model-invocation: true
---

# Illustrate — Screenshot Identification, Capture, Optimize, Embed

Make sure every page has the screenshots it needs. Identify placeholders or explicit "needs screenshot" markers, capture via Playwright against a running Beebole app, optimize to WebP, place in `help/images/<section>/`. Also handles full-tree image optimization and Arcade demo embeds.

## Context

- `.claude/context/documentation-structure.md` — page structure template (for placeholder conventions)
- `.claude/context/mintlify-components.md` — `<Frame>` and image component usage

## Modes

- **Default:** `/illustrate <path>` — identify needs on the page, present a plan, capture once the user confirms the app is running, then place and optimize.
- **`--identify`:** `/illustrate --identify [<path>]` — list needs only; no capture. Outputs to chat. If no path, scan all `.mdx` under `help/`.
- **`--capture`:** `/illustrate --capture <needs-file>` — run Playwright against a list produced by `--identify` or by `/write`.
- **`--optimize`:** `/illustrate --optimize` — run `bash .claude/scripts/optimize-images.sh` against all images in `help/images/**`. Use when images were added manually or a batch needs recompressing.
- **`--arcade <url>`:** generate a Mintlify-friendly Arcade embed snippet for an Arcade share URL.

## Prerequisites

- **For captures:** the Beebole app must be running locally (`npm run dev` in `../reboot` → `localhost:5173`) or a staging URL must be provided.
- **For optimization:** `cwebp` installed (`brew install webp`).
- **For Arcade embeds:** the user provides an Arcade share URL.

## What counts as a "screenshot need"

Scan target pages for:

1. **Placeholder images** — markdown `![alt](/help/images/<section>/<file>.webp)` where `<file>` does not exist on disk.
2. **Explicit markers** — lines containing `[SCREENSHOT: description]` or `<!-- TODO: screenshot -->` or `![TBD: description]`.
3. **Missing illustrative content** — flag pages with `<Steps>` but no illustrative images if the page is in Documentation or Integrations tabs (heuristic; mark as optional need).

## Workflow — default

### 1. Identify needs

For the target page(s):
- Parse the `.mdx` for the three patterns above.
- For each need, extract: target file path (`/help/images/<section>/<file>.webp`), alt text, surrounding context (which section / step).

Present a plan and ask: _"Ready to capture? Make sure the app is running."_

### 2. Capture via Playwright MCP

For each identified need:

1. Navigate to the app screen — `mcp__playwright__browser_navigate`
2. Wait for the page to load — `mcp__playwright__browser_wait_for`
3. Resize the viewport (default `1440x900` for retina) — `mcp__playwright__browser_resize`
4. Snapshot to verify the right screen — `mcp__playwright__browser_snapshot`
5. Capture — `mcp__playwright__browser_take_screenshot`

**Standard views (auto):** navigate, capture, done.

**Complex views (guided):** navigate, snapshot, ask the user to set up the required state (specific data, open modals), then capture once confirmed.

### 3. Optimize and place

For each captured screenshot:

1. Save the raw capture to a temp location.
2. Convert to WebP:

   ```bash
   cwebp -q 80 <input> -o help/images/<section>/<name>.webp
   ```

3. Verify under 200 KB. If over, reduce quality:

   ```bash
   cwebp -q 60 <input> -o help/images/<section>/<name>.webp
   ```

4. Clean up the raw capture.

### 4. Update references

Update the `.mdx` with new image references:

```mdx
<Frame>![Descriptive alt text with keywords](/help/images/<section>/<file>.webp)</Frame>
```

### 5. Verify and report

- Verify the target file exists and is under 200 KB.
- Present captures to the user for approval. If any need re-capture (wrong state, cropping), repeat step 2 for those.

```
## Illustrate complete

**Pages scanned:** N
**Needs found:** X
**Captured:** Y
**Skipped (manual required):** Z
**Total image weight:** XXX KB

**Still needed:**
- `/help/images/billing/plan-upgrade.webp` — needs org admin UI
```

## Workflow — `--identify` only

Same as step 1, but output to chat (or to a file if specified):

```
## Screenshot needs

**Pages scanned:** N

### help/documentation/billing.mdx
- `/help/images/billing/plan-upgrade.webp` (alt: "Plan upgrade dialog")
- `[SCREENSHOT: invoice detail view]` (at line 142)

### help/documentation/timesheet/daily.mdx
- `/help/images/timesheets/daily-entry.webp` (alt: "Entering time for today")
```

## Workflow — `--capture` only

Read the needs file, run Playwright steps 2-4 above for each, optimize, report.

## Workflow — `--optimize`

Run the image optimization script across the full tree:

```bash
bash .claude/scripts/optimize-images.sh
```

Converts PNG/JPG to WebP at quality 80, renames with SEO context, updates `.mdx` references. If `cwebp` is missing: `brew install webp` and retry.

Report:

```
## Image Optimization Report

**Images processed:** X
**Converted to WebP:** X
**Already optimized:** X
**Total saved:** X MB (X%)
```

## Workflow — `--arcade <url>`

Generate a properly formatted Arcade embed for a Mintlify page.

1. Parse the Arcade URL to extract the share ID.
2. Ask the user for: a caption describing what the demo shows; which page to embed it in (or just output the snippet).
3. Generate:

   ```mdx
   <Frame caption="Description of what the demo shows">
     <iframe
       src="https://app.arcade.software/share/ARCADE_ID"
       title="Descriptive title for accessibility"
       loading="lazy"
       allowFullScreen
       style={{ width: '100%', aspectRatio: '16/9', border: 'none' }}
     />
   </Frame>
   ```

   The inline `style=` on this `<iframe>` is the deliberate exception to CLAUDE.md's "no inline styles" rule — Arcade embeds need aspect-ratio enforcement that no Mintlify component provides. Do not strip it; do not generalize the exception to other iframes.

4. If a page was specified, insert at the appropriate location. Otherwise print the snippet for manual placement.

## Image naming convention

- Kebab-case with feature context: `timesheet-weekly-view.webp`, `project-settings-panel.webp`.
- Organize by section: `help/images/timesheets/`, `help/images/billing/`, etc.
- Language-specific images: `help/images/fr/`, `help/images/es/`.

## Rules

- **Always optimize to WebP** before committing. `.png`/`.jpg` in `help/images/` is a defect.
- **Under 200 KB per image.** If a capture exceeds this, re-optimize at lower quality or re-capture at lower resolution.
- **Kebab-case filenames** with feature context: `plan-upgrade.webp`, not `screenshot-1.webp`.
- **Descriptive alt text.** Never "screenshot" or empty. Match the page's context.
- **Always ask before overwriting** existing screenshots.
- **Present captures for approval** before finalizing.
- **Use 1440x900 viewport** for standard captures (retina-ready).
- **Graceful degradation.** If Playwright isn't set up or the target UI state isn't reachable, report as skipped with specifics — don't silently omit.

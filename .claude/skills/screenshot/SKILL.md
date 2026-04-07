---
name: screenshot
description: 'Capture screenshots of the Beebole app using Playwright, optimize images, and embed Arcade demos. Use when asked to take screenshots, capture screens, add screenshots to docs, optimize images, compress images, convert to WebP, or embed an Arcade demo.'
disable-model-invocation: true
---

# Screenshot — Capture, Optimize & Embed

Hybrid screenshot automation: automated for standard views, guided for complex workflows. Also handles image optimization and Arcade demo embeds.

## Modes

- **`/screenshot <page-path>`** — Capture screenshots needed for a doc page
- **`/screenshot optimize`** — Run image optimization across all images
- **`/screenshot arcade <url>`** — Generate an Arcade embed snippet

If no arguments given, ask the user what they need.

## Prerequisites

- **For captures:** The Beebole app must be running locally (`npm run dev` in `../reboot` → `localhost:5173`) or a staging URL must be provided
- **For optimization:** `cwebp` must be installed (`brew install webp`)
- **For Arcade embeds:** The user provides an Arcade share URL

---

## Mode: `/screenshot <page-path>`

### Workflow

#### 1. Analyze the page

Read the `.mdx` file. Identify:

- Existing image references and their alt text
- Content sections that would benefit from screenshots (forms, settings panels, list views, workflows)
- Which app screens need to be captured

Present a plan:

```
## Screenshot plan for [page]

Screenshots to capture:
1. [Description] → help/images/[section]/[name].webp
2. [Description] → help/images/[section]/[name].webp

Screenshots already present:
- [existing images and their status]

Target URL: localhost:5173 (or staging URL if provided)
```

Ask: "Ready to capture? Make sure the app is running."

#### 2. Capture screenshots

Use the Playwright MCP tools to capture each screenshot:

1. Navigate to the app screen (`mcp__playwright__browser_navigate`)
2. Wait for the page to load (`mcp__playwright__browser_wait_for`)
3. Optionally resize the viewport (`mcp__playwright__browser_resize`) — default 1440x900 for retina captures
4. Take a snapshot to verify the right screen is shown (`mcp__playwright__browser_snapshot`)
5. Capture the screenshot (`mcp__playwright__browser_take_screenshot`)

**For standard views (auto):**

- Navigate directly to the URL, capture after load
- No user interaction needed

**For complex views (guided):**

- Navigate to the page, take a snapshot
- Ask the user to set up the required state (specific data, open modals, etc.)
- Once confirmed, capture the screenshot

#### 3. Optimize and place

For each captured screenshot:

1. Save the raw capture to a temporary location
2. Convert to WebP using `cwebp`:
    ```bash
    cwebp -q 80 <input> -o help/images/<section>/<name>.webp
    ```
3. Verify the output is under 200 KB. If over, reduce quality:
    ```bash
    cwebp -q 60 <input> -o help/images/<section>/<name>.webp
    ```
4. Clean up the raw capture

#### 4. Update references

Update the `.mdx` file with the new image references:

```mdx
<Frame>![Descriptive alt text with keywords](/help/images/section/feature-name.webp)</Frame>
```

#### 5. Present results

Show each captured screenshot to the user for approval. If any need re-capture (wrong state, cropping, etc.), go back to step 2 for those.

### Image naming convention

- Kebab-case with feature context: `timesheet-weekly-view.webp`, `project-settings-panel.webp`
- Organize by section: `help/images/timesheets/`, `help/images/billing/`, etc.
- Language-specific images go in `help/images/fr/`, `help/images/es/`

---

## Mode: `/screenshot optimize`

Run the image optimization script across all images:

```bash
bash .claude/scripts/optimize-images.sh
```

This converts PNG/JPG files to WebP at quality 80, renames with SEO context, and updates `.mdx` references.

If the script fails, check that `cwebp` is installed (`brew install webp`).

Print a summary:

```
## Image Optimization Report

**Images processed:** X
**Converted to WebP:** X
**Already optimized:** X
**Total saved:** X MB (X%)
```

---

## Mode: `/screenshot arcade <url>`

Generate a properly formatted Arcade embed for a Mintlify page.

### Workflow

1. Parse the Arcade URL to extract the share ID
2. Ask the user for:
    - A caption describing what the demo shows
    - Which page to embed it in (or just output the snippet)
3. Generate the embed snippet:

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

4. If a page was specified, insert the embed at the appropriate location
5. If not, print the snippet for the user to place manually

---

## Rules

- **Always ask before overwriting** existing screenshots
- **Present captures for approval** before finalizing
- **Name images descriptively** with feature context, not generic names
- **Keep images under 200 KB** — reduce quality if needed
- **Use 1440x900 viewport** for standard captures (retina-ready)
- **Organize by section** in `help/images/` subdirectories
- **Alt text is mandatory** — descriptive, with relevant keywords

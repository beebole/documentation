# Mintlify Components Reference

Use the correct components when writing or reviewing pages. For full details beyond this reference, use the Mintlify MCP server.

## Steps (sequential tasks)

```mdx
<Steps>
	<Step title="Step name">Instructions here.</Step>
</Steps>
```

Use for any procedure with 3+ steps. One action per step. Start each step with a verb.

## Callouts

| Component   | Use for                                                      |
| ----------- | ------------------------------------------------------------ |
| `<Info>`    | Helpful background context                                   |
| `<Tip>`     | Best practices, shortcuts, pro tips                          |
| `<Warning>` | Irreversible actions, data loss risks, common mistakes       |
| `<Note>`    | Secondary info, good to know but not critical                |
| `<Check>`   | Successful outcome or prerequisite met                       |
| `<Badge>`   | Role or plan limitations (e.g., `<Badge>Admin only</Badge>`) |

Place near the content they relate to. Max 2 callouts per section.

## Accordion (collapsible content)

```mdx
<AccordionGroup>
	<Accordion title="Question or heading">Content here.</Accordion>
</AccordionGroup>
```

Use for FAQs, secondary details, and advanced configurations.

## Tabs (parallel choices)

```mdx
<Tabs>
	<Tab title="Option A">Content A</Tab>
	<Tab title="Option B">Content B</Tab>
</Tabs>
```

Use when reader chooses between parallel paths (plans, roles, platforms).

## Cards (navigation hubs)

```mdx
<CardGroup cols={2}>
	<Card title="Page name" icon="icon-name" href="/help/path">
		Short description.
	</Card>
</CardGroup>
```

Use for overview pages linking to sub-topics.

## Frame (images and videos)

```mdx
<Frame>
	![Alt text](/images/screenshot.webp)
</Frame>
```

Add `caption="..."` when context isn't clear from surrounding prose; it appears below the image and helps SEO/accessibility. Alt text describes the image; caption explains its purpose.

**Partial screenshots keep their real size.** Mintlify stretches a markdown image to the column width, so a popover, menu, dialog or panel (captured at 2x like every docs screenshot) would appear larger than in the app. For those, and only those, use an `<img>` with its real width (half its pixel width, printed by `node .claude/skills/illustrate/runner/screenshots.mjs size <image>`):

```mdx
<Frame caption="Caption text">
	<img src="/help/images/timesheets/entry-details.webp" alt="Descriptive alt text" width="432" />
</Frame>
```

Use the plain `width` attribute, not a Tailwind class such as `w-[432px]`: arbitrary Tailwind values are not generated, checked in the local preview on 2026-09-29. The site's `img { max-width: 100% }` still lets the image shrink on phones. Full screens (and lens shots over a full screen) stay as markdown images: they are wider than the column and scale down on their own.

For video embeds:

```mdx
<Frame>
	<iframe src="https://www.youtube.com/embed/VIDEO_ID" title="Descriptive title" />
</Frame>
```

## Arcade embeds (interactive demos)

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

Replace `ARCADE_ID` with the ID from the Arcade share URL. Always include:

- A `caption` on `<Frame>` describing the demo
- A descriptive `title` on the `<iframe>` for accessibility
- `loading="lazy"` to avoid blocking page load
- The responsive `style` with `aspectRatio: '16/9'`

The inline `style` on the iframe is a documented exception to CLAUDE.md's no-inline-styles rule — Arcade requires it for responsive sizing.

## Snippets (reusable fragments)

```mdx
<Snippet file="snippet-name.mdx" />
```

Stored in `/snippets/`. Use for content that appears on multiple pages.

## Formatting rules

- **Bold** for UI elements (buttons, menus, field names)
- _Italic_ sparingly for emphasis or introducing terms
- `code` only in API section or technical field references
- Standard Markdown tables for comparisons (never `<div>` grids)

# Mintlify Components Reference

Use the correct components when writing or reviewing pages. For full details beyond this reference, use the Mintlify MCP server.

## Steps (sequential tasks)

```mdx
<Steps>
  <Step title="Step name">
    Instructions here.
  </Step>
</Steps>
```

Use for any procedure with 3+ steps. One action per step. Start each step with a verb.

## Callouts

| Component | Use for |
|-----------|---------|
| `<Info>` | Helpful background context |
| `<Tip>` | Best practices, shortcuts, pro tips |
| `<Warning>` | Irreversible actions, data loss risks, common mistakes |
| `<Note>` | Secondary info, good to know but not critical |
| `<Check>` | Successful outcome or prerequisite met |
| `<Badge>` | Role or plan limitations (e.g., `<Badge>Admin only</Badge>`) |

Place near the content they relate to. Max 2 callouts per section.

## Accordion (collapsible content)

```mdx
<AccordionGroup>
  <Accordion title="Question or heading">
    Content here.
  </Accordion>
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

For video embeds:
```mdx
<Frame>
  <iframe src="https://www.youtube.com/embed/VIDEO_ID" title="Descriptive title" />
</Frame>
```

## Snippets (reusable fragments)

```mdx
<Snippet file="snippet-name.mdx" />
```

Stored in `/snippets/`. Use for content that appears on multiple pages.

## Formatting rules

- **Bold** for UI elements (buttons, menus, field names)
- *Italic* sparingly for emphasis or introducing terms
- `code` only in API section or technical field references
- Standard Markdown tables for comparisons (never `<div>` grids)

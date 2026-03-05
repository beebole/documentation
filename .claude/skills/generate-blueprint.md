# Generate Blueprint

Generate a structured documentation blueprint (page skeleton) that contributors can follow to write a full documentation page.

## When to use

When the user asks to "generate a blueprint", "create a page skeleton", "scaffold a page", or provides a topic with metadata like feature description, target audience, and complexity.

## What this produces

A **blueprint** — not a finished page. A structured outline with section headers, per-section guidance, and Mintlify MDX component blocks with topic-relevant placeholder content. No filler text or preamble.

## Inputs

The user should provide (prompt for missing ones):

| Input | Example |
|-------|---------|
| **Page topic** | "Time off accruals" |
| **Feature description** (1-2 sentences) | "Lets admins configure automatic leave balance accumulation" |
| **Target audience** | "Admins and managers" |
| **Feature complexity** (simple/moderate/complex) | "Moderate" |
| **Category** | "Documentation > Time Off" |

## Blueprint structure

For each H2 section, output:

```
## [Section Title]
**Objective:** [What this section should accomplish]
**Writing guidance:** [Key points to cover, tone notes]
**Internal linking:** [Related pages to link from this section]
**Visual asset:** [What screenshot/video to capture and what it should show]

### Component implementation
[Actual Mintlify MDX block with topic-relevant placeholder content]
```

## Section flow

Follow the page structure from CLAUDE.md. Include sections based on complexity:

**Always include:** Introduction (definition-style opening), Core tasks (`<Steps>`/`<Step>`), FAQ (3-5 Q&A in `<AccordionGroup>`/`<Accordion>`)

**Include when relevant:** Configuration (moderate/complex), Advanced use cases (complex), Troubleshooting (when common issues exist), Related links

## Rules

- **Output only the blueprint.** No introductory text or concluding remarks.
- **Use topic-relevant placeholder content** — not generic "Lorem ipsum."
- **Follow all CLAUDE.md conventions** (voice, writing rules, frontmatter, SEO/GEO, components).
- **Don't invent features.** Mark uncertain content as `[VERIFY: ...]`.
- **Suggest internal links by topic name**, not actual paths.
- **Include frontmatter suggestions** at the top of the blueprint.
- **Suggest visual assets** — describe what screenshots/videos should capture, don't just say "add a screenshot here." Prefer screenshots for UI orientation, videos for complex multi-step workflows.

## Report

After generating the blueprint:

```
## Blueprint Generated

**Topic:** [Page topic]
**Category:** [Documentation > Section]
**Complexity:** [Simple / Moderate / Complex]

### Sections included
1. Introduction / Orientation
2. [Core task section name]
3. [Additional sections as applicable]
4. Frequently asked questions (X questions)

### Visual assets suggested
- X screenshots, X videos recommended

### Next steps
- Fill in each section following the writing guidance
- Capture the suggested screenshots/videos
- Run `/translate` to create FR/ES versions once English is finalized
```

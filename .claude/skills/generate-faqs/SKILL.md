---
name: generate-faqs
description: Detect documentation pages missing FAQ sections and generate them with 3-5 Q&A pairs per page
disable-model-invocation: true
---

# Generate FAQs

Detect documentation pages missing FAQ sections and generate them.

## When to use

When the user asks to "generate FAQs", "add FAQs", "check for missing FAQs", or similar.

## Workflow

1. Run the detection script:
   ```bash
   bash scripts/generate-faq.sh
   ```

2. Parse the JSON output. For each file in the `missing_faq` array:
   - Read the full English page
   - Generate 3-5 relevant Q&A pairs based on the page content
   - Append the FAQ section at the bottom of the page (before any existing "Related links" section)

3. After updating English pages, also update the corresponding FR and ES translations if they exist and have content.

4. Print a summary table listing each file updated.

## FAQ format

Use `<AccordionGroup>` with `<Accordion>` items. Follow the FAQ conventions in CLAUDE.md (3-5 Q&A pairs, self-contained answers mentioning "Beebole" by name, natural-language questions).

```mdx
## Frequently asked questions

<AccordionGroup>
  <Accordion title="Can I do X with this feature?">
    Yes. Navigate to **Settings** and enable the **X** option. This applies to all users in your Beebole account.
  </Accordion>
</AccordionGroup>
```

## Writing FAQ questions

- **Write questions as real users would ask them.** "Can I...", "How do I...", "What happens when...", "Is there a limit to...", "Who can..."
- **Each answer should be self-contained.** A reader (or an LLM) should understand the answer without reading the rest of the page.
- **Keep answers concise.** 1-3 sentences. Link to other pages for details rather than repeating full instructions.
- **Cover these angles when relevant:** permissions, limits/restrictions, edge cases (deletion, archiving), common confusion points, integration with other Beebole features.

## Rules

- **Do not invent features.** Every answer must reflect actual Beebole behavior.
- **Do not duplicate step-by-step instructions.** The FAQ answers questions *about* the feature; the page body explains *how to use* it.
- **Use the same UI labels and bold formatting** as the rest of the page.
- **Translate FAQs** into FR and ES with natural, idiomatic questions — not literal translations.

## Report

After all FAQs are generated, print a summary:

```
## FAQ Generation Report

**Pages scanned:** X
**Pages missing FAQs:** X
**FAQs generated:** X pages (EN) + X pages (FR) + X pages (ES)
**Pages already with FAQs (skipped):** X

### Details
| Page | EN | FR | ES | Questions added |
|------|----|----|----|-----------------|
| help/documentation/timesheets.mdx | Added | Added | Added | 5 |
```

If all pages already have FAQ sections, state: "All content pages already have FAQ sections. Nothing to generate."

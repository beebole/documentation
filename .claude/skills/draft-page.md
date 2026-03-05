# Draft Page from Dictation

Transform a raw voice dictation transcript into a complete, publish-ready Beebole documentation page.

## When to use

When the user asks to "draft a page", "create a page from dictation", "write a page from transcript", or pastes a raw transcript and wants it turned into a structured documentation page.

## Workflow

### 1. Collect inputs

The user provides a **raw dictation transcript** — unstructured, conversational text captured via a tool like Wispr Flow.

Before writing the page, **ask these clarifying questions** (skip any already answered):

| Question | Why |
|----------|-----|
| **Target file path** (e.g., `help/documentation/assignments.mdx`) | Determines section, slug, and nav placement |
| **New page or rewrite of an existing page?** | If rewriting, read the existing page first |
| **Target audience** (e.g., admins, all users, managers) | Affects tone and which roles to highlight |
| **Specific screenshots or videos to include?** | So placeholders can be added in the right spots |
| **Anything the transcript misses?** | The user may have forgotten to dictate a section |

Do NOT ask about page structure, formatting, or components — apply CLAUDE.md conventions automatically.

### 2. Fetch UI labels

Fetch English i18n labels to ensure correct UI terminology:
```bash
gh api repos/beebole/reboot/contents/shared/i18n/languages/en.json --jq '.content' | base64 -d
```

### 3. Clean the transcript

- Remove filler words, false starts, and repeated phrases
- Fix spoken punctuation into actual punctuation
- Identify core topics, features, and user actions
- Note ambiguities or gaps

### 4. Write the page

Produce a complete `.mdx` file following **all conventions from CLAUDE.md**: page structure, frontmatter requirements, writing rules, SEO/GEO best practices, callout usage, and FAQ section.

Additional rules specific to this skill:
- **Do not invent features.** Only document what the transcript describes. Mark unclear content with `[VERIFY: description]` inline.
- **Preserve the user's intent.** Restructure and rewrite, but don't change the meaning or add features not mentioned.
- **Use exact UI labels** from the i18n file, not the user's approximate wording.
- **Mark screenshot locations** with descriptive placeholder alt text: `![Descriptive alt text](/help/images/feature-context.webp)`

### 5. Update the navigation

After writing the page, add it to `docs.json` navigation in the correct position. Place it in the appropriate tab and group, mirroring where similar pages appear in the English navigation structure.

### 6. Output

Write the complete `.mdx` file to the target path, then print a summary:

```
## Page drafted

**File:** [target path]
**Title:** [page title]
**Sections:** [list of H2 sections created]
**FAQ questions:** [count]
**Screenshot placeholders:** [count]
**Nav status:** [Already in docs.json / Added under "Group > Tab"]

### What to review
- [ ] Verify all UI labels match the app
- [ ] Capture and add screenshots where placeholders are marked
- [ ] Check for any [VERIFY: ...] markers where content was unclear
- [ ] Run `/translate` to create FR/ES versions when satisfied
```

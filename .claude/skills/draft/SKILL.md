---
name: draft
description: 'Turn raw input (dictation, notes, feature description) into a complete Beebole documentation page through an interactive, collaborative process with checkpoints. Use this skill whenever the user wants to write a page, create documentation, draft a page from notes or dictation, build a new doc page, or turn raw content into structured documentation.'
---

# Draft Page — Interactive Documentation Builder

Collaboratively build a complete Beebole documentation page through an interactive conversation. The user provides raw input (dictation transcript, notes, or a feature description), and we refine the page together step by step.

## Context

Before starting, read these context files for editorial and structural guidelines:

- `.claude/context/brand.md` — voice, tone, and writing rules
- `.claude/context/audiences.md` — who the page is for (adjust language and depth)
- `.claude/context/documentation-structure.md` — page structure template and section ordering
- `.claude/context/mintlify-components.md` — which components to use and when
- `.claude/context/seo-geo.md` — SEO frontmatter and GEO writing patterns
- `.claude/context/product.md` — Beebole product overview and key concepts

## Core principle

**This is an interactive, collaborative process.** Never write the full page in one shot. Work with the user through checkpoints — propose, get feedback, refine. The user knows the product; Claude knows the writing conventions. Together they produce the best result.

**English only.** This skill drafts pages in English (`help/`) only. Never produce French or Spanish versions during the drafting process. Translations are handled separately via the `/translate` skill after the English page is finalized.

## Workflow

**Prerequisites:** The `gh` CLI must be installed and authenticated (`gh auth status`). If `gh` is unavailable, skip the source code exploration in step 2 and note in the outline that code verification was not performed.

### 1. Collect inputs

The user provides raw input — a dictation transcript, bullet points, notes, or even just a feature name.

**Ask these clarifying questions** (skip any already answered):

| Question                                                          | Why                                                |
| ----------------------------------------------------------------- | -------------------------------------------------- |
| **Target file path** (e.g., `help/documentation/assignments.mdx`) | Determines section, slug, and nav placement        |
| **New page or rewrite of an existing page?**                      | If rewriting, read the existing page first         |
| **Target audience** (e.g., admins, all users, managers)           | Affects tone and which roles to highlight          |
| **Specific screenshots or videos to include?**                    | So placeholders can be added in the right spots    |
| **Anything the input misses?**                                    | The user may have forgotten a section or edge case |

Do NOT ask about page structure, formatting, or components — apply CLAUDE.md conventions automatically.

### 2. Research phase (parallel)

Fetch UI labels and explore the source code in parallel:

**Fetch i18n labels** from the sibling repo (see CLAUDE.md "App repository access"):

```
Read ../reboot/shared/i18n/en/labels.json
```

**Explore the feature in source code** using the sibling repo directly:

- Read relevant components in `../reboot/frontend/src/components/`
- Read backend entities in `../reboot/backend/src/application/entities/`
- Read type definitions in `../reboot/frontend/src/models/types.ts`
- Check design docs in `../reboot/docs/`
- Check available settings, options, and configurable behavior
- Verify permissions and role-based access control
- Note default values, validation rules, and limits
- Discover related sub-features or edge cases the input may have missed

**Fallback:** If `../reboot` is not available, use `gh api repos/beebole/reboot/contents/{path} --jq '.content' | base64 -d`

### 3. Clean and analyze the input

- Remove filler words, false starts, and repeated phrases (if dictation)
- Identify core topics, features, and user actions
- Note ambiguities, gaps, or contradictions
- Cross-reference with code findings — note anything found in code but missing from the input

### CHECKPOINT 1 — Proposed outline

Present the user with:

1. **Page outline** — The proposed `##` sections in order, with a one-line description of what each covers
2. **Code findings** — Key discoveries from the source code: undocumented settings, permissions, defaults, or edge cases not mentioned in the input
3. **Open questions** — Ambiguities or gaps that need the user's input before writing

Ask: _"Does this outline capture everything? Should I add, remove, or reorder any sections? Any of the code findings you want included or excluded?"_

**Wait for the user's response before continuing.**

### 4. Write the first draft

After the user approves the outline, write the full `.mdx` page following **all conventions from CLAUDE.md**: page structure, frontmatter, writing rules, SEO/GEO best practices, callouts, and FAQ section.

Rules for the draft:

- **Do not invent features.** Only document what the input describes plus code findings the user approved.
- **Preserve the user's intent.** Restructure and rewrite, but don't change the meaning.
- **Use exact UI labels** from the i18n file, not the user's approximate wording.
- **Mark screenshot locations** with descriptive placeholder alt text: `![Descriptive alt text](/help/images/feature-context.webp)`
- **Mark uncertain content** with `[VERIFY: description]` inline.

### CHECKPOINT 2 — Draft review

After writing the page, present a summary:

```
## Draft ready for review

**Title:** [page title]
**Sections:** [list of H2 sections]
**FAQ questions:** [count]
**Screenshot placeholders:** [count]
**[VERIFY] markers:** [count, with brief descriptions]
```

Ask: _"Please review the draft. What would you like me to change? I can rework specific sections, adjust the tone, add or remove content, or refine the FAQs."_

**Wait for the user's response before continuing.**

### 5. Iterate

Apply the user's feedback. This may go through multiple rounds — keep refining until the user is satisfied. For each round:

- Make the requested changes
- Briefly summarize what changed
- Ask if there's anything else to adjust

### 6. Finalize

Once the user confirms the page is good:

1. **Write the file** to the target path
2. **Update `docs.json` navigation** — add the page in the correct position, mirroring where similar pages appear
3. **Print the final summary:**

```
## Page published

**File:** [target path]
**Title:** [page title]
**Sections:** [list of H2 sections]
**FAQ questions:** [count]
**Screenshot placeholders:** [count]
**Nav status:** [Already in docs.json / Added under "Group > Tab"]

### Next steps
- [ ] Capture and add screenshots where placeholders are marked
- [ ] Resolve any remaining [VERIFY: ...] markers
- [ ] Run `/review` for a full pre-publish audit
- [ ] Run `/translate` to create FR/ES versions
```

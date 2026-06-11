# Legacy Documentation Tab — Design

**Date:** 2026-06-11
**Status:** Approved (design), pending implementation plan

## Goal

Archive the previous Beebole system's help documentation — currently living in
Storyblok and consumed by the commercial website — as a frozen, self-contained
**Legacy** tab inside this Mintlify documentation repository. English only.

The new tab is also the signal that legacy documentation exists: its landing
page carries a prominent "archived / no longer maintained" callout.

## Source of truth

- **CMS:** Storyblok, "Website" space, ID `118349`, region `eu-central-1`.
- **API:** Management API (`https://mapi.storyblok.com/v1/spaces/118349/...`).
  The provided token is a Personal Access Token (`sb_pat_...`), which works
  against the Management API, **not** the CDN content API.
- **Auth:** token is read from the `SB_TOKEN` environment variable at runtime.
  It is **never** written to disk, committed, or echoed into logs/files.
- **Rate limit:** the space throttles (HTTP 429) around ~20 rapid requests.
  The fetch must space requests out (sleep between calls) and retry on 429.

### Stories in scope

16 English `template_article` stories under `en/help/*` (slug → title):

| Slug                       | Title                                      |
| -------------------------- | ------------------------------------------ |
| `docs`                     | Help documentation (→ legacy landing page) |
| `learn-the-basics`         | Getting Started                            |
| `entities`                 | Entities and How to Use Them               |
| `organizing-people`        | Organizing People and Teams                |
| `onboard-your-team`        | Onboarding Your Team                       |
| `timesheets`               | Project Tracking (Timesheets)              |
| `time-clock`               | Time Clock                                 |
| `time-off`                 | Tracking and Approving Time Off Requests   |
| `work-schedules`           | Work Schedules                             |
| `reporting`                | Reporting                                  |
| `costs-billing-budgets`    | Costs, Billing and Budgets                 |
| `settings`                 | Settings                                   |
| `integrations`             | Integrations                               |
| `mobile-app`               | Mobile Application                         |
| `api`                      | API Documentation                          |
| `faq`                      | Frequently Asked Questions                 |

**Excluded** (empty or system pages): `en/help/` (folder index, `template_page`,
0 chars), `en/help/search` (`template_page`, search UI, 0 chars), `en/help/release`
(Release notes, 0 chars).

### Story content shape

- Component: `template_article`.
- `content.title` — page title.
- `content.seo_description` — used for frontmatter `description`.
- `content.body` — list of `section_markdown_content` bloks; each has an optional
  `heading` (string) and a `content` field that is **Storyblok richtext**
  (`{type: "doc", content: [...]}`, ProseMirror-style), not a markdown string.
- Navigation chrome (`sidebar_accordion`, `related_articles`, etc.) is used only
  to derive tab ordering — not rendered into page bodies (Mintlify owns nav).

## Output layout

```
help/legacy/
  index.mdx                 # from `docs` story + archived-notice callout
  learn-the-basics.mdx
  entities.mdx
  ...                       # one .mdx per in-scope article, original slug kept
help/images/legacy/<slug>/  # downloaded Storyblok assets, per page
```

- Slugs are preserved verbatim. `help/legacy/api` does not collide with the new
  API tab (which lives under `help/api/*`).
- Pages live at `/help/legacy/*`, already covered by the existing reverse-proxy
  `/help/*` forward — **no `next.config.ts` change required**.

## Conversion (core work)

A single throttled one-off script (Python) that:

1. **Fetches** each in-scope story by ID via the Management API, sleeping between
   requests and retrying on 429.
2. **Converts richtext → Markdown/MDX**, handling at minimum:
   - `paragraph`, `heading` (levels 1–6 → `#`..`######`)
   - text marks: `bold`, `italic`, `code`, `strike`, `link`
   - `bullet_list` / `ordered_list` / `list_item` (nested)
   - `blockquote`, `code_block` (with language if present)
   - `image` (→ download + local path), `hard_break`, `horizontal_rule`
   - `table` (→ markdown table) if present
   - Unknown node types: emit text content and log a warning (no silent loss).
3. **Faithful archive** — verbatim content. No rewriting, no terminology updates,
   **no FAQ injection** (legacy archive is exempt from the FAQ rule, like API pages).
4. **Images** — download every Storyblok asset (`a.storyblok.com/...`) into
   `help/images/legacy/<slug>/`, rewrite the reference to the local path. Keep
   original format (optimization to WebP is optional, can run `/illustrate
   --optimize` later).
5. **Internal links** — rewrite absolute `https://beebole.com/help/<x>` (and
   `/help/<x>`) links to `/help/legacy/<x>`, preserving `#anchors` best-effort.
   External links untouched.
6. **Frontmatter** — `title` from `content.title`; `description` from
   `content.seo_description` (fallback: first paragraph, trimmed).
7. **Writes** `help/legacy/<slug>.mdx`.

### MDX safety

- Convert raw HTML / banned patterns to Mintlify-compliant markdown where they
  appear (no `<img>`, `<br/>`, inline styles — per project rules).
- Escape stray `<`, `{`, `}` that would break MDX parsing.

## Navigation (docs.json)

- Add **one** `{ "tab": "Legacy", "groups": [...] }` block to the **English**
  language entry only (`navigation.languages[0]`). FR/ES untouched.
- Group order/structure reproduces the legacy `sidebar_accordion` order where it
  can be derived; otherwise a single `"Legacy documentation"` group listing pages
  in the table order above, `help/legacy/index` first.

## Landing page & "it exists" signal

`help/legacy/index.mdx`:

- Built from the `docs` ("Help documentation") article body.
- Opens with a callout (e.g. `<Note>` or `<Warning>`):
  > **Archived documentation.** This section documents Beebole's previous system
  > and is no longer maintained. For current documentation, see **Documentation**.

## Out of scope

- French / Spanish legacy docs — the `fr/help` and `es/help` Storyblok folders are
  empty (FR/ES help was already deleted).
- Cross-links from every current doc back to legacy ("eventually" per the user).
- Re-authoring, SEO/GEO passes, or FAQ sections on legacy pages.

## Verification

- All 16 pages present under `help/legacy/`, each valid MDX (`mintlify dev` /
  build parses without error).
- Every image reference resolves to a downloaded local file.
- No `beebole.com/help/` internal links remain (all repointed to `/help/legacy/`).
- The `SB_TOKEN` value appears in no committed file.
- The Legacy tab renders in the English navigation only.

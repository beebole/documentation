---
name: mine-signals
description: 'Mine reader signals outside the docs assistant (Intercom support conversations, Mintlify searches nobody clicked, page feedback, 404s on /help/*) and write a fixes-first report in `.todo/docs-signals.md` for human review. Report-only: proposals are never applied or fed to `/write`. Runs as a step of /release, or standalone when asked to mine support questions, searches, feedback or 404s. Run only when explicitly invoked by the user or as a step of /release — do not auto-trigger from conversation.'
---

# Mine Signals — Fixes from Support, Search, Feedback and 404s

`/mine-conversations` mines what readers ask the docs assistant. This skill mines the other places readers show they could not find an answer: questions sent to support, searches with no click, thumbs-down, and pages that do not exist. It writes a report that leads with **proposed fixes**, each backed by its evidence, for a human to approve.

**Report-only, by decision (Yves, 2026-10-04).** For its first runs this skill proposes and never applies: no edit to `help/**` or `docs.json`, no entry in `.todo/gaps.md`, no `/write`. Whether some fix kinds (a redirect for a 404, say) may later be applied unattended is Yves's call once he has seen a few reports; until he says so, the report is the whole output.

## Data sources

Credentials come from `~/.config/beebole/.env`. **The file is not cleanly `source`-able**: extract each value with `grep -m1 '^KEY=' ~/.config/beebole/.env | cut -d= -f2-` inside a `bash` heredoc. Never print a secret.

Each source is independent: if one is unreachable, skip it, say why in the report, and continue.

### 1. Intercom support conversations

- **API:** `https://api.eu.intercom.io` (EU workspace), headers `Authorization: Bearer $INTERCOM_PROD_TOKEN`, `Intercom-Version: 2.11`, `Accept: application/json`. (`INTERCOM_PROD` is the workspace id, not a token.)
- **List:** `POST /conversations/search` with
  `{"query":{"operator":"AND","value":[{"field":"updated_at","operator":">","value":<cursor unix ts>},{"field":"source.delivered_as","operator":"=","value":"customer_initiated"}]},"pagination":{"per_page":150}}`.
  Cursor pagination: pass `pages.next.starting_after` back as `pagination.starting_after` until `pages.next` is absent.
- **Thread:** `GET /conversations/{id}?display_as=plaintext`. The opening message is `source.body`; the rest are `conversation_parts.conversation_parts[]` — keep `part_type = comment` (customer: author type `user`/`lead`; support: `admin`), drop bot system parts and internal `note` parts.
- **Drop as noise:** `custom_attributes["Created by app package code"]` in `vercel-sales-form`, `tools-configuration-prod` (sales form, n8n); authors with an `@beebole.com` email; form relays whose author is a `mintlify.com` address; spam and vendor pitches; billing, invoice and purchase-order mail.
- **Useful fields:** `custom_attributes.Language` (language demand), `custom_attributes["AI Title"]` (short subject, on about a third), `source.url` (the app or docs page the messenger was opened from).
- Intercom has no docs tag: whether a conversation is a documentation question comes from reading it. Read every remaining transcript (about 40 a week).
- **Extra signal:** a support reply that links a `beebole.com/help/...` page means the answer existed and the customer did not find it, so it is evidence for a findability fix on that page, not a content gap.

### 2. Mintlify searches with no click

- `GET https://api.mintlify.com/v1/analytics/{MINTLIFY_PROJECT_ID_PROD}/searches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&limit=100&cursor=…`, header `Authorization: Bearer $MINTLIFY_ADMIN_PROD`; follow `nextCursor` until null. Use `curl`, or set a `User-Agent` explicitly: Python's default one gets HTTP 403.
- Rows: `{searchQuery, hits, ctr (0-100), topClickedPage, lastSearchedAt}`. The API has no result count: `ctr == 0` is the "found nothing useful" signal. Some zero-click rows went to the AI assistant from the search bar.
- **Clean first:** rows include typing prefixes ("abse", "absen"). Fold each prefix into the longest query that starts with it, sum their hits, and drop terms under 3 characters.
- Rate limit: 100 requests per hour per organization, shared with every Mintlify analytics endpoint, `/assistant` included. One run needs a handful.

### 3. Page feedback

- **Mintlify:** `GET https://api.mintlify.com/v1/analytics/{MINTLIFY_PROJECT_ID_PROD}/feedback?dateFrom&dateTo&limit&cursor` (rows `{path, comment, helpful, source, createdAt}`) and `/feedback/by-page?dateFrom&dateTo` (`{path, thumbsUp, thumbsDown}`). On 2026-10-04 both returned nothing at all although the widget is live: feedback collection is probably off in the Mintlify dashboard. While they stay empty, say so in the report and use the fallback.
- **Fallback, PostHog autocapture** (no comment text, votes only), on PostHog PROD (`POSTHOG_PROD_HOST`, `POSTHOG_PROD_PROJECT_ID`, `POSTHOG_PROD_PERSONAL_API_KEY`; `POST {HOST}/api/projects/{ID}/query/` with `{"query":{"kind":"HogQLQuery","query":"…"}}`):

```sql
SELECT properties.$pathname AS path,
       extract(elements_chain, 'attr_id="(feedback-[a-z-]+)"') AS action,
       count() AS clicks
FROM events
WHERE event = '$autocapture' AND properties.$pathname LIKE '/help%'
  AND properties.$host = 'beebole.com'
  AND elements_chain ILIKE '%feedback-%'
  AND timestamp > toDateTime('<cursor>')
GROUP BY path, action
ORDER BY clicks DESC
```

A thumbs-down with no comment points at a page, not a fix: read the page and say what is most likely missing, or report it as "no fix proposed" when nothing stands out.

### 4. 404s on /help/*

On PostHog PROD, a Mintlify 404 is a `$pageview` whose custom `properties.title` is `Page Not Found` (`$title` is always null here). The previous page in the same session shows where the broken link lives, since the referrer is almost always direct:

```sql
SELECT path, count() AS views, uniq(pid) AS visitors, max(ts) AS last_seen,
       groupUniqArray(5)(prev_url) AS previous_pages, groupUniqArray(5)(ref) AS referrers
FROM (
  SELECT timestamp AS ts, person_id AS pid, properties.$pathname AS path, properties.title AS t,
         properties.$referrer AS ref,
         lagInFrame(properties.$current_url) OVER (PARTITION BY $session_id ORDER BY timestamp
           ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS prev_url
  FROM events
  WHERE event = '$pageview' AND timestamp > toDateTime('<cursor>')
    AND $session_id IN (SELECT $session_id FROM events
          WHERE event = '$pageview' AND properties.title = 'Page Not Found'
            AND properties.$pathname LIKE '/help%' AND properties.$host = 'beebole.com'
            AND timestamp > toDateTime('<cursor>'))
)
WHERE t = 'Page Not Found' AND path LIKE '/help%'
GROUP BY path ORDER BY views DESC LIMIT 100
```

Ignore `.md` paths (raw markdown requests, not 404s). For each path, the fix is one of: a redirect in `docs.json` to the page that answers it (old in-app help links, old URLs still in search engines), a corrected link at the source (a docs page, the app, the website: say which file when `previous_pages` points there, and check with `node .claude/scripts/site-lint.mjs`, whose inbound-link check covers the app and website), or nothing (a typo, a single guessing visitor: list it under "No action").

## Workflow

### 1. Preflight

- Read the `Mined through:` line in `.todo/docs-signals.md`; if the file or line is missing, default to 30 days back.
- `../reboot` must be reachable to verify product behavior; if not, use `gh api repos/beebole/reboot/...` and report what was skipped.

### 2. Pull each source since the cursor

As above. Keep counts per source for the report header.

### 3. Verify before proposing

**A signal is evidence of demand, not proof of a gap.** For each candidate:

1. Grep `help/**`: is the answer missing, or present but not found?
2. Check `../reboot` (on `prod`) when the answer depends on what the product does.
3. Check `.todo/ai-conversation-gaps.md` and `.todo/gaps.md`: if the same gap is already there, cite it instead of repeating it.
4. Check this report's own earlier runs (see "Tracking entries" below) before writing a new entry:
   - **Open** (pending or approved, not yet done): do not add a new entry; append `seen again YYYY-MM-DD (+N <source>)` to the existing one, and raise its priority when the count now meets the HIGH bar.
   - **Done**: if the signal still shows up after the done date (a 404 still hit after its redirect shipped, the same question still asked), append `still seen after the fix: YYYY-MM-DD (+N)` to the done entry and add a new entry under this run that names the old one and proposes a better fix.
   - **Declined**: append `seen again` only; propose it again only if the evidence has clearly grown, and say why.
5. Read the page as it is now, including its FAQ and keywords: an answer that exists but is not found is a findability fix (title, keywords, cross-link), never new content.

Then classify:

| Kind | Meaning | Fix to propose |
|------|---------|----------------|
| **Missing content** | The docs do not answer it | Section or page to add, with the page path and an outline |
| **Not found** | The docs answer it; readers did not get there | Keywords or description, a FAQ entry, a cross-link, a clearer heading |
| **Broken URL** | A 404 | Redirect (source → destination) or the link to correct, and where |
| **Not a doc fix** | Product bug, feature request, billing, language demand | None here; count it, one line each |

### 4. Write the report

Update `.todo/docs-signals.md`:

- Header: `Mined through: <now, ISO UTC>` and a `Mode: report-only (trial since 2026-10-04)` line.
- Append a section `## Run YYYY-MM-DD`, newest at the top of the run sections, with:

```markdown
### Proposed fixes (pending review)

- [ ] HIGH | `<path or docs.json>` | <the fix, concrete enough to apply as written> — evidence: <source>: <N> (<dates>), <short paraphrase>

### No action

- <signal> — <why: typo, one visitor, not a doc fix (product / billing / language)>

### Sources

- Intercom: <N> conversations read, <M> about documentation | skipped: <reason>
- Searches: <N> terms with no click after folding | skipped: <reason>
- Feedback: <N> votes (<source used>) | empty: <reason>
- 404s: <N> paths, <M> views | skipped: <reason>
```

- Priority: HIGH when several readers hit it or a page states something wrong, MEDIUM for a single clear case, LOW for a nice-to-have.
- **Only add notes to entries from previous runs**, never rewrite or delete them: they are the review record. The notes are the ones listed in "Tracking entries".
- **Privacy:** paraphrase; never copy names, emails, company names, phone numbers, tokens or attachments from a support conversation or search into the report.

### Tracking entries

Each entry carries its state in its checkbox and in notes appended at the end of its line, so the next run knows what was already handled:

| State | How it reads | Written by |
|-------|--------------|------------|
| Pending | `- [ ] …` | this skill |
| Approved | `- [x] …` | Yves, by ticking it |
| Done | `- [x] … Done YYYY-MM-DD (PR #N).` | whoever applies the fix, in the same PR as the fix |
| Declined | `- [ ] … Declined YYYY-MM-DD: <reason>.` | Yves, or whoever he asks to record it |
| Seen again | `… seen again YYYY-MM-DD (+N <source>).` | this skill, step 3 |
| Fix not working | `… still seen after the fix: YYYY-MM-DD (+N).` | this skill, step 3 |

A fix applied with a different wording than proposed says so in its Done note (`Done YYYY-MM-DD (PR #N): <what was done instead>`), so the next run checks the right thing.

### 5. Hand off

Print the number of proposed fixes per kind and end with:

```
Review .todo/docs-signals.md and tick the fixes to keep.
Nothing was applied: approved fixes are made by hand or with /write <path>.
```

In a `/release` run the report is committed on the release branch and the PR lists the proposed fixes as pending review.

## Rules

- **Report-only.** Never edits `help/**` or `docs.json`, never triggers `/write`, never writes to `.todo/gaps.md`, until Yves changes the mode in this file.
- **Fixes first.** Every entry states the fix; evidence follows it. A signal with no fix goes under "No action" with the reason.
- **Track, don't repeat.** A signal already in the report gets a note on its entry, not a new entry; a fix marked Done is checked against the new signals.
- **Verify everything** against the docs and the code before proposing.
- **Don't duplicate `/mine-conversations`.** Docs-assistant chats are its input, not this skill's.
- **Never block a release.** A source that fails is skipped and named in the report.

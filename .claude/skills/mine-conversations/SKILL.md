---
name: mine-conversations
description: 'Analyze the docs-assistant AI conversations stored in PostHog and produce a gap-candidates report in `.todo/ai-conversation-gaps.md` for human review. Report-only: candidates are proposals and are never fed to `/write` automatically. Runs as the last step of `/release`, or standalone when asked to mine AI conversations, analyze assistant chats, or find gaps from real user questions. Run only when explicitly invoked by the user or as a step of /release — do not auto-trigger from conversation.'
---

# Mine Conversations — Gap Candidates from AI Assistant Chats

Mine the questions real users ask the docs assistant, verify each candidate gap against the docs and the app code, and emit a **proposal report for human review**. This is the demand-driven counterpart to `/find-gaps` (which is catalog-driven): it finds what users *struggle with*, not what the product *contains*.

**The human review gate is structural:** this skill writes `.todo/ai-conversation-gaps.md`, which `/write` never reads. Nothing gets drafted from this report until a human approves entries and runs `/write <path>` explicitly.

## Data source

Mintlify docs-assistant conversations are pushed to **PostHog prod (EU, project 39108)** by the n8n workflow "PROD - Mintlify Assistant LLM Analytics" (every 6 h). Each thread is one **`docs_assistant_conversation`** event:

- `properties.conversation` — full role-tagged transcript: `[{role: "user"|"assistant", content}, …]`
- `properties.trace_id`, `message_count`, `captured_at`, `mintlify_resolution_status`, `mintlify_page_url`, `mintlify_query_category`, `match_confidence`
- Events are immutable: a thread that grows **re-emits a fuller copy** — always take the latest per `trace_id` (`argMax` on `captured_at`).
- Event `timestamp` is the conversation start (backdated), not the capture time.

Do **not** mine `$ai_generation` / `posthog.ai_events` — the heavy content there expires after 30 days; `docs_assistant_conversation` is the permanent copy.

## Workflow

### 1. Preflight

- Credentials come from `~/.config/beebole/.env` (`POSTHOG_PROD_HOST`, `POSTHOG_PROD_PROJECT_ID`, `POSTHOG_PROD_PERSONAL_API_KEY`). **The file is not cleanly `source`-able** — extract values with `grep -m1 '^KEY=' | cut -d= -f2-` inside a `bash` heredoc (zsh lacks `${!var}`).
- Read the `Mined through:` line in `.todo/ai-conversation-gaps.md` for the cursor. If the file or line is missing, default to 30 days back.
- `../reboot` must be reachable for code verification; if not, fall back to `gh api repos/beebole/reboot/...`, and report any check you had to skip.

### 2. Pull conversations

POST to `{HOST}/api/projects/{PROJECT_ID}/query/` with a `HogQLQuery`. Canonical query — one row per thread, latest transcript wins, includes threads that *grew* since the cursor:

```sql
SELECT properties.trace_id AS trace_id,
       min(timestamp) AS started,
       argMax(toString(properties.message_count), toString(properties.captured_at)) AS message_count,
       argMax(toString(properties.conversation), toString(properties.captured_at)) AS conversation,
       argMax(toString(properties.mintlify_resolution_status), toString(properties.captured_at)) AS resolution,
       any(toString(properties.mintlify_page_url)) AS page_url,
       any(toString(properties.match_confidence)) AS confidence
FROM events
WHERE event = 'docs_assistant_conversation'
GROUP BY trace_id
HAVING max(toString(properties.captured_at)) > '<cursor ISO timestamp>'
ORDER BY started
```

`conversation` parses as JSON. If a transcript looks truncated or missing, re-fetch that thread from the Mintlify analytics API (`MINTLIFY_ADMIN_PROD` key, `https://api.mintlify.com/v1/analytics/<MINTLIFY_PROJECT_ID_PROD>/assistant?dateFrom=…&dateTo=…`).

### 3. Analyze

Read every transcript. Flag as **high-signal**:

- `message_count` > 3 (the user had to fight for an answer)
- Sessions ending unresolved (user gives up, assistant's last message is a non-answer)
- The same theme across several traces
- The assistant describing UI the user says they don't have (Legacy-vs-new-platform confusion)
- Questions arriving in FR/ES (language-demand signal, not a page fix)

### 4. Verify before classifying

**Never call something a gap from the conversation alone.** For each candidate:

1. Grep `help/**` — is it actually undocumented, or documented but not found?
2. Check `../reboot` code when the answer depends on product behavior (does the feature/filter/setting exist?).

Classify into three buckets:

| Bucket | Meaning | Typical fix |
|--------|---------|-------------|
| **Real gap** | Content genuinely missing or insufficient | New section/page via `/write` |
| **Covered but failed** | Docs answer it; user/assistant couldn't find or apply it | FAQ entry, keywords, callout, cross-link |
| **Not a doc gap** | Product signal, language demand, assistant malfunction | Route to app team / business decision / Mintlify |

### 5. Write the report

Update `.todo/ai-conversation-gaps.md`:

- Set `Mined through: <now, ISO UTC>` in the header.
- Append a dated section `## Pending review (run YYYY-MM-DD)` with proposal entries:

```markdown
- [ ] HIGH | `<path>` | <gap summary> — evidence: <N> conversation(s) (<dates>), <one-line quote or paraphrase>
```

- **Never modify or delete entries from previous runs** — checked/annotated entries are the human's review record.
- **Redact secrets**: transcripts can contain user-pasted API keys or emails — never copy them into the report.

### 6. Stop and hand off

Print a summary (threads analyzed, candidates per bucket) and end with:

```
Review .todo/ai-conversation-gaps.md and tick the entries to keep.
Then run /write <path> for each approved entry — nothing is drafted automatically.
```

**Do not invoke `/write`. Do not add entries to `.todo/gaps.md`.** In a `/release` run this is the last step: the report is committed to the release branch and the PR lists the candidates as *pending review* — approving them is a separate, human decision after the PR.

## Rules

- **Report-only.** Never edits `help/**`, never triggers `/write`, never writes to `.todo/gaps.md`. The human review happens between this skill and any drafting.
- **Latest per trace.** Always `argMax` on `captured_at` — a raw event list contains superseded partial transcripts.
- **Verify everything.** A question is evidence of demand, not proof of a gap — the docs or the code decide the bucket.
- **Don't duplicate `/find-gaps`.** Catalog coverage is its job; this skill only mines conversations. Different inputs, different output files.
- **Privacy.** Quote user questions sparingly and strip anything that looks like a credential, token, or personal data.

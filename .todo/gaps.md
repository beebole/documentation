# Gaps report

Generated: 2026-09-21 (2026-09-21 release run)
Catalog last updated: 2026-09-21

Scope note: the 2026-09-14 release run closed with a verification pass that found every classified catalog entry covered. This run's `/sync-features --incremental` touched 11 entries (1 new, 10 reworded) for the 2026-09-17 production deploy, so this pass classifies those entries against their mapped pages and treats the rest of the catalog as still covered by the 2026-09-14 verification. Catalog format guard passed (27 sections, 290 bullets); catalog freshness 0 days. Entries under **Planned Features** and **Internal (Non User-Facing)** were excluded.

Excluded from classification: `reports/schedule-email` (scheduled report delivery, the shared report-result link, **Send now**, and the shared-page export). The 2026-09-17 production note describes all of it, but the **Schedule** action and the envelope badge are both gated off in production builds (`isProduction()` in `components/reports/index.ts`), and the shared result page is only reachable from a scheduled email — so none of it is live for users. Re-verified 2026-09-21; do not document until the gate is removed.

Also excluded as bug fixes with no documented behaviour to correct: the Excel and Google Sheets add-ins filling the **Activity** column again, and the QuickBooks/Xero/Asana/Jira connections no longer dropping out on concurrent refreshes.

Result of the first pass: **0 Missing, 8 Partial** across 6 sections. **Verification pass (2026-09-21):** every one of the 8 Partial entries was re-opened after `/write` and `/review`; the capability named in each `needs:` note is now present on the mapped page, and the two stale claims flagged for removal (the extension reading page text, the **All levels** scope option) are gone. **8 of 8 Resolved, 0 still open.** One code check during writing corrected a draft: on the mobile timesheet the suggestion row carries only the accept control — dismiss, the timer, and accept all live in the sheet the row opens (`timesheet/mobile/suggestion-row.ts` vs `suggestion-sheet.ts`), so the page describes them there. One touched entry was already covered: `notifications/triggers` (approval requests reaching parent-project managers) is stated on `help/documentation/approval.mdx:71`.

---

## Coverage gaps → undocumented features (verification: all resolved)

### Time Tracking

- [x] Resolved | `help/documentation/mobile.mdx` | Mobile timesheet — needs: suggestions now reach the mobile timesheet as ghost rows inside each day, next to real entries. Accept one with a single tap, or open it to change the duration, the start and end times, retarget it to another task or working activity, start a timer on it, or dismiss it. The page currently says nothing about suggestions on mobile.
- [x] Resolved | `help/documentation/ai.mdx` | Suggested time entries — needs: (1) emptying either the start or the end time of a suggestion turns it back into a duration-only draft; (2) a suggestion sitting on a staffing booking, or on a task your timesheet settings don't let you log to, always asks you to pick a project first and explains why **Accept** took you to the picker. The page covers the not-allowed-task case but not the staffing-booking one, and says nothing about clearing the times.

### Planning, Tasks & Staffing

- [x] Resolved | `help/documentation/staffing.mdx` | Staffing view — needs: (1) a booking created on the **Unassigned** row saves nothing until you pick the person or task, so an abandoned editor leaves no stray booking (the "The Unassigned row" section describes dragging into and out of the row, not creating there); (2) a project row above the lowest level is drawn in the accent color with a note explaining that its bookings should be moved down — line 53's "No <grouping>" fallback describes the neighbouring case only.

### Organization Settings

- [x] Resolved | `help/documentation/master-data.mdx` | Master data review — needs: (1) **accuracy fix** — the level picker no longer offers **All levels** (removed); tables list only the lowest level of a hierarchy by default, with the scope menu to pick a named level instead. Lines 35 and 203 both still list **All levels**. (2) The first column is now a normal column header: it can be filtered, and switching to another root list *or another category* happens from its menu (line 53 describes only the entity switch). (3) Plain-language requests now also work on the tag and project lists, and a person's name in the question is read as a filter ("who does Anna manage?"), adding the matching column to the table. (4) Reading and changing your data are two tabs on one shared sentence box, with **Apply** and **Cancel** next to the sentence and the undo of the last change always in reach.

### Reporting

- [x] Resolved | `help/documentation/ai.mdx` | Natural-language report builder — needs: the report builder and the master data review now ask through one shared sentence box that keeps the whole conversation — each question and its answer stay on screen, earlier turns available behind **Whole conversation**. The "Report builder" section describes a single-shot input.

### Integrations

- [x] Resolved | `help/integrations/quickbooks.mdx` | QuickBooks — needs: (1) exported time carries whole hours and minutes rather than a decimal hour value, so entries land on the exact duration tracked; (2) a second export is refused with a clear message while one is already running, so a double-click or a second tab cannot export the same entries twice. Relevant to the existing FAQ "Can I export the same date range twice?" (line 134).

### Companion Apps & Add-ins

- [x] Resolved | `help/documentation/browser-extension.mdx` | Browser extension — needs: **accuracy fix, privacy claim.** The extension no longer reads page content at all — only the site address, the page title, and the duration leave the browser. Three passages still say the opposite and must go: the intro Note (line 14), the "reads the visible page text" paragraph (line 45), and the FAQ answer "Does the extension see everything I browse?" (line 74). Also add: if your API key is rejected, the extension stops tracking and says so instead of retrying silently.

### UI & User Experience

- [x] Resolved | `help/documentation/concepts.mdx` | Entity badges — needs: project, task, and tag badges spell out the full parent path whenever it fits the space available, falling back to initials only when the label would be clipped, and badge tooltips always show the complete path (wider room is given to badges in relation and tag lists).

---

## Proposed page-mappings additions

_No new mappings needed._

---

## Handoff to /write

Next step: run `/write` (no args) to draft all **Missing** entries (one per line). Partial entries need curator judgment and are skipped in batch mode — use `/write <path>` with explicit notes for each.

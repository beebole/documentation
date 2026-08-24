# Screenshot needs — release 2026-08-24

Identified by `/illustrate --identify` (release run). No missing image files or `[SCREENSHOT:]` markers on the changed pages — all entries below are optional shots for UI new in the 2026-08-23 production deploy. Capture later with `/illustrate --capture .todo/screenshot-needs.md` against a seeded account.

| Target file | Page / section | Shot |
| --- | --- | --- |
| `/help/images/reports/report-folder-share.webp` | `reports.mdx` § Share a report folder | Folder open with the **Share** panel expanded: **People** and **Tags** pickers visible (element capture of the share panel) |
| `/help/images/ai/suggestion-tray-badges.webp` | `ai.mdx` § Suggested time entries | **Suggested entries** tray showing cards with mixed source badges (**Habit**, **Desktop**, **Planned**) and one **Why?** panel open |
| `/help/images/budgets/budget-card-time-days.webp` | `budgets.mdx` § Budget types | A budget card showing the **Time** field with the **Days** unit picker, a **From** date, and a **Notes** line (element capture) |
| `/help/images/timesheets/timesheet-restrictions.webp` | `timesheetSettings.mdx` § Restrictions | Restrictions chip list including **Only an admin can edit someone else's timesheet** (optional — page already has an Arcade demo) |

Notes:
- `authentication.mdx` (desktop sign-in handoff) and `desktop-app.mdx` need no shot — the flow is browser-mediated and transient.
- Use DPR 2, hide Intercom/Beta chrome, seed data per the capture spec in the skill.

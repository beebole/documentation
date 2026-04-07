# Feature Coverage Gaps

Generated: 2026-04-07
Features audited: 222 bullets (sections 1–24)
Gaps found: 65 (34 missing, 31 partial)

---

## Plan of action

### Missing features (not mentioned anywhere)

1. **[S1 Time Tracking] Document timesheet score** — Add a section to `help/documentation/timesheets.mdx` explaining the per-person compliance score (0–100), how it's calculated (on-time, late, missed, rejections), and the color-coded ring gauge on person records.

2. **[S3 Approval] Document admin force-edit** — Add to `help/documentation/approval.mdx`: explain how admins/managers can directly edit submitted or approved records without rejecting, via the per-person override toggle.

3. **[S3 Approval] Document admin force-approve and force-reject** — Add to `help/documentation/approval.mdx`: explain how admins can approve/reject any submitted timesheet even without being a designated approver, bypassing quorum.

4. **[S4 Planning] Document saved task views** — Add to `help/documentation/gantt.mdx` and/or `help/documentation/kanban.mdx`: creating, renaming, and switching between named views with their own layout, columns, and grouping.

5. **[S4 Planning] Document recurring tasks** — Add to `help/documentation/planning.mdx`: how to set tasks to repeat (daily, weekly, monthly, yearly, working days).

6. **[S4 Planning] Document move task between categories** — Add to `help/documentation/planning.mdx`: reassigning a root-level task and its subtasks to a different category via context menu.

7. **[S4 Planning] Document Gantt keyboard navigation** — Add to `help/documentation/gantt.mdx`: arrow keys to navigate rows, expand/collapse groups without mouse.

8. **[S6 People] Document bulk invitation** — Add to `help/documentation/people.mdx`: how to invite multiple people at once.

9. **[S6 People] Document overflow to archived on seat limit** — Add to `help/documentation/people.mdx`: explain that when the seat limit is reached, new people are created in archived state.

10. **[S7 Projects] Document project-level time settings** — Add to `help/documentation/projects.mdx`: explain per-project overrides of organisation time defaults.

11. **[S9 Tags] Document move tag between categories** — Add to `help/documentation/tags.mdx`: reassigning a tag and child tags to a different category via context menu.

12. **[S12 Roles] Document availability controls** — Add to `help/documentation/roles-authorisations.mdx`: choosing which projects, absence types, expense types, tasks, and custom fields are available by default, with overrides per tag/person/project.

13. **[S14 Org Settings] Document organisation logo** — Add to `help/documentation/account-settings.mdx`: uploading a logo that appears in sidebar and emails.

14. **[S14 Org Settings] Document organisation accent colour** — Add to `help/documentation/account-settings.mdx`: admin-set colour that becomes the interface accent for all members.

15. **[S15 Reporting] Document chart visualizations** — Add to `help/documentation/custom-reports.mdx`: the 11 chart types (bar, line, pie, area, stacked, scatter, radar, treemap, waterfall), toggling between table and chart view, configuring chart height.

16. **[S17 Notifications] Document reliable delivery** — Add to `help/documentation/notifications.mdx`: notifications are retried automatically if delivery fails.

17. **[S17 Notifications] Document notification history** — Add to `help/documentation/notifications.mdx`: notifications merged into journal feed with per-context read tracking.

18. **[S18 Integrations] Create Monday.com integration page** — Create `help/integrations/monday.mdx` documenting import/sync of boards and items from Monday.com.

19. **[S18 Integrations] Create BambooHR integration page** — Create `help/integrations/bamboohr.mdx` documenting time-off sync, employee mapping, absence type mapping, and schedule-aware duration calculation.

20. **[S18 Integrations] Create Webhooks page** — Create `help/integrations/webhooks.mdx` or add a section to `help/integrations/custom-integrations.mdx` documenting outgoing webhooks with HMAC-SHA256 signing and auto-retry.

21. **[S20 Auth] Document passwordless email login** — Add to `help/documentation/authentication.mdx`: sign-in via one-time verification code sent to inbox.

22. **[S23 Legacy] Create legacy migration page** — Create `help/documentation/legacy-migration.mdx` explaining how to migrate an existing Beebole account, preserving historical data.

23. **[S24 UI] Document keyboard navigation** — Add to an appropriate page (account-settings or a new UX page): Escape to close, keyboard shortcuts.

24. **[S24 UI] Document undo/redo** — Cmd+Z / Cmd+Shift+Z with operation grouping for bulk changes.

25. **[S24 UI] Document real-time sync** — Changes by teammates appear instantly without refreshing.

26. **[S24 UI] Document entity duplication** — Duplicate entities for quick creation.

27. **[S24 UI] Document profile pictures** — Avatar upload with crop tool.

28. **[S24 UI] Document breadcrumb navigation** — Hierarchical entity paths.

29. **[S24 UI] Document version update notifications** — New version prompt and one-click reload.

30. **[S24 UI] Document in-app support chat** — Built-in support chat widget.

### Partial features (mentioned but insufficient)

31. **[S1 Time Tracking] Expand mobile timesheet docs** — `help/documentation/mobile.mdx` covers PWA but has no mobile-specific time entry workflow (logging hours, starting timers, submitting from phone).

32. **[S3 Approval] Expand timesheet summary in emails** — `help/documentation/approval.mdx` mentions the summary exists but doesn't describe what's included or its format.

33. **[S4 Planning] Expand Gantt column customisation** — `help/documentation/gantt.mdx` lists filter/group options but doesn't explain show/hide/reorder of columns.

34. **[S4 Planning] Expand Gantt row grouping** — Single table row mention; add how it works and available grouping options.

35. **[S4 Planning] Expand filter by tags** — One bullet in planning.mdx; needs a how-to.

36. **[S4 Planning] Expand hierarchical tasks** — Category→project hierarchy is explained, but subtask creation within task views is not.

37. **[S4 Planning] Expand task-level custom fields** — Single sentence in kanban.mdx; needs configuration and usage guide.

38. **[S4 Planning] Expand task descriptions** — Passing mention in kanban.mdx; add to gantt.mdx and explain rich text editor.

39. **[S6 People] Expand role assignment** — Mentioned in "Add a person" step but no dedicated explanation of changing roles later.

40. **[S6 People] Expand schedule assignment** — One bullet with link; needs a how-to on the People page.

41. **[S6 People] Expand localisation per person** — Single bullet; needs steps for setting timezone, language, date format.

42. **[S6 People] Expand billing & cost rates per person** — Bullet with link only; needs how-to on People page.

43. **[S6 People] Expand absence quotas per person** — Single bullet with link; needs explanation.

44. **[S6 People] Expand custom fields on persons** — Single bullet mention; needs more detail.

45. **[S6 People] Expand bulk operations** — Only archive/unarchive mentioned; document broader bulk capabilities.

46. **[S7 Projects] Expand billing rates per project** — Bullet with link; needs detail on Projects page.

47. **[S7 Projects] Expand cost rates per project** — Bullet with link; needs detail on Projects page.

48. **[S7 Projects] Expand expense types per project** — One bullet/sentence; needs how-to for assigning/restricting expense types.

49. **[S7 Projects] Expand custom fields on projects** — Single bullet; needs more detail.

50. **[S7 Projects] Expand move project between categories** — FAQ answer only; needs step-by-step.

51. **[S9 Tags] Expand custom hierarchy labels** — One sentence; needs step-by-step for naming each level.

52. **[S14 Org Settings] Expand Data export & GDPR** — `data-exports.mdx` covers export mechanics but zero mention of GDPR rights, data deletion requests, or compliance.

53. **[S15 Reporting] Clarify report folders vs. categories** — Custom-reports.mdx uses "categories"; verify if app label is "folders" and align.

54. **[S19 API] Fill out API pages** — `introduction.mdx`, `queries.mdx`, `mutations.mdx` are stubs with frontmatter only; write actual content.

55. **[S20 Auth] Expand SSO-only enforcement** — One FAQ answer; needs step-by-step for enabling enforcement.

56. **[S20 Auth] Resolve sso.mdx stub** — `sso.mdx` exists with frontmatter only; either fill it or redirect to `authentication.mdx`.

57. **[S24 UI] Expand personal interface colour docs** — No how-to for the personal accent colour picker.

58. **[S24 UI] Expand multi-language UI docs** — One sentence; list supported languages and how to switch.

59. **[S24 UI] Document global search** — Only module-specific search is mentioned; cross-entity global search needs its own section.

60. **[S24 UI] Expand attribute copy/paste** — Only in timesheet context; document across other entity types.

61. **[S24 UI] Expand onboarding flow** — `quickstart.mdx` notes its existence but doesn't document the wizard steps.

---

## Quick reference

1. Document timesheet score
2. Document admin force-edit
3. Document admin force-approve and force-reject
4. Document saved task views
5. Document recurring tasks
6. Document move task between categories
7. Document Gantt keyboard navigation
8. Document bulk invitation
9. Document overflow to archived on seat limit
10. Document project-level time settings
11. Document move tag between categories
12. Document availability controls
13. Document organisation logo
14. Document organisation accent colour
15. Document chart visualizations
16. Document reliable delivery
17. Document notification history
18. Create Monday.com integration page
19. Create BambooHR integration page
20. Create Webhooks page
21. Document passwordless email login
22. Create legacy migration page
23. Document keyboard navigation
24. Document undo/redo
25. Document real-time sync
26. Document entity duplication
27. Document profile pictures
28. Document breadcrumb navigation
29. Document version update notifications
30. Document in-app support chat
31. Expand mobile timesheet docs
32. Expand timesheet summary in emails
33. Expand Gantt column customisation
34. Expand Gantt row grouping
35. Expand filter by tags
36. Expand hierarchical tasks
37. Expand task-level custom fields
38. Expand task descriptions
39. Expand role assignment
40. Expand schedule assignment
41. Expand localisation per person
42. Expand billing & cost rates per person
43. Expand absence quotas per person
44. Expand custom fields on persons
45. Expand bulk operations
46. Expand billing rates per project
47. Expand cost rates per project
48. Expand expense types per project
49. Expand custom fields on projects
50. Expand move project between categories
51. Expand custom hierarchy labels
52. Expand Data export & GDPR
53. Clarify report folders vs. categories
54. Fill out API pages
55. Expand SSO-only enforcement
56. Resolve sso.mdx stub
57. Expand personal interface colour docs
58. Expand multi-language UI docs
59. Document global search
60. Expand attribute copy/paste
61. Expand onboarding flow

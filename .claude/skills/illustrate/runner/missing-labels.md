# Unnamed controls found while writing scenes

Controls without an accessible name force scenes onto structural anchors. Each line: page, control, how the scene reaches it. Feeds the agent-ready work in reboot.

| Screen | Control | Scene workaround |
| --- | --- | --- |
| Tags | Category settings gear next to the category name | second button in the heading container |
| Tags | Expand/collapse arrow on a tag row | first button in the row |
| Tags | Row action buttons (⋯, +) | not used |
| Timesheet | Grid / Calendar view toggle | first button in the heading container |
| Timesheet | Entry info button in a cell's corner | `button.absolute` inside the `.ts-cell` found from row label and day header |
| Timesheet | − / + stepper buttons inside a time cell | never clicked: they change the entry |
| Timesheet | Top-left cluster buttons (Approval, Team, Import your calendar events, Copy) | tooltip only: `h.byTooltip` hovers each and matches the tooltip |
| Timesheet | Row ⋯ action button | `.bb-btn-action`, visible on row hover |
| Timesheet | Row timer control (avatar with play/pause badge) | a clickable `span` (`group/timer-icon`), not a button, no accessible name |
| Planning | Planning settings gear next to the planning name | `h.byTooltip` on the heading container, tooltip "Main plan settings" |
| Planning (Kanban) | Column and card titles | editable fields, not text: scenes wait on a card's project line |
| Reports (Matrix) | Swap rows and columns button | tooltip only: `h.byTooltip` inside `report-matrix` |
| Reports (table) | Column header menu (Subtotal, Hide empty values, Add a column…, Remove) | opens on hover of `.columnHeader`; its rows are clicked with the mouse at the row's position |
| Side panel | Resize handle on the panel's left edge | dragged by position (866, 101) in the roles scene |

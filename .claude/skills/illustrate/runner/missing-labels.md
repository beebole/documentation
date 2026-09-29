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

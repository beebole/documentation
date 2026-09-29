// Scenes for help/documentation/timesheetSettings.mdx.
export const page = 'help/documentation/timesheetSettings.mdx'

export const scenes = [
	{
		id: 'timesheet-settings-period',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=time-settings')
			await page.getByText('Period & submission', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		shots: [{ file: 'timesheets/settings-period-tab.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Timesheet and Planning Settings', 'Absence allowances', { right: 1130 }) } }],
	},
]

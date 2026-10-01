// Scenes for help/documentation/timesheetSettings.mdx.
export const page = 'help/documentation/timesheetSettings.mdx'

// The inherited-value icon of the Timesheet period setting.
const inheritedIcon = (page) => page.getByText('Timesheet period', { exact: true }).filter({ visible: true }).first().locator('xpath=..').locator('bb-icon').first()

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
	{
		id: 'timesheet-settings-time-entry',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=time-settings')
			await page.getByText('Time entry', { exact: true }).first().click()
			await page.getByText('Unit for time entry', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'timesheets/settings-time-entry-tab.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Timesheet and Planning Settings', 'Absence allowances', { right: 1130 }) } }],
	},
	{
		id: 'timesheet-settings-categories',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=time-settings')
			await page.getByText('Categories', { exact: true }).first().click()
			await page.getByText('Record time on these project categories').first().waitFor()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'timesheets/settings-categories-tab.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Timesheet and Planning Settings', 'Absence allowances', { right: 1200 }) } }],
	},
	{
		// A person's own Timesheet and Planning Settings panel, where every value is inherited.
		id: 'timesheet-settings-inherited',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/persons', 'Marc Dubois', 'time-settings')
			await page.getByText('Period & submission', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
			await inheritedIcon(page).hover()
			await page.getByText('Settings / Timesheet and Planning Settings').filter({ visible: true }).first().waitFor()
		},
		// On the icon next to Timesheet period, whose tooltip names where the value comes from.
		async mouse(page) {
			const b = await inheritedIcon(page).boundingBox()
			return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
		},
		shots: [
			{
				file: 'timesheets/settings-inheritance-icon.webp',
				// The panel from its title to the Restrictions label, with the icon's tooltip.
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Timesheet and Planning Settings', { exact: true }).filter({ visible: true }).first().boundingBox()
						const end = await page.getByText('Restrictions', { exact: true }).filter({ visible: true }).first().boundingBox()
						const x = title.x - 64
						const y = title.y - 20
						return { x, y, width: 1440 - 16 - x, height: end.y - 12 - y }
					},
				},
			},
		],
	},
]

// Scenes for help/documentation/timesheetSettings.mdx.
export const page = 'help/documentation/timesheetSettings.mdx'

// The inherited-value icon of the Timesheet period setting.
const inheritedIcon = (page) => page.getByText('Timesheet period', { exact: true }).filter({ visible: true }).first().locator('xpath=..').locator('bb-icon').first()

// Auto Timesheet from Planning, switched on for the capture only with Main plan from its
// in-progress status to its done status, and switched off right after. Nothing is generated in
// the meantime: the feature only reacts to tasks being created or changing status.
const autoTimesheet = {
	async up(api) {
		const plan = (await api('{ getTaskCategories { id name statuses { id name } } }')).getTaskCategories.find((c) => c.name === 'Main plan')
		const start = plan.statuses.find((s) => /progress/i.test(s.name)) ?? plan.statuses[1]
		const end = plan.statuses.find((s) => /done/i.test(s.name)) ?? plan.statuses.at(-1)
		await api('mutation { editOrganisationTimeSettingsEnableAutoTimesheet(enableAutoTimesheet: true) { id } }')
		await api('mutation($e: [BeeboleAutoTimesheetEntryInput]) { editOrganisationTimeSettingsAutoTimesheet(autoTimesheet: $e) { id } }', {
			e: [{ categoryId: plan.id, timesheetStartStatusId: start.id, timesheetEndStatusId: end.id }],
		})
		return {}
	},
	async down(api) {
		await api('mutation { editOrganisationTimeSettingsAutoTimesheet(autoTimesheet: null) { id } }')
		await api('mutation { editOrganisationTimeSettingsEnableAutoTimesheet(enableAutoTimesheet: null) { id } }')
	},
}

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
		id: 'timesheet-settings-reminders',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=time-settings')
			await page.getByText('Reminders', { exact: true }).first().click()
			await page.getByText('Remind to submit').first().waitFor()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'timesheets/settings-reminders-tab.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Timesheet and Planning Settings', 'Absence allowances', { right: 1130 }) } }],
	},
	{
		id: 'timesheet-settings-auto-timesheet',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		fixture: autoTimesheet,
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=time-settings')
			await page.getByText('Auto Timesheet from Planning', { exact: true }).first().click()
			await page.getByText('Main plan', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'timesheets/settings-auto-timesheet-tab.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Timesheet and Planning Settings', 'Absence allowances', { right: 1130 }) } }],
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
	{
		// The account's Add restriction menu open. Picking a rule would save it, so nothing is picked.
		id: 'timesheet-settings-add-restriction',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=time-settings')
			await page.getByText('Period & submission', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
			await page.getByPlaceholder('Add restriction').filter({ visible: true }).first().click()
			await page.getByText("Only an admin can edit someone else's timesheet", { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
		},
		mouse: () => ({ x: 800, y: 50 }),
		// From the Restrictions label down to the bottom of the open menu.
		shots: [
			{
				file: 'timesheets/timesheet-restrictions.webp',
				frame: {
					type: 'box',
					box: async (page, h) => {
						const label = await page.getByText('Restrictions', { exact: true }).filter({ visible: true }).first().boundingBox()
						const menu = await h.surfaceAround(page, 'Hide the non-billable option')
						const x = label.x - 24
						const y = label.y - 16
						return { x, y, width: menu.x + menu.width + 24 - x, height: menu.y + menu.height + 16 - y }
					},
				},
			},
		],
	},
]

// Scenes for help/documentation/work-schedule.mdx. Every panel is widened to 800 px: at its
// default width a day's interval wraps (end time and × on a second line), and so does the × of a
// dated assignment.
export const page = 'help/documentation/work-schedule.mdx'

const PANEL_WIDTH = 800

export const scenes = [
	{
		id: 'work-schedule-details',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/scheduleTypes', 'Full Time', 'scheduleType')
			await page.getByText('Length in days', { exact: true }).waitFor()
			await h.settle(page, 1500)
			await h.widenPanel(page, PANEL_WIDTH)
		},
		// The Details panel, from its title to the end of the second day: the other days repeat it.
		shots: [
			{
				file: 'work-schedule/schedule-details.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Details', { exact: true }).filter({ visible: true }).first().boundingBox()
						const second = await page.getByText(/^Total:/).filter({ visible: true }).nth(1).boundingBox()
						const x = title.x - 64
						const y = title.y - 24
						return { x, y, width: 1440 - 16 - x, height: second.y + second.height + 16 - y }
					},
				},
			},
		],
	},
	{
		id: 'work-schedule-assign-panel',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/persons', 'Elena Rossi', 'schedule-type-relations')
			await h.settle(page, 1500)
			await h.widenPanel(page, PANEL_WIDTH)
		},
		shots: [{ file: 'work-schedule/assign-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Work schedule', 'Absence allowances') } }],
	},
	{
		// Yuki Tanaka's Work schedule panel: Full Time, then Half Time – 5d from January 4, 2027
		// (seed layer), each with its Start date.
		id: 'work-schedule-dated-assignments',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/persons', 'Yuki Tanaka', 'schedule-type-relations')
			await page.getByText('Half Time – 5d', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
			await h.widenPanel(page, PANEL_WIDTH)
		},
		mouse: () => ({ x: 400, y: 700 }),
		shots: [{ file: 'work-schedule/dated-assignments.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Work schedule', 'Absence allowances') } }],
	},
	{
		// Half Time – 3d-2d: a 14-day cycle, three days the first week and two the second.
		id: 'work-schedule-two-week-cycle',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		viewport: { width: 1440, height: 1800 },
		async setup(page, h) {
			await h.openPanel(page, '/scheduleTypes', 'Half Time – 3d-2d', 'scheduleType')
			await page.getByText('Length in days', { exact: true }).waitFor()
			await h.settle(page, 1500)
			await h.widenPanel(page, PANEL_WIDTH)
		},
		mouse: () => ({ x: 400, y: 1200 }),
		// The Details panel, from its title through the second week's two working days and the
		// day after them.
		shots: [
			{
				file: 'work-schedule/two-week-cycle.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Details', { exact: true }).filter({ visible: true }).first().boundingBox()
						const wed = await page.getByText(/Wed/).filter({ visible: true }).nth(1).boundingBox()
						const x = title.x - 64
						const y = title.y - 24
						return { x, y, width: 1440 - 16 - x, height: wed.y + wed.height + 24 - y }
					},
				},
			},
		],
	},
]

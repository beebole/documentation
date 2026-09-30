// Scenes for help/documentation/work-schedule.mdx.
export const page = 'help/documentation/work-schedule.mdx'

export const scenes = [
	{
		id: 'work-schedule-details',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/scheduleTypes', 'Full Time', 'scheduleType')
			await page.getByText('Length in days', { exact: true }).waitFor()
			await h.settle(page, 1500)
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
]

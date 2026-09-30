// Scenes for help/documentation/projects.mdx.
export const page = 'help/documentation/projects.mdx'

const restInHeader = () => ({ x: 800, y: 110 })

export const scenes = [
	{
		id: 'projects-tree',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Acme Corp', 'Website Redesign')
			await h.expandRow(page, 'Quantum Logistics', 'Fleet Tracker')
			await h.settle(page)
		},
		shots: [{ file: 'projects/projects-tree.webp', frame: { type: 'full' } }],
	},
	{
		// Website Redesign, not Acme Corp: the tasks are linked to the subproject.
		id: 'projects-tasks-bookings',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Acme Corp', 'Website Redesign')
			await page.getByText('Website Redesign', { exact: true }).first().click()
			const entity = /\/projects\/[0-9a-f]{24}/
			await page.waitForURL(entity)
			await h.goto(page, `${page.url().match(entity)[0]}/project-tasks`)
			await page.getByText('Frontend Development', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: restInHeader,
		shots: [{ file: 'projects/project-tasks-bookings.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Tasks and bookings', 'Billing') } }],
	},
]

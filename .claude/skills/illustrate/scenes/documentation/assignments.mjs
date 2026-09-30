// Scenes for help/documentation/assignments.mdx.
export const page = 'help/documentation/assignments.mdx'

const restInHeader = () => ({ x: 800, y: 50 })

export const scenes = [
	{
		id: 'assignments-show-hide-by-default',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=availability')
			await page.getByText('Show all projects', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: restInHeader,
		shots: [{ file: 'assignments/show-hide-by-default.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Show or hide by default', 'Absence allowances') } }],
	},
	{
		id: 'assignments-who-has-access',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/projects', 'Acme Corp', 'related-to')
			await page.getByText('Individually', { exact: false }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: restInHeader,
		shots: [{ file: 'assignments/who-has-access-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Who has access?', 'Billing') } }],
	},
]

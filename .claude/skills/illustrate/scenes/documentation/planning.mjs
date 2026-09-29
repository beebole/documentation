// Scenes for help/documentation/planning.mdx.
export const page = 'help/documentation/planning.mdx'

// The view tabs save the selected view as a person preference (answered by the runner's guard).
async function openView(page, h, name) {
	await h.goto(page, '/tasks')
	await page.getByText('Add a view').first().waitFor()
	await page.getByText(name, { exact: true }).first().click()
}

export const scenes = [
	{
		id: 'planning-kanban-view',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openView(page, h, 'Kanban')
			// Column and card titles are editable fields: wait for a card's project line instead.
			await page.getByText('Silverline Retail: E-commerce Platform', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'planning/kanban-view.webp', frame: { type: 'full' } }],
	},
	{
		id: 'planning-settings-dialog',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openView(page, h, 'Kanban')
			const header = page.getByRole('heading', { name: /Planning/ }).locator('xpath=..')
			await (await h.byTooltip(page, header, 'Main plan settings')).click()
			await page.getByText('What this planning holds').first().waitFor()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'planning/planning-settings-dialog.webp', frame: { type: 'box', box: (page, h) => h.surfaceAround(page, 'What this planning holds'), pad: 24 } }],
	},
]

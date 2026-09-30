// Scenes for help/documentation/gantt.mdx.
export const page = 'help/documentation/gantt.mdx'

async function openGantt(page, h) {
	await h.goto(page, '/tasks')
	await page.getByText('Add a view').first().waitFor()
	// The view tabs save the selected view as a person preference (answered by the guard).
	await page.getByText('Gantt', { exact: true }).first().click()
	await page.getByText('Frontend Development', { exact: true }).first().waitFor()
	await h.settle(page, 2000)
}

export const scenes = [
	{
		id: 'gantt-timeline',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openGantt(page, h)
		},
		shots: [{ file: 'gantt/timeline-bars.webp', frame: { type: 'full' } }],
	},
]

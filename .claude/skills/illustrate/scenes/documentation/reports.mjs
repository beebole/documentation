// Scenes for help/documentation/reports.mdx (also used on quickstart.mdx).
export const page = 'help/documentation/reports.mdx'

export const scenes = [
	{
		id: 'reports-folder-report',
		capturedAt: '2026-09-29',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/reports')
			await page.getByText('Current Month', { exact: true }).first().click()
			// A click on a report before the folder has settled opens it without results.
			await page.getByText('Hours by Person', { exact: true }).first().waitFor()
			await h.settle(page, 2000)
			await page.getByText('Hours by Person', { exact: true }).first().click()
			await page.getByText('Ana Pereira', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
			await h.settle(page, 1500)
		},
		shots: [{ file: 'reports/folders-and-reports.webp', frame: { type: 'full' } }],
	},
]

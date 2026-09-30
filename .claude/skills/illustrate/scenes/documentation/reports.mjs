// Scenes for help/documentation/reports.mdx (also used on quickstart.mdx).
export const page = 'help/documentation/reports.mdx'

// Opens a folder of the Reports menu and waits until its reports are listed.
export async function openFolder(page, h, folder, firstReport) {
	await h.goto(page, '/reports')
	await page.getByText(folder, { exact: true }).first().click()
	// A click on a report before the folder has settled opens it without results.
	await page.getByText(firstReport, { exact: true }).first().waitFor()
	await h.settle(page, 2000)
}

// Sets a report's Table / Chart / Matrix toggles. Their state is saved on the report
// (editReportChart, answered by the runner), and the account once had a table switched off by
// hand: never rely on what the report remembers. An active toggle has a grey background.
export async function setViews(page, h, report, wanted) {
	const row = page
		.getByText(report, { exact: true })
		.first()
		.locator('xpath=ancestor::*[.//button[normalize-space()="Table"]][1]')
	for (const [view, on] of Object.entries(wanted)) {
		const button = row.getByRole('button', { name: view, exact: true }).first()
		const active = await button.evaluate((b) => b.className.includes('bg-gray-200'))
		if (active !== on) {
			await button.click()
			await h.settle(page, 600)
		}
	}
}

export const scenes = [
	{
		id: 'reports-folder-report',
		capturedAt: '2026-09-29',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openFolder(page, h, 'Current Month', 'Hours by Person')
			await page.getByText('Hours by Person', { exact: true }).first().click()
			await setViews(page, h, 'Hours by Person', { Table: true, Chart: false, Matrix: false })
			await page.getByText('Ana Pereira', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
			await h.settle(page, 1500)
		},
		shots: [{ file: 'reports/folders-and-reports.webp', frame: { type: 'full' } }],
	},
	{
		id: 'reports-folder-share',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openFolder(page, h, 'Current Month', 'Hours by Person')
			await page.getByRole('button', { name: 'Share', exact: true }).click()
			await page.getByPlaceholder('Select person').first().waitFor()
			// Open the People picker so the reader sees who can be picked (nothing is selected).
			await page.getByPlaceholder('Select person').first().click()
			await page.getByText('Ana Pereira', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		// From the folder header down to the bottom of the open picker list.
		shots: [
			{
				file: 'reports/report-folder-share.webp',
				frame: {
					type: 'box',
					box: async (page, h) => {
						const list = await h.stableBox(page, page.getByText('Ana Pereira', { exact: true }).filter({ visible: true }).first().locator('xpath=ancestor::*[contains(@class, "bb-popup")][1]'))
						const x = 324
						return { x, y: 0, width: 1440 - x, height: Math.min(900, list.y + list.height + 24) }
					},
				},
			},
		],
	},
	{
		id: 'reports-absence-quotas',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/reports')
			await page.getByRole('button', { name: 'Absence quotas', exact: true }).click()
			await page.getByText('Ana Pereira', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		shots: [{ file: 'reports/absence-quota-report.webp', frame: { type: 'full' } }],
	},
]

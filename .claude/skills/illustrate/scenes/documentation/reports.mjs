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
	{
		id: 'reports-view-toggles',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openFolder(page, h, 'Current Month', 'Hours by Person')
			await page.getByText('Hours by Person', { exact: true }).first().click()
			await setViews(page, h, 'Hours by Person', { Table: true, Chart: true, Matrix: false })
			await h.settle(page, 2000)
		},
		// The report's header line: its close button and name, then the three toggles (one group, the
		// Table button's parent) and the ⋯ menu.
		shots: [
			{
				file: 'reports/table-chart-matrix-toggle.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const group = await page.getByRole('button', { name: 'Table', exact: true }).first().locator('xpath=..').boundingBox()
						const name = await page.getByText('Hours by Person', { exact: true }).filter({ visible: true }).last().boundingBox()
						const x = name.x - 80
						const y = group.y - 20
						return { x, y, width: group.x + group.width + 64 - x, height: group.height + 40 }
					},
				},
			},
		],
	},
	{
		// One column per measure (the default layout) is wider than a 1440 screen.
		id: 'reports-budget-status-table',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 1760, height: 900 },
		async setup(page, h) {
			await h.goto(page, '/reports')
			await page.getByRole('button', { name: 'Budget Status', exact: true }).click()
			await page.getByText('Acme Corp', { exact: true }).first().waitFor()
			await h.settle(page, 2000)
			// Expand Acme Corp by its chevron: a click on the name opens the project's panel.
			const table = page.locator('budget-status-table')
			const rows = await table.locator('entity-badge').count()
			await table.locator('div.cursor-pointer').filter({ hasText: 'Acme Corp' }).first().locator('bb-icon').first().click()
			await page.waitForFunction((n) => document.querySelector('budget-status-table').querySelectorAll('entity-badge').length > n, rows)
			await h.settle(page, 1000)
		},
		// From the report title to the bottom of the table, across to the Export button.
		shots: [
			{
				file: 'reports/budget-status-table.webp',
				frame: {
					type: 'box',
					pad: 24,
					box: async (page) => {
						const title = await page.getByText('Budget Status', { exact: true }).filter({ visible: true }).last().boundingBox()
						const exp = await page.getByRole('button', { name: 'Export' }).boundingBox()
						const table = await page.locator('budget-status-table').boundingBox()
						return { x: title.x, y: title.y, width: exp.x + exp.width - title.x, height: table.y + table.height - title.y }
					},
				},
			},
		],
	},
]

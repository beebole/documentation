// Scenes for help/documentation/custom-reports.mdx. The Margin by Client per Month report of the
// Current Year folder: a client column, a month column and hours.
import { openFolder, setViews } from './reports.mjs'

export const page = 'help/documentation/custom-reports.mdx'

const REPORT = 'Margin by Client per Month'

async function openReport(page, h, views) {
	await openFolder(page, h, 'Current Year', REPORT)
	await page.getByText(REPORT, { exact: true }).first().click()
	await setViews(page, h, REPORT, views)
	await page.getByText('2026-01', { exact: true }).first().waitFor()
	await h.settle(page, 1500)
}

export const scenes = [
	{
		id: 'custom-reports-column-menu',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openReport(page, h, { Table: true, Chart: false, Matrix: false })
			// A column header opens its menu on hover (bb-column-header). Its Add a column… row does
			// not take a locator click (the popup follows the hover), so click it with the mouse.
			await page.locator('.columnHeader').first().hover()
			const add = page.getByText('Add a column…', { exact: true }).filter({ visible: true }).first()
			await add.waitFor()
			const item = await h.stableBox(page, add)
			await page.mouse.move(item.x + 20, item.y + item.height / 2, { steps: 5 })
			await page.mouse.down()
			await page.mouse.up()
			await page.getByText('Time and amounts', { exact: true }).waitFor()
			await h.settle(page, 800)
		},
		// Picking nothing closes the menu without adding a column.
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		shots: [{ file: 'custom-reports/column-badges-menu.webp', frame: { type: 'box', box: async () => ({ x: 340, y: 0, width: 1080, height: 600 }) } }],
	},
	{
		id: 'custom-reports-matrix',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		// Months down the side (twelve rows), five clients across: sized for all of it and the totals.
		viewport: { width: 1600, height: 1150 },
		async setup(page, h) {
			await openReport(page, h, { Table: false, Chart: false, Matrix: true })
			// Heat map is saved with the report (answered by the runner): set it explicitly.
			const heat = page.getByRole('checkbox', { name: 'Heat map' })
			if (!(await heat.isChecked())) await heat.check()
			// Twelve month columns do not fit the page: swap so the months become rows. The swap
			// button has a tooltip only (see missing-labels.md), and the second-row swap next to it
			// is disabled (no pointer events), so look among the enabled buttons. Swap only while
			// clients are rows.
			const matrix = page.locator('report-matrix')
			if (await matrix.locator('th').first().getByText('Client: Name').count()) {
				await (await h.byTooltip(page, matrix, 'Swap rows and columns', 'button:not(.pointer-events-none)')).click()
				await matrix.locator('th').first().getByText('Period: Month').waitFor()
			}
			await h.settle(page, 1500)
		},
		// The report, from its title row to below the matrix totals. Toggling a view shows undo and
		// redo arrows over the folder header, which the frame leaves out.
		shots: [
			{
				file: 'custom-reports/matrix-view.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText(REPORT, { exact: true }).filter({ visible: true }).last().boundingBox()
						const total = await page.getByText('Total', { exact: true }).filter({ visible: true }).last().boundingBox()
						const x = 340
						const y = title.y - 28
						return { x, y, width: page.viewportSize().width - 24 - x, height: total.y + total.height + 28 - y }
					},
				},
			},
		],
	},
	{
		id: 'custom-reports-chart',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openFolder(page, h, 'Current Year', REPORT)
			await page.getByText(REPORT, { exact: true }).first().click()
			await setViews(page, h, REPORT, { Table: false, Chart: true, Matrix: false })
			await page.locator('report-chart canvas, report-chart svg').first().waitFor()
			await h.settle(page, 2000)
		},
		// The report, from its title row to below the chart legend.
		shots: [
			{
				file: 'custom-reports/chart-view.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText(REPORT, { exact: true }).filter({ visible: true }).last().boundingBox()
						const chart = await page.locator('report-chart').filter({ visible: true }).first().boundingBox()
						const x = 340
						const y = title.y - 28
						return { x, y, width: 1440 - 24 - x, height: chart.y + chart.height + 16 - y }
					},
				},
			},
		],
	},
]

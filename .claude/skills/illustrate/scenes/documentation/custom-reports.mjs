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
		shots: [{ file: 'custom-reports/column-badges-menu.webp', ignore: (page, h) => h.figureCells(page), frame: { type: 'box', box: async () => ({ x: 340, y: 0, width: 1080, height: 600 }) } }],
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
				file: 'custom-reports/matrix-view.webp', ignore: (page, h) => h.figureCells(page),
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
	{
		// The Chart type picker open over the chart (opening it changes nothing).
		id: 'custom-reports-chart-type',
		capturedAt: '2026-10-01',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openFolder(page, h, 'Current Year', REPORT)
			await page.getByText(REPORT, { exact: true }).first().click()
			await setViews(page, h, REPORT, { Table: false, Chart: true, Matrix: false })
			await page.locator('report-chart canvas, report-chart svg').first().waitFor()
			await h.settle(page, 2000)
			await page.locator('report-chart button').filter({ hasText: 'Stacked bar' }).first().click()
			await page.getByText('Waterfall', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 1300, y: 860 }),
		// The report, from its title row down to the bottom of the open menu.
		shots: [
			{
				file: 'custom-reports/chart-type-picker.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText(REPORT, { exact: true }).filter({ visible: true }).last().boundingBox()
						const last = await page.getByText('Waterfall', { exact: true }).filter({ visible: true }).first().boundingBox()
						const x = 340
						const y = title.y - 28
						return { x, y, width: 1440 - 24 - x, height: last.y + last.height + 24 - y }
					},
				},
			},
		],
	},
	{
		// Margin by Client per Month copied from its ⋯ menu (the app keeps it, nothing is saved),
		// then the Current Month folder's ⋯ menu opened in the Reports menu: Paste is offered.
		id: 'custom-reports-folder-paste',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			const report = 'Margin by Client per Month'
			await openFolder(page, h, 'Current Year', report)
			await page.getByText(report, { exact: true }).first().click()
			await page.getByText('2026-01', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
			const row = page.getByText(report, { exact: true }).first().locator('xpath=ancestor::*[.//button[normalize-space()="Table"]][1]')
			await row.locator('bb-action-menu-button button').first().click()
			await page.getByText('Copy', { exact: true }).filter({ visible: true }).first().click()
			await h.settle(page, 800)
			// The folder's ⋯ button shows while its entry in the Reports menu is hovered.
			const folder = page.locator('report-folder-item').filter({ hasText: 'Current Month' }).first()
			await folder.hover()
			await h.settle(page, 400)
			await folder.locator('bb-action-menu-button button').first().click()
			await page.getByText('Paste', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 1300, y: 850 }),
		// The Reports menu column, from its title down to the bottom of the folder's menu.
		shots: [
			{
				file: 'custom-reports/folder-paste-menu.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const title = await page.getByText('Reports', { exact: true }).filter({ visible: true }).first().boundingBox()
						const item = await page.locator('report-folder-item').filter({ hasText: 'Current Month' }).first().boundingBox()
						const menu = await page
							.getByText('Paste', { exact: true })
							.filter({ visible: true })
							.first()
							.locator('xpath=ancestor::*[.//*[normalize-space()="Duplicate"]][1]')
							.boundingBox()
						const x = title.x - 20
						const y = title.y - 20
						return { x, y, width: Math.max(item.x + item.width, menu.x + menu.width) + 4 - x, height: menu.y + menu.height + 24 - y }
					},
				},
			},
		],
	},
	{
		// The Label axis selector open above the chart: the report's columns that can label it.
		// Opening it changes nothing.
		id: 'custom-reports-chart-axes',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openFolder(page, h, 'Current Year', REPORT)
			await page.getByText(REPORT, { exact: true }).first().click()
			await setViews(page, h, REPORT, { Table: false, Chart: true, Matrix: false })
			await page.locator('report-chart canvas, report-chart svg').first().waitFor()
			await h.settle(page, 2000)
			await page.locator('report-chart button').filter({ hasText: 'Client: Name' }).first().click()
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 1300, y: 860 }),
		// From the axis controls down to the bottom of the open menu and its submenus.
		shots: [
			{
				file: 'custom-reports/chart-axes.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const bar = await page.getByText('Chart type:', { exact: true }).filter({ visible: true }).first().boundingBox()
						const last = await page.getByText('Time entity', { exact: true }).filter({ visible: true }).first().boundingBox()
						const x = bar.x - 24
						const y = bar.y - 12
						return { x, y, width: 1440 - 24 - x, height: last.y + last.height + 24 - y }
					},
				},
			},
		],
	},
	{
		// The Client: Name column's own menu, opened on hover (bb-column-header): Subtotal, Hide
		// empty values, Add a column…, Remove. Nothing is picked.
		id: 'custom-reports-badge-menu',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openReport(page, h, { Table: true, Chart: false, Matrix: false })
			await page.locator('.columnHeader').first().hover()
			await page.getByText('Hide empty values', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
		},
		mouse: async (page) => {
			const b = await page.locator('.columnHeader').first().boundingBox()
			return { x: b.x + 20, y: b.y + b.height / 2 }
		},
		// The report's title, its filters and the first rows, with the menu over them.
		shots: [{ file: 'custom-reports/column-badge-options.webp', frame: { type: 'box', box: async () => ({ x: 340, y: 110, width: 1080, height: 500 }) } }],
	},
]

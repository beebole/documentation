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

// Revenue at Risk only assesses projects with an end date, and none has one on the account: four
// budgeted projects get an end date for the capture only, and lose it right after (they had no
// validity period before). The report projects from the server's today, so replay always
// reports it changed: compare by eye.
const END_DATES = { 'Data Migration': '2026-10-30', 'Video Production': '2026-11-13', 'Web Portal': '2026-11-30', 'Fleet Tracker': '2026-12-18' }
const setEndDates = async (api, end) => {
	const { getProjects } = await api('{ getProjects { id name } }')
	for (const [name, date] of Object.entries(END_DATES)) {
		const id = getProjects.find((p) => p.name === name).id
		await api('mutation($id: BeeboleId!, $e: BeeboleTimestamp) { editProjectValidityPeriod(id: $id, startTime: null, endTime: $e) { id } }', {
			id,
			e: end ? Date.parse(`${date}T23:59:59.999Z`) : null,
		})
	}
}
const projectEndDates = {
	async up(api) {
		await setEndDates(api, true)
		return {}
	},
	async down(api) {
		await setEndDates(api, false)
	},
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
		// The folder's Filters menu, open on the Absence/working time filter and its three choices.
		// Add filter would save the folder's scope, so nothing is added.
		id: 'reports-folder-record-scope',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openFolder(page, h, 'Current Month', 'Hours by Person')
			await page.getByRole('button', { name: 'Filters', exact: true }).first().click()
			await page.getByText('Absence/working time', { exact: true }).filter({ visible: true }).first().click()
			await page.getByText('Add filter', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		// From the Filters button down to the bottom of its menu.
		shots: [
			{
				file: 'reports/folder-record-scope.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const button = await page.getByRole('button', { name: 'Filters', exact: true }).first().boundingBox()
						const add = await page.getByText('Add filter', { exact: true }).filter({ visible: true }).first().boundingBox()
						const first = await page.getByText('Absence/working time', { exact: true }).filter({ visible: true }).first().boundingBox()
						const x = first.x - 24
						const y = button.y - 16
						return { x, y, width: add.x + add.width + 32 - x, height: add.y + add.height + 28 - y }
					},
				},
			},
		],
	},
	{
		// The Reports section on a phone, reached from the menu (as on the mobile timesheet): the
		// folder and period chips over the Current Month folder's reports. The reports' own sheets
		// are left out: on QA, Absences by person and Margin by Client per Month do not hold what
		// their names say.
		id: 'reports-mobile',
		capturedAt: '2026-10-01',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByRole('button').first().click()
			await page.getByRole('link', { name: 'Reports' }).click()
			await page.getByText('Hours by Person', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 2000)
		},
		mouse: () => ({ x: 380, y: 10 }),
		// The screen down to the last report card: the rest of the phone screen is empty.
		shots: [
			{
				file: 'reports/mobile-report.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const last = await page.getByText('Team Calendar', { exact: true }).filter({ visible: true }).first().boundingBox()
						return { x: 0, y: 0, width: 390, height: last.y + last.height + 56 }
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
	{
		// The Current Month folder's period target opened (choosing nothing changes nothing).
		id: 'reports-period-selector',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openFolder(page, h, 'Current Month', 'Hours by Person')
			const target = page.locator('input').filter({ visible: true })
			for (let i = 0; i < (await target.count()); i++) {
				if ((await target.nth(i).inputValue()) === 'Current') {
					await target.nth(i).click()
					// The click selects the input's text: put the caret at its end (the runner hides it).
					await target.nth(i).evaluate((el) => el.setSelectionRange(el.value.length, el.value.length))
					break
				}
			}
			await page.getByText('Last 12 months', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		// The folder's header, from its name to Share, and the open list.
		shots: [
			{
				file: 'reports/period-filter-controls.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const title = await page.getByText('Current Month', { exact: true }).last().boundingBox()
						const share = await page.getByRole('button', { name: 'Share', exact: true }).first().boundingBox()
						const last = await page.getByText('Custom', { exact: true }).filter({ visible: true }).last().boundingBox()
						const x = title.x - 20
						return { x, y: 0, width: share.x + share.width + 20 - x, height: last.y + last.height + 24 }
					},
				},
			},
		],
	},
	{
		id: 'reports-utilization',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/reports')
			await page.getByRole('button', { name: 'Utilization', exact: true }).click()
			await page.getByText('Ana Pereira', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		shots: [{ file: 'reports/utilization-report.webp', frame: { type: 'full' } }],
	},
	{
		id: 'reports-revenue-at-risk',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		fixture: projectEndDates,
		// The table's columns overflow a 1440 screen, as on Budget Status.
		viewport: { width: 1760, height: 760 },
		async setup(page, h) {
			await h.goto(page, '/reports')
			await page.getByRole('button', { name: 'Revenue at Risk', exact: true }).click()
			await page.getByText('Total at risk', { exact: false }).first().waitFor()
			await h.settle(page, 4000)
		},
		shots: [{ file: 'reports/revenue-at-risk.webp', frame: { type: 'full' } }],
	},
	{
		// A report's ⋯ menu, on Margin by Client per Month (it has a period of its own, so Reset
		// period shows). Send by email is not offered on production hosts: the scene hides it.
		id: 'reports-action-menu',
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
			await page.getByText('Reset period', { exact: true }).filter({ visible: true }).first().waitFor()
			await page.getByText('Send by email', { exact: true }).filter({ visible: true }).evaluateAll((els) =>
				els.forEach((e) => {
					let row = e
					while (row.parentElement && row.parentElement.textContent.trim() === e.textContent.trim()) row = row.parentElement
					row.style.display = 'none'
				})
			)
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 1300, y: 850 }),
		// From the report's title row down to the bottom of its menu.
		shots: [
			{
				file: 'reports/report-action-menu.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Margin by Client per Month', { exact: true }).first().boundingBox()
						const menu = await page
							.getByText('Reset period', { exact: true })
							.filter({ visible: true })
							.first()
							.locator('xpath=ancestor::*[.//*[normalize-space()="Duplicate"]][1]')
							.boundingBox()
						const update = await page.getByRole('button', { name: 'Update', exact: true }).first().boundingBox()
						const x = title.x - 72
						const y = title.y - 28
						return { x, y, width: Math.max(menu.x + menu.width, update.x + update.width) + 32 - x, height: menu.y + menu.height + 28 - y }
					},
				},
			},
		],
	},
	{
		id: 'reports-planned-vs-real',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		// Tall enough for the Over/under plan per person chart under the main one.
		viewport: { width: 1440, height: 1240 },
		// Website Redesign, the project the Main plan tasks belong to (People would read the same
		// Real for everyone, as Real is the time on the tasks' projects).
		async setup(page, h) {
			await h.goto(page, '/reports')
			await page.getByRole('button', { name: 'Planned vs. Real', exact: true }).click()
			await h.settle(page, 3000)
			await page.getByRole('button', { name: 'People', exact: true }).click()
			await page.locator('.pvrAxisMenu').getByText('Client', { exact: true }).hover()
			await h.settle(page, 800)
			await page.locator('.pvrAxisMenu').getByText('Project', { exact: true }).click()
			await h.settle(page, 1500)
			// The project list starts on Acme Corp: Mobile App; Next moves to Website Redesign.
			await page.keyboard.press('Escape')
			await page.getByRole('button', { name: 'Next', exact: true }).click()
			await page.getByText('Acme Corp: Website Redesign').filter({ visible: true }).first().waitFor()
			await h.settle(page, 3000)
			// ECharts draws its lines with an animation timed on the clock, which the runner holds
			// still: the lines would stay undrawn. Moving the fixed time 10 s ahead ends it.
			await page.clock.setFixedTime(new Date(Date.parse(await page.evaluate(() => new Date().toISOString())) + 10000))
			await h.settle(page, 2000)
		},
		shots: [{ file: 'reports/planned-vs-real.webp', frame: { type: 'full' } }],
	},
	{
		// The Current Month folder's Filters popup with Project and "is" picked: the project picker
		// lists the categories first. Nothing is added (Add filter is never clicked).
		id: 'reports-filters',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openFolder(page, h, 'Current Month', 'Hours by Person')
			await page.getByRole('button', { name: 'Filters', exact: true }).first().click()
			const popup = page.locator('div.shadow-lg.fixed.z-50').filter({ hasText: 'Add filter' }).filter({ visible: true }).first()
			await popup.getByText('Project', { exact: true }).click()
			await popup.getByText('is', { exact: true }).click()
			await page.getByText('Internal', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 600, y: 860 }),
		// The Filters button and the popup below it.
		shots: [
			{
				file: 'reports/filters-popup.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const popup = await page.locator('div.shadow-lg.fixed.z-50').filter({ hasText: 'Add filter' }).filter({ visible: true }).first().boundingBox()
						const filters = await page.getByRole('button', { name: 'Filters', exact: true }).first().boundingBox()
						const x = Math.min(popup.x, filters.x) - 24
						return { x, y: 0, width: 1440 - x, height: popup.y + popup.height + 24 }
					},
				},
			},
		],
	},
]

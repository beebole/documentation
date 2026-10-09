// Scenes for help/documentation/gantt.mdx.
export const page = 'help/documentation/gantt.mdx'

import { lockPeriod, openStaffing } from './staffing.mjs'

// Panels are widened to 800 px: at the default width (576 at 1440)
// Plan on non-working days wraps and the dates row is tight.
const PANEL_WIDTH = 800

async function openGantt(page, h) {
	await h.goto(page, '/tasks')
	await page.getByText('Add a view').first().waitFor()
	// The view tabs save the selected view as a person preference (answered by the guard).
	await page.getByText('Gantt', { exact: true }).first().click()
	await page.getByText('Frontend Development', { exact: true }).first().waitFor()
	await h.settle(page, 2000)
}

// The middle of Sophie Laurent's header row, under the week of 5 October.
async function sophieWeekCell(page) {
	// The timeline renders weeks off screen too: take the label inside the visible chart.
	let week = null
	for (const l of await page.getByText('5 - 9', { exact: true }).all()) {
		const b = await l.boundingBox()
		if (b && b.x > 420 && b.x < 1400) week = b
	}
	const owner = await page.locator('gantt-group-header').filter({ hasText: 'Sophie Laurent' }).first().boundingBox()
	return { x: week.x + week.width / 2, y: owner.y + 10 }
}

export const scenes = [
	{
		id: 'gantt-timeline',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openGantt(page, h)
		},
		shots: [{ file: 'gantt/timeline-bars.webp', frame: { type: 'full' } }],
	},
	{
		// Fatima Al-Hassan's Friday booking in the Staffing plan runs 15:00 to 18:00, past her 17:00
		// end of day. Opened from its bar: its id changes whenever the seed is rebuilt.
		id: 'gantt-task-period-timed',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openStaffing(page, h)
			await lockPeriod(page, h, 'Week')
			await page.getByPlaceholder('Search by name').fill('Fatima')
			await h.settle(page, 1500)
			let friday = null
			for (const l of await page.locator('staffing-bar').filter({ visible: true }).all()) {
				const b = await l.locator('*').first().boundingBox()
				if (b && b.x > 330 && (!friday || b.x > friday.b.x)) friday = { l, b }
			}
			await page.mouse.click(friday.b.x + 8, friday.b.y + friday.b.height - 6)
			// Its panel's address would reload the page on the Main plan, whose tasks are the only
			// ones loaded then: the panel is opened in place instead.
			await page.waitForURL(/\/tasks\/[0-9a-f]{24}/)
			await h.settle(page, 1500)
			if (!(await page.getByText('All day', { exact: true }).filter({ visible: true }).count())) {
				await page.getByText('Task details', { exact: true }).filter({ visible: true }).first().click()
			}
			await page.getByText('All day', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
			await h.widenPanel(page, PANEL_WIDTH)
		},
		// Off the side panel, which shows its pin and resize buttons under the mouse.
		mouse: () => ({ x: 400, y: 850 }),
		shots: [{ file: 'gantt/task-period-timed.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Task details', 'Custom fields'), pad: 0 } }],
	},
	{
		id: 'gantt-view-period-menu',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openGantt(page, h)
			// The ⋯ button next to the view tab has no name: it is the tab button's next sibling.
			await page.getByRole('button', { name: 'Gantt', exact: true }).locator('xpath=following-sibling::button[1]').click()
			await h.settle(page, 800)
		},
		// The Period submenu opens while the mouse is on its row.
		async mouse(page) {
			const b = await page.getByText('Period', { exact: true }).filter({ visible: true }).first().boundingBox()
			return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
		},
		// From the view tab down to the bottom of the menu and its submenu.
		shots: [
			{
				file: 'gantt/view-period-weeks.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page, h) => {
						const tab = await page.getByRole('button', { name: 'Gantt', exact: true }).boundingBox()
						const menu = await page.getByText('Period', { exact: true }).filter({ visible: true }).first().boundingBox()
						const sub = await h.stableBox(page, page.locator('bb-submenu'))
						const last = await page.getByText('Delete', { exact: true }).filter({ visible: true }).first().boundingBox()
						const x = Math.min(tab.x, menu.x - 40) - 16
						const y = tab.y - 16
						const bottom = Math.max(sub.y + sub.height, last.y + last.height + 12) + 16
						return { x, y, width: sub.x + sub.width + 16 - x, height: bottom - y }
					},
				},
			},
		],
	},
	{
		id: 'gantt-column-sort-menu',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openGantt(page, h)
			// A column header opens its menu on hover (bb-column-header): rest the mouse on Task Name.
			// The view only shows Row # and Task Name, so its menu has no Hide column.
			const head = page.locator('gantt-column-head').filter({ hasText: 'Task Name' }).first().locator('.columnHeader')
			const b = await head.boundingBox()
			await page.mouse.move(b.x + 10, b.y + b.height / 2)
			await page.waitForTimeout(500)
			await page.mouse.move(b.x + 20, b.y + b.height / 2)
			await page.getByText('Sort ascending', { exact: true }).filter({ visible: true }).first().waitFor({ timeout: 5000 })
			await h.settle(page, 800)
		},
		async mouse(page) {
			const b = await page.locator('gantt-column-head').filter({ hasText: 'Task Name' }).first().locator('.columnHeader').boundingBox()
			return { x: b.x + 20, y: b.y + b.height / 2 }
		},
		// The task columns, from the Row # header down to the sixth row, with the menu open.
		shots: [
			{
				file: 'gantt/column-sort-menu.webp',
				frame: {
					type: 'box',
					pad: 12,
					box: async (page) => {
						const row = await page.locator('gantt-column-head').filter({ hasText: 'Row #' }).first().boundingBox()
						const task = await page.locator('gantt-column-head').filter({ hasText: 'Task Name' }).first().boundingBox()
						const sixth = await page.getByText('App Wireframes', { exact: true }).first().boundingBox()
						// Stop short of the column's right edge, where the timeline starts.
						return { x: row.x, y: row.y, width: task.x + task.width - 14 - row.x, height: sixth.y + sixth.height - row.y }
					},
				},
			},
		],
	},
	{
		// The end handle of App Development dragged onto QA Testing, held before the release: the
		// line follows the pointer and the target bar is highlighted. Nothing is linked.
		id: 'gantt-dependency-drag',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openGantt(page, h)
			const bar = (name) => page.locator('gantt-bar').filter({ hasText: name }).first().locator('.ganttBar').first()
			const source = await bar('App Development').boundingBox()
			// Hovering the bar's right half shows its end handle.
			await page.mouse.move(source.x + source.width - 30, source.y + source.height / 2)
			await h.settle(page, 400)
			await page.mouse.move(source.x + source.width - 12, source.y + source.height / 2)
			await h.settle(page, 400)
			const handle = await page.locator('gantt-bar').filter({ hasText: 'App Development' }).first().locator('button.cursor-alias').first().boundingBox()
			await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
			await page.mouse.down()
			const target = await bar('QA Testing').boundingBox()
			await page.mouse.move(target.x + 60, target.y + target.height / 2, { steps: 20 })
			await h.settle(page, 800)
		},
		async mouse(page) {
			const target = await page.locator('gantt-bar').filter({ hasText: 'QA Testing' }).first().locator('.ganttBar').first().boundingBox()
			return { x: target.x + 60, y: target.y + target.height / 2 }
		},
		// Released away from any bar, the handle stays armed (no link): Escape then disarms it.
		async teardown(page) {
			await page.mouse.move(700, 60, { steps: 10 })
			await page.mouse.up()
			await page.keyboard.press('Escape')
		},
		// The task columns and the timeline, from Row # down to System Analysis.
		shots: [
			{
				file: 'gantt/dependency-drag.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const head = await page.locator('gantt-column-head').filter({ hasText: 'Row #' }).first().boundingBox()
						const last = await page.getByText('System Analysis', { exact: true }).first().boundingBox()
						const x = head.x - 8
						return { x, y: head.y - 50, width: 1180 - x, height: last.y + last.height + 12 - (head.y - 50) }
					},
				},
			},
		],
	},
	{
		// Grouped by Owner: each owner's header row carries a load bar per week. Sophie Laurent owns
		// most of the Main plan and is booked past her capacity; the mouse rests on her week of
		// 5 October to show its tooltip (the grouping is a view setting, answered by the runner).
		id: 'gantt-workload-heatmap',
		capturedAt: '2026-10-09',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openGantt(page, h)
			await page.getByRole('button', { name: 'Gantt', exact: true }).locator('xpath=following-sibling::button[1]').click()
			await page.getByText('Group by', { exact: true }).filter({ visible: true }).first().hover()
			await h.settle(page, 500)
			await page.locator('bb-submenu').getByText('Owner', { exact: true }).filter({ visible: true }).first().click()
			await page.keyboard.press('Escape')
			await page.locator('bb-load-bar').first().waitFor()
			await h.settle(page, 2000)
			// The tooltip opens on mouseenter: come into the cell from the task row below it.
			const { x, y } = await sophieWeekCell(page)
			await page.mouse.move(x, y + 40)
			await page.mouse.move(x, y, { steps: 8 })
			await h.settle(page, 1000)
			await h.settle(page, 800)
		},
		mouse: (page) => sophieWeekCell(page),
		shots: [{ file: 'gantt/workload-heatmap.webp', frame: { type: 'full' } }],
	},
	{
		// The view tab's ⋯ menu with the Columns submenu open (hovering changes nothing).
		id: 'gantt-columns-menu',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openGantt(page, h)
			await page.getByRole('button', { name: 'Gantt', exact: true }).locator('xpath=following-sibling::button[1]').click()
			await h.settle(page, 800)
		},
		// The Columns submenu opens while the mouse is on its row.
		async mouse(page) {
			const b = await page.getByText('Columns', { exact: true }).filter({ visible: true }).first().boundingBox()
			return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
		},
		// From the view tab down to the bottom of the menu and its submenu.
		shots: [
			{
				file: 'gantt/columns-menu.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page, h) => {
						const tab = await page.getByRole('button', { name: 'Gantt', exact: true }).boundingBox()
						const menu = await page.getByText('Columns', { exact: true }).filter({ visible: true }).first().boundingBox()
						const sub = await h.stableBox(page, page.locator('bb-submenu'))
						const last = await page.getByText('Delete', { exact: true }).filter({ visible: true }).first().boundingBox()
						const x = Math.min(tab.x, menu.x - 40) - 16
						const y = tab.y - 16
						const bottom = Math.max(sub.y + sub.height, last.y + last.height + 12) + 16
						return { x, y, width: sub.x + sub.width + 16 - x, height: bottom - y }
					},
				},
			},
		],
	},
	{
		// The Planned column added from the view tab's Columns menu (a view setting, answered by
		// the runner), with its unit button in the header.
		id: 'gantt-planned-column',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openGantt(page, h)
			await page.getByRole('button', { name: 'Gantt', exact: true }).locator('xpath=following-sibling::button[1]').click()
			await page.getByText('Columns', { exact: true }).filter({ visible: true }).first().hover()
			await h.settle(page, 500)
			await page.locator('bb-submenu').getByText('Planned', { exact: true }).filter({ visible: true }).first().click()
			await page.keyboard.press('Escape')
			await page.locator('gantt-column-head').filter({ hasText: 'Planned' }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 1300, y: 40 }),
		// The task columns, from the Row # header down to row 10.
		shots: [
			{
				file: 'gantt/planned-column.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const row = await page.locator('gantt-column-head').filter({ hasText: 'Row #' }).first().boundingBox()
						const planned = await page.locator('gantt-column-head').filter({ hasText: 'Planned' }).first().boundingBox()
						// Down to the row numbered 10, found in the Row # column.
						let tenth = null
						for (const l of await page.getByText('10', { exact: true }).all()) {
							const b = await l.boundingBox()
							if (b && Math.abs(b.x + b.width / 2 - (row.x + row.width / 2)) < row.width) tenth = b
						}
						// Stop short of the column's right edge, where the timeline starts.
						const x = row.x - 12
						const y = row.y - 12
						return { x, y, width: planned.x + planned.width - 4 - x, height: tenth.y + tenth.height + 10 - y }
					},
				},
			},
		],
	},
]

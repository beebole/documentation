// Scenes for help/documentation/gantt.mdx.
export const page = 'help/documentation/gantt.mdx'

import { lockPeriod, openStaffing } from './staffing.mjs'

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
	{
		// Fatima Al-Hassan's Friday booking in the Staffing plan runs 15:00 to 18:00, past her 17:00
		// end of day. Opened from its bar: its id changes whenever the seed is rebuilt.
		id: 'gantt-task-period-timed',
		capturedAt: '2026-09-30',
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
		},
		shots: [{ file: 'gantt/task-period-timed.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Task details', 'Custom fields'), pad: 0 } }],
	},
	{
		id: 'gantt-view-period-menu',
		capturedAt: '2026-09-30',
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
]

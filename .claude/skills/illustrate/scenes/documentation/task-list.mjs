// Scenes for help/documentation/task-list.mdx.
export const page = 'help/documentation/task-list.mdx'

// A new List view on the Main plan with the given columns (a new List view shows Row # and
// Task Name only). Adding the view and its columns are view preferences, answered by the guard.
async function openListView(page, h, columns) {
	await h.goto(page, '/tasks')
	await page.getByText('Add a view').first().waitFor()
	await page.getByText('Add a view').first().click()
	await h.settle(page, 800)
	await page.getByText('List', { exact: true }).filter({ visible: true }).first().click()
	await page.getByText('Requirements Gathering', { exact: true }).first().waitFor()
	await h.settle(page, 1500)
	// Columns from the active tab's menu. The ⋯ button next to the tab has no name: it is the tab button's next sibling.
	const menu = page.getByRole('button', { name: 'List', exact: true }).locator('xpath=following-sibling::button[1]')
	for (const column of columns) {
		await menu.click()
		await page.getByText('Columns', { exact: true }).filter({ visible: true }).first().hover()
		await h.settle(page, 500)
		await page.getByText(column, { exact: true }).filter({ visible: true }).last().click()
		await page.keyboard.press('Escape')
		await h.settle(page, 800)
	}
}

// The Dates cells clamp each task to its owner's working days once the work schedules have
// loaded: until then Frontend Development shows its stored start, Saturday 29 Aug. Wait for the
// clamped value, Monday 31 Aug.
async function waitForWorkingDays(page, h) {
	await page.getByText('31 Aug → 29 Oct').filter({ visible: true }).first().waitFor({ timeout: 20000 })
	await h.settle(page, 1000)
}

// A task row's box and its last two buttons, Done and Delete (unnamed icon buttons at the row's
// end, named by their tooltips). The row is the first ancestor of the task's name wider than 1000 px.
async function rowButtons(page, task) {
	return page
		.getByText(task, { exact: true })
		.filter({ visible: true })
		.first()
		.evaluate((leaf) => {
			let row = leaf
			while (row && row.getBoundingClientRect().width < 1000) row = row.parentElement
			const box = (e) => {
				const r = e.getBoundingClientRect()
				return { x: r.x, y: r.y, width: r.width, height: r.height }
			}
			const buttons = [...row.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().width > 0)
			return { row: box(row), done: box(buttons.at(-2)), del: box(buttons.at(-1)) }
		})
}

// Grouping by Status and back to None renders the rows again, so the Dates cells pick up the
// loaded work schedules (as in task-list-selection); then wait for the clamped dates.
async function settleDates(page, h) {
	const menu = page.getByRole('button', { name: 'List', exact: true }).locator('xpath=following-sibling::button[1]')
	for (const grouping of ['Status', 'None']) {
		await menu.click()
		await page.getByText('Group by', { exact: true }).filter({ visible: true }).first().hover()
		await h.settle(page, 500)
		await page.locator('bb-submenu').getByText(grouping, { exact: true }).filter({ visible: true }).first().click()
		await page.keyboard.press('Escape')
		await h.settle(page, 1500)
	}
	await waitForWorkingDays(page, h)
}

export const scenes = [
	{
		id: 'task-list-view',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openListView(page, h, ['Owner', 'Dates', 'Planned', 'Client', 'Status'])
			// Sorted by Dates, ascending: the header shows its arrow.
			// Clicked at its position: the header's resize handle takes the pointer over the text.
			const dates = await page.getByText('Dates', { exact: true }).filter({ visible: true }).first().boundingBox()
			await page.mouse.click(dates.x + dates.width / 2, dates.y + dates.height / 2)
			await h.settle(page, 1500)
		},
		shots: [{ file: 'planning/task-list-view.webp', frame: { type: 'full' } }],
	},
	{
		// The List grouped by Status: one header per status with its badge and task count.
		id: 'task-list-grouped',
		capturedAt: '2026-10-09',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openListView(page, h, ['Owner', 'Dates', 'Status'])
			const menu = page.getByRole('button', { name: 'List', exact: true }).locator('xpath=following-sibling::button[1]')
			await menu.click()
			await page.getByText('Group by', { exact: true }).filter({ visible: true }).first().hover()
			await h.settle(page, 500)
			await page.locator('bb-submenu').getByText('Status', { exact: true }).filter({ visible: true }).first().click()
			await page.keyboard.press('Escape')
			await waitForWorkingDays(page, h)
		},
		// Off the rows, which show their controls under the mouse.
		mouse: () => ({ x: 1300, y: 40 }),
		shots: [{ file: 'planning/task-list-grouped.webp', frame: { type: 'full' } }],
	},
	{
		// Three rows ⌘-clicked into a selection (nothing is changed until a value is edited).
		id: 'task-list-selection',
		capturedAt: '2026-10-09',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openListView(page, h, ['Owner', 'Dates', 'Status'])
			// Grouping by Status and back to None renders the rows again, so the Dates cells pick
			// up the loaded work schedules (nothing else re-renders them).
			const menu = page.getByRole('button', { name: 'List', exact: true }).locator('xpath=following-sibling::button[1]')
			for (const grouping of ['Status', 'None']) {
				await menu.click()
				await page.getByText('Group by', { exact: true }).filter({ visible: true }).first().hover()
				await h.settle(page, 500)
				await page.locator('bb-submenu').getByText(grouping, { exact: true }).filter({ visible: true }).first().click()
				await page.keyboard.press('Escape')
				await h.settle(page, 1500)
			}
			await waitForWorkingDays(page, h)
			for (const name of ['Requirements Gathering', 'System Analysis', 'UI/UX Design']) {
				await page.getByText(name, { exact: true }).first().click({ modifiers: ['Meta'] })
				await h.settle(page, 400)
			}
			await h.settle(page, 1000)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		// Off the rows, which show their controls under the mouse.
		mouse: () => ({ x: 1300, y: 40 }),
		// The top of the table, down to the tenth row.
		shots: [{ file: 'planning/task-list-selection.webp', frame: { type: 'clip', x: 72, y: 0, width: 1368, height: 560 } }],
	},
	{
		// The view tab's ⋯ menu with the Columns submenu open (hovering changes nothing): the
		// columns shown first with their tick, the others below, each with its pin button.
		id: 'task-list-columns-menu',
		capturedAt: '2026-10-09',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openListView(page, h, ['Owner', 'Dates', 'Status'])
			await settleDates(page, h)
			await page.getByRole('button', { name: 'List', exact: true }).locator('xpath=following-sibling::button[1]').click()
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
				file: 'planning/task-list-columns-menu.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page, h) => {
						const tab = await page.getByRole('button', { name: 'List', exact: true }).boundingBox()
						const sub = await h.stableBox(page, page.locator('bb-submenu'))
						const menu = await page
							.getByText('Columns', { exact: true })
							.filter({ visible: true })
							.first()
							.evaluate((leaf) => {
								let el = leaf
								while (el && !['fixed', 'absolute'].includes(getComputedStyle(el).position)) el = el.parentElement ?? el.getRootNode().host
								const r = el.getBoundingClientRect()
								return { x: r.x, y: r.y, width: r.width, height: r.height }
							})
						const x = Math.min(tab.x, menu.x) - 16
						const y = tab.y - 16
						const right = Math.max(sub.x + sub.width, menu.x + menu.width) + 16
						const bottom = Math.max(sub.y + sub.height, menu.y + menu.height) + 16
						return { x, y, width: right - x, height: bottom - y }
					},
				},
			},
		],
	},
	{
		// The mouse on an In progress row: its Done and Delete buttons brighten at the row's end
		// (hovering changes nothing). A lens on its Done button.
		id: 'task-list-row-actions',
		capturedAt: '2026-10-09',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openListView(page, h, ['Owner', 'Dates', 'Status'])
			await settleDates(page, h)
			// Mark the row's Done button (its next-to-last button) for the lens: a DOM attribute only.
			await page
				.getByText('App Development', { exact: true })
				.filter({ visible: true })
				.first()
				.evaluate((leaf) => {
					let row = leaf
					while (row && row.getBoundingClientRect().width < 1000) row = row.parentElement
					const buttons = [...row.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().width > 0)
					buttons.at(-2).setAttribute('data-docs-lens', '')
				})
		},
		async mouse(page) {
			const { row } = await rowButtons(page, 'App Development')
			return { x: 1200, y: row.y + row.height / 2 }
		},
		shots: [
			{
				file: 'planning/task-list-row-actions.webp',
				frame: {
					type: 'lens',
					// The Done button, marked by setup.
					target: (page) => page.locator('[data-docs-lens]'),
					context: { x: 480, y: 80, width: 960, height: 480 },
				},
			},
		],
	},
]

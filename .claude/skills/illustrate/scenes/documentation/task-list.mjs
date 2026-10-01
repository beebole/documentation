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
	await page.getByText('31 Aug → 29 Oct').first().waitFor({ timeout: 20000 })
	await h.settle(page, 1000)
}

export const scenes = [
	{
		id: 'task-list-view',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			// Planned is left out: the documentation account's tasks have no planned time yet.
			await openListView(page, h, ['Owner', 'Dates', 'Client', 'Status'])
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
		capturedAt: '2026-10-01',
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
		capturedAt: '2026-10-01',
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
]

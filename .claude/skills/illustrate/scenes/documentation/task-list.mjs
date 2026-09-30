// Scenes for help/documentation/task-list.mdx.
export const page = 'help/documentation/task-list.mdx'

export const scenes = [
	{
		id: 'task-list-view',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/tasks')
			await page.getByText('Add a view').first().waitFor()
			await page.getByText('Add a view').first().click()
			await h.settle(page, 800)
			await page.getByText('List', { exact: true }).filter({ visible: true }).first().click()
			await page.getByText('Requirements Gathering', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
			// Columns from the active tab's menu (a new List view shows Row # and Task Name only).
			// Planned is left out: the documentation account's tasks have no planned time yet.
			// The ⋯ button next to the tab has no name: it is the tab button's next sibling.
			const menu = page.getByRole('button', { name: 'List', exact: true }).locator('xpath=following-sibling::button[1]')
			for (const column of ['Owner', 'Dates', 'Client', 'Status']) {
				await menu.click()
				await page.getByText('Columns', { exact: true }).filter({ visible: true }).first().hover()
				await h.settle(page, 500)
				await page.getByText(column, { exact: true }).filter({ visible: true }).last().click()
				await page.keyboard.press('Escape')
				await h.settle(page, 800)
			}
			// Sorted by Dates, ascending: the header shows its arrow.
			// Clicked at its position: the header's resize handle takes the pointer over the text.
			const dates = await page.getByText('Dates', { exact: true }).filter({ visible: true }).first().boundingBox()
			await page.mouse.click(dates.x + dates.width / 2, dates.y + dates.height / 2)
			await h.settle(page, 1500)
		},
		shots: [{ file: 'planning/task-list-view.webp', frame: { type: 'full' } }],
	},
]

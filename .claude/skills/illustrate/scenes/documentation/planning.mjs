// Scenes for help/documentation/planning.mdx.
export const page = 'help/documentation/planning.mdx'

// Panels are widened to 800 px: at the default width (576 at 1440)
// Plan on non-working days wraps and the dates row is tight.
const PANEL_WIDTH = 800

// The view tabs save the selected view as a person preference (answered by the runner's guard).
async function openView(page, h, name) {
	await h.goto(page, '/tasks')
	await page.getByText('Add a view').first().waitFor()
	await page.getByText(name, { exact: true }).first().click()
}

export const scenes = [
	{
		id: 'planning-kanban-view',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openView(page, h, 'Kanban')
			// Column and card titles are editable fields: wait for a card's project line instead.
			await page.getByText('Silverline Retail: E-commerce Platform', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'planning/kanban-view.webp', frame: { type: 'full' } }],
	},
	{
		id: 'planning-settings-dialog',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openView(page, h, 'Kanban')
			const header = page.getByRole('heading', { name: /Planning/ }).locator('xpath=..')
			await (await h.byTooltip(page, header, 'Main plan settings')).click()
			await page.getByText('What this planning holds').first().waitFor()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'planning/planning-settings-dialog.webp', frame: { type: 'box', box: (page, h) => h.surfaceAround(page, 'What this planning holds'), pad: 24 } }],
	},
	{
		id: 'planning-add-task-panel',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openView(page, h, 'Kanban')
			await page.getByText('Silverline Retail: E-commerce Platform', { exact: true }).first().waitFor()
			await page.getByRole('button', { name: 'Add Task' }).first().click()
			await page.getByText('Or add multiple entries').first().waitFor()
			await h.settle(page, 1000)
		},
		// Off the side panel, which shows its pin and resize buttons under the mouse.
		mouse: () => ({ x: 400, y: 850 }),
		// The side panel, from its top to below the Paste button.
		shots: [
			{
				file: 'planning/add-task-panel.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const paste = await page.getByRole('button', { name: 'Paste', exact: true }).filter({ visible: true }).first().boundingBox()
						const left = await page.evaluate(() => {
							let el = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Add new task')
							while (el && !(el.getBoundingClientRect().height >= window.innerHeight - 1 && el.getBoundingClientRect().width < 800)) el = el.parentElement
							return el ? el.getBoundingClientRect().x : null
						})
						if (left == null) throw new Error('side panel not found')
						return { x: left, y: 0, width: 1440 - left, height: paste.y + paste.height + 32 }
					},
				},
			},
		],
	},
	{
		// QA Testing's Task details: whole days between the two lock buttons, 60 h planned with the
		// capacity pill, and the overload warning (Sophie Laurent's other tasks overlap it). Opened
		// from its card.
		id: 'planning-task-schedule-panel',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openView(page, h, 'Kanban')
			await page.getByText('Silverline Retail: E-commerce Platform', { exact: true }).first().waitFor()
			await page.getByText('QA Testing', { exact: true }).first().click()
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
		shots: [{ file: 'planning/task-schedule-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Task details', 'Custom fields') } }],
	},
]

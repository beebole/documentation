// Scenes for help/documentation/kanban.mdx.
export const page = 'help/documentation/kanban.mdx'

const queueHeader = (page) => page.locator('kanban-column-header').filter({ hasText: 'Queue' }).first()

export const scenes = [
	{
		id: 'kanban-column-menu',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/tasks')
			await page.getByText('Add a view').first().waitFor()
			// The view tabs save the selected view as a person preference (answered by the guard).
			await page.getByText('Kanban', { exact: true }).first().click()
			await page.getByText('QA Testing', { exact: true }).first().waitFor()
			await h.settle(page, 2000)
			// The Queue column's ⋯ menu (opening it changes nothing).
			await queueHeader(page).locator('bb-action-menu-button button').first().click()
			await page.getByText('Move entries to right', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		// The Queue and In progress columns' heads and first cards, with the menu open over them.
		shots: [
			{
				file: 'kanban/column-menu.webp',
				frame: {
					type: 'box',
					pad: 16,
					box: async (page) => {
						const head = await queueHeader(page).boundingBox()
						// The menu is a positioned popup around its entries.
						const menu = await page
							.getByText('Move entries to right', { exact: true })
							.filter({ visible: true })
							.first()
							.evaluate((leaf) => {
								let el = leaf
								while (el && !['fixed', 'absolute'].includes(getComputedStyle(el).position)) el = el.parentElement ?? el.getRootNode().host
								const r = el.getBoundingClientRect()
								return { x: r.x, y: r.y, width: r.width, height: r.height }
							})
						const x = head.x
						const right = Math.max(head.x + head.width, menu.x + menu.width)
						return { x, y: head.y, width: right - x, height: Math.max(head.y + head.height, menu.y + menu.height) - head.y }
					},
				},
			},
		],
	},
]

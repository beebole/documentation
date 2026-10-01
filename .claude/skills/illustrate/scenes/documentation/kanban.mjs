// Scenes for help/documentation/kanban.mdx.
export const page = 'help/documentation/kanban.mdx'

const queueHeader = (page) => page.locator('kanban-column-header').filter({ hasText: 'Queue' }).first()

// Queue holds three tasks: for the capture, its limit (Max tasks) is set to 3 through the API and
// cleared right after.
const queueStatus = async (api) =>
	(await api('{ getTaskCategories { name statuses { id name } } }')).getTaskCategories.find((c) => c.name === 'Main plan').statuses.find((s) => s.name === 'Queue').id
const setQueueLimit = async (api, max) =>
	api('mutation($id: BeeboleId!, $max: Int) { editTaskCategoryStatusMaxConcurrentTasks(statusId: $id, maxConcurrentTasks: $max) { id } }', { id: await queueStatus(api), max })
const queueLimit = {
	async up(api) {
		await setQueueLimit(api, 3)
		return {}
	},
	async down(api) {
		await setQueueLimit(api, null)
	},
}

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
	{
		// A card from In progress dragged over Queue, which is at its limit: the column border turns
		// red while the card hovers it. Nothing is dropped.
		id: 'kanban-wip-limit',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		fixture: queueLimit,
		async setup(page, h) {
			await h.goto(page, '/tasks')
			await page.getByText('Add a view').first().waitFor()
			await page.getByText('Kanban', { exact: true }).first().click()
			await page.getByText('QA Testing', { exact: true }).first().waitFor()
			await queueHeader(page).getByText('3/3').waitFor()
			await h.settle(page, 2000)
			const card = await page.getByText('Frontend Development', { exact: true }).first().boundingBox()
			const target = await page.getByText('Fleet Rollout', { exact: true }).first().boundingBox()
			await page.mouse.move(card.x + 40, card.y + 8)
			await page.mouse.down()
			await page.mouse.move(card.x + 60, card.y + 30, { steps: 5 })
			await page.mouse.move(target.x + 40, target.y + 120, { steps: 20 })
			await h.settle(page, 800)
		},
		// The mouse stays where the drag hovers, with the button still down.
		async mouse(page) {
			const target = await page.getByText('Fleet Rollout', { exact: true }).first().boundingBox()
			return { x: target.x + 40, y: target.y + 120 }
		},
		// Dropped back where it came from, the card does not move.
		async teardown(page) {
			const card = await page.getByText('Frontend Development', { exact: true }).first().boundingBox()
			await page.mouse.move(card.x + 40, card.y + 8, { steps: 20 })
			await page.mouse.up()
		},
		// The Backlog, Queue and In progress columns, down to In progress's third card.
		shots: [
			{
				file: 'kanban/wip-limit-rejected.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const column = (name) => page.locator('.kanban-column').filter({ has: page.locator('kanban-column-header').filter({ hasText: name }) }).first().boundingBox()
						const backlog = await column('Backlog')
						const progress = await column('In progress')
						const third = await page.getByText('Acme Corp: Mobile App', { exact: true }).first().boundingBox()
						const x = backlog.x - 16
						return { x, y: backlog.y - 16, width: progress.x + progress.width + 16 - x, height: third.y + third.height + 28 - (backlog.y - 16) }
					},
				},
			},
		],
	},
]

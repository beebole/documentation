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

// Time can only be recorded on the plannings listed in Timesheet and Planning Settings, and the
// seed lists none (the account logs against projects): no card shows its clock. For the capture,
// the Main plan is listed and Jordan Reed (signed in) logs 4 h on Frontend Development today, so
// its card shows the logged pill (logged / planned, in hours); both are undone right after.
const LOGGED = { task: 'Frontend Development', hours: 4 }
const cardTime = {
	async up(api, { date }) {
		const { getTaskCategories, getTasks, getPersons } = await api('{ getTaskCategories { id name } getTasks { id name } getPersons { id name } }')
		await api('mutation($c: [BeeboleId!]!) { editOrganisationTimeSettingsTaskCategories(taskCategories: $c) { id } }', {
			c: [getTaskCategories.find((c) => c.name === 'Main plan').id],
		})
		const day = Date.parse(`${date}T00:00:00Z`)
		const { addTimeRecord } = await api(
			'mutation($s: BeeboleTimestamp!, $d: Float!, $p: BeeboleId!, $t: BeeboleId!) { addTimeRecord(startTime: $s, endTime: $s, duration: $d, personId: $p, taskId: $t) { id } }',
			{ s: day, d: LOGGED.hours * 3600000, p: getPersons.find((p) => p.name === 'Jordan Reed').id, t: getTasks.find((t) => t.name === LOGGED.task).id }
		)
		return { ids: [addTimeRecord.id] }
	},
	async down(api, state) {
		if (state?.ids?.length) await api('mutation($ids: [BeeboleId!]!) { deleteTimeRecords(ids: $ids) { id } }', { ids: state.ids })
		await api('mutation { editOrganisationTimeSettingsTaskCategories(taskCategories: []) { id } }')
	},
}

// Box of the positioned popup around a menu entry (as for the column menu above).
const menuBox = (page, text) =>
	page
		.getByText(text, { exact: true })
		.filter({ visible: true })
		.first()
		.evaluate((leaf) => {
			let el = leaf
			while (el && !['fixed', 'absolute'].includes(getComputedStyle(el).position)) el = el.parentElement ?? el.getRootNode().host
			const r = el.getBoundingClientRect()
			return { x: r.x, y: r.y, width: r.width, height: r.height }
		})

async function openKanban(page, h) {
	await h.goto(page, '/tasks')
	await page.getByText('Add a view').first().waitFor()
	// The view tabs save the selected view as a person preference (answered by the guard).
	await page.getByText('Kanban', { exact: true }).first().click()
	await page.getByText('QA Testing', { exact: true }).first().waitFor()
	await h.settle(page, 2000)
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
	{
		// The In progress column: Frontend Development carries its logged pill, and the mouse on
		// Backend Development shows that card's clock (Add time).
		id: 'kanban-card-add-time',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		fixture: cardTime,
		async setup(page, h) {
			await h.goto(page, '/tasks')
			await page.getByText('Add a view').first().waitFor()
			await page.getByText('Kanban', { exact: true }).first().click()
			await page.getByText('QA Testing', { exact: true }).first().waitFor()
			await page.getByText('4 / 200', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1000)
			await h.settle(page, 2000)
		},
		async mouse(page) {
			const b = await page.getByText('Backend Development', { exact: true }).first().boundingBox()
			return { x: b.x + 120, y: b.y + 30 }
		},
		shots: [
			{
				file: 'kanban/card-add-time.webp',
				// The column's head and its first two cards.
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const column = await page.locator('.kanban-column').filter({ has: page.locator('kanban-column-header').filter({ hasText: 'In progress' }) }).first().boundingBox()
						const third = await page.getByText('App Development', { exact: true }).first().boundingBox()
						return { x: column.x - 12, y: column.y - 12, width: column.width + 24, height: third.y - 14 - (column.y - 12) }
					},
				},
			},
		],
	},
	{
		// The view tab's ⋯ menu with the Show submenu open (hovering changes nothing).
		id: 'kanban-show-fields-menu',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openKanban(page, h)
			await page.getByRole('button', { name: 'Kanban', exact: true }).locator('xpath=following-sibling::button[1]').click()
			await h.settle(page, 800)
		},
		// The Show submenu opens while the mouse is on its row.
		async mouse(page) {
			const b = await page.getByText('Show', { exact: true }).filter({ visible: true }).first().boundingBox()
			return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
		},
		// From the view tab down to the bottom of the menu and its submenu.
		shots: [
			{
				file: 'kanban/show-fields-menu.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page, h) => {
						const tab = await page.getByRole('button', { name: 'Kanban', exact: true }).boundingBox()
						const sub = await h.stableBox(page, page.locator('bb-submenu'))
						const menu = await menuBox(page, 'Show')
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
		// A card's ⋯ menu, opened on hover (opening it changes nothing).
		id: 'kanban-card-menu',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openKanban(page, h)
			const card = page.locator('kanban-card').filter({ hasText: 'QA Testing' }).first()
			await card.hover()
			await h.settle(page, 400)
			await card.locator('bb-action-menu-button button').first().click()
			await page.getByText('Duplicate', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		async mouse(page) {
			const b = await page.getByText('Duplicate', { exact: true }).filter({ visible: true }).first().boundingBox()
			return { x: b.x + b.width + 40, y: b.y - 60 }
		},
		// The Queue column's head and first card, with the menu open beside it.
		shots: [
			{
				file: 'kanban/card-menu.webp',
				frame: {
					type: 'box',
					pad: 16,
					box: async (page, h) => {
						const head = await queueHeader(page).boundingBox()
						const card = await page.locator('kanban-card').filter({ hasText: 'QA Testing' }).first().boundingBox()
						const menu = await menuBox(page, 'Duplicate')
						const x = Math.min(head.x, menu.x)
						const right = Math.max(head.x + head.width, menu.x + menu.width)
						const bottom = Math.max(card.y + card.height, menu.y + menu.height)
						return { x, y: head.y, width: right - x, height: bottom - head.y }
					},
				},
			},
		],
	},
]

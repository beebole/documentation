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

// Two subtasks under Frontend Development, for the capture only: they split its period and its
// 200 hours, so the parent's rolled-up bar and total read as before. `down` deletes them by name,
// then writes the parent's own period and hours back: deleting its last children clears the
// parent's dates (seen 2026-10-02, it then dropped out of Planned vs. Real and the Gantt).
const SUBTASKS = [
	{ name: 'Component Library', start: '2026-08-29', end: '2026-09-28', hours: 90 },
	{ name: 'Page Templates', start: '2026-09-29', end: '2026-10-29', hours: 110 },
]
const PARENT = { start: '2026-08-29', end: '2026-10-29', hours: 200 }
const subtasks = {
	async up(api) {
		const { getTasks } = await api('{ getTasks { id name category { id } status { id } } }')
		const parent = getTasks.find((t) => t.name === 'Frontend Development')
		const ids = []
		for (const t of SUBTASKS) {
			const { addTask } = await api('mutation($n: BeeboleName!, $c: BeeboleId!, $p: BeeboleId, $s: BeeboleId) { addTask(name: $n, categoryId: $c, parentId: $p, statusId: $s) { id } }', {
				n: t.name,
				c: parent.category.id,
				p: parent.id,
				s: parent.status?.id,
			})
			ids.push(addTask.id)
			await api('mutation($id: BeeboleId!, $s: BeeboleTimestamp!, $e: BeeboleTimestamp!, $f: Float) { editTaskPeriod(id: $id, startTime: $s, endTime: $e, effort: $f) { id } }', {
				id: addTask.id,
				s: Date.parse(`${t.start}T00:00:00Z`),
				e: Date.parse(`${t.end}T23:59:59.999Z`),
				f: t.hours * 3600000,
			})
		}
		return { ids }
	},
	async down(api) {
		const { getTasks } = await api('{ getTasks { id name } }')
		for (const t of getTasks.filter((t) => SUBTASKS.some((s) => s.name === t.name))) await api('mutation($id: BeeboleId!) { deleteTask(id: $id) { id } }', { id: t.id })
		await api('mutation($id: BeeboleId!, $s: BeeboleTimestamp!, $e: BeeboleTimestamp!, $f: Float) { editTaskPeriod(id: $id, startTime: $s, endTime: $e, effort: $f) { id } }', {
			id: getTasks.find((t) => t.name === 'Frontend Development').id,
			s: Date.parse(`${PARENT.start}T00:00:00Z`),
			e: Date.parse(`${PARENT.end}T23:59:59.999Z`),
			f: PARENT.hours * 3600000,
		})
	},
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
	{
		// The planning name at the top of the page opens the menu of plannings, with the field
		// that creates a new one.
		id: 'planning-switch-menu',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openView(page, h, 'Kanban')
			await page.getByText('Silverline Retail: E-commerce Platform', { exact: true }).first().waitFor()
			await page.locator('bb-category button.text-2xl').filter({ visible: true }).first().click()
			await page.getByPlaceholder('Name of a new planning').waitFor()
			await h.settle(page, 1000)
		},
		// From the page title to the bottom of the menu, Add Task included.
		shots: [
			{
				file: 'planning/planning-switch-menu.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page, h) => {
						const title = await page.getByRole('heading', { name: /Planning/ }).first().boundingBox()
						const add = await page.getByRole('button', { name: 'Add Task' }).first().boundingBox()
						const menu = await h.surfaceAround(page, 'Staffing plan')
						const x = title.x - 16
						const y = title.y - 16
						return { x, y, width: add.x + add.width + 16 - x, height: menu.y + menu.height + 16 - y }
					},
				},
			},
		],
	},
	{
		// The Gantt of Main plan with Frontend Development expanded to its two subtasks (fixture).
		id: 'planning-subtasks',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		fixture: subtasks,
		async setup(page, h) {
			await openView(page, h, 'Gantt')
			await page.getByText('Frontend Development', { exact: true }).first().waitFor()
			await h.settle(page, 2000)
			// The chevron in front of the parent's name; the app remembers expanded rows (idempotent).
			const parent = page.locator('gantt-task-name').filter({ hasText: 'Frontend Development' }).first()
			if (!(await page.getByText('Component Library', { exact: true }).first().isVisible())) await parent.getByRole('button').first().click()
			await page.getByText('Page Templates', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		// In the page header, off the Gantt: its rows and days show tooltips under the mouse.
		mouse: () => ({ x: 1300, y: 40 }),
		// From the month pills down to App Development, across the task list and the timeline.
		shots: [
			{
				file: 'planning/subtasks-gantt.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const head = await page.locator('gantt-column-head').filter({ hasText: 'Row #' }).first().boundingBox()
						const last = await page.getByText('App Development', { exact: true }).first().boundingBox()
						const x = head.x - 16
						const y = head.y - 56
						return { x, y, width: 1440 - 16 - x, height: last.y + last.height + 14 - y }
					},
				},
			},
		],
	},
]

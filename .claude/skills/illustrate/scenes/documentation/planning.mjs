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
	{
		// The Add Task panel after Paste: the Paste button reads the clipboard, which the scene
		// answers with a short task list, one subtask level indented. Nothing is imported.
		id: 'planning-add-multiple-tasks',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openView(page, h, 'Kanban')
			await page.getByText('Silverline Retail: E-commerce Platform', { exact: true }).first().waitFor()
			await page.getByRole('button', { name: 'Add Task' }).first().click()
			await page.getByText('Or add multiple entries').first().waitFor()
			await page.evaluate(() => {
				const list = 'Launch Campaign\n\tLanding Page\n\tEmail Sequence\n\tPaid Ads Setup\nCustomer Onboarding Guide'
				Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { readText: async () => list } })
			})
			await page.getByRole('button', { name: 'Paste', exact: true }).filter({ visible: true }).first().click()
			await page.getByText('Launch Campaign', { exact: true }).first().waitFor()
			// Expand the parent: its toggle is the row button without a data-path (delete).
			const toggles = page.locator('entity-paste button.bb-btn-action:not([data-path])')
			for (let i = 0; i < (await toggles.count()); i++) await toggles.nth(i).click()
			await page.getByText('Paid Ads Setup', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		mouse: () => ({ x: 400, y: 850 }),
		// The side panel, from its top to below Import entries.
		shots: [
			{
				file: 'planning/add-multiple-tasks.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const importButton = await page.getByRole('button', { name: /^Import entries/ }).filter({ visible: true }).first().boundingBox()
						const left = await page.evaluate(() => {
							let el = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Add new task')
							while (el && !(el.getBoundingClientRect().height >= window.innerHeight - 1 && el.getBoundingClientRect().width < 800)) el = el.parentElement
							return el ? el.getBoundingClientRect().x : null
						})
						if (left == null) throw new Error('side panel not found')
						return { x: left, y: 0, width: 1440 - left, height: importButton.y + importButton.height + 32 }
					},
				},
			},
		],
	},
	{
		// QA Testing's Owner panel: Sophie Laurent, her % FTE and the Tentative switch. Panels open one
		// at a time, so only Owner is opened.
		id: 'planning-task-owner',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openView(page, h, 'Kanban')
			await page.getByText('Silverline Retail: E-commerce Platform', { exact: true }).first().waitFor()
			await page.getByText('QA Testing', { exact: true }).first().click()
			await page.waitForURL(/\/tasks\/[0-9a-f]{24}/)
			await h.settle(page, 2000)
			await page.getByText('Owner', { exact: true }).filter({ visible: true }).first().click()
			await page.getByText('Tentative', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1200)
		},
		mouse: () => ({ x: 400, y: 850 }),
		shots: [{ file: 'planning/task-owner-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Owner', 'Custom fields') } }],
	},
	{
		// A task row's + button clicked in the Gantt: the name field opens under the row. Nothing is
		// typed, so nothing is saved.
		id: 'planning-inline-name-field',
		capturedAt: '2026-10-09',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openView(page, h, 'Gantt')
			const name = page.getByText('Fleet Dashboard', { exact: true }).filter({ visible: true }).first()
			await name.waitFor()
			await h.settle(page, 2000)
			await name.hover()
			await h.settle(page, 500)
			// The + is the first button right of the name on the same line (unnamed: its tooltip is
			// shown on hover); marked with a DOM attribute to click it.
			await name.evaluate((leaf) => {
				const n = leaf.getBoundingClientRect()
				const mid = n.top + n.height / 2
				const buttons = [...document.querySelectorAll('button')]
					.map((b) => ({ b, r: b.getBoundingClientRect() }))
					.filter(({ r }) => r.width > 0 && r.left >= n.right - 4 && r.top <= mid && r.bottom >= mid)
					.sort((a, b) => a.r.left - b.r.left)
				buttons[0].b.setAttribute('data-docs-plus', '')
			})
			await page.locator('[data-docs-plus]').click()
			await page.locator('input:focus, textarea:focus').first().waitFor()
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 1300, y: 860 }),
		// A few rows above and below the field, with the start of the chart.
		shots: [
			{
				file: 'planning/inline-name-field.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const field = await page.locator('input:focus, textarea:focus').first().boundingBox()
						const x = 72
						const y = field.y - 140
						return { x, y, width: 900 - x, height: field.y + field.height + 90 - y }
					},
				},
			},
		],
	},
]

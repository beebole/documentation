// Scenes for help/documentation/projects.mdx.
export const page = 'help/documentation/projects.mdx'

const restInHeader = () => ({ x: 800, y: 110 })

// Brand Campaign closed for time entry after June 30, 2026, for the capture only (dates at
// 00:00 UTC, as the panel's date pickers write them); down clears the window again.
const closedProject = {
	async up(api) {
		const { getProjects } = await api('{ getProjects { id name } }')
		const id = getProjects.find((p) => p.name === 'Brand Campaign').id
		await api('mutation($id: BeeboleId!, $s: BeeboleTimestamp, $e: BeeboleTimestamp) { editProjectValidityPeriod(id: $id, startTime: $s, endTime: $e) { id } }', {
			id,
			s: Date.parse('2026-01-05T00:00:00Z'),
			e: Date.parse('2026-06-30T00:00:00Z'),
		})
		return { id }
	},
	async down(api, state) {
		const id = state?.id ?? (await api('{ getProjects { id name } }')).getProjects.find((p) => p.name === 'Brand Campaign').id
		await api('mutation($id: BeeboleId!) { editProjectValidityPeriod(id: $id, startTime: null, endTime: null) { id } }', { id })
	},
}

export const scenes = [
	{
		id: 'projects-tree',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Acme Corp', 'Website Redesign')
			await h.expandRow(page, 'Quantum Logistics', 'Fleet Tracker')
			await h.settle(page)
		},
		shots: [{ file: 'projects/projects-tree.webp', frame: { type: 'full' } }],
	},
	{
		// Website Redesign, not Acme Corp: the tasks are linked to the subproject.
		id: 'projects-tasks-bookings',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Acme Corp', 'Website Redesign')
			await page.getByText('Website Redesign', { exact: true }).first().click()
			const entity = /\/projects\/[0-9a-f]{24}/
			await page.waitForURL(entity)
			await h.goto(page, `${page.url().match(entity)[0]}/project-tasks`)
			await page.getByText('Frontend Development', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: restInHeader,
		shots: [{ file: 'projects/project-tasks-bookings.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Tasks and bookings', 'Billing') } }],
	},
	{
		// The Paste button reads the clipboard: the scene answers readText with a sample tree.
		id: 'projects-add-multiple-entries',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			await page.getByRole('button', { name: 'Add Client' }).click()
			await page.getByText('Or add multiple entries', { exact: true }).waitFor()
			await page.evaluate(() => {
				const tree = 'Globex Corporation\n\tBrand Refresh\n\tMobile App\nInitech\n\tERP Rollout\n\tSupport Contract'
				Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { readText: async () => tree } })
			})
			await page.getByRole('button', { name: 'Paste', exact: true }).click()
			await page.getByText('Globex Corporation', { exact: true }).first().waitFor()
			// Expand both clients: their toggle buttons are the row buttons without a data-path (delete).
			const toggles = page.locator('entity-paste button.bb-btn-action:not([data-path])')
			for (let i = 0; i < (await toggles.count()); i++) await toggles.nth(i).click()
			await page.getByText('Support Contract', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		mouse: restInHeader,
		// The side panel, from the left edge of the paste area to the window's right edge.
		shots: [
			{
				file: 'projects/add-multiple-entries.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						// The panel is the widest ancestor of the paste area that still ends at the window's right edge.
						const x = await page.locator('entity-paste').evaluate((el) => {
							let left = el.getBoundingClientRect().left
							for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
								const r = a.getBoundingClientRect()
								if (r.right >= innerWidth - 1 && r.width < innerWidth * 0.6) left = Math.min(left, r.left)
							}
							return left
						})
						const { width, height } = page.viewportSize()
						return { x, y: 0, width: width - x, height }
					},
				},
			},
		],
	},
	{
		id: 'projects-settings-panels',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			await page.getByText('Acme Corp', { exact: true }).first().click()
			await page.waitForURL(/\/projects\/[0-9a-f]{24}/)
			await page.getByText('Who has access?', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: restInHeader,
		shots: [{ file: 'projects/project-settings-panels.webp', frame: { type: 'full' } }],
	},
	{
		id: 'projects-category-level-names',
		capturedAt: '2026-10-04',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			// Unnamed gear button: second button next to the "Projects:" heading (see missing-labels.md).
			await page.getByRole('heading', { name: 'Projects:' }).locator('xpath=..').getByRole('button').nth(1).click()
			await page.getByText('Level names', { exact: true }).waitFor()
			await h.settle(page)
		},
		shots: [{ file: 'projects/category-level-names.webp', frame: { type: 'box', box: (page, h) => h.surfaceAround(page, 'Level names'), pad: 24 } }],
	},
	{
		// Website Redesign's parent selector, opened from the breadcrumb (nothing is picked).
		id: 'projects-change-parent',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Acme Corp', 'Website Redesign')
			await page.getByText('Website Redesign', { exact: true }).first().click()
			await page.waitForURL(/\/projects\/[0-9a-f]{24}/)
			await h.settle(page, 1500)
			await page.locator('bb-breadcrumb').first().hover()
			await h.settle(page, 300)
			await page.getByRole('button', { name: 'Change parent' }).click()
			await page.getByText('Silverline Retail', { exact: true }).nth(1).waitFor()
			await h.settle(page, 1000)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 600, y: 700 }),
		// The side panel's header and the open list of parents.
		shots: [
			{
				file: 'projects/change-parent.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const header = await page.locator('bb-breadcrumb').first().boundingBox()
						const items = await page.getByText('Silverline Retail', { exact: true }).evaluateAll((els) =>
							els.map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0).map((r) => ({ x: r.x, bottom: r.bottom }))
						)
						const bottom = Math.max(...items.filter((r) => r.x > header.x - 40).map((r) => r.bottom))
						// The panel is the widest ancestor of the breadcrumb that still ends at the window's right edge.
						const x = await page.locator('bb-breadcrumb').first().evaluate((el) => {
							let left = el.getBoundingClientRect().left
							for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
								const r = a.getBoundingClientRect()
								if (r.right >= innerWidth - 1 && r.width < innerWidth * 0.6) left = Math.min(left, r.left)
							}
							return left
						})
						return { x, y: 0, width: 1440 - x, height: bottom + 28 }
					},
				},
			},
		],
	},
	{
		// Silverline Retail's ⋯ menu, the last client, so the menu opens below the list (opening it
		// changes nothing).
		id: 'projects-action-menu',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			await page.getByText('Silverline Retail', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
			const row = h.listRow(page, 'Silverline Retail')
			await row.hover()
			await h.settle(page, 300)
			await row.locator('bb-action-menu-button button').first().click()
			await page.getByText('Duplicate', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		// On the Silverline Retail row, so it keeps its hover state and its ⋯ button.
		mouse: async (page) => {
			const b = await page.getByText('Silverline Retail', { exact: true }).first().boundingBox()
			return { x: b.x + 500, y: b.y + b.height / 2 }
		},
		shots: [
			{
				file: 'projects/project-action-menu.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const del = await page.getByText('Delete', { exact: true }).filter({ visible: true }).first().boundingBox()
						return { x: 72, y: 0, width: 600, height: del.y + del.height + 32 }
					},
				},
			},
		],
	},
	{
		// The category menu with the Client category's color ball clicked: the palette, the
		// current color checked. Nothing is picked.
		id: 'projects-category-colors',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			const head = page.getByRole('heading', { name: 'Projects:' }).locator('xpath=..')
			await head.getByRole('button').first().click()
			const menu = page.locator('bb-category .menu').first()
			await menu.getByRole('menuitem').first().waitFor()
			await menu.getByRole('menuitem').filter({ hasText: 'Client' }).locator('button.rounded-full').first().click()
			await h.settle(page, 1000)
			await page.locator('.pictureMenu').filter({ visible: true }).first().waitFor()
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 1000, y: 600 }),
		// The menu and the palette, with the project list on the left (the header row above would
		// cut into the search field).
		shots: [
			{
				file: 'projects/category-colors.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page, h) => {
						const head = await page.getByRole('heading', { name: 'Projects:' }).boundingBox()
						const menu = await page.locator('bb-category .menu').first().boundingBox()
						const palette = await h.stableBox(page, page.locator('.pictureMenu').filter({ visible: true }).first())
						const x = head.x - 24
						const y = menu.y - 6
						return { x, y, width: palette.x + palette.width + 24 - x, height: Math.max(menu.y + menu.height, palette.y + palette.height) + 24 - y }
					},
				},
			},
		],
	},
	{
		// Brand Campaign closed after June 30, 2026 (fixture).
		id: 'projects-validity-period',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		fixture: closedProject,
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Brightwave Media', 'Brand Campaign')
			await page.getByText('Brand Campaign', { exact: true }).first().click()
			const entity = /\/projects\/[0-9a-f]{24}/
			await page.waitForURL(entity)
			await h.goto(page, `${page.url().match(entity)[0]}/validity-period`)
			await page.getByText('Valid period for time entry', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: restInHeader,
		shots: [{ file: 'projects/validity-period-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Valid period for time entry', 'Billing', { right: 1300 }) } }],
	},
	{
		// Sophie Laurent's Manages panel with the Projects selector open: the category rows can be
		// picked whole. Nothing is picked.
		id: 'projects-category-picker',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/persons', 'Sophie Laurent', 'manager')
			await page.getByText('Manages', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
			await page.getByPlaceholder('Add a project here').filter({ visible: true }).first().click()
			await h.settle(page, 1500)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 400, y: 700 }),
		// The Manages panel, from its title to the Managed by row under the open list.
		shots: [
			{
				file: 'projects/category-picker.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Manages', { exact: true }).filter({ visible: true }).first().boundingBox()
						const managedBy = await page.getByPlaceholder('Add a manager').filter({ visible: true }).first().boundingBox()
						const x = title.x - 64
						const y = title.y - 24
						return { x, y, width: 1440 - 16 - x, height: managedBy.y + managedBy.height + 40 - y }
					},
				},
			},
		],
	},
]

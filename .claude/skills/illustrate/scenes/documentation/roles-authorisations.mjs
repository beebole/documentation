// Scenes for help/documentation/roles-authorisations.mdx.
export const page = 'help/documentation/roles-authorisations.mdx'

// Opens the Project manager role's permission grid, widened to fit the Edit and View columns.
async function openGrid(page, h) {
	await h.openPanel(page, '/roles', 'Project manager', 'authorisations')
	await page.getByText('Admin role (full access)').first().waitFor()
	await h.settle(page, 1000)
	// The grid is wider than the side panel: drag the panel's resize handle to the left.
	const title = await page.getByText('Project manager', { exact: true }).last().boundingBox()
	await page.mouse.move(title.x - 100, title.y)
	await h.settle(page, 400)
	await page.mouse.move(866, 101)
	await page.mouse.down()
	await page.mouse.move(420, 101, { steps: 15 })
	await page.mouse.up()
	await h.settle(page, 1000)
}

// The Access Rights panel, from its title to the bottom of the window.
async function accessRights(page) {
	const title = await page.getByText('Access Rights', { exact: true }).first().boundingBox()
	const { width, height } = page.viewportSize()
	const x = title.x - 64
	const y = title.y - 20
	return { x, y, width: width - 24 - x, height: height - y }
}

// The Edit and View selectors that follow a permission's label.
const selectors = (page, permission) =>
	page.locator('label', { hasText: permission }).first().locator('xpath=following-sibling::div[1]').locator('bb-select')

export const scenes = [
	{
		id: 'roles-permission-grid',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openGrid(page, h)
		},
		mouse: () => ({ x: 300, y: 600 }),
		shots: [{ file: 'roles/permission-grid.webp', frame: { type: 'full' } }],
	},
	{
		id: 'roles-target-selector',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openGrid(page, h)
			await page.getByPlaceholder('Search…').fill('People details')
			await h.settle(page, 600)
			// On the arrow at the right end: a click in the middle can land on a target's × and remove it.
			const edit = await selectors(page, 'People details').nth(0).boundingBox()
			await page.mouse.click(edit.x + edit.width - 14, edit.y + edit.height / 2)
			await h.settle(page, 800)
		},
		mouse: () => ({ x: 300, y: 600 }),
		// Down to just below the open list.
		shots: [
			{
				file: 'roles/target-selector.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const box = await accessRights(page)
						const last = await page.getByText('Team colleagues', { exact: true }).filter({ visible: true }).last().boundingBox()
						return { ...box, height: last.y + last.height + 32 - box.y }
					},
				},
			},
		],
	},
	{
		id: 'roles-assignment-permissions',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openGrid(page, h)
			await page.getByPlaceholder('Search…').fill('Assign')
			await page.getByText('Assign expenses', { exact: true }).first().waitFor()
			await h.settle(page, 800)
		},
		mouse: () => ({ x: 300, y: 600 }),
		shots: [{ file: 'roles/assignment-permissions.webp', frame: { type: 'box', box: accessRights } }],
	},
	{
		// Marc Dubois's Email & role panel with the role selector open. The × on the role badge only
		// swaps the badge for the selector; nothing is saved until a role is picked, and none is.
		id: 'roles-person-role-selector',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/persons', 'Marc Dubois', 'user')
			const badge = page.locator('user-attribute entity-badge').first()
			await badge.waitFor()
			await h.settle(page, 800)
			await badge.hover()
			await h.settle(page, 300)
			await badge.locator('button').first().click()
			// The × focuses the selector, which opens its list in the app's shared popup.
			await page.getByText('Project manager', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
			await h.settle(page, 800)
		},
		mouse: () => ({ x: 800, y: 50 }),
		shots: [
			{
				file: 'roles/person-role-selector.webp',
				frame: {
					type: 'box',
					box: async (page, h) => {
						const title = await page.getByText('Email & role', { exact: true }).filter({ visible: true }).first().boundingBox()
						const list = await page.locator('role-list').filter({ visible: true }).first().boundingBox()
						const bottom = list.y + list.height
						const x = title.x - 64
						const y = title.y - 20
						return { x, y, width: 1440 - 16 - x, height: bottom + 16 - y }
					},
				},
			},
		],
	},
]

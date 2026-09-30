// Scenes for help/documentation/roles-authorisations.mdx.
export const page = 'help/documentation/roles-authorisations.mdx'

export const scenes = [
	{
		id: 'roles-permission-grid',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
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
		},
		mouse: () => ({ x: 300, y: 600 }),
		shots: [{ file: 'roles/permission-grid.webp', frame: { type: 'full' } }],
	},
]

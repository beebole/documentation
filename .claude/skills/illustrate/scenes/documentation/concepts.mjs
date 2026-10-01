// Scenes for help/documentation/concepts.mdx.
export const page = 'help/documentation/concepts.mdx'

export const scenes = [
	{
		// Sophie Laurent's ⋯ action menu, next to her name in her profile (opening it changes nothing).
		id: 'concepts-duplicate-menu',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByText('Sophie Laurent', { exact: true }).first().click()
			await page.waitForURL(/\/persons\/[0-9a-f]{24}/)
			await page.getByText('Email & role', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
			await page.locator('bb-action-menu-button button').filter({ visible: true }).last().click()
			await page.getByText('Duplicate', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		// Off the panel, which shows its pin and resize buttons under the mouse.
		mouse: () => ({ x: 600, y: 50 }),
		// The profile header and the open menu.
		shots: [
			{
				file: 'concepts/duplicate-action-menu.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const invite = await page.getByRole('button', { name: 'Invite by email' }).boundingBox()
						const last = await page.getByText('Delete', { exact: true }).filter({ visible: true }).first().boundingBox()
						const x = invite.x - 130
						return { x, y: 0, width: 1440 - x, height: last.y + last.height + 32 }
					},
				},
			},
		],
	},
	{
		// The banner shows once /version.txt returns another build than the one loaded. The scene
		// answers that file with a new value after the page has loaded, then makes the app check
		// again the way returning to the tab does. The banner is the app's own; nothing is saved.
		id: 'concepts-version-banner',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			await page.getByText('Acme Corp', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
			await page.route('**/version.txt*', (route) => route.fulfill({ status: 200, contentType: 'text/plain', body: 'docs-screenshot-next-build' }))
			await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
			await page.getByText('Update available', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		async teardown(page) {
			await page.unroute('**/version.txt*')
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 600, y: 700 }),
		// The top of the Projects page, dimmed under the banner at the top right.
		shots: [{ file: 'concepts/version-update-banner.webp', frame: { type: 'clip', x: 0, y: 0, width: 1440, height: 340 } }],
	},
	{
		// "ela" typed in the People search: Elena Rossi and Sophie Laurent match, letters not
		// next to each other included, with the matched letters highlighted.
		id: 'concepts-fuzzy-search',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByText('Sophie Laurent', { exact: true }).first().waitFor()
			await page.getByPlaceholder('Search by name').filter({ visible: true }).first().fill('ela')
			await h.settle(page, 1500)
		},
		async teardown(page) {
			await page.getByPlaceholder('Search by name').filter({ visible: true }).first().fill('')
		},
		mouse: () => ({ x: 1000, y: 700 }),
		shots: [{ file: 'concepts/fuzzy-search.webp', frame: { type: 'clip', x: 72, y: 0, width: 700, height: 210 } }],
	},
	{
		// Acme Corp's billing rates copied, then Greenleaf Industries opened in the same page: its
		// Billing panel offers Paste. Copy only fills the app's own clipboard, in the page; the
		// switch is a click in the list, since a reload would empty that clipboard.
		id: 'concepts-attribute-copy-paste',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/projects', 'Acme Corp', 'billing')
			await page.getByText('Billing', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
			await page.getByRole('button', { name: 'Copy', exact: true }).filter({ visible: true }).first().click()
			await page.getByRole('button', { name: 'Copied', exact: true }).filter({ visible: true }).first().waitFor()
			await page.getByText('Greenleaf Industries', { exact: true }).first().click()
			await page.getByRole('button', { name: 'Paste', exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 600, y: 700 }),
		// The side panel, from Greenleaf Industries' header down to the Billing panel.
		shots: [
			{
				file: 'concepts/attribute-copy-paste.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page, h) => {
						const panel = await h.panelBox(page, 'Billing', 'Budgets')
						const x = panel.x - 12
						return { x, y: 0, width: 1440 - x, height: panel.y + panel.height }
					},
				},
			},
		],
	},
]

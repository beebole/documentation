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
]

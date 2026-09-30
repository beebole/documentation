// Scenes for help/documentation/authentication.mdx.
export const page = 'help/documentation/authentication.mdx'

export const scenes = [
	{
		id: 'authentication-signin',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		signedOut: true,
		async setup(page, h) {
			await h.goto(page, '/signin')
			await page.getByText('Or sign in with', { exact: false }).first().waitFor()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'authentication/signin-page.webp', frame: { type: 'full' } }],
	},
	{
		id: 'authentication-sso-panel',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=sso')
			await page.getByText('Custom OpenID').first().waitFor()
			await h.settle(page, 1500)
		},
		shots: [{ file: 'authentication/sso-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Single Sign-On', 'Absence allowances', { right: 1080 }) } }],
	},
	{
		id: 'authentication-api-key',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			// The Journal is empty on this account: nothing shows through behind the menu.
			await h.goto(page, '/journal')
			await page.locator('connected-person').first().click()
			await h.settle(page, 800)
			await page.getByText('Your API key', { exact: true }).first().hover()
			const key = page.locator('.apiKeyMenu .font-mono')
			await key.waitFor()
			// The app already masks the key; the scene replaces even its first and last characters,
			// so the image stays the same when the key is reset.
			await key.evaluate((el) => (el.textContent = 'a1b2 ******** c3d4'))
			await h.settle(page, 1000)
		},
		async mouse(page) {
			const b = await page.getByText('Your API key', { exact: true }).first().boundingBox()
			return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
		},
		// The user menu and the key submenu next to it.
		shots: [
			{
				file: 'authentication/api-key-menu.webp',
				frame: {
					type: 'box',
					pad: 16,
					box: async (page) => {
						const menu = await page.locator('.connectedUserMenu').boundingBox()
						const sub = await page.locator('.apiKeyMenu').boundingBox()
						const x = Math.min(menu.x, sub.x)
						const y = Math.min(menu.y, sub.y)
						return { x, y, width: Math.max(menu.x + menu.width, sub.x + sub.width) - x, height: Math.max(menu.y + menu.height, sub.y + sub.height) - y }
					},
				},
			},
		],
	},
]

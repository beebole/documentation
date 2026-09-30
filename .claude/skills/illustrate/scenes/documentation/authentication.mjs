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
]

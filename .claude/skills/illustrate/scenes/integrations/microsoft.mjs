// Scenes for help/integrations/microsoft.mdx.
export const page = 'help/integrations/microsoft.mdx'

export const scenes = [
	{
		id: 'microsoft-sso-panel',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=sso')
			await page.getByText('Custom OpenID').first().waitFor()
			await page.getByText('Microsoft', { exact: true }).filter({ visible: true }).first().click()
			await page.getByText(/Only Microsoft sign-in allowed/).first().waitFor()
			await h.settle(page, 1000)
		},
		async teardown(page) {
			await page.getByText('Google', { exact: true }).filter({ visible: true }).first().click()
		},
		shots: [{ file: 'integrations/microsoft-sso-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Single Sign-On', 'Absence allowances', { right: 1080 }) } }],
	},
]

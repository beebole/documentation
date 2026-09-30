// Scenes for help/documentation/account-settings.mdx.
export const page = 'help/documentation/account-settings.mdx'

export const scenes = [
	{
		id: 'account-settings-page',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings')
			await page.getByText('Absence allowances', { exact: true }).first().waitFor()
			// The QA environment badge next to the account ID does not exist in production.
			await page.getByText('QA', { exact: true }).evaluateAll((els) => els.forEach((e) => (e.style.visibility = 'hidden')))
			await h.settle(page)
		},
		shots: [{ file: 'account-settings/settings-panels.webp', frame: { type: 'full' } }],
	},
	{
		id: 'account-settings-localization',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=localisation')
			await page.getByText('Time zone', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'account-settings/localization-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Localization', 'Absence allowances', { right: 1110 }) } }],
	},
]

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
	{
		// The Delete Account screen before anything is scheduled. Nothing is clicked.
		id: 'account-settings-delete-account',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings/account/delete')
			await page.getByText('Yes, delete my account', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		// The title, the warning and the button: the rest of the screen is empty.
		shots: [
			{
				file: 'account-settings/delete-account.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Delete Account', { exact: true }).filter({ visible: true }).first().boundingBox()
						const button = await page.getByText('Yes, delete my account', { exact: true }).first().boundingBox()
						const x = title.x - 72
						const y = title.y - 28
						return { x, y, width: 560, height: button.y + button.height + 32 - y }
					},
				},
			},
		],
	},
]

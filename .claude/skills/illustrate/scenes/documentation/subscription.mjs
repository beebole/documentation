// Scenes for help/documentation/subscription.mdx.
export const page = 'help/documentation/subscription.mdx'

export const scenes = [
	{
		id: 'subscription-plans-seats',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings/account/subscription')
			await page.getByText('Essential', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		shots: [{ file: 'subscription/plans-seats.webp', frame: { type: 'full' } }],
	},
]

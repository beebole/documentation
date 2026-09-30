// Scenes for help/documentation/billing.mdx.
export const page = 'help/documentation/billing.mdx'

export const scenes = [
	{
		id: 'billing-rate-card',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/projects', 'Acme Corp', 'billing')
			// Unfold the rate card to show its fields (display only, nothing is saved).
			await page.getByText(/No repeat/).first().click()
			await page.getByText('Billing method').first().waitFor()
			await h.settle(page, 1000)
		},
		mouse: () => ({ x: 800, y: 110 }),
		shots: [{ file: 'billing/billing-rate-card.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Billing', 'Budgets') } }],
	},
]

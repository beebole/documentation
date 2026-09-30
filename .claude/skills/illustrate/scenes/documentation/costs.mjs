// Scenes for help/documentation/costs.mdx.
export const page = 'help/documentation/costs.mdx'

export const scenes = [
	{
		id: 'costs-rate-card',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/persons', 'Ana Pereira', 'cost')
			// Unfold the rate card to show its fields (display only, nothing is saved).
			await page.getByText(/No repeat/).first().click()
			await page.getByText('Cost method', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		mouse: () => ({ x: 800, y: 110 }),
		shots: [{ file: 'costs/cost-rate-card.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Cost', 'Email & role') } }],
	},
]

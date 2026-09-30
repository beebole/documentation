// Scenes for help/documentation/budgets.mdx.
export const page = 'help/documentation/budgets.mdx'

export const scenes = [
	{
		id: 'budgets-panel',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			// Budgets are set on the projects, not on the client. Web Portal's budget has short amounts
			// (180 h, $30,000), which the fields show in full.
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Brightwave Media', 'Web Portal')
			await page.getByText('Web Portal', { exact: true }).first().click()
			const entity = /\/projects\/[0-9a-f]{24}/
			await page.waitForURL(entity)
			await h.goto(page, `${page.url().match(entity)[0]}/budget`)
			// Unfold the budget card to show its fields (display only, nothing is saved).
			await page.getByText(/Billing amount:/).first().click()
			await page.getByText('Billing amount', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
		},
		mouse: () => ({ x: 800, y: 110 }),
		shots: [{ file: 'budgets/budget-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Budgets', 'Billing') } }],
	},
	{
		id: 'budgets-status-report',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/reports')
			await page.getByRole('button', { name: 'Budget Status', exact: true }).click()
			await page.getByText('Acme Corp', { exact: true }).first().waitFor()
			await h.settle(page, 2000)
			// The measures side by side overflow a 1440 screen: stack them in one column. The
			// choice is a screen setting the runner never saves, so it is set on every run.
			const stack = await h.byTooltip(page, page.locator('budget-status-table'), 'Stack the measures in one column', 'button')
			await stack.click()
			await h.settle(page, 1500)
		},
		shots: [{ file: 'budgets/budget-status-report.webp', frame: { type: 'full' } }],
	},
]

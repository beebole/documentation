// Scenes for help/documentation/expenses.mdx.
export const page = 'help/documentation/expenses.mdx'

const restInHeader = () => ({ x: 800, y: 50 })

export const scenes = [
	{
		id: 'expenses-panel',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/persons', 'Ana Pereira', 'expense-records')
			// Ana's expense is older than the current period: show past records. The link's label is
			// missing on expenses (reboot's list-attribute.ts asks for expenseRecord.showPastQuotas,
			// which only exists for allowances), so it shows a raw key: hide it once used.
			const past = page.getByText(/showPastQuotas/).first()
			await past.click()
			await page.getByText(/hidePastQuotas/).first().waitFor()
			await page.getByText(/hidePastQuotas/).first().evaluate((e) => (e.closest('a, button') ?? e).parentElement.style.setProperty('visibility', 'hidden'))
			await h.settle(page, 1000)
			// Expand the record to show its fields.
			await page.getByText('Hotel', { exact: true }).first().click()
			await page.getByText('UX research trip').first().waitFor()
			await h.settle(page, 2000)
		},
		mouse: restInHeader,
		shots: [{ file: 'expenses/expenses-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Expenses', 'Tags') } }],
	},
]

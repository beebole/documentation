// Scenes for help/documentation/budgets.mdx.
export const page = 'help/documentation/budgets.mdx'

// Web Portal's budget (180 h, $30,000, $9,000 cost), split by persons for the capture only.
// `down` clears the split (setting the split type empties its rows), so the Budget Status report
// keeps one budget per project.
const SPLIT = [
	{ person: 'Elena Rossi', hours: 100, billing: 1700000, cost: 500000 },
	{ person: 'Lucas Bernard', hours: 80, billing: 1300000, cost: 400000 },
]

async function webPortalBudget(api) {
	const { getProjects } = await api('{ getProjects { name budgets { id } } }')
	const budget = getProjects.find((p) => p.name === 'Web Portal')?.budgets?.[0]
	if (!budget) throw new Error('Web Portal has no budget')
	return budget.id
}

const splitBudget = {
	async up(api) {
		const id = await webPortalBudget(api)
		const { getPersons } = await api('{ getPersons { id name } }')
		await api('mutation($id: BeeboleId!) { editBudgetSplitType(id: $id, splitType: "persons") { id } }', { id })
		for (const s of SPLIT) {
			await api(
				'mutation($b: BeeboleId!, $e: BeeboleId!, $ba: BeeboleInputAmount!, $ca: BeeboleInputAmount!, $q: Int!) { addBudgetSplit(budgetId: $b, entityId: $e, billingAmount: $ba, costAmount: $ca, quantity: $q) { id } }',
				{ b: id, e: getPersons.find((p) => p.name === s.person).id, ba: { value: s.billing, currency: 'USD' }, ca: { value: s.cost, currency: 'USD' }, q: s.hours }
			)
		}
		return { id }
	},
	async down(api, state) {
		const id = state?.id ?? (await webPortalBudget(api))
		await api('mutation($id: BeeboleId!) { editBudgetSplitType(id: $id, splitType: null) { id } }', { id })
	},
}

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
	{
		id: 'budgets-time-unit',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Brightwave Media', 'Web Portal')
			await page.getByText('Web Portal', { exact: true }).first().click()
			const entity = /\/projects\/[0-9a-f]{24}/
			await page.waitForURL(entity)
			await h.goto(page, `${page.url().match(entity)[0]}/budget`)
			await page.getByText(/Billing amount:/).first().click()
			await page.getByText('Billing amount', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
			// Open the unit picker next to the Time target (display only, nothing is chosen).
			await page.locator('input-qty bb-autocomplete').filter({ visible: true }).first().click()
			await page.getByText('Days', { exact: true }).filter({ visible: true }).first().waitFor()
			// Opening the picker leaves a focus ring on the From date: clear it, the picker stays open.
			await page.evaluate(() => {
				let el = document.activeElement
				while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
				el?.blur()
			})
			await h.settle(page, 1000)
		},
		mouse: () => ({ x: 800, y: 110 }),
		shots: [{ file: 'budgets/time-unit-picker.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Budgets', 'Billing') } }],
	},
	{
		id: 'budgets-split-by-person',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		// Tall enough for the two split rows and the next panel's title.
		viewport: { width: 1440, height: 1200 },
		fixture: splitBudget,
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Brightwave Media', 'Web Portal')
			await page.getByText('Web Portal', { exact: true }).first().click()
			const entity = /\/projects\/[0-9a-f]{24}/
			await page.waitForURL(entity)
			await h.goto(page, `${page.url().match(entity)[0]}/budget`)
			await page.getByText(/Billing amount:/).first().click()
			await page.getByText('Lucas Bernard', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 800, y: 110 }),
		shots: [{ file: 'budgets/budget-split-by-person.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Budgets', 'Billing') } }],
	},
]

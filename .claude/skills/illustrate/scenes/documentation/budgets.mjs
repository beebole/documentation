// Scenes for help/documentation/budgets.mdx.
export const page = 'help/documentation/budgets.mdx'

// Web Portal's budget (180 h, $30,000, $9,000 cost), split by persons for the capture only.
// `down` clears the split (setting the split type empties its rows), so the Budget Status report
// keeps one budget per project. Clearing the split type also zeroes the budget's own time and
// amounts (2026-10-02): `down` writes them back, the seed's values when `up` found them zeroed.
const SPLIT = [
	{ person: 'Elena Rossi', hours: 100, billing: 1700000, cost: 500000 },
	{ person: 'Lucas Bernard', hours: 80, billing: 1300000, cost: 400000 },
]
const SEED_BUDGET = { quantity: 180, billing: 3000000, cost: 900000 }

async function webPortalBudget(api) {
	const { getProjects } = await api('{ getProjects { name budgets { id quantity billingAmount { value } costAmount { value } } } }')
	const budget = getProjects.find((p) => p.name === 'Web Portal')?.budgets?.[0]
	if (!budget) throw new Error('Web Portal has no budget')
	return budget
}

async function restoreBudget(api, id, { quantity, billing, cost }) {
	await api('mutation($id: BeeboleId!, $q: Int!) { editBudgetQuantity(id: $id, quantity: $q) { id } }', { id, q: quantity })
	await api('mutation($id: BeeboleId!, $a: BeeboleInputAmount!) { editBudgetBillingAmount(id: $id, amount: $a) { id } }', { id, a: { value: billing, currency: 'USD' } })
	await api('mutation($id: BeeboleId!, $a: BeeboleInputAmount!) { editBudgetCostAmount(id: $id, amount: $a) { id } }', { id, a: { value: cost, currency: 'USD' } })
}

const splitBudget = {
	async up(api) {
		const budget = await webPortalBudget(api)
		const id = budget.id
		const amounts = budget.quantity && budget.billingAmount?.value ? { quantity: budget.quantity, billing: budget.billingAmount.value, cost: budget.costAmount?.value ?? 0 } : SEED_BUDGET
		const { getPersons } = await api('{ getPersons { id name } }')
		await api('mutation($id: BeeboleId!) { editBudgetSplitType(id: $id, splitType: "persons") { id } }', { id })
		for (const s of SPLIT) {
			await api(
				'mutation($b: BeeboleId!, $e: BeeboleId!, $ba: BeeboleInputAmount!, $ca: BeeboleInputAmount!, $q: Int!) { addBudgetSplit(budgetId: $b, entityId: $e, billingAmount: $ba, costAmount: $ca, quantity: $q) { id } }',
				{ b: id, e: getPersons.find((p) => p.name === s.person).id, ba: { value: s.billing, currency: 'USD' }, ca: { value: s.cost, currency: 'USD' }, q: s.hours }
			)
		}
		return { id, amounts }
	},
	async down(api, state) {
		const id = state?.id ?? (await webPortalBudget(api)).id
		await api('mutation($id: BeeboleId!) { editBudgetSplitType(id: $id, splitType: null) { id } }', { id })
		await restoreBudget(api, id, state?.amounts ?? SEED_BUDGET)
	},
}

// A second Web Portal budget from January 1, 2027, for the capture only. The Budget Status
// report never sees it: fixture scenes run alone.
const renewalBudget = {
	async up(api) {
		const { getProjects } = await api('{ getProjects { id name } }')
		const projectId = getProjects.find((p) => p.name === 'Web Portal').id
		const { addProjectBudget } = await api(
			'mutation($p: BeeboleId!, $b: BeeboleInputAmount!, $c: BeeboleInputAmount!, $q: Int!, $s: BeeboleTimestamp, $n: String) { addProjectBudget(projectId: $p, billingAmount: $b, costAmount: $c, quantity: $q, startTime: $s, comment: $n) { id } }',
			{ p: projectId, b: { value: 3600000, currency: 'USD' }, c: { value: 1080000, currency: 'USD' }, q: 200, s: Date.parse('2027-01-01T00:00:00Z'), n: 'Renewal for 2027' }
		)
		return { projectId, id: addProjectBudget.id }
	},
	async down(api, state) {
		if (state?.id) await api('mutation($p: BeeboleId!, $b: BeeboleId!) { deleteProjectBudget(projectId: $p, budgetId: $b) { id } }', { p: state.projectId, b: state.id })
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
	{
		// Web Portal's budget from September 29, and a 2027 renewal from January 1 (fixture).
		id: 'budgets-over-time',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		fixture: renewalBudget,
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Brightwave Media', 'Web Portal')
			await page.getByText('Web Portal', { exact: true }).first().click()
			const entity = /\/projects\/[0-9a-f]{24}/
			await page.waitForURL(entity)
			await h.goto(page, `${page.url().match(entity)[0]}/budget`)
			await page.getByText('Renewal for 2027').first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 800, y: 110 }),
		shots: [{ file: 'budgets/several-budgets.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Budgets', 'Billing') } }],
	},
]

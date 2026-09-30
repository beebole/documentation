// Scenes for help/documentation/billing.mdx.
export const page = 'help/documentation/billing.mdx'

// Northstar Financial's hourly rate, split by persons for the capture only: two people with
// their own amount and one non-billable. `down` clears the split (the app resets its rows with
// the split type), so the reports keep the account's single rate.
const SPLIT = [
	{ person: 'Sophie Laurent', amount: 22000, nonBillable: false },
	{ person: 'Marc Dubois', amount: 16000, nonBillable: false },
	{ person: 'Sarah Jensen', amount: 18000, nonBillable: true },
]

async function northstarRate(api) {
	const { getProjects } = await api('{ getProjects { id name billings { value { id } path { id } } } }')
	const project = getProjects.find((p) => p.name === 'Northstar Financial')
	const rate = project?.billings?.value?.[0]
	if (!rate) throw new Error('Northstar Financial has no billing rate')
	return rate.id
}

async function gearCenter(page) {
	const b = await page.locator('bb-value-path').filter({ visible: true }).first().boundingBox()
	return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

const splitRate = {
	async up(api) {
		const id = await northstarRate(api)
		const { getPersons } = await api('{ getPersons { id name } }')
		await api('mutation($id: BeeboleId!) { editBillingSplitType(id: $id, splitType: "persons") { id } }', { id })
		for (const s of SPLIT) {
			const entityId = getPersons.find((p) => p.name === s.person).id
			await api(
				'mutation($r: BeeboleId!, $e: BeeboleId!, $a: BeeboleInputAmount!, $n: Boolean!) { addBillingSplit(rateId: $r, entityId: $e, amount: $a, nonBillable: $n) { id } }',
				{ r: id, e: entityId, a: { value: s.amount, currency: 'USD' }, n: s.nonBillable }
			)
		}
		return { id }
	},
	async down(api, state) {
		const id = state?.id ?? (await northstarRate(api))
		await api('mutation($id: BeeboleId!) { editBillingSplitType(id: $id, splitType: null) { id } }', { id })
	},
}

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
	{
		// Video Production, two levels under Brightwave Media, has no rate of its own: its Billing
		// panel shows the client's rate and, next to the title, where it comes from.
		id: 'billing-rate-inherited',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Brightwave Media', 'Brand Campaign')
			// h.listRow finds the outer row (Brightwave Media also contains the text): take the
			// innermost list item instead.
			if (!(await page.getByText('Video Production', { exact: true }).first().isVisible())) {
				await page.getByRole('listitem').filter({ has: page.getByText('Brand Campaign', { exact: true }) }).last().getByRole('button').first().click()
			}
			await page.getByText('Video Production', { exact: true }).first().click()
			await page.waitForURL(/\/projects\/[0-9a-f]{24}/)
			await h.goto(page, `${page.url().match(/\/projects\/[0-9a-f]{24}/)[0]}/billing`)
			await page.getByText(/Hourly rate/).first().waitFor()
			// Hover the source marker next to the panel title: its tooltip names Brightwave Media.
			// The runner then rests the mouse on the same point, so the tooltip stays.
			const marker = await gearCenter(page)
			await page.mouse.move(marker.x, marker.y)
			await h.settle(page, 1500)
		},
		mouse: gearCenter,
		// The project tree and the Billing panel, down to the next panel.
		shots: [{ file: 'billing/rate-inherited.webp', frame: { type: 'box', box: async (page) => ({ x: 0, y: 0, width: 1440, height: (await page.getByText('Budgets', { exact: true }).filter({ visible: true }).first().boundingBox()).y - 12 }) } }],
	},
	{
		id: 'billing-rate-split',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		// Tall enough for the three split rows and the next panel's title.
		viewport: { width: 1440, height: 1100 },
		fixture: splitRate,
		async setup(page, h) {
			await h.openPanel(page, '/projects', 'Northstar Financial', 'billing')
			// Unfold the rate card to show its split rows (display only, nothing is saved).
			await page.getByText(/No repeat/).first().click()
			await page.getByText('Sophie Laurent', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 800, y: 110 }),
		shots: [{ file: 'billing/rate-split.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Billing', 'Budgets') } }],
	},
]

// Scenes for help/documentation/costs.mdx.
export const page = 'help/documentation/costs.mdx'

import { openFolder, setViews } from './reports.mjs'

// Margin by Client per Month is saved without a column order, so the app shows its legacy
// columns (client, month, Hours) and never its billing and cost. For the capture only, the report
// gets client, Hours, Billing, Cost and Margin over the year (no month split); `down` puts back
// the params it had. The Custom reports shots show it as saved. Margin % is left out: on QA its
// client rows read several hundred percent (Acme Corp 503% for 157,450 on 586,200), only the
// total is right.
const MARGIN_REPORT = 'Margin by Client per Month'
const PARAMS = '{ id name params { period { target period start end } records attributes { periodSplit person } groupBy { projects { categoryId level } } options { billing cost } } }'
async function marginReport(api) {
	const r = (await api(`{ getReports ${PARAMS} }`)).getReports.find((x) => x.name === MARGIN_REPORT)
	if (!r) throw new Error(`Report not found: ${MARGIN_REPORT}`)
	return r
}
const saveParams = (api, id, p, attributes, columnOrder) =>
	api(
		`mutation($id: BeeboleId!, $period: BeeboleReportParamPeriodInput, $records: [BeeboleRecordType]!, $attributes: BeeboleReportParamAttributesInput, $groupBy: BeeboleReportParamGroupByInput, $options: BeeboleReportParamOptionsInput, $columnOrder: [String]) {
			editReportParams(id: $id, period: $period, records: $records, attributes: $attributes, groupBy: $groupBy, options: $options, columnOrder: $columnOrder) { id }
		}`,
		{ id, period: p.period, records: p.records, attributes, groupBy: p.groupBy, options: p.options, columnOrder }
	)
const marginColumns = {
	async up(api) {
		const r = await marginReport(api)
		const client = r.params.groupBy.projects[0]
		const columns = [`project:${client.categoryId}:${client.level}:name`, ...['duration', 'hourBilling', 'hourCost', 'margin'].map((f) => `timeRecord:${f}`)]
		await saveParams(api, r.id, r.params, {}, columns)
		return { id: r.id, params: r.params }
	},
	async down(api, state) {
		const { id, params } = state ?? (await marginReport(api))
		const { periodSplit, person } = params.attributes
		await saveParams(api, id, params, { periodSplit, person }, null)
	},
}

// An hourly cost on Website Redesign split by persons, for the capture only: two contractors
// with a cost of their own on the project. `down` deletes the rate (with its split rows).
const SPLIT = [
	{ person: 'Nils Eriksson', cents: 5500 },
	{ person: 'Marc Dubois', cents: 4200 },
]
const splitCost = {
	async up(api) {
		const { getProjects } = await api('{ getProjects { id name } }')
		const { getPersons } = await api('{ getPersons { id name } }')
		const projectId = getProjects.find((p) => p.name === 'Website Redesign').id
		const { addProjectCost } = await api(
			'mutation($p: BeeboleId!, $s: BeeboleTimestamp!, $a: BeeboleInputAmount!, $m: BeeboleRateMethod!) { addProjectCost(projectId: $p, startTime: $s, amount: $a, method: $m) { id } }',
			{ p: projectId, s: Date.parse('2026-01-01T00:00:00Z'), a: { value: 0, currency: 'USD' }, m: 'hourly' }
		)
		const id = addProjectCost.id
		await api('mutation($id: BeeboleId!) { editCostSplitType(id: $id, splitType: "persons") { id } }', { id })
		for (const s of SPLIT)
			await api('mutation($r: BeeboleId!, $e: BeeboleId!, $a: BeeboleInputAmount!) { addCostSplit(rateId: $r, entityId: $e, amount: $a, nonBillable: false) { id } }', {
				r: id,
				e: getPersons.find((p) => p.name === s.person).id,
				a: { value: s.cents, currency: 'USD' },
			})
		return { projectId, id }
	},
	// The seed puts no cost on projects, so every cost of Website Redesign is this fixture's (also
	// when `up` failed half-way and left no state).
	async down(api) {
		const project = (await api('{ getProjects { id name costs { value { id } } } }')).getProjects.find((p) => p.name === 'Website Redesign')
		for (const c of project.costs?.value ?? []) await api('mutation($p: BeeboleId!, $c: BeeboleId!) { deleteProjectCost(projectId: $p, costId: $c) { id } }', { p: project.id, c: c.id })
	},
}

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
	{
		id: 'costs-margin-report',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		fixture: marginColumns,
		async setup(page, h) {
			await openFolder(page, h, 'Current Year', MARGIN_REPORT)
			await page.getByText(MARGIN_REPORT, { exact: true }).first().click()
			await setViews(page, h, MARGIN_REPORT, { Table: true, Chart: false, Matrix: false })
			await page.getByText('Time: Margin', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		// The report, from its title down to the Total row.
		shots: [
			{
				file: 'costs/margin-report-columns.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const title = await page.getByText(MARGIN_REPORT, { exact: true }).filter({ visible: true }).last().boundingBox()
						const total = await page.getByText('Total', { exact: true }).filter({ visible: true }).last().boundingBox()
						const x = 330
						return { x, y: title.y - 30, width: 1430 - x, height: total.y + total.height + 30 - (title.y - 30) }
					},
				},
			},
		],
	},
	{
		// The folded cost card of Website Redesign: Split by persons and the two people's badges
		// where a single rate shows its amount (fixture).
		id: 'costs-split-card',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		fixture: splitCost,
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Acme Corp', 'Website Redesign')
			await page.getByText('Website Redesign', { exact: true }).first().click()
			const entity = /\/projects\/[0-9a-f]{24}/
			await page.waitForURL(entity)
			await h.goto(page, `${page.url().match(entity)[0]}/cost`)
			await page.getByText(/Split by persons/).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 800, y: 110 }),
		shots: [{ file: 'costs/split-cost-card.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Cost', 'Billing') } }],
	},
]

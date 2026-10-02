// Scenes for help/documentation/expenses.mdx.
export const page = 'help/documentation/expenses.mdx'

import { openFolder, setViews } from './reports.mjs'

const restInHeader = () => ({ x: 800, y: 50 })

// The account has no expense report. For the capture only, Absences by person (Current Year),
// which no shot shows open, becomes Expenses by type: expense records by expense type with
// Quantity, Amount and Expense billing. `down` puts back its name and the params it had.
const BORROWED = 'Absences by person'
const SHOWN_AS = 'Expenses by type'
const PARAMS = '{ id name params { period { target period start end } records attributes { periodSplit person } groupBy { projects { categoryId level } } options { billing cost } } }'
async function borrowedReport(api) {
	const r = (await api(`{ getReports ${PARAMS} }`)).getReports.find((x) => x.name === BORROWED || x.name === SHOWN_AS)
	if (!r) throw new Error(`Report not found: ${BORROWED}`)
	return r
}
const saveParams = (api, id, p) =>
	api(
		`mutation($id: BeeboleId!, $period: BeeboleReportParamPeriodInput, $records: [BeeboleRecordType]!, $attributes: BeeboleReportParamAttributesInput, $groupBy: BeeboleReportParamGroupByInput, $options: BeeboleReportParamOptionsInput, $columnOrder: [String]) {
			editReportParams(id: $id, period: $period, records: $records, attributes: $attributes, groupBy: $groupBy, options: $options, columnOrder: $columnOrder) { id }
		}`,
		{ id, period: p.period, records: p.records, attributes: p.attributes, groupBy: p.groupBy ?? null, options: p.options ?? null, columnOrder: p.columnOrder ?? null }
	)
const expenseColumns = {
	async up(api) {
		const r = await borrowedReport(api)
		await saveParams(api, r.id, {
			period: r.params.period,
			records: ['expense'],
			attributes: { expenseRecord: ['expenseType'] },
			options: { billing: true },
			columnOrder: ['expenseType:name', ...['expenseQuantity', 'expenseAmount', 'expenseBilling'].map((f) => `expenseRecord:${f}`)],
		})
		await api('mutation($id: BeeboleId!, $n: BeeboleName!) { editReportName(id: $id, name: $n) { id } }', { id: r.id, n: SHOWN_AS })
		return { id: r.id, params: r.params }
	},
	async down(api, state) {
		const { id, params } = state ?? (await borrowedReport(api))
		const { periodSplit, person } = params.attributes
		await saveParams(api, id, { ...params, attributes: { periodSplit, person } })
		await api('mutation($id: BeeboleId!, $n: BeeboleName!) { editReportName(id: $id, name: $n) { id } }', { id, n: BORROWED })
	},
}

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
	{
		id: 'expenses-type-details',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/expenseTypes', 'Hotel', 'expense-type-details')
			await page.getByText('Billing markup in %', { exact: true }).first().waitFor()
			// Impacts budget is not shown on production hosts (reboot's expense-type-details.ts):
			// hide it here too, so the panel matches what customers see.
			await page.getByText('Impacts budget', { exact: true }).first().evaluate((e) => e.closest('label').style.setProperty('display', 'none'))
			await h.settle(page, 1000)
		},
		mouse: restInHeader,
		shots: [{ file: 'expenses/expense-type-details.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Details', 'Who has access?') } }],
	},
	{
		id: 'expenses-report',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		fixture: expenseColumns,
		async setup(page, h) {
			await openFolder(page, h, 'Current Year', SHOWN_AS)
			await page.getByText(SHOWN_AS, { exact: true }).first().click()
			await setViews(page, h, SHOWN_AS, { Table: true, Chart: false, Matrix: false })
			await page.getByText('Expense: Quantity', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		// The report, from its title down to the Total row.
		shots: [
			{
				file: 'expenses/expense-report.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const title = await page.getByText(SHOWN_AS, { exact: true }).filter({ visible: true }).last().boundingBox()
						const total = await page.getByText('Total', { exact: true }).filter({ visible: true }).last().boundingBox()
						const x = 330
						return { x, y: title.y - 30, width: 1430 - x, height: total.y + total.height + 30 - (title.y - 30) }
					},
				},
			},
		],
	},
]

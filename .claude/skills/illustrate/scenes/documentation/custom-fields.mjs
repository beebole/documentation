// Scenes for help/documentation/custom-fields.mdx. The Cost center field of the seed layer: a
// text pick list shown on Client projects and time records.
export const page = 'help/documentation/custom-fields.mdx'

// Panels are widened to 800 px: at the default width (576 at 1440)
// the visibility labels break over two lines.
const PANEL_WIDTH = 800

// Opens one panel of a field (the Cost center field by default) through its address
// (Settings > Custom Fields).
async function openFieldPanel(page, h, attribute, name = 'Cost center') {
	await h.goto(page, '/settings')
	await page.getByText('Custom Fields', { exact: true }).first().click()
	await page.getByText(name, { exact: true }).first().click()
	const entity = /\/[A-Za-z-]+\/[0-9a-f]{24}/
	await page.waitForURL(entity)
	await h.goto(page, `${page.url().match(entity)[0]}/${attribute}`)
}

// A Unique ID field for the capture only: an employee number with a format and a placeholder,
// created just before and deleted right after (a new field would otherwise show, empty, on every
// person, project, task and time entry panel of the other shots).
const UNIQUE_ID = { name: 'Employee number', regex: '^EMP-\\d{4}$', placeholder: 'EMP-0000' }
const uniqueIdField = {
	async up(api) {
		const { getCustomFields } = await api('{ getCustomFields { id name } }')
		for (const f of getCustomFields.filter((f) => f.name === UNIQUE_ID.name)) await api('mutation($id: BeeboleId!) { deleteCustomField(id: $id) { id } }', { id: f.id })
		const { addCustomField } = await api('mutation($name: BeeboleName!, $fieldType: String!) { addCustomField(name: $name, fieldType: $fieldType) { id } }', { name: UNIQUE_ID.name, fieldType: 'uniqueId' })
		const id = addCustomField.id
		await api('mutation($id: BeeboleId!, $r: String) { editCustomFieldUniqueIdOptionValidationRegex(id: $id, validationRegex: $r) { id } }', { id, r: UNIQUE_ID.regex })
		await api('mutation($id: BeeboleId!, $p: String!) { editCustomFieldUniqueIdOptionPlaceholder(id: $id, placeholder: $p) { id } }', { id, p: UNIQUE_ID.placeholder })
		return { id }
	},
	async down(api, state) {
		if (state?.id) await api('mutation($id: BeeboleId!) { deleteCustomField(id: $id) { id } }', { id: state.id })
	},
}

export const scenes = [
	{
		id: 'custom-fields-details',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openFieldPanel(page, h, 'custom-field-details')
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 800, y: 110 }),
		shots: [{ file: 'custom-fields/field-details-type.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Custom field details', 'Custom field visibility') } }],
	},
	{
		id: 'custom-fields-visibility',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		// The panel is taller than 900: a taller window shows it whole.
		viewport: { width: 1440, height: 1300 },
		async setup(page, h) {
			await openFieldPanel(page, h, 'custom-field-visibility')
			await h.settle(page, 1500)
			await h.widenPanel(page, PANEL_WIDTH)
		},
		mouse: () => ({ x: 400, y: 110 }),
		shots: [{ file: 'custom-fields/field-visibility-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Custom field visibility', 'Custom field details') } }],
	},
	{
		// The Custom field details panel of a Unique ID field: its two options.
		id: 'custom-fields-unique-id',
		capturedAt: '2026-10-04',
		datesMatter: false,
		mode: 'auto',
		fixture: uniqueIdField,
		async setup(page, h) {
			await openFieldPanel(page, h, 'custom-field-details', UNIQUE_ID.name)
			await page.getByText('Validation pattern (regex)', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 800, y: 110 }),
		shots: [{ file: 'custom-fields/unique-id-options.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Custom field details', 'Custom field visibility') } }],
	},
]

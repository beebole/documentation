// Scenes for help/documentation/custom-fields.mdx. The Cost center field of the seed layer: a
// text pick list shown on Client projects and time records.
export const page = 'help/documentation/custom-fields.mdx'

// Panels are widened to 800 px: at the default width (576 at 1440)
// the visibility labels break over two lines.
const PANEL_WIDTH = 800

// Opens one panel of the Cost center field through its address (Settings > Custom Fields).
async function openFieldPanel(page, h, attribute) {
	await h.goto(page, '/settings')
	await page.getByText('Custom Fields', { exact: true }).first().click()
	await page.getByText('Cost center', { exact: true }).first().click()
	const entity = /\/[A-Za-z-]+\/[0-9a-f]{24}/
	await page.waitForURL(entity)
	await h.goto(page, `${page.url().match(entity)[0]}/${attribute}`)
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
]

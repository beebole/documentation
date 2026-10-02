// Scenes for help/documentation/public-holidays.mdx.
export const page = 'help/documentation/public-holidays.mdx'

// The London tag gets the United Kingdom calendar for the capture only, and loses it right after:
// the account's people keep the US holidays the seed built their timesheets on.
async function londonTag(api) {
	const { getTags } = await api('{ getTags { id name } }')
	return getTags.find((t) => t.name === 'London').id
}
const londonHolidays = {
	async up(api) {
		const id = await londonTag(api)
		await api('mutation($id: BeeboleId!) { editTagPublicHolidays(id: $id, code: "GB", lang: "en") { id } }', { id })
		return { id }
	},
	async down(api, state) {
		const id = state?.id ?? (await londonTag(api))
		await api('mutation($id: BeeboleId!) { editTagPublicHolidays(id: $id, code: null) { id } }', { id })
	},
}

export const scenes = [
	{
		id: 'public-holidays-panel',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=public-holidays')
			// The holiday names are input values, loaded over the WebSocket.
			await page.waitForFunction(() => [...document.querySelectorAll('input')].some((i) => i.value === 'Christmas Day'))
			await h.settle(page, 1000)
		},
		shots: [{ file: 'public-holidays/holidays-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Public holidays', 'Absence allowances') } }],
	},
	{
		// The Year picker open: two years back, three ahead (opening it changes nothing).
		id: 'public-holidays-year-selector',
		capturedAt: '2026-10-01',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=public-holidays')
			await page.waitForFunction(() => [...document.querySelectorAll('input')].some((i) => i.value === 'Christmas Day'))
			await h.settle(page, 1000)
			// Year is the first picker of the panel.
			await page.locator('public-holidays-attribute bb-autocomplete').filter({ visible: true }).first().click()
			const last = String(new Date().getFullYear() + 3)
			await page.getByText(last, { exact: true }).filter({ visible: true }).first().waitFor()
			// Opening selects the input's text: put the caret at its end, the list stays open.
			await page.evaluate(() => {
				let el = document.activeElement
				while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
				if (el?.setSelectionRange) el.setSelectionRange(el.value.length, el.value.length)
			})
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 400, y: 860 }),
		// From the panel title down to the bottom of the open list.
		shots: [
			{
				file: 'public-holidays/year-selector.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Public holidays', { exact: true }).filter({ visible: true }).first().boundingBox()
						const language = await page.locator('public-holidays-attribute bb-autocomplete').filter({ visible: true }).last().boundingBox()
						// The list offers every year with holidays, past the window too: down to the lowest one.
						let bottom = 0
						for (const l of await page.getByText(/^20\d\d$/).filter({ visible: true }).all()) {
							const b = await l.boundingBox()
							if (b) bottom = Math.max(bottom, b.y + b.height)
						}
						const x = title.x - 64
						const y = title.y - 20
						return { x, y, width: language.x + language.width + 24 - x, height: bottom + 16 - y }
					},
				},
			},
		],
	},
	{
		id: 'public-holidays-tag',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		fixture: londonHolidays,
		// London sits in the Location category, not the one the Tags page opens on: open it by its
		// address, from the id the fixture returns.
		async setup(page, h, state) {
			await h.goto(page, `/tags/${state.id}/public-holidays`)
			await page.waitForFunction(() => [...document.querySelectorAll('input')].some((i) => i.value === 'Boxing Day'))
			await h.settle(page, 1000)
		},
		shots: [{ file: 'public-holidays/tag-holidays-panel.webp', frame: { type: 'full' } }],
	},
]

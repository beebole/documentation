// Scenes for help/documentation/people.mdx.
export const page = 'help/documentation/people.mdx'

// Rest the mouse on the empty header area: over the panel it shows the pin and resize buttons.
const restInHeader = () => ({ x: 800, y: 50 })

export const scenes = [
	{
		id: 'people-list',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/persons', 'Marc Dubois', 'tags')
			await page.getByRole('button', { name: 'Invite by email' }).waitFor()
			await page.getByPlaceholder('Add a tag here').waitFor()
			await h.settle(page)
		},
		mouse: restInHeader,
		shots: [{ file: 'people/people-list.webp', frame: { type: 'full' } }],
	},
	{
		// Three people checked in the list: the bulk bar appears at the bottom. A short window keeps
		// the bar next to the rows. Nothing is sent.
		id: 'people-bulk-actions',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		viewport: { width: 1440, height: 560 },
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByText('Sophie Laurent', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
			for (const name of ['Carlos Ruiz', 'Clara Fontaine', 'David Kim']) {
				const box = h.listRow(page, name).locator('input[type=checkbox]').first()
				if (!(await box.isChecked())) await box.check({ force: true })
			}
			await page.getByText('3 Selected', { exact: false }).first().waitFor()
			await page.evaluate(() => document.activeElement?.blur())
			await h.settle(page, 1000)
		},
		mouse: restInHeader,
		// From the first row of the list down to the bar.
		shots: [
			{
				file: 'people/bulk-actions-menu.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const first = await page.getByText('Ana Pereira', { exact: true }).first().boundingBox()
						const bar = await page.getByText('Select All', { exact: true }).first().evaluate((leaf) => {
							let el = leaf
							while (el && el.getBoundingClientRect().width < 600) el = el.parentElement ?? el.getRootNode().host
							const r = el.getBoundingClientRect()
							return { x: r.x, y: r.y, width: r.width, height: r.height }
						})
						const x = first.x - 64
						const y = first.y - 20
						return { x, y, width: bar.x + bar.width + 24 - x, height: bar.y + bar.height + 16 - y }
					},
				},
			},
		],
	},
]

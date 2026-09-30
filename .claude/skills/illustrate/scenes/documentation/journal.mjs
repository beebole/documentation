// Scenes for help/documentation/journal.mdx.
export const page = 'help/documentation/journal.mdx'

export const scenes = [
	{
		id: 'journal-feed',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			// The organisation's Journal is empty on the documentation account (its data came in
			// through the API); a person's Journal shows the changes made to their records.
			await h.openPanel(page, '/persons', 'Ana Pereira', 'journal')
			await page.getByText(/Added time record/).first().waitFor()
			await h.settle(page, 1500)
		},
		// Off the panel, which shows its pin and resize buttons under the mouse.
		mouse: () => ({ x: 800, y: 110 }),
		// The person's details panel: header and Journal feed.
		shots: [
			{
				file: 'journal/activity-feed.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Journal', { exact: true }).filter({ visible: true }).first().boundingBox()
						const x = title.x - 24
						return { x, y: 0, width: 1440 - x, height: 900 }
					},
				},
			},
		],
	},
]

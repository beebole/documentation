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
]

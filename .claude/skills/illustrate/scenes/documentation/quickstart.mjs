// Scenes for help/documentation/quickstart.mdx.
import { openLastFullWeek } from './timesheets.mjs'

export const page = 'help/documentation/quickstart.mdx'

export const scenes = [
	{
		id: 'quickstart-add-row-button',
		capturedAt: '2026-09-29',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
		},
		shots: [
			{
				file: 'timesheets/add-row-button.webp',
				frame: { type: 'lens', target: (page) => page.getByRole('button', { name: 'Add a row' }).first(), context: { x: 68, y: 0, width: 960, height: 560 } },
			},
		],
	},
	{
		id: 'quickstart-signup',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		signedOut: true,
		async setup(page, h) {
			await h.goto(page, '/signup')
			await h.settle(page, 1500)
		},
		shots: [{ file: 'quickstart/signup-form.webp', frame: { type: 'full' } }],
	},
]

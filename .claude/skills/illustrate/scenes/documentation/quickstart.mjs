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
]

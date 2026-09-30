// Scenes for help/integrations/microsoft-calendar.mdx.
import { openLastFullWeek } from '../documentation/timesheets.mjs'

export const page = 'help/integrations/microsoft-calendar.mdx'

export const scenes = [
	{
		id: 'microsoft-calendar-pane',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			const open = await h.byTooltip(page, page.locator('body'), 'Import your calendar events')
			await open.click()
			await h.settle(page, 2000)
		},
		shots: [{ file: 'integrations/microsoft-calendar-pane.webp', frame: { type: 'full' } }],
	},
]

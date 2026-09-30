// Scenes for help/documentation/mobile.mdx. Phone size (390×844).
import { timerFixture } from './timesheets.mjs'

export const page = 'help/documentation/mobile.mdx'

async function openThisWeek(page, h) {
	// Opening /timesheet directly lands on People: go through the menu, as the page says.
	await h.goto(page, '/persons')
	await page.getByRole('button').first().click()
	await page.getByRole('link', { name: 'Timesheet' }).click()
	await h.settle(page, 3000)
	// The list opens with last week's header stacked over this week's: scroll until this
	// week's header reaches the top bar.
	const nextHeaderTop = await page.evaluate(() => {
		const tops = [...document.querySelectorAll('body *')]
			.filter((e) => e.childElementCount === 0 && /^\w{3} \d+ → \w{3} \d+, \d{4}$/.test(e.textContent.trim()))
			.map((e) => e.getBoundingClientRect())
			.filter((r) => r.width > 0 && r.top > 120)
			.map((r) => r.top)
		return Math.min(...tops)
	})
	if (!Number.isFinite(nextHeaderTop)) throw new Error('current week header not found')
	await page.mouse.move(195, 500)
	// 108: just under the top bar, where the sticky period header sits.
	await page.mouse.wheel(0, nextHeaderTop - 108)
	await h.settle(page, 1000)
}

export const scenes = [
	{
		id: 'mobile-timesheet',
		capturedAt: '2026-09-29',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		async setup(page, h) {
			await openThisWeek(page, h)
		},
		mouse: () => ({ x: 380, y: 10 }),
		shots: [{ file: 'mobile/mobile-timesheet.webp', frame: { type: 'full' } }],
	},
	{
		id: 'mobile-timer',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		// A running entry on today's card, created just before the capture and removed after.
		fixture: timerFixture([{ projects: ['Fleet Tracker', 'Development'], start: '11:15' }]),
		async setup(page, h) {
			await openThisWeek(page, h)
		},
		mouse: () => ({ x: 380, y: 10 }),
		shots: [{ file: 'mobile/mobile-timer.webp', frame: { type: 'full' } }],
	},
]

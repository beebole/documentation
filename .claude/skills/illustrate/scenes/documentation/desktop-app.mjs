// Scenes for help/documentation/desktop-app.mdx.
import { cornerButton } from './timesheets.mjs'

export const page = 'help/documentation/desktop-app.mdx'

// A suggestion from the desktop app, for the capture only: two hours on Website Redesign,
// Development, this morning, pushed for Jordan Reed (the signed-in person) the way the app pushes
// one. Pushing the same signal with no duration withdraws it right after. Times are wall-clock
// time in the organisation's zone, written as if UTC (see timerFixture).
const SIGNAL = 'docs-screenshot-desktop'
const pushDesktop = async (api, date, hours) => {
	const { getProjects } = await api('{ getProjects { id name } }')
	const projectIds = ['Website Redesign', 'Development'].map((n) => getProjects.find((p) => p.name === n).id)
	const start = Date.parse(`${date}T09:00:00Z`)
	await api('mutation($s: [BeeboleTimeRecordSuggestionInput!]!) { pushTimeRecordSuggestions(source: "desktop", suggestions: $s) { id } }', {
		s: [{ startTime: start, endTime: start + hours * 3600000, duration: hours * 3600000, projectIds, signalKey: SIGNAL, confidence: 0.9 }],
	})
}
const desktopSuggestion = {
	async up(api, { date }) {
		await pushDesktop(api, date, 2)
		return { date }
	},
	async down(api, state) {
		await pushDesktop(api, state.date, 0)
	},
}

export const scenes = [
	{
		id: 'desktop-app-downloads',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/ai')
			await page.getByText('Linux (deb)', { exact: true }).first().waitFor()
			// On the QA server only, the box adds a note and a command to point the app at QA:
			// hidden, so the section reads as customers see it.
			await page.evaluate(() => {
				const deb = [...document.querySelectorAll('a')].find((a) => a.textContent.trim() === 'Linux (deb)')
				const box = deb.closest('.rounded-xl')
				for (const child of box.children) {
					if (/QA server|desktop-qa\.mjs|Switch the desktop app to QA/.test(child.textContent)) child.style.setProperty('display', 'none')
				}
			})
			await page.getByText('Linux (deb)', { exact: true }).first().scrollIntoViewIfNeeded()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'ai/desktop-download-links.webp', frame: { type: 'element', locate: (page) => page.locator('section').filter({ has: page.getByText('Linux (deb)', { exact: true }) }).last(), pad: 16 } }],
	},
	{
		id: 'desktop-suggestion-why',
		capturedAt: '2026-10-01',
		datesMatter: true,
		mode: 'auto',
		fixture: desktopSuggestion,
		viewport: { width: 1440, height: 1100 },
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByRole('link', { name: 'Timesheet' }).click()
			await page.getByRole('button', { name: 'Previous' }).waitFor()
			// The tray only opens in the grid view (see ai-suggested-entries).
			await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').first().click()
			await h.settle(page, 1500)
			await (await cornerButton(page, h, 'Suggested entries')).click()
			await page.getByRole('button', { name: 'Accept all' }).waitFor()
			await page.getByText('Desktop', { exact: true }).first().waitFor()
			await h.settle(page, 1000)
			// Why? on the Desktop card (the last one, today's): on a machine other than the one that
			// tracked the activity, it says the details stay in the desktop app.
			await page.getByText('Why?', { exact: true }).last().click()
			await h.settle(page, 1200)
			await page.getByText('Why?', { exact: true }).last().scrollIntoViewIfNeeded()
			await h.settle(page, 800)
		},
		// Today's day heading and its Desktop card, with the Why? answer.
		shots: [
			{
				file: 'ai/desktop-suggestion-why.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page, h) => {
						const card = await h.surfaceAround(page, 'Desktop')
						const day = await page.getByText('October', { exact: true }).filter({ visible: true }).last().boundingBox()
						const y = day.y - 16
						return { x: card.x - 12, y, width: card.width + 24, height: card.y + card.height + 12 - y }
					},
				},
			},
		],
	},
]

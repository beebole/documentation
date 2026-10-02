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

// A suggestion for the capture only: an hour and a half on Website Redesign, Development,
// this morning, pushed for Jordan Reed (signed in) the way the desktop app pushes one, so it
// shows as a ghost row on today. (Yesterday is a full day, and gets no ghost row.) Pushing the same signal
// with no duration withdraws it after. Times are wall-clock time written as if UTC.
const SIGNAL = 'docs-screenshot-mobile'
const pushToday = async (api, date, hours) => {
	const { getProjects } = await api('{ getProjects { id name } }')
	const projectIds = ['Website Redesign', 'Development'].map((n) => getProjects.find((p) => p.name === n).id)
	const start = Date.parse(`${date}T09:00:00Z`)
	await api('mutation($s: [BeeboleTimeRecordSuggestionInput!]!) { pushTimeRecordSuggestions(source: "desktop", suggestions: $s) { id } }', {
		s: [{ startTime: start, endTime: start + hours * 3600000, duration: hours * 3600000, projectIds, signalKey: SIGNAL, confidence: 0.9 }],
	})
}
const todaySuggestion = {
	async up(api, { date }) {
		await pushToday(api, date, 1.5)
		return { date }
	},
	async down(api, state) {
		await pushToday(api, state.date, 0)
	},
}

// The suggestions show once the sparkles button of the header is on (it is off for Jordan Reed,
// and shows dimmed with the number of suggestions).
async function showSuggestions(page, h) {
	const off = page.locator('timesheet-mobile-header button.bb-btn-square.opacity-60').filter({ visible: true })
	if (await off.count()) await off.first().click()
	await h.settle(page, 1000)
}

// Yesterday's Sales entry, on screen once openThisWeek has scrolled to the current week.
const salesCard = (page) => page.locator('timesheet-mobile-record-card').filter({ hasText: 'Pipeline review' }).last()

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
	{
		// The team button of the header (the only secondary square button carrying a badge slot)
		// opens the approval sheet on its Pending tab.
		id: 'mobile-approval-sheet',
		capturedAt: '2026-10-01',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		async setup(page, h) {
			await openThisWeek(page, h)
			await page.locator('button.relative.bb-btn-secondary.bb-btn-square').filter({ visible: true }).first().click()
			// The sheet loads the pending weeks after opening: wait for the tab's count.
			await page.getByText(/^\(\d+\)$/).filter({ visible: true }).first().waitFor({ timeout: 20000 })
			await h.settle(page, 2500)
		},
		mouse: () => ({ x: 380, y: 10 }),
		shots: [{ file: 'mobile/mobile-approval-sheet.webp', frame: { type: 'full' } }],
	},
	{
		// The theme is Auto (the account's default), so a dark device turns the app dark.
		id: 'mobile-dark-mode',
		capturedAt: '2026-10-01',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		async setup(page, h) {
			await page.emulateMedia({ colorScheme: 'dark' })
			await openThisWeek(page, h)
		},
		mouse: () => ({ x: 380, y: 10 }),
		shots: [{ file: 'mobile/dark-mode.webp', frame: { type: 'full' } }],
	},
	{
		// The sidebar, opened from the hamburger button at the top left (step 1 of How to log hours).
		id: 'mobile-sidebar',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		async setup(page, h) {
			await openThisWeek(page, h)
			await page.getByRole('button').first().click()
			await page.getByRole('link', { name: 'Timesheet' }).waitFor()
			await h.settle(page, 1000)
		},
		mouse: () => ({ x: 380, y: 830 }),
		shots: [{ file: 'mobile/mobile-sidebar.webp', frame: { type: 'full' } }],
	},
	{
		// The + button opens the activity selector: Working activity, then a category, lists its clients.
		id: 'mobile-activity-drilldown',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		async setup(page, h) {
			await openThisWeek(page, h)
			await page.locator('timesheet-mobile-fab button').click()
			await page.getByRole('button', { name: 'Working activity' }).click()
			await page.getByText('Client', { exact: true }).filter({ visible: true }).last().click()
			await page.getByText('Acme Corp', { exact: true }).filter({ visible: true }).last().waitFor()
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 380, y: 10 }),
		shots: [{ file: 'mobile/mobile-activity-picker.webp', frame: { type: 'full' } }],
	},
	{
		// Tapping an entry card opens it in the editor sheet.
		id: 'mobile-editor-sheet',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		async setup(page, h) {
			await openThisWeek(page, h)
			await salesCard(page).click()
			await page.locator('timesheet-mobile-editor-sheet bb-bottom-sheet[open]').waitFor({ state: 'attached' })
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 380, y: 10 }),
		shots: [{ file: 'mobile/mobile-editor-sheet.webp', frame: { type: 'full' } }],
	},
	{
		// A left swipe on a card reveals its delete action. The swipe is a touch gesture, so the
		// scene sets the card's offset to its revealed position instead.
		id: 'mobile-swipe-delete',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		async setup(page, h) {
			await openThisWeek(page, h)
			await salesCard(page).locator('bb-swipeable').evaluate((el) => {
				el.translateX = -el.actionWidth
			})
			await h.settle(page, 800)
		},
		mouse: () => ({ x: 380, y: 10 }),
		shots: [{ file: 'mobile/mobile-swipe-delete.webp', frame: { type: 'full' } }],
	},
	{
		id: 'mobile-suggestion-row',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		fixture: todaySuggestion,
		async setup(page, h) {
			await openThisWeek(page, h)
			await showSuggestions(page, h)
			await page.locator('timesheet-mobile-suggestion-row').filter({ hasText: 'Website Redesign' }).first().waitFor({ timeout: 20000 })
			await h.settle(page, 1000)
		},
		mouse: () => ({ x: 380, y: 10 }),
		shots: [{ file: 'mobile/mobile-suggestion-row.webp', frame: { type: 'full' } }],
	},
	{
		// Tapping the ghost row opens the suggestion in its sheet (bin, play, check).
		id: 'mobile-suggestion-sheet',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		fixture: todaySuggestion,
		async setup(page, h) {
			await openThisWeek(page, h)
			await showSuggestions(page, h)
			const row = page.locator('timesheet-mobile-suggestion-row').filter({ hasText: 'Website Redesign' }).first()
			await row.waitFor({ timeout: 20000 })
			await row.getByText('Website Redesign').click()
			await page.locator('timesheet-mobile-suggestion-sheet bb-bottom-sheet[open]').waitFor({ state: 'attached' })
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 380, y: 10 }),
		shots: [{ file: 'mobile/mobile-suggestion-sheet.webp', frame: { type: 'full' } }],
	},
	{
		// A pending week opened from the approval sheet: Approve and Reject in the header.
		id: 'mobile-approve-reject',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		async setup(page, h) {
			await openThisWeek(page, h)
			await page.locator('button.relative.bb-btn-secondary.bb-btn-square').filter({ visible: true }).first().click()
			await page.getByText(/^\(\d+\)$/).filter({ visible: true }).first().waitFor({ timeout: 20000 })
			await h.settle(page, 1500)
			const item = page.locator('timesheet-member-item').filter({ visible: true }).first()
			const box = await item.boundingBox()
			await page.mouse.click(box.x + box.width * 0.6, box.y + 18)
			await page.getByRole('button', { name: 'Approve', exact: true }).filter({ visible: true }).first().waitFor({ timeout: 20000 })
			await h.settle(page, 2500)
		},
		mouse: () => ({ x: 380, y: 830 }),
		shots: [{ file: 'mobile/mobile-approve-reject.webp', frame: { type: 'full' } }],
	},
	{
		// Scrolled up to the week before this one: the Today button shows in the footer, as today
		// is out of view.
		id: 'mobile-today-button',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		viewport: { width: 390, height: 844 },
		async setup(page, h) {
			await openThisWeek(page, h)
			// Last week's Sunday row ("Sun, September 20"), scrolled up to just under the stacked
			// period headers. (Last week's header itself stays stacked over this week's at the top.)
			const label = await page.evaluate(() => {
				const d = new Date()
				const sunday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay() - 7)
				return sunday.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
			})
			const row = page.getByText(label, { exact: true }).filter({ visible: true }).first()
			for (let i = 0; i < 12 && !(await row.count()); i++) {
				await page.mouse.wheel(0, -400)
				await h.settle(page, 600)
			}
			const top = (await row.boundingBox())?.y
			if (top === undefined) throw new Error(`day row ${label} not found`)
			await page.mouse.wheel(0, top - 170)
			await h.settle(page, 1000)
			await page.getByText('Today', { exact: true }).filter({ visible: true }).first().waitFor()
		},
		mouse: () => ({ x: 380, y: 10 }),
		shots: [{ file: 'mobile/mobile-today-button.webp', frame: { type: 'full' } }],
	},
]

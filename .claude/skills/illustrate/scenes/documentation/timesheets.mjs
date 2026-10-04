// Scenes for help/documentation/timesheets.mdx. Jordan Reed's timesheet, the last full week
// before the capture date (the current week is only partly filled on a capture day).
export const page = 'help/documentation/timesheets.mdx'

// The timesheet can reopen on a side pane (Team or Approval, both with a Show all switch): Jordan
// Reed's saved view on QA opens the Team pane since about October 1, 2026. Close it so the grid
// has the full width. openLastFullWeek and openCurrentWeek close it; scenes that show a pane open it.
// The pane's own text ("0 team") would match a loose tooltip search, so the Team button is found
// by its exact tooltip; a click on it switches an Approval pane to Team, a second one closes it.
export async function closeSidePane(page, h) {
	const pane = page.getByText('Show all', { exact: true }).filter({ visible: true })
	for (let i = 0; i < 2 && (await pane.count()); i++) {
		await (await h.byTooltip(page, page.locator('timesheet-corner'), /^Team$/)).click()
		await h.settle(page, 800)
	}
	if (await pane.count()) throw new Error('could not close the timesheet side pane')
}

export async function openLastFullWeek(page, h) {
	// Opening /timesheet directly lands on People, so go through the sidebar link.
	await h.goto(page, '/persons')
	await page.getByRole('link', { name: 'Timesheet' }).click()
	await page.getByRole('button', { name: 'Previous' }).waitFor()
	// Unnamed Grid/Calendar toggle: first button next to the "Timesheet" heading
	// (see missing-labels.md). Grid is the account's baseline, so this leaves no trace.
	await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').first().click()
	// Go back exactly one week. The date range is an input's value ("Sep 27 → Oct 3, 2026"); a
	// click that lands before the timesheet has loaded is lost, so confirm the value changed
	// (one retry), then wait until the grid's first day matches it (the label moves first).
	const readRange = () =>
		page.evaluate(() => [...document.querySelectorAll('input')].find((i) => i.value.includes('→') && i.getBoundingClientRect().width > 0)?.value ?? '')
	await h.settle(page)
	// Closing the pane brings the timesheet back to the current week: close it before going back.
	await closeSidePane(page, h)
	const before = await readRange()
	if (!before) throw new Error('timesheet date range not found')
	for (let i = 0; i < 2 && (await readRange()) === before; i++) {
		await page.getByRole('button', { name: 'Previous' }).click()
		await page.waitForFunction((b) => [...document.querySelectorAll('input')].some((x) => x.value.includes('→') && x.value !== b), before, { timeout: 8000 }).catch(() => {})
	}
	const after = await readRange()
	if (after === before) throw new Error('could not go back to the previous week')
	const firstDay = after.match(/\d+/)[0]
	await page.waitForFunction((d) => document.querySelector('.ts-head-day')?.textContent.replace(/\D+/g, ' ').trim().split(' ')[0] === d, firstDay, { timeout: 15000 })
	await page.getByText('Acme Corp: Website Redesign', { exact: true }).first().waitFor()
	await h.settle(page)
}

// The grid cell for a row label and a weekday, found from the row label and the day header.
async function cell(page, rowLabel, weekday) {
	const handle = await page.evaluateHandle(
		({ rowLabel, weekday }) => {
			const label = [...document.querySelectorAll('body *')].find(
				(e) => e.childElementCount === 0 && e.textContent.trim() === rowLabel && e.getBoundingClientRect().width > 0
			)
			const day = [...document.querySelectorAll('.ts-head-day')].find((d) => d.textContent.trim().startsWith(weekday))
			if (!label || !day) return null
			const row = label.getBoundingClientRect()
			const col = day.getBoundingClientRect()
			return [...document.querySelectorAll('.ts-cell')].find((c) => {
				const r = c.getBoundingClientRect()
				return r.top <= row.top + 8 && r.bottom >= row.top + 8 && r.left <= col.left + 5 && r.right >= col.left + 5
			})
		},
		{ rowLabel, weekday }
	)
	const el = handle.asElement()
	if (!el) throw new Error(`no cell for ${rowLabel} on ${weekday}`)
	return el
}

const clearRows = (page) => page.locator('timesheet-section-head').first().getByRole('button', { name: 'Clear all rows in this section' })

export const cornerButton = (page, h, tooltip) => h.byTooltip(page, page.locator('timesheet-corner'), tooltip)

// A running timer is a record of today with a start time, its end set to the start of the day
// (UTC midnight) and no duration. Start times are stored as wall-clock time in the
// organisation's zone (New York), written as if UTC: 11:15 is 45 minutes before the frozen noon
// (45 minutes, because the app shows running totals unrounded: 0.75 h reads cleanly). A timed
// entry that was paused is an ordinary record of the day with its duration (this account records
// durations, not start and end times).
// The fixture removes any leftover running record first, and returns the ids and the day start.
export function timerFixture(entries) {
	return {
		async up(api, { date }) {
			const dayStart = Date.parse(`${date}T00:00:00Z`)
			const { getPersons } = await api('{ getPersons { id name } }')
			const personId = getPersons.find((p) => p.name === 'Jordan Reed').id
			const { getProjects } = await api('{ getProjects { id name } }')
			const day = await api('query($s: BeeboleTimestamp!, $e: BeeboleTimestamp!) { getTimeRecords(startTime: $s, endTime: $e) { id startTime { ts } endTime { ts } person { id } } }', { s: dayStart, e: dayStart + 86400000 })
			const leftovers = day.getTimeRecords.filter((r) => r.person?.id === personId && r.endTime?.ts === dayStart && r.startTime?.ts > dayStart).map((r) => r.id)
			if (leftovers.length) await api('mutation($ids: [BeeboleId!]!) { deleteTimeRecords(ids: $ids) { id } }', { ids: leftovers })
			const ids = []
			for (const e of entries) {
				const projectIds = e.projects.map((n) => getProjects.find((p) => p.name === n).id)
				const startTime = e.start ? Date.parse(`${date}T${e.start}:00Z`) : dayStart
				const { addTimeRecord } = await api(
					'mutation($s: BeeboleTimestamp!, $e: BeeboleTimestamp!, $d: Float!, $p: BeeboleId!, $ids: [BeeboleId!]!) { addTimeRecord(startTime: $s, endTime: $e, duration: $d, personId: $p, projectIds: $ids) { id } }',
					{ s: startTime, e: dayStart, d: e.start ? 0 : e.hours * 3600000, p: personId, ids: projectIds }
				)
				ids.push(addTimeRecord.id)
			}
			return { ids, dayStart }
		},
		async down(api, state) {
			if (state?.ids?.length) await api('mutation($ids: [BeeboleId!]!) { deleteTimeRecords(ids: $ids) { id } }', { ids: state.ids })
		},
	}
}

const runningTimer = timerFixture([{ projects: ['Fleet Tracker', 'Development'], start: '11:15' }])

// Opens the current week in Grid view, through the sidebar link (see openLastFullWeek).
async function openCurrentWeek(page, h, rowName) {
	await h.goto(page, '/persons')
	await page.getByRole('link', { name: 'Timesheet' }).click()
	await page.getByRole('button', { name: 'Previous' }).waitFor()
	await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').first().click()
	await page.getByText(rowName, { exact: true }).first().waitFor()
	await h.settle(page, 2000)
	await closeSidePane(page, h)
}

// Two days of PTO for Jordan Reed on Monday and Tuesday of the week after the capture date,
// booked ahead for the capture only (future time off is allowed on the account).
const timeOffNextWeek = {
	async up(api, { date }) {
		const day = Date.parse(`${date}T00:00:00Z`)
		const monday = day + ((8 - new Date(day).getUTCDay()) % 7 || 7) * 86400000
		const { getPersons } = await api('{ getPersons { id name } }')
		const { getAbsenceTypes } = await api('{ getAbsenceTypes { id name } }')
		const personId = getPersons.find((p) => p.name === 'Jordan Reed').id
		const absenceId = getAbsenceTypes.find((a) => a.name === 'PTO').id
		const ids = []
		for (const ts of [monday, monday + 86400000]) {
			const { addTimeRecord } = await api(
				'mutation($s: BeeboleTimestamp!, $e: BeeboleTimestamp!, $d: Float!, $p: BeeboleId!, $a: BeeboleId!) { addTimeRecord(startTime: $s, endTime: $e, duration: $d, personId: $p, absenceId: $a) { id } }',
				{ s: ts, e: ts + 86400000, d: 8 * 3600000, p: personId, a: absenceId }
			)
			ids.push(addTimeRecord.id)
		}
		return { ids }
	},
	async down(api, state) {
		if (state?.ids?.length) await api('mutation($ids: [BeeboleId!]!) { deleteTimeRecords(ids: $ids) { id } }', { ids: state.ids })
	},
}

// A day's header in the calendar view, by its weekday ("Wed").
const dayHeader = (page, weekday) => page.locator('div.cursor-pointer.select-none').filter({ hasText: new RegExp(`^\\s*${weekday}\\b`) }).filter({ visible: true }).first()

// Opens the last full week in Calendar view.
async function openLastFullWeekCalendar(page, h) {
	await openLastFullWeek(page, h)
	// Second button of the unnamed Grid/Calendar toggle (see missing-labels.md).
	await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').nth(1).click()
	await page.getByText('9 AM').first().waitFor()
	await h.settle(page)
}

// A run of short entries with start and end times between 10 and 11 AM on Friday of the last
// full week (left empty by the seed so far: its entries carry durations only and fill the day
// from 9 AM, so they would sit under these), for the capture only: what the hour zoom is for.
// An hour inside the schedule keeps the hatching of off-hours out of the frame. Durations of 3, 6 and 15 minutes keep the hour totals to two
// decimals. Times are wall-clock time written as if UTC (see timerFixture).
const SHORT_ENTRIES = [
	{ projects: ['Website Redesign', 'Meeting'], start: '10:05', end: '10:20' },
	{ projects: ['Dashboard', 'Analysis'], start: '10:20', end: '10:26' },
	{ projects: ['Dashboard', 'Analysis'], start: '10:26', end: '10:29' },
	{ projects: ['Fleet Tracker', 'Development'], start: '10:30', end: '10:45' },
]
const shortEntries = {
	async up(api, { date }) {
		const day = Date.parse(`${date}T00:00:00Z`)
		const friday = day - new Date(day).getUTCDay() * 86400000 - 7 * 86400000 + 5 * 86400000
		const iso = new Date(friday).toISOString().slice(0, 10)
		const { getPersons } = await api('{ getPersons { id name } }')
		const personId = getPersons.find((p) => p.name === 'Jordan Reed').id
		const { getProjects } = await api('{ getProjects { id name } }')
		const hour = Date.parse(`${iso}T10:00:00Z`)
		const existing = await api('query($s: BeeboleTimestamp!, $e: BeeboleTimestamp!) { getTimeRecords(startTime: $s, endTime: $e) { id startTime { ts } person { id } } }', { s: friday, e: friday + 86400000 })
		const leftovers = existing.getTimeRecords.filter((r) => r.person?.id === personId && r.startTime?.ts >= hour && r.startTime?.ts < hour + 3600000).map((r) => r.id)
		if (leftovers.length) await api('mutation($ids: [BeeboleId!]!) { deleteTimeRecords(ids: $ids) { id } }', { ids: leftovers })
		const ids = []
		for (const e of SHORT_ENTRIES) {
			const projectIds = e.projects.map((n) => getProjects.find((p) => p.name === n).id)
			const start = Date.parse(`${iso}T${e.start}:00Z`)
			const end = Date.parse(`${iso}T${e.end}:00Z`)
			const { addTimeRecord } = await api(
				'mutation($s: BeeboleTimestamp!, $e: BeeboleTimestamp!, $d: Float!, $p: BeeboleId!, $ids: [BeeboleId!]!) { addTimeRecord(startTime: $s, endTime: $e, duration: $d, personId: $p, projectIds: $ids) { id } }',
				{ s: start, e: end, d: end - start, p: personId, ids: projectIds }
			)
			ids.push(addTimeRecord.id)
		}
		return { ids }
	},
	async down(api, state) {
		if (state?.ids?.length) await api('mutation($ids: [BeeboleId!]!) { deleteTimeRecords(ids: $ids) { id } }', { ids: state.ids })
	},
}

export const scenes = [
	{
		id: 'timesheets-weekly-grid',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
		},
		shots: [{ file: 'timesheets/weekly-grid.webp', frame: { type: 'full' } }],
	},
	{
		id: 'timesheets-entry-details',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			const target = await cell(page, 'Acme Corp: Website Redesign', 'Mon')
			await target.hover()
			// The info button sits in the entry's top-right corner. The other buttons in a cell
			// are the − / + steppers, which change the entry: never click those.
			const info = await target.$('button.absolute')
			if (!info) throw new Error('entry info button not found')
			await info.click()
			await page.locator('.timesheetPopup').waitFor()
			await h.settle(page)
		},
		shots: [{ file: 'timesheets/entry-details.webp', frame: { type: 'element', locate: (page) => page.locator('.timesheetPopup'), pad: 16 } }],
	},
	{
		id: 'timesheets-calendar-view',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			// Second button of the unnamed Grid/Calendar toggle (see missing-labels.md).
			await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').nth(1).click()
			await page.getByText('9 AM').first().waitFor()
			await h.settle(page)
		},
		shots: [{ file: 'timesheets/calendar-view.webp', frame: { type: 'full' } }],
	},
	{
		id: 'timesheets-import-calendar-button',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
		},
		shots: [
			{
				file: 'timesheets/import-calendar-button.webp',
				frame: { type: 'lens', target: (page, h) => cornerButton(page, h, 'Import your calendar events'), context: { x: 68, y: 0, width: 960, height: 560 } },
			},
		],
	},
	{
		id: 'timesheets-copy-button',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
		},
		shots: [
			{
				file: 'timesheets/copy-button.webp',
				frame: { type: 'lens', target: (page, h) => cornerButton(page, h, 'Copy your timesheet'), context: { x: 68, y: 0, width: 960, height: 560 } },
			},
		],
	},
	{
		id: 'timesheets-row-menu',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			const label = page.getByText('Acme Corp: Website Redesign', { exact: true }).first()
			await label.hover()
			// The row's ⋯ button appears on hover (bb-btn-action, unnamed: see missing-labels.md).
			// The ⋯ button slides in on hover and the menu anchors to where it is at click time:
			// wait until it has settled.
			const dots = page.locator('.bb-btn-action').filter({ visible: true }).first()
			await h.stableBox(page, dots)
			await dots.click()
			await page.getByText('Pin to top', { exact: true }).waitFor()
			await h.settle(page)
		},
		// Rest the mouse on the row's name, so its ⋯ button stays visible next to the open menu.
		async mouse(page) {
			const row = await page.getByText('Acme Corp: Website Redesign', { exact: true }).first().boundingBox()
			return { x: row.x + 40, y: row.y + row.height / 2 }
		},
		// From the Client section header to just below the menu.
		shots: [
			{
				file: 'timesheets/row-menu.webp',
				frame: {
					type: 'box',
					box: async (page, h) => {
						const header = await page.getByText('Client', { exact: true }).first().boundingBox()
						const menu = await h.stableBox(page, page.getByText('Pin to top', { exact: true }).locator('xpath=ancestor::*[contains(@class, "bb-popup")][1]'))
						const x = 100
						const y = header.y - 16
						return { x, y, width: menu.x + menu.width + 48 - x, height: menu.y + menu.height + 24 - y }
					},
				},
			},
		],
	},
	{
		id: 'timesheets-timer',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		fixture: runningTimer,
		async setup(page, h) {
			await openCurrentWeek(page, h, 'Quantum Logistics: Fleet Tracker')
			// The floating timer opens over the date picker; drag it to the empty lower right.
			// Its position is kept in the browser only. It names the entry with the client's
			// initials ("QL. Fleet Tracker").
			const handle = await page.locator('floating-timer').getByText(/Fleet Tracker$/).first().boundingBox()
			await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
			await page.mouse.down()
			await page.mouse.move(1040, 780, { steps: 12 })
			await page.mouse.up()
			await h.settle(page, 800)
		},
		// Lens on the row's timer button (the text says "click the timer button on the row"),
		// with the floating timer visible at the bottom of the full screen.
		shots: [
			{
				file: 'timesheets/timer-running.webp',
				frame: {
					type: 'lens',
					// The row's timer control is a clickable span around the avatar and its play/pause
					// badge, not a button (see missing-labels.md).
					target: (page) =>
						page
							.getByText('Quantum Logistics: Fleet Tracker', { exact: true })
							.first()
							.locator('xpath=ancestor::*[.//span[contains(@class, "timer-icon")]][1]')
							.locator('span[class*="timer-icon"]')
							.first(),
				},
			},
		],
	},
	{
		id: 'timesheets-team-pane',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			await (await cornerButton(page, h, /^Team$/)).click()
			// Approval badges arrive after the pane (over the app's WebSocket, which network idle does
			// not track). The score ring around each avatar is gone from the app (dev, 2026-09-29).
			await page.locator('timesheet-member-item').filter({ hasText: 'Ana Pereira' }).first().locator('timesheet-approval-status').waitFor()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'timesheets/team-pane.webp', frame: { type: 'full' } }],
	},
	{
		id: 'timesheets-calendar-timer',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		fixture: runningTimer,
		async setup(page, h) {
			await openCurrentWeek(page, h, 'Quantum Logistics: Fleet Tracker')
			// Second button of the unnamed Grid/Calendar toggle (see missing-labels.md).
			await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').nth(1).click()
			await page.getByText('9 AM').first().waitFor()
			await h.settle(page, 2000)
		},
		// On the running entry, so its play/pause button shows.
		async mouse(page) {
			const entry = await page.getByText('0.75', { exact: true }).filter({ visible: true }).last().boundingBox()
			return { x: entry.x - 40, y: entry.y + entry.height / 2 + 6 }
		},
		// The whole week, 8 AM to 3 PM: the running entry on today with the days around it, on
		// whatever weekday the capture falls.
		shots: [
			{
				file: 'timesheets/calendar-timer-running.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						// Day headers read "Mon 28", split over separate text pieces: find them in the page.
						const day = (name) =>
							page.evaluate((name) => {
								const el = [...document.querySelectorAll('div')].find((e) => new RegExp(`^${name} \\d+$`).test(e.textContent.replace(/\s+/g, ' ').trim()) && e.getBoundingClientRect().width > 0)
								const r = el?.getBoundingClientRect()
								return r && { x: r.x, y: r.y }
							}, name)
						const sun = await day('Sun')
						const fri = await day('Fri')
						const sat = await day('Sat')
						const eight = await page.getByText('8 AM', { exact: true }).first().boundingBox()
						const three = await page.getByText('3 PM', { exact: true }).first().boundingBox()
						const x = eight.x - 16
						const y = sun.y - 4
						// Saturday's label plus one column width: the end of the grid.
						return { x, y, width: Math.min(sat.x + (sat.x - fri.x), 1440) - x, height: three.y + three.height + 8 - y }
					},
				},
			},
		],
	},
	{
		id: 'timesheets-timer-shelf',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		// Two timers running (45 and 20 minutes at the frozen noon) and one activity paused earlier.
		fixture: timerFixture([
			{ projects: ['Fleet Tracker', 'Development'], start: '11:15' },
			{ projects: ['Website Redesign', 'Meeting'], start: '11:40' },
			{ projects: ['Dashboard', 'Analysis'], hours: 1.5 },
		]),
		async setup(page, h, { ids, dayStart }) {
			// The shelf lives in the browser (bb-timer-shelf): list the paused entry on it; the app adds
			// the running ones from the server.
			await page.addInitScript(
				({ recordId, dayStart }) => localStorage.setItem('bb-timer-shelf', JSON.stringify([{ recordId, dayStart, running: null }])),
				{ recordId: ids[2], dayStart }
			)
			await openCurrentWeek(page, h, 'Quantum Logistics: Fleet Tracker')
			await page.locator('floating-timer').getByText('Pause all').waitFor()
			await h.settle(page, 1000)
			// The panel opens over the date picker; drag it by its first line to the white header space
			// right of Submit (lower down, it would sit on a section band). Its position is kept in
			// the browser only.
			const handle = await page.locator('floating-timer').getByText(/Dashboard$/).first().boundingBox()
			await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
			await page.mouse.down()
			await page.mouse.move(1190, 34, { steps: 12 })
			await page.mouse.up()
			await h.settle(page, 800)
		},
		// The panel itself (floating-timer is a zero-size host; the panel is its fixed child).
		shots: [{ file: 'timesheets/timer-shelf.webp', frame: { type: 'element', locate: (page) => page.locator('floating-timer > div.fixed'), pad: 16 } }],
	},
	{
		// The favorites' play buttons only show in the period that holds today.
		id: 'timesheets-favorites-play',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openCurrentWeek(page, h, 'Acme Corp: Website Redesign')
			// Second button of the unnamed Grid/Calendar toggle (see missing-labels.md).
			await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').nth(1).click()
			await page.locator('timesheet-favorites button').first().waitFor()
			await h.settle(page, 1500)
		},
		// On the first chip's play button, which lights up under the mouse.
		async mouse(page) {
			const chip = page.locator('timesheet-favorites .group\\/chip').first()
			const play = await chip.locator('button').last().boundingBox()
			return { x: play.x + play.width / 2, y: play.y + play.height / 2 }
		},
		shots: [{ file: 'timesheets/favorites-bar-play.webp', frame: { type: 'element', locate: (page) => page.locator('timesheet-favorites'), pad: 12 } }],
	},
	{
		// The current week (a draft, so the button shows): the mouse rests on the Client section's
		// trash button, which appears on hovering the section header.
		id: 'timesheets-clear-rows',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openCurrentWeek(page, h, 'Acme Corp: Website Redesign')
			await page.locator('timesheet-section-head').first().hover()
			await h.settle(page, 600)
		},
		async mouse(page) {
			const b = await clearRows(page).boundingBox()
			return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
		},
		shots: [
			{
				file: 'timesheets/clear-rows-button.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const head = await page.locator('timesheet-section-head').first().boundingBox()
						// Up to the first day column, the label column only.
						const dayX = await page.evaluate((left) => Math.min(...[...document.querySelectorAll('.ts-head-day')].map((d) => d.getBoundingClientRect()).filter((r) => r.width > 0 && r.x > left + 200).map((r) => r.x)), head.x)
						const x = head.x - 12
						const y = head.y - 12
						return { x, y, width: dayX - 1 - x, height: head.y + head.height + 140 - y }
					},
				},
			},
		],
	},
	{
		// Copy the last full week, then paste it on the current week, which already has entries:
		// the app asks Add or Replace. The copy lives in the page only; closing the dialog pastes nothing.
		id: 'timesheets-paste-dialog',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			await (await cornerButton(page, h, 'Copy your timesheet')).click()
			await h.settle(page, 1800)
			await page.getByRole('button', { name: 'Next' }).click()
			await h.settle(page, 2000)
			await (await cornerButton(page, h, 'Paste period')).click()
			await page.getByText('There are already time records in this period').waitFor()
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		shots: [{ file: 'timesheets/paste-dialog.webp', frame: { type: 'box', box: (page, h) => h.surfaceAround(page, 'There are already time records in this period'), pad: 16 } }],
	},
	{
		// The last full week is still a draft on a capture day, so its Submit button shows. It is
		// not clicked.
		id: 'timesheets-submit-button',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			await page.getByRole('button', { name: 'Submit', exact: true }).filter({ visible: true }).first().waitFor()
		},
		shots: [
			{
				file: 'timesheets/submit-button.webp',
				frame: { type: 'lens', target: (page) => page.getByRole('button', { name: 'Submit', exact: true }).filter({ visible: true }).first(), context: { x: 68, y: 0, width: 1372, height: 560 } },
			},
		],
	},
	{
		// Next week, with two days of PTO booked ahead on Monday and Tuesday (fixture), in Grid view
		// with the side pane closed so the seven days fit.
		id: 'timesheets-time-off-row',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		fixture: timeOffNextWeek,
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByRole('link', { name: 'Timesheet' }).click()
			await page.getByRole('button', { name: 'Next' }).waitFor()
			await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').first().click()
			await h.settle(page, 2000)
			await closeSidePane(page, h)
			const before = await page.locator('.ts-head-day').first().textContent()
			await page.getByRole('button', { name: 'Next' }).click()
			await page.waitForFunction((b) => document.querySelector('.ts-head-day')?.textContent !== b, before, { timeout: 15000 })
			await page.getByText(/in days/).first().waitFor()
			await h.settle(page, 2000)
		},
		// The week down to the Time Off section.
		shots: [
			{
				file: 'timesheets/time-off-row.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const row = await page.getByText(/in days/).first().boundingBox()
						return { x: 72, y: 0, width: 1440 - 72, height: row.y + row.height + 40 }
					},
				},
			},
		],
	},
	{
		// The date picker opened from the date range: two months, the shortcuts and Today. The click
		// selects the range's text, so the selection is cleared before the shot.
		id: 'timesheets-date-picker',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			const range = page.locator('input[name=dateOutput]').filter({ visible: true })
			await range.click()
			await page.locator('.bb-calendar-portal').getByText('This week').first().waitFor()
			await range.evaluate((i) => i.setSelectionRange(0, 0))
			await h.settle(page)
		},
		// From the date range down to the bottom of the picker.
		shots: [
			{
				file: 'timesheets/date-picker.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page, h) => {
						const range = await page.locator('input[name=dateOutput]').filter({ visible: true }).boundingBox()
						const popup = await h.stableBox(page, page.locator('.bb-calendar-portal').first())
						const x = popup.x - 24
						const y = range.y - 20
						return { x, y, width: Math.max(popup.x + popup.width, range.x + range.width) + 24 - x, height: popup.y + popup.height + 24 - y }
					},
				},
			},
		],
	},
	{
		// The calendar view of the last full week, Thursday clicked: the day alone at full width,
		// with Back and the day's date above it.
		id: 'timesheets-day-focus',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			// Second button of the unnamed Grid/Calendar toggle (see missing-labels.md).
			await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').nth(1).click()
			await page.getByText('9 AM').first().waitFor()
			await h.settle(page)
			await page.locator('div.relative.flex.items-center.justify-center').filter({ hasText: /^\s*Thu\s*\d+\s*$/ }).first().click()
			await page.getByRole('button', { name: /Back/ }).waitFor()
			await h.settle(page)
		},
		shots: [{ file: 'timesheets/day-focus.webp', frame: { type: 'full' } }],
	},
	{
		// The current week in the calendar view, with the day's suggested entries drawn as ghost
		// entries (dashed boxes). The calendar hides them while they are collapsed (a screen setting
		// the runner never saves): the Suggested entries button shows them.
		id: 'timesheets-calendar-suggestions',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByRole('link', { name: 'Timesheet' }).click()
			await page.getByRole('button', { name: 'Previous' }).waitFor()
			await closeSidePane(page, h)
			// Second button of the unnamed Grid/Calendar toggle (see missing-labels.md).
			await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').nth(1).click()
			await page.getByText('9 AM').first().waitFor()
			await h.settle(page, 1500)
			const dashed = () => page.evaluate(() => [...document.querySelectorAll('*')].some((e) => getComputedStyle(e).borderStyle === 'dashed' && e.getBoundingClientRect().height > 40))
			if (!(await dashed())) {
				await (await cornerButton(page, h, 'Suggested entries')).click()
				await h.settle(page, 2000)
			}
			await h.settle(page, 1500)
		},
		shots: [{ file: 'timesheets/calendar-suggestions.webp', frame: { type: 'full' } }],
	},
	{
		// The Grid view and Calendar view buttons next to the Timesheet title (unnamed, see
		// missing-labels.md), in Grid view.
		id: 'timesheets-view-toggle',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
		},
		shots: [
			{
				file: 'timesheets/view-toggle.webp',
				frame: {
					type: 'lens',
					target: (page) => page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').first().locator('xpath=..'),
					context: { x: 68, y: 0, width: 960, height: 560 },
				},
			},
		],
	},
	{
		// The calendar zoomed into 10 to 11 AM, opened from the hour's label in the time column.
		id: 'timesheets-calendar-hour-zoom',
		capturedAt: '2026-10-04',
		datesMatter: true,
		mode: 'auto',
		fixture: shortEntries,
		// The zoomed hour is about 900 px tall: a taller window shows it whole.
		viewport: { width: 1440, height: 1250 },
		async setup(page, h) {
			await openLastFullWeekCalendar(page, h)
			await page.getByText('10 AM', { exact: true }).first().click()
			await page.getByText(/^10(:00)? AM – 11(:00)? AM$/).first().waitFor()
			await h.settle(page, 1500)
		},
		shots: [{ file: 'timesheets/calendar-hour-zoom.webp', frame: { type: 'full' } }],
	},
	{
		// The + of Wednesday's header, shown while the mouse is over that day.
		id: 'timesheets-calendar-day-add',
		capturedAt: '2026-10-04',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeekCalendar(page, h)
		},
		mouse: async (page) => {
			const b = await dayHeader(page, 'Wed').boundingBox()
			return { x: b.x + 30, y: b.y + b.height / 2 }
		},
		shots: [
			{
				file: 'timesheets/calendar-day-add.webp',
				frame: { type: 'lens', target: async (page) => dayHeader(page, 'Wed').locator('button'), context: { x: 300, y: 0, width: 960, height: 560 } },
			},
		],
	},
]

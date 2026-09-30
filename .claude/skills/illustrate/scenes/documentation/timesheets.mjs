// Scenes for help/documentation/timesheets.mdx. Jordan Reed's timesheet, the last full week
// before the capture date (the current week is only partly filled on a capture day).
export const page = 'help/documentation/timesheets.mdx'

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
}

export const scenes = [
	{
		id: 'timesheets-weekly-grid',
		capturedAt: '2026-09-29',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
		},
		shots: [{ file: 'timesheets/weekly-grid.webp', frame: { type: 'full' } }],
	},
	{
		id: 'timesheets-entry-details',
		capturedAt: '2026-09-30',
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
		capturedAt: '2026-09-29',
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
		capturedAt: '2026-09-29',
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
		capturedAt: '2026-09-29',
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
		capturedAt: '2026-09-29',
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
		capturedAt: '2026-09-29',
		datesMatter: true,
		mode: 'auto',
		fixture: runningTimer,
		async setup(page, h) {
			await openCurrentWeek(page, h, 'Fleet Tracker')
			// The floating timer opens over the date picker; drag it to the empty lower right.
			// Its position is kept in the browser only.
			const handle = await page.locator('floating-timer').getByText('Fleet Tracker', { exact: true }).first().boundingBox()
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
		capturedAt: '2026-09-29',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			await (await cornerButton(page, h, 'Team')).click()
			// Score rings arrive after the pane (over the app's WebSocket, which network idle does
			// not track): wait until every member shows one.
			await page.waitForFunction(() => {
				const scores = document.querySelectorAll('bb-timesheet-score')
				return scores.length > 0 && document.querySelectorAll('bb-timesheet-score svg').length === scores.length
			})
			await h.settle(page, 1000)
		},
		shots: [{ file: 'timesheets/team-pane.webp', frame: { type: 'full' } }],
	},
	{
		id: 'timesheets-calendar-timer',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		fixture: runningTimer,
		async setup(page, h) {
			await openCurrentWeek(page, h, 'Fleet Tracker')
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
		// Monday to Thursday, 8 AM to 3 PM: the running entry on today with the days around it.
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
						const mon = await day('Mon')
						const fri = await day('Fri')
						const eight = await page.getByText('8 AM', { exact: true }).first().boundingBox()
						const three = await page.getByText('3 PM', { exact: true }).first().boundingBox()
						const x = eight.x - 16
						const y = mon.y - 4
						return { x, y, width: fri.x - x, height: three.y + three.height + 8 - y }
					},
				},
			},
		],
	},
	{
		id: 'timesheets-timer-shelf',
		capturedAt: '2026-09-30',
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
			await openCurrentWeek(page, h, 'Fleet Tracker')
			await page.locator('floating-timer').getByText('Pause all').waitFor()
			await h.settle(page, 1000)
			// The panel opens over the date picker; drag it by its first line to the white header space
			// right of Submit (lower down, it would sit on a section band). Its position is kept in
			// the browser only.
			const handle = await page.locator('floating-timer').getByText('Dashboard', { exact: true }).boundingBox()
			await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
			await page.mouse.down()
			await page.mouse.move(1190, 34, { steps: 12 })
			await page.mouse.up()
			await h.settle(page, 800)
		},
		// The panel itself (floating-timer is a zero-size host; the panel is its fixed child).
		shots: [{ file: 'timesheets/timer-shelf.webp', frame: { type: 'element', locate: (page) => page.locator('floating-timer > div.fixed'), pad: 16 } }],
	},
]

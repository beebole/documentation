// Scenes for help/documentation/timesheets.mdx. Jordan Reed's timesheet, the last full week
// before the capture date (the current week is only partly filled on a capture day).
export const page = 'help/documentation/timesheets.mdx'

async function openLastFullWeek(page, h) {
	// Opening /timesheet directly lands on People, so go through the sidebar link.
	await h.goto(page, '/persons')
	await page.getByRole('link', { name: 'Timesheet' }).click()
	await page.getByRole('button', { name: 'Previous' }).waitFor()
	// Unnamed Grid/Calendar toggle: first button next to the "Timesheet" heading
	// (see missing-labels.md). Grid is the account's baseline, so this leaves no trace.
	await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').first().click()
	await page.getByRole('button', { name: 'Previous' }).click()
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

const cornerButton = (page, h, tooltip) => h.byTooltip(page, page.locator('timesheet-corner'), tooltip)

// A running timer is a record of today with a start time, its end set to the start of the day
// (UTC midnight) and no duration. Start times are stored as wall-clock time in the
// organisation's zone (New York), written as if UTC: 11:15 is 45 minutes before the frozen noon
// (45 minutes, because the app shows running totals unrounded: 0.75 h reads cleanly).
// The fixture removes any leftover running record first.
const runningTimer = {
	async up(api, { date }) {
		const dayStart = Date.parse(`${date}T00:00:00Z`)
		const { getPersons } = await api('{ getPersons { id name } }')
		const personId = getPersons.find((p) => p.name === 'Jordan Reed').id
		const { getProjects } = await api('{ getProjects { id name } }')
		const projectIds = ['Fleet Tracker', 'Development'].map((n) => getProjects.find((p) => p.name === n).id)
		const day = await api('query($s: BeeboleTimestamp!, $e: BeeboleTimestamp!) { getTimeRecords(startTime: $s, endTime: $e) { id startTime { ts } endTime { ts } person { id } } }', { s: dayStart, e: dayStart + 86400000 })
		const leftovers = day.getTimeRecords.filter((r) => r.person?.id === personId && r.endTime?.ts === dayStart && r.startTime?.ts > dayStart).map((r) => r.id)
		if (leftovers.length) await api('mutation($ids: [BeeboleId!]!) { deleteTimeRecords(ids: $ids) { id } }', { ids: leftovers })
		const startTime = Date.parse(`${date}T11:15:00Z`)
		const { addTimeRecord } = await api(
			'mutation($s: BeeboleTimestamp!, $e: BeeboleTimestamp!, $p: BeeboleId!, $ids: [BeeboleId!]!) { addTimeRecord(startTime: $s, endTime: $e, duration: 0, personId: $p, projectIds: $ids) { id } }',
			{ s: startTime, e: dayStart, p: personId, ids: projectIds }
		)
		return { ids: [addTimeRecord.id] }
	},
	async down(api, state) {
		if (state?.ids?.length) await api('mutation($ids: [BeeboleId!]!) { deleteTimeRecords(ids: $ids) { id } }', { ids: state.ids })
	},
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
		capturedAt: '2026-09-29',
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
			await page.locator('.bb-btn-action').filter({ visible: true }).first().click()
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
					box: async (page) => {
						const header = await page.getByText('Client', { exact: true }).first().boundingBox()
						const menu = await page.getByText('Pin to top', { exact: true }).locator('xpath=ancestor::*[contains(@class, "bb-popup")][1]').boundingBox()
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
			await h.goto(page, '/persons')
			await page.getByRole('link', { name: 'Timesheet' }).click()
			await page.getByRole('button', { name: 'Previous' }).waitFor()
			await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').first().click()
			await page.getByText('Fleet Tracker', { exact: true }).first().waitFor()
			await h.settle(page, 2000)
			// The floating timer opens over the date picker; drag it to the empty lower right.
			// Its position is kept in the browser only.
			const handle = await page.locator('floating-timer').getByText('Fleet Tracker', { exact: true }).first().boundingBox()
			await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
			await page.mouse.down()
			await page.mouse.move(1040, 780, { steps: 12 })
			await page.mouse.up()
			await h.settle(page, 800)
		},
		shots: [{ file: 'timesheets/timer-running.webp', frame: { type: 'full' } }],
	},
	{
		id: 'timesheets-team-pane',
		capturedAt: '2026-09-29',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			await (await cornerButton(page, h, 'Team')).click()
			await h.settle(page, 1500)
		},
		shots: [{ file: 'timesheets/team-pane.webp', frame: { type: 'full' } }],
	},
]

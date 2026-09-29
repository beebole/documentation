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
]

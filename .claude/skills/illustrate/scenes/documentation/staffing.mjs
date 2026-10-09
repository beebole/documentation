// Scenes for help/documentation/staffing.mdx.
// They show the Staffing plan, a Bookings planning added by the seed layer at fixed dates.
export const page = 'help/documentation/staffing.mdx'

// The planning and the view are saved as person preferences (answered by the runner's guard).
export async function openStaffing(page, h) {
	await h.goto(page, '/tasks')
	await page.getByText('Add a view').first().waitFor()
	await page.locator('bb-category').getByText('Main plan').first().click()
	await h.settle(page, 800)
	await page.getByText('Staffing plan', { exact: true }).filter({ visible: true }).first().click()
	await page.getByText('Marc Dubois', { exact: true }).first().waitFor()
	await h.settle(page, 2000)
}

// A few days back, so today is not at the left edge and the running bookings show their start.
async function scrollBack(page, h) {
	await page.mouse.move(900, 500)
	await page.mouse.wheel(-160, 0)
	await h.settle(page, 1500)
}

// The ⋯ button next to the view tab has no name: it is the tab button's next sibling.
function viewMenu(page) {
	return page.getByRole('button', { name: 'Staffing', exact: true }).locator('xpath=following-sibling::button[1]')
}

// Locks the view to a fixed window from the tab's ⋯ menu (a view setting, answered by the guard).
// The Period submenu opens while the mouse is on its row.
export async function lockPeriod(page, h, name) {
	await viewMenu(page).click()
	await h.settle(page, 600)
	await page.getByText('Period', { exact: true }).filter({ visible: true }).first().hover()
	await h.settle(page, 600)
	await page.locator('bb-submenu').getByText(name, { exact: true }).click()
	await h.settle(page, 2000)
}

// Centre of a person's capacity cell for a day: the cells are unnamed, so the cell is the load bar
// under the day's label, between the person's name and the next person's.
async function capacityCell(page, day, person, nextPerson) {
	const labels = await page.getByText(day, { exact: true }).filter({ visible: true }).all()
	let column = null
	for (const l of labels) {
		const b = await l.boundingBox()
		if (b && b.x > 330 && b.x < 1440 && b.y < 220) column = column ?? b
	}
	const top = await page.getByText(person, { exact: true }).filter({ visible: true }).first().boundingBox()
	const bottom = await page.getByText(nextPerson, { exact: true }).filter({ visible: true }).first().boundingBox()
	const cell = await page.evaluate(
		({ x, y1, y2 }) => {
			const bars = [...document.querySelectorAll('div.absolute.top-0.flex.items-start')].map((e) => e.getBoundingClientRect())
			const r = bars.find((b) => b.left <= x && b.right >= x && b.top > y1 - 60 && b.top < y2)
			return r && { x: r.left + r.width / 2, y: r.top + r.height / 2 }
		},
		{ x: column.x + column.width / 2, y1: top.y, y2: bottom.y }
	)
	if (!cell) throw new Error(`no capacity cell for ${person} on ${day}`)
	return cell
}

export const scenes = [
	{
		id: 'staffing-view',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openStaffing(page, h)
			await scrollBack(page, h)
		},
		shots: [{ file: 'planning/staffing-view.webp', frame: { type: 'full' } }],
	},
	{
		id: 'staffing-timed-bars',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openStaffing(page, h)
			await lockPeriod(page, h, 'Week')
			await page.getByPlaceholder('Search by name').fill('Fatima')
			await h.settle(page, 1500)
		},
		// Wednesday to Saturday, from the month badge down to Fatima's row: column edges from the
		// day labels, the row's bottom from her name (rows are 76 px high).
		shots: [
			{
				file: 'staffing/staffing-timed-bars.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						// The timeline keeps the weeks around the window rendered off screen: take the label right of the People column.
						const label = async (t) => {
							for (const l of await page.getByText(t, { exact: true }).filter({ visible: true }).all()) {
								const b = await l.boundingBox()
								if (b && b.x > 330 && b.x < 1440) return b
							}
							throw new Error(`no ${t} on screen`)
						}
						const [tue, wed, sat, month] = await Promise.all(['Tue', 'Wed', 'Sat', 'Oct 2026'].map(label))
						const name = await page.getByText('Fatima Al-Hassan', { exact: true }).filter({ visible: true }).first().boundingBox()
						const col = wed.x - tue.x
						const x = wed.x + wed.width / 2 - col / 2
						const y = month.y - 12
						return { x, y, width: sat.x + sat.width / 2 + col / 2 - x, height: name.y + name.height / 2 + 38 - y }
					},
				},
			},
		],
	},
	{
		id: 'staffing-booking-editor',
		capturedAt: '2026-10-09',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openStaffing(page, h)
			await scrollBack(page, h)
			// The editor opens from the pencil the bar shows on hover (a click on the bar opens the side panel).
			const bar = page.locator('staffing-bar').filter({ hasText: 'Video Production' }).first()
			await bar.hover()
			await h.settle(page, 500)
			// The link handle at the bar's end covers the pencil: the click goes to the button itself.
			await bar.locator('button.sticky').dispatchEvent('click')
			await h.settle(page, 1500)
		},
		// The editor with the bar it opened from, from the bar's start to a strip right of the editor.
		shots: [
			{
				file: 'planning/staffing-booking-editor.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page, h) => {
						// The bar and the editor elements draw nothing themselves (display: contents): measure the
						// bar's label and the editor's popup.
						const bar = await page.getByText('Brightwave Media: Brand Campaign: Video Production', { exact: true }).filter({ visible: true }).first().boundingBox()
						const editor = await h.stableBox(page, page.locator('.staffingEditor'))
						// The editor opens below the bar, or above it when the bar sits low on the screen.
						const x = Math.min(bar.x - 16, editor.x - 160)
						const y = Math.min(bar.y, editor.y) - 28
						const bottom = Math.max(bar.y + bar.height, editor.y + editor.height) + 24
						return { x, y, width: editor.x + editor.width + 160 - x, height: bottom - y }
					},
				},
			},
		],
	},
	{
		id: 'staffing-booking-add-form',
		capturedAt: '2026-10-09',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openStaffing(page, h)
			await page.getByRole('button', { name: 'Add Booking' }).click()
			await page.getByPlaceholder('Select the owner').first().waitFor()
			await h.settle(page, 1500)
		},
		// The form, with the panel's close button; not the panel's pin and collapse buttons at its left edge.
		shots: [
			{
				file: 'staffing/booking-add-form.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const b = await page.locator('booking-add-form').boundingBox()
						return { x: b.x, y: b.y - 16, width: b.width + 16, height: b.height + 32 }
					},
				},
			},
		],
	},
	{
		id: 'staffing-capacity-tooltip',
		capturedAt: '2026-10-09',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openStaffing(page, h)
			await scrollBack(page, h)
		},
		// The tooltip shows while the mouse is on a capacity cell: Elena Rossi's on Oct 6, when her
		// two bookings overlap.
		mouse: (page) => capacityCell(page, '6', 'Elena Rossi', 'Emma Costa'),
		// Around the cell: the load bars of the neighbouring days, the tooltip over her bookings.
		shots: [
			{
				file: 'planning/staffing-capacity-tooltip.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const c = await capacityCell(page, '6', 'Elena Rossi', 'Emma Costa')
						return { x: c.x - 260, y: c.y - 22, width: 520, height: 118 }
					},
				},
			},
		],
	},
]

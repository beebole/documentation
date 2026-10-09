// Scenes for help/documentation/timeoff.mdx. Allowances come from the seed layer (PTO 20 days
// and Sickness 10 days for everyone, PTO 25 days for the London office).
export const page = 'help/documentation/timeoff.mdx'

// Panels are widened to 800 px: at the default width (576 at 1440)
// the period select drops to its own line.
const PANEL_WIDTH = 800

export const scenes = [
	{
		id: 'timeoff-absence-types',
		capturedAt: '2026-10-09',
		datesMatter: false,
		mode: 'auto',
		// The Time Off list with PTO open on its Units panel: the list alone is two lines.
		async setup(page, h) {
			await h.openPanel(page, '/absenceTypes', 'PTO', 'absence-type-unit')
			await page.getByText('Units', { exact: true }).filter({ visible: true }).first().waitFor()
			await page.getByText('Time off notifications', { exact: true }).filter({ visible: true }).first().waitFor()
			// Production hosts do not have the Accruals and Time off notifications panels
			// (isProduction() in reboot's services/entity/attributes.ts); QA does.
			await page.evaluate(() => {
				const leaf = (t) => [...document.querySelectorAll('body *')].find((e) => e.childElementCount === 0 && e.textContent.trim() === t)
				for (const title of ['Accruals', 'Time off notifications']) {
					// The whole panel entry: climb to the child of the list that holds every panel.
					let row = leaf(title)
					while (!(row.parentElement.textContent.includes('Units') && row.parentElement.textContent.includes('Who has access?'))) row = row.parentElement
					row.style.display = 'none'
				}
			})
			await h.settle(page, 1500)
		},
		// Off the side panel, which shows its pin and resize buttons under the mouse.
		mouse: () => ({ x: 400, y: 700 }),
		shots: [{ file: 'timeoff/absence-types-list.webp', frame: { type: 'full' } }],
	},
	{
		id: 'timeoff-allowances-panel',
		capturedAt: '2026-10-09',
		datesMatter: true,
		mode: 'auto',
		// Elena Rossi's PTO allowance opened, with Available, Consumed and Accrued at the top.
		async setup(page, h) {
			await h.openPanel(page, '/persons', 'Elena Rossi', 'absence-type-quota')
			const card = page.getByText('PTO', { exact: true }).filter({ visible: true }).first()
			await card.waitFor()
			await h.settle(page, 1000)
			// A card opens from its header row; idempotent: only when its fields are not shown yet.
			if (!(await page.getByText('Carry forward limit').filter({ visible: true }).count())) {
				await card.click()
				await page.getByText('Carry forward limit').filter({ visible: true }).first().waitFor()
			}
			// Production hosts do not show Repeat automatically (isProduction() in reboot's
			// attributes/absence-type-quota.ts); QA does. Its row is the label's parent.
			await page.evaluate(() => {
				const leaf = [...document.querySelectorAll('body *')].find((e) => e.childElementCount === 0 && e.textContent.trim() === 'Repeat automatically')
				if (leaf) leaf.parentElement.style.display = 'none'
			})
			await h.settle(page, 1000)
		},
		shots: [
			{
				file: 'timeoff/absence-allowances-panel.webp',
				frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Absence allowances', 'Email & role') },
			},
		],
	},
	{
		id: 'timeoff-notifications-panel',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		// PTO's Time off notifications panel, opened through its address.
		async setup(page, h) {
			await h.openPanel(page, '/absenceTypes', 'PTO', 'absence-type-notification')
			await page.getByText('Going negative').filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
			await h.widenPanel(page, PANEL_WIDTH)
		},
		mouse: () => ({ x: 400, y: 700 }),
		shots: [
			{
				file: 'timeoff/timeoff-notifications-panel.webp',
				frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Time off notifications', 'Accruals') },
			},
		],
	},
	{
		// An absence type's ⋯ menu, next to its name in the side panel. Opening it changes nothing.
		id: 'timeoff-absence-type-menu',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/absenceTypes', 'PTO', 'absence-type-unit')
			await page.getByText('Units', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
			// The ⋯ next to the name, in the panel's header: the highest one on the right.
			const buttons = page.locator('bb-action-menu-button button').filter({ visible: true })
			const boxes = await buttons.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, y: r.y })))
			const index = boxes.reduce((best, b, i) => (b.x > 1000 && (best < 0 || b.y < boxes[best].y) ? i : best), -1)
			await buttons.nth(index).click()
			await page.getByText('Unarchive', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
			await h.settle(page, 800)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		mouse: () => ({ x: 400, y: 700 }),
		// The panel's header and the open menu.
		shots: [
			{
				file: 'timeoff/absence-type-action-menu.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const del = await page.getByText('Delete', { exact: true }).filter({ visible: true }).first().boundingBox()
						return { x: 864, y: 0, width: 576, height: del.y + del.height + 32 }
					},
				},
			},
		],
	},
]

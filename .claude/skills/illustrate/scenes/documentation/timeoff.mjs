// Scenes for help/documentation/timeoff.mdx. Allowances come from the seed layer (PTO 20 days
// and Sickness 10 days for everyone, PTO 25 days for the London office).
export const page = 'help/documentation/timeoff.mdx'

export const scenes = [
	{
		id: 'timeoff-absence-types',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		// The Time Off list with PTO open on its Units panel: the list alone is two lines.
		async setup(page, h) {
			await h.openPanel(page, '/absenceTypes', 'PTO', 'absence-type-unit')
			await page.getByText('Units', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		// Off the side panel, which shows its pin and resize buttons under the mouse.
		mouse: () => ({ x: 400, y: 700 }),
		shots: [{ file: 'timeoff/absence-types-list.webp', frame: { type: 'full' } }],
	},
	{
		id: 'timeoff-allowances-panel',
		capturedAt: '2026-09-30',
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
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		// PTO's Time off notifications panel, opened through its address.
		async setup(page, h) {
			await h.openPanel(page, '/absenceTypes', 'PTO', 'absence-type-notification')
			await page.getByText('Going negative').filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 400, y: 700 }),
		shots: [
			{
				file: 'timeoff/timeoff-notifications-panel.webp',
				frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Time off notifications', 'Accruals') },
			},
		],
	},
]

// Scenes for help/documentation/ai.mdx.
import { cornerButton, openLastFullWeek } from './timesheets.mjs'

export const page = 'help/documentation/ai.mdx'

export const scenes = [
	{
		id: 'ai-assistant-page',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/ai')
			await page.getByText('Ask for a report').first().waitFor()
			await h.settle(page, 1500)
		},
		shots: [{ file: 'ai/assistant-page.webp', frame: { type: 'full' } }],
	},
	{
		id: 'ai-suggested-entries',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByRole('link', { name: 'Timesheet' }).click()
			await page.getByRole('button', { name: 'Previous' }).waitFor()
			// The pane only opens in the grid view (the calendar view shows suggestions as ghost
			// entries instead). Unnamed Grid/Calendar toggle: first button next to the heading.
			await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').first().click()
			await h.settle(page, 1500)
			await (await cornerButton(page, h, 'Suggested entries')).click()
			await page.getByRole('button', { name: 'Accept all' }).waitFor()
			await h.settle(page, 1000)
			// Today's suggestion with its evidence open.
			await page.getByText('Why?', { exact: true }).last().click()
			await h.settle(page, 1500)
		},
		shots: [{ file: 'ai/suggested-entries-tray.webp', frame: { type: 'full' } }],
	},
	{
		id: 'ai-approval-review-digest',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			await (await cornerButton(page, h, 'Approval')).click()
			// Same opening as approval-pending-pane: the list arrives over the WebSocket, so wait
			// before turning Show all on.
			await page.getByText('Show all', { exact: true }).first().waitFor()
			await h.settle(page, 2500)
			await page.getByText('Show all', { exact: true }).first().click()
			await page.getByText('Late', { exact: true }).first().waitFor()
			await h.settle(page, 1500)
			// Lucas Bernard's week of Sep 6 (48 h) has time on non-working days, which the digest
			// flags; his other pending weeks have nothing unusual and show no digest at all. Open
			// his weeks one by one until the flags appear.
			await page.getByPlaceholder('Search').first().fill('Lucas')
			await h.settle(page, 1500)
			const weeks = page.getByText('Lucas Bernard', { exact: true })
			const flag = page.getByText('Time on a non-working day').first()
			for (let i = 0; i < (await weeks.count()) && !(await flag.isVisible()); i++) {
				await weeks.nth(i).click()
				await flag.waitFor({ timeout: 6000 }).catch(() => {})
			}
			await flag.waitFor()
			await h.settle(page, 2000)
		},
		shots: [{ file: 'ai/approval-review-digest.webp', frame: { type: 'full' } }],
	},
	{
		id: 'ai-report-builder-request',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/ai')
			await page.getByText('Ask for a report').first().waitFor()
			await h.settle(page, 1500)
			// Typed, not sent: Build would create a report.
			const box = page.getByRole('textbox').first()
			await box.click()
			await box.pressSequentially('Hours by client for each person last month', { delay: 10 })
			await h.settle(page, 800)
		},
		// The Ask for a report heading down to the sentence box and its Build button.
		shots: [
			{
				file: 'ai/report-builder-request.webp',
				frame: {
					type: 'box',
					pad: 16,
					box: async (page) => {
						const title = await page.getByText('Ask for a report', { exact: true }).first().boundingBox()
						const build = await page.getByRole('button', { name: 'Build', exact: true }).boundingBox()
						return { x: title.x, y: title.y, width: build.x + build.width - title.x, height: build.y + build.height - title.y }
					},
				},
			},
		],
	},
]

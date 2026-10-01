// Scenes for help/documentation/approval.mdx.
import { openLastFullWeek, cornerButton } from './timesheets.mjs'

export const page = 'help/documentation/approval.mdx'

export const scenes = [
	{
		id: 'approval-pending-pane',
		capturedAt: '2026-09-29',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			await (await cornerButton(page, h, 'Approval')).click()
			// The pending weeks wait for the team's managers: Show all lists them for an admin.
			// The list arrives over the WebSocket, and a toggle clicked before the pane has loaded is
			// lost: wait, toggle, then wait for the Late group.
			await page.getByText('Show all', { exact: true }).first().waitFor()
			await h.settle(page, 2500)
			await page.getByText('Show all', { exact: true }).first().click()
			await page.getByText('Late', { exact: true }).first().waitFor()
			
			await h.settle(page, 2000)
		},
		shots: [{ file: 'approval/pending-pane.webp', frame: { type: 'full' } }],
	},
	{
		id: 'approval-workflow-stages',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=approval-stages')
			await page.getByText('Managers of projects in the timesheet').first().waitFor()
			// Unfold the first stage to show its type and quorum (display only).
			await page.getByText('Managers of projects in the timesheet').first().click()
			await h.settle(page, 1500)
		},
		shots: [{ file: 'approval/workflow-stages.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Approval workflow', 'Absence allowances') } }],
	},
	{
		id: 'approval-status-breakdown',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			// Jordan Reed's own week is a draft: open the Team pane (when it is not open yet) and
			// click Ana Pereira's Submitted badge, which opens the same stage breakdown.
			const member = page.locator('timesheet-member-item').filter({ hasText: 'Ana Pereira' }).first()
			if (!(await member.isVisible())) await (await cornerButton(page, h, 'Team')).click()
			const badge = member.locator('timesheet-approval-status span.rounded-full')
			await badge.waitFor()
			await h.settle(page, 1500)
			await badge.click()
			await page.getByText('Project managers').filter({ visible: true }).last().waitFor()
			await h.settle(page, 1000)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		// Ana Pereira's entry in the Team pane and the breakdown under her badge.
		shots: [
			{
				file: 'approval/status-badge-breakdown.webp',
				frame: {
					type: 'box',
					pad: 12,
					box: async (page) => {
						const member = await page.locator('timesheet-member-item').filter({ hasText: 'Ana Pereira' }).first().boundingBox()
						const menu = await page.locator('.stagesMenu').filter({ visible: true }).first().boundingBox()
						const x = Math.min(member.x, menu.x)
						const y = Math.min(member.y, menu.y)
						return { x, y, width: Math.max(member.x + member.width, menu.x + menu.width) - x, height: Math.max(member.y + member.height, menu.y + menu.height) - y }
					},
				},
			},
		],
	},
	{
		id: 'approval-team-bulk-bar',
		capturedAt: '2026-10-01',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			// Select two submitted weeks in the Team pane: the bulk bar appears under the list. Nobody
			// in that week is still a draft, so the bar shows Approve and Reject but no Remind.
			const member = page.locator('timesheet-member-item').filter({ hasText: 'Ana Pereira' }).first()
			if (!(await member.isVisible())) await (await cornerButton(page, h, 'Team')).click()
			await member.locator('timesheet-approval-status').waitFor()
			await h.settle(page, 1500)
			for (const name of ['Ana Pereira', 'Carlos Ruiz']) {
				await page.locator('timesheet-member-item').filter({ hasText: name }).first().locator('input[type=checkbox]').first().click()
			}
			await page.getByRole('button', { name: /Approve \(2\)/ }).waitFor()
			// The last clicked checkbox keeps a focus ring.
			await page.evaluate(() => document.activeElement?.blur())
			await h.settle(page, 1000)
		},
		// The Team pane from its search box down to the bulk bar.
		shots: [
			{
				file: 'approval/team-bulk-bar.webp',
				frame: {
					type: 'box',
					pad: 8,
					box: async (page) => {
						const search = await page.getByPlaceholder('Search', { exact: true }).filter({ visible: true }).first().boundingBox()
						const reject = await page.getByRole('button', { name: /Reject \(2\)/ }).boundingBox()
						const x = Math.min(search.x, reject.x) - 8
						const right = Math.max(search.x + search.width, reject.x + reject.width) + 8
						return { x, y: search.y - 8, width: right - x, height: reject.y + reject.height - search.y + 16 }
					},
				},
			},
		],
	},
]

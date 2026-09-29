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
]

// Scenes for help/documentation/approval.mdx.
import { openLastFullWeek, cornerButton } from './timesheets.mjs'

export const page = 'help/documentation/approval.mdx'

// Jordan Reed (the screenshot user) approves nothing on QA: the first stage waits on the project
// managers, Sophie Laurent and Thomas Muller. For the capture only, Jordan also manages Acme Corp
// and Greenleaf Industries, so the weeks pending on those projects reach the Journal banner.
const MANAGED = ['Acme Corp', 'Greenleaf Industries']
async function jordanAndProjects(api) {
	const { getPersons } = await api('{ getPersons { id name } }')
	const { getProjects } = await api('{ getProjects { id name } }')
	return { managerId: getPersons.find((p) => p.name === 'Jordan Reed').id, projectIds: MANAGED.map((n) => getProjects.find((p) => p.name === n).id) }
}
const jordanManages = {
	async up(api) {
		const ids = await jordanAndProjects(api)
		for (const projectId of ids.projectIds) await api('mutation($m: BeeboleId!, $p: BeeboleId!) { makeManagerOfProject(managerId: $m, projectId: $p) { id } }', { m: ids.managerId, p: projectId })
		return ids
	},
	async down(api, state) {
		const ids = state ?? (await jordanAndProjects(api))
		for (const projectId of ids.projectIds) await api('mutation($m: BeeboleId!, $p: BeeboleId!) { removeManagerOfProject(managerId: $m, projectId: $p) { id } }', { m: ids.managerId, p: projectId })
	},
}

// The approvers named on a pending week ("Sophie Laurent, Thomas Muller"): data, listed in no
// fixed order, so replay leaves them out (the published image keeps them).
// Each one runs from the names to the right end of their line (the ellipsis is drawn there), and
// only above the bulk Approve/Reject bar, which can cover a row's line.
const approverNames = async (page) => {
	const bar = await page.getByRole('button', { name: /Approve \(\d+\)/ }).filter({ visible: true }).first().boundingBox().catch(() => null)
	const rects = []
	for (const el of await page.getByText(/Laurent|Muller|O.Brien/).filter({ visible: true }).all()) {
		const r = await el.evaluate((e) => {
			const b = e.getBoundingClientRect()
			let line = e.parentElement
			while (line && line.getBoundingClientRect().width <= b.width + 1) line = line.parentElement
			const l = line.getBoundingClientRect()
			return { x: b.x - 2, y: b.y - 2, width: l.right - b.x + 2, height: b.height + 4 }
		})
		if (!bar || r.y + r.height < bar.y) rects.push(r)
	}
	return rects
}

export const scenes = [
	{
		id: 'approval-pending-pane',
		capturedAt: '2026-10-02',
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
			if (!(await member.isVisible())) await (await cornerButton(page, h, /^Team$/)).click()
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
				ignore: approverNames,
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
			if (!(await member.isVisible())) await (await cornerButton(page, h, /^Team$/)).click()
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
				ignore: approverNames,
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
	{
		// Ana Pereira's submitted week, opened from the Team pane: Reject opens the dialog asking for
		// a reason. Nothing is sent.
		id: 'approval-reject-dialog',
		capturedAt: '2026-10-01',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			const member = page.locator('timesheet-member-item').filter({ hasText: 'Ana Pereira' }).first()
			if (!(await member.isVisible())) await (await cornerButton(page, h, /^Team$/)).click()
			await member.locator('timesheet-approval-status').waitFor()
			await h.settle(page, 1500)
			await member.getByText('Ana Pereira', { exact: true }).click()
			await page.getByRole('button', { name: 'Reject', exact: true }).first().waitFor()
			await h.settle(page, 1500)
			await page.getByRole('button', { name: 'Reject', exact: true }).first().click()
			const reason = page.getByPlaceholder(/reason for rejection/)
			await reason.waitFor()
			// A reason typed in, which enables the dialog's Reject button.
			await reason.fill('Wednesday has 6 hours on the Mobile App, please check them against the sprint log.')
			await page.evaluate(() => document.activeElement?.blur())
			await h.settle(page, 1000)
		},
		async teardown(page) {
			await page.getByRole('button', { name: 'Cancel', exact: true }).filter({ visible: true }).first().click()
		},
		// The dialog, with its close button.
		shots: [
			{
				file: 'approval/reject-comment-dialog.webp',
				frame: {
					type: 'box',
					pad: 4,
					box: async (page) =>
						page.getByPlaceholder(/reason for rejection/).evaluate((field) => {
							let el = field
							while (el && getComputedStyle(el).backgroundColor !== 'rgb(255, 255, 255)') el = el.parentElement ?? el.getRootNode().host
							while (el.parentElement && el.parentElement.getBoundingClientRect().width < 900) el = el.parentElement
							const r = el.getBoundingClientRect()
							return { x: r.x, y: r.y - 12, width: r.width + 12, height: r.height + 12 }
						}),
				},
			},
		],
	},
	{
		id: 'approval-edit-pencil',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			const member = page.locator('timesheet-member-item').filter({ hasText: 'Ana Pereira' }).first()
			if (!(await member.isVisible())) await (await cornerButton(page, h, /^Team$/)).click()
			await member.locator('timesheet-approval-status').waitFor()
			await h.settle(page, 1500)
		},
		// The Team pane and the start of the grid, the lens on Ana Pereira's Edit timesheet button.
		shots: [
			{
				file: 'approval/edit-timesheet-pencil.webp',
				frame: {
					type: 'lens',
					target: (page, h) => h.byTooltip(page, page.locator('timesheet-member-item').filter({ hasText: 'Ana Pereira' }).first(), 'Edit timesheet'),
					context: { x: 68, y: 0, width: 960, height: 560 },
				},
			},
		],
	},
	{
		// The Journal's approval banner, expanded. Guided until the app is fixed: on QA every row's
		// Hours, Billing and Cost read 0 (2026-10-02). The banner's totals query (runInlineReport
		// with the week as startTime and endTime filters) returns no rows, while the same person
		// and week with a report period returns 40 h.
		id: 'approval-journal-banner',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'guided',
		fixture: jordanManages,
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByRole('link', { name: 'Journal' }).click()
			await page.getByText(/to approve/).first().waitFor()
			await h.settle(page, 1500)
			await page.getByText(/to approve/).first().click()
			// The totals come from a report run after the list: wait for a row's hours.
			await page.getByText('40', { exact: true }).first().waitFor({ timeout: 30000 })
			await h.settle(page, 1500)
		},
		shots: [{ file: 'approval/journal-banner.webp', frame: { type: 'full' } }],
	},
	{
		// Ana Pereira's submitted week opened from the Team pane, then the Journal button: the feed
		// widened to her full history, at her approval events (the seed's submissions and approvals).
		id: 'approval-history-journal',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			const member = page.locator('timesheet-member-item').filter({ hasText: 'Ana Pereira' }).first()
			if (!(await member.isVisible())) await (await cornerButton(page, h, /^Team$/)).click()
			await member.locator('timesheet-approval-status').waitFor()
			await h.settle(page, 1500)
			await member.getByText('Ana Pereira', { exact: true }).click()
			await page.getByRole('button', { name: 'Reject', exact: true }).first().waitFor()
			await h.settle(page, 1500)
			// The Journal button: the first unnamed icon button of top-bar-actions, at the top right
			// (see missing-labels.md). It opens Ana Pereira's details with her Journal.
			await page.locator('top-bar-actions').getByRole('button').first().click()
			await page.getByText('Journal', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 2000)
			// Opened from a timesheet, the feed may show that timesheet's entries only: widen it.
			const narrow = page.getByText(/Click to show all/).filter({ visible: true })
			if (await narrow.count()) await narrow.first().click()
			// The full feed starts with the latest record changes: scroll to the approval events.
			const approved = page.getByText(/Approved by/).filter({ visible: true }).first()
			await approved.waitFor()
			await approved.evaluate((e) => e.scrollIntoView({ block: 'center' }))
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 600, y: 860 }),
		// Feed rows from the first Approved by entry down, across the details panel.
		shots: [
			{
				file: 'approval/history-journal.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const title = await page.getByText('Journal', { exact: true }).filter({ visible: true }).first().boundingBox()
						const row = await page.getByText(/Approved by/).filter({ visible: true }).first().boundingBox()
						const x = title.x - 4
						const y = row.y - 22
						return { x, y, width: 1440 - x, height: Math.min(340, 900 - y) }
					},
				},
			},
		],
	},
	{
		// The first approval stage unfolded, its approver type selector open. Nothing is picked.
		id: 'approval-approver-types',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=approval-stages')
			await page.getByText('Managers of projects in the timesheet').first().waitFor()
			await page.getByText('Managers of projects in the timesheet').first().click()
			await h.settle(page, 1500)
			await page.locator('approval-stages-attribute bb-autocomplete input').filter({ visible: true }).first().click()
			await page.getByText('Specific people', { exact: true }).filter({ visible: true }).first().waitFor()
			// The click selects the field's text: put the cursor at its end instead.
			await page.locator('approval-stages-attribute bb-autocomplete input').filter({ visible: true }).first().evaluate((i) => i.setSelectionRange(i.value.length, i.value.length))
			await h.settle(page, 1000)
		},
		async teardown(page) {
			await page.keyboard.press('Escape')
		},
		// From the panel's title down to the bottom of the open list.
		shots: [
			{
				file: 'approval/approver-types.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Approval workflow', { exact: true }).filter({ visible: true }).first().boundingBox()
						const last = await page.getByText('Task managers', { exact: true }).filter({ visible: true }).first().boundingBox()
						const x = title.x - 64
						const y = title.y - 24
						return { x, y, width: 1440 - 24 - x, height: last.y + last.height + 32 - y }
					},
				},
			},
		],
	},
	{
		// Clara Fontaine's approved week (approved by the seed), opened from the Team pane: an
		// admin sees Reject at the top of the timesheet. Nothing is clicked.
		id: 'approval-reject-approved',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			await openLastFullWeek(page, h)
			const member = page.locator('timesheet-member-item').filter({ hasText: 'Clara Fontaine' }).first()
			if (!(await member.isVisible())) await (await cornerButton(page, h, /^Team$/)).click()
			await member.locator('timesheet-approval-status').waitFor()
			await h.settle(page, 1500)
			await member.getByText('Clara Fontaine', { exact: true }).click()
			await page.getByRole('button', { name: 'Reject', exact: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		// The header with the Approved badge and Reject, the Team pane down to the next two people.
		shots: [
			{
				file: 'approval/reject-approved.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const next = await page.locator('timesheet-member-item').filter({ hasText: 'Elena Rossi' }).first().boundingBox()
						return { x: 68, y: 0, width: 1440 - 68, height: next.y + next.height + 16 }
					},
				},
			},
		],
	},
]

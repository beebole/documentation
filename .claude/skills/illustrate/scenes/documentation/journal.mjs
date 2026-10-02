// Scenes for help/documentation/journal.mdx.
import { openLastFullWeek, cornerButton } from './timesheets.mjs'

export const page = 'help/documentation/journal.mdx'

// A message on Website Redesign, for the capture only: Sophie Laurent's message with bold text and
// a mention of Acme Corp. The mention is a project, not a person, so nobody is notified. It is
// deleted right after. No reply: a reply's quote shows the raw key journalReplyTo.commentedOn on
// production (2026-10-01), so a thread cannot be shown yet. The message is dated when the fixture
// runs, so replay always reports its age changed: compare by eye.
const message = {
	async up(api) {
		const { getPersons, getProjects } = await api('{ getPersons { id name } getProjects { id name } }')
		const person = (n) => getPersons.find((p) => p.name === n).id
		const project = (n) => getProjects.find((p) => p.name === n).id
		const projectId = project('Website Redesign')
		const acme = project('Acme Corp')
		const add = async (vars) =>
			(
				await api(
					'mutation($authorId: BeeboleId, $content: BeeboleMessageContent!, $reference: BeeboleReferenceInput, $mentions: [BeeboleReferenceInput]) { addMessage(authorId: $authorId, content: $content, reference: $reference, mentions: $mentions) { id } }',
					vars
				)
			).addMessage.id
		const reference = { id: projectId, type: 'project' }
		const first = await add({
			authorId: person('Sophie Laurent'),
			reference,
			content: `**QA Testing** now starts on October 13. [@Acme Corp](https://app.beebole.com/projects?id=${acme}) confirmed the new date on today's call.`,
			mentions: [{ id: acme, type: 'project' }],
		})
		return { projectId, ids: [first] }
	},
	async down(api, state) {
		for (const id of state?.ids ?? []) await api('mutation($id: BeeboleId!) { deleteMessage(id: $id) { id } }', { id })
	},
}

export const scenes = [
	{
		id: 'journal-feed',
		capturedAt: '2026-09-30',
		datesMatter: true,
		mode: 'auto',
		async setup(page, h) {
			// The organisation's Journal is empty on the documentation account (its data came in
			// through the API); a person's Journal shows the changes made to their records.
			await h.openPanel(page, '/persons', 'Ana Pereira', 'journal')
			await page.getByText(/Added time record/).first().waitFor()
			await h.settle(page, 1500)
		},
		// Off the panel, which shows its pin and resize buttons under the mouse.
		mouse: () => ({ x: 800, y: 110 }),
		// The person's details panel: header and Journal feed.
		shots: [
			{
				file: 'journal/activity-feed.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Journal', { exact: true }).filter({ visible: true }).first().boundingBox()
						const x = title.x + 8
						return { x, y: 0, width: 1440 - x, height: 900 }
					},
				},
			},
		],
	},
	{
		id: 'journal-message-mention',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		fixture: message,
		async setup(page, h, state) {
			await h.goto(page, `/projects/${state.projectId}/journal`)
			await page.getByText('confirmed the new date', { exact: false }).first().waitFor()
			await h.settle(page, 1500)
		},
		// Off the panel, which shows its pin and resize buttons under the mouse.
		mouse: () => ({ x: 600, y: 110 }),
		// The Journal panel, from its title down to the message (the title's box spans the panel).
		shots: [
			{
				file: 'journal/message-mention.webp',
				frame: {
					type: 'box',
					pad: 0,
					box: async (page) => {
						const title = await page.getByText('Journal', { exact: true }).filter({ visible: true }).first().boundingBox()
						const text = await page.getByText('confirmed the new date', { exact: false }).first().boundingBox()
						const x = title.x + 8
						const y = title.y - 16
						return { x, y, width: 1440 - 16 - x, height: text.y + text.height + 32 - y }
					},
				},
			},
		],
	},
	{
		// Ana Pereira's Journal opened from her week (Team pane, her name, then the Journal button of
		// the top bar): the feed shows her timesheet activity only, under the "Click to show all" line.
		id: 'journal-timesheet-only',
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
			// The Journal button: the first unnamed icon button of top-bar-actions (see missing-labels.md).
			await page.locator('top-bar-actions').getByRole('button').first().click()
			await page.getByText(/Click to show all/).filter({ visible: true }).first().waitFor()
			await h.settle(page, 2000)
		},
		mouse: () => ({ x: 600, y: 860 }),
		shots: [{ file: 'journal/timesheet-only-feed.webp', frame: { type: 'full' } }],
	},
]

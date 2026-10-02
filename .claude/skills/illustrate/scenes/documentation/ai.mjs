// Scenes for help/documentation/ai.mdx.
import { cornerButton, openLastFullWeek } from './timesheets.mjs'

export const page = 'help/documentation/ai.mdx'

// Planned work on future days: for the capture only, Jordan Reed (signed in) owns a task next
// week (Monday to Friday, half his time on Website Redesign) and gets Only time off can be recorded
// in the future on his own settings, so his next week's planned suggestions read as forecasts.
// `down` deletes the task and clears the setting; the next read of that week sweeps the drafts
// the task left, since nobody owns it any more. The account's weeks run Sunday to Saturday.
const FORECAST_TASK = 'Sprint Review Prep'
const DAY = 86400000
const forecastWeek = {
	async up(api, { date }) {
		const today = Date.parse(`${date}T00:00:00Z`)
		const monday = today + (((8 - new Date(today).getUTCDay()) % 7) || 7) * DAY
		const { getTaskCategories, getPersons, getProjects } = await api('{ getTaskCategories { id name } getPersons { id name } getProjects { id name } }')
		const jordan = getPersons.find((p) => p.name === 'Jordan Reed').id
		const { addTask } = await api('mutation($n: BeeboleName!, $c: BeeboleId!) { addTask(name: $n, categoryId: $c) { id } }', {
			n: FORECAST_TASK,
			c: getTaskCategories.find((c) => c.name === 'Main plan').id,
		})
		const id = addTask.id
		await api('mutation($t: BeeboleId!, $p: BeeboleId!) { assignTaskToProject(taskId: $t, projectId: $p) { id } }', { t: id, p: getProjects.find((p) => p.name === 'Website Redesign').id })
		await api('mutation($t: BeeboleId!, $p: BeeboleId!) { assignOwnerOfTask(taskId: $t, personId: $p) { id } }', { t: id, p: jordan })
		await api('mutation($id: BeeboleId!, $s: BeeboleTimestamp!, $e: BeeboleTimestamp!, $f: Float) { editTaskPeriod(id: $id, startTime: $s, endTime: $e, effort: $f) { id } }', {
			id,
			s: monday,
			e: monday + 5 * DAY - 1,
			f: 20 * 3600000,
		})
		await api('mutation($id: BeeboleId!, $pct: Float) { editTaskFtePct(id: $id, pct: $pct) { id } }', { id, pct: 0.5 })
		await api('mutation($id: BeeboleId!) { editPersonTimeSettingsNoFutureTimeRecord(id: $id, noFutureTimeRecord: true) { id } }', { id: jordan })
		await api('mutation($c: [BeeboleId!]!) { editOrganisationTimeSettingsTaskCategories(taskCategories: $c) { id } }', { c: [getTaskCategories.find((c) => c.name === 'Main plan').id] })
		return { id, jordan }
	},
	async down(api, state) {
		const { getTasks, getPersons } = await api('{ getTasks { id name } getPersons { id name } }')
		const jordan = state?.jordan ?? getPersons.find((p) => p.name === 'Jordan Reed').id
		for (const t of getTasks.filter((t) => t.name === FORECAST_TASK)) await api('mutation($id: BeeboleId!) { deleteTask(id: $id) { id } }', { id: t.id })
		await api('mutation($id: BeeboleId!) { editPersonTimeSettingsNoFutureTimeRecord(id: $id, noFutureTimeRecord: null) { id } }', { id: jordan })
		await api('mutation { editOrganisationTimeSettingsTaskCategories(taskCategories: []) { id } }')
	},
}

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
		capturedAt: '2026-10-02',
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
		capturedAt: '2026-10-02',
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
	{
		// Next week in the calendar view: the planned task's suggestions as forecast cards.
		id: 'ai-suggestion-forecast-cards',
		capturedAt: '2026-10-02',
		datesMatter: true,
		mode: 'auto',
		fixture: forecastWeek,
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByRole('link', { name: 'Timesheet' }).click()
			await page.getByRole('button', { name: 'Previous' }).waitFor()
			// Second button of the unnamed Grid/Calendar toggle (see missing-labels.md).
			await page.getByRole('heading', { name: 'Timesheet' }).locator('xpath=..').getByRole('button').nth(1).click()
			await page.getByText('9 AM').first().waitFor()
			await h.settle(page, 1500)
			// The calendar draws suggestions unless they are collapsed (a screen setting the runner
			// never saves). Show them first: the Suggested entries button also brings the calendar
			// back to the current week. Its ghost entries are dashed boxes.
			const dashed = () => page.evaluate(() => [...document.querySelectorAll('*')].some((e) => getComputedStyle(e).borderStyle === 'dashed' && e.getBoundingClientRect().height > 40))
			if (!(await dashed())) {
				await (await cornerButton(page, h, 'Suggested entries')).click()
				await h.settle(page, 2000)
			}
			// Go to next week: a click that lands before the timesheet has loaded is lost, so confirm
			// the date range input changed (as openLastFullWeek does going back).
			const readRange = () =>
				page.evaluate(() => [...document.querySelectorAll('input')].find((i) => i.value.includes('→') && i.getBoundingClientRect().width > 0)?.value ?? '')
			const before = await readRange()
			for (let i = 0; i < 3 && (await readRange()) === before; i++) {
				await page.getByRole('button', { name: 'Next' }).click()
				await page.waitForFunction((b) => [...document.querySelectorAll('input')].some((x) => x.value.includes('→') && x.value !== b), before, { timeout: 8000 }).catch(() => {})
			}
			if ((await readRange()) === before) throw new Error('could not go to next week')
			await h.settle(page, 3000)
			await page.getByText(FORECAST_TASK, { exact: true }).filter({ visible: true }).nth(1).waitFor()
			await h.settle(page, 2000)
		},
		shots: [{ file: 'ai/suggestion-forecast-cards.webp', frame: { type: 'full' } }],
	},
]

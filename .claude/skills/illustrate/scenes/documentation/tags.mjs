// Scenes for help/documentation/tags.mdx.
export const page = 'help/documentation/tags.mdx'

const expandAll = async (page, h) => {
	await h.expandRow(page, 'Design', 'Brand & Content')
	await h.expandRow(page, 'Engineering', 'Frontend')
	await h.expandRow(page, 'Sales', 'Account Management')
}

// For the capture only: Acme Corp tagged New York and London, and London taken off Mobile App,
// which records an exclusion there. `down` untags Acme Corp, then undoes what Mobile App still
// holds: an exclusion (operation "sub") goes with a tag mutation, which deletes it, anything else
// with an untag. An untag on a project that has no such tag records an exclusion, so it is never
// sent blindly. The seed tags no project.
async function tagIds(api) {
	const { getProjects } = await api('{ getProjects { id name } }')
	const { getTags } = await api('{ getTags { id name } }')
	const project = (n) => getProjects.find((p) => p.name === n).id
	const tag = (n) => getTags.find((t) => t.name === n).id
	return { acme: project('Acme Corp'), mobile: project('Mobile App'), newYork: tag('New York'), london: tag('London') }
}
const TAG = 'mutation($t: BeeboleId!, $p: BeeboleId!) { tagProject(tagId: $t, projectId: $p) { id } }'
const UNTAG = 'mutation($t: BeeboleId!, $p: BeeboleId!) { untagProject(tagId: $t, projectId: $p) { id } }'
const excludedTag = {
	async up(api) {
		const ids = await tagIds(api)
		await api(TAG, { t: ids.newYork, p: ids.acme })
		await api(TAG, { t: ids.london, p: ids.acme })
		await api(UNTAG, { t: ids.london, p: ids.mobile })
		return ids
	},
	async down(api, state) {
		const ids = state ?? (await tagIds(api))
		await api(UNTAG, { t: ids.london, p: ids.acme }).catch(() => {})
		await api(UNTAG, { t: ids.newYork, p: ids.acme }).catch(() => {})
		const { getProjects } = await api('{ getProjects { id relations { taggedBy { operation value { id } } } } }')
		for (const r of getProjects.find((p) => p.id === ids.mobile).relations.taggedBy ?? []) await api(r.operation === 'sub' ? TAG : UNTAG, { t: r.value.id, p: ids.mobile })
	},
}

export const scenes = [
	{
		id: 'tags-list',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/tags')
			await expandAll(page, h)
			await page.getByText('Engineering', { exact: true }).first().click()
			await page.getByText('Absence allowances').first().waitFor()
			await h.settle(page)
		},
		shots: [{ file: 'tags/tags-list.webp', frame: { type: 'full' } }],
	},
	{
		id: 'tags-level-names-dialog',
		capturedAt: '2026-10-04',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/tags')
			// Unnamed gear button: second button next to the "Tags:" heading (see missing-labels.md).
			await page.getByRole('heading', { name: 'Tags:' }).locator('xpath=..').getByRole('button').nth(1).click()
			await page.getByText('Level names', { exact: true }).waitFor()
			await h.settle(page)
		},
		shots: [{ file: 'tags/tags-level-names-dialog.webp', frame: { type: 'box', box: (page, h) => h.surfaceAround(page, 'Level names'), pad: 24 } }],
	},
	{
		id: 'tags-person-panel',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.getByText('Elena Rossi', { exact: true }).first().click()
			// The open panel is part of the address (/persons/<id>/tags). Clicking its title depends
			// on the panel state the app remembers, so open it through the address when needed.
			const field = page.getByPlaceholder('Add a tag here')
			await page.waitForURL(/\/persons\/[0-9a-f]+/)
			await page.waitForTimeout(800)
			if (!(await field.isVisible())) {
				const person = page.url().match(/\/persons\/[0-9a-f]+/)[0]
				await h.goto(page, `${person}/tags`)
			}
			await field.waitFor()
			await h.settle(page)
		},
		// From just below the panel header to just below the "Add a tag here" field.
		shots: [
			{
				file: 'tags/tags-person-panel.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const heading = await page.getByText('Tags', { exact: true }).filter({ visible: true }).last().boundingBox()
						const input = await page.getByPlaceholder('Add a tag here').boundingBox()
						return { x: 884, y: heading.y - 17, width: 540, height: input.y + input.height - heading.y + 42 }
					},
				},
			},
		],
	},
	{
		id: 'tags-tagged-panel',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/tags')
			await h.expandRow(page, 'Engineering', 'Frontend')
			await page.getByText('Frontend', { exact: true }).first().click()
			await page.waitForURL(/\/tags\/[0-9a-f]{24}/)
			await h.goto(page, `${page.url().match(/\/tags\/[0-9a-f]{24}/)[0]}/tagged`)
			await h.settle(page, 1500)
		},
		shots: [{ file: 'tags/who-or-what-tagged-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Who or what has been tagged?', 'Absence allowances') } }],
	},
	{
		// Mobile App's Tags panel: New York inherited from Acme Corp, London excluded (fixture).
		id: 'tags-inherited-excluded',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		fixture: excludedTag,
		async setup(page, h) {
			await h.goto(page, '/projects')
			await h.expandRow(page, 'Acme Corp', 'Mobile App')
			await page.getByText('Mobile App', { exact: true }).first().click()
			const entity = /\/projects\/[0-9a-f]{24}/
			await page.waitForURL(entity)
			await h.goto(page, `${page.url().match(entity)[0]}/tags`)
			await page.getByText('London', { exact: true }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 1500)
		},
		mouse: () => ({ x: 800, y: 110 }),
		shots: [{ file: 'tags/inherited-excluded-tags.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Tags', 'Billing') } }],
	},
	{
		// The Add Department panel, opened from the button at the top right: the name field, Save
		// new department, and the Or add multiple entries area with its example and Paste. Nothing is typed.
		id: 'tags-add-panel',
		capturedAt: '2026-10-02',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/tags')
			await page.getByText('Design', { exact: true }).first().waitFor()
			await page.getByRole('button', { name: 'Add Department', exact: true }).click()
			await page.getByText('Or add multiple entries', { exact: true }).waitFor()
			await h.settle(page, 1000)
		},
		mouse: () => ({ x: 600, y: 860 }),
		shots: [{ file: 'tags/add-tag-panel.webp', frame: { type: 'clip', x: 68, y: 0, width: 1372, height: 640 } }],
	},
]

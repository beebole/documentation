// Scenes for help/documentation/tags.mdx.
export const page = 'help/documentation/tags.mdx'

const expandAll = async (page, h) => {
	await h.expandRow(page, 'Design', 'Brand & Content')
	await h.expandRow(page, 'Engineering', 'Frontend')
	await h.expandRow(page, 'Sales', 'Account Management')
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
		capturedAt: '2026-09-29',
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
]

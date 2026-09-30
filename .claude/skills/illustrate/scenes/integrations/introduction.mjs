// Scenes for help/integrations/introduction.mdx.
export const page = 'help/integrations/introduction.mdx'

export const scenes = [
	{
		id: 'integrations-list',
		capturedAt: '2026-09-29',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/integrations')
			await page.getByText('Ready to integrate with your existing tools?').waitFor()
			await h.settle(page)
		},
		shots: [{ file: 'integrations/settings-integrations-list.webp', frame: { type: 'full' } }],
	},
]

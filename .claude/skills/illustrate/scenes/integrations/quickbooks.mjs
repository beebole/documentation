// Scenes for help/integrations/quickbooks.mdx.
export const page = 'help/integrations/quickbooks.mdx'

export const scenes = [
	{
		id: 'quickbooks-connect',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/integrations')
			await page.getByText('Ready to integrate with your existing tools?').waitFor()
			await page.getByText('QuickBooks', { exact: true }).first().click()
			await page.getByRole('button', { name: 'Connect to QuickBooks' }).waitFor()
			await h.settle(page, 1000)
		},
		// The Integrations list and the QuickBooks settings, down to the Connect button.
		shots: [
			{
				file: 'integrations/quickbooks-connect.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Integrations', { exact: true }).filter({ visible: true }).first().boundingBox()
						const intro = await page.getByText(/Requirements:/).first().locator('xpath=ancestor::*[contains(@class, "rounded")][1]').boundingBox()
						const last = await page.getByText('Webhooks', { exact: true }).filter({ visible: true }).first().boundingBox()
						const x = title.x - 64
						return { x, y: 0, width: intro.x + intro.width + 32 - x, height: last.y + last.height + 32 }
					},
				},
			},
		],
	},
]

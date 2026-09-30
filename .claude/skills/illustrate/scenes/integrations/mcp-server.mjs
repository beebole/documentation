// Scenes for help/integrations/mcp-server.mdx.
export const page = 'help/integrations/mcp-server.mdx'

export const scenes = [
	{
		id: 'mcp-server-connect',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/ai')
			await page.getByText('Ask for a report').first().waitFor()
			// The page scrolls inside the main area: bring the section heading 48 px under the top.
			const heading = page.getByText('Connect your AI tools', { exact: true }).first()
			await heading.evaluate((e) => e.scrollIntoView({ block: 'start' }))
			await page.mouse.move(720, 450)
			await page.mouse.wheel(0, (await heading.boundingBox()).y - 48)
			await h.settle(page, 1500)
		},
		// The Connect your AI tools section, from its heading down to What to ask it (excluded). The
		// Server URL reads qa.beebole.com here: the app builds it from the person's own server.
		shots: [
			{
				file: 'integrations/mcp-server-connect.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText('Connect your AI tools', { exact: true }).first().boundingBox()
						const card = await page.getByText('claude.ai, ChatGPT and other hosted assistants', { exact: true }).first().locator('xpath=ancestor::*[contains(@class, "rounded")][1]').boundingBox()
						const next = await page.getByText('What to ask it', { exact: true }).first().boundingBox()
						const x = title.x - 24
						const y = title.y - 20
						return { x, y, width: card.x + card.width + 24 - x, height: next.y - 24 - y }
					},
				},
			},
		],
	},
]

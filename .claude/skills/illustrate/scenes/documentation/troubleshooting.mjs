// Scenes for help/documentation/troubleshooting.mdx.
export const page = 'help/documentation/troubleshooting.mdx'

export const scenes = [
	{
		id: 'troubleshooting-diagnostics',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/diagnostics')
			await page.getByText(/^avg \d+ ms/).waitFor({ timeout: 30000 })
			await h.settle(page, 1000)
		},
		// The title, Health checks and Latency. Durations, the build and the ping figures differ
		// on every run, so replay reports this shot as changed: compare it by eye.
		shots: [
			{
				file: 'troubleshooting/diagnostics-page.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const title = await page.getByText(/Connection Diagnostics/).first().boundingBox()
						const ping = await page.getByText(/^avg \d+ ms/).locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "rounded") or self::section][1]').boundingBox()
						const x = ping.x - 32
						const y = title.y - 32
						return { x, y, width: ping.width + 64, height: ping.y + ping.height + 10 - y }
					},
				},
			},
		],
	},
]

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
		// on every run: replay leaves them out.
		shots: [
			{
				file: 'troubleshooting/diagnostics-page.webp',
				ignore: (page) => [page.getByText(/^\d+ ms$/), page.getByText(/^Build [0-9a-f]+$/), page.getByText(/^avg \d+ ms/)],
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
	{
		// The app's own switch for the HTTP transport (forceHttpTransport in localStorage) puts it in
		// the fallback mode a network blocking WebSockets causes. The mouse rests on the sidebar
		// indicator to show its tooltip.
		id: 'troubleshooting-compatibility-mode',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/persons')
			await page.evaluate(() => localStorage.setItem('forceHttpTransport', '1'))
			await page.reload()
			await page.getByText('Sophie Laurent', { exact: true }).first().waitFor({ timeout: 30000 })
			await h.settle(page, 1500)
		},
		async teardown(page) {
			await page.evaluate(() => localStorage.removeItem('forceHttpTransport'))
		},
		mouse: async (page) => {
			const b = await indicator(page).boundingBox()
			return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
		},
		shots: [
			{
				file: 'troubleshooting/compatibility-mode-indicator.webp',
				frame: {
					type: 'box',
					box: async (page) => {
						const b = await indicator(page).boundingBox()
						const tip = await page.getByText('Running in slower compatibility mode').filter({ visible: true }).first().boundingBox()
						const y = b.y - 140
						return { x: 0, y, width: tip.x + tip.width + 32, height: b.y + b.height + 70 - y }
					},
				},
			},
		],
	},
]

// The sidebar's link-slash button (bb-icon takes the icon's SVG path as its name), shown only in the fallback mode (it has no name, only a tooltip).
const indicator = (page) => page.locator('side-bar button:has(bb-icon[name^="M13.181 8.68"])').first()

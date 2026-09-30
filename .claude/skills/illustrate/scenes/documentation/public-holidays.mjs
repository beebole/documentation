// Scenes for help/documentation/public-holidays.mdx.
export const page = 'help/documentation/public-holidays.mdx'

export const scenes = [
	{
		id: 'public-holidays-panel',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=public-holidays')
			// The holiday names are input values, loaded over the WebSocket.
			await page.waitForFunction(() => [...document.querySelectorAll('input')].some((i) => i.value === 'Christmas Day'))
			await h.settle(page, 1000)
		},
		shots: [{ file: 'public-holidays/holidays-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Public holidays', 'Absence allowances') } }],
	},
]

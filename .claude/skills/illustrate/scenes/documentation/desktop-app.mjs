// Scenes for help/documentation/desktop-app.mdx.
export const page = 'help/documentation/desktop-app.mdx'

export const scenes = [
	{
		id: 'desktop-app-downloads',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/ai')
			await page.getByText('Linux (deb)', { exact: true }).first().waitFor()
			// On the QA server only, the box adds a note and a command to point the app at QA:
			// hidden, so the section reads as customers see it.
			await page.evaluate(() => {
				const deb = [...document.querySelectorAll('a')].find((a) => a.textContent.trim() === 'Linux (deb)')
				const box = deb.closest('.rounded-xl')
				for (const child of box.children) {
					if (/QA server|desktop-qa\.mjs|Switch the desktop app to QA/.test(child.textContent)) child.style.setProperty('display', 'none')
				}
			})
			await page.getByText('Linux (deb)', { exact: true }).first().scrollIntoViewIfNeeded()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'ai/desktop-download-links.webp', frame: { type: 'element', locate: (page) => page.locator('section').filter({ has: page.getByText('Linux (deb)', { exact: true }) }).last(), pad: 16 } }],
	},
]

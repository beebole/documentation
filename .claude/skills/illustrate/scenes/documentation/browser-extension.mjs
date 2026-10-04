// Scenes for help/documentation/browser-extension.mdx.
export const page = 'help/documentation/browser-extension.mdx'

export const scenes = [
	{
		id: 'browser-extension-section',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/ai')
			await page.getByText('Browser extension', { exact: true }).first().waitFor()
			// Show my API key reads Jordan Reed's existing key (a query): the extension box then lists
			// it under the server address.
			await page.getByRole('button', { name: 'Show my API key' }).click()
			const section = page.locator('section').filter({ has: page.getByText('Browser extension', { exact: true }) }).last()
			const key = section.locator('.font-mono').nth(1)
			await key.waitFor()
			// The app masks the key; the scene replaces even its first and last characters, so the
			// image stays the same when the key is reset. The server address is the QA host here:
			// customers see their own, app.beebole.com.
			await key.evaluate((el) => (el.textContent = 'a1b2 ******** c3d4'))
			await section.locator('.font-mono').first().evaluate((el) => (el.textContent = el.textContent.replace('qa.beebole.com', 'app.beebole.com')))
			await section.scrollIntoViewIfNeeded()
			await h.settle(page, 1000)
		},
		shots: [{ file: 'ai/extension-section.webp', frame: { type: 'element', locate: (page) => page.locator('section').filter({ has: page.getByText('Browser extension', { exact: true }) }).last(), pad: 16 } }],
	},
]

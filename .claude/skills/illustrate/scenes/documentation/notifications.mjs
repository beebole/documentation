// Scenes for help/documentation/notifications.mdx.
export const page = 'help/documentation/notifications.mdx'

const restInHeader = () => ({ x: 800, y: 50 })

export const scenes = [
	{
		id: 'notifications-preferences',
		capturedAt: '2026-10-09',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.openPanel(page, '/persons', 'Jordan Reed', 'notification')
			await page.getByText('Instant', { exact: true }).first().waitFor()
			// Production hosts do not show the budget alerts (isProduction() in reboot's
			// attributes/notification.ts); QA does. The push channel shows on both since 2026-10-08.
			await page.evaluate(() => {
				const leaf = (t) => [...document.querySelectorAll('body *')].find((e) => e.childElementCount === 0 && e.textContent.trim() === t)
				// The whole row: climb to the child of the list that holds every event row.
				let row = leaf('Budget threshold alerts')
				while (!row.parentElement.textContent.includes('@mentioned')) row = row.parentElement
				row.style.display = 'none'
			})
			await h.settle(page, 1500)
		},
		mouse: restInHeader,
		shots: [{ file: 'notifications/preferences-panel.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Notifications', 'Tags') } }],
	},
	{
		id: 'notifications-email-templates',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/settings?attributeName=email-templates')
			await page.getByText('Sign Up', { exact: true }).first().waitFor()
			await h.settle(page, 2000)
		},
		// Off the panel title, which shows its drag handle under the mouse.
		mouse: () => ({ x: 1300, y: 860 }),
		shots: [{ file: 'notifications/email-templates.webp', frame: { type: 'box', box: (page, h) => h.panelBox(page, 'Email templates', 'Absence allowances', { right: 1400 }) } }],
	},
]

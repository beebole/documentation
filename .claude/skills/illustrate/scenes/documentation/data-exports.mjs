// Scenes for help/documentation/data-exports.mdx.
import { openFolder } from './reports.mjs'

export const page = 'help/documentation/data-exports.mdx'

export const scenes = [
	{
		id: 'data-exports-menu',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await openFolder(page, h, 'Current Month', 'Hours by Person')
			// The ⋯ button shows on hover of the report's row; it opens the menu, and Export opens
			// the formats submenu on hover.
			const name = page.getByText('Hours by Person', { exact: true }).first()
			await name.hover()
			const row = name.locator('xpath=ancestor::*[.//bb-action-menu-button][1]')
			await row.locator('bb-action-menu-button button').first().click()
			const exportItem = page.getByText('Export', { exact: true }).filter({ visible: true }).last()
			await exportItem.waitFor()
			// The submenu follows the mouse, not a locator hover: move onto the item, then click it.
			const item = await h.stableBox(page, exportItem)
			await page.mouse.move(item.x + item.width / 2, item.y + item.height / 2, { steps: 5 })
			await page.mouse.click(item.x + item.width / 2, item.y + item.height / 2)
			await page.getByText('CSV', { exact: false }).filter({ visible: true }).first().waitFor()
			await h.settle(page, 800)
		},
		// Keep the mouse on Export: the submenu closes when it leaves.
		async mouse(page, h) {
			const item = await h.stableBox(page, page.getByText('Export', { exact: true }).filter({ visible: true }).last())
			return { x: item.x + item.width - 12, y: item.y + item.height / 2 }
		},
		shots: [
			{
				file: 'data-exports/export-submenu.webp',
				frame: {
					type: 'box',
					box: async (page, h) => {
						// Raw JSON is offered on QA and localhost only: production does not have it.
						// Its row is the ancestor that sits in the list of formats (a parent with many children).
						await page.getByText('Raw JSON', { exact: true }).filter({ visible: true }).evaluateAll((els) =>
							els.forEach((e) => {
								let item = e
								while (item.parentElement && item.parentElement.children.length < 8) item = item.parentElement
								item.style.setProperty('display', 'none')
							})
						)
						await h.settle(page, 300)
						const row = await page.getByText('Hours by Person', { exact: true }).first().boundingBox()
						// The submenu: the smallest element holding its first and last formats.
						const sub = await page.evaluate(() => {
							const leaf = [...document.querySelectorAll('body *')].find((e) => e.childElementCount === 0 && e.textContent.trim() === 'Matrix (PDF)' && e.getBoundingClientRect().width > 0)
							let el = leaf
							while (el && !/(^|\s)JSON(\s|$)/.test(el.innerText)) el = el.parentElement
							const r = el.getBoundingClientRect()
							return { x: r.x, y: r.y, width: r.width, height: r.height }
						})
						const x = row.x - 64
						const y = row.y - 14
						return { x, y, width: sub.x + sub.width + 24 - x, height: sub.y + sub.height + 16 - y }
					},
				},
			},
		],
	},
]

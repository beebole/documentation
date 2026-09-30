import { BASE_URL } from './session.mjs'

export const HIDE_CSS =
	'[class*="intercom" i],[id*="intercom" i],iframe[name*="intercom" i],beta-badge,bb-toast-stack{display:none !important;visibility:hidden !important;}'

export function makeHelpers() {
	const h = {
		async goto(page, path) {
			await page.goto(`${BASE_URL}${path}`)
			await page.waitForLoadState('networkidle').catch(() => {})
			await h.settle(page)
		},
		async settle(page, ms = 800) {
			await page.evaluate(() => document.fonts.ready)
			await page.waitForTimeout(ms)
		},
		async hideChrome(page) {
			await page.addStyleTag({ content: HIDE_CSS })
		},
		async parkMouse(page) {
			const { width, height } = page.viewportSize()
			await page.mouse.move(width - 4, height - 4)
		},
		// Opens one settings panel of a list entry through its address (/projects/<id>/billing):
		// clicking a panel's title depends on which panels the app remembers as open.
		// `attribute` is the panel's key in labels.json `entityAttributes` (billing, project-tasks…).
		async openPanel(page, listPath, name, attribute) {
			await h.goto(page, listPath)
			await page.getByText(name, { exact: true }).first().click()
			const entity = new RegExp(`${listPath}/[0-9a-f]{24}`)
			await page.waitForURL(entity)
			await h.goto(page, `${page.url().match(entity)[0]}/${attribute}`)
		},
		// Box of an open settings panel: from its title down to the title of the next panel
		// (excluded), from the panel's timeline dot to `right`.
		async panelBox(page, title, nextTitle, { right = 1440 - 24 } = {}) {
			const top = await page.getByText(title, { exact: true }).filter({ visible: true }).first().boundingBox()
			const next = await page.getByText(nextTitle, { exact: true }).filter({ visible: true }).first().boundingBox()
			if (!top || !next) throw new Error(`panel ${title} → ${nextTitle} not found`)
			const x = top.x - 64
			const y = top.y - 20
			return { x, y, width: right - x, height: next.y - 28 - y }
		},
		listRow(page, name) {
			return page.getByRole('listitem').filter({ has: page.getByText(name, { exact: true }) }).first()
		},
		// Idempotent: expands only when the child is not visible yet, so a remembered expansion
		// does not get collapsed by a second run.
		async expandRow(page, name, childName) {
			if (await page.getByText(childName, { exact: true }).first().isVisible()) return
			await h.listRow(page, name).getByRole('button').first().click()
			await page.getByText(childName, { exact: true }).first().waitFor()
		},
		// Box of the nearest opaque white surface around a text (a dialog, a popup).
		async surfaceAround(page, text) {
			return page.evaluate((t) => {
				const leaf = [...document.querySelectorAll('body *')].find((e) => e.childElementCount === 0 && e.textContent.trim() === t)
				let el = leaf
				while (el && getComputedStyle(el).backgroundColor !== 'rgb(255, 255, 255)') el = el.parentElement
				if (!el) return null
				const r = el.getBoundingClientRect()
				return { x: r.x, y: r.y, width: r.width, height: r.height }
			}, text)
		},
		// Unnamed icon buttons often carry only a hover tooltip: find the button in `scope` whose
		// tooltip contains `text` (see missing-labels.md). `selector` narrows the candidates (a
		// disabled button without pointer events cannot be hovered).
		async byTooltip(page, scope, text, selector) {
			const buttons = selector ? scope.locator(selector) : scope.getByRole('button')
			for (let i = 0; i < (await buttons.count()); i++) {
				const b = buttons.nth(i)
				if (!(await b.isVisible())) continue
				await b.hover()
				await page.waitForTimeout(600)
				if (await page.getByText(text).filter({ visible: true }).count()) return b
			}
			throw new Error(`no button with tooltip "${text}"`)
		},
		// The box of an element once it stops moving (menus and popups open with a short
		// transition): three identical reads 100 ms apart.
		async stableBox(page, locator) {
			let last = null
			for (let same = 0, i = 0; i < 40; i++) {
				const b = await locator.boundingBox()
				const key = b && [b.x, b.y, b.width, b.height].map(Math.round).join()
				same = key && key === last ? same + 1 : 0
				if (same >= 2) return b
				last = key
				await page.waitForTimeout(100)
			}
			throw new Error('element never stopped moving')
		},
		async boxOf(locator) {
			return locator.boundingBox()
		},
	}
	return h
}

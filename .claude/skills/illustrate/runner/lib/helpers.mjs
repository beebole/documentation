import { BASE_URL, VIEWPORT } from './session.mjs'

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
			await page.mouse.move(VIEWPORT.width - 4, VIEWPORT.height - 4)
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
		// tooltip contains `text` (see missing-labels.md).
		async byTooltip(page, scope, text) {
			const buttons = scope.getByRole('button')
			for (let i = 0; i < (await buttons.count()); i++) {
				const b = buttons.nth(i)
				if (!(await b.isVisible())) continue
				await b.hover()
				await page.waitForTimeout(600)
				if (await page.getByText(text).filter({ visible: true }).count()) return b
			}
			throw new Error(`no button with tooltip "${text}"`)
		},
		async boxOf(locator) {
			return locator.boundingBox()
		},
	}
	return h
}

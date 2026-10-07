import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { CACHE_DIR } from './paths.mjs'

export const BASE_URL = 'https://qa.beebole.com'
export const ORG_ID = '6abb86369d045d1d6a183151'
const EMAIL = 'yves@beebole.com'
const STATE = join(CACHE_DIR, 'storage-state.json')
export const VIEWPORT = { width: 1440, height: 900 }

// Playwright's own Chromium, pinned by the playwright version in package.json. Not the system
// Chrome: it auto-updates, and a new rendering engine would flag every screenshot as changed.
export async function launchBrowser() {
	try {
		return await chromium.launch({ channel: 'chromium', headless: true })
	} catch (e) {
		throw new Error(`Cannot start the pinned Chromium (run \`npx --prefix .claude/skills/illustrate/runner playwright install chromium\`): ${e.message.split('\n')[0]}`)
	}
}

// `viewport` overrides the desktop size (phone shots); `signedOut` opens the context without the
// saved session (the sign-in page).
export async function newContext(browser, { scale = 2, viewport = VIEWPORT, signedOut = false } = {}) {
	return browser.newContext({
		viewport,
		deviceScaleFactor: scale,
		locale: 'en-US',
		timezoneId: 'America/New_York',
		storageState: !signedOut && existsSync(STATE) ? STATE : undefined,
	})
}

// Sign in through the API from inside the page (QA returns the PIN), then keep the cookies so
// later runs skip it: each sign-in also emails the PIN to the account owner.
async function signIn(page) {
	await page.goto(`${BASE_URL}/signin`)
	const result = await page.evaluate(
		async ({ email, orgId }) => {
			let csrf = ''
			const gq = async (query, variables) =>
				(await fetch('/graphql', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json', csrftoken: csrf }, body: JSON.stringify({ query, variables }) })).json()
			csrf = (await gq('{ currentSession { csrftoken } }')).data?.currentSession?.csrftoken || ''
			const accounts = (await gq('query($e: BeeboleEmail!) { getAccounts(email: $e) { id organisationId } }', { e: email })).data?.getAccounts || []
			const account = accounts.find((a) => a.organisationId === orgId)
			if (!account) return 'no account for the documentation organisation'
			const pending = (await gq('mutation($e: BeeboleEmail!, $a: BeeboleId) { requestSignin(email: $e, accountId: $a) { token debugPin } }', { e: email, a: account.id })).data?.requestSignin
			if (!pending?.debugPin) return 'no debug PIN returned'
			const res = await gq('mutation($t: String!, $p: Int!) { signin(token: $t, pin: $p) { expire { ts } } }', { t: pending.token, p: pending.debugPin })
			return res.errors ? res.errors[0].message : 'ok'
		},
		{ email: EMAIL, orgId: ORG_ID }
	)
	if (result !== 'ok') throw new Error(`Sign-in failed: ${result}`)
}

// The organisation the session is on, and the signed-in person's app language.
async function currentAccount(page) {
	return page
		.evaluate(async () => {
			const post = (body, csrf = '') =>
				fetch('/graphql', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json', csrftoken: csrf }, body: JSON.stringify(body) }).then((r) => r.json())
			const csrf = (await post({ query: '{ currentSession { csrftoken } }' })).data?.currentSession?.csrftoken || ''
			const data = (await post({ query: '{ currentOrganisation { id } currentPerson { lang } }' }, csrf)).data
			return { org: data?.currentOrganisation?.id ?? null, lang: data?.currentPerson?.lang ?? null }
		})
		.catch(() => ({ org: null, lang: null }))
}

// Reuse the saved session when it is signed in to the documentation organisation; otherwise
// sign in again (once) and save the new state.
export async function ensureSession(browser) {
	mkdirSync(CACHE_DIR, { recursive: true })
	for (let attempt = 0; attempt < 2; attempt++) {
		const context = await newContext(browser)
		const page = await context.newPage()
		await page.goto(`${BASE_URL}/persons`)
		await page.waitForLoadState('networkidle').catch(() => {})
		const signedIn = !page.url().includes('/signin')
		const { org, lang } = signedIn ? await currentAccount(page) : { org: null, lang: null }
		if (org === ORG_ID) {
			// Scenes find controls by their English labels. The account is also Yves' own sign-in,
			// and was once left in French (2026-09-30): stop here rather than time out in every scene.
			if (lang && lang !== 'en') {
				await context.close()
				throw new Error(`Jordan Reed's app language is "${lang}", scenes need "en" (set it back with editPersonLang or in the app)`)
			}
			await context.storageState({ path: STATE })
			await context.close()
			return
		}
		await signIn(page)
		await context.storageState({ path: STATE })
		await context.close()
	}
	throw new Error('Could not open a session on the documentation organisation')
}

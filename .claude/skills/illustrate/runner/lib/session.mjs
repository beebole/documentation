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

export async function newContext(browser) {
	return browser.newContext({
		viewport: VIEWPORT,
		deviceScaleFactor: 2,
		locale: 'en-US',
		timezoneId: 'America/New_York',
		storageState: existsSync(STATE) ? STATE : undefined,
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
			const pin = (await gq('mutation($e: BeeboleEmail!, $a: BeeboleId) { requestSignin(email: $e, accountId: $a) { debugPin } }', { e: email, a: account.id })).data?.requestSignin?.debugPin
			if (!pin) return 'no debug PIN returned'
			const res = await gq('mutation($p: Int!) { signin(pin: $p) { expire { ts } } }', { p: pin })
			return res.errors ? res.errors[0].message : 'ok'
		},
		{ email: EMAIL, orgId: ORG_ID }
	)
	if (result !== 'ok') throw new Error(`Sign-in failed: ${result}`)
}

async function currentOrganisationId(page) {
	return page
		.evaluate(async () => {
			const post = (body, csrf = '') =>
				fetch('/graphql', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json', csrftoken: csrf }, body: JSON.stringify(body) }).then((r) => r.json())
			const csrf = (await post({ query: '{ currentSession { csrftoken } }' })).data?.currentSession?.csrftoken || ''
			return (await post({ query: '{ currentOrganisation { id } }' }, csrf)).data?.currentOrganisation?.id ?? null
		})
		.catch(() => null)
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
		const org = signedIn ? await currentOrganisationId(page) : null
		if (org === ORG_ID) {
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

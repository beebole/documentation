// Fixtures: data a scene needs only while it is captured (a running timer, for example). The
// scene's `fixture.up(api, ctx)` creates it through the API and returns what `down(api, state)`
// needs to remove it; down always runs. Fixture scenes run one at a time after the others, so
// no other screenshot can see their data.
import { assertDocumentationOrg } from '../../../seed-documentation/guards.mjs'

const ENDPOINT = 'https://qa.beebole.com/graphql'

export function partition(entries) {
	return { parallel: entries.filter((e) => !e.scene.fixture), serial: entries.filter((e) => e.scene.fixture) }
}

// A GraphQL client on the documentation account only; errors throw.
export async function apiClient({ key = process.env.BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY, fetch = globalThis.fetch } = {}) {
	if (!key) throw new Error('fixtures need BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY (source ~/.config/beebole/.env)')
	const gql = async (query, variables = {}) => {
		const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', apikey: key }, body: JSON.stringify({ query, variables }) })
		const body = await res.json()
		if (body.errors) throw new Error(`fixture API: ${body.errors[0].message}`)
		return body.data
	}
	await assertDocumentationOrg(async (q) => gql(q).catch(() => null))
	return gql
}

// Scenes must never change app data. The runner answers every GraphQL mutation itself, over
// the app's WebSocket and over HTTP, so nothing a scene clicks can reach the server.
// Screen-settings saves (last route, open panels, grid/calendar view) happen on every
// navigation: they get a fake success echoing the settings, so the page behaves as if saved
// (an error would make it revert the panel it just opened); any other mutation gets an error
// and marks the scene broken.
const SILENT = new Set(['editPersonScreenSettings'])

export function isSilent(name) {
	return SILENT.has(name)
}

function nameOf(query) {
	return query.match(/^\s*mutation\b[^{]*\{\s*([A-Za-z_]\w*)/)?.[1] ?? 'mutation'
}

// Returns { id, name } for a mutation, null for anything else. Accepts the WebSocket envelope
// ({ data: '<json>', id }) and the HTTP body ({ query }).
export function mutationIn(raw) {
	try {
		const msg = JSON.parse(raw)
		const payload = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg
		const query = typeof payload.query === 'string' ? payload.query : ''
		if (!/^\s*mutation\b/.test(query)) return null
		return { id: msg.id ?? null, name: nameOf(query) }
	} catch {
		return null
	}
}

// A success response for a screen-settings save, echoing what the page sent.
export function silentReply(raw) {
	const msg = JSON.parse(raw)
	const payload = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg
	const name = mutationIn(raw).name
	const v = payload.variables ?? {}
	const data = { [name]: { id: v.id ?? null, name: '', screenSettings: v.settings ?? '{}' } }
	return JSON.stringify({ type: '__response', id: msg.id ?? null, data: JSON.stringify({ data }) })
}

export function blockedReply(id, name) {
	return JSON.stringify({ type: '__response', id, data: JSON.stringify({ errors: [{ message: `Blocked by the screenshot runner: ${name}` }] }) })
}

// Installs the guard on a page; returns the list that collects blocked data-changing mutations.
export async function guardWrites(page) {
	const blocked = []
	const note = (name) => {
		if (!isSilent(name)) blocked.push(name)
	}
	await page.routeWebSocket(/.*/, (ws) => {
		const server = ws.connectToServer()
		ws.onMessage((message) => {
			const m = typeof message === 'string' ? mutationIn(message) : null
			if (!m) return server.send(message)
			note(m.name)
			ws.send(isSilent(m.name) ? silentReply(message) : blockedReply(m.id, m.name))
		})
	})
	await page.route('**/graphql', (route) => {
		const raw = route.request().postData() ?? ''
		const m = mutationIn(raw)
		if (!m) return route.continue()
		note(m.name)
		const reply = isSilent(m.name) ? silentReply(raw) : blockedReply(m.id, m.name)
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.parse(reply).data })
	})
	return blocked
}

// Scenes must never change app data. The runner answers every GraphQL mutation itself, over
// the app's WebSocket and over HTTP, so nothing a scene clicks can reach the server.
// Screen-settings saves (last route, open panels, grid/calendar view) happen on every
// navigation and are dropped silently; any other mutation marks the scene broken.
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
			ws.send(blockedReply(m.id, m.name))
		})
	})
	await page.route('**/graphql', (route) => {
		const m = mutationIn(route.request().postData() ?? '')
		if (!m) return route.continue()
		note(m.name)
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.parse(blockedReply(m.id, m.name)).data })
	})
	return blocked
}

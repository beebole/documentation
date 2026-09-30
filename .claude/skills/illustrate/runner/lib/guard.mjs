// Scenes must never change app data. The runner answers every GraphQL mutation itself, over
// the app's WebSocket and over HTTP, so nothing a scene clicks can reach the server.
// View-preference saves (last route, open panels, grid/calendar view, the planning's selected
// view, journal filters) happen on every navigation: they get a fake success echoing the
// settings, so the page behaves as if saved (an error would make it revert the panel it just
// opened); any other mutation gets an error and marks the scene broken.
// Each one maps to the field it writes and the variable holding its value: the person's UI
// settings (all through editPersonUiSettings in reboot), and a report's Table/Chart/Matrix
// toggles and chart settings (editReportChart), which the app saves on every toggle.
// Two screens also write on opening, and ignore the reply: the Journal marks notifications read
// (markAllNotificationsRead), and an integration's panel saves the Employee role as its default
// role when it has none (editIntegration<Name>DefaultRole). They get the same fake success.
const SILENT = new Map([
	['editPersonScreenSettings', { field: 'screenSettings', variable: 'settings' }],
	['editPersonTaskSettings', { field: 'taskSettings', variable: 'settings' }],
	['editPersonJournalSettings', { field: 'journalSettings', variable: 'settings' }],
	['editReportChart', { field: 'chart', variable: 'chart' }],
	['markAllNotificationsRead', { field: 'id', variable: 'id' }],
	...['Asana', 'Bamboo', 'Jira', 'Linear', 'Monday', 'Quickbooks'].map((n) => [`editIntegration${n}DefaultRole`, { field: 'defaultRole', variable: 'defaultRole' }]),
])

export function isSilent(name) {
	return SILENT.has(name)
}

// The mutation's field name and the key its result comes back under: the alias when there is one
// (`journalSettings: editPersonJournalSettings(...)`), the field name otherwise.
function fieldOf(query) {
	const m = query.match(/^\s*mutation\b[^{]*\{\s*([A-Za-z_]\w*)(?:\s*:\s*([A-Za-z_]\w*))?/)
	if (!m) return { name: 'mutation', key: 'mutation' }
	return m[2] ? { name: m[2], key: m[1] } : { name: m[1], key: m[1] }
}

// Returns { id, name } for a mutation, null for anything else. Accepts the WebSocket envelope
// ({ data: '<json>', id }) and the HTTP body ({ query }).
export function mutationIn(raw) {
	try {
		const msg = JSON.parse(raw)
		const payload = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg
		const query = typeof payload.query === 'string' ? payload.query : ''
		if (!/^\s*mutation\b/.test(query)) return null
		return { id: msg.id ?? null, name: fieldOf(query).name }
	} catch {
		return null
	}
}

// A success response for a view-preference save, echoing what the page sent.
export function silentReply(raw) {
	const msg = JSON.parse(raw)
	const payload = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg
	const { name, key } = fieldOf(payload.query)
	const v = payload.variables ?? {}
	const { field, variable } = SILENT.get(name)
	const data = { [key]: { id: v.id ?? null, name: '', [field]: v[variable] ?? (variable === 'settings' ? '{}' : null) } }
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

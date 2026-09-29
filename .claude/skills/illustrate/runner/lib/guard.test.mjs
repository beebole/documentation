import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mutationIn, blockedReply, isSilent, silentReply } from './guard.mjs'

const ws = (query, id = 7) => JSON.stringify({ data: JSON.stringify({ query, variables: {} }), type: '__request', id, __is_request: true })

test('a query over the WebSocket is not a mutation', () => {
	assert.equal(mutationIn(ws('{ getPersons { id } }')), null)
})
test('a mutation over the WebSocket is found with its name', () => {
	assert.deepEqual(mutationIn(ws('mutation($id: BeeboleId!, $d: Float!) {\n editTimeRecordDuration(id: $id, duration: $d) { id } }', 12)), { id: 12, name: 'editTimeRecordDuration' })
})
test('a mutation posted over HTTP is found', () => {
	assert.equal(mutationIn(JSON.stringify({ query: '  mutation { editPersonScreenSettings(settings: "{}") { id } }' })).name, 'editPersonScreenSettings')
})
test('non-JSON traffic is not a mutation', () => {
	assert.equal(mutationIn('ping'), null)
})
test('the reply is an error response the app matches by id', () => {
	const env = JSON.parse(blockedReply(12, 'editTimeRecordDuration'))
	assert.equal(env.type, '__response')
	assert.equal(env.id, 12)
	assert.match(JSON.parse(env.data).errors[0].message, /editTimeRecordDuration/)
})
test('screen settings writes are blocked silently, data writes are not', () => {
	assert.equal(isSilent('editPersonScreenSettings'), true)
	assert.equal(isSilent('editTimeRecordDuration'), false)
})

test('a screen-settings save gets a fake success echoing the settings, so the page keeps working', () => {
	const raw = JSON.stringify({ data: JSON.stringify({ query: 'mutation($id: BeeboleId!, $settings: String) { editPersonScreenSettings(id: $id, settings: $settings) { name screenSettings } }', variables: { id: 'p1', settings: '{"a":1}' } }), type: '__request', id: 5 })
	const env = JSON.parse(silentReply(raw))
	assert.equal(env.type, '__response')
	assert.equal(env.id, 5)
	const body = JSON.parse(env.data)
	assert.equal(body.errors, undefined)
	assert.equal(body.data.editPersonScreenSettings.screenSettings, '{"a":1}')
})

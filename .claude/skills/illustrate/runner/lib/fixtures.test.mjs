import { test } from 'node:test'
import assert from 'node:assert/strict'
import { partition, apiClient } from './fixtures.mjs'

const entry = (id, fixture) => ({ scene: { id, ...(fixture ? { fixture: { up: async () => ({}), down: async () => {} } } : {}) } })

test('scenes with a fixture run alone, after the others', () => {
	const { parallel, serial } = partition([entry('a'), entry('b', true), entry('c')])
	assert.deepEqual(parallel.map((e) => e.scene.id), ['a', 'c'])
	assert.deepEqual(serial.map((e) => e.scene.id), ['b'])
})

test('the API client needs the documentation key', async () => {
	await assert.rejects(apiClient({ key: '' }), /BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY/)
})

test('the API client refuses another organisation', async () => {
	const fetchFake = async () => ({ json: async () => ({ data: { currentOrganisation: { id: 'x', name: 'Real Co' } } }) })
	await assert.rejects(apiClient({ key: 'k', fetch: fetchFake }), /Real Co/)
})

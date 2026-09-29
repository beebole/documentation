import { test } from 'node:test'
import assert from 'node:assert/strict'
import { summarizeError } from './errors.mjs'

test('a Playwright timeout keeps the locator it was waiting for', () => {
	const msg = "locator.waitFor: Timeout 3000ms exceeded.\nCall log:\n  - waiting for getByText('Level names renamed', { exact: true }) to be visible\n"
	assert.equal(summarizeError(msg), "locator.waitFor: Timeout 3000ms exceeded. (waiting for getByText('Level names renamed', { exact: true }) to be visible)")
})
test('a one-line error stays as it is', () => {
	assert.equal(summarizeError('no cell for Acme on Mon'), 'no cell for Acme on Mon')
})

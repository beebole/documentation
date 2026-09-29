import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assertDocumentationOrg, assertNoApprovals, ORG_ID } from './guards.mjs'

// A fake gql: answers by matching the query text, null means "GraphQL error" (what seed's gql returns).
const fake = (answers) => async (query) => {
	for (const [needle, value] of Object.entries(answers)) if (query.includes(needle)) return typeof value === 'function' ? value() : value
	return null
}

test('the documentation organisation passes', async () => {
	await assert.doesNotReject(assertDocumentationOrg(fake({ currentOrganisation: { currentOrganisation: { id: ORG_ID, name: 'AnyCompany' } } })))
})
test('another organisation is refused', async () => {
	await assert.rejects(assertDocumentationOrg(fake({ currentOrganisation: { currentOrganisation: { id: 'x', name: 'Real Co' } } })), /Real Co/)
})
test('a failed organisation query is refused', async () => {
	await assert.rejects(assertDocumentationOrg(fake({})), /unknown/)
})
test('no approvals passes', async () => {
	await assert.doesNotReject(assertNoApprovals(fake({ getPersons: { getPersons: [{ id: 'p1' }] }, getPersonApprovalEvents: { getPersonApprovalEvents: [] } })))
})
test('approvals are refused', async () => {
	await assert.rejects(assertNoApprovals(fake({ getPersons: { getPersons: [{ id: 'p1' }] }, getPersonApprovalEvents: { getPersonApprovalEvents: [{ id: 'e' }] } })), /approvals exist/)
})
test('a failed people query is refused, not treated as no approvals', async () => {
	await assert.rejects(assertNoApprovals(fake({ getPersonApprovalEvents: { getPersonApprovalEvents: [] } })), /could not/)
})
test('a failed approvals query is refused, not treated as no approvals', async () => {
	await assert.rejects(assertNoApprovals(fake({ getPersons: { getPersons: [{ id: 'p1' }] } })), /could not/)
})

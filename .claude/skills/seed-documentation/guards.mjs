// Safety checks shared by seed.mjs and layer.mjs. Both refuse (throw) rather than guess: a
// GraphQL error comes back from gql() as null and must never read as "all clear".
export const ORG_ID = '6abb86369d045d1d6a183151'

export async function assertDocumentationOrg(gql) {
	const org = (await gql('{ currentOrganisation { id name } }'))?.currentOrganisation
	if (org?.id !== ORG_ID) {
		throw new Error(`Refusing: this key reaches ${org?.name ?? 'an unknown organisation'}, not the documentation account.`)
	}
}

// Once a timesheet is approved, people cannot be deleted, so a wipe would stop half-way.
export async function assertNoApprovals(gql) {
	const persons = (await gql('{ getPersons { id } }'))?.getPersons
	if (!Array.isArray(persons)) throw new Error('Refusing full: could not list people to check for approvals.')
	for (const p of persons) {
		const events = (await gql('query($id: BeeboleId!) { getPersonApprovalEvents(personId: $id) { id } }', { id: p.id }))?.getPersonApprovalEvents
		if (!Array.isArray(events)) throw new Error('Refusing full: could not read approval events.')
		if (events.length) throw new Error('Refusing full: approvals exist, so people cannot be deleted. See README "Full reset".')
	}
}

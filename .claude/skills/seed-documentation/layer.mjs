#!/usr/bin/env node
// Documentation layer, applied by seed.mjs after `full` and `topup` (or run on its own).
// seed.mjs gives a realistic company (18 people, clients, a year of time); this adds what the
// docs pages describe on top: the organisation name, a tag hierarchy (Division → Team), a
// Location category, and colours chosen by the rules in claude-plugins' entity-colors.md.
//
// Idempotent: creates what is missing, re-applies colours and memberships, never deletes data.
// Usage: node layer.mjs (key from BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY in the environment)

import { assertDocumentationOrg } from './guards.mjs'

const ENDPOINT = 'https://qa.beebole.com/graphql'
const KEY = process.env.BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY
if (!KEY) throw new Error('BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY is not set')

// Colour indices (BeeboleColor 0-71): deep row, spread around the wheel, no indigo (the UI
// accent), children share the parent's colour, background categories use neutrals.
const DEPARTMENT = {
	Engineering: {
		color: 2, // purple
		stay: ['Sophie Laurent', 'Jordan Reed'],
		teams: {
			Frontend: ['Marc Dubois', 'Elena Rossi'],
			Backend: ['James Chen', 'Priya Sharma'],
			'Quality Assurance': ['Sarah Jensen'],
		},
	},
	Design: {
		color: 7, // orange
		stay: ["Liam O'Brien"],
		teams: {
			'Product Design': ['Ana Pereira', 'Yuki Tanaka', 'Fatima Al-Hassan'],
			'Brand & Content': ['Marie Lefevre', 'David Kim'],
		},
	},
	Sales: {
		color: 12, // emerald
		stay: ['Thomas Muller'],
		teams: {
			'Account Management': ['Clara Fontaine', 'Emma Costa', 'Lucas Bernard'],
			'Business Development': ['Nils Eriksson', 'Carlos Ruiz'],
		},
	},
}

const LOCATION = {
	levelNames: ['Office'],
	offices: {
		'New York': {
			color: 15, // sky
			people: [
				'Jordan Reed',
				'Sophie Laurent',
				'Marc Dubois',
				'Elena Rossi',
				'Sarah Jensen',
				"Liam O'Brien",
				'Ana Pereira',
				'Yuki Tanaka',
				'Thomas Muller',
				'Clara Fontaine',
			],
		},
		London: { color: 5, people: ['James Chen', 'Marie Lefevre', 'David Kim', 'Emma Costa', 'Lucas Bernard'] }, // rose
		Lisbon: { color: 13, people: ['Priya Sharma', 'Fatima Al-Hassan', 'Nils Eriksson', 'Carlos Ruiz'] }, // teal
	},
}

const CONTRACT_COLORS = { Internal: 51, Contractor: 56 } // gray, stone: recede

// Obviously fictional placeholder, shown wherever the app displays the organisation. Not
// "Acme": the docs already use Acme Corp as the example client (see .claude/context/feedback.md).
const ORGANISATION_NAME = 'AnyCompany'

async function gql(query, variables = {}) {
	const res = await fetch(ENDPOINT, {
		method: 'POST',
		headers: { 'content-type': 'application/json', apikey: KEY },
		body: JSON.stringify({ query, variables }),
	})
	const body = await res.json()
	if (body.errors) throw new Error(`${body.errors[0].message}\n${query}`)
	return body.data
}

async function readState() {
	const d = await gql(`{
		currentOrganisation { id name }
		getTagCategories { id name levelNames }
		getTags { id name level color parent { id } category { id name } relations { tagged { persons { value { id } } } } }
		getPersons { id name }
	}`)
	const tags = d.getTags.map((t) => ({ ...t, personIds: t.relations.tagged.persons.map((p) => p.value.id) }))
	return { org: d.currentOrganisation, categories: d.getTagCategories, tags, persons: d.getPersons }
}

function personId(state, name) {
	const p = state.persons.find((x) => x.name === name)
	if (!p) throw new Error(`Person not found: ${name} (run seed-demo first)`)
	return p.id
}

async function ensureCategory(state, name) {
	const found = state.categories.find((c) => c.name === name)
	if (found) return found.id
	const d = await gql(`mutation($name: BeeboleName!) { addTagCategory(name: $name) { id } }`, { name })
	console.log(`+ category ${name}`)
	return d.addTagCategory.id
}

async function ensureTag(state, { name, categoryId, parentId, color }) {
	let tag = state.tags.find((t) => t.name === name && t.category?.id === categoryId)
	if (!tag) {
		const d = await gql(
			`mutation($name: BeeboleName!, $categoryId: BeeboleId, $parentId: BeeboleId, $color: BeeboleColor) {
				addTag(name: $name, categoryId: $categoryId, parentId: $parentId, color: $color) { id }
			}`,
			{ name, categoryId, parentId, color }
		)
		console.log(`+ tag ${name}`)
		tag = { id: d.addTag.id, personIds: [], color }
		state.tags.push({ ...tag, name, category: { id: categoryId } })
	} else if (tag.color !== color) {
		await gql(`mutation($id: BeeboleId!, $color: BeeboleColor!) { editTagColor(id: $id, color: $color) { id } }`, {
			id: tag.id,
			color,
		})
		console.log(`~ colour ${name} → ${color}`)
	}
	return tag
}

async function setMembers(state, tag, names, label) {
	for (const name of names) {
		const id = personId(state, name)
		if (tag.personIds.includes(id)) continue
		await gql(`mutation($tagId: BeeboleId!, $personId: BeeboleId!) { tagPerson(tagId: $tagId, personId: $personId) { id } }`, {
			tagId: tag.id,
			personId: id,
		})
		tag.personIds.push(id)
		console.log(`+ ${name} → ${label}`)
	}
}

async function removeMembers(state, tag, names, label) {
	for (const name of names) {
		const id = personId(state, name)
		if (!tag.personIds.includes(id)) continue
		await gql(`mutation($tagId: BeeboleId!, $personId: BeeboleId!) { untagPerson(tagId: $tagId, personId: $personId) { id } }`, {
			tagId: tag.id,
			personId: id,
		})
		tag.personIds = tag.personIds.filter((x) => x !== id)
		console.log(`- ${name} ✕ ${label}`)
	}
}

export async function applyLayer() {
	// Refuse before any write: run on its own, this script must not touch another organisation.
	await assertDocumentationOrg(async (q) => gql(q).catch(() => null))
	const state = await readState()
	console.log(`Organisation: ${state.org.name}`)
	if (state.org.name !== ORGANISATION_NAME) {
		await gql(`mutation($name: BeeboleName!) { editOrganisationName(name: $name) { id } }`, { name: ORGANISATION_NAME })
		console.log(`~ organisation renamed → ${ORGANISATION_NAME}`)
	}

	const deptId = await ensureCategory(state, 'Department')
	for (const [division, conf] of Object.entries(DEPARTMENT)) {
		const div = await ensureTag(state, { name: division, categoryId: deptId, color: conf.color })
		// People sit in their team; only the division lead stays on the division itself. The
		// backend refuses a team tag while the person still holds its division (AlreadyAssigned).
		await removeMembers(state, div, Object.values(conf.teams).flat(), division)
		for (const [team, people] of Object.entries(conf.teams)) {
			const t = await ensureTag(state, { name: team, categoryId: deptId, parentId: div.id, color: conf.color })
			await setMembers(state, t, people, team)
		}
		await setMembers(state, div, conf.stay, division)
	}

	const locId = await ensureCategory(state, 'Location')
	await gql(`mutation($id: BeeboleId!, $levelNames: [String]) { editTagCategoryLevelNames(id: $id, levelNames: $levelNames) { id } }`, {
		id: locId,
		levelNames: LOCATION.levelNames,
	})
	for (const [office, conf] of Object.entries(LOCATION.offices)) {
		const t = await ensureTag(state, { name: office, categoryId: locId, color: conf.color })
		await setMembers(state, t, conf.people, office)
	}

	const contract = state.categories.find((c) => c.name === 'Contract')
	for (const [name, color] of Object.entries(CONTRACT_COLORS)) {
		if (contract) await ensureTag(state, { name, categoryId: contract.id, color })
	}
	console.log('Screenshot layer applied.')
}

if (import.meta.url === `file://${process.argv[1]}`) {
	applyLayer().catch((e) => {
		console.error(e.message)
		process.exit(1)
	})
}

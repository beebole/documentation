---
name: seed-demo
description: 'Seed a Reboot account with realistic demo data. `/seed-demo <apikey>` or `/seed-demo <apikey> <url>`. Wipes existing data and creates ~25 people, projects, tasks, tags, costs, billing, budgets, custom fields, and ~1200 time records.'
---

# Seed Demo Data

Generate and execute a Node.js script that populates a Reboot account with realistic demo data via the GraphQL API.

## 1. Parse Arguments

Extract from invocation args:

- `API_KEY` (required) -- first argument
- `API_URL` (optional) -- second argument, default `http://localhost:3000`

If no API key is provided, ask the user for one and stop.

## 2. Load Reference Data

Read the file `seed-demo/references/seed-demo-data.md` (relative to this skill file) to get all entity definitions: people, projects, tasks, tags, time records, costs, billing, budgets, and custom fields.

## 3. Confirm Wipe

Tell the user:

> This will **delete all existing data** (time records, expenses, custom fields, tasks, projects, tags, non-default persons) and replace it with demo data. Proceed?

Wait for confirmation before continuing.

## 4. Generate the Script

Create a file at `/tmp/seed-demo.mjs`. The script must be a self-contained ES module using only Node.js built-ins (no npm dependencies). Structure it as follows.

### 4.1 GraphQL Helper

```javascript
const API_URL = '<url>/graphql'
const API_KEY = '<apikey>'

async function gql(query, variables) {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', apikey: API_KEY },
		body: JSON.stringify({ query, variables }),
	})
	const json = await res.json()
	if (json.errors) {
		console.error('GraphQL error:', JSON.stringify(json.errors, null, 2))
		console.error('Query:', query.slice(0, 200))
		return null
	}
	return json.data
}
```

Replace `<url>` and `<apikey>` with the parsed values.

### 4.2 Concurrency Pool

```javascript
function createPool(concurrency) {
	let active = 0
	const queue = []
	function next() {
		if (queue.length === 0 || active >= concurrency) return
		active++
		const { fn, resolve, reject } = queue.shift()
		fn()
			.then(resolve, reject)
			.finally(() => {
				active--
				next()
			})
	}
	return (fn) =>
		new Promise((resolve, reject) => {
			queue.push({ fn, resolve, reject })
			next()
		})
}
```

Use a pool of 5 for time record creation.

### 4.3 Date Resolver

```javascript
function resolveDate(offset) {
	const now = new Date()
	now.setHours(0, 0, 0, 0)
	if (offset === 'now') return now.getTime()
	if (offset === 'yesterday') {
		now.setDate(now.getDate() - 1)
		return now.getTime()
	}
	const match = offset.match(/^([+-])(\d+)(m|w|y)$/)
	if (!match) throw new Error(`Invalid date offset: ${offset}`)
	const [, sign, num, unit] = match
	const n = parseInt(num) * (sign === '-' ? -1 : 1)
	if (unit === 'm') now.setMonth(now.getMonth() + n)
	else if (unit === 'w') now.setDate(now.getDate() + n * 7)
	else if (unit === 'y') now.setFullYear(now.getFullYear() + n)
	return now.getTime()
}
```

### 4.4 Deterministic WFH

```javascript
function deterministicWfh(personName, dateMs) {
	let hash = 0
	const str = personName + dateMs
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i)
		hash |= 0
	}
	return Math.abs(hash) % 5 === 0 // ~20% WFH
}
```

### 4.5 Wipe Existing Data

Delete in this exact order (reverse dependency):

1. **Time records**: `getTimeRecords { id }` then `deleteTimeRecords(ids: [...])` in batches of 100
2. **Expense records**: `getExpenseRecords { id }` then `deleteExpenseRecord(id)` each
3. **Custom field values**: `getCustomFieldValues { id }` then `deleteCustomFieldValue(id)` each
4. **Custom fields**: `getCustomFields { id name }` then `deleteCustomField(id)` each
5. **Project budgets**: query `getProjects { id budgets { id } }`, then `deleteProjectBudget(projectId, budgetId)` for each
6. **Project billings**: query `getProjects { id billings { rates { id } } }`, then `deleteProjectBilling(projectId, billingId)` for each -- billings is an attribute; query as `billings { rates { id } }`
7. **Person costs**: query `getPersons { id costs { rates { id } } }`, then `deletePersonCost(personId, costId)` for each -- costs is an attribute; query as `costs { rates { id } }`
8. **Tasks**: query `getTasks { id level }`, sort by level DESC (leaves first), `deleteTask(id)` each
9. **Projects**: query `getProjects { id level }`, sort by level DESC, `deleteProject(id)` each
10. **Tags**: query `getTags { id level }`, sort by level DESC, `deleteTag(id)` each
11. **Persons**: query `getPersons { id }`, `deletePerson(id)` each EXCEPT the current person (skip the one that matches the API key owner)
12. **Non-default tag categories**: query `getTagCategories { id name }`, delete any named "Contract" via `deleteTagCategory(id)`. Keep "Department" and "Location" (defaults). Do NOT delete project or task categories.

Log progress for each step (e.g., `console.log('Deleted 47 time records')`).

### 4.6 Resolve Existing Defaults

After wipe, fetch system defaults the script needs to reference:

```javascript
const rolesData = await gql('{ getRoles { id name } }')
const roles = Object.fromEntries(rolesData.getRoles.map((r) => [r.name, r.id]))

const schedulesData = await gql('{ getScheduleTypes { id name } }')
const schedules = Object.fromEntries(schedulesData.getScheduleTypes.map((s) => [s.name, s.id]))

const projCatsData = await gql('{ getProjectCategories { id name } }')
const projCats = Object.fromEntries(projCatsData.getProjectCategories.map((c) => [c.name, c.id]))

const tagCatsData = await gql('{ getTagCategories { id name } }')
const tagCats = Object.fromEntries(tagCatsData.getTagCategories.map((c) => [c.name, c.id]))

const taskCatsData = await gql('{ getTaskCategories { id name statuses { id name } } }')
const taskCat = taskCatsData.getTaskCategories.find((c) => c.name === 'Main planning')
const statuses = Object.fromEntries(taskCat.statuses.map((s) => [s.name, s.id]))
```

### 4.7 Entity Creation Order

Create entities in this exact order, storing name-to-ID maps as you go:

1. **Tag category "Contract"**: `addTagCategory(name: "Contract")` -- store the returned ID
2. **Tags**: `addTag(name, categoryId)` for each tag from reference data (Department, Location, Contract categories) -- store name-to-ID map
3. **People**: `addPerson(name, email, roleId, color)` for each person -- store name-to-ID map. Then for each person:
    - `assignScheduleTypeToPerson(personId, scheduleTypeId)`
    - `tagPerson(tagId, personId)` for each of their department, location, and contract tags
4. **Manager assignments**: for each department that has a manager defined, call `makeManagerOfPerson(managerId, personId)` for every person in that department
5. **Person costs**: for each person:
    - Internal employees: `addPersonCost(personId, startTime, amount: {value: cents, currency: "EUR"}, method: "fixed", repeatEnabled: true)`
    - Contractors: `addPersonCost(personId, startTime, amount: {value: cents, currency: "EUR"}, method: "hourly")`
    - `startTime` = the person's "Date of Entry" resolved via `resolveDate()` to a timestamp
    - Amount value is in **cents** (e.g., 5000 EUR = 500000 cents)
6. **Projects**: create top-level projects first (Parent = "--"), then children. Use `addProject(name, categoryId, parentId, color)` -- store name-to-ID map
7. **Project billing**: for sub-projects that have a Billing Rate, call `addProjectBilling(projectId, startTime, amount: {value: cents, currency: "EUR"}, method: "hourly")` -- `startTime` from the Budget Period start
8. **Project budgets**: for sub-projects that have budgets, call `addProjectBudget(projectId, startTime, endTime, billingAmount: {value: cents, currency: "EUR"}, costAmount: {value: cents, currency: "EUR"}, quantity: hours)`
9. **Tasks**: `addTask(name, categoryId)` -- store name-to-ID map. Then for each task:
    - `assignOwnerOfTask(taskId, personId)`
    - `assignTaskToPerson(taskId, personId)` for each assigned person
    - `editTaskPeriod(id, startTime, endTime, effort)` if start/end are defined (effort in hours as float)
    - `editTaskStatus(id, statusId)` if status is not the default first status
10. **Custom fields**:
    - `addCustomField(name: "Date of Entry", fieldType: "date", color: null)` -- store ID
    - `editCustomFieldVisibilityPersons(id, enabled: true)`
    - `addCustomField(name: "Payroll ID", fieldType: "text", color: null)` -- store ID
    - `editCustomFieldVisibilityPersons(id, enabled: true)`
    - For each person: `addCustomFieldValue(customFieldId, entityType: "person", entityId, dateValue: timestamp)` for Date of Entry, and `addCustomFieldValue(customFieldId, entityType: "person", entityId, textValue: "PAY-XXX")` for Payroll ID

### 4.8 Time Record Generation

For each row in the Time Records table from reference data:

1. Parse the period "X to Y" -- resolve both offsets to timestamps, cap end at yesterday
2. Iterate day by day from start to end
3. Skip weekends (`day.getDay() === 0 || day.getDay() === 6`)
4. Skip based on Days/Week value: 5 = Mon--Fri, 4 = Mon--Thu, 3 = Mon--Wed, 2 = Mon+Wed
5. Create the record: `addTimeRecord(startTime: dayMs, endTime: dayMs + 86400000, duration: hours*60, personId, projectIds)`
    - `projectIds`: if Client is "--", use `[activityProjectId]`; otherwise use `[clientProjectId, activityProjectId]`
    - After creation, if `deterministicWfh(personName, dayMs)` returns true, call `editTimeRecordWfh(id, wfh: true)`
    - Set `comment` by cycling through the Comments list by index
6. Use the concurrency pool (size 5) for speed

### 4.9 API Notes

- Timestamps are **milliseconds** (not seconds). Values < 1e10 are rejected.
- Amount values are in **cents**: `{ value: 500000, currency: "EUR" }` = 5000.00 EUR
- Valid `BeeboleRateMethod` values: `"fixed"`, `"daily"`, `"hourly"`, `"nonBillable"`, `"noCost"`
- Always `await` every `gql()` call -- without await the request is silently dropped (lazy thenable on the app side, but our script uses real fetch so this is just good practice)

### 4.10 Wrap Up

At the end of the script, log a summary:

```
console.log('\nDone! Created:')
console.log(`  ${personCount} people`)
console.log(`  ${projectCount} projects`)
console.log(`  ${taskCount} tasks`)
console.log(`  ${tagCount} tags`)
console.log(`  ${timeRecordCount} time records`)
```

## 5. Execute the Script

Run the generated script:

```bash
node /tmp/seed-demo.mjs
```

Watch the output for errors. If a GraphQL error occurs, diagnose it (common issues: wrong field name, missing required arg, wrong type for amount/timestamp) and fix the script, then re-run.

## 6. Report Results

Tell the user what was created, how long it took, and whether there were any errors. Include a note that they can sign in to see the demo data.

// Documentation seed: builds and tops up the AnyCompany QA account used for docs screenshots.
// Started from reboot's scripts/seed-demo.mjs (2026-09-29) and adapted; see README.md.
// Usage: node seed.mjs <full|topup|approve> [--dry-run]
//   full    wipe + rebuild (refused once any approval exists), then the documentation layer
//   topup   add time records from the last recorded day up to yesterday, then the layer
//   approve submit/approve history (one-way: the account can no longer be wiped afterwards)
import { applyLayer } from './layer.mjs'
import { assertDocumentationOrg, assertNoApprovals } from './guards.mjs'

const API_URL = 'https://qa.beebole.com/graphql'
const API_KEY = process.env.BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY
const args = process.argv.slice(2)
const flags = args.filter((a) => a.startsWith('--'))
const modeArg = args.find((a) => !a.startsWith('--')) || ''
const MODES = { full: 'full', topup: 'append', approve: 'approve' }
if (!API_KEY || !MODES[modeArg]) {
	console.error('Usage: node seed.mjs <full|topup|approve> [--dry-run]  (key from BEEBOLE_QA_DOCS_SCREENSHOTS_APIKEY in the environment)')
	process.exit(1)
}
const MODE = MODES[modeArg]
const DRY_RUN = flags.includes('--dry-run')
const target = 'qa'
console.log(`Seeding to: ${API_URL}`)

// ────────────────────────────────────────────────────────────
// 4.1 GraphQL helper
// ────────────────────────────────────────────────────────────

// QA sometimes drops connections for a few seconds: retry network failures (not GraphQL errors).
async function post(body) {
	for (let attempt = 1; ; attempt++) {
		try {
			return await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: API_KEY }, body })
		} catch (e) {
			if (attempt >= 3) throw e
			await new Promise((r) => setTimeout(r, 5000 * attempt))
		}
	}
}

async function gql(query, variables) {
	const res = await post(JSON.stringify({ query, variables }))
	const json = await res.json()
	if (json.errors) {
		console.error('GraphQL error:', JSON.stringify(json.errors, null, 2))
		console.error('Query:', query.slice(0, 300))
		console.error('Vars:', JSON.stringify(variables))
		return null
	}
	return json.data
}

// ────────────────────────────────────────────────────────────
// 4.2 Concurrency pool
// ────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────
// 4.3 Date resolver (UTC noon)
// ────────────────────────────────────────────────────────────

function resolveDate(offset) {
	const now = new Date()
	const y = now.getUTCFullYear(),
		m = now.getUTCMonth(),
		d = now.getUTCDate()
	let date = new Date(Date.UTC(y, m, d, 12, 0, 0))
	if (offset === 'now') return date.getTime()
	if (offset === 'yesterday') return new Date(Date.UTC(y, m, d - 1, 12, 0, 0)).getTime()
	const match = String(offset).match(/^([+-])(\d+)(m|w|y)$/)
	if (!match) throw new Error(`Invalid date offset: ${offset}`)
	const [, sign, num, unit] = match
	const n = parseInt(num) * (sign === '-' ? -1 : 1)
	if (unit === 'm') date = new Date(Date.UTC(y, m + n, d, 12, 0, 0))
	else if (unit === 'w') date = new Date(Date.UTC(y, m, d + n * 7, 12, 0, 0))
	else if (unit === 'y') date = new Date(Date.UTC(y + n, m, d, 12, 0, 0))
	return date.getTime()
}

// Snap a timestamp to the 1st of its month at UTC noon
function firstOfMonth(ts) {
	const d = new Date(ts)
	return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 12, 0, 0)).getTime()
}

// ────────────────────────────────────────────────────────────
// 4.4 Deterministic WFH (~20%)
// ────────────────────────────────────────────────────────────

function hashString(str) {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i)
		hash |= 0
	}
	return Math.abs(hash)
}

function deterministicWfh(personName, dateMs) {
	return hashString(personName + dateMs) % 5 === 0
}

// ────────────────────────────────────────────────────────────
// Reference data
// ────────────────────────────────────────────────────────────

const PEOPLE = [
	// ── Engineering (1 manager + 5 employees) ──
	{
		name: 'Sophie Laurent',
		email: 'sophie@example.com',
		role: 'Manager',
		department: 'Engineering',
		contract: 'Internal',
		cost: { hourly: 47 },
		payrollId: 'PAY-001',
		entry: '-11m',
	},
	{
		name: 'Marc Dubois',
		email: 'marc@example.com',
		role: 'Employee',
		department: 'Engineering',
		contract: 'Internal',
		cost: { hourly: 38 },
		payrollId: 'PAY-002',
		entry: '-10m',
	},
	{
		name: 'Elena Rossi',
		email: 'elena@example.com',
		role: 'Employee',
		department: 'Engineering',
		contract: 'Internal',
		cost: { hourly: 35 },
		payrollId: 'PAY-003',
		entry: '-10m',
	},
	{
		name: 'James Chen',
		email: 'james@example.com',
		role: 'Employee',
		department: 'Engineering',
		contract: 'Internal',
		cost: { hourly: 41 },
		payrollId: 'PAY-004',
		entry: '-9m',
	},
	{
		name: 'Priya Sharma',
		email: 'priya@example.com',
		role: 'Employee',
		department: 'Engineering',
		contract: 'Contractor',
		cost: { hourly: 95 },
		payrollId: 'PAY-005',
		entry: '-6m',
	},
	{
		name: 'Sarah Jensen',
		email: 'sarah@example.com',
		role: 'Employee',
		department: 'Engineering',
		contract: 'Internal',
		cost: { hourly: 38 },
		payrollId: 'PAY-006',
		entry: '-8m',
	},
	// ── Design (1 manager + 5 employees) ──
	{
		name: "Liam O'Brien",
		email: 'liam@example.com',
		role: 'Manager',
		department: 'Design',
		contract: 'Internal',
		cost: { hourly: 44 },
		payrollId: 'PAY-007',
		entry: '-11m',
	},
	{
		name: 'Ana Pereira',
		email: 'ana@example.com',
		role: 'Employee',
		department: 'Design',
		contract: 'Internal',
		cost: { hourly: 31 },
		payrollId: 'PAY-008',
		entry: '-9m',
	},
	{
		name: 'Yuki Tanaka',
		email: 'yuki@example.com',
		role: 'Employee',
		department: 'Design',
		contract: 'Internal',
		cost: { hourly: 31 },
		payrollId: 'PAY-009',
		entry: '-8m',
	},
	{
		name: 'Marie Lefevre',
		email: 'marie@example.com',
		role: 'Employee',
		department: 'Design',
		contract: 'Internal',
		cost: { hourly: 25 },
		payrollId: 'PAY-010',
		entry: '-5m',
	},
	{
		name: 'David Kim',
		email: 'david@example.com',
		role: 'Employee',
		department: 'Design',
		contract: 'Internal',
		cost: { hourly: 31 },
		payrollId: 'PAY-011',
		entry: '-6m',
	},
	{
		name: 'Fatima Al-Hassan',
		email: 'fatima@example.com',
		role: 'Employee',
		department: 'Design',
		contract: 'Internal',
		cost: { hourly: 25 },
		payrollId: 'PAY-012',
		entry: '-5m',
	},
	// ── Sales (1 manager + 5 employees) ──
	{
		name: 'Thomas Muller',
		email: 'thomas@example.com',
		role: 'Manager',
		department: 'Sales',
		contract: 'Internal',
		cost: { hourly: 47 },
		payrollId: 'PAY-013',
		entry: '-12m',
	},
	{
		name: 'Clara Fontaine',
		email: 'clara@example.com',
		role: 'Employee',
		department: 'Sales',
		contract: 'Internal',
		cost: { hourly: 31 },
		payrollId: 'PAY-014',
		entry: '-7m',
	},
	{
		name: 'Nils Eriksson',
		email: 'nils@example.com',
		role: 'Employee',
		department: 'Sales',
		contract: 'Contractor',
		cost: { hourly: 75 },
		payrollId: 'PAY-015',
		entry: '-4m',
	},
	{
		name: 'Carlos Ruiz',
		email: 'carlos@example.com',
		role: 'Employee',
		department: 'Sales',
		contract: 'Contractor',
		cost: { hourly: 70 },
		payrollId: 'PAY-016',
		entry: '-3m',
	},
	{
		name: 'Emma Costa',
		email: 'emma@example.com',
		role: 'Employee',
		department: 'Sales',
		contract: 'Internal',
		cost: { hourly: 28 },
		payrollId: 'PAY-017',
		entry: '-7m',
	},
	{
		name: 'Lucas Bernard',
		email: 'lucas@example.com',
		role: 'Employee',
		department: 'Sales',
		contract: 'Internal',
		cost: { hourly: 28 },
		payrollId: 'PAY-018',
		entry: '-6m',
	},
]

const DEPARTMENTS = ['Engineering', 'Design', 'Sales']
const CONTRACTS = ['Internal', 'Contractor']

// Neutral demo identity for the admin/owner so screenshots don't show the operator's real name.
const ADMIN_NAME = 'Jordan Reed'

const CLIENT_PROJECTS = [
	{ name: 'Acme Corp', parent: null, color: 2, billingHourly: 150 },
	{ name: 'Website Redesign', parent: 'Acme Corp', color: 1, budget: { billing: 60000, cost: 17500, hours: 400 } },
	{ name: 'Mobile App', parent: 'Acme Corp', color: 2, budget: { billing: 40000, cost: 12500, hours: 250 } },
	{ name: 'Greenleaf Industries', parent: null, color: 11, billingHourly: 175 },
	{
		name: 'ERP Integration',
		parent: 'Greenleaf Industries',
		color: 11,
		budget: { billing: 55000, cost: 16000, hours: 340 },
	},
	{
		name: 'Data Migration',
		parent: 'Greenleaf Industries',
		color: 11,
		budget: { billing: 15000, cost: 4500, hours: 100 },
	},
	{ name: 'Northstar Financial', parent: null, color: 4, billingHourly: 180 },
	{
		name: 'Dashboard',
		parent: 'Northstar Financial',
		color: 21,
		budget: { billing: 35000, cost: 10000, hours: 200 },
	},
	{ name: 'Silverline Retail', parent: null, color: 8, billingHourly: 165 },
	{
		name: 'E-commerce Platform',
		parent: 'Silverline Retail',
		color: 8,
		budget: { billing: 25000, cost: 7500, hours: 150 },
	},
	{ name: 'Brightwave Media', parent: null, color: 7, billingHourly: 160 },
	{ name: 'Brand Campaign', parent: 'Brightwave Media', color: 7 },
	{
		name: 'Video Production',
		parent: 'Brand Campaign',
		color: 7,
		budget: { billing: 18000, cost: 5500, hours: 110 },
	},
	{ name: 'Web Portal', parent: 'Brightwave Media', color: 7, budget: { billing: 30000, cost: 9000, hours: 180 } },
	{ name: 'Quantum Logistics', parent: null, color: 13, billingHourly: 170 },
	{
		name: 'Fleet Tracker',
		parent: 'Quantum Logistics',
		color: 16,
		budget: { billing: 50000, cost: 15000, hours: 320 },
	},
]

const INTERNAL_PROJECTS = [
	{ name: 'Training', color: 11 },
	{ name: 'General Admin', color: 16 },
	{ name: 'Sales', color: 42 },
	{ name: 'HR & Recruitment', color: 15 },
]

const ACTIVITY_PROJECTS = [
	{ name: 'Development', color: 1 },
	{ name: 'Design', color: 5 },
	{ name: 'Analysis', color: 9 },
	{ name: 'Meeting', color: 16 },
	{ name: 'Administration', color: 15 },
]

// ── Schedule types ──
// days: one entry per cycle day (0 = first day = a Monday, see calendarStartTime).
// duration in ms, timePairs as [[startMsSinceMidnight, endMsSinceMidnight]], wfh boolean.
const H = 3600000 // one hour in ms
const workday = (start, end, wfh = false) => ({ duration: (end - start) * H, timePairs: [[start * H, end * H]], wfh })
const offday = { duration: 0, timePairs: [], wfh: false }

const SCHEDULE_TYPES = [
	{
		name: 'Full Time',
		color: 1,
		length: 7,
		// Mon–Fri 9–17 (8h), weekend off
		days: [workday(9, 17), workday(9, 17), workday(9, 17), workday(9, 17), workday(9, 17), offday, offday],
	},
	{
		name: '24/7',
		color: 4,
		length: 7,
		// 24h every day; Mon & Tue worked from home
		days: [
			workday(0, 24, true),
			workday(0, 24, true),
			workday(0, 24),
			workday(0, 24),
			workday(0, 24),
			workday(0, 24),
			workday(0, 24),
		],
	},
	{
		name: 'Half Time – 3d-2d',
		color: 8,
		length: 14,
		// Week 1: Mon–Wed 8h; Week 2: Mon–Tue 8h
		days: [
			workday(9, 17),
			workday(9, 17),
			workday(9, 17),
			offday,
			offday,
			offday,
			offday,
			workday(9, 17),
			workday(9, 17),
			offday,
			offday,
			offday,
			offday,
			offday,
		],
	},
	{
		name: 'Half Time – 5d',
		color: 11,
		length: 7,
		// Mon–Fri 9–13 (4h), weekend off
		days: [workday(9, 13), workday(9, 13), workday(9, 13), workday(9, 13), workday(9, 13), offday, offday],
	},
]

// ── Expense types ──
const EXPENSE_TYPES = [
	{ name: 'Hotel', color: 2, isCurrency: true, markup: 100, isInBudget: false },
	{ name: 'Taxi', color: 5, isCurrency: true, markup: 100, isInBudget: false },
	{ name: 'Meal', color: 4, isCurrency: true, markup: 0, isInBudget: false },
	{ name: 'Mileage', color: 9, isCurrency: false, markup: 0, isInBudget: false },
]

// ── Absence types ──
const ABSENCE_TYPES = [
	{ name: 'PTO', color: 3 },
	{ name: 'Sickness', color: 7 },
]

const TASKS = [
	{
		name: 'Requirements Gathering',
		project: 'Website Redesign',
		status: 'Done',
		owner: 'Sophie Laurent',
		assignees: ['Marc Dubois', 'Elena Rossi'],
		start: '-3m',
		end: '-2m',
		effort: 80,
		followedBy: ['UI/UX Design'],
	},
	{
		name: 'UI/UX Design',
		project: 'Website Redesign',
		status: 'Done',
		owner: "Liam O'Brien",
		assignees: ['Ana Pereira', 'Yuki Tanaka'],
		start: '-2m',
		end: '-1m',
		effort: 120,
		followedBy: ['Frontend Development', 'Backend Development'],
	},
	{
		name: 'Frontend Development',
		project: 'Website Redesign',
		status: 'In progress',
		owner: 'Sophie Laurent',
		assignees: ['James Chen', 'Sarah Jensen'],
		start: '-1m',
		end: '+1m',
		effort: 200,
		followedBy: ['QA Testing'],
	},
	{
		name: 'Backend Development',
		project: 'Website Redesign',
		status: 'In progress',
		owner: 'Sophie Laurent',
		assignees: ['Marc Dubois', 'Elena Rossi'],
		start: '-1m',
		end: '+1m',
		effort: 160,
		followedBy: ['QA Testing'],
	},
	{
		name: 'QA Testing',
		project: 'Website Redesign',
		status: 'Queue',
		owner: 'Sophie Laurent',
		assignees: ['Elena Rossi', 'Priya Sharma'],
		start: '+2w',
		end: '+2m',
		effort: 60,
		followedBy: [],
	},
	{
		name: 'App Wireframes',
		project: 'Mobile App',
		status: 'Done',
		owner: "Liam O'Brien",
		assignees: ['Ana Pereira'],
		start: '-3m',
		end: '-2m',
		effort: 40,
		followedBy: ['App Development'],
	},
	{
		name: 'App Development',
		project: 'Mobile App',
		status: 'In progress',
		owner: 'Sophie Laurent',
		assignees: ['James Chen'],
		start: '-6w',
		end: '+2w',
		effort: 180,
		followedBy: [],
	},
	{
		name: 'System Analysis',
		project: 'ERP Integration',
		status: 'Done',
		owner: 'Sophie Laurent',
		assignees: ['Marc Dubois', 'Elena Rossi'],
		start: '-3m',
		end: '-6w',
		effort: 100,
		followedBy: ['Module Implementation'],
	},
	{
		name: 'Module Implementation',
		project: 'ERP Integration',
		status: 'In progress',
		owner: 'Sophie Laurent',
		assignees: ['Marc Dubois', 'Sarah Jensen'],
		start: '-6w',
		end: '+1m',
		effort: 240,
		followedBy: [],
	},
	{
		name: 'Data Audit',
		project: 'Data Migration',
		status: 'Done',
		owner: 'Sophie Laurent',
		assignees: ['Elena Rossi'],
		start: '-2m',
		end: '-1m',
		effort: 40,
		followedBy: ['Migration Scripts'],
	},
	{
		name: 'Migration Scripts',
		project: 'Data Migration',
		status: 'In progress',
		owner: 'Sophie Laurent',
		assignees: ['Elena Rossi'],
		start: '-1m',
		end: 'now',
		effort: 60,
		followedBy: [],
	},
	{
		name: 'Dashboard Mockups',
		project: 'Dashboard',
		status: 'Done',
		owner: "Liam O'Brien",
		assignees: ['Yuki Tanaka', 'Marie Lefevre'],
		start: '-2m',
		end: '-1m',
		effort: 60,
		followedBy: ['Dashboard Frontend', 'Dashboard API'],
	},
	{
		name: 'Dashboard Frontend',
		project: 'Dashboard',
		status: 'In progress',
		owner: 'Sophie Laurent',
		assignees: ['James Chen'],
		start: '-3w',
		end: '+1m',
		effort: 120,
		followedBy: [],
	},
	{
		name: 'Dashboard API',
		project: 'Dashboard',
		status: 'In progress',
		owner: 'Sophie Laurent',
		assignees: ['Sarah Jensen'],
		start: '-3w',
		end: '+1m',
		effort: 80,
		followedBy: [],
	},
	{
		name: 'UX Research',
		project: 'E-commerce Platform',
		status: 'In progress',
		owner: "Liam O'Brien",
		assignees: ['Ana Pereira', 'Yuki Tanaka'],
		start: '-2w',
		end: '+2w',
		effort: 60,
		followedBy: ['Storefront Design'],
	},
	{
		name: 'Storefront Design',
		project: 'E-commerce Platform',
		status: 'Backlog',
		owner: "Liam O'Brien",
		assignees: ['Ana Pereira'],
		start: '+2w',
		end: '+2m',
		effort: 120,
		followedBy: [],
	},
	// ── Web Portal (Brightwave) — owned by Thomas Muller, one task at a time (sequential) ──
	{
		name: 'Portal Discovery',
		project: 'Web Portal',
		status: 'Done',
		owner: 'Thomas Muller',
		assignees: ['Emma Costa'],
		start: '-3m',
		end: '-2m',
		effort: 40,
		followedBy: ['Portal Architecture'],
	},
	{
		name: 'Portal Architecture',
		project: 'Web Portal',
		status: 'Done',
		owner: 'Thomas Muller',
		assignees: ['Lucas Bernard'],
		start: '-2m',
		end: '-1m',
		effort: 60,
		followedBy: ['Portal Build'],
	},
	{
		name: 'Portal Build',
		project: 'Web Portal',
		status: 'In progress',
		owner: 'Thomas Muller',
		assignees: ['Clara Fontaine'],
		start: '-1m',
		end: '+1m',
		effort: 200,
		followedBy: ['Portal Launch'],
	},
	{
		name: 'Portal Launch',
		project: 'Web Portal',
		status: 'Queue',
		owner: 'Thomas Muller',
		assignees: ['Emma Costa'],
		start: '+1m',
		end: '+2m',
		effort: 50,
		followedBy: [],
	},
	// ── Fleet Tracker (Quantum) — owned by James Chen, one task at a time (sequential) ──
	{
		name: 'Fleet Requirements',
		project: 'Fleet Tracker',
		status: 'Done',
		owner: 'James Chen',
		assignees: ['Carlos Ruiz'],
		start: '-3m',
		end: '-2m',
		effort: 50,
		followedBy: ['Fleet API'],
	},
	{
		name: 'Fleet API',
		project: 'Fleet Tracker',
		status: 'Done',
		owner: 'James Chen',
		assignees: ['Nils Eriksson'],
		start: '-2m',
		end: '-1m',
		effort: 120,
		followedBy: ['Fleet Dashboard'],
	},
	{
		name: 'Fleet Dashboard',
		project: 'Fleet Tracker',
		status: 'In progress',
		owner: 'James Chen',
		assignees: ['Nils Eriksson'],
		start: '-1m',
		end: '+1m',
		effort: 140,
		followedBy: ['Fleet Rollout'],
	},
	{
		name: 'Fleet Rollout',
		project: 'Fleet Tracker',
		status: 'Queue',
		owner: 'James Chen',
		assignees: ['Carlos Ruiz'],
		start: '+1m',
		end: '+2m',
		effort: 60,
		followedBy: [],
	},
]

const TIME_ASSIGNMENTS = [
	{
		person: 'Sophie Laurent',
		client: 'Website Redesign',
		activity: 'Meeting',
		comments: ['Sprint planning', 'Architecture review', 'Standup'],
	},
	{
		person: 'Sophie Laurent',
		client: 'ERP Integration',
		activity: 'Meeting',
		comments: ['Status update', 'Risk assessment', 'Stakeholder sync'],
	},
	{ person: 'Sophie Laurent', client: 'Training', activity: null, comments: ['AI tooling evaluation', 'Prototype'] },
	{
		person: 'Marc Dubois',
		client: 'Website Redesign',
		activity: 'Development',
		comments: ['Core module', 'Service layer', 'DB schema'],
	},
	{
		person: 'Marc Dubois',
		client: 'ERP Integration',
		activity: 'Development',
		comments: ['Module config', 'Integration testing', 'Data mapping'],
	},
	{
		person: 'Marc Dubois',
		client: 'Training',
		activity: null,
		comments: ['AWS certification', 'Cloud architecture'],
	},
	{
		person: 'Elena Rossi',
		client: 'ERP Integration',
		activity: 'Development',
		comments: ['ETL pipeline', 'Data layer', 'Integration specs'],
	},
	{
		person: 'Elena Rossi',
		client: 'Data Migration',
		activity: 'Development',
		comments: ['Schema analysis', 'Data quality checks', 'Cleanup scripts'],
	},
	{
		person: 'Elena Rossi',
		client: 'Website Redesign',
		activity: 'Analysis',
		comments: ['Technical assessment', 'API review'],
	},
	{
		person: 'James Chen',
		client: 'Website Redesign',
		activity: 'Development',
		comments: ['Component library', 'Page templates', 'Responsive layout'],
	},
	{ person: 'James Chen', client: 'Mobile App', activity: 'Development', comments: ['Navigation', 'Core screens'] },
	{
		person: 'James Chen',
		client: 'Dashboard',
		activity: 'Development',
		comments: ['Chart components', 'Filter panel'],
	},
	{
		person: 'Priya Sharma',
		client: 'Website Redesign',
		activity: 'Development',
		comments: ['Code review', 'Documentation'],
	},
	{
		person: 'Priya Sharma',
		client: 'Website Redesign',
		activity: 'Analysis',
		comments: ['Requirements gathering', 'Spec review'],
	},
	{
		person: 'Sarah Jensen',
		client: 'Website Redesign',
		activity: 'Development',
		comments: ['REST endpoints', 'Auth middleware'],
	},
	{
		person: 'Sarah Jensen',
		client: 'Dashboard',
		activity: 'Development',
		comments: ['Aggregation queries', 'API routes'],
	},
	{
		person: 'Sarah Jensen',
		client: 'ERP Integration',
		activity: 'Analysis',
		comments: ['OpenAPI spec', 'Schema design'],
	},
	{
		person: "Liam O'Brien",
		client: 'Website Redesign',
		activity: 'Design',
		comments: ['Design review', 'Brand guidelines', 'Creative direction'],
	},
	{
		person: "Liam O'Brien",
		client: 'E-commerce Platform',
		activity: 'Design',
		comments: ['Design system exploration', 'Accessibility audit'],
	},
	{
		person: 'Ana Pereira',
		client: 'Website Redesign',
		activity: 'Design',
		comments: ['Wireframes', 'Visual design', 'Prototype'],
	},
	{
		person: 'Ana Pereira',
		client: 'E-commerce Platform',
		activity: 'Design',
		comments: ['Moodboards', 'Competitor analysis'],
	},
	{ person: 'Ana Pereira', client: 'Mobile App', activity: 'Design', comments: ['Mobile flows', 'App wireframes'] },
	{ person: 'Yuki Tanaka', client: 'Dashboard', activity: 'Design', comments: ['Dashboard layouts', 'Data viz'] },
	{
		person: 'Yuki Tanaka',
		client: 'E-commerce Platform',
		activity: 'Design',
		comments: ['UX research', 'User flows'],
	},
	{ person: 'Yuki Tanaka', client: 'Website Redesign', activity: 'Design', comments: ['Design system', 'Icon set'] },
	{ person: 'Marie Lefevre', client: 'Dashboard', activity: 'Design', comments: ['Illustrations', 'Branding'] },
	{
		person: 'Marie Lefevre',
		client: 'Website Redesign',
		activity: 'Design',
		comments: ['Style guide', 'Color palette'],
	},
	{
		person: 'Thomas Muller',
		client: 'Acme Corp',
		activity: 'Meeting',
		comments: ['Proposals', 'Pitch decks', 'Client calls'],
	},
	{
		person: 'Thomas Muller',
		client: 'Northstar Financial',
		activity: 'Meeting',
		comments: ['Prospecting', 'Follow-ups', 'Pipeline review'],
	},
	{
		person: 'Clara Fontaine',
		client: 'Greenleaf Industries',
		activity: 'Meeting',
		comments: ['RFP responses', 'Pricing'],
	},
	{
		person: 'Clara Fontaine',
		client: 'Silverline Retail',
		activity: 'Meeting',
		comments: ['Account management', 'Renewal prep'],
	},
	{
		person: 'Nils Eriksson',
		client: 'Silverline Retail',
		activity: 'Meeting',
		comments: ['Cold outreach', 'Demo calls'],
	},
	{
		person: 'Nils Eriksson',
		client: 'Acme Corp',
		activity: 'Meeting',
		comments: ['Upsell strategy', 'Client meetings'],
	},
	{
		person: 'Carlos Ruiz',
		client: 'Northstar Financial',
		activity: 'Meeting',
		comments: ['Account research', 'Proposals'],
	},
	{
		person: 'Carlos Ruiz',
		client: 'Greenleaf Industries',
		activity: 'Meeting',
		comments: ['Pipeline management', 'Lead qualification'],
	},
	{
		person: 'David Kim',
		client: 'Mobile App',
		activity: 'Design',
		comments: ['App screens', 'Icon set', 'Prototype'],
	},
	{
		person: 'David Kim',
		client: 'E-commerce Platform',
		activity: 'Design',
		comments: ['Storefront mockups', 'Component design'],
	},
	{ person: 'Fatima Al-Hassan', client: 'Dashboard', activity: 'Design', comments: ['Layout design', 'Data viz'] },
	{
		person: 'Fatima Al-Hassan',
		client: 'Website Redesign',
		activity: 'Design',
		comments: ['Visual polish', 'Style guide'],
	},
	{
		person: 'Emma Costa',
		client: 'Greenleaf Industries',
		activity: 'Meeting',
		comments: ['Account management', 'Renewals'],
	},
	{ person: 'Emma Costa', client: 'Northstar Financial', activity: 'Meeting', comments: ['Demo calls', 'Proposals'] },
	{
		person: 'Lucas Bernard',
		client: 'Silverline Retail',
		activity: 'Meeting',
		comments: ['Pipeline review', 'Lead qualification'],
	},
	{ person: 'Lucas Bernard', client: 'Acme Corp', activity: 'Meeting', comments: ['Upsell', 'Client meetings'] },
]

// ────────────────────────────────────────────────────────────
// 4.5 Wipe existing data
// ────────────────────────────────────────────────────────────

async function wipe() {
	console.log('\n=== WIPE ===')

	// Identify current user: under API-key auth, getMe/getConnectedPerson are stripped,
	// so find the person whose role is Admin (should be unique before seeding).
	const admins = await gql('{ getPersons { id name role { id name } } }')
	const adminPerson = (admins?.getPersons || []).find((p) => p.role?.name === 'Admin')
	if (!adminPerson) throw new Error('Could not identify admin person (no role=Admin found)')
	const myId = adminPerson.id
	console.log(`Current user (admin): ${adminPerson.name} (${myId}) — will be preserved, renamed to ${ADMIN_NAME}`)
	// Rename the admin/owner to the demo identity (overrides the operator's real name in the UI).
	await gql(`mutation($id: BeeboleId!, $name: BeeboleName!) { editPersonName(id: $id, name: $name) { id } }`, {
		id: myId,
		name: ADMIN_NAME,
	})
	const myName = ADMIN_NAME

	// 1. Time records — getTimeRecords without filter returns empty; must filter by personId
	const allPersonsForTr = await gql('{ getPersons { id } }')
	const allPersonIds = (allPersonsForTr?.getPersons || []).map((p) => p.id)
	const trIds = []
	for (const pid of allPersonIds) {
		const trData = await gql(`query($f: [BeeboleTimeRecordFilter]) { getTimeRecords(filter: $f) { id } }`, {
			f: [{ personId: pid }],
		})
		for (const r of trData?.getTimeRecords || []) trIds.push(r.id)
	}
	for (let i = 0; i < trIds.length; i += 100) {
		const batch = trIds.slice(i, i + 100)
		await gql(`mutation($ids: [BeeboleId!]!) { deleteTimeRecords(ids: $ids) { id } }`, { ids: batch })
	}
	console.log(`Deleted ${trIds.length} time records`)

	// 2. Expense records — similarly filter per person
	const erIds = []
	for (const pid of allPersonIds) {
		const erData = await gql(`query($f: [BeeboleExpenseRecordFilter]) { getExpenseRecords(filter: $f) { id } }`, {
			f: [{ personId: pid }],
		})
		for (const r of erData?.getExpenseRecords || []) erIds.push(r.id)
	}
	for (const id of erIds) {
		await gql(`mutation($id: BeeboleId!) { deleteExpenseRecord(id: $id) { id } }`, { id })
	}
	console.log(`Deleted ${erIds.length} expense records`)

	// 3. Custom field values
	const cfvData = await gql('{ getCustomFieldValues { id } }')
	const cfvIds = (cfvData?.getCustomFieldValues || []).map((v) => v.id)
	for (const id of cfvIds) {
		await gql(`mutation($id: BeeboleId!) { deleteCustomFieldValue(id: $id) { id } }`, { id })
	}
	console.log(`Deleted ${cfvIds.length} custom field values`)

	// 4. Custom fields
	const cfData = await gql('{ getCustomFields { id name } }')
	const cfs = cfData?.getCustomFields || []
	for (const cf of cfs) {
		await gql(`mutation($id: BeeboleId!) { deleteCustomField(id: $id) { id } }`, { id: cf.id })
	}
	console.log(`Deleted ${cfs.length} custom fields`)

	// 5. Project budgets
	const budgetsData = await gql('{ getProjects { id budgets { id } } }')
	let budgetCount = 0
	for (const p of budgetsData?.getProjects || []) {
		for (const b of p.budgets || []) {
			await gql(
				`mutation($projectId: BeeboleId!, $budgetId: BeeboleId!) {
					deleteProjectBudget(projectId: $projectId, budgetId: $budgetId) { id }
				}`,
				{ projectId: p.id, budgetId: b.id }
			)
			budgetCount++
		}
	}
	console.log(`Deleted ${budgetCount} project budgets`)

	// 6. Project billings — billings is AttributeProjectBillings with `value: [BeeboleRate]`
	// A sub-project lists its parent's rates too (RateNotFoundInEntity on delete): only delete
	// rates defined on the project itself, i.e. where the inheritance path ends at the project.
	const billData = await gql('{ getProjects { id billings { path { id } value { id } } } }')
	let billCount = 0
	for (const p of billData?.getProjects || []) {
		if (p.billings?.path?.at(-1)?.id !== p.id) continue
		for (const r of p.billings?.value || []) {
			await gql(
				`mutation($projectId: BeeboleId!, $billingId: BeeboleId!) {
					deleteProjectBilling(projectId: $projectId, billingId: $billingId) { id }
				}`,
				{ projectId: p.id, billingId: r.id }
			)
			billCount++
		}
	}
	console.log(`Deleted ${billCount} project billings`)

	// 7. Person costs — costs is AttributePersonCosts with `value: [BeeboleRate]`
	const costData = await gql('{ getPersons { id costs { value { id } } } }')
	let costCount = 0
	for (const p of costData?.getPersons || []) {
		for (const r of p.costs?.value || []) {
			await gql(
				`mutation($personId: BeeboleId!, $costId: BeeboleId!) {
					deletePersonCost(personId: $personId, costId: $costId) { id }
				}`,
				{ personId: p.id, costId: r.id }
			)
			costCount++
		}
	}
	console.log(`Deleted ${costCount} person costs`)

	// 8. Tasks (leaves first)
	const taskData = await gql('{ getTasks { id level } }')
	const tasks = (taskData?.getTasks || []).slice().sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
	for (const t of tasks) {
		await gql(`mutation($id: BeeboleId!) { deleteTask(id: $id) { id } }`, { id: t.id })
	}
	console.log(`Deleted ${tasks.length} tasks`)

	// 9. Projects (leaves first)
	const projData = await gql('{ getProjects { id level } }')
	const projects = (projData?.getProjects || []).slice().sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
	for (const p of projects) {
		await gql(`mutation($id: BeeboleId!) { deleteProject(id: $id) { id } }`, { id: p.id })
	}
	console.log(`Deleted ${projects.length} projects`)

	// 10. Tags — untag first, then delete leaves first
	const tagData = await gql('{ getTags { id level name } }')
	const allTags = (tagData?.getTags || []).slice().sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
	for (const t of allTags) {
		await gql(`mutation($tagId: BeeboleId!) { resetTaggedPersons(tagId: $tagId) { id } }`, { tagId: t.id })
		await gql(`mutation($tagId: BeeboleId!) { resetTaggedProjects(tagId: $tagId) { id } }`, { tagId: t.id })
		await gql(`mutation($tagId: BeeboleId!) { resetTaggedTasks(tagId: $tagId) { id } }`, { tagId: t.id })
	}
	for (const t of allTags) {
		await gql(`mutation($id: BeeboleId!) { deleteTag(id: $id) { id } }`, { id: t.id })
	}
	console.log(`Deleted ${allTags.length} tags`)

	// 11. Persons — reset management relations, then delete (except me)
	const personsData = await gql('{ getPersons { id name } }')
	const persons = personsData?.getPersons || []
	for (const p of persons) {
		await gql(`mutation($managerId: BeeboleId!) { resetManagedPersons(managerId: $managerId) { id } }`, {
			managerId: p.id,
		})
		await gql(`mutation($managerId: BeeboleId!) { resetManagedProjects(managerId: $managerId) { id } }`, {
			managerId: p.id,
		})
		await gql(`mutation($managerId: BeeboleId!) { resetManagedTags(managerId: $managerId) { id } }`, {
			managerId: p.id,
		})
		await gql(`mutation($managerId: BeeboleId!) { resetManagedTasks(managerId: $managerId) { id } }`, {
			managerId: p.id,
		})
	}
	let deletedPersons = 0
	for (const p of persons) {
		if (p.id === myId) continue
		const res = await gql(`mutation($id: BeeboleId!) { deletePerson(id: $id) { id } }`, { id: p.id })
		if (res) deletedPersons++
	}
	console.log(`Deleted ${deletedPersons} persons (kept current user)`)

	// 12. Tag categories — keep only the default "Department" (reused by createTags);
	// drop everything else, incl. the default "Location" dimension and any prior "Contract".
	const tcData = await gql('{ getTagCategories { id name } }')
	for (const tc of tcData?.getTagCategories || []) {
		if (tc.name !== 'Department') {
			await gql(`mutation($id: BeeboleId!) { deleteTagCategory(id: $id) { id } }`, { id: tc.id })
			console.log(`Deleted tag category: ${tc.name}`)
		}
	}

	// 13. Reports & report folders
	const reportData = await gql('{ getReports { id } }')
	for (const r of reportData?.getReports || []) {
		await gql(`mutation($id: BeeboleId!) { deleteReport(id: $id) { id } }`, { id: r.id })
	}
	const folderData = await gql('{ getReportFolders { id } }')
	for (const f of folderData?.getReportFolders || []) {
		await gql(`mutation($id: BeeboleId!) { deleteReportFolder(id: $id) { id } }`, { id: f.id })
	}
	console.log(
		`Deleted ${(reportData?.getReports || []).length} reports, ${(folderData?.getReportFolders || []).length} folders`
	)

	// 14. Expense types (expense records already deleted in step 2)
	const etData = await gql('{ getExpenseTypes { id } }')
	for (const e of etData?.getExpenseTypes || []) {
		await gql(`mutation($id: BeeboleId!) { deleteExpenseType(id: $id) { id } }`, { id: e.id })
	}
	console.log(`Deleted ${(etData?.getExpenseTypes || []).length} expense types`)

	// 15. Absence types (absence records are time records, already deleted in step 1)
	const atData = await gql('{ getAbsenceTypes { id } }')
	for (const a of atData?.getAbsenceTypes || []) {
		await gql(`mutation($id: BeeboleId!) { deleteAbsenceType(id: $id) { id } }`, { id: a.id })
	}
	console.log(`Deleted ${(atData?.getAbsenceTypes || []).length} absence types`)

	// 16. Schedule types — drop org assignment first, then delete (persons already gone)
	await gql(`mutation { resetOrganisationScheduleTimelineRelations { id } }`)
	const stData = await gql('{ getScheduleTypes { id } }')
	for (const s of stData?.getScheduleTypes || []) {
		await gql(`mutation($id: BeeboleId!) { deleteScheduleType(id: $id) { id } }`, { id: s.id })
	}
	console.log(`Deleted ${(stData?.getScheduleTypes || []).length} schedule types`)

	// 17. Clear org approval workflow (re-set during seed)
	await gql(`mutation { editOrganisationApprovalStages(stages: []) { id } }`)

	return { myId, myName }
}

// ────────────────────────────────────────────────────────────
// 4.6 Resolve defaults
// ────────────────────────────────────────────────────────────

async function resolveDefaults() {
	console.log('\n=== DEFAULTS ===')
	const rolesData = await gql('{ getRoles { id name } }')
	const roles = Object.fromEntries(rolesData.getRoles.map((r) => [r.name, r.id]))

	// Default role names drifted: newer orgs ship "People manager"/"Project manager"
	// instead of a plain "Manager". Alias so seed data using role:'Manager' resolves.
	if (!roles['Manager']) roles['Manager'] = roles['People manager'] ?? roles['Project manager']

	const projCatsData = await gql('{ getProjectCategories { id name } }')
	const projCatsRaw = Object.fromEntries(projCatsData.getProjectCategories.map((c) => [c.name, c.id]))
	// Normalise to the singular keys used by the script; backend uses plural (Clients/Activities)
	const projCats = {
		Customer: projCatsRaw['Customer'] ?? projCatsRaw['Clients'] ?? projCatsRaw['Client'],
		Internal: projCatsRaw['Internal'] ?? projCatsRaw['Corporate'],
		Activity: projCatsRaw['Activity'] ?? projCatsRaw['Activities'],
		_raw: projCatsRaw,
	}

	const tagCatsData = await gql('{ getTagCategories { id name } }')
	const tagCats = Object.fromEntries(tagCatsData.getTagCategories.map((c) => [c.name, c.id]))

	const taskCatsData = await gql('{ getTaskCategories { id name statuses { id name } } }')
	const taskCat =
		taskCatsData.getTaskCategories.find((c) => c.name === 'Main planning') ??
		taskCatsData.getTaskCategories.find((c) => c.name === 'Main plan') ??
		taskCatsData.getTaskCategories[0]
	const statuses = Object.fromEntries((taskCat?.statuses || []).map((s) => [s.name, s.id]))

	console.log(`Roles: ${Object.keys(roles).join(', ')}`)
	console.log(`Project categories: ${Object.keys(projCats).join(', ')}`)
	console.log(`Tag categories: ${Object.keys(tagCats).join(', ')}`)
	console.log(`Task category 'Main planning' statuses: ${Object.keys(statuses).join(', ')}`)

	return { roles, projCats, tagCats, taskCat, statuses }
}

// ────────────────────────────────────────────────────────────
// 4.7 Entity creation
// ────────────────────────────────────────────────────────────

async function createTagCategories(tagCats) {
	if (!tagCats['Contract']) {
		const res = await gql(`mutation($name: BeeboleName!) { addTagCategory(name: $name) { id } }`, {
			name: 'Contract',
		})
		tagCats['Contract'] = res.addTagCategory.id
		console.log(`Created tag category: Contract`)
	}
	return tagCats
}

async function createTags(tagCats) {
	const tagMap = {}
	let color = 0
	for (const name of DEPARTMENTS) {
		const res = await gql(
			`mutation($name: BeeboleName!, $categoryId: BeeboleId!, $color: BeeboleColor) {
				addTag(name: $name, categoryId: $categoryId, color: $color) { id }
			}`,
			{ name, categoryId: tagCats['Department'], color: color++ % 24 }
		)
		tagMap[name] = res.addTag.id
	}
	for (const name of CONTRACTS) {
		const res = await gql(
			`mutation($name: BeeboleName!, $categoryId: BeeboleId!, $color: BeeboleColor) {
				addTag(name: $name, categoryId: $categoryId, color: $color) { id }
			}`,
			{ name, categoryId: tagCats['Contract'], color: color++ % 24 }
		)
		tagMap[name] = res.addTag.id
	}
	console.log(`Created ${Object.keys(tagMap).length} tags`)
	return tagMap
}

async function createPersons(roles, tagMap, myId, myName) {
	const personMap = {}
	const personStart = {}
	let color = 0
	for (const p of PEOPLE) {
		const roleId = roles[p.role]
		const res = await gql(
			`mutation($name: BeeboleName!, $email: BeeboleEmail!, $roleId: BeeboleId!, $color: BeeboleColor) {
				addPerson(name: $name, email: $email, roleId: $roleId, color: $color) { id }
			}`,
			{ name: p.name, email: p.email, roleId, color: color++ % 24 }
		)
		if (!res) throw new Error(`Failed to create person ${p.name}`)
		personMap[p.name] = res.addPerson.id
		const startTs = resolveDate(p.entry)
		await gql(
			`mutation($id: BeeboleId!, $startDate: BeeboleTimestamp!) { editPersonStartDate(id: $id, startDate: $startDate) { id } }`,
			{ id: res.addPerson.id, startDate: startTs }
		)
		// Valid period for time entry: open-ended end, start clamped to the date of entry.
		await gql(
			`mutation($id: BeeboleId!, $startTime: BeeboleTimestamp) {
				editPersonValidityPeriod(id: $id, startTime: $startTime, endTime: null) { id }
			}`,
			{ id: res.addPerson.id, startTime: startTs }
		)
		personStart[personMap[p.name]] = startTs

		// Tag each person by department and contract
		for (const tagName of [p.department, p.contract]) {
			await gql(
				`mutation($tagId: BeeboleId!, $personId: BeeboleId!) {
					tagPerson(tagId: $tagId, personId: $personId) { id }
				}`,
				{ tagId: tagMap[tagName], personId: res.addPerson.id }
			)
		}
	}
	personMap[myName] = myId
	console.log(`Created ${PEOPLE.length} persons + admin (${myName})`)

	// Admin gets the same treatment — Engineering Manager
	await gql(
		`mutation($tagId: BeeboleId!, $personId: BeeboleId!) {
			tagPerson(tagId: $tagId, personId: $personId) { id }
		}`,
		{ tagId: tagMap['Engineering'], personId: myId }
	)
	await gql(
		`mutation($tagId: BeeboleId!, $personId: BeeboleId!) {
			tagPerson(tagId: $tagId, personId: $personId) { id }
		}`,
		{ tagId: tagMap['Internal'], personId: myId }
	)
	personStart[myId] = resolveDate('-12m')

	return { personMap, personStart }
}

async function assignManagers(personMap) {
	// Group people by department
	const byDept = {}
	for (const p of PEOPLE) {
		byDept[p.department] ??= []
		byDept[p.department].push(p)
	}
	let count = 0
	for (const [dept, members] of Object.entries(byDept)) {
		const manager = members.find((p) => p.role === 'Manager')
		if (!manager) continue
		const managerId = personMap[manager.name]
		for (const p of members) {
			if (p.name === manager.name) continue
			await gql(
				`mutation($managerId: BeeboleId!, $personId: BeeboleId!) {
					makeManagerOfPerson(managerId: $managerId, personId: $personId) { id }
				}`,
				{ managerId, personId: personMap[p.name] }
			)
			count++
		}
	}
	console.log(`Created ${count} manager relations`)
}

// All cost rates are hourly (cents/hour). Start at the first of the entry month.
async function addHourlyCost(personId, hourly, startTime) {
	const res = await gql(
		`mutation($personId: BeeboleId!, $startTime: BeeboleTimestamp!, $amount: BeeboleInputAmount!, $method: BeeboleRateMethod!) {
			addPersonCost(personId: $personId, startTime: $startTime, amount: $amount, method: $method) { id }
		}`,
		{
			personId,
			startTime,
			amount: { value: hourly * 100, currency: 'USD' },
			method: 'hourly',
		}
	)
	return !!res?.addPersonCost?.id
}

async function createPersonCosts(personMap) {
	let count = 0
	for (const p of PEOPLE) {
		const entryTs = firstOfMonth(resolveDate(p.entry))
		if (await addHourlyCost(personMap[p.name], p.cost.hourly, entryTs)) count++
	}
	// Admin cost: Engineering Manager hourly rate
	if (await addHourlyCost(personMap.__me, 50, firstOfMonth(resolveDate('-2y')))) count++
	console.log(`Created ${count} person costs`)
}

async function renameCorporate(projCats) {
	// Rename Corporate → Internal if that's the current name; otherwise no-op
	if (projCats._raw['Corporate']) {
		await gql(
			`mutation($id: BeeboleId!, $name: BeeboleName!) {
				editProjectCategoryName(id: $id, name: $name) { id }
			}`,
			{ id: projCats._raw['Corporate'], name: 'Internal' }
		)
		console.log(`Renamed project category Corporate → Internal`)
	}
	return projCats
}

async function createProjects(projCats) {
	const projectMap = {}
	// Pass 1 — top-level client projects
	for (const p of CLIENT_PROJECTS) {
		if (p.parent) continue
		const res = await gql(
			`mutation($name: BeeboleName!, $categoryId: BeeboleId!, $color: BeeboleColor) {
				addProject(name: $name, categoryId: $categoryId, color: $color) { id }
			}`,
			{ name: p.name, categoryId: projCats['Customer'], color: p.color }
		)
		projectMap[p.name] = res.addProject.id
	}
	// Pass 2 — child client projects
	for (const p of CLIENT_PROJECTS) {
		if (!p.parent) continue
		const parentId = projectMap[p.parent]
		const res = await gql(
			`mutation($name: BeeboleName!, $categoryId: BeeboleId!, $parentId: BeeboleId, $color: BeeboleColor) {
				addProject(name: $name, categoryId: $categoryId, parentId: $parentId, color: $color) { id }
			}`,
			{ name: p.name, categoryId: projCats['Customer'], parentId, color: p.color }
		)
		projectMap[p.name] = res.addProject.id
	}
	// Internal
	for (const p of INTERNAL_PROJECTS) {
		const res = await gql(
			`mutation($name: BeeboleName!, $categoryId: BeeboleId!, $color: BeeboleColor) {
				addProject(name: $name, categoryId: $categoryId, color: $color) { id }
			}`,
			{ name: p.name, categoryId: projCats['Internal'], color: p.color }
		)
		projectMap[p.name] = res.addProject.id
	}
	// Activity
	for (const p of ACTIVITY_PROJECTS) {
		const res = await gql(
			`mutation($name: BeeboleName!, $categoryId: BeeboleId!, $color: BeeboleColor) {
				addProject(name: $name, categoryId: $categoryId, color: $color) { id }
			}`,
			{ name: p.name, categoryId: projCats['Activity'], color: p.color }
		)
		projectMap[p.name] = res.addProject.id
	}
	console.log(`Created ${Object.keys(projectMap).length} projects`)
	return projectMap
}

async function createProjectBillings(projectMap) {
	const startTime = resolveDate('-3m')
	let count = 0
	for (const p of CLIENT_PROJECTS) {
		if (!p.billingHourly) continue
		const res = await gql(
			`mutation($projectId: BeeboleId!, $startTime: BeeboleTimestamp!, $amount: BeeboleInputAmount!, $method: BeeboleRateMethod!) {
				addProjectBilling(projectId: $projectId, startTime: $startTime, amount: $amount, method: $method) { id }
			}`,
			{
				projectId: projectMap[p.name],
				startTime,
				amount: { value: p.billingHourly * 100, currency: 'USD' },
				method: 'hourly',
			}
		)
		if (res) count++
	}
	console.log(`Created ${count} project billings`)
}

async function createProjectBudgets(projectMap) {
	let count = 0
	for (const p of CLIENT_PROJECTS) {
		if (!p.budget) continue
		const res = await gql(
			`mutation($projectId: BeeboleId!, $billingAmount: BeeboleInputAmount!, $costAmount: BeeboleInputAmount!, $quantity: Int!) {
				addProjectBudget(projectId: $projectId, billingAmount: $billingAmount, costAmount: $costAmount, quantity: $quantity) { id }
			}`,
			{
				projectId: projectMap[p.name],
				billingAmount: { value: p.budget.billing * 100, currency: 'USD' },
				costAmount: { value: p.budget.cost * 100, currency: 'USD' },
				quantity: p.budget.hours,
			}
		)
		if (res) count++
	}
	console.log(`Created ${count} project budgets`)
}

// Fit each budget to its ACTUAL logged total so the report shows realistic utilisation.
// Static budgets can't track a year of (unevenly distributed) random actuals — so this runs
// AFTER time + expense generation and sizes each budget to actual / target-utilisation.
// Each metric (billing/cost/time) has its OWN target so the three bars read at different
// percentages within a project (a uniform % across all three looks synthetic), while the
// project's overall state still holds: Dashboard over budget (all >100%, red),
// E-commerce Platform at-risk (~80–90%, amber), the rest healthy (~50–75%). Projects with
// little/no actual time (Fleet Tracker, Video Production, Web Portal) keep their nominal budget.
const BUDGET_TARGETS = {
	Dashboard: { billing: 1.08, cost: 1.16, time: 1.03 },
	'E-commerce Platform': { billing: 0.85, cost: 0.91, time: 0.8 },
	'Website Redesign': { billing: 0.63, cost: 0.69, time: 0.58 },
	'Mobile App': { billing: 0.57, cost: 0.52, time: 0.61 },
	'ERP Integration': { billing: 0.66, cost: 0.73, time: 0.62 },
	'Data Migration': { billing: 0.74, cost: 0.66, time: 0.78 },
}

async function fitBudgetsToActuals(projectMap) {
	const idToName = Object.fromEntries(Object.entries(projectMap).map(([n, id]) => [id, n]))
	const data = await gql(
		`{ getProjectBudgetData { budgets { budgetId projectId } actuals { projectId hours billing cost } } }`
	)
	const actuals = new Map((data?.getProjectBudgetData?.actuals || []).map((a) => [a.projectId, a]))
	let tuned = 0
	for (const b of data?.getProjectBudgetData?.budgets || []) {
		const t = BUDGET_TARGETS[idToName[b.projectId]]
		const act = actuals.get(b.projectId)
		// Only resize projects with meaningful actuals; leave the rest at their nominal budget.
		if (!t || !act || act.hours < 100) continue
		// Round to clean figures so budgets read as set, not computed: money to the nearest
		// $5,000 (500,000 cents), hours to the nearest 50. Rounding shifts each % by ≤2pts,
		// so the alert states (over / at-risk / healthy) are preserved.
		const roundTo = (v, step) => Math.max(step, Math.round(v / step) * step)
		await gql(
			`mutation($id: BeeboleId!, $amount: BeeboleInputAmount!) { editBudgetBillingAmount(id: $id, amount: $amount) { id } }`,
			{ id: b.budgetId, amount: { value: roundTo(act.billing / t.billing, 500000), currency: 'USD' } }
		)
		await gql(
			`mutation($id: BeeboleId!, $amount: BeeboleInputAmount!) { editBudgetCostAmount(id: $id, amount: $amount) { id } }`,
			{ id: b.budgetId, amount: { value: roundTo(act.cost / t.cost, 500000), currency: 'USD' } }
		)
		await gql(
			`mutation($id: BeeboleId!, $quantity: Int!) { editBudgetQuantity(id: $id, quantity: $quantity) { id } }`,
			{
				id: b.budgetId,
				quantity: roundTo(act.hours / t.time, 50),
			}
		)
		tuned++
	}
	console.log(`Fitted ${tuned} budgets to actuals (1 over, 1 at-risk, rest healthy)`)
}

async function createTasks(taskCat, statuses, projectMap, personMap) {
	if (!taskCat) throw new Error("Task category 'Main planning' not found")
	const taskMap = {}
	// First pass — create all tasks
	for (const t of TASKS) {
		const res = await gql(
			`mutation($name: BeeboleName!, $categoryId: BeeboleId!) {
				addTask(name: $name, categoryId: $categoryId) { id }
			}`,
			{ name: t.name, categoryId: taskCat.id }
		)
		taskMap[t.name] = res.addTask.id
	}
	// Second pass — configure each task
	for (const t of TASKS) {
		const taskId = taskMap[t.name]
		// Assign to project
		await gql(
			`mutation($taskId: BeeboleId!, $projectId: BeeboleId!) {
				assignTaskToProject(taskId: $taskId, projectId: $projectId) { id }
			}`,
			{ taskId, projectId: projectMap[t.project] }
		)
		// Owner
		await gql(
			`mutation($taskId: BeeboleId!, $personId: BeeboleId!) {
				assignOwnerOfTask(taskId: $taskId, personId: $personId) { id }
			}`,
			{ taskId, personId: personMap[t.owner] }
		)
		// Assignees
		for (const a of t.assignees || []) {
			await gql(
				`mutation($taskId: BeeboleId!, $personId: BeeboleId!) {
					assignTaskToPerson(taskId: $taskId, personId: $personId) { id }
				}`,
				{ taskId, personId: personMap[a] }
			)
		}
		// Period
		if (t.start && t.end) {
			await gql(
				`mutation($id: BeeboleId!, $startTime: BeeboleTimestamp!, $endTime: BeeboleTimestamp!, $effort: Float) {
					editTaskPeriod(id: $id, startTime: $startTime, endTime: $endTime, effort: $effort) { id }
				}`,
				{
					id: taskId,
					startTime: resolveDate(t.start),
					endTime: resolveDate(t.end),
					effort: t.effort ?? null,
				}
			)
		}
		// Status (only non-default)
		if (t.status && statuses[t.status]) {
			await gql(
				`mutation($id: BeeboleId!, $statusId: BeeboleId!) {
					editTaskStatus(id: $id, statusId: $statusId) { id }
				}`,
				{ id: taskId, statusId: statuses[t.status] }
			)
		}
	}
	// Third pass — dependencies (successors)
	for (const t of TASKS) {
		if (!t.followedBy?.length) continue
		const deps = t.followedBy.map((n) => taskMap[n]).filter(Boolean)
		if (!deps.length) continue
		await gql(
			`mutation($id: BeeboleId!, $dependencyIds: [BeeboleId!]!) {
				editTaskDependencies(id: $id, dependencyIds: $dependencyIds) { id }
			}`,
			{ id: taskMap[t.name], dependencyIds: deps }
		)
	}
	console.log(`Created ${Object.keys(taskMap).length} tasks`)
	return taskMap
}

// On creation a custom field is visible everywhere (projects/tasks/time records all
// default to enabled-for-all). These are HR fields, so scope them to Persons only:
// keep person visibility on, turn the other three scopes off.
async function restrictCustomFieldToPersons(id) {
	const toggle = (field, enabled) =>
		gql(
			`mutation($id: BeeboleId!, $enabled: Boolean!) { editCustomFieldVisibility${field}(id: $id, enabled: $enabled) { id } }`,
			{
				id,
				enabled,
			}
		)
	await toggle('Persons', true)
	await toggle('Projects', false)
	await toggle('Tasks', false)
	await toggle('TimeRecords', false)
}

async function createCustomFields(personMap) {
	const doeRes = await gql(
		`mutation($name: BeeboleName!, $fieldType: String!) {
			addCustomField(name: $name, fieldType: $fieldType) { id }
		}`,
		{ name: 'Date of Entry', fieldType: 'date' }
	)
	const doeId = doeRes.addCustomField.id
	await restrictCustomFieldToPersons(doeId)

	const payrollRes = await gql(
		`mutation($name: BeeboleName!, $fieldType: String!) {
			addCustomField(name: $name, fieldType: $fieldType) { id }
		}`,
		{ name: 'Payroll ID', fieldType: 'text' }
	)
	const payrollId = payrollRes.addCustomField.id
	await restrictCustomFieldToPersons(payrollId)

	let count = 0
	for (const p of PEOPLE) {
		const pid = personMap[p.name]
		const doeTs = resolveDate(p.entry)
		await gql(
			`mutation($customFieldId: BeeboleId!, $entityType: String!, $entityId: BeeboleId!, $dateValue: Float!) {
				addCustomFieldValue(customFieldId: $customFieldId, entityType: $entityType, entityId: $entityId, dateValue: $dateValue) { id }
			}`,
			{ customFieldId: doeId, entityType: 'Person', entityId: pid, dateValue: doeTs }
		)
		await gql(
			`mutation($customFieldId: BeeboleId!, $entityType: String!, $entityId: BeeboleId!, $textValue: String!) {
				addCustomFieldValue(customFieldId: $customFieldId, entityType: $entityType, entityId: $entityId, textValue: $textValue) { id }
			}`,
			{ customFieldId: payrollId, entityType: 'Person', entityId: pid, textValue: p.payrollId }
		)
		count += 2
	}
	console.log(`Created 2 custom fields + ${count} values`)
}

async function configureTimesheetSettings(projCats) {
	await gql(
		`mutation($listOfProjectCategories: [[BeeboleId!]!]!) {
			editOrganisationTimeSettingsListOfProjectCategories(listOfProjectCategories: $listOfProjectCategories) { id }
		}`,
		{
			listOfProjectCategories: [[projCats['Customer'], projCats['Activity']], [projCats['Internal']]],
		}
	)
	// No task categories in the timesheet: the demo logs against projects + activities,
	// not tasks, so the default "Main plan" category is left out.
	await gql(
		`mutation($taskCategories: [BeeboleId!]!) {
			editOrganisationTimeSettingsTaskCategories(taskCategories: $taskCategories) { id }
		}`,
		{ taskCategories: [] }
	)
	await gql(
		`mutation($allowTimeOffRecord: Boolean!) {
			editOrganisationTimeSettingsAllowTimeOffRecord(allowTimeOffRecord: $allowTimeOffRecord) { id }
		}`,
		{ allowTimeOffRecord: true }
	)

	// Period & submission, time-entry, reminders — matches the onboarding template (§1)
	const single = (field, argType, argName, value) =>
		gql(`mutation($v: ${argType}) { editOrganisationTimeSettings${field}(${argName}: $v) { id } }`, { v: value })
	await single('Periodicity', 'BeebolePeriodicity', 'periodicity', 'weekly')
	await single('TurnOffPeriodAfter', 'Int', 'turnOffPeriodAfter', 0)
	await single('AbsenceMaxOneDay', 'Boolean', 'absenceMaxOneDay', true)
	await single('RequireScheduledTimePeriod', 'Boolean', 'requireScheduledTimePeriod', true)
	await single('EnableTimer', 'Boolean', 'enableTimer', true)
	await single('MandatoryTimer', 'Boolean', 'mandatoryTimer', false)
	await single('EnableStartEndTime', 'Boolean', 'enableStartEndTime', true)
	await single('MandatoryStartEndTime', 'Boolean', 'mandatoryStartEndTime', false)
	await single('TimeEntryUnit', 'Int', 'timeEntryUnit', 1)
	await single('DurationFormat', 'Int', 'durationFormat', 2)
	await single('MinimumTimeEntry', 'Int', 'minimumTimeEntry', 900000)
	await single('ForceComment', 'Boolean', 'forceComment', false)
	await single('ApprovalReminder', 'Int', 'approvalReminder', 3)
	await single('EnableAutoTimesheet', 'Boolean', 'enableAutoTimesheet', false)
	await gql(
		`mutation($r: BeeboleTimesheetReminderInput) {
			editOrganisationTimeSettingsTimesheetReminder(timesheetReminder: $r) { id }
		}`,
		{ r: { timing: 'currentEnd', hour: 16 } }
	)
	console.log('Configured timesheet settings')
}

// ────────────────────────────────────────────────────────────
// 4.8 Time record generation
// ────────────────────────────────────────────────────────────

const BACKFILL_MONTHS = 12
const RICH_RECENT_WEEKS = 8
const POOL = 12

function splitHours(n, personName, dayMs) {
	// Always totals 8 hours.
	if (n === 1) return [8]
	if (n === 2) {
		const splits = [
			[5, 3],
			[4, 4],
			[6, 2],
		]
		return splits[hashString(personName + dayMs) % splits.length]
	}
	// n >= 3
	const splits = [
		[3, 3, 2],
		[4, 2, 2],
		[3, 2, 3],
	]
	return splits[hashString(personName + dayMs) % splits.length]
}

// Group date-free assignments into per-person profiles: { [name]: [{client, activity, comments}] }
function buildProfiles(myName) {
	const byPerson = {}
	for (const a of TIME_ASSIGNMENTS) {
		;(byPerson[a.person] ??= []).push({ client: a.client, activity: a.activity, comments: a.comments })
	}
	// Admin/owner persona (Jordan Reed): mostly hands-on client work across a few accounts
	// (each with an activity), a little Sales/business-development, and the least on Training.
	// The three client entries are repeated so the random day-picker weights clients heavily —
	// a week trends to 3 client lines (≥2 clients) dominating the hours, with a little Sales
	// and ~1 light Training line.
	byPerson[myName] = [
		{ client: 'Website Redesign', activity: 'Meeting', comments: ['Tech lead review', 'Stakeholder sync'] },
		{ client: 'Website Redesign', activity: 'Meeting', comments: ['Client workshop', 'Leadership sync'] },
		{ client: 'Dashboard', activity: 'Analysis', comments: ['Metrics review', 'Reporting deep-dive'] },
		{ client: 'Dashboard', activity: 'Analysis', comments: ['Roadmap review', 'Data audit'] },
		{ client: 'Fleet Tracker', activity: 'Development', comments: ['Solution design', 'Integration spec'] },
		{ client: 'Fleet Tracker', activity: 'Development', comments: ['Rollout planning', 'Architecture review'] },
		{ client: 'Sales', activity: null, comments: ['Pipeline review', 'Proposals'] },
		{ client: 'Training', activity: null, comments: ['Team workshop', 'Onboarding'] },
	]
	return byPerson
}

// Sales and account-management time was logged on client roots, which the backend now rejects
// (timeRecordOnParentProject). Log it on each client's main engagement instead.
const ACCOUNT_WORK_PROJECT = {
	'Acme Corp': 'Website Redesign',
	'Greenleaf Industries': 'ERP Integration',
	'Northstar Financial': 'Dashboard',
	'Silverline Retail': 'E-commerce Platform',
	'Brightwave Media': 'Web Portal',
	'Quantum Logistics': 'Fleet Tracker',
	'Brand Campaign': 'Video Production',
}

// Fill working days in [startMs, endMs] for one person from their profile.
function fillDays(personId, person, profile, startMs, endMs, tier, projectMap, submit, isWorkingDay, isHoliday) {
	const tasks = []
	let count = 0
	for (let ts = startMs; ts <= endMs; ts += 86400000) {
		if (!isWorkingDay(ts) || isHoliday(ts)) continue
		// Records are anchored to UTC midnight (the frontend's dayStart). startTime === endTime === dayStart
		// means duration-only: the start/end fields stay empty even though the feature is enabled.
		const dayStart = Math.floor(ts / 86400000) * 86400000
		const maxEntries = tier === 'rich' ? 3 : 2
		const minEntries = tier === 'rich' ? 2 : 1
		const pick = minEntries + (hashString(person + ts) % (maxEntries - minEntries + 1))
		const chosen = []
		for (let i = 0; i < pick && profile.length; i++) {
			chosen.push(profile[hashString(person + ts + 'p' + i) % profile.length])
		}
		if (chosen.length === 0) continue
		const hours = splitHours(chosen.length, person, ts)
		for (let i = 0; i < chosen.length; i++) {
			const a = chosen[i]
			const clientId = projectMap[ACCOUNT_WORK_PROJECT[a.client] ?? a.client]
			if (!clientId) continue
			const projectIds = a.activity ? [clientId, projectMap[a.activity]] : [clientId]
			const durationMs = hours[i] * 3600000
			const comment =
				tier === 'rich' && a.comments?.length
					? a.comments[hashString(person + ts + i) % a.comments.length]
					: null
			const wfh = tier === 'rich' ? deterministicWfh(person, ts) : false
			tasks.push(
				submit(async () => {
					const res = await gql(
						`mutation($startTime: BeeboleTimestamp!, $endTime: BeeboleTimestamp!, $duration: Float!, $personId: BeeboleId!, $projectIds: [BeeboleId!]!) {
							addTimeRecord(startTime: $startTime, endTime: $endTime, duration: $duration, personId: $personId, projectIds: $projectIds) { id }
						}`,
						{ startTime: dayStart, endTime: dayStart, duration: durationMs, personId, projectIds }
					)
					if (!res) return
					const trId = res.addTimeRecord.id
					if (comment) {
						await gql(
							`mutation($id: BeeboleId!, $comment: String!) { editTimeRecordComment(id: $id, comment: $comment) { id } }`,
							{ id: trId, comment }
						)
					}
					if (wfh) {
						await gql(
							`mutation($id: BeeboleId!, $wfh: Boolean!) { editTimeRecordWfh(id: $id, wfh: $wfh) { id } }`,
							{ id: trId, wfh: true }
						)
					}
				})
			)
			count++
		}
	}
	return { tasks, count }
}

// Working-day predicate from the org's default (Full Time) schedule pattern.
// pattern[i] > 0 means cycle-day i is a working day; length = cycle length. Anchored at a Monday.
function makeIsWorkingDay(pattern = [1, 1, 1, 1, 1, 0, 0], cycleStart = mondayNoonUTC()) {
	const len = pattern.length
	return (ts) => {
		const dayIndex = Math.floor((ts - cycleStart) / 86400000)
		const idx = ((dayIndex % len) + len) % len
		return pattern[idx] > 0
	}
}

const TZ_COUNTRY = {
	'America/New_York': 'US',
	'Europe/Berlin': 'DE',
	'Europe/Brussels': 'BE',
	'Europe/Paris': 'FR',
	'Europe/Madrid': 'ES',
	'Europe/Rome': 'IT',
	'Europe/Amsterdam': 'NL',
	'Europe/London': 'GB',
}

// Present the demo as a New York–based US company (English screenshots): US timezone,
// USD, 12-hour clock, Sunday-first weeks, and US number/date formatting.
async function configureLocalisation() {
	const set = (field, argType, argName, value) =>
		gql(`mutation($v: ${argType}) { editOrganisationLocalisation${field}(${argName}: $v) { id } }`, { v: value })
	await set('TimeZone', 'BeeboleTimeZone', 'timeZone', 'America/New_York')
	await set('Currency', 'BeeboleCurrency', 'currency', 'USD')
	// 'MMM dd, yyyy' (e.g. Jun 08, 2026) — US-style and supported by the timesheet range
	// formatter. (The weekday variant 'eee, MMM dd yyyy' renders "Invalid format option" there.)
	await set('DateFormat', 'BeeboleDateFormat', 'dateFormat', 'MMM dd, yyyy')
	await set('TimeFormat', 'BeeboleTimeFormat', 'timeFormat', '12')
	await set('DecimalFormat', 'BeeboleDecimalFormat', 'decimalFormat', '.')
	await set('ThousandSeparator', 'BeeboleThousandSeparator', 'thousandSeparator', ',')
	await set('FirstDayOfWeek', 'BeeboleFirstDayOfWeek', 'firstDayOfWeek', 0)
	console.log('Configured localisation: New York (US · USD · 12h · Sunday-first)')
}

// Holiday country follows the org timezone (set in configureLocalisation).
async function deriveHolidayCode() {
	const org = await gql('{ currentOrganisation { localisation { timeZone { value } } } }')
	const tz = org?.currentOrganisation?.localisation?.timeZone?.value
	return { tz, code: TZ_COUNTRY[tz] || 'BE' }
}

async function configurePublicHolidays() {
	const { tz, code } = await deriveHolidayCode()
	await gql(`mutation($code: String) { editOrganisationPublicHolidays(code: $code) { id } }`, { code })
	console.log(`Public holidays set for ${code} (tz ${tz || 'unknown'})`)
	return code
}

// Returns a predicate over a UTC timestamp; true if that calendar day is a public holiday.
// Reads the country master calendar via getHolidays — the org's publicHolidays.holidays only
// holds per-entity overrides, so it would be empty and skip nothing.
async function makeIsHoliday() {
	const { code } = await deriveHolidayCode()
	const data = await gql(`query($code: String!) { getHolidays(code: $code, lang: "en") { date { ts } } }`, { code })
	const days = new Set()
	for (const h of data?.getHolidays || []) {
		const d = new Date(h.date.ts)
		days.add(`${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`)
	}
	return (ts) => {
		const d = new Date(ts)
		return days.has(`${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`)
	}
}

async function createTimeRecords(projectMap, personMap, myName, myId, personStart = {}) {
	const profiles = buildProfiles(myName)
	const submit = createPool(POOL)
	const isWorkingDay = makeIsWorkingDay()
	const isHoliday = await makeIsHoliday()
	const yesterday = resolveDate('yesterday')
	const richStart = resolveDate(`-${RICH_RECENT_WEEKS}w`)
	const windowStart = resolveDate(`-${BACKFILL_MONTHS}m`)
	const allTasks = []
	let total = 0
	for (const [name, profile] of Object.entries(profiles)) {
		const personId = name === myName ? myId : personMap[name]
		if (!personId) continue
		const start = Math.max(windowStart, personStart[personId] ?? windowStart)
		if (start < richStart) {
			const r = fillDays(
				personId,
				name,
				profile,
				start,
				richStart - 86400000,
				'light',
				projectMap,
				submit,
				isWorkingDay,
				isHoliday
			)
			allTasks.push(...r.tasks)
			total += r.count
		}
		const rs = Math.max(start, richStart)
		const r2 = fillDays(personId, name, profile, rs, yesterday, 'rich', projectMap, submit, isWorkingDay, isHoliday)
		allTasks.push(...r2.tasks)
		total += r2.count
	}
	let done = 0
	const tStart = Date.now()
	const tracked = allTasks.map((p) =>
		p.then((r) => {
			if (++done % 500 === 0) {
				const rate = done / ((Date.now() - tStart) / 1000)
				const eta = Math.round((total - done) / Math.max(rate, 1))
				console.log(`  …${done}/${total} time records (${rate.toFixed(0)}/s, ~${eta}s left)`)
			}
			return r
		})
	)
	await Promise.all(tracked)
	console.log(`Created ${total} time records (light+rich, ${BACKFILL_MONTHS}mo)`)
	return total
}

// ────────────────────────────────────────────────────────────
// 4.9 Settings: schedules, expense/absence types, approval, reports
// ────────────────────────────────────────────────────────────

// Most recent Monday at UTC noon — anchors schedule cycles to day 0 = Monday
function mondayNoonUTC() {
	const now = new Date()
	const dow = now.getUTCDay() // 0 Sun .. 6 Sat
	const toMonday = dow === 0 ? -6 : 1 - dow
	return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + toMonday, 12, 0, 0)
}

async function createScheduleTypes(personMap) {
	const monday = mondayNoonUTC()
	const scheduleMap = {}
	for (const s of SCHEDULE_TYPES) {
		const res = await gql(
			`mutation($name: BeeboleName!, $calendarStartTime: BeeboleTimestamp!, $color: BeeboleColor) {
				addScheduleType(name: $name, calendarStartTime: $calendarStartTime, color: $color) { id }
			}`,
			{ name: s.name, calendarStartTime: monday, color: s.color }
		)
		const id = res?.addScheduleType?.id
		if (!id) continue
		scheduleMap[s.name] = id
		if (s.length !== 7) {
			await gql(
				`mutation($id: BeeboleId!, $length: Int!) { editScheduleTypeLength(id: $id, length: $length) { id } }`,
				{
					id,
					length: s.length,
				}
			)
		}
		for (let d = 0; d < s.days.length; d++) {
			const day = s.days[d]
			await gql(
				`mutation($id: BeeboleId!, $dayNumber: Int!, $duration: Float!) {
					editScheduleTypeDayDuration(id: $id, dayNumber: $dayNumber, duration: $duration) { id }
				}`,
				{ id, dayNumber: d, duration: day.duration }
			)
			await gql(
				`mutation($id: BeeboleId!, $dayNumber: Int!, $timePairs: [[Int]]!) {
					editScheduleTypeDayTimePairs(id: $id, dayNumber: $dayNumber, timePairs: $timePairs) { id }
				}`,
				{ id, dayNumber: d, timePairs: day.timePairs }
			)
			if (day.wfh) {
				await gql(
					`mutation($id: BeeboleId!, $dayNumber: Int!, $wfh: Boolean!) {
						editScheduleTypeDayWfh(id: $id, dayNumber: $dayNumber, wfh: $wfh) { id }
					}`,
					{ id, dayNumber: d, wfh: true }
				)
			}
		}
	}
	// Full Time = organisation default; the org-level assignment cascades to every person,
	// so no per-person assignment is needed (it would just report AlreadyAssigned).
	const fullTimeId = scheduleMap['Full Time']
	if (fullTimeId) {
		await gql(
			// Renamed in reboot to the dated timeline; start before the backfill window so every
			// generated day (and absence) falls under it.
			`mutation($scheduleTypeId: BeeboleId!, $startTime: BeeboleTimestamp) { assignScheduleTimelineToOrganisation(scheduleTypeId: $scheduleTypeId, startTime: $startTime) { id } }`,
			{ scheduleTypeId: fullTimeId, startTime: resolveDate(`-${BACKFILL_MONTHS + 1}m`) }
		)
	}
	console.log(`Created ${Object.keys(scheduleMap).length} schedule types (Full Time = org default for all)`)
	return scheduleMap
}

async function createExpenseTypes() {
	const expenseMap = {}
	for (const e of EXPENSE_TYPES) {
		const res = await gql(
			`mutation($name: BeeboleName!, $color: BeeboleColor) { addExpenseType(name: $name, color: $color) { id } }`,
			{
				name: e.name,
				color: e.color,
			}
		)
		const id = res?.addExpenseType?.id
		if (!id) continue
		expenseMap[e.name] = id
		await gql(
			`mutation($id: BeeboleId!, $v: Boolean!) { editExpenseTypeIsCurrency(id: $id, isCurrency: $v) { id } }`,
			{ id, v: e.isCurrency }
		)
		await gql(`mutation($id: BeeboleId!, $v: Int!) { editExpenseTypeMarkup(id: $id, markup: $v) { id } }`, {
			id,
			v: e.markup,
		})
		await gql(
			`mutation($id: BeeboleId!, $v: Boolean!) { editExpenseTypeIsInBudget(id: $id, isInBudget: $v) { id } }`,
			{ id, v: e.isInBudget }
		)
	}
	// No per-person assignment: org-level availability makes every type visible to all.
	// Assigning per-person would create exclude (hide) overrides — the opposite of what we want.
	console.log(`Created ${Object.keys(expenseMap).length} expense types (available to all persons)`)
	return expenseMap
}

async function createAbsenceTypes() {
	const absenceMap = {}
	for (const a of ABSENCE_TYPES) {
		const res = await gql(
			`mutation($name: BeeboleName!, $color: BeeboleColor) { addAbsenceType(name: $name, color: $color) { id } }`,
			{
				name: a.name,
				color: a.color,
			}
		)
		const id = res?.addAbsenceType?.id
		if (!id) continue
		absenceMap[a.name] = id
		await gql(
			`mutation($id: BeeboleId!, $v: BeeboleAbsenceUnit!) { editAbsenceTypeUnit(id: $id, unit: $v) { id } }`,
			{ id, v: 'day' }
		)
		await gql(
			`mutation($id: BeeboleId!, $v: Boolean!) { editAbsenceTypeInvolveCosts(id: $id, involveCosts: $v) { id } }`,
			{ id, v: true }
		)
		await gql(
			`mutation($id: BeeboleId!, $v: Boolean!) { editAbsenceTypeAccrualEnabled(id: $id, isEnabled: $v) { id } }`,
			{ id, v: false }
		)
	}
	// No per-person assignment: org-level availability makes every type visible to all.
	// Assigning per-person would create exclude (hide) overrides — the opposite of what we want.
	console.log(`Created ${Object.keys(absenceMap).length} absence types (available to all persons)`)
	return absenceMap
}

async function generateAbsences(absenceMap, personMap, personStart) {
	const pto = absenceMap['PTO']
	const sickness = absenceMap['Sickness']
	const dayMs = 28800000
	const yesterday = resolveDate('yesterday')
	const windowStart = resolveDate(`-${BACKFILL_MONTHS}m`)
	const submit = createPool(POOL)
	const work = []
	let count = 0
	const addAbsence = (personId, absenceId, ts) =>
		work.push(
			submit(() =>
				gql(
					`mutation($startTime: BeeboleTimestamp!, $endTime: BeeboleTimestamp!, $duration: Float!, $personId: BeeboleId!, $absenceId: BeeboleId!) {
						addTimeRecord(startTime: $startTime, endTime: $endTime, duration: $duration, personId: $personId, absenceId: $absenceId) { id }
					}`,
					{ startTime: ts, endTime: ts + 86400000, duration: dayMs, personId, absenceId }
				)
			)
		)
	// Absences on a public holiday are rejected (timeRecordOnHoliday): skip weekends and holidays.
	const isHoliday = await makeIsHoliday()
	const nextWeekday = (ts) => {
		while ([0, 6].includes(new Date(ts).getUTCDay()) || isHoliday(ts)) ts += 86400000
		return ts
	}
	for (const p of PEOPLE) {
		const personId = personMap[p.name]
		if (!personId) continue
		const empStart = Math.max(windowStart, personStart?.[personId] ?? windowStart)
		const span = Math.max(1, Math.floor((yesterday - empStart) / 86400000))
		const used = new Set()
		// Place one absence day on a random weekday in the window, skipping days already used.
		const place = (absenceId, seed) => {
			if (!absenceId) return
			let ts = nextWeekday(empStart + (hashString(seed) % span) * 86400000)
			let guard = 0
			while (used.has(ts) && guard++ < 12) ts = nextWeekday(ts + 86400000)
			if (ts > yesterday || used.has(ts)) return
			used.add(ts)
			addAbsence(personId, absenceId, ts)
			count++
		}
		// Varied per-person counts (deterministic) so the report isn't uniform:
		// 3–12 scattered PTO days and 0–5 sickness days.
		const ptoDays = 3 + (hashString(p.name + 'pto') % 10)
		const sickDays = hashString(p.name + 'sick') % 6
		for (let i = 0; i < ptoDays; i++) place(pto, p.name + 'p' + i)
		for (let i = 0; i < sickDays; i++) place(sickness, p.name + 's' + i)

		// Summer vacation block (3–6 consecutive weekdays) — keeps a seasonal dip in the year chart.
		const augTs = augustBlockStart(empStart, yesterday, p.name)
		if (augTs && pto) {
			const blockLen = 3 + (hashString(p.name + 'aug') % 4)
			let ts = augTs
			for (let i = 0; i < blockLen; i++) {
				ts = nextWeekday(ts)
				if (ts > yesterday) break
				if (!used.has(ts)) {
					used.add(ts)
					addAbsence(personId, pto, ts)
					count++
				}
				ts += 86400000
			}
		}
	}
	await Promise.all(work)
	console.log(`Created ${count} absence records (varied per person + summer block)`)
}

// Pick a day in August within [empStart, end]; else null.
function augustBlockStart(empStart, end, name) {
	for (const ms of [empStart, end]) {
		const y = new Date(ms).getUTCFullYear()
		for (const year of [y - 1, y]) {
			const day = 8 + (hashString(name + year) % 14)
			const cand = Date.UTC(year, 7, day, 12, 0, 0)
			if (cand >= empStart && cand <= end) return cand
		}
	}
	return null
}

async function generateExpenses(expenseMap, personMap, projectMap) {
	// value: cents for currency types (Hotel/Taxi); raw quantity (km) for Mileage
	const samples = [
		{ person: 'Thomas Muller', type: 'Hotel', client: 'Acme Corp', value: 18500, comment: 'Client visit — hotel' },
		{ person: 'Thomas Muller', type: 'Taxi', client: 'Acme Corp', value: 4200, comment: 'Airport transfer' },
		{
			person: 'Thomas Muller',
			type: 'Mileage',
			client: 'Northstar Financial',
			value: 140,
			comment: 'Drive to client site',
		},
		{
			person: 'Clara Fontaine',
			type: 'Hotel',
			client: 'Greenleaf Industries',
			value: 16000,
			comment: 'On-site workshop',
		},
		{
			person: 'Clara Fontaine',
			type: 'Taxi',
			client: 'Silverline Retail',
			value: 3800,
			comment: 'Client meeting taxi',
		},
		{ person: 'Nils Eriksson', type: 'Mileage', client: 'Silverline Retail', value: 95, comment: 'Field visit' },
		{
			person: 'Carlos Ruiz',
			type: 'Hotel',
			client: 'Northstar Financial',
			value: 17500,
			comment: 'Conference stay',
		},
		{
			person: 'Carlos Ruiz',
			type: 'Taxi',
			client: 'Greenleaf Industries',
			value: 5100,
			comment: 'Station transfer',
		},
		{
			person: 'Emma Costa',
			type: 'Mileage',
			client: 'Quantum Logistics',
			value: 210,
			comment: 'Site survey drive',
		},
		{ person: 'Lucas Bernard', type: 'Hotel', client: 'Acme Corp', value: 14500, comment: 'Sprint review travel' },
		{ person: 'Sophie Laurent', type: 'Taxi', client: 'Acme Corp', value: 3600, comment: 'Client kickoff' },
		{
			person: "Liam O'Brien",
			type: 'Hotel',
			client: 'Brightwave Media',
			value: 15500,
			comment: 'Design review on-site',
		},
		{
			person: 'James Chen',
			type: 'Mileage',
			client: 'Northstar Financial',
			value: 60,
			comment: 'Office commute (client)',
		},
		{
			person: 'Marc Dubois',
			type: 'Taxi',
			client: 'Greenleaf Industries',
			value: 2900,
			comment: 'Late deploy taxi',
		},
		{
			person: 'Ana Pereira',
			type: 'Hotel',
			client: 'Silverline Retail',
			value: 13800,
			comment: 'UX research trip',
		},
		{ person: 'David Kim', type: 'Mileage', client: 'Brightwave Media', value: 80, comment: 'Studio visit' },
		{
			person: 'Carlos Ruiz',
			type: 'Mileage',
			client: 'Northstar Financial',
			value: 130,
			comment: 'Prospect visit',
		},
		{
			person: 'Clara Fontaine',
			type: 'Hotel',
			client: 'Quantum Logistics',
			value: 16900,
			comment: 'Renewal negotiation',
		},
	]
	// 10 expenses on the Dashboard project over the past 2 months, across 4 employees,
	// using only currency types (Hotel / Taxi / Meal). client: 'Dashboard' targets the subproject.
	const dashboardExpenses = [
		{ person: 'James Chen', type: 'Hotel', value: 18500, comment: 'Client workshop — hotel' },
		{ person: 'James Chen', type: 'Taxi', value: 3200, comment: 'Airport transfer' },
		{ person: 'James Chen', type: 'Meal', value: 4800, comment: 'Team dinner' },
		{ person: 'Sarah Jensen', type: 'Hotel', value: 17200, comment: 'On-site sprint stay' },
		{ person: 'Sarah Jensen', type: 'Meal', value: 2600, comment: 'Working lunch' },
		{ person: 'Yuki Tanaka', type: 'Taxi', value: 4100, comment: 'Client site taxi' },
		{ person: 'Yuki Tanaka', type: 'Meal', value: 3500, comment: 'Client lunch' },
		{ person: 'Marie Lefevre', type: 'Hotel', value: 15800, comment: 'Design review travel' },
		{ person: 'Marie Lefevre', type: 'Taxi', value: 2900, comment: 'Late evening taxi' },
		{ person: 'Marie Lefevre', type: 'Meal', value: 5200, comment: 'Dinner with client' },
	].map((e) => ({ ...e, client: 'Dashboard' }))

	const yesterday = resolveDate('yesterday')
	const windowStart = resolveDate(`-${BACKFILL_MONTHS}m`)
	const span = Math.max(1, Math.floor((yesterday - windowStart) / 86400000))
	const addExpense = async (s, date) => {
		const personId = personMap[s.person]
		const expenseTypeId = expenseMap[s.type]
		const projectId = s.client ? projectMap[s.client] : undefined
		if (!personId || !expenseTypeId) return false
		await gql(
			`mutation($date: BeeboleTimestamp!, $expenseTypeId: BeeboleId!, $value: Int!, $currency: BeeboleCurrency, $personId: BeeboleId, $projectId: BeeboleId, $comment: String) {
				addExpenseRecord(date: $date, expenseTypeId: $expenseTypeId, value: $value, currency: $currency, personId: $personId, projectId: $projectId, comment: $comment) { id }
			}`,
			{
				date,
				expenseTypeId,
				value: s.value,
				currency: s.type === 'Mileage' ? null : 'USD',
				personId,
				projectId,
				comment: s.comment,
			}
		)
		return true
	}
	let count = 0
	for (let i = 0; i < samples.length; i++) {
		const date = windowStart + (hashString(samples[i].person + samples[i].type + i) % span) * 86400000
		if (await addExpense(samples[i], date)) count++
	}
	// Dashboard expenses: dates spread over the last 2 months (on weekdays-agnostic days).
	const twoMonthsAgo = resolveDate('-2m')
	const recentSpan = Math.max(1, Math.floor((yesterday - twoMonthsAgo) / 86400000))
	for (let i = 0; i < dashboardExpenses.length; i++) {
		const s = dashboardExpenses[i]
		const date = twoMonthsAgo + (hashString(s.person + s.type + 'dash' + i) % recentSpan) * 86400000
		if (await addExpense(s, date)) count++
	}
	console.log(`Created ${count} expense records (incl. 10 on Dashboard, last 2 months)`)
}

// Assign a project manager to each top-level client so the `pm` approval stage resolves
async function assignProjectManagers(personMap, projectMap) {
	const assignments = [
		{ manager: 'Sophie Laurent', clients: ['Acme Corp', 'Greenleaf Industries'] },
		{ manager: "Liam O'Brien", clients: ['Northstar Financial', 'Brightwave Media'] },
		{ manager: 'Thomas Muller', clients: ['Silverline Retail', 'Quantum Logistics'] },
	]
	let count = 0
	for (const a of assignments) {
		const managerId = personMap[a.manager]
		for (const c of a.clients) {
			const projectId = projectMap[c]
			if (!managerId || !projectId) continue
			await gql(
				`mutation($managerId: BeeboleId!, $projectId: BeeboleId!) {
					makeManagerOfProject(managerId: $managerId, projectId: $projectId) { id }
				}`,
				{ managerId, projectId }
			)
			count++
		}
	}
	console.log(`Assigned ${count} project managers`)
}

// Submit weekly periods from each person's start to yesterday.
// Older than the last 3 weeks: fully approve. Last 3 weeks: approve ~half (mix of pending/approved).
// NOTE: `requireScheduledTimePeriod` (set true for the demo) blocks submitting any historical week
// via the API, so we turn it off for the duration of the backfill and restore it at the end.
// Approval completes in a single approveTimesheet call (status goes straight to 'a'); the loop is
// capped and breaks on 'a' so it never re-approves (which would re-open the timesheet).
async function approveHistory(personMap, personStart) {
	const yesterday = resolveDate('yesterday')
	const threeWeeksAgo = resolveDate('-3w')
	const windowStart = resolveDate(`-${BACKFILL_MONTHS}m`)
	const setRequireScheduled = (v) =>
		gql(
			`mutation($v: Boolean) { editOrganisationTimeSettingsRequireScheduledTimePeriod(requireScheduledTimePeriod: $v) { id } }`,
			{ v }
		)
	await setRequireScheduled(false)
	const submit = createPool(6)
	const work = []
	let submitted = 0
	let approved = 0
	// Periods follow the organisation's first day of the week (Sunday for this US-localised
	// account; seed-demo assumed Monday, which submits ranges matching no timesheet period).
	const loc = await gql('{ currentOrganisation { localisation { firstDayOfWeek { value } } } }')
	const firstDay = loc?.currentOrganisation?.localisation?.firstDayOfWeek?.value ?? 1
	const weekStartOf = (ts) => {
		const d = new Date(ts)
		const back = (d.getUTCDay() - firstDay + 7) % 7
		return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - back, 0, 0, 0)
	}
	for (const p of PEOPLE) {
		const personId = personMap[p.name]
		if (!personId) continue
		const empStart = Math.max(windowStart, personStart?.[personId] ?? windowStart)
		const lastFull = weekStartOf(yesterday) // exclude the current (partial) week
		const recentCutoff = weekStartOf(threeWeeksAgo)
		for (let wk = weekStartOf(empStart); wk < lastFull; wk += 7 * 86400000) {
			// The app's period ends at 23:59:59.999 on its last day (timesheetService.getTimesheetPeriod);
			// a submission ending at the next midnight is a different period the app never shows.
			const wkEnd = wk + 7 * 86400000 - 1
			const recent = wk >= recentCutoff
			const doApprove = !recent || hashString(p.name + wk) % 2 === 0
			work.push(
				submit(async () => {
					const ev = await gql(
						`mutation($p: BeeboleId!, $s: BeeboleTimestamp!, $e: BeeboleTimestamp!) { submitTimesheet(personId: $p, startTime: $s, endTime: $e) { id } }`,
						{ p: personId, s: wk, e: wkEnd }
					)
					if (!ev) return
					submitted++
					if (!doApprove) return
					// Clear up to 2 approval stages (PM → Team Leader). Re-read state to drive each stage.
					for (let stage = 0; stage < 2; stage++) {
						const st = await gql(
							`query($p: BeeboleId!, $s: BeeboleTimestamp!, $e: BeeboleTimestamp!) { getApprovalState(personId: $p, startTime: $s, endTime: $e) { status submitId } }`,
							{ p: personId, s: wk, e: wkEnd }
						)
						const id = st?.getApprovalState?.submitId
						if (!id || st.getApprovalState.status === 'a') break
						await gql(`mutation($id: BeeboleId!) { approveTimesheet(id: $id) { id } }`, { id })
					}
					approved++
				})
			)
		}
	}
	await Promise.all(work)
	await setRequireScheduled(true)
	console.log(`Approvals: submitted ${submitted} periods, fully approved ${approved}`)
}

// Two-stage approval: Project Manager (pm) → Team Leader (person's manager, ppm)
async function configureApprovalWorkflow() {
	await gql(
		`mutation($stages: [BeeboleApprovalStageInput]) { editOrganisationApprovalStages(stages: $stages) { id } }`,
		{
			stages: [
				{ type: 'pm', quorum: 'any' },
				{ type: 'ppm', quorum: 'any' },
			],
		}
	)
	console.log('Configured approval workflow: Project Manager → Team Leader')
}

async function configureAvailability() {
	const toggle = (field, value) =>
		gql(`mutation($v: Boolean!) { editOrganisation${field}Availability(available: $v) { id } }`, { v: value })
	await toggle('AbsenceType', true)
	await toggle('ExpenseType', true)
	await toggle('CustomField', true)
	await toggle('Project', true)
	await toggle('SubProject', true)
	await toggle('Task', false)
	console.log('Configured availability toggles (tasks off)')
}

async function createReports(projCats) {
	const folder = async (name) => {
		const res = await gql(`mutation($name: BeeboleName!) { createReportFolder(name: $name) { id } }`, { name })
		return res?.createReportFolder?.id
	}
	const monthFolder = await folder('Current Month')
	const yearFolder = await folder('Current Year')
	const setPeriod = (id, period) =>
		gql(
			`mutation($id: BeeboleId!, $period: BeeboleReportParamPeriodInput) { editReportFolderPeriod(id: $id, period: $period) { id } }`,
			{
				id,
				period,
			}
		)
	if (monthFolder) await setPeriod(monthFolder, { target: 'current', period: 'month' })
	if (yearFolder) await setPeriod(yearFolder, { target: 'current', period: 'year' })

	const make = (args) =>
		gql(
			`mutation($name: BeeboleName!, $folderId: BeeboleId!, $period: BeeboleReportParamPeriodInput, $records: [BeeboleRecordType]!, $attributes: BeeboleReportParamAttributesInput, $groupBy: BeeboleReportParamGroupByInput, $options: BeeboleReportParamOptionsInput) {
				createReport(name: $name, folderId: $folderId, period: $period, records: $records, attributes: $attributes, groupBy: $groupBy, options: $options) { id }
			}`,
			args
		)
	const month = { target: 'current', period: 'month' }
	const year = { target: 'current', period: 'year' }
	const customerLvl0 = { projects: [{ categoryId: projCats['Customer'], level: 0 }] }
	let count = 0
	if (monthFolder) {
		await make({
			name: 'Hours by Person',
			folderId: monthFolder,
			period: month,
			records: ['time'],
			attributes: { person: true },
			options: {},
		})
		await make({
			name: 'Team Calendar',
			folderId: monthFolder,
			period: month,
			records: ['time'],
			attributes: { person: true, periodSplit: 'day' },
			options: {},
		})
		await make({
			name: 'Profit by Project',
			folderId: monthFolder,
			period: month,
			records: ['time'],
			groupBy: customerLvl0,
			options: { billing: true, cost: true },
		})
		count += 3
	}
	if (yearFolder) {
		await make({
			name: 'Margin by Client per Month',
			folderId: yearFolder,
			period: year,
			records: ['time'],
			groupBy: customerLvl0,
			attributes: { periodSplit: 'month' },
			options: { billing: true, cost: true },
		})
		await make({
			name: 'Absences by person',
			folderId: yearFolder,
			period: year,
			records: ['time'],
			attributes: { person: true },
			options: {},
		})
		count += 2
	}
	console.log(`Created 2 report folders + ${count} reports`)
}

// ────────────────────────────────────────────────────────────
// Append mode helpers
// ────────────────────────────────────────────────────────────

async function resolveExistingMaps() {
	const persons = await gql('{ getPersons { id name role { name } } }')
	const projects = await gql('{ getProjects { id name } }')
	const personMap = {}
	for (const p of persons?.getPersons || []) personMap[p.name] = p.id
	const projectMap = {}
	for (const p of projects?.getProjects || []) projectMap[p.name] = p.id
	const adminPerson = (persons?.getPersons || []).find((p) => p.role?.name === 'Admin')
	return { personMap, projectMap, myId: adminPerson?.id, myName: adminPerson?.name }
}

// NOTE: the time-record filter date key (afterTs) is unverified against a live API; confirm on first run.
async function latestRecordDate(personMap) {
	const yesterday = resolveDate('yesterday')
	for (const lookback of [90, 365, BACKFILL_MONTHS * 31]) {
		const afterTs = yesterday - lookback * 86400000
		let max = 0
		for (const id of Object.values(personMap)) {
			const d = await gql(
				`query($s: BeeboleTimestamp!, $f: [BeeboleTimeRecordFilter]) { getTimeRecords(startTime: $s, filter: $f) { startTime { ts } } }`,
				{ s: afterTs, f: [{ personId: id }] }
			)
			for (const r of d?.getTimeRecords || []) if (r.startTime?.ts > max) max = r.startTime.ts
		}
		if (max) return max
	}
	return 0
}

async function appendMain() {
	const { personMap, projectMap, myId, myName } = await resolveExistingMaps()
	const profiles = buildProfiles(myName)
	const submit = createPool(POOL)
	const isWorkingDay = makeIsWorkingDay()
	const isHoliday = await makeIsHoliday()
	const yesterday = resolveDate('yesterday')
	const max = await latestRecordDate(personMap)
	const from = max ? max + 86400000 : resolveDate(`-${BACKFILL_MONTHS}m`)
	if (from > yesterday) {
		console.log('Append: already up to date.')
		return 0
	}
	console.log(
		`Append: filling ${new Date(from).toISOString().slice(0, 10)} → ${new Date(yesterday).toISOString().slice(0, 10)}`
	)
	const allTasks = []
	let total = 0
	for (const [name, profile] of Object.entries(profiles)) {
		const personId = name === myName ? myId : personMap[name]
		if (!personId) continue
		const r = fillDays(
			personId,
			name,
			profile,
			from,
			yesterday,
			'rich',
			projectMap,
			submit,
			isWorkingDay,
			isHoliday
		)
		allTasks.push(...r.tasks)
		total += r.count
	}
	if (DRY_RUN) {
		console.log(`[dry-run] would create ${total} time records`)
		return total
	}
	await Promise.all(allTasks)
	console.log(`Append: created ${total} time records`)
	return total
}

// Submit + approve historical timesheets on an already-seeded account.
// Separate one-way step: approval events are an immutable audit trail, so once run, the account
// can no longer be wiped/re-seeded via `full` (deletePerson is blocked by hasApprovalEvents).
async function approveMain() {
	const persons = await gql('{ getPersons { id name startDate { ts } } }')
	const personMap = {}
	const personStart = {}
	const fallback = resolveDate(`-${BACKFILL_MONTHS}m`)
	for (const p of persons?.getPersons || []) {
		personMap[p.name] = p.id
		personStart[p.id] = p.startDate?.ts ?? fallback
	}
	if (DRY_RUN) {
		console.log('[dry-run] approve would submit weekly periods (older fully approved, last 3 weeks mixed).')
		console.log('[dry-run] NOTE: approvals are one-way — the account cannot be `full`-reseeded afterward.')
		return
	}
	await approveHistory(personMap, personStart)
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

async function main() {
	const t0 = Date.now()
	console.log(`Mode: ${MODE}${DRY_RUN ? ' (dry-run)' : ''} · target: ${target}`)
	try {
		await assertDocumentationOrg(gql)
		if (MODE === 'full') await assertNoApprovals(gql)
	} catch (e) {
		console.error(e.message)
		process.exit(1)
	}
	if (MODE === 'append') {
		await appendMain()
		if (!DRY_RUN) await applyLayer()
		console.log(`\nDone (append). elapsed: ${((Date.now() - t0) / 1000).toFixed(1)}s`)
		return
	}
	if (MODE === 'approve') {
		await approveMain()
		console.log(`\nDone (approve). elapsed: ${((Date.now() - t0) / 1000).toFixed(1)}s`)
		return
	}
	if (DRY_RUN) {
		console.log('[dry-run] full mode would: wipe, recreate entities/settings, and backfill 12 months of time data.')
		console.log('[dry-run] run against a real account to see exact counts; no writes performed.')
		return
	}
	const { myId, myName } = await wipe()
	let defaults = await resolveDefaults()
	defaults.tagCats = await createTagCategories(defaults.tagCats)

	const tagMap = await createTags(defaults.tagCats)
	const { personMap, personStart } = await createPersons(defaults.roles, tagMap, myId, myName)
	personMap.__me = myId
	await assignManagers(personMap)
	await createPersonCosts(personMap)
	defaults.projCats = await renameCorporate(defaults.projCats)
	const projectMap = await createProjects(defaults.projCats)
	await createProjectBillings(projectMap)
	await createProjectBudgets(projectMap)
	await createTasks(defaults.taskCat, defaults.statuses, projectMap, personMap)
	await createCustomFields(personMap)
	await createScheduleTypes(personMap)
	const expenseMap = await createExpenseTypes()
	const absenceMap = await createAbsenceTypes()
	await assignProjectManagers(personMap, projectMap)
	await configureAvailability()
	await configureLocalisation()
	await configurePublicHolidays()
	await configureApprovalWorkflow()
	await configureTimesheetSettings(defaults.projCats)
	const timeRecordCount = await createTimeRecords(projectMap, personMap, myName, myId, personStart)
	await generateAbsences(absenceMap, personMap, personStart)
	await generateExpenses(expenseMap, personMap, projectMap)
	await fitBudgetsToActuals(projectMap)
	await createReports(defaults.projCats)
	await applyLayer()

	const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
	console.log('\nDone! Created:')
	console.log(`  ${PEOPLE.length} people + 1 admin`)
	console.log(`  ${CLIENT_PROJECTS.length + INTERNAL_PROJECTS.length + ACTIVITY_PROJECTS.length} projects`)
	console.log(`  ${TASKS.length} tasks`)
	console.log(`  ${DEPARTMENTS.length + CONTRACTS.length} tags`)
	console.log(
		`  ${SCHEDULE_TYPES.length} schedule types · ${EXPENSE_TYPES.length} expense types · ${ABSENCE_TYPES.length} absence types`
	)
	console.log(`  ${timeRecordCount} time records`)
	console.log(`  elapsed: ${elapsed}s`)
}

main().catch((e) => {
	console.error('FATAL:', e)
	process.exit(1)
})

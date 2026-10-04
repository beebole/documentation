#!/usr/bin/env node
// Site-wide structural lint for help/**: cheap, deterministic checks that a model-based review
// misses because it only looks at the pages a change touched.
//
//   node .claude/scripts/site-lint.mjs [--base <git ref>] [--out <file.md>] [--json <file.json>]
//
// Run from the repository root. Sibling repos (../reboot, ../md, ../website-next) are read for
// inbound links when present; set WORKSPACE_ROOT to point elsewhere.
// Exit code 1 when there is at least one error; warnings never fail.

import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, extname } from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()
const WORKSPACE = resolve(process.env.WORKSPACE_ROOT ?? join(ROOT, '..'))
const args = process.argv.slice(2)
const option = (name) => {
	const i = args.indexOf(name)
	return i === -1 ? undefined : args[i + 1]
}

// The legacy tab is a frozen archive of the previous product: links into it are checked,
// its content is not.
const FROZEN = /^help\/legacy\//
// Pages exempt from the FAQ rule: API reference, release notes, the landing page.
const FAQ_EXEMPT = /^help\/(api\/|news\/|index\.mdx$)/
const PROSE_MIN = 60

// --label-hints <page.mdx>...: list the bold terms of those pages that appear nowhere in the
// app's English labels. A hint list for a review (renamed or removed UI), not a lint result:
// bold also marks seed names and emphasis, so most hits are fine.
if (args[0] === '--label-hints') {
	const labelsPath = join(WORKSPACE, 'reboot/shared/i18n/en/labels.json')
	if (!existsSync(labelsPath)) {
		console.error(`label hints need ${labelsPath}`)
		process.exit(2)
	}
	const norm = (s) => s.toLowerCase().replace(/\\/g, '').replace(/[.…:]+$/, '').trim()
	const values = new Set()
	;(function collect(node) {
		if (typeof node === 'string') values.add(norm(node))
		else if (node && typeof node === 'object') Object.values(node).forEach(collect)
	})(JSON.parse(readFileSync(labelsPath, 'utf8')))
	const haystack = [...values].join('\n')
	for (const page of args.slice(1)) {
		const text = readFileSync(join(ROOT, page), 'utf8').replace(/```[\s\S]*?```/g, '')
		const missing = new Set()
		for (const m of text.matchAll(/\*\*([^*\n]{2,60})\*\*/g)) {
			const term = norm(m[1])
			if (!values.has(term) && !haystack.includes(term)) missing.add(m[1])
		}
		console.log(`${page}: ${missing.size ? [...missing].join(' · ') : 'all bold terms found in labels.json'}`)
	}
	process.exit(0)
}

const findings = []
const add = (level, check, file, line, message) => findings.push({ level, check, file, line, message })

function walk(dir, filter) {
	if (!existsSync(dir)) return []
	const out = []
	for (const name of readdirSync(dir)) {
		if (name === 'node_modules' || name.startsWith('.')) continue
		const path = join(dir, name)
		if (statSync(path).isDirectory()) out.push(...walk(path, filter))
		else if (filter(path)) out.push(path)
	}
	return out
}

const docs = JSON.parse(readFileSync(join(ROOT, 'docs.json'), 'utf8'))
const redirectSources = new Set((docs.redirects ?? []).map((r) => r.source.replace(/\/$/, '')))

const pageFiles = walk(join(ROOT, 'help'), (p) => p.endsWith('.mdx')).map((p) => relative(ROOT, p))
const pageUrls = new Set(
	pageFiles.map((f) => '/' + f.replace(/\.mdx$/, '').replace(/\/index$/, '')),
)
// help/index.mdx is served at /help.
pageUrls.add('/help')

// A /help/... URL resolves when it is a page, a redirect source, or a static file.
function resolves(url) {
	const path = url.split(/[?#]/)[0].replace(/\/$/, '')
	if (pageUrls.has(path) || pageUrls.has(path.replace(/\/index$/, '')) || redirectSources.has(path)) return true
	if (extname(path) && existsSync(join(ROOT, path.slice(1)))) return true
	return false
}

// Replace fenced code and inline code with blanks of the same shape, so examples in code
// are not linted and line numbers stay right.
function stripCode(text) {
	const blank = (s) => s.replace(/[^\n]/g, ' ')
	return text.replace(/^(\s*)(```|~~~)[\s\S]*?^\s*\2/gm, blank).replace(/`[^`\n]*`/g, blank)
}

function lineOf(text, index) {
	return text.slice(0, index).split('\n').length
}

function frontmatter(text) {
	const m = text.match(/^---\n([\s\S]*?)\n---/)
	if (!m) return null
	const fields = {}
	for (const line of m[1].split('\n')) {
		const kv = line.match(/^([A-Za-z][\w:-]*):\s*(.*)$/)
		if (kv) fields[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim()
	}
	return { fields, end: m[0].length }
}

// Similarity between two short strings, 0 to 1 (1 - normalised Levenshtein distance).
function similar(a, b) {
	a = a.toLowerCase()
	b = b.toLowerCase()
	const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
	for (let j = 1; j <= b.length; j++) d[0][j] = j
	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
		}
	}
	return 1 - d[a.length][b.length] / Math.max(a.length, b.length, 1)
}

const referencedImages = new Set()

for (const file of pageFiles) {
	const raw = readFileSync(join(ROOT, file), 'utf8')
	const text = stripCode(raw)
	const frozen = FROZEN.test(file)

	for (const m of raw.matchAll(/\/help\/images\/[^\s)"'`]+/g)) referencedImages.add(m[0])
	if (frozen) continue

	// Frontmatter
	const fm = frontmatter(raw)
	if (!fm) add('error', 'frontmatter', file, 1, 'no frontmatter block')
	else {
		for (const key of ['title', 'description']) {
			if (!fm.fields[key]) add('error', 'frontmatter', file, 1, `missing \`${key}\``)
		}
	}

	// Duplicated steps: the Mintlify dashboard editor has merged stale drafts into pages,
	// leaving repeated <Step> titles or whole repeated <Steps> blocks.
	const blocks = []
	for (const m of text.matchAll(/<Steps>([\s\S]*?)<\/Steps>/g)) {
		const titles = [...m[1].matchAll(/<Step\s[^>]*title=["']([^"']+)["']/g)].map((t) => t[1].trim())
		const line = lineOf(text, m.index)
		const seen = new Set()
		for (const t of titles) {
			if (seen.has(t)) add('error', 'duplicate-step', file, line, `step "${t}" appears twice in one <Steps> block`)
			seen.add(t)
		}
		const key = titles.join(' | ')
		const twin = blocks.find((b) => b.key === key && titles.length > 1)
		if (twin) add('error', 'duplicate-steps', file, line, `same steps as the <Steps> block at line ${twin.line}`)
		blocks.push({ key, line })
	}

	// A page opens with its direct answer, never with a step list: a <Steps> block right after
	// the frontmatter is how stale dashboard drafts showed up on 2026-06-16.
	const body = text.slice(fm ? fm.end : 0).replace(/^\s*(import [^\n]*\n\s*)*/, '')
	if (/^\s*<Steps>/.test(body)) add('error', 'steps-before-intro', file, lineOf(text, (fm ? fm.end : 0) + body.search(/<Steps>/)), 'page body starts with <Steps>, before any intro: likely a stale merged draft')

	// Near-identical step titles in different <Steps> blocks ("Open the calendar panel" and
	// "Open the calendar pane") are the other trace of a merged draft.
	const allSteps = []
	blocks.forEach((b, bi) => b.key.split(' | ').filter(Boolean).forEach((t) => allSteps.push({ t, bi, line: b.line })))
	for (let a = 0; a < allSteps.length; a++) {
		for (let b = a + 1; b < allSteps.length; b++) {
			const x = allSteps[a]
			const y = allSteps[b]
			if (x.bi === y.bi || x.t === y.t) continue
			if (similar(x.t, y.t) >= 0.85) add('warning', 'near-duplicate-step', file, y.line, `step "${y.t}" is nearly the same as "${x.t}" (block at line ${x.line})`)
		}
	}

	// Headings that appear twice (whole duplicated sections; also breaks anchors).
	const headings = new Map()
	for (const m of text.matchAll(/^(#{2,4}) (.+)$/gm)) {
		const h = m[2].trim()
		if (headings.has(h)) add('error', 'duplicate-heading', file, lineOf(text, m.index), `heading "${h}" also at line ${headings.get(h)}`)
		else headings.set(h, lineOf(text, m.index))
	}

	// Repeated prose: a sentence-length line that appears twice on a page. A warning, since
	// procedures legitimately repeat a navigation step; check it is not a merged draft.
	const lines = text.split('\n')
	const prose = new Map()
	const fmLines = fm ? raw.slice(0, fm.end).split('\n').length : 0
	lines.forEach((l, i) => {
		const s = l.trim()
		if (i < fmLines) return
		if (s.length < PROSE_MIN || /^[<|!{]/.test(s) || /^[A-Za-z][\w:-]*=/.test(s)) return
		if (prose.has(s)) add('warning', 'repeated-prose', file, i + 1, `same line as line ${prose.get(s)}: "${s.slice(0, 70)}…"`)
		else prose.set(s, i + 1)
	})

	// Raw HTML and inline styles (banned: use Mintlify components). Partial screenshots use
	// <img ... width="N" /> inside <Frame>; third-party iframes sit in <Frame> and may carry style.
	let frameDepth = 0
	let inIframe = false
	lines.forEach((l, i) => {
		const n = i + 1
		const iframeLine = inIframe || /<iframe(?=[\s>]|$)/.test(l)
		if (/<iframe(?=[\s>]|$)/.test(l)) inIframe = true
		if (inIframe && /\/?>\s*$/.test(l)) inIframe = false
		frameDepth += (l.match(/<Frame(?=[\s>]|$)/g) ?? []).length
		for (const m of l.matchAll(/<(div|span|br|p|table|thead|tbody|tr|td|th|ul|ol|li|h[1-6]|b|strong|em|i|a|center|font)(?=[\s>/])/g)) {
			add('error', 'raw-html', file, n, `raw <${m[1]}>: use markdown or a Mintlify component`)
		}
		if (/\bclassName=/.test(l)) add('error', 'raw-html', file, n, '`className=` attribute')
		if (/\bstyle=/.test(l) && !iframeLine) add('error', 'raw-html', file, n, '`style=` outside an iframe')
		if (/<img(?=[\s>]|$)/.test(l)) {
			if (frameDepth === 0) add('error', 'raw-html', file, n, '<img> outside <Frame>')
			else if (!/\bwidth=/.test(l)) add('error', 'raw-html', file, n, '<img> without `width` (partial screenshots only; full screens use markdown images)')
		}
		if (/<iframe(?=[\s>]|$)/.test(l) && frameDepth === 0) add('error', 'raw-html', file, n, '<iframe> outside <Frame>')
		frameDepth -= (l.match(/<\/Frame>/g) ?? []).length
		if (frameDepth < 0) frameDepth = 0
	})

	// Images that do not exist.
	for (const m of text.matchAll(/(?:\]\(|src=["'])(\/help\/images\/[^\s)"']+)/g)) {
		if (!existsSync(join(ROOT, m[1].slice(1)))) add('error', 'missing-image', file, lineOf(text, m.index), m[1])
	}

	// Internal links: must start with /help/ (reverse proxy) and resolve.
	for (const m of text.matchAll(/(?:\]\(|href=["'])(\/[^\s)"']*)/g)) {
		const url = m[1]
		const line = lineOf(text, m.index)
		if (!url.startsWith('/help/') && url !== '/help') add('error', 'link-prefix', file, line, `${url} does not start with /help/`)
		else if (!url.startsWith('/help/images/') && !resolves(url)) add('error', 'broken-link', file, line, url)
	}

	// FAQ section.
	if (!FAQ_EXEMPT.test(file) && !/<AccordionGroup>/.test(text)) add('warning', 'missing-faq', file, 1, 'no FAQ (<AccordionGroup>) section')
}

// Navigation: every entry must exist; every page should be reachable from it.
const navPages = new Set()
;(function collect(node) {
	if (typeof node === 'string') {
		if (node.startsWith('help')) navPages.add(node)
	} else if (Array.isArray(node)) node.forEach(collect)
	else if (node && typeof node === 'object') Object.values(node).forEach(collect)
})(docs.navigation)
for (const p of navPages) {
	if (!existsSync(join(ROOT, `${p}.mdx`))) add('error', 'navigation', 'docs.json', 0, `navigation lists ${p}, which does not exist`)
}
for (const f of pageFiles) {
	if (!navPages.has(f.replace(/\.mdx$/, ''))) add('warning', 'not-in-navigation', f, 0, 'page is not in docs.json navigation')
}
for (const r of docs.redirects ?? []) {
	if (r.destination.startsWith('/help') && !resolves(r.destination)) add('error', 'redirect', 'docs.json', 0, `redirect ${r.source} → ${r.destination}: destination does not exist`)
}

// Images on disk that no page uses.
for (const extra of ['docs.json', 'style.css']) {
	if (existsSync(join(ROOT, extra))) {
		for (const m of readFileSync(join(ROOT, extra), 'utf8').matchAll(/\/help\/images\/[^\s)"'`]+/g)) referencedImages.add(m[0])
	}
}
for (const img of walk(join(ROOT, 'help/images'), (p) => /\.(webp|png|jpe?g|gif|svg)$/i.test(p))) {
	const url = '/' + relative(ROOT, img)
	if (!referencedImages.has(url)) add('warning', 'unused-image', relative(ROOT, img), 0, 'no page references this image')
}

// Inbound links: the app, the in-app help snippets and the website link to doc pages.
const INBOUND = [
	['reboot', ['frontend/src', 'shared', 'backend/src']],
	['md', ['.']],
	['website-next', ['src']],
	['website-next-faq', ['.']],
]
const inboundSkipped = []
let inboundCount = 0
for (const [repo, dirs] of INBOUND) {
	const base = join(WORKSPACE, repo)
	if (!existsSync(base)) {
		inboundSkipped.push(repo)
		continue
	}
	for (const d of dirs) {
		for (const f of walk(join(base, d), (p) => /\.(ts|tsx|js|jsx|mjs|json|md|mdx|html|vue)$/.test(p))) {
			const content = readFileSync(f, 'utf8')
			for (const m of content.matchAll(/beebole\.com(\/help(?:\/[A-Za-z0-9_\-/.]*)?)/g)) {
				inboundCount++
				const url = m[1].replace(/[./]+$/, '')
				if (!resolves(url)) add('error', 'inbound-link', `../${repo}/${relative(base, f)}`, lineOf(content, m.index), `${url} has no page and no redirect`)
			}
		}
	}
}

// Pages removed or renamed since the base ref need a redirect from their old URL.
const base = option('--base') ?? 'main'
let baseChecked = true
try {
	const out = execFileSync('git', ['diff', '--name-status', '-M', base, '--', 'help/'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
	for (const line of out.split('\n')) {
		const [status, oldPath] = line.split('\t')
		if (!status || !/^[DR]/.test(status) || !oldPath.endsWith('.mdx')) continue
		const url = '/' + oldPath.replace(/\.mdx$/, '').replace(/\/index$/, '')
		if (!resolves(url)) add('error', 'missing-redirect', 'docs.json', 0, `${oldPath} was ${status.startsWith('D') ? 'deleted' : 'renamed'}; add a redirect from ${url}`)
	}
} catch {
	baseChecked = false
}

// Report
const errors = findings.filter((f) => f.level === 'error')
const warnings = findings.filter((f) => f.level === 'warning')
const loc = (f) => (f.line ? `${f.file}:${f.line}` : f.file)
const section = (title, list) => {
	if (!list.length) return `## ${title}\n\nNone.\n`
	const byCheck = Map.groupBy ? Map.groupBy(list, (f) => f.check) : list.reduce((m, f) => m.set(f.check, [...(m.get(f.check) ?? []), f]), new Map())
	let s = `## ${title}\n`
	for (const [check, items] of byCheck) {
		s += `\n### ${check} (${items.length})\n\n`
		for (const f of items) s += `- \`${loc(f)}\` ${f.message}\n`
	}
	return s
}
const date = new Date().toISOString().slice(0, 10)
const notes = [
	`Pages checked: ${pageFiles.filter((f) => !FROZEN.test(f)).length} (legacy tab skipped: frozen archive).`,
	`Inbound links checked: ${inboundCount}${inboundSkipped.length ? ` (skipped, repo not found: ${inboundSkipped.join(', ')})` : ''}.`,
	baseChecked ? `Removed or renamed pages compared with \`${base}\`.` : `Removed or renamed pages not checked: git ref \`${base}\` not found.`,
]
const md = `# Site lint\n\nGenerated: ${date}\n\n${notes.map((n) => `- ${n}`).join('\n')}\n- Errors: ${errors.length}. Warnings: ${warnings.length}.\n\n${section('Errors', errors)}\n${section('Warnings', warnings)}`

const outPath = option('--out')
if (outPath) writeFileSync(outPath, md)
else process.stdout.write(md)
const jsonPath = option('--json')
if (jsonPath) writeFileSync(jsonPath, JSON.stringify({ date, errors, warnings, notes }, null, 2))
if (outPath) console.log(`site-lint: ${errors.length} errors, ${warnings.length} warnings → ${outPath}`)
process.exitCode = errors.length ? 1 : 0

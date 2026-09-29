#!/usr/bin/env node
// Docs screenshot runner. See ../SKILL.md.
//   list                              every scene and shot with its capture date
//   capture <all|scene-id|page> [--preview]
//   replay [all|scene-id|page] [--json <path>]
//   where-used <image path under help/images>
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { loadScenes, setCapturedAt } from './lib/scenes.mjs'
import { launchBrowser, ensureSession } from './lib/session.mjs'
import { shootScene } from './lib/shoot.mjs'
import { encodeWebp } from './lib/webp.mjs'
import { compareImages } from './lib/compare.mjs'
import { IMAGES_DIR, HELP_DIR, REPO_ROOT, TMP_DIR } from './lib/paths.mjs'

const [cmd, ...rest] = process.argv.slice(2)
const flag = (name) => rest.includes(name)
const option = (name) => (rest.includes(name) ? rest[rest.indexOf(name) + 1] : undefined)
const positional = rest.filter((a, i) => !a.startsWith('--') && !(i > 0 && rest[i - 1] === '--json'))

function today() {
	return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

async function pool(items, size, fn) {
	const results = []
	let next = 0
	await Promise.all(
		Array.from({ length: Math.min(size, items.length) }, async () => {
			while (next < items.length) {
				const i = next++
				results[i] = await fn(items[i])
			}
		})
	)
	return results
}

export function whereUsed(file) {
	try {
		const out = execFileSync('grep', ['-rl', '--include=*.mdx', `/help/images/${file}`, HELP_DIR], { encoding: 'utf8' })
		return out.trim().split('\n').filter(Boolean).map((p) => relative(REPO_ROOT, p))
	} catch {
		return []
	}
}

async function list() {
	for (const { page, scene } of await loadScenes()) {
		console.log(`${scene.id}\t${scene.capturedAt}\t${scene.mode}${scene.datesMatter ? '\tdates' : ''}\t${page}`)
		for (const s of scene.shots) console.log(`    ${s.file}`)
	}
}

async function capture(target, preview) {
	const entries = (await loadScenes(target)).filter((e) => e.scene.mode === 'auto' || e.scene.id === target)
	const date = today()
	const outDir = join(TMP_DIR, preview ? 'preview' : 'capture')
	const browser = await launchBrowser()
	await ensureSession(browser)
	let failed = 0
	for (const entry of entries) {
		try {
			const shots = await shootScene(browser, entry, { date, outDir })
			for (const { file, png } of shots) {
				if (preview) {
					console.log(`preview ${entry.scene.id}: ${png}`)
					continue
				}
				const dest = join(IMAGES_DIR, file)
				mkdirSync(dirname(dest), { recursive: true })
				const { quality, bytes } = encodeWebp(png, dest)
				console.log(`captured ${file} (${Math.round(bytes / 1024)} KB, q${quality})`)
			}
			if (!preview) setCapturedAt(entry.file, entry.scene.id, date)
		} catch (e) {
			failed++
			console.error(`broken ${e.message}`)
		}
	}
	await browser.close()
	process.exitCode = failed ? 1 : 0
}

function writeReport(path, report) {
	mkdirSync(dirname(path), { recursive: true })
	writeFileSync(path, JSON.stringify(report, null, 2))
}

async function replay(target, jsonPath) {
	const path = jsonPath ?? join(TMP_DIR, 'replay-report.json')
	const report = { date: today(), scenes: [] }
	// Replace any previous report first, so a caller never reads last run's results as today's.
	writeReport(path, { ...report, error: 'replay in progress' })
	let browser
	let entries
	try {
		entries = (await loadScenes(target)).filter((e) => e.scene.mode === 'auto')
		browser = await launchBrowser()
		await ensureSession(browser)
	} catch (e) {
		await browser?.close()
		writeReport(path, { ...report, error: e.message })
		console.error(`replay could not start: ${e.message}`)
		process.exitCode = 2
		return
	}
	const outDir = join(TMP_DIR, 'replay')
	const rows = await pool(entries, 4, async (entry) => {
		const row = { id: entry.scene.id, page: entry.page, capturedAt: entry.scene.capturedAt, datesMatter: entry.scene.datesMatter, shots: [] }
		try {
			const shots = await shootScene(browser, entry, { date: entry.scene.capturedAt, outDir })
			for (const { file, png } of shots) {
				const published = join(IMAGES_DIR, file)
				if (!existsSync(published)) {
					row.shots.push({ file, status: 'missing', usedOn: whereUsed(file) })
					continue
				}
				const candidate = png.replace(/\.png$/, '.webp')
				encodeWebp(png, candidate)
				const diffPath = png.replace(/\.png$/, '.diff.png')
				const r = await compareImages(published, candidate, { diffPath })
				row.shots.push({ file, status: r.status, ratio: Number(r.ratio.toFixed(4)), diffPixels: r.diffPixels, reason: r.reason, candidate: png, diff: r.diffPixels ? diffPath : undefined, usedOn: whereUsed(file) })
			}
			row.status = row.shots.some((s) => s.status !== 'same') ? 'changed' : 'same'
		} catch (e) {
			row.status = 'broken'
			row.error = e.message
		}
		return row
	})
	report.scenes = rows
	await browser.close()
	writeReport(path, report)
	for (const r of rows) {
		if (r.status === 'broken') console.log(`broken   ${r.id}: ${r.error}`)
		else for (const s of r.shots) console.log(`${s.status.padEnd(8)} ${s.file}${s.diffPixels ? ` (${s.diffPixels} px, ${(s.ratio * 100).toFixed(2)} %)` : ''}`)
	}
	console.log(`report: ${path}`)
}

const commands = {
	list: () => list(),
	capture: () => capture(positional[0] ?? 'all', flag('--preview')),
	replay: () => replay(positional[0] ?? 'all', option('--json')),
	'where-used': () => console.log(whereUsed(positional[0]).join('\n') || '(not used)'),
}
if (!commands[cmd]) {
	console.error('Usage: screenshots.mjs list | capture <target> [--preview] | replay [target] [--json path] | where-used <image>')
	process.exit(1)
}
await commands[cmd]()

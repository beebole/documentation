import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TMP_DIR } from './paths.mjs'

const cli = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots.mjs')

test('a replay that cannot start replaces the old report with an error dated today', () => {
	const dir = join(TMP_DIR, 'test')
	mkdirSync(dir, { recursive: true })
	const report = join(dir, 'report.json')
	writeFileSync(report, JSON.stringify({ date: '2020-01-01', scenes: [{ id: 'old', status: 'changed' }] }))
	let code = 0
	try {
		execFileSync('node', [cli, 'replay', '--json', report], { env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: '/nonexistent' }, stdio: 'pipe' })
	} catch (e) {
		code = e.status
	}
	const r = JSON.parse(readFileSync(report, 'utf8'))
	assert.equal(code, 2)
	assert.equal(r.date, new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }))
	assert.match(r.error, /Chromium/)
	assert.deepEqual(r.scenes, [])
})

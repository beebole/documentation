import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { validateScene, setCapturedAt } from './scenes.mjs'
import { TMP_DIR } from './paths.mjs'

const ok = { id: 'x-y', capturedAt: '2026-09-29', datesMatter: false, mode: 'auto', setup: async () => {}, shots: [{ file: 'x/y.webp', frame: { type: 'full' } }] }

test('a valid scene passes', () => assert.doesNotThrow(() => validateScene(ok, 'f.mjs')))
test('bad id is rejected', () => assert.throws(() => validateScene({ ...ok, id: 'X Y' }, 'f.mjs'), /id/))
test('bad date is rejected', () => assert.throws(() => validateScene({ ...ok, capturedAt: '29/09/2026' }, 'f.mjs'), /capturedAt/))
test('shot outside images is rejected', () => assert.throws(() => validateScene({ ...ok, shots: [{ file: '../x.webp', frame: { type: 'full' } }] }, 'f.mjs'), /file/))
test('unknown frame is rejected', () => assert.throws(() => validateScene({ ...ok, shots: [{ file: 'x/y.webp', frame: { type: 'zoom' } }] }, 'f.mjs'), /frame/))

test('setCapturedAt rewrites only the matching scene', () => {
	const dir = join(TMP_DIR, 'test')
	mkdirSync(dir, { recursive: true })
	const f = join(dir, 'scene.mjs')
	writeFileSync(f, "export const scenes = [\n\t{\n\t\tid: 'a',\n\t\tcapturedAt: '2026-01-01',\n\t},\n\t{\n\t\tid: 'b',\n\t\tcapturedAt: '2026-01-01',\n\t},\n]\n")
	setCapturedAt(f, 'b', '2026-09-29')
	const t = readFileSync(f, 'utf8')
	assert.match(t, /id: 'a',\n\t\tcapturedAt: '2026-01-01'/)
	assert.match(t, /id: 'b',\n\t\tcapturedAt: '2026-09-29'/)
	assert.throws(() => setCapturedAt(f, 'zz', '2026-09-29'), /zz/)
})

test('a lens frame needs a target function', () => {
	assert.throws(() => validateScene({ ...ok, shots: [{ file: 'x/y.webp', frame: { type: 'lens' } }] }, 'f.mjs'), /target/)
	assert.doesNotThrow(() => validateScene({ ...ok, shots: [{ file: 'x/y.webp', frame: { type: 'lens', target: () => null } }] }, 'f.mjs'))
})

test('a fixture needs both up and down', () => {
	assert.throws(() => validateScene({ ...ok, fixture: { up: async () => {} } }, 'f.mjs'), /fixture/)
	assert.doesNotThrow(() => validateScene({ ...ok, fixture: { up: async () => {}, down: async () => {} } }, 'f.mjs'))
})

test('prepare must be a function when present', () => {
	assert.throws(() => validateScene({ ...ok, prepare: 'x' }, 'f.mjs'), /prepare/)
	assert.doesNotThrow(() => validateScene({ ...ok, prepare: async () => {} }, 'f.mjs'))
})

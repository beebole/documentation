import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { compareImages } from './compare.mjs'
import { encodeWebp } from './webp.mjs'
import { TMP_DIR } from './paths.mjs'

const dir = join(TMP_DIR, 'test')
mkdirSync(dir, { recursive: true })

async function card(path, { width = 400, height = 200, box = { left: 40, top: 40 }, label = true } = {}) {
	const overlays = [{ input: { create: { width: 120, height: 40, channels: 4, background: '#432dd7' } }, ...box }]
	if (label) overlays.push({ input: { create: { width: 200, height: 12, channels: 4, background: '#364153' } }, left: 40, top: 120 })
	await sharp({ create: { width, height, channels: 4, background: '#ffffff' } }).composite(overlays).png().toFile(path)
	return path
}

test('identical images are the same', async () => {
	const a = await card(join(dir, 'a.png'))
	const r = await compareImages(a, a)
	assert.equal(r.status, 'same')
	assert.equal(r.diffPixels, 0)
})

test('WebP re-encoding noise is ignored', async () => {
	const a = await card(join(dir, 'a.png'))
	const w1 = join(dir, 'a1.webp')
	const w2 = join(dir, 'a2.webp')
	encodeWebp(a, w1)
	encodeWebp(a, w2)
	assert.equal((await compareImages(w1, w2)).status, 'same')
	assert.equal((await compareImages(w1, a)).status, 'same')
})

test('a moved button is a change', async () => {
	const a = await card(join(dir, 'a.png'))
	const b = await card(join(dir, 'b.png'), { box: { left: 220, top: 40 } })
	const r = await compareImages(a, b, { diffPath: join(dir, 'diff.png') })
	assert.equal(r.status, 'changed')
	assert.ok(r.diffPixels > 100)
})

test('a missing label line is a change', async () => {
	const a = await card(join(dir, 'a.png'))
	const b = await card(join(dir, 'c.png'), { label: false })
	assert.equal((await compareImages(a, b)).status, 'changed')
})

test('a size change is a change', async () => {
	const a = await card(join(dir, 'a.png'))
	const b = await card(join(dir, 'd.png'), { width: 402 })
	const r = await compareImages(a, b)
	assert.equal(r.status, 'changed')
	assert.equal(r.reason, 'size')
})

test('large images are encoded under 200 KB', async () => {
	const noisy = join(dir, 'noisy.png')
	const raw = Buffer.alloc(1440 * 900 * 3)
	for (let i = 0; i < raw.length; i++) raw[i] = (i * 2654435761) % 256
	await sharp(raw, { raw: { width: 1440, height: 900, channels: 3 } }).png().toFile(noisy)
	const out = encodeWebp(noisy, join(dir, 'noisy.webp'))
	assert.ok([80, 60].includes(out.quality))
})

test('a one-word label change on a full-size shot is a change', async () => {
	// 2880×1800 like a 1440×900 capture at DPR 2; a 60×16 device-pixel word is ~0.02 % of it.
	const base = { create: { width: 2880, height: 1800, channels: 4, background: '#ffffff' } }
	const word = { input: { create: { width: 60, height: 16, channels: 4, background: '#364153' } }, left: 400, top: 300 }
	const a = join(dir, 'full-a.png')
	const b = join(dir, 'full-b.png')
	await sharp(base).png().toFile(a)
	await sharp(base).composite([word]).png().toFile(b)
	assert.equal((await compareImages(a, b)).status, 'changed')
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { placeLens, composeLens, ringRadius, LENS_RADIUS } from './lens.mjs'

const context = { x: 0, y: 0, width: 600, height: 400 }
const target = { x: 100, y: 80, width: 30, height: 30 }

test('the lens sits inside the context and clear of the target', () => {
	const c = placeLens(context, target, LENS_RADIUS)
	assert.ok(c.x - LENS_RADIUS * 2 >= context.x && c.x + LENS_RADIUS * 2 <= context.x + context.width)
	assert.ok(c.y - LENS_RADIUS * 2 >= context.y && c.y + LENS_RADIUS * 2 <= context.y + context.height)
	const tx = target.x + target.width / 2
	const ty = target.y + target.height / 2
	assert.ok(Math.hypot(c.x - tx, c.y - ty) > LENS_RADIUS * 2 + 20)
})

test('a target near the right edge gets its lens on the left', () => {
	const c = placeLens(context, { x: 540, y: 80, width: 30, height: 30 }, LENS_RADIUS)
	assert.ok(c.x < 540)
})

async function source() {
	// A 4x capture of a 600×400 CSS viewport: white, with a red square on the target.
	return sharp({ create: { width: 2400, height: 1600, channels: 3, background: '#ffffff' } })
		.composite([{ input: { create: { width: 120, height: 120, channels: 3, background: '#ff0000' } }, left: 400, top: 320 }])
		.png()
		.toBuffer()
}

async function pixel(buf, x, y) {
	const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true })
	const i = (Math.round(y) * info.width + Math.round(x)) * info.channels
	return [data[i], data[i + 1], data[i + 2]]
}

test('the output is the context at 2x', async () => {
	const out = await composeLens(await source(), { context, target })
	const meta = await sharp(out).metadata()
	assert.deepEqual([meta.width, meta.height], [1200, 800])
})

test('the lens centre shows the target, magnified', async () => {
	const out = await composeLens(await source(), { context, target })
	const c = placeLens(context, target, LENS_RADIUS)
	assert.deepEqual(await pixel(out, c.x * 2, c.y * 2), [255, 0, 0])
	// The square is 30 CSS px: at 2x magnification it spans 30 px of the lens radius (in CSS
	// units of the base), so 40 CSS px from the centre is outside it, still inside the lens.
	assert.deepEqual(await pixel(out, (c.x + 40) * 2, c.y * 2), [255, 255, 255])
})

test('the ring hugs the target: 4 px outside its larger side', () => {
	assert.equal(ringRadius(target), 19)
})

test('an orange ring marks the target', async () => {
	const out = await composeLens(await source(), { context, target })
	const [r, g, b] = await pixel(out, (target.x + target.width / 2) * 2, (target.y + target.height / 2 - ringRadius(target)) * 2)
	assert.ok(r > 200 && g > 60 && g < 130 && b < 40, `expected orange, got ${[r, g, b]}`)
})

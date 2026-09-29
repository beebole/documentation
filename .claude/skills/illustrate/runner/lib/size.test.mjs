import { test } from 'node:test'
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'
import { displayWidth } from './size.mjs'
import { TMP_DIR } from './paths.mjs'

test('the display width is half the pixel width (every shot is captured at 2x)', async () => {
	const dir = join(TMP_DIR, 'test')
	mkdirSync(dir, { recursive: true })
	const f = join(dir, 'popover.webp')
	await sharp({ create: { width: 864, height: 836, channels: 3, background: '#ffffff' } }).webp().toFile(f)
	assert.equal(await displayWidth(f), 432)
})

import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { newContext, VIEWPORT } from './session.mjs'
import { makeHelpers } from './helpers.mjs'
import { guardWrites } from './guard.mjs'
import { summarizeError } from './errors.mjs'

export class SceneError extends Error {
	constructor(sceneId, step, message) {
		super(`${sceneId} [${step}]: ${message}`)
		this.sceneId = sceneId
		this.step = step
	}
}

function clamp(r, pad = 0) {
	const x = Math.max(0, Math.round(r.x - pad))
	const y = Math.max(0, Math.round(r.y - pad))
	return {
		x,
		y,
		width: Math.min(VIEWPORT.width - x, Math.round(r.width + 2 * pad)),
		height: Math.min(VIEWPORT.height - y, Math.round(r.height + 2 * pad)),
	}
}

async function clipFor(page, h, frame) {
	if (frame.type === 'full') return undefined
	if (frame.type === 'clip') return clamp(frame)
	const box = frame.type === 'element' ? await frame.locate(page).boundingBox() : await frame.box(page, h)
	if (!box) throw new Error('frame target not found')
	return clamp(box, frame.pad ?? 0)
}

// The clock is frozen at noon New York time on `date`, for captures and replays alike, so a
// replay renders the same "today" as the original capture.
export async function shootScene(browser, { scene }, { date, outDir }) {
	mkdirSync(outDir, { recursive: true })
	const context = await newContext(browser)
	const page = await context.newPage()
	const h = makeHelpers()
	let step = 'guard'
	try {
		const blocked = await guardWrites(page)
		step = 'clock'
		await page.clock.setFixedTime(new Date(`${date}T16:00:00Z`))
		step = 'setup'
		await scene.setup(page, h)
		step = 'frame'
		await h.hideChrome(page)
		await h.parkMouse(page)
		await h.settle(page, 400)
		const out = []
		for (const shot of scene.shots) {
			step = `shot ${shot.file}`
			const png = join(outDir, shot.file.replaceAll('/', '__').replace(/\.webp$/, '.png'))
			await page.screenshot({ path: png, clip: await clipFor(page, h, shot.frame), scale: 'device', animations: 'disabled', caret: 'hide' })
			out.push({ file: shot.file, png })
		}
		step = 'guard'
		if (blocked.length) throw new Error(`the scene tried to change data (${[...new Set(blocked)].join(', ')}); nothing was saved`)
		return out
	} catch (e) {
		throw new SceneError(scene.id, step, summarizeError(e.message))
	} finally {
		if (scene.teardown) await scene.teardown(page, h).catch(() => {})
		await context.close()
	}
}

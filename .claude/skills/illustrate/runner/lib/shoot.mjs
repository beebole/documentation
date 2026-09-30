import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { newContext, VIEWPORT } from './session.mjs'
import { makeHelpers } from './helpers.mjs'
import { guardWrites } from './guard.mjs'
import { summarizeError } from './errors.mjs'
import { composeLens } from './lens.mjs'
import { apiClient } from './fixtures.mjs'
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

export class SceneError extends Error {
	constructor(sceneId, step, message) {
		super(`${sceneId} [${step}]: ${message}`)
		this.sceneId = sceneId
		this.step = step
	}
}

function clamp(r, pad = 0, vp = VIEWPORT) {
	const x = Math.max(0, Math.round(r.x - pad))
	const y = Math.max(0, Math.round(r.y - pad))
	return {
		x,
		y,
		width: Math.min(vp.width - x, Math.round(r.width + 2 * pad)),
		height: Math.min(vp.height - y, Math.round(r.height + 2 * pad)),
	}
}

async function clipFor(page, h, frame, vp) {
	if (frame.type === 'full') return undefined
	if (frame.type === 'clip') return clamp(frame, 0, vp)
	const box = frame.type === 'element' ? await frame.locate(page).boundingBox() : await frame.box(page, h)
	if (!box) throw new Error('frame target not found')
	return clamp(box, frame.pad ?? 0, vp)
}

// The clock is frozen at noon New York time on `date`, for captures and replays alike, so a
// replay renders the same "today" as the original capture.
// `prepare` (permanent data a capture needs, e.g. approving the week it shows) runs when
// capturing or previewing, never when replaying: a replay must see the data as the capture left it.
export async function shootScene(browser, { scene }, { date, outDir, capturing = false }) {
	mkdirSync(outDir, { recursive: true })
	// A scene with a lens is captured once at 4x: the magnifier needs the extra pixels, and its
	// other shots are scaled back to 2x so every published image keeps the same scale.
	const hasLens = scene.shots.some((s) => s.frame.type === 'lens')
	const vp = scene.viewport ?? VIEWPORT
	const context = await newContext(browser, { scale: hasLens ? 4 : 2, viewport: vp, signedOut: scene.signedOut })
	const page = await context.newPage()
	const h = makeHelpers()
	let step = 'guard'
	let api = null
	let fixtureState
	try {
		if (capturing && scene.prepare) {
			step = 'prepare'
			api = api ?? (await apiClient())
			await scene.prepare(api, { date })
		}
		if (scene.fixture) {
			step = 'fixture up'
			api = api ?? (await apiClient())
			fixtureState = await scene.fixture.up(api, { date })
		}
		step = 'guard'
		const blocked = await guardWrites(page)
		step = 'clock'
		await page.clock.setFixedTime(new Date(`${date}T16:00:00Z`))
		step = 'setup'
		await scene.setup(page, h, fixtureState)
		step = 'frame'
		await h.hideChrome(page)
		// A scene may say where the mouse rests (to keep a hover-only control visible).
		if (scene.mouse) {
			const at = await scene.mouse(page, h)
			await page.mouse.move(at.x, at.y)
		} else await h.parkMouse(page)
		await h.settle(page, 400)
		const out = []
		const source = hasLens ? await page.screenshot({ scale: 'device', animations: 'disabled', caret: 'hide' }) : null
		for (const shot of scene.shots) {
			step = `shot ${shot.file}`
			const png = join(outDir, shot.file.replaceAll('/', '__').replace(/\.webp$/, '.png'))
			if (!hasLens) {
				await page.screenshot({ path: png, clip: await clipFor(page, h, shot.frame, vp), scale: 'device', animations: 'disabled', caret: 'hide' })
			} else if (shot.frame.type === 'lens') {
				const target = await (await shot.frame.target(page, h)).boundingBox()
				if (!target) throw new Error('lens target not found')
				const contextBox = clamp(shot.frame.context ?? { x: 0, y: 0, ...vp }, 0, vp)
				writeFileSync(png, await composeLens(source, { context: contextBox, target, radius: shot.frame.radius }))
			} else {
				const c = (await clipFor(page, h, shot.frame, vp)) ?? { x: 0, y: 0, ...vp }
				await sharp(source).extract({ left: c.x * 4, top: c.y * 4, width: c.width * 4, height: c.height * 4 }).resize(c.width * 2, c.height * 2).png().toFile(png)
			}
			out.push({ file: shot.file, png })
		}
		step = 'guard'
		if (blocked.length) throw new Error(`the scene tried to change data (${[...new Set(blocked)].join(', ')}); nothing was saved`)
		return out
	} catch (e) {
		throw new SceneError(scene.id, step, summarizeError(e.message))
	} finally {
		if (scene.teardown) await scene.teardown(page, h).catch(() => {})
		if (api && scene.fixture) await scene.fixture.down(api, fixtureState).catch((e) => console.error(`fixture down failed for ${scene.id}: ${e.message}`))
		await context.close()
	}
}

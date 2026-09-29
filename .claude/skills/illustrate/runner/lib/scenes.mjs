import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { SCENES_DIR, REPO_ROOT } from './paths.mjs'

const FRAMES = ['full', 'element', 'box', 'clip']

export function validateScene(s, file) {
	const where = `${relative(REPO_ROOT, file)} → ${s?.id ?? '?'}`
	if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s?.id ?? '')) throw new Error(`${where}: id must be kebab-case`)
	if (!/^\d{4}-\d{2}-\d{2}$/.test(s.capturedAt ?? '')) throw new Error(`${where}: capturedAt must be YYYY-MM-DD`)
	if (typeof s.datesMatter !== 'boolean') throw new Error(`${where}: datesMatter must be true or false`)
	if (!['auto', 'guided'].includes(s.mode)) throw new Error(`${where}: mode must be auto or guided`)
	if (typeof s.setup !== 'function') throw new Error(`${where}: setup must be a function`)
	if (!Array.isArray(s.shots) || s.shots.length === 0) throw new Error(`${where}: shots must be a non-empty list`)
	for (const shot of s.shots) {
		if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*\.webp$/.test(shot.file ?? '')) throw new Error(`${where}: shot file must be a relative .webp path under help/images`)
		if (!FRAMES.includes(shot.frame?.type)) throw new Error(`${where}: frame type must be one of ${FRAMES.join(', ')}`)
	}
}

function sceneFiles(dir = SCENES_DIR) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
		d.isDirectory() ? sceneFiles(join(dir, d.name)) : d.name.endsWith('.mjs') ? [join(dir, d.name)] : []
	)
}

export async function loadScenes(target = 'all') {
	const entries = []
	const ids = new Set()
	for (const file of sceneFiles()) {
		const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`)
		for (const scene of mod.scenes) {
			validateScene(scene, file)
			if (ids.has(scene.id)) throw new Error(`Duplicate scene id ${scene.id}`)
			ids.add(scene.id)
			entries.push({ file, page: mod.page, scene })
		}
	}
	if (target === 'all') return entries
	const picked = entries.filter((e) => e.scene.id === target || e.page === target || e.page === `help/${target}`)
	if (!picked.length) throw new Error(`No scene or page matches "${target}"`)
	return picked
}

// Scenes keep `id` and `capturedAt` on consecutive lines, which is what makes this rewrite safe.
export function setCapturedAt(file, id, date) {
	const text = readFileSync(file, 'utf8')
	const re = new RegExp(`(id: '${id}',\\s*\\n\\s*capturedAt: ')\\d{4}-\\d{2}-\\d{2}(')`)
	if (!re.test(text)) throw new Error(`capturedAt for ${id} not found in ${file}`)
	writeFileSync(file, text.replace(re, `$1${date}$2`))
}

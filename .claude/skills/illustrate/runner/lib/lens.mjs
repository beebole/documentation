import sharp from 'sharp'

// A lens shot: the context area at the usual 2x, and a round magnifier showing the target from
// the 4x capture (so twice the size, still sharp), with an orange ring around the real control
// and a line to the magnifier. Geometry is in CSS pixels of the page; the output is 2x.
export const LENS_RADIUS = 64 // CSS px of page area shown in the magnifier (it appears at 2x)
export const ACCENT = '#ea580c'
const SOURCE_SCALE = 4
const OUT_SCALE = 2
const MARGIN = 12

const centre = (r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 })
export const ringRadius = (target) => Math.max(target.width, target.height) / 2 + 4

// Lens centre (CSS px): the first direction, clockwise from below-right, where the whole
// magnifier fits in the context and stays clear of the target's ring.
export function placeLens(context, target, radius = LENS_RADIUS) {
	const t = centre(target)
	const shown = radius * OUT_SCALE // on-screen radius of the magnifier, in CSS px of the base
	const distance = shown + ringRadius(target) + 40
	const angles = [45, 0, 90, 135, 315, 180, 270, 225]
	for (const a of angles) {
		const c = { x: t.x + Math.cos((a * Math.PI) / 180) * distance, y: t.y + Math.sin((a * Math.PI) / 180) * distance }
		const inside =
			c.x - shown - MARGIN >= context.x &&
			c.x + shown + MARGIN <= context.x + context.width &&
			c.y - shown - MARGIN >= context.y &&
			c.y + shown + MARGIN <= context.y + context.height
		if (inside) return c
	}
	throw new Error('the context is too small to place a lens next to the target')
}

// The source square around the target, clamped to the capture and padded with white where the
// target sits near an edge.
async function magnified(sourcePng, target, radius) {
	const meta = await sharp(sourcePng).metadata()
	const t = centre(target)
	const size = radius * 2 * SOURCE_SCALE
	const want = { left: Math.round((t.x - radius) * SOURCE_SCALE), top: Math.round((t.y - radius) * SOURCE_SCALE) }
	const left = Math.max(0, want.left)
	const top = Math.max(0, want.top)
	const width = Math.min(meta.width, want.left + size) - left
	const height = Math.min(meta.height, want.top + size) - top
	const piece = await sharp(sourcePng).extract({ left, top, width, height }).png().toBuffer()
	const square = await sharp({ create: { width: size, height: size, channels: 4, background: '#ffffff' } })
		.composite([{ input: piece, left: left - want.left, top: top - want.top }])
		.png()
		.toBuffer()
	const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`)
	return sharp(square).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
}

export async function composeLens(sourcePng, { context, target, radius = LENS_RADIUS }) {
	const W = context.width * OUT_SCALE
	const H = context.height * OUT_SCALE
	const base = await sharp(sourcePng)
		.extract({ left: context.x * SOURCE_SCALE, top: context.y * SOURCE_SCALE, width: context.width * SOURCE_SCALE, height: context.height * SOURCE_SCALE })
		.resize(W, H)
		.png()
		.toBuffer()
	const out = (p) => ({ x: (p.x - context.x) * OUT_SCALE, y: (p.y - context.y) * OUT_SCALE })
	const lensC = out(placeLens(context, target, radius))
	const t = out(centre(target))
	const r = radius * OUT_SCALE * OUT_SCALE // magnifier radius in output px
	const tr = ringRadius(target) * OUT_SCALE
	const a = Math.atan2(lensC.y - t.y, lensC.x - t.x)
	const under = Buffer.from(`<svg width="${W}" height="${H}">
		<defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.28"/></filter></defs>
		<line x1="${t.x + Math.cos(a) * tr}" y1="${t.y + Math.sin(a) * tr}" x2="${lensC.x - Math.cos(a) * r}" y2="${lensC.y - Math.sin(a) * r}" stroke="${ACCENT}" stroke-width="4"/>
		<circle cx="${t.x}" cy="${t.y}" r="${tr}" fill="none" stroke="${ACCENT}" stroke-width="4"/>
		<circle cx="${lensC.x}" cy="${lensC.y}" r="${r + 3}" fill="#fff" filter="url(#s)"/>
	</svg>`)
	const rim = Buffer.from(`<svg width="${W}" height="${H}"><circle cx="${lensC.x}" cy="${lensC.y}" r="${r + 1}" fill="none" stroke="${ACCENT}" stroke-width="5"/></svg>`)
	const lens = await magnified(sourcePng, target, radius)
	return sharp(base)
		.composite([{ input: under }, { input: lens, left: Math.round(lensC.x - r), top: Math.round(lensC.y - r) }, { input: rim }])
		.png()
		.toBuffer()
}

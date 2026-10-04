import sharp from 'sharp'
import pixelmatch from 'pixelmatch'

export const THRESHOLD = 0.1
// Replays of runner-made captures are pixel-identical, so the tolerance is an absolute count:
// a renamed one-word label is ~1,000 device pixels; 100 absorbs isolated rendering jitter.
export const MIN_DIFF_PIXELS = 100

async function decode(path) {
	const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
	return { data, width: info.width, height: info.height }
}

// Paint the ignored regions the same in both images, so data that moves between captures
// (figures to date, a list whose order varies) does not count as a change.
function blank(img, rects) {
	for (const r of rects) {
		const x0 = Math.max(0, Math.floor(r.x))
		const y0 = Math.max(0, Math.floor(r.y))
		const x1 = Math.min(img.width, Math.ceil(r.x + r.width))
		const y1 = Math.min(img.height, Math.ceil(r.y + r.height))
		for (let y = y0; y < y1; y++) img.data.fill(0, (y * img.width + x0) * 4, (y * img.width + x1) * 4)
	}
}

// Compare a published image with a new candidate. Both are decoded to RGBA; WebP noise is
// absorbed by pixelmatch's colour threshold, real changes show up as differing pixels.
// `ignore` lists regions in image pixels (the shot's `ignore` areas) left out of the comparison.
export async function compareImages(publishedPath, candidatePath, { diffPath, ignore = [] } = {}) {
	const a = await decode(publishedPath)
	const b = await decode(candidatePath)
	if (a.width !== b.width || a.height !== b.height) {
		return { status: 'changed', reason: 'size', ratio: 1, diffPixels: a.width * a.height }
	}
	blank(a, ignore)
	blank(b, ignore)
	const diff = diffPath ? Buffer.alloc(a.data.length) : null
	const diffPixels = pixelmatch(a.data, b.data, diff, a.width, a.height, { threshold: THRESHOLD })
	const ratio = diffPixels / (a.width * a.height)
	if (diff && diffPixels > 0) {
		await sharp(diff, { raw: { width: a.width, height: a.height, channels: 4 } }).png().toFile(diffPath)
	}
	return { status: diffPixels > MIN_DIFF_PIXELS ? 'changed' : 'same', ratio, diffPixels }
}

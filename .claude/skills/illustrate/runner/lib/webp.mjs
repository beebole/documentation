import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'

export const MAX_BYTES = 200 * 1024

// Same settings as the rest of the docs pipeline: cwebp -q 80, fall back to -q 60 above 200 KB.
export function encodeWebp(pngPath, webpPath) {
	for (const quality of [80, 60]) {
		execFileSync('cwebp', ['-quiet', '-q', String(quality), pngPath, '-o', webpPath])
		const bytes = statSync(webpPath).size
		if (bytes <= MAX_BYTES || quality === 60) return { quality, bytes }
	}
}

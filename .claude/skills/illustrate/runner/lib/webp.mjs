import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'

export const MAX_BYTES = 200 * 1024

// Same settings as the rest of the docs pipeline: cwebp -q 80, falling back to -q 60 then -q 45
// while the file is above 200 KB (the most colourful full screens need the last step).
export function encodeWebp(pngPath, webpPath) {
	const ladder = [80, 60, 45]
	for (const quality of ladder) {
		execFileSync('cwebp', ['-quiet', '-q', String(quality), pngPath, '-o', webpPath])
		const bytes = statSync(webpPath).size
		if (bytes <= MAX_BYTES || quality === ladder.at(-1)) return { quality, bytes }
	}
}

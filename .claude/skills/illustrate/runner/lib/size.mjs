import sharp from 'sharp'

// Every docs screenshot is captured at DPR 2, so its on-screen width is half its pixel width.
// Partial shots are placed with this width so they appear at the app's real size.
export async function displayWidth(path) {
	const { width } = await sharp(path).metadata()
	return Math.round(width / 2)
}

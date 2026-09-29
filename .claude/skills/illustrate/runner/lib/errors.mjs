// One readable line per broken scene: the error itself, plus the locator Playwright was
// waiting for (it sits in the call log, not on the first line).
export function summarizeError(message) {
	const lines = String(message).split('\n')
	const waiting = lines.find((l) => /^\s*-\s*waiting for /.test(l))
	return waiting ? `${lines[0]} (${waiting.replace(/^\s*-\s*/, '')})` : lines[0]
}

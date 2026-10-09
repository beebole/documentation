// Scenes for help/api/schema-explorer.mdx: the GraphiQL IDE served at /graphql.
export const page = 'help/api/schema-explorer.mdx'

const QUERY = `query {
  currentOrganisation {
    name
  }
  getProjects {
    name
  }
}
`

// A placeholder, never a real key: the published image shows it.
const HEADERS = `{
  "apikey": "YOUR_API_KEY"
}`

// GraphiQL 3 editors are CodeMirror 5 instances. The inactive tool editor (Variables when
// Headers is open) keeps its size and only carries a `hidden` class.
async function setEditor(page, container, value) {
	await page.evaluate(
		({ container, value }) => {
			const cm = document.querySelector(`${container} .graphiql-editor:not(.hidden) .CodeMirror, ${container}.graphiql-query-editor .CodeMirror`)
			if (!cm) throw new Error(`no editor in ${container}`)
			cm.CodeMirror.setValue(value)
		},
		{ container, value }
	)
}

export const scenes = [
	{
		id: 'api-graphiql',
		capturedAt: '2026-09-30',
		datesMatter: false,
		mode: 'auto',
		async setup(page, h) {
			await h.goto(page, '/graphql')
			await page.locator('.graphiql-query-editor .CodeMirror').waitFor()
			await setEditor(page, '.graphiql-query-editor', QUERY)
			// Run the query on the signed-in session, which needs its CSRF token as a header, then
			// show where an API key goes instead: neither the token nor a key ends up in the image.
			await page.getByRole('button', { name: 'Headers', exact: true }).click()
			const csrf = await page.evaluate(async () => {
				const r = await fetch('/graphql', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: '{ currentSession { csrftoken } }' }) })
				return (await r.json()).data.currentSession.csrftoken
			})
			await setEditor(page, '.graphiql-editor-tool', JSON.stringify({ csrftoken: csrf }))
			await page.getByRole('button', { name: 'Execute query (Ctrl-Enter)' }).click()
			await page.locator('.graphiql-response').getByText('AnyCompany').waitFor()
			await setEditor(page, '.graphiql-editor-tool', HEADERS)
			await page.getByRole('button', { name: 'Show Documentation Explorer' }).click()
			await page.getByText('Root Types').waitFor()
			await h.settle(page, 1000)
		},
		shots: [
			{
				file: 'api/graphiql-playground.webp',
				// The All Schema Types list follows the API's schema, which grows with most deploys:
				// replay leaves the type names out (its heading stays compared).
				ignore: (page) =>
					page
						.getByText('All Schema Types')
						.first()
						.evaluate((heading) => {
							let pane = heading.parentElement
							while (pane && !/doc-explorer/.test(String(pane.className))) pane = pane.parentElement
							const hb = heading.getBoundingClientRect()
							const pb = (pane ?? document.body).getBoundingClientRect()
							const bottom = Math.min(pb.bottom, window.innerHeight)
							return { x: pb.left, y: hb.bottom + 4, width: pb.width, height: bottom - hb.bottom - 4 }
						}),
				frame: { type: 'full' },
			},
		],
	},
]

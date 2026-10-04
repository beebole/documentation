// Scenes for help/integrations/webhooks.mdx.
export const page = 'help/integrations/webhooks.mdx'

// The documentation account has no webhook, and Add webhook creates one on the spot: the fixture
// adds one through the API for the capture and deletes it right after. Its address is on a
// reserved example domain, and nothing changes during the capture, so it never fires.
// The webhook mutations return the organisation's id, not the webhook's: the webhook is found by
// its name, and any leftover from an interrupted run is removed first.
const NAME = 'ERP sync'
const findWebhooks = async (api) =>
	((await api('{ currentOrganisation { integrations { webhooks { id name } } } }')).currentOrganisation.integrations?.webhooks ?? []).filter((w) => w.name === NAME)
const removeWebhooks = async (api) => {
	for (const w of await findWebhooks(api)) await api(`mutation($id: BeeboleId!) { deleteIntegrationWebhook(id: $id) { id } }`, { id: w.id })
}
const webhook = {
	async up(api) {
		await removeWebhooks(api)
		await api(`mutation($name: String!, $url: String!, $events: [String]!) { addIntegrationWebhook(name: $name, url: $url, events: $events) { id } }`, {
			name: NAME,
			url: 'https://erp.example.com/beebole/webhook',
			events: ['timeRecordUpdate', 'approvalEventUpdate', 'projectUpdate'],
		})
		return {}
	},
	async down(api) {
		await removeWebhooks(api)
	},
}

export const scenes = [
	{
		id: 'webhooks-config',
		capturedAt: '2026-10-01',
		datesMatter: false,
		mode: 'auto',
		fixture: webhook,
		async setup(page, h) {
			await h.goto(page, '/integrations')
			await page.getByText('Webhooks', { exact: true }).first().click()
			await page.getByText('ERP sync').first().waitFor()
			await h.settle(page, 1000)
			await page.getByText('ERP sync').first().click()
			await h.settle(page, 1500)
		},
		// From the description banner down to Add webhook.
		shots: [
			{
				file: 'integrations/webhooks-config.webp',
				frame: {
					type: 'box',
					pad: 16,
					box: async (page) => {
						const intro = await page.getByText(/Configure webhook endpoints/).first().boundingBox()
						const add = await page.getByText('Add webhook', { exact: true }).first().boundingBox()
						const card = await page.getByPlaceholder(/Add event/).first().boundingBox().catch(() => null)
						const right = Math.max(intro.x + intro.width, card ? card.x + card.width : 0)
						return { x: intro.x, y: intro.y, width: right - intro.x, height: add.y + add.height - intro.y }
					},
				},
			},
		],
	},
]

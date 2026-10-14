import { createAPIFileRoute } from '@tanstack/react-start/api'
import { getPropertySummary } from '@/lib/db'

export const GET = createAPIFileRoute('/api/check/$propertyId', async ({ request, params }) => {
  const env = (request as any).env ?? {}
  const summary = await getPropertySummary(env.DB, params.propertyId)
  if (!summary) return json({ error: 'Imóvel não encontrado.' }, 404)
  return json(summary)
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

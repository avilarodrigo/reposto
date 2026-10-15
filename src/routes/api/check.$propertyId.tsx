import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { getPropertySummary } from '@/lib/db'

export const Route = createFileRoute('/api/check/$propertyId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const summary = await getPropertySummary(env.DB, params.propertyId)
        if (!summary) return json({ error: 'Imóvel não encontrado.' }, 404)
        return json(summary)
      },
    },
  },
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

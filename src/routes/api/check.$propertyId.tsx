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
      POST: async ({ params, request }) => {
        try {
          const body = await request.json<{ items: Record<string, number> }>()
          const { items } = body

          if (!items || typeof items !== 'object') {
            return json({ error: 'Payload de atualização inválido.' }, 400)
          }

          // Executa a atualização atômica de cada item de estoque no Cloudflare D1
          const statements = Object.entries(items).map(([itemId, pctValue]) => 
            env.DB.prepare('UPDATE stock_items SET pct = ?, updated_at = datetime(\'now\') WHERE id = ?')
              .bind(Number(pctValue), itemId)
          )
          
          await env.DB.batch(statements)

          // Força a atualização do registro pai 'properties' para atualizar o timestamp global
          await env.DB.prepare('UPDATE properties SET updated_at = datetime(\'now\') WHERE id = ?')
            .bind(params.propertyId)
            .run()

          return json({ success: true, message: 'Estoque sincronizado com sucesso.' })
        } catch (err: any) {
          console.error('Erro ao atualizar níveis de estoque no D1:', err)
          return json({ error: 'Erro interno ao processar atualização.', message: err.message }, 500)
        }
      }
    },
  },
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

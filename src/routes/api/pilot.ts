import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { verifyJwt, getTokenFromRequest } from '@/lib/jwt'
import { createPilotLead, getPilotLeads } from '@/lib/db'

// Base única de leads do piloto.
// POST /api/pilot -> salva o lead do formulário (público, sem login)
// GET  /api/pilot -> lista os leads no painel admin (restrito)

export const Route = createFileRoute('/api/pilot')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
        if (!body || body.interest !== true) {
          return json({ message: 'Confirme o interesse em participar do piloto.' }, 400)
        }

        const name = String(body.name ?? '').trim()
        const whatsapp = String(body.whatsapp ?? '').replace(/\D/g, '')
        const properties = String(body.properties ?? '').trim()
        const neighborhoods = String(body.neighborhoods ?? '').trim()
        const currentSupply = String(body.currentSupply ?? '').trim() || null

        if (name.length < 2 || name.length > 120) return json({ message: 'Informe seu nome.' }, 400)
        if (whatsapp.length < 10 || whatsapp.length > 15) return json({ message: 'WhatsApp inválido.' }, 400)
        if (!properties || properties.length > 40) return json({ message: 'Selecione a quantidade de imóveis.' }, 400)
        if (neighborhoods.length < 2 || neighborhoods.length > 200) return json({ message: 'Informe os bairros onde ficam os imóveis.' }, 400)
        if (currentSupply && currentSupply.length > 500) return json({ message: 'Texto do abastecimento atual muito longo.' }, 400)

        await createPilotLead(env.DB, { name, whatsapp, properties, neighborhoods, currentSupply })
        return json({ ok: true }, 201)
      },

      GET: async ({ request }) => {
        const admin = await requireAdmin(request)
        if (admin instanceof Response) return admin

        const leads = await getPilotLeads(env.DB)
        return json({ leads })
      },
    },
  },
})

// Mesma regra de /api/admin: só admins veem a lista de leads.
async function requireAdmin(request: Request): Promise<{ email: string } | Response> {
  const token = getTokenFromRequest(request)
  if (!token) return json({ message: 'unauthorized' }, 401)

  const payload = await verifyJwt(token, env.JWT_SECRET)
  if (!payload) return json({ message: 'unauthorized' }, 401)

  const adminEmails = (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())

  if (payload.role !== 'admin' && !adminEmails.includes(payload.email.toLowerCase())) {
    return json({ message: 'forbidden' }, 403)
  }
  return payload
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

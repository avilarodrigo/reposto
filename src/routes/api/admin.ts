import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { verifyJwt, getTokenFromRequest } from '@/lib/jwt'
import {
  getAllHosts,
  createProperty,
  createUser,
  seedDemoProperties,
  createInvite,
  findUserByEmail,
} from '@/lib/db'
import { hashPassword } from '@/lib/password'

type AdminPayload = NonNullable<Awaited<ReturnType<typeof verifyJwt>>>

// Devolve o payload do admin autenticado ou uma Response de erro (401/403).
async function requireAdmin(request: Request): Promise<AdminPayload | Response> {
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

export const Route = createFileRoute('/api/admin')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await requireAdmin(request)
        if (admin instanceof Response) return admin

        const hosts = await getAllHosts(env.DB)
        return json({ hosts })
      },

      POST: async ({ request }) => {
        const admin = await requireAdmin(request)
        if (admin instanceof Response) return admin

        const body = await request.json<any>()

        switch (String(body.action ?? '')) {
         case 'create-invite': {
            const email = String(body.email ?? '').toLowerCase().trim()
            if (!email || !email.includes('@')) {
              return json({ message: 'E-mail inválido.' }, 400)
            }
            if (await findUserByEmail(env.DB, email)) {
              return json({ message: 'Este e-mail já tem conta.' }, 409)
            }
            const token = await createInvite(env.DB, email, 'host')
            const link = `${new URL(request.url).origin}/?token=${token}`
            return json({
              ok: true,
              link,
              message: 'Convite criado (válido por 7 dias). Envie o link ao anfitrião.',
            })
          }

          case 'create-host': {
            const email = String(body.email ?? '').toLowerCase().trim()
            const name = String(body.name ?? '').trim()
            const whatsapp = body.whatsapp ? String(body.whatsapp) : null
            if (!email || !name) return json({ message: 'E-mail e nome são obrigatórios.' }, 400)

            const tempPassword = crypto.randomUUID()
            const hashed = await hashPassword(tempPassword)
            const user = await createUser(env.DB, { email, name, password: hashed, role: 'host', whatsapp })
            return json({ ok: true, userId: user.id, message: 'Anfitrião cadastrado.' })
          }

          case 'create-property': {
            const hostId = String(body.hostId ?? '')
            const name = String(body.name ?? '').trim()
            const address = body.address ? String(body.address).trim() : null
            if (!hostId || !name) {
              return json({ message: 'Anfitrião e nome do imóvel são obrigatórios.' }, 400)
            }
            const id = await createProperty(env.DB, hostId, name, address)
            return json({ ok: true, propertyId: id, message: 'Imóvel cadastrado com o kit padrão.' })
          }

          case 'seed-demo': {
            const hostId = String(body.hostId ?? '')
            if (!hostId) return json({ message: 'hostId é obrigatório.' }, 400)
            await seedDemoProperties(env.DB, hostId)
            return json({ ok: true, message: 'Três imóveis fictícios criados.' })
          }

          default:
            return json({ message: 'Ação desconhecida.' }, 400)
        }
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

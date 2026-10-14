import { createAPIFileRoute } from '@tanstack/react-start/api'
import { verifyJwt, getTokenFromRequest } from '@/lib/jwt'
import { getAllHosts, createProperty, createUser, seedDemoProperties } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export const GET = createAPIFileRoute('/api/admin', async ({ request }) => {
  const env = (request as any).env ?? {}
  const token = getTokenFromRequest(request)
  if (!token) return json({ error: 'unauthorized' }, 401)
  const payload = await verifyJwt(token, env.JWT_SECRET)
  if (!payload) return json({ error: 'unauthorized' }, 401)
  const adminEmails = (env.ADMIN_EMAILS ?? '').split(',').map((e: string) => e.trim().toLowerCase())
  if (payload.role !== 'admin' && !adminEmails.includes(payload.email.toLowerCase())) return json({ error: 'forbidden' }, 403)
  const hosts = await getAllHosts(env.DB)
  return json({ hosts })
})

export const POST = createAPIFileRoute('/api/admin', async ({ request }) => {
  const env = (request as any).env ?? {}
  const token = getTokenFromRequest(request)
  if (!token) return json({ message: 'unauthorized' }, 401)
  const payload = await verifyJwt(token, env.JWT_SECRET)
  if (!payload) return json({ message: 'unauthorized' }, 401)
  const adminEmails = (env.ADMIN_EMAILS ?? '').split(',').map((e: string) => e.trim().toLowerCase())
  if (payload.role !== 'admin' && !adminEmails.includes(payload.email.toLowerCase())) return json({ message: 'forbidden' }, 403)

  const body = await request.json()
  switch (String(body.action ?? '')) {
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
      if (!hostId || !name) return json({ message: 'Anfitrião e nome do imóvel são obrigatórios.' }, 400)
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
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

import type { Config } from '@netlify/functions'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index.js'
import { properties, users } from '../../db/schema.js'
import { requireAdmin } from '../lib/auth.js'
import { createHost, createProperty, seedDemo } from '../lib/admin.js'

// Painel admin: cadastro de anfitriões e imóveis. Restrito a ADMIN_EMAILS.
// GET  /api/admin -> anfitriões com seus imóveis
// POST /api/admin -> { action: 'create-host' | 'create-property' | 'seed-demo', ... }

const json = (body: unknown, status = 200) => Response.json(body, { status })

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('create-host'),
    email: z.email(),
    name: z.string().trim().min(2).max(120),
    whatsapp: z.string().regex(/^\d{12,15}$/, 'Use só dígitos, com DDI (ex.: 5511999999999).').nullable(),
  }),
  z.object({
    action: z.literal('create-property'),
    hostId: z.uuid(),
    name: z.string().trim().min(2).max(120),
    address: z.string().trim().max(200).nullable(),
  }),
  z.object({ action: z.literal('seed-demo'), hostId: z.uuid() }),
])

export default async (req: Request) => {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  if (req.method === 'GET') {
    const hosts = await db.select().from(users).orderBy(users.createdAt)
    const rows = await db
      .select({ id: properties.id, hostId: properties.hostId, name: properties.name, address: properties.address, active: properties.active })
      .from(properties)
      .orderBy(properties.name)
    return json({
      hosts: hosts.map((h) => ({ ...h, properties: rows.filter((p) => p.hostId === h.id) })),
    })
  }

  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ error: 'invalid_body', message: parsed.error.issues[0]?.message }, 400)
  const body = parsed.data

  if (body.action === 'create-host') {
    const host = await createHost(body.email, body.name, body.whatsapp)
    return json({ host }, 201)
  }

  if (body.action === 'create-property') {
    const [host] = await db.select({ id: users.id }).from(users).where(eq(users.id, body.hostId)).limit(1)
    if (!host) return json({ error: 'host_not_found' }, 404)
    const { property, items } = await createProperty(body.hostId, body.name, body.address)
    return json({ property, items: items.length }, 201)
  }

  const [host] = await db.select({ id: users.id }).from(users).where(eq(users.id, body.hostId)).limit(1)
  if (!host) return json({ error: 'host_not_found' }, 404)
  const created = await seedDemo(body.hostId)
  return json({ created }, 201)
}

export const config: Config = {
  path: '/api/admin',
}

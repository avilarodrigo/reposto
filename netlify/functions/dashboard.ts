import type { Config } from '@netlify/functions'
import { getUser } from '@netlify/identity'
import { and, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { properties, users } from '../../db/schema.js'
import { summarizePortfolio, summarizeProperty, type PropertyStock } from '../../src/lib/stock.js'
import { selectKitItems } from '../lib/kit.js'

// GET /api/dashboard -> carteira do anfitrião logado. Exige login (Netlify Identity).

const json = (body: unknown, status = 200) => Response.json(body, { status })

// Localiza o anfitrião pelo login. No primeiro acesso, vincula o cadastro criado pelo admin
// (mesmo e-mail) ou cria um registro novo.
async function resolveHost(identityId: string, rawEmail: string, name: string | null) {
  const [linked] = await db.select().from(users).where(eq(users.identityId, identityId)).limit(1)
  if (linked) return linked

  const email = rawEmail.toLowerCase()
  const [byEmail] = email ? await db.select().from(users).where(eq(users.email, email)).limit(1) : []
  if (byEmail) {
    const [updated] = await db.update(users).set({ identityId }).where(eq(users.id, byEmail.id)).returning()
    return updated
  }

  const [created] = await db.insert(users).values({ identityId, email, name }).returning()
  return created
}

export default async (req: Request) => {
  if (req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405)

  const identity = await getUser()
  if (!identity) return json({ error: 'unauthorized' }, 401)

  const host = await resolveHost(identity.id, identity.email ?? '', identity.name ?? null)

  const rows = await db
    .select({ id: properties.id, name: properties.name, address: properties.address })
    .from(properties)
    .where(and(eq(properties.hostId, host.id), eq(properties.active, true)))
    .orderBy(properties.name)

  const itemsByProperty = await selectKitItems(rows.map((r) => r.id))
  const stock: PropertyStock[] = rows.map((r) => ({ ...r, items: itemsByProperty.get(r.id) ?? [] }))
  const summaries = stock.map(summarizeProperty)

  return json({ portfolio: summarizePortfolio(summaries), properties: summaries })
}

export const config: Config = {
  path: '/api/dashboard',
}

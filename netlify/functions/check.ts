import type { Config } from '@netlify/functions'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index.js'
import { alerts, properties, stockEvents, stockLevels, users } from '../../db/schema.js'
import { crossedBelow } from '../../src/lib/stock.js'
import { selectKitItems } from '../lib/kit.js'
import { sendLowStockAlert } from '../lib/whatsapp.js'

// Rota pública da diarista (sem login). Só aceita UUID válido, que é o segredo do QR Code.
// GET  /api/check/:propertyId  -> kit do imóvel com o nível atual de cada item
// POST /api/check/:propertyId  -> { levels: { [itemId]: pct } } grava só os itens tocados

const propertyIdSchema = z.uuid()
const updateSchema = z.object({
  levels: z.record(z.uuid(), z.number().int().min(0).max(100)),
})

const json = (body: unknown, status = 200) => Response.json(body, { status })

async function findActiveProperty(propertyId: string) {
  const [property] = await db
    .select({ id: properties.id, name: properties.name, address: properties.address, hostId: properties.hostId })
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.active, true)))
    .limit(1)
  return property ?? null
}

export default async (req: Request) => {
  const propertyId = new URL(req.url).pathname.split('/').at(-1) ?? ''
  if (!propertyIdSchema.safeParse(propertyId).success) return json({ error: 'not_found' }, 404)

  const property = await findActiveProperty(propertyId)
  if (!property) return json({ error: 'not_found' }, 404)

  if (req.method === 'GET') {
    const items = (await selectKitItems([propertyId])).get(propertyId) ?? []
    return json({ property: { id: property.id, name: property.name, address: property.address }, items })
  }

  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const parsed = updateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ error: 'invalid_body' }, 400)

  const before = (await selectKitItems([propertyId])).get(propertyId) ?? []
  const itemsById = new Map(before.map((item) => [item.id, item]))
  const now = new Date()
  const crossed: { itemId: string; name: string; pct: number }[] = []

  for (const [itemId, pct] of Object.entries(parsed.data.levels)) {
    const item = itemsById.get(itemId)
    if (!item) continue // item de outro imóvel ou inexistente: ignorado

    await db
      .insert(stockLevels)
      .values({ itemId, levelPct: pct, updatedAt: now })
      .onConflictDoUpdate({ target: stockLevels.itemId, set: { levelPct: pct, updatedAt: now } })
    await db.insert(stockEvents).values({ itemId, levelPct: pct, source: 'diarista' })

    if (crossedBelow(item.pct, pct, item.threshold)) crossed.push({ itemId, name: item.name, pct })
  }

  let alertStatus: 'enviado' | 'falhou' | null = null
  if (crossed.length) {
    // Um único aviso por check-in, com todos os itens que caíram abaixo do limite.
    const [host] = await db.select({ whatsapp: users.whatsapp }).from(users).where(eq(users.id, property.hostId)).limit(1)
    const result = host?.whatsapp
      ? await sendLowStockAlert(host.whatsapp, property.name, crossed)
      : { status: 'falhou' as const, detail: 'Anfitrião sem WhatsApp cadastrado' }

    alertStatus = result.status
    await db.insert(alerts).values(
      crossed.map((c) => ({
        itemId: c.itemId,
        levelPct: c.pct,
        status: result.status,
        providerMessageId: result.status === 'enviado' ? result.providerMessageId : null,
        detail: result.status === 'falhou' ? result.detail : null,
      })),
    )
  }

  const items = (await selectKitItems([propertyId])).get(propertyId) ?? []
  return json({ property: { id: property.id, name: property.name, address: property.address }, items, alert: alertStatus })
}

export const config: Config = {
  path: '/api/check/*',
}

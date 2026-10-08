import { db } from '../../db/index.js'
import { kitItems, properties, stockEvents, stockLevels, users } from '../../db/schema.js'
import { catalog, starterKit } from '../../src/data/catalog.js'

// Kit padrão aplicado a todo imóvel novo. Pode ser trocado por kit por imóvel depois.
export const kitTemplate = catalog
  .filter((s) => s.id in starterKit)
  .map((s, position) => ({ name: s.name, detail: s.detail, category: s.category, position }))

export async function createHost(email: string, name: string, whatsapp: string | null) {
  const [host] = await db
    .insert(users)
    .values({ email: email.toLowerCase(), name, whatsapp })
    .returning()
  return host
}

export async function createProperty(hostId: string, name: string, address: string | null) {
  const [property] = await db.insert(properties).values({ hostId, name, address }).returning()
  const items = await db
    .insert(kitItems)
    .values(kitTemplate.map((item) => ({ ...item, propertyId: property.id })))
    .returning()
  return { property, items }
}

// Imóveis fictícios para demonstração. Os níveis deixam dois deles em alerta.
const demoProperties = [
  { name: 'Apto 302 · Beira-mar', address: 'Av. Atlântica, 302', levels: [100, 90, 75, 100, 60, 80, 100, 50, 90, 70, 100] },
  { name: 'Casa 4 quartos · Jardim', address: 'Rua das Acácias, 118', levels: [10, 40, 25, 100, 20, 60, 90, 15, 100, 30, 80] },
  { name: 'Studio Centro', address: 'Rua XV de Novembro, 540', levels: [100, 100, 50, 75, 100, 90, 40, 100, 60, 100, 85] },
]

export async function seedDemo(hostId: string) {
  const created: string[] = []
  for (const demo of demoProperties) {
    const { property, items } = await createProperty(hostId, demo.name, demo.address)
    const now = new Date()
    for (const [i, item] of items.entries()) {
      const levelPct = demo.levels[i] ?? 100
      await db.insert(stockLevels).values({ itemId: item.id, levelPct, updatedAt: now })
      await db.insert(stockEvents).values({ itemId: item.id, levelPct, source: 'demo' })
    }
    created.push(property.name)
  }
  return created
}

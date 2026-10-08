import { eq, inArray, sql } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { kitItems, stockLevels } from '../../db/schema.js'
import type { StockItem } from '../../src/lib/stock.js'

/** Itens dos imóveis informados, com o nível atual (100 quando ainda não houve check-in). */
export async function selectKitItems(propertyIds: string[]) {
  if (!propertyIds.length) return new Map<string, StockItem[]>()

  const rows = await db
    .select({
      propertyId: kitItems.propertyId,
      id: kitItems.id,
      name: kitItems.name,
      detail: kitItems.detail,
      category: kitItems.category,
      threshold: kitItems.reorderThreshold,
      pct: sql<number>`coalesce(${stockLevels.levelPct}, 100)`,
      updatedAt: stockLevels.updatedAt,
    })
    .from(kitItems)
    .leftJoin(stockLevels, eq(stockLevels.itemId, kitItems.id))
    .where(inArray(kitItems.propertyId, propertyIds))
    .orderBy(kitItems.position)

  const byProperty = new Map<string, StockItem[]>()
  for (const { propertyId, updatedAt, ...item } of rows) {
    const list = byProperty.get(propertyId) ?? []
    list.push({ ...item, updatedAt: updatedAt?.toISOString() ?? null })
    byProperty.set(propertyId, list)
  }
  return byProperty
}

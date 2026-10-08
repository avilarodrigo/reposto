import { sql } from 'drizzle-orm'
import { boolean, check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Anfitrião. Cadastrado pelo admin com e-mail; `identityId` é preenchido no primeiro login,
// quando a conta Netlify Identity com o mesmo e-mail é vinculada.
export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  identityId: text('identity_id').unique(),
  email: text().notNull(),
  name: text(),
  // Destino dos alertas. Formato internacional, só dígitos (ex.: 5511999999999).
  whatsapp: text(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// `id` é o UUID impresso no QR Code: reposto.netlify.app/check/<id>.
export const properties = pgTable(
  'properties',
  {
    id: uuid().primaryKey().defaultRandom(),
    hostId: uuid('host_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    address: text(),
    active: boolean().notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('properties_host_idx').on(t.hostId)],
)

// Item do kit de um imóvel específico (o kit pode variar por endereço).
export const kitItems = pgTable(
  'kit_items',
  {
    id: uuid().primaryKey().defaultRandom(),
    propertyId: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    detail: text(),
    category: text().notNull(),
    position: integer().notNull().default(0),
    // Abaixo deste percentual o anfitrião é avisado.
    reorderThreshold: integer('reorder_threshold').notNull().default(30),
  },
  (t) => [
    index('kit_items_property_idx').on(t.propertyId),
    check('kit_items_threshold_range', sql`${t.reorderThreshold} between 0 and 100`),
  ],
)

// Estado atual de cada item (uma linha por item, sobrescrita a cada check-in).
export const stockLevels = pgTable(
  'stock_levels',
  {
    itemId: uuid('item_id')
      .primaryKey()
      .references(() => kitItems.id, { onDelete: 'cascade' }),
    levelPct: integer('level_pct').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check('stock_levels_pct_range', sql`${t.levelPct} between 0 and 100`)],
)

// Histórico append-only de check-ins. Base para estimar consumo por imóvel.
export const stockEvents = pgTable(
  'stock_events',
  {
    id: uuid().primaryKey().defaultRandom(),
    itemId: uuid('item_id')
      .notNull()
      .references(() => kitItems.id, { onDelete: 'cascade' }),
    levelPct: integer('level_pct').notNull(),
    source: text().notNull().default('diarista'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('stock_events_item_time_idx').on(t.itemId, t.createdAt)],
)

// Registro de cada aviso disparado. Serve para auditoria e para não repetir alertas.
export const alerts = pgTable(
  'alerts',
  {
    id: uuid().primaryKey().defaultRandom(),
    itemId: uuid('item_id')
      .notNull()
      .references(() => kitItems.id, { onDelete: 'cascade' }),
    levelPct: integer('level_pct').notNull(),
    channel: text().notNull().default('whatsapp'),
    status: text().notNull(), // 'enviado' | 'falhou'
    providerMessageId: text('provider_message_id'),
    detail: text(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('alerts_item_time_idx').on(t.itemId, t.createdAt)],
)

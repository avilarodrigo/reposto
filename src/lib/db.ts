import type { D1Database } from '@cloudflare/workers-types'
import { CATALOG } from '@/data/catalog'
import {
  summarizeProperty,
  summarizePortfolio,
  type PropertySummary,
  type PropertyStock,
  type StockItem,
} from '@/lib/stock'

export type Env = {
  DB: D1Database
  ASSETS: Fetcher
  JWT_SECRET: string
  ADMIN_EMAILS: string
  WHATSAPP_NUMBER: string
}

export type User = {
  id: string
  email: string
  name: string | null
  role: 'host' | 'admin'
  whatsapp: string | null
}

export async function findUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const row = await db.prepare('SELECT id, email, name, role, whatsapp FROM users WHERE email = ?').bind(email).first<User>()
  return row ?? null
}

export async function findUserById(db: D1Database, id: string): Promise<User | null> {
  const row = await db.prepare('SELECT id, email, name, role, whatsapp FROM users WHERE id = ?').bind(id).first<User>()
  return row ?? null
}

export async function getUserPassword(db: D1Database, id: string): Promise<string | null> {
  const row = await db.prepare('SELECT password FROM users WHERE id = ?').bind(id).first<{ password: string }>()
  return row?.password ?? null
}

export async function createUser(
  db: D1Database,
  data: { email: string; name: string; password: string; role: 'host' | 'admin'; whatsapp?: string | null },
): Promise<User> {
  const id = crypto.randomUUID()
  await db.prepare('INSERT INTO users (id, email, name, password, role, whatsapp) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, data.email, data.name, data.password, data.role, data.whatsapp ?? null).run()
  return { id, email: data.email, name: data.name, role: data.role, whatsapp: data.whatsapp ?? null }
}

export async function updateUserProfile(db: D1Database, id: string, data: { name?: string; password?: string }): Promise<void> {
  if (data.name) await db.prepare('UPDATE users SET name = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(data.name, id).run()
  if (data.password) await db.prepare('UPDATE users SET password = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(data.password, id).run()
}

export async function createInvite(db: D1Database, email: string, role: 'host' | 'admin' = 'host', ttlHours = 168): Promise<string> {
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString()
  await db.prepare('INSERT INTO invites (token, email, role, expires_at) VALUES (?, ?, ?, ?)').bind(token, email, role, expires).run()
  return token
}

export async function findInvite(db: D1Database, token: string) {
  return db.prepare('SELECT token, email, role, expires_at, accepted_at FROM invites WHERE token = ?').bind(token)
    .first<{ token: string; email: string; role: 'host' | 'admin'; expires_at: string; accepted_at: string | null }>()
}

export async function acceptInvite(db: D1Database, token: string): Promise<void> {
  await db.prepare('UPDATE invites SET accepted_at = datetime(\'now\') WHERE token = ?').bind(token).run()
}

export type PropertyRow = { id: string; user_id: string; name: string; address: string | null; active: number }

export async function createProperty(db: D1Database, userId: string, name: string, address: string | null): Promise<string> {
  const id = crypto.randomUUID()
  await db.prepare('INSERT INTO properties (id, user_id, name, address) VALUES (?, ?, ?, ?)').bind(id, userId, name, address).run()
  for (const sku of CATALOG) {
    await db.prepare('INSERT INTO stock_items (id, property_id, sku_id, name, detail, category, pct, threshold) VALUES (?, ?, ?, ?, ?, ?, 100, 30)')
      .bind(crypto.randomUUID(), id, sku.id, sku.name, sku.detail, sku.category).run()
  }
  return id
}

export async function getPropertiesByUser(db: D1Database, userId: string): Promise<PropertyRow[]> {
  const result = await db.prepare('SELECT id, user_id, name, address, active FROM properties WHERE user_id = ? ORDER BY name').bind(userId).all<PropertyRow>()
  return result.results
}

export async function getPropertyById(db: D1Database, propertyId: string): Promise<PropertyRow | null> {
  return db.prepare('SELECT id, user_id, name, address, active FROM properties WHERE id = ?').bind(propertyId).first<PropertyRow>()
}

export async function getStockItems(db: D1Database, propertyId: string): Promise<StockItem[]> {
  const result = await db.prepare('SELECT id, sku_id, name, detail, category, pct, threshold, updated_at FROM stock_items WHERE property_id = ? ORDER BY category, name').bind(propertyId).all<StockItem>()
  return result.results
}

export async function getDashboardData(db: D1Database, userId: string) {
  const properties = await getPropertiesByUser(db, userId)
  const summaries: PropertySummary[] = []
  for (const prop of properties) {
    const items = await getStockItems(db, prop.id)
    summaries.push(summarizeProperty({ id: prop.id, name: prop.name, address: prop.address, items }))
  }
  return { portfolio: summarizePortfolio(summaries), properties: summaries }
}

export async function getPropertySummary(db: D1Database, propertyId: string): Promise<PropertySummary | null> {
  const prop = await getPropertyById(db, propertyId)
  if (!prop) return null
  const items = await getStockItems(db, propertyId)
  return summarizeProperty({ id: prop.id, name: prop.name, address: prop.address, items })
}

export type HostWithProperties = {
  id: string; email: string; name: string | null; whatsapp: string | null; identityId: string | null
  properties: { id: string; name: string; address: string | null; active: boolean }[]
}

export async function getAllHosts(db: D1Database): Promise<HostWithProperties[]> {
  const users = await db.prepare("SELECT id, email, name, whatsapp FROM users WHERE role = 'host' ORDER BY name").all<User>()
  const hosts: HostWithProperties[] = []
  for (const u of users.results) {
    const props = await getPropertiesByUser(db, u.id)
    hosts.push({ id: u.id, email: u.email, name: u.name, whatsapp: u.whatsapp, identityId: u.id, properties: props.map((p) => ({ id: p.id, name: p.name, address: p.address, active: p.active === 1 })) })
  }
  return hosts
}

export async function seedDemoProperties(db: D1Database, userId: string): Promise<void> {
  const demos = [
    { name: 'Apto 302 · Beira-mar', address: 'Rua das Conchas, 302' },
    { name: 'Studio Centro', address: 'Av. Atlântica, 1205' },
    { name: 'Casa 4 quartos · Jardim', address: 'Rua das Acácias, 88' },
  ]
  for (const d of demos) await createProperty(db, userId, d.name, d.address)
}
// Reserva o convite de forma atômica: só uma requisição consegue.
export async function consumeInvite(db: D1Database, token: string): Promise<boolean> {
  const r = await db
    .prepare("UPDATE invites SET accepted_at = datetime('now') WHERE token = ? AND accepted_at IS NULL")
    .bind(token)
    .run()
  return (r.meta.changes ?? 0) === 1
}

// Devolve o convite caso a criação do usuário falhe.
export async function releaseInvite(db: D1Database, token: string): Promise<void> {
  await db.prepare('UPDATE invites SET accepted_at = NULL WHERE token = ?').bind(token).run()
}

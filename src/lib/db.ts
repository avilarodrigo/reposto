export async function consumeInvite(db: D1Database, token: string): Promise<boolean> {
  const r = await db
    .prepare('UPDATE invites SET accepted_at = ? WHERE token = ? AND accepted_at IS NULL')
    .bind(new Date().toISOString(), token)
    .run()
  return (r.meta.changes ?? 0) === 1
}

export async function releaseInvite(db: D1Database, token: string): Promise<void> {
  await db.prepare('UPDATE invites SET accepted_at = NULL WHERE token = ?').bind(token).run()
}

export async function createInvite(
  db: D1Database,
  input: { email: string; role: 'host' | 'admin'; createdBy: string },
): Promise<{ token: string; expiresAt: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const token = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  await db
    .prepare('INSERT INTO invites (token, email, role, expires_at, created_by) VALUES (?, ?, ?, ?, ?)')
    .bind(token, input.email, input.role, expiresAt, input.createdBy)
    .run()
  return { token, expiresAt }
}

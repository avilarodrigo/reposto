import { getUser } from '@netlify/identity'

// Admins são listados em ADMIN_EMAILS (separados por vírgula). Sem a variável, ninguém é admin.
export async function requireAdmin() {
  const user = await getUser()
  if (!user?.email) return { error: Response.json({ error: 'unauthorized' }, { status: 401 }) }

  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  if (!admins.includes(user.email.toLowerCase())) {
    return { error: Response.json({ error: 'forbidden' }, { status: 403 }) }
  }
  return { user }
}

export type AuthUser = {
  id: string
  email: string
  name: string | null
  role: 'host' | 'admin'
}

let cachedUser: AuthUser | null = null
let checked = false

export async function getUser(): Promise<AuthUser | null> {
  if (checked) return cachedUser
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' })
    if (!res.ok) { cachedUser = null; checked = true; return null }
    cachedUser = (await res.json()) as AuthUser
    checked = true
    return cachedUser
  } catch {
    cachedUser = null; checked = true; return null
  }
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? 'Credenciais inválidas.')
  }
  cachedUser = (await res.json()) as AuthUser
  checked = true
  return cachedUser
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
  cachedUser = null
  checked = true
}

export async function acceptInvite(token: string, password: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/accept-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ token, password }),
  })
  if (!res.ok) throw new Error('Convite inválido ou expirado.')
  cachedUser = (await res.json()) as AuthUser
  checked = true
  return cachedUser
}

export async function handleAuthCallback(): Promise<AuthUser | null> {
  const url = new URL(window.location.href)
  const token = url.searchParams.get('token')
  if (!token) return null
  const res = await fetch('/api/auth/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ token }),
  })
  if (!res.ok) return null
  cachedUser = (await res.json()) as AuthUser
  checked = true
  window.history.replaceState({}, '', url.pathname)
  return cachedUser
}

export async function updateUser(data: { name?: string; password?: string }): Promise<AuthUser> {
  const res = await fetch('/api/auth/update', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Não foi possível atualizar o perfil.')
  cachedUser = (await res.json()) as AuthUser
  return cachedUser
}

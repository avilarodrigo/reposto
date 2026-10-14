const enc = new TextEncoder()
const dec = new TextDecoder()

async function getKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usage)
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let bin = ''
  for (const b of arr) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(str: string): Uint8Array {
  const pad = '='.repeat((4 - (str.length % 4)) % 4)
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}

export type JwtPayload = {
  sub: string
  email: string
  name: string | null
  role: 'host' | 'admin'
  exp: number
}

export async function signJwt(
  payload: Omit<JwtPayload, 'exp'>,
  secret: string,
  ttlSeconds = 7 * 24 * 60 * 60,
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const fullPayload: JwtPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }
  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)))
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(fullPayload)))
  const data = `${headerB64}.${payloadB64}`
  const key = await getKey(secret, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return `${data}.${base64UrlEncode(sig)}`
}

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerB64, payloadB64, sigB64] = parts
  const data = `${headerB64}.${payloadB64}`
  const key = await getKey(secret, ['verify'])
  const sig = base64UrlDecode(sigB64)
  const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(data))
  if (!valid) return null
  const payload = JSON.parse(dec.decode(base64UrlDecode(payloadB64))) as JwtPayload
  if (payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}

export function getTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get('Cookie') ?? ''
  const match = cookie.match(/(?:^|;\s*)reposto-session=([^;]+)/)
  return match ? match[1] : null
}

export function sessionCookie(token: string, maxAgeSeconds = 7 * 24 * 60 * 60): string {
  return `reposto-session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`
}

export function clearSessionCookie(): string {
  return 'reposto-session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
}

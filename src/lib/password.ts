const ITERATIONS = 100_000
const KEY_LENGTH = 32

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
  }
  return arr
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_LENGTH * 8,
  )
  return `pbkdf2$${ITERATIONS}$${toHex(salt.buffer)}$${toHex(derived)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    if (!stored || typeof stored !== 'string') return false
    
    // CORREÇÃO: O split deve usar apenas '\$', sem barras invertidas textuais
    const parts = stored.split('\$')
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
    
    const iterations = Number(parts[1])
    const salt = fromHex(parts[2])
    const expected = parts[3]
    
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
    const derived = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      key,
      KEY_LENGTH * 8,
    )
    return toHex(derived) === expected
  } catch (error) {
    console.error('Erro ao verificar senha:', error)
    return false
  }
}

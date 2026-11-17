// Reseta a senha de um usuário (ou cria um novo admin) direto no D1.
//
// Uso:
//   node scripts/reset-admin-password.mjs "nova senha"                  # reseta admin@reposto.com (remote)
//   node scripts/reset-admin-password.mjs --email outro@x.com "senha"  # outro usuário
//   node scripts/reset-admin-password.mjs --new "senha"                # cria um novo admin
//   node scripts/reset-admin-password.mjs --local "senha"              # banco local (wrangler dev)
//   node scripts/reset-admin-password.mjs --dry-run "senha"            # só imprime o SQL
//
// A hash usa o mesmo formato de src/lib/password.ts:
// pbkdf2$100000$<salt hex>$<derived hex> (PBKDF2-SHA256, 32 bytes)

import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)

let email = 'admin@reposto.com'
let create = false
let local = false
let dryRun = false
let password = ''

for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === '--email') email = args[++i]?.toLowerCase() ?? email
  else if (a === '--new') create = true
  else if (a === '--local') local = true
  else if (a === '--dry-run') dryRun = true
  else if (!password) password = a
}

if (!password) {
  password = `reposto-${randomBytes(3).toString('hex')}`
  console.log(`Sem senha informada — gerando uma: ${password}`)
}

const salt = randomBytes(16)
const derived = pbkdf2Sync(password, salt, 100_000, 32, 'sha256')
const hash = `pbkdf2$100000$${salt.toString('hex')}$${derived.toString('hex')}`

const sql = create
  ? `INSERT INTO users (id, email, name, password, role) VALUES ('${randomUUID()}', '${email}', 'Admin', '${hash}', 'admin');`
  : `UPDATE users SET password = '${hash}' WHERE email = '${email}';`

console.log(`\nSQL:\n${sql}\n`)

if (dryRun) {
  console.log('dry-run: nada foi executado. Rode novamente sem --dry-run para aplicar.')
  process.exit(0)
}

const targetArgs = ['wrangler', 'd1', 'execute', 'reposto-db', local ? '--local' : '--remote', '--command', sql]
try {
  const out = execFileSync('npx', targetArgs, { stdio: 'pipe', encoding: 'utf8' })
  console.log(out.split('\n').filter((l) => l.trim()).slice(-6).join('\n'))
  console.log(`\n✅ Pronto. Entre em /admin com ${email} e a nova senha.`)
} catch (err) {
  console.error('\n❌ Falhou ao executar o wrangler:\n')
  console.error(err.stdout?.toString?.() ?? '')
  console.error(err.stderr?.toString?.() ?? err.message)
  console.error('\nDica: rode "npx wrangler login" uma vez (ou defina CLOUDFLARE_API_TOKEN) e tente de novo.')
  process.exit(1)
}

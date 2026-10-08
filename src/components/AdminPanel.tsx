import { getUser } from '@netlify/identity'
import { Loader2, Plus, Sparkles } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { LoginForm } from '@/components/HostDashboard'
import { LogOut, Loader2, TriangleAlert } from 'lucide-react'
import { getUser, login, logout } from '@netlify/identity'


type Property = { id: string; name: string; address: string | null; active: boolean }
type Host = { id: string; email: string; name: string | null; whatsapp: string | null; identityId: string | null; properties: Property[] }

const field = 'mt-1.5 w-full rounded-xl border border-fg/15 bg-page px-4 py-3 outline-none focus:border-brand'

/** Cadastro de anfitriões e imóveis. Acesso restrito a ADMIN_EMAILS (validado no servidor). */
export function AdminPanel() {
  const [auth, setAuth] = useState<'checking' | 'out' | 'in'>('checking')
  const [forbidden, setForbidden] = useState(false)
  const [hosts, setHosts] = useState<Host[] | null>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const api = async (body?: unknown) => {
    const res = await fetch('/api/admin', body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined)
    if (res.status === 401) {
      setAuth('out')
      throw new Error('Sessão expirada.')
    }
    if (res.status === 403) {
      setForbidden(true)
      throw new Error('Esta conta não é administradora.')
    }
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? data.error ?? String(res.status))
    return data
  }

  const load = () => api().then((d) => setHosts(d.hosts)).catch((e: Error) => setMessage({ tone: 'error', text: e.message }))

  useEffect(() => {
    getUser().then((user) => {
      if (!user) return setAuth('out')
      setAuth('in')
      load()
    })
  }, [])

  const run = async (body: unknown, success: string) => {
    setBusy(true)
    setMessage(null)
    try {
      await api(body)
      setMessage({ tone: 'ok', text: success })
      await load()
      return true
    } catch (e) {
      setMessage({ tone: 'error', text: `Não foi possível concluir: ${(e as Error).message}` })
      return false
    } finally {
      setBusy(false)
    }
  }

  const submitHost = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const whatsapp = String(f.get('whatsapp') ?? '').replace(/\D/g, '')
    const ok = await run(
      { action: 'create-host', email: f.get('email'), name: f.get('name'), whatsapp: whatsapp || null },
      'Anfitrião cadastrado. Ele entra no painel com o mesmo e-mail.',
    )
    if (ok) form.reset()
  }

  const submitProperty = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const ok = await run(
      { action: 'create-property', hostId: f.get('hostId'), name: f.get('name'), address: String(f.get('address') ?? '').trim() || null },
      'Imóvel cadastrado com o kit padrão. Gere o QR Code com o link abaixo.',
    )
    if (ok) form.reset()
  }

  if (auth === 'checking') return <Frame><Loader2 className="mx-auto h-6 w-6 animate-spin text-fg-muted" /></Frame>
  if (auth === 'out') return <Frame><LoginForm onLogin={() => { setAuth('in'); load() }} /></Frame>
  if (forbidden) {
    return (
      <Frame>
        <p className="mx-auto mt-16 max-w-sm rounded-3xl border border-fg/10 bg-surface p-7 text-center text-fg-soft">
          Esta conta não é administradora. Entre com um e-mail autorizado.
        </p>
      </Frame>
    )
  }

  const properties = hosts?.flatMap((h) => h.properties) ?? []

  return (
    <Frame>
      <header className="flex items-start justify-between gap-4">
        <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-fg-muted uppercase">Administração</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Clientes e imóveis</h1>
        <p className="mt-2 text-fg-soft">
          {hosts?.length ?? 0} anfitrião(ões) · {properties.length} imóvel(is)
        </p></div>
        <button
          type="button"
          onClick={async () => {
            await logout()
            setAuth('out')
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-fg/15 px-3 py-2 text-sm font-semibold transition hover:border-fg active:scale-95"
        >
          <LogOut className="h-3.5 w-3.5" /> Sair
        </button>
      </header>

      {message && (
        <p role="status" className={`mt-6 rounded-2xl px-4 py-3 text-sm font-medium ${message.tone === 'ok' ? 'bg-success/15 text-success' : 'bg-brand/10 text-brand'}`}>
          {message.text}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form onSubmit={submitHost} className="rounded-3xl border border-fg/10 bg-surface p-6">
          <h2 className="font-display text-xl font-semibold">Novo anfitrião</h2>
          <label className="mt-5 block text-sm font-medium">
            Nome
            <input name="name" required minLength={2} className={field} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            E-mail de login
            <input name="email" type="email" required className={field} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            WhatsApp para alertas (opcional)
            <input name="whatsapp" inputMode="tel" placeholder="5511999999999" className={field} />
          </label>
          <button type="submit" disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-inverse py-3 font-semibold text-inverse-fg transition active:scale-[0.98] disabled:opacity-50">
            <Plus className="h-4 w-4" /> Cadastrar anfitrião
          </button>
        </form>

        <form onSubmit={submitProperty} className="rounded-3xl border border-fg/10 bg-surface p-6">
          <h2 className="font-display text-xl font-semibold">Novo imóvel</h2>
          <label className="mt-5 block text-sm font-medium">
            Anfitrião
            <select name="hostId" required disabled={!hosts?.length} className={field}>
              {hosts?.map((h) => (
                <option key={h.id} value={h.id}>{h.name ?? h.email}</option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm font-medium">
            Nome do imóvel
            <input name="name" required minLength={2} placeholder="Apto 302 · Beira-mar" className={field} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Endereço (opcional)
            <input name="address" className={field} />
          </label>
          <button type="submit" disabled={busy || !hosts?.length} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-inverse py-3 font-semibold text-inverse-fg transition active:scale-[0.98] disabled:opacity-50">
            <Plus className="h-4 w-4" /> Cadastrar imóvel
          </button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">Carteira</h2>
        {!hosts ? (
          <Loader2 className="mt-4 h-6 w-6 animate-spin text-fg-muted" />
        ) : hosts.length === 0 ? (
          <p className="mt-4 text-fg-soft">Nenhum anfitrião cadastrado ainda.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {hosts.map((h) => (
              <li key={h.id} className="rounded-3xl border border-fg/10 bg-surface p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{h.name ?? h.email}</p>
                    <p className="text-sm text-fg-muted">
                      {h.email} · {h.identityId ? 'conta ativa' : 'aguardando primeiro login'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run({ action: 'seed-demo', hostId: h.id }, 'Três imóveis fictícios criados para demonstração.')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-fg/15 px-4 py-2 text-sm font-semibold transition hover:border-fg active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-brand" /> Gerar dados de demonstração
                  </button>
                </div>

                {h.properties.length > 0 && (
                  <ul className="mt-4 divide-y divide-fg/10 border-t border-fg/10">
                    {h.properties.map((p) => (
                      <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          {p.address && <p className="text-xs text-fg-muted">{p.address}</p>}
                        </div>
                        <a href={`/check/${p.id}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand underline-offset-4 hover:underline">
                          Link do QR Code
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </Frame>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-page px-5 py-10 text-fg md:px-8">
      <div className="mx-auto max-w-5xl">{children}</div>
    </main>
  )
}

import { LogOut, Loader2, TriangleAlert } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { getUser, login, logout } from '@netlify/identity'
import { updatedLabel, type PropertySummary } from '@/lib/stock'

type Dashboard = {
  portfolio: { activeProperties: number; alertProperties: number; averagePct: number | null }
  properties: PropertySummary[]
}

type Auth = 'checking' | 'out' | 'in'

/** Painel do anfitrião: visão da carteira e estoque de cada imóvel. Exige login. */
export function HostDashboard() {
  const [auth, setAuth] = useState<Auth>('checking')
  const [data, setData] = useState<Dashboard | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const loadDashboard = () =>
    fetch('/api/dashboard')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((body: Dashboard) => setData(body))
      .catch(() => setAuth('out'))

  useEffect(() => {
    getUser().then((user) => {
      if (!user) return setAuth('out')
      setAuth('in')
      loadDashboard()
    })
  }, [])

  if (auth === 'checking') return <Frame><Loader2 className="mx-auto h-6 w-6 animate-spin text-fg-muted" /></Frame>
  if (auth === 'out') return <Frame><LoginForm onLogin={() => { setAuth('in'); loadDashboard() }} /></Frame>
  if (!data) return <Frame><Loader2 className="mx-auto h-6 w-6 animate-spin text-fg-muted" /></Frame>

  const { portfolio, properties } = data

  return (
    <Frame>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-fg-muted uppercase">Painel do anfitrião</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Estoque da carteira</h1>
        </div>
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

      <section className="mt-8 grid grid-cols-3 gap-3">
        <Kpi value={portfolio.activeProperties} label="imóveis ativos" />
        <Kpi value={portfolio.alertProperties} label="em alerta" tone={portfolio.alertProperties ? 'alert' : undefined} />
        <Kpi value={portfolio.averagePct === null ? '—' : `${portfolio.averagePct}%`} label="estoque médio" />
      </section>

      {properties.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-fg/20 p-8 text-center text-fg-soft">
          Nenhum imóvel cadastrado ainda. Peça ao time Reposto para ativar o primeiro QR Code.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          {properties.map((p) => {
            const expanded = open === p.id
            const alert = p.status === 'repor'
            return (
              <li key={p.id} className="rounded-3xl border border-fg/10 bg-surface p-5 sm:p-6">
                <button type="button" onClick={() => setOpen(expanded ? null : p.id)} className="flex w-full items-start justify-between gap-4 text-left">
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl font-semibold">{p.name}</p>
                    <p className="mt-1 text-xs text-fg-muted">{updatedLabel(p.updatedAt)}</p>
                  </div>
                  <StatusBadge alert={alert} />
                </button>

                <div className="mt-5 flex items-center gap-4">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full origin-left rounded-full transition-transform duration-700 ${alert ? 'bg-brand' : 'bg-success'}`}
                      style={{ transform: `scaleX(${(p.averagePct ?? 0) / 100})` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-semibold tabular-nums">{p.averagePct ?? '—'}%</span>
                </div>

                {expanded && (
                  <ul className="mt-5 divide-y divide-fg/10 border-t border-fg/10">
                    {p.items.map((item) => {
                      const low = item.pct < item.threshold
                      return (
                        <li key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-fg-muted">{updatedLabel(item.updatedAt)}</p>
                          </div>
                          <span className={`text-sm font-semibold tabular-nums ${low ? 'text-brand' : 'text-fg-soft'}`}>{item.pct}%</span>
                          <div className="col-span-2 mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className={`h-full origin-left rounded-full ${low ? 'bg-brand' : 'bg-success'}`} style={{ transform: `scaleX(${item.pct / 100})` }} />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Frame>
  )
}

function StatusBadge({ alert }: { alert: boolean }) {
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${alert ? 'bg-brand/10 text-brand' : 'bg-success/15 text-success'}`}>
      {alert ? 'Repor em 1 dia' : 'Em dia'}
    </span>
  )
}

function Kpi({ value, label, tone }: { value: number | string; label: string; tone?: 'alert' }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <p className={`flex items-center gap-1.5 font-display text-2xl font-semibold tabular-nums sm:text-3xl ${tone === 'alert' ? 'text-brand' : ''}`}>
        {tone === 'alert' && <TriangleAlert className="h-5 w-5" />}
        {value}
      </p>
      <p className="mt-1 text-xs leading-snug text-fg-muted">{label}</p>
    </div>
  )
}

export function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    try {
      await login(String(form.get('email')), String(form.get('password')))
      onLogin()
    } catch {
      setError('E-mail ou senha inválidos.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-sm rounded-3xl border border-fg/10 bg-surface p-7">
      <h1 className="font-display text-2xl font-semibold">Entrar no painel</h1>
      <label className="mt-6 block text-sm font-medium">
        E-mail
        <input name="email" type="email" required autoComplete="email" className="mt-1.5 w-full rounded-xl border border-fg/15 bg-page px-4 py-3 outline-none focus:border-brand" />
      </label>
      <label className="mt-4 block text-sm font-medium">
        Senha
        <input name="password" type="password" required autoComplete="current-password" className="mt-1.5 w-full rounded-xl border border-fg/15 bg-page px-4 py-3 outline-none focus:border-brand" />
      </label>
      {error && <p className="mt-3 text-sm text-brand">{error}</p>}
      <button type="submit" disabled={busy} className="mt-6 w-full rounded-full bg-inverse py-3 font-semibold text-inverse-fg transition active:scale-[0.98] disabled:opacity-50">
        {busy ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-page px-5 py-10 text-fg md:px-8">
      <div className="mx-auto max-w-5xl">{children}</div>
    </main>
  )
}

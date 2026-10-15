import { LogOut, Loader2, TriangleAlert, ArrowLeft } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { getUser, login, logout } from '@/lib/auth'
import { updatedLabel, type PropertySummary } from '@/lib/stock'
import { ThemeToggle } from '@/components/ThemeToggle'

type Dashboard = {
  portfolio: { activeProperties: number; alertProperties: number; averagePct: number | null }
  properties: PropertySummary[]
}

type Auth = 'checking' | 'out' | 'in'

export function HostDashboard() {
  const [auth, setAuth] = useState<Auth>('checking')
  const [data, setData] = useState<Dashboard | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const loadDashboard = () =>
    fetch('/api/dashboard', { cache: 'no-store' })
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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={async () => { await logout(); setAuth('out') }}
            className="inline-flex items-center gap-1.5 rounded-full border border-fg/15 px-3 py-2 text-sm font-semibold transition hover:border-fg active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
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
            const lastUpdated = p.updatedAt || (p as any).updated_at

            return (
              <li key={p.id} className="rounded-3xl border border-fg/10 bg-surface p-5 sm:p-6">
                <button type="button" onClick={() => setOpen(expanded ? null : p.id)} className="flex w-full items-start justify-between gap-4 text-left">
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl font-semibold">{p.name}</p>
                    <p className="mt-1 text-xs text-fg-muted">{lastUpdated ? updatedLabel(lastUpdated) : "Atualização pendente"}</p>
                  </div>
                  <StatusBadge alert={alert} />

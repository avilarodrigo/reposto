import { CheckCircle2, Loader2, Package } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { STOCK_OPTIONS, isLow, type StockItem } from '@/lib/stock'

type CheckResponse = {
  property: { id: string; name: string; address: string | null }
  items: StockItem[]
  alert?: 'enviado' | 'falhou' | null
}

type Status = 'loading' | 'ready' | 'saving' | 'saved' | 'not_found' | 'error'

/**
 * Tela da diarista, aberta pelo QR Code do armário. Sem login.
 * Só os itens que ela marcar são enviados, então check-ins parciais não apagam o resto.
 */
export function CheckForm({ propertyId }: { propertyId: string }) {
  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<CheckResponse | null>(null)
  const [levels, setLevels] = useState<Record<string, number>>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/check/${propertyId}`)
      .then(async (res) => {
        if (res.status === 404) return setStatus('not_found')
        if (!res.ok) throw new Error(String(res.status))
        const body: CheckResponse = await res.json()
        if (cancelled) return
        setData(body)
        setLevels(Object.fromEntries(body.items.map((i) => [i.id, i.pct])))
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
    }
  }, [propertyId])

  const categories = useMemo(() => [...new Set(data?.items.map((i) => i.category) ?? [])], [data])

  const pick = (id: string, pct: number) => {
    setLevels((prev) => ({ ...prev, [id]: pct }))
    setTouched((prev) => new Set(prev).add(id))
  }

  const save = async () => {
    setStatus('saving')
    const payload = Object.fromEntries([...touched].map((id) => [id, levels[id]]))
    setError(false)
    try {
      const res = await fetch(`/api/check/${propertyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levels: payload }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const body: CheckResponse = await res.json()
      setData(body)
      setTouched(new Set())
      setStatus('saved')
    } catch {
      setStatus('ready')
      setError(true)
    }
  }

  if (status === 'not_found') {
    return <Shell><p className="text-lg font-medium">Este QR Code não está ativo.</p><p className="mt-2 text-fg-soft">Avise o anfitrião para atualizar o cadastro do imóvel.</p></Shell>
  }
  if (status === 'loading' || !data) {
    return <Shell><Loader2 className="mx-auto h-6 w-6 animate-spin text-fg-muted" /></Shell>
  }

  if (status === 'saved') {
    const low = data.items.filter(isLow).length
    return (
      <Shell>
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h1 className="mt-4 text-center font-display text-3xl font-semibold">Estoque salvo</h1>
        <p className="mt-3 text-center text-fg-soft">
          {low === 0
            ? 'Tudo certo por aqui. Obrigado!'
            : data.alert === 'enviado'
              ? `${low} item(ns) abaixo do limite. O anfitrião foi avisado pelo WhatsApp.`
              : `${low} item(ns) abaixo do limite. O aviso ao anfitrião não foi enviado, então ele será notificado pelo painel.`}
        </p>
        <button type="button" onClick={() => setStatus('ready')} className="mt-8 w-full rounded-full border border-fg/15 py-3 font-semibold transition active:scale-95">
          Voltar e revisar
        </button>
      </Shell>
    )
  }

  const saving = status === 'saving'
  return (
    <Shell footer={
      <div className="fixed inset-x-0 bottom-0 border-t border-fg/10 bg-page/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={save}
            disabled={saving || touched.size === 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-inverse py-4 font-semibold text-inverse-fg transition active:scale-[0.98] disabled:opacity-40"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Salvando…' : touched.size ? `Salvar ${touched.size} ${touched.size === 1 ? 'item' : 'itens'}` : 'Marque o que está acabando'}
          </button>
          {error && <p className="mt-2 text-center text-sm text-brand">Não foi possível salvar. Tente de novo.</p>}
        </div>
      </div>
    }>
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-fg-muted uppercase">
          <Package className="h-4 w-4" /> Reposição
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight font-semibold">{data.property.name}</h1>
        {data.property.address && <p className="mt-1 text-sm text-fg-muted">{data.property.address}</p>}
        <p className="mt-4 text-fg-soft">Toque no nível de cada item. Só o que você marcar será atualizado.</p>
      </header>

      <div className="mt-8 space-y-8 pb-32">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="mb-3 text-xs font-semibold tracking-[0.18em] text-fg-muted uppercase">{cat}</h2>
            <ul className="space-y-3">
              {data.items
                .filter((i) => i.category === cat)
                .map((item) => (
                  <li key={item.id} className={`rounded-2xl border bg-surface p-4 transition ${touched.has(item.id) ? 'border-brand/50' : 'border-fg/10'}`}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium">{item.name}</p>
                      {item.detail && <p className="shrink-0 text-xs text-fg-muted">{item.detail}</p>}
                    </div>
                    <div role="radiogroup" aria-label={item.name} className="mt-3 grid grid-cols-4 gap-2">
                      {STOCK_OPTIONS.map((opt) => {
                        const selected = levels[item.id] === opt.pct
                        return (
                          <button
                            key={opt.pct}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => pick(item.id, opt.pct)}
                            className={`rounded-xl px-1 py-2.5 text-xs font-semibold transition active:scale-95 ${
                              selected ? 'bg-inverse text-inverse-fg' : 'bg-muted/60 text-fg-soft hover:bg-muted'
                            }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </Shell>
  )
}

function Shell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-page text-fg">
      <div className="mx-auto max-w-lg px-5 pt-10 pb-8">{children}</div>
      {footer}
    </main>
  )
}

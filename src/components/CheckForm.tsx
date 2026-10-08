import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { type PropertySummary, updatedLabel } from '@/lib/stock'
import { ThemeToggle } from '@/components/ThemeToggle'

type Props = { propertyId: string }

/** Formulário de reposição de itens via QR Code. Público (sem autenticação). */
export function CheckForm({ propertyId }: Props) {
  const [data, setData] = useState<PropertySummary | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch(`/api/check/${propertyId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((body: PropertySummary) => setData(body))
      .catch((e) => setMessage({ tone: 'error', text: `Imóvel não encontrado (${e}).` }))
  }, [propertyId])

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!data) return

    const form = new FormData(e.currentTarget)
    const items = data.items
      .filter((_, i) => form.get(`item-${i}`) === 'on')
      .map((item) => {
        const qty = Number(form.get(`qty-${item.id}`)) || 1
        return `${qty}× ${item.name}`
      })

    if (items.length === 0) {
      setMessage({ tone: 'error', text: 'Selecione pelo menos um item.' })
      return
    }

    setBusy(true)

    const host = data
    const message = `Reposição para ${host.name}:\n\n${items.join('\n')}`
    const link = `https://wa.me/5511987654321?text=${encodeURIComponent(message)}`

    window.location.href = link
  }

  return (
    <main className="min-h-svh bg-page px-5 py-10 text-fg md:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold">Reposição</h1>
          <ThemeToggle />
        </div>

        {message && (
          <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${message.tone === 'ok' ? 'bg-success/15 text-success' : 'bg-brand/10 text-brand'}`}>
            {message.text}
          </div>
        )}

        {data && (
          <form onSubmit={submit} className="mt-6 space-y-6">
            <div className="rounded-3xl border border-fg/10 bg-surface p-6">
              <p className="text-sm text-fg-muted">Imóvel</p>
              <p className="mt-1 font-display text-2xl font-semibold">{data.name}</p>
              {data.address && <p className="mt-2 text-sm text-fg-soft">{data.address}</p>}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Itens em estoque</p>
              {data.items.map((item, idx) => {
                const low = item.pct < item.threshold
                return (
                  <label key={item.id} className="flex items-start gap-3 rounded-2xl border border-fg/10 bg-surface px-4 py-3 transition hover:border-fg/30">
                    <input
                      type="checkbox"
                      name={`item-${idx}`}
                      defaultChecked={low}
                      className="mt-0.5 h-5 w-5 cursor-pointer rounded border-fg/30 accent-brand"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="mt-1 text-xs text-fg-muted">{updatedLabel(item.updatedAt)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full origin-left rounded-full ${low ? 'bg-brand' : 'bg-success'}`} style={{ transform: `scaleX(${item.pct / 100})` }} />
                        </div>
                        <span className={`text-xs font-semibold tabular-nums ${low ? 'text-brand' : 'text-fg-soft'}`}>{item.pct}%</span>
                      </div>
                    </div>
                    <input
                      type="number"
                      name={`qty-${item.id}`}
                      defaultValue={1}
                      min={1}
                      max={99}
                      className="w-12 rounded border border-fg/15 bg-page px-2 py-1 text-center text-sm outline-none focus:border-brand"
                    />
                  </label>
                )
              })}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-brand py-4 font-semibold text-inverse-fg transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                </>
              ) : (
                <>
                  Enviar via WhatsApp <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {!data && !message && (
          <div className="mt-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-fg-muted" />
          </div>
        )}
      </div>
    </main>
  )
}

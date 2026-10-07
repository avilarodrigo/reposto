import { MessageCircle, Minus, Plus, RotateCcw, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MIN_ORDER, brl, catalog, starterKit } from '@/data/catalog'
import type { Category } from '@/data/catalog'
import { whatsappLink } from '@/lib/whatsapp'

const categories: Category[] = ['Banheiro', 'Cozinha', 'Limpeza', 'Café da manhã']
const frequencies = ['Semanal', 'Quinzenal', 'Mensal'] as const

function Stepper({ value, onChange, min = 0, max = 20, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-fg/15 bg-surface p-1">
      <button type="button" aria-label={`Diminuir ${label}`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-inverse hover:text-inverse-fg active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button type="button" aria-label={`Aumentar ${label}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-inverse hover:text-inverse-fg active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function KitBuilder() {
  const [qty, setQty] = useState<Record<string, number>>(starterKit)
  const [properties, setProperties] = useState(2)
  const [frequency, setFrequency] = useState<(typeof frequencies)[number]>('Quinzenal')

  const lines = useMemo(() => catalog.filter((s) => (qty[s.id] ?? 0) > 0).map((s) => ({ ...s, q: qty[s.id] })), [qty])
  const perProperty = lines.reduce((sum, l) => sum + l.price * l.q, 0)
  const total = perProperty * properties
  const belowMin = perProperty < MIN_ORDER
  const missingToMin = MIN_ORDER - perProperty

  const message = [
    'Olá! Quero montar meu kit de abastecimento.',
    '',
    `Imóveis: ${properties}`,
    `Frequência: ${frequency}`,
    '',
    'Itens por imóvel:',
    ...lines.map((l) => `• ${l.q}× ${l.name} (${l.detail}) — ${brl(l.price * l.q)}`),
    '',
    `Total por imóvel: ${brl(perProperty)}`,
    `Total do ciclo: ${brl(total)}`,
  ].join('\n')

  const set = (id: string, n: number) => setQty((prev) => ({ ...prev, [id]: n }))

  return (
    <section id="kit" className="relative bg-muted/60 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-14 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
          <h2 data-reveal className="font-display text-4xl leading-[1.02] font-semibold tracking-tight sm:text-6xl">
            Monte o kit de um imóvel. A gente replica para todos.
          </h2>
          <p data-reveal style={{ '--d': '120ms' } as React.CSSProperties} className="max-w-md text-lg leading-relaxed text-fg-soft">
            Treze itens essenciais, com preço por unidade à mostra. O pedido vai pronto para o WhatsApp e a gente confirma entrega e pagamento por lá.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          {/* Catalog */}
          <div data-reveal className="rounded-[28px] border border-fg/10 bg-surface p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setQty(starterKit)} className="inline-flex items-center gap-1.5 rounded-full bg-inverse px-4 py-2 text-sm font-semibold text-inverse-fg transition hover:opacity-90 active:scale-95">
                <Sparkles className="h-3.5 w-3.5 text-brand-soft" /> Kit check-in
              </button>
              <button type="button" onClick={() => setQty({})} className="inline-flex items-center gap-1.5 rounded-full border border-fg/15 px-4 py-2 text-sm font-semibold transition hover:border-fg active:scale-95">
                <RotateCcw className="h-3.5 w-3.5" /> Começar do zero
              </button>
            </div>
            <div className="space-y-8">
              {categories.map((cat) => (
                <div key={cat}>
                  <h3 className="mb-2 text-xs font-semibold tracking-[0.18em] text-fg-muted uppercase">{cat}</h3>
                  <ul className="divide-y divide-fg/8">
                    {catalog
                      .filter((s) => s.category === cat)
                      .map((s) => {
                        const q = qty[s.id] ?? 0
                        return (
                          <li key={s.id} className={`flex items-center justify-between gap-4 py-3 transition-opacity ${q ? '' : 'opacity-60 hover:opacity-100'}`}>
                            <div className="min-w-0">
                              <p className="font-medium">{s.name}</p>
                              <p className="text-sm text-fg-soft">
                                {s.detail} · {brl(s.price)}
                              </p>
                            </div>
                            <Stepper value={q} onChange={(n) => set(s.id, n)} label={s.name} max={10} />
                          </li>
                        )
                      })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <aside data-reveal style={{ '--d': '120ms' } as React.CSSProperties} className="rounded-[28px] bg-inverse p-6 text-inverse-fg shadow-[0_40px_80px_-40px_rgba(15,23,42,0.8)] sm:p-8 lg:sticky lg:top-24">
            <p className="text-xs font-semibold tracking-[0.18em] text-inverse-fg/60 uppercase">Seu pedido</p>

            <div className="mt-5 flex items-center justify-between gap-4">
              <label className="font-medium">Quantos imóveis?</label>
              <div className="text-fg">
                <Stepper value={properties} onChange={setProperties} min={1} max={50} label="imóveis" />
              </div>
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2 font-medium">Frequência</legend>
              <div className="grid grid-cols-3 gap-1 rounded-full bg-inverse-fg/10 p-1">
                {frequencies.map((f) => (
                  <button key={f} type="button" onClick={() => setFrequency(f)} aria-pressed={frequency === f} className={`rounded-full py-2 text-sm font-semibold transition ${frequency === f ? 'bg-surface text-fg' : 'text-inverse-fg/70 hover:text-inverse-fg'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </fieldset>

            <dl className="mt-7 space-y-3 border-t border-inverse-fg/15 pt-6">
              <div className="flex justify-between text-inverse-fg/75">
                <dt>Itens no kit</dt>
                <dd className="tabular-nums">{lines.reduce((n, l) => n + l.q, 0)}</dd>
              </div>
              <div className="flex justify-between text-inverse-fg/75">
                <dt>Por imóvel</dt>
                <dd className="tabular-nums">{brl(perProperty)}</dd>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <dt className="font-medium">Total do ciclo</dt>
                <dd className="font-display text-4xl tabular-nums">{brl(total)}</dd>
              </div>
            </dl>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-inverse-fg/10">
              <div className="h-full origin-left rounded-full bg-brand-soft transition-transform duration-500" style={{ transform: `scaleX(${Math.min(1, perProperty / MIN_ORDER)})` }} />
            </div>
            <p className={`mt-2 text-sm ${belowMin ? 'text-brand-soft' : 'text-inverse-fg/60'}`} role="status">
              {lines.length === 0
                ? 'Adicione itens para começar. Pedido mínimo de R$ 60 por imóvel.'
                : belowMin
                  ? `Faltam ${brl(missingToMin)} para o pedido mínimo por imóvel.`
                  : 'Pedido mínimo atingido. Entrega incluída.'}
            </p>

            {belowMin ? (
              <button type="button" disabled className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-inverse-fg/15 py-4 font-semibold text-inverse-fg/50">
                <MessageCircle className="h-5 w-5" /> Enviar pedido pelo WhatsApp
              </button>
            ) : (
              <a href={whatsappLink(message)} target="_blank" rel="noreferrer" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-success py-4 font-semibold text-white shadow-[0_14px_30px_-12px_rgba(31,168,85,0.9)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0">
                <MessageCircle className="h-5 w-5" /> Enviar pedido pelo WhatsApp
              </a>
            )}
            <p className="mt-3 text-center text-xs text-inverse-fg/50">Sem cobrança agora. Você confirma tudo na conversa.</p>
          </aside>
        </div>
      </div>
    </section>
  )
}

import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { segment, useSectionProgress } from '@/lib/scroll'

const steps = [
  {
    q: 'Quem percebe quando o papel acaba?',
    a: 'Geralmente a diarista, no meio da limpeza, com o próximo hóspede chegando em três horas.',
  },
  {
    q: 'Quem monta a lista e vai ao mercado?',
    a: 'Você, ou alguém da equipe, entre uma mensagem e outra. Às vezes em dois ou três mercados diferentes.',
  },
  {
    q: 'E como tudo chega em cada endereço?',
    a: 'Porta-malas cheio, vários imóveis, uma lista diferente para cada um. E sempre falta alguma coisa.',
  },
  {
    q: 'E se cada imóvel recebesse o próprio kit?',
    a: 'Já separado por endereço, no ciclo que você escolher. Você só confirma pelo WhatsApp.',
  },
]

const stock = [
  { name: 'Papel higiênico', start: 72, drop: 0.95 },
  { name: 'Café', start: 58, drop: 0.85 },
  { name: 'Detergente', start: 80, drop: 0.7 },
  { name: 'Saco de lixo', start: 46, drop: 0.9 },
  { name: 'Sabonete', start: 64, drop: 0.6 },
]

export function PainStory() {
  const [ref, p] = useSectionProgress<HTMLElement>()
  const step = Math.min(steps.length - 1, Math.floor(p * steps.length))
  const solved = step === steps.length - 1
  const drain = segment(p, 0.05, 0.72)

  const levels = stock.map((s) => (solved ? 100 : Math.max(4, s.start * (1 - drain * s.drop))))
  const missing = levels.filter((l) => l < 20).length

  return (
    <section id="problema" ref={ref} className="relative lg:h-[420vh]">
      <div className="bg-page py-20 lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:overflow-hidden lg:py-0 lg:pt-16">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:px-8">
          <div>
            <ol className="space-y-8 lg:hidden">
              {steps.map((s, i) => (
                <li key={s.q}>
                  <p className="text-sm font-semibold tracking-[0.18em] text-brand uppercase">{String(i + 1).padStart(2, '0')}</p>
                  <h2 className="mt-2 font-display text-[1.9rem] leading-[1.08] font-semibold tracking-tight">{s.q}</h2>
                  <p className="mt-3 text-base leading-relaxed text-fg-soft">{s.a}</p>
                </li>
              ))}
            </ol>

            <div className="hidden lg:block">
              <div className="mb-6 flex items-center gap-4 text-sm font-semibold tracking-[0.18em] uppercase">
                <span className="text-brand">
                  {String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                </span>
                <span className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <span key={i} className={`h-1 rounded-full bg-brand transition-all duration-500 ${i <= step ? 'w-8' : 'w-3 opacity-25'}`} />
                  ))}
                </span>
              </div>
              <div className="relative min-h-[18rem]">
                {steps.map((s, i) => (
                  <div
                    key={s.q}
                    className="absolute inset-0 transition-all duration-700"
                    style={{
                      opacity: i === step ? 1 : 0,
                      transform: `translateY(${i === step ? 0 : i < step ? -40 : 40}px)`,
                      pointerEvents: i === step ? 'auto' : 'none',
                    }}
                    aria-hidden={i !== step}
                  >
                    <h2 className="font-display text-5xl leading-[1.02] font-semibold tracking-tight lg:text-6xl">{s.q}</h2>
                    <p className="mt-5 max-w-lg text-lg leading-relaxed text-fg-soft">{s.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-fg/10 bg-surface p-5 text-fg shadow-[0_30px_60px_-30px_rgba(15,23,42,0.45)] sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-fg-muted uppercase">Estoque do imóvel</p>
                <p className="mt-1 font-display text-2xl font-semibold">Apto 302 · Beira-mar</p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-500 ${
                  solved ? 'bg-success/15 text-success' : missing > 0 ? 'bg-brand/15 text-brand' : 'bg-fg-muted/15 text-fg-muted'
                }`}
              >
                {solved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {solved ? 'Kit entregue' : missing > 0 ? `${missing} ${missing === 1 ? 'item' : 'itens'} em falta` : 'Acabando'}
              </span>
            </div>
            <ul className="space-y-3 sm:space-y-4">
              {stock.map((s, i) => {
                const level = levels[i]
                const low = level < 20
                return (
                  <li key={s.name}>
                    <div className="mb-1.5 flex justify-between text-sm font-medium">
                      <span>{s.name}</span>
                      <span className={`tabular-nums ${low && !solved ? 'text-brand' : 'text-fg-soft'}`}>{Math.round(level)}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-fg/8">
                      <div
                        className={`h-full origin-left rounded-full ${solved ? 'bg-success transition-transform duration-1000' : low ? 'bg-brand' : 'bg-fg-muted'}`}
                        style={{ transform: `scaleX(${level / 100})`, transitionDelay: solved ? `${i * 90}ms` : undefined }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="mt-6 hidden border-t border-fg/10 pt-4 text-sm text-fg-soft sm:block">
              {solved ? 'Próxima reposição agendada em 14 dias.' : 'Próximo check-in: hoje, 15h.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

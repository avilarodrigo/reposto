import { BellRing, CalendarClock, Gauge } from 'lucide-react'
import type { CSSProperties } from 'react'

const features = [
  {
    icon: Gauge,
    title: 'Nível de cada item',
    text: 'Veja quanto resta de papel, café e limpeza em cada imóvel, em porcentagem, sem precisar contar nada.',
  },
  {
    icon: BellRing,
    title: 'Aviso antes da falta',
    text: 'Quando um item chega perto do ponto de reposição, o alerta vai para o seu WhatsApp.',
  },
  {
    icon: CalendarClock,
    title: 'Reposição no ciclo certo',
    text: 'O consumo é estimado pelos check-ins de cada endereço, e a próxima entrega já sai calculada.',
  },
]

const properties = [
  { name: 'Apto 302 · Beira-mar', next: 'Próximo check-in em 3 dias', health: 82, status: 'Em dia' },
  { name: 'Casa 4 quartos · Jardim', next: 'Papel e café abaixo do ideal', health: 34, status: 'Repor em 1 dia' },
  { name: 'Studio Centro', next: 'Próximo check-in em 6 dias', health: 61, status: 'Em dia' },
  { name: 'Apto 1205 · Vista mar', next: 'Próximo check-in em 9 dias', health: 90, status: 'Em dia' },
]

const kpis = [
  { value: '4', label: 'imóveis ativos' },
  { value: '1', label: 'em alerta' },
  { value: '67%', label: 'estoque médio' },
]

export function StockDashboard() {
  return (
    <section id="painel" className="relative bg-muted/60 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div data-reveal>
            <p className="text-xs font-semibold tracking-[0.18em] text-fg-muted uppercase">Controle de estoque</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.02] font-semibold tracking-tight sm:text-6xl">
              O estoque de todos os imóveis, num painel só.
            </h2>
          </div>
          <p data-reveal style={{ '--d': '120ms' } as CSSProperties} className="max-w-md text-lg leading-relaxed text-fg-soft">
            Saiba o que está acabando em cada endereço antes do próximo hóspede. Você decide o que repor, e a gente cuida da entrega.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.85fr_1.4fr] lg:items-start">
          <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {features.map((f, i) => (
              <li key={f.title} data-reveal style={{ '--d': `${i * 90}ms` } as CSSProperties} className="rounded-[24px] bg-surface p-6">
                <f.icon className="h-6 w-6 text-brand" />
                <p className="mt-4 font-display text-xl font-semibold">{f.title}</p>
                <p className="mt-2 leading-relaxed text-fg-soft">{f.text}</p>
              </li>
            ))}
          </ul>

          <div data-reveal style={{ '--d': '160ms' } as CSSProperties} className="rounded-[28px] bg-inverse p-5 text-inverse-fg shadow-[0_40px_80px_-40px_rgba(15,23,42,0.8)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-inverse-fg/60 uppercase">Painel de estoque</p>
                <p className="mt-1 font-display text-2xl font-semibold">Visão geral da carteira</p>
              </div>
              <span className="shrink-0 rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">Atualizado hoje</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-2xl bg-inverse-fg/[0.07] p-3 sm:p-4">
                  <p className="font-display text-2xl font-semibold tabular-nums sm:text-3xl">{k.value}</p>
                  <p className="mt-1 text-xs leading-snug text-inverse-fg/60">{k.label}</p>
                </div>
              ))}
            </div>

            <ul className="mt-6 divide-y divide-inverse-fg/10">
              {properties.map((p) => {
                const alert = p.health < 40
                return (
                  <li key={p.name} className="grid gap-3 py-4 sm:grid-cols-[1.3fr_1fr_auto] sm:items-center sm:gap-6">
                    <div className="min-w-0">
                      <p className="font-medium">{p.name}</p>
                      <p className="mt-0.5 text-xs text-inverse-fg/55">{p.next}</p>
                    </div>
                    <div>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-inverse-fg/60">Estoque</span>
                        <span className="tabular-nums">{p.health}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-inverse-fg/10">
                        <div className={`h-full origin-left rounded-full ${alert ? 'bg-brand-soft' : 'bg-success'}`} style={{ transform: `scaleX(${p.health / 100})` }} />
                      </div>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${alert ? 'bg-brand/25 text-brand-soft' : 'bg-success/15 text-success'}`}>{p.status}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// Regras de domínio do estoque. Sem dependências de servidor ou de DOM:
// usado tanto pelas Functions quanto pelas telas.

/** Abaixo deste percentual o item entra em alerta (padrão; cada item pode ter o seu). */
export const LOW_STOCK_PCT = 30

/** Opções que a diarista vê. Cada uma é um nível percentual fixo. */
export const STOCK_OPTIONS = [
  { pct: 100, label: 'Cheio' },
  { pct: 50, label: 'Pela metade' },
  { pct: 25, label: 'Acabando' },
  { pct: 0, label: 'Acabou' },
] as const

export type StockItem = {
  id: string
  name: string
  detail: string | null
  category: string
  pct: number
  threshold: number
  updatedAt: string | null
}

export type PropertyStock = {
  id: string
  name: string
  address: string | null
  items: StockItem[]
}

export type PropertyStatus = 'em-dia' | 'repor'

export type PropertySummary = {
  id: string
  name: string
  address: string | null
  items: StockItem[]
  averagePct: number | null
  lowItems: StockItem[]
  status: PropertyStatus
  updatedAt: string | null
}

export const isLow = (item: Pick<StockItem, 'pct' | 'threshold'>) => item.pct < item.threshold

/** True só na transição para baixo, para não disparar o mesmo alerta a cada check-in. */
export const crossedBelow = (previousPct: number, nextPct: number, threshold = LOW_STOCK_PCT) =>
  previousPct >= threshold && nextPct < threshold

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : null

const latest = (dates: (string | null)[]) =>
  dates.reduce<string | null>((max, d) => (d && (!max || d > max) ? d : max), null)

export function summarizeProperty(property: PropertyStock): PropertySummary {
  const lowItems = property.items.filter(isLow)
  return {
    ...property,
    averagePct: average(property.items.map((i) => i.pct)),
    lowItems,
    status: lowItems.length ? 'repor' : 'em-dia',
    updatedAt: latest(property.items.map((i) => i.updatedAt)),
  }
}

export function summarizePortfolio(summaries: PropertySummary[]) {
  return {
    activeProperties: summaries.length,
    alertProperties: summaries.filter((p) => p.status === 'repor').length,
    averagePct: average(summaries.flatMap((p) => p.items.map((i) => i.pct))),
  }
}

/** "atualizado hoje" ou "atualizado em 07/10", conforme a data do último check-in. */
export function updatedLabel(iso: string | null, now = new Date()) {
  if (!iso) return 'sem check-in'
  const date = new Date(iso)
  if (date.toDateString() === now.toDateString()) return 'atualizado hoje'
  return `atualizado em ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
}

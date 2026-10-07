// Essentials basket for the recurring supply catalog (13 SKUs).
// Prices are reference values, adjustable per cycle.

export type Category = 'Banheiro' | 'Cozinha' | 'Limpeza' | 'Café da manhã'

export type Sku = {
  id: string
  name: string
  detail: string
  category: Category
  price: number
}

export const catalog: Sku[] = [
  { id: 'papel-hig', name: 'Papel higiênico folha dupla', detail: '12 rolos', category: 'Banheiro', price: 22.9 },
  { id: 'sabonete', name: 'Sabonete líquido', detail: 'refil 250 ml', category: 'Banheiro', price: 8.9 },
  { id: 'amenities', name: 'Kit amenities', detail: 'shampoo + condicionador, 4 un', category: 'Banheiro', price: 12.5 },
  { id: 'papel-toalha', name: 'Papel toalha', detail: '2 rolos', category: 'Cozinha', price: 7.6 },
  { id: 'detergente', name: 'Detergente neutro', detail: '500 ml', category: 'Cozinha', price: 3.49 },
  { id: 'esponja', name: 'Esponja dupla face', detail: '3 un', category: 'Cozinha', price: 5.7 },
  { id: 'saco-lixo', name: 'Saco de lixo 50 L', detail: '30 un', category: 'Limpeza', price: 11.8 },
  { id: 'multiuso', name: 'Limpador multiuso', detail: '500 ml', category: 'Limpeza', price: 6.2 },
  { id: 'alcool', name: 'Álcool 70%', detail: '1 L', category: 'Limpeza', price: 9.8 },
  { id: 'cafe', name: 'Café torrado e moído', detail: '250 g', category: 'Café da manhã', price: 17.4 },
  { id: 'filtro', name: 'Filtro de papel nº 103', detail: '30 un', category: 'Café da manhã', price: 4.9 },
  { id: 'acucar', name: 'Açúcar refinado', detail: '1 kg', category: 'Café da manhã', price: 5.3 },
  { id: 'agua', name: 'Água mineral', detail: '6 × 1,5 L', category: 'Café da manhã', price: 14.9 },
]

export const MIN_ORDER = 60

// Pre-filled "check-in" kit — lands near the ~R$ 100 average ticket hypothesis.
export const starterKit: Record<string, number> = {
  'papel-hig': 1,
  sabonete: 1,
  'papel-toalha': 1,
  detergente: 1,
  esponja: 1,
  'saco-lixo': 1,
  cafe: 1,
  filtro: 1,
  acucar: 1,
  multiuso: 1,
  amenities: 1,
}

export const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

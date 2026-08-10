import type { Order, OrderStatus } from './orders'
import { FULFILLMENT_STATUSES } from './constants'

// Filtros e agregações de pedidos compartilhados entre a lista (client) e o
// relatório impresso (server). Só importa tipo de ./orders, então continua seguro
// para client components — o Supabase server-only não entra no bundle.

// 'today' = desde a meia-noite de hoje | 0 = todo o período | N = últimos N dias
export type DateRange = 'today' | 0 | 7 | 30 | 90

export const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
  { label: 'Tudo', value: 0 },
]

export const RANGE_LABEL: Record<string, string> = {
  today: 'Hoje',
  '7': 'Últimos 7 dias',
  '30': 'Últimos 30 dias',
  '90': 'Últimos 90 dias',
  '0': 'Todo o período',
}

// Início da janela, ou null para "todo o período". Sempre calculado no browser: o
// relatório recebe o recorte já em instantes absolutos para que o servidor (UTC)
// não desloque a meia-noite de quem está olhando.
export function rangeStart(range: DateRange): Date | null {
  if (range === 0) return null
  if (range === 'today') {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return start
  }
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - range)
  return cutoff
}

// Receita só conta pedido que entrou no fluxo de fulfillment — mesma régua do
// dashboard e das estatísticas, para os números nunca divergirem entre as telas.
export function isRevenue(status: OrderStatus): boolean {
  return FULFILLMENT_STATUSES.includes(status)
}

export function matchesSearch(order: Order, search: string): boolean {
  const q = search.trim().toLowerCase()
  if (!q) return true
  return (
    order.customer.name.toLowerCase().includes(q) ||
    order.customer.email.toLowerCase().includes(q) ||
    order.customer.cpf.includes(q) ||
    (order.id ?? '').toLowerCase().includes(q)
  )
}

export function filterOrders(
  orders: Order[],
  { from, to, search = '' }: { from?: Date | null; to?: Date | null; search?: string },
): Order[] {
  return orders.filter((order) => {
    const at = new Date(order.createdAt).getTime()
    if (isNaN(at)) return false
    if (from && at < from.getTime()) return false
    if (to && at > to.getTime()) return false
    return matchesSearch(order, search)
  })
}

export type OrderSummary = {
  total: number
  paid: number
  unpaid: number
  revenue: number
  avgTicket: number
}

export function summarize(orders: Order[]): OrderSummary {
  const paid = orders.filter((o) => isRevenue(o.status))
  const revenue = paid.reduce((sum, o) => sum + o.total, 0)
  return {
    total: orders.length,
    paid: paid.length,
    unpaid: orders.length - paid.length,
    revenue,
    avgTicket: paid.length ? revenue / paid.length : 0,
  }
}

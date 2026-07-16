import type { OrderStatus } from './orders'

// Status a partir dos quais o pedido é considerado pago/faturado (entrou no fluxo
// de fulfillment). Fonte única — dashboard, estatísticas e kanban importam daqui
// para as métricas nunca divergirem. (Fica em constants, não em orders, porque
// orders importa o Supabase server-only e os painéis são client components.)
export const FULFILLMENT_STATUSES: OrderStatus[] = [
  'paid', 'supplier_sent', 'packed', 'shipped', 'tracking_sent', 'completed',
]

export const MIN_ORDER_VALUE = 100
export const FREE_SHIPPING_THRESHOLD = 199.99
export const ADMIN_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000 // 8 horas
// Teto de pedidos carregados de uma vez pelo admin (dashboard/estatísticas/kanban).
// 1000 é o teto prático do PostgREST/Supabase por consulta. Suficiente para o
// volume atual; acima disso, migrar as métricas para agregação no servidor.
export const ORDERS_QUERY_LIMIT = 1000

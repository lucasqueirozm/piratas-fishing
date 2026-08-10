import type { OrderStatus } from './orders'

// Status a partir dos quais o pedido é considerado pago/faturado (entrou no fluxo
// de fulfillment). Fonte única — dashboard, estatísticas e kanban importam daqui
// para as métricas nunca divergirem. (Fica em constants, não em orders, porque
// orders importa o Supabase server-only e os painéis são client components.)
export const FULFILLMENT_STATUSES: OrderStatus[] = [
  'paid', 'supplier_sent', 'packed', 'shipped', 'tracking_sent', 'completed',
]

// Rótulo e cor de cada status, incluindo os anteriores ao pagamento. Kanban e a
// folha de impressão do pedido leem daqui para não divergirem. (O dashboard ainda
// mantém cópias próprias — vale unificar quando ele for mexido.)
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendente',
  in_process: 'Em análise',
  failed: 'Falhou',
  cancelled: 'Cancelado',
  paid: 'Pedido recebido',
  supplier_sent: 'Enviada Fornecedor',
  packed: 'Embalado',
  shipped: 'Enviado',
  tracking_sent: 'Rastreio enviado',
  completed: 'Finalizado',
}

export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: '#eab308',
  in_process: '#6366f1',
  failed: '#ef4444',
  cancelled: '#6b7280',
  paid: '#3b82f6',
  supplier_sent: '#f97316',
  packed: '#f59e0b',
  shipped: '#8b5cf6',
  tracking_sent: '#06b6d4',
  completed: '#22c55e',
}

export const MIN_ORDER_VALUE = 100
export const FREE_SHIPPING_THRESHOLD = 199.99
export const ADMIN_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000 // 8 horas
// Teto de pedidos carregados de uma vez pelo admin (dashboard/estatísticas/kanban).
// 1000 é o teto prático do PostgREST/Supabase por consulta. Suficiente para o
// volume atual; acima disso, migrar as métricas para agregação no servidor.
export const ORDERS_QUERY_LIMIT = 1000

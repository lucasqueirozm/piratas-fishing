import { getOrders, type Order } from '@/lib/orders'
import { ORDERS_QUERY_LIMIT } from '@/lib/constants'
import { filterOrders, summarize, RANGE_LABEL } from '@/lib/order-filters'
import ReportSheet from './ReportSheet'

export const dynamic = 'force-dynamic'

type Query = { from?: string; to?: string; range?: string; q?: string; print?: string }

function parseDate(value: string | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

// O browser usa o título da aba como nome sugerido em "Salvar como PDF".
export async function generateMetadata({ searchParams }: { searchParams: Promise<Query> }) {
  const { range } = await searchParams
  const label = RANGE_LABEL[range ?? '0'] ?? 'Período'
  return { title: { absolute: `Relatorio de pedidos - ${label}` } }
}

export default async function RelatorioPedidosPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams

  let orders: Order[] = []
  try {
    orders = await getOrders(ORDERS_QUERY_LIMIT)
  } catch (err) {
    console.error('[relatorio] falha ao carregar pedidos:', err)
  }

  const from = parseDate(query.from)
  const to = parseDate(query.to)
  const search = query.q ?? ''

  // Cronológico crescente: um relatório financeiro se lê do começo do período
  // para o fim, ao contrário da lista na tela.
  const filtered = filterOrders(orders, { from, to, search })
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (
    <ReportSheet
      orders={filtered}
      summary={summarize(filtered)}
      rangeLabel={RANGE_LABEL[query.range ?? '0'] ?? 'Período personalizado'}
      from={from?.toISOString() ?? null}
      to={to?.toISOString() ?? null}
      search={search}
      autoPrint={query.print === '1'}
    />
  )
}

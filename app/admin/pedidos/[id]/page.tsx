import { notFound } from 'next/navigation'
import OrderSheet from '../../pedido/[id]/OrderSheet'
import { loadOrder, sheetTitle } from '../../load-order'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await loadOrder(id)
  if (!order) return { title: { absolute: 'Pedido não encontrado' } }
  return sheetTitle('Detalhe do pedido', id, order.customer.name)
}

export default async function PedidoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ print?: string }>
}) {
  const [{ id }, query] = await Promise.all([params, searchParams])

  const order = await loadOrder(id)
  if (!order) notFound()

  // Mesma folha do fornecedor, mas com unitário, total por item e os totais do
  // pedido — é o detalhe financeiro, aberto a partir da lista de pedidos.
  return (
    <OrderSheet
      order={order}
      autoPrint={query.print === '1'}
      showPrices
      backHref="/admin/pedidos"
      backLabel="Pedidos"
    />
  )
}

import { notFound } from 'next/navigation'
import OrderSheet from './OrderSheet'
import { loadOrder, sheetTitle } from '../../load-order'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await loadOrder(id)
  if (!order) return { title: { absolute: 'Pedido não encontrado' } }
  return sheetTitle('Pedido', id, order.customer.name)
}

export default async function PedidoImpressaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ print?: string }>
}) {
  const [{ id }, query] = await Promise.all([params, searchParams])

  const order = await loadOrder(id)
  if (!order) notFound()

  // Folha do fornecedor: sem preços, só o que ele precisa para separar e enviar.
  return <OrderSheet order={order} autoPrint={query.print === '1'} />
}

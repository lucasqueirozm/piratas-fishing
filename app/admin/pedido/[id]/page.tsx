import { cache } from 'react'
import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/orders'
import OrderSheet from './OrderSheet'

export const dynamic = 'force-dynamic'

// generateMetadata e a página carregam o mesmo pedido — cache() dedupa a consulta.
const loadOrder = cache(async (id: string) => {
  try {
    return await getOrderById(id)
  } catch (err) {
    console.error('[pedido] falha ao carregar pedido:', err)
    return null
  }
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await loadOrder(id)
  if (!order) return { title: { absolute: 'Pedido não encontrado' } }

  // O browser usa o título da aba como nome sugerido em "Salvar como PDF" — por isso
  // o `absolute` (dispensa o template "| Piratas Fishing") e o nome do cliente junto.
  const name = order.customer.name.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim()
  return { title: { absolute: `Pedido ${id.slice(0, 8)} - ${name}` } }
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

  return <OrderSheet order={order} autoPrint={query.print === '1'} />
}

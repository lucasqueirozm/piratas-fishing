import { notFound } from 'next/navigation'
import ProdutoClient from './ProdutoClient'
import { getProductById } from '@/lib/products'

export const dynamic = 'force-dynamic'

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductById(Number(id))
  if (!product) notFound()
  return <ProdutoClient product={product} />
}

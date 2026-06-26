import CatalogoClient from './CatalogoClient'
import { getAllProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

export default async function CatalogoPage() {
  const products = await getAllProducts()
  return <CatalogoClient products={products} />
}

import CatalogoClient from './CatalogoClient'
import { getAllProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

export default async function CatalogoPage() {
  let products: Awaited<ReturnType<typeof getAllProducts>> = []
  try {
    products = await getAllProducts()
  } catch (err) {
    // Banco indisponível — mostra catálogo vazio em vez de erro 500.
    console.error('[catalogo] falha ao carregar produtos:', err)
  }
  return <CatalogoClient products={products} />
}

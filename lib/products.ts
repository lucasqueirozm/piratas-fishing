import 'server-only'
import { getAdminDb } from './supabase'
import { formatPrice, type Product, type ProductCategory } from './product-types'

export type { Product, ProductCategory } from './product-types'
export { categories } from './product-types'

type ProductRow = {
  id: number
  name: string
  description: string
  price: number | string
  sizes: string[] | null
  image: string | null
  category: ProductCategory
  active: boolean
  sort_order: number
}

function toProduct(r: ProductRow): Product {
  const price = Number(r.price)
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    price,
    priceStr: formatPrice(price),
    sizes: r.sizes ?? [],
    image: r.image ?? '',
    category: r.category,
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const db = getAdminDb()
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((r) => toProduct(r as ProductRow))
}

export async function getProductById(id: number): Promise<Product | undefined> {
  if (!Number.isFinite(id)) return undefined
  const db = getAdminDb()
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .maybeSingle()
  if (error) throw error
  return data ? toProduct(data as ProductRow) : undefined
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const db = getAdminDb()
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('category', category)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((r) => toProduct(r as ProductRow))
}

export async function getFeaturedProducts(count = 3): Promise<Product[]> {
  const all = await getAllProducts()
  return all.slice(0, count)
}

// Contagem por categoria para o mega menu do Navbar.
export async function getCategoryCounts(): Promise<{ total: number; byCategory: Record<string, number> }> {
  const all = await getAllProducts()
  const byCategory: Record<string, number> = {}
  for (const p of all) byCategory[p.category] = (byCategory[p.category] ?? 0) + 1
  return { total: all.length, byCategory }
}

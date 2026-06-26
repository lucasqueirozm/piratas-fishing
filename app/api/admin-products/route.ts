import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminDb } from '@/lib/supabase'
import { verifySessionToken } from '@/lib/admin-auth'
import { categories, type ProductCategory } from '@/lib/product-types'

export const runtime = 'nodejs'

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session) return false
  return verifySessionToken(session)
}

type ProductInput = {
  name?: unknown
  description?: unknown
  price?: unknown
  sizes?: unknown
  image?: unknown
  category?: unknown
  active?: unknown
}

// Valida e normaliza o corpo recebido. Retorna { value } ou { error }.
function parseProduct(body: ProductInput): { value: {
  name: string; description: string; price: number; sizes: string[]; image: string; category: ProductCategory; active: boolean
} } | { error: string } {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return { error: 'Nome é obrigatório.' }

  const category = body.category
  if (typeof category !== 'string' || !(categories as string[]).includes(category)) {
    return { error: 'Categoria inválida.' }
  }

  const price = Number(body.price)
  if (!Number.isFinite(price) || price < 0) return { error: 'Preço inválido.' }

  const sizes = Array.isArray(body.sizes)
    ? body.sizes.map((s) => String(s).trim()).filter(Boolean)
    : []
  if (sizes.length === 0) return { error: 'Informe ao menos um tamanho.' }

  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const image = typeof body.image === 'string' ? body.image.trim() : ''
  const active = body.active === undefined ? true : Boolean(body.active)

  return { value: { name, description, price, sizes, image, category: category as ProductCategory, active } }
}

// GET — lista todos os produtos (inclusive inativos), para o painel.
export async function GET() {
  if (!(await checkAuth())) return Response.json({ error: 'Não autorizado.' }, { status: 401 })

  const db = getAdminDb()
  const { data, error } = await db
    .from('products')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ products: data ?? [] })
}

// POST — cria um novo produto.
export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return Response.json({ error: 'Não autorizado.' }, { status: 401 })

  let body: ProductInput
  try { body = await req.json() } catch { return Response.json({ error: 'Requisição inválida.' }, { status: 400 }) }

  const parsed = parseProduct(body)
  if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })

  const db = getAdminDb()
  // Coloca o novo produto no fim da ordenação.
  const { data: maxRow } = await db.from('products').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle()
  const nextOrder = (maxRow?.sort_order ?? 0) + 1

  const { data, error } = await db
    .from('products')
    .insert({ ...parsed.value, sort_order: nextOrder })
    .select('*')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ product: data })
}

// PATCH — atualiza um produto existente.
export async function PATCH(req: NextRequest) {
  if (!(await checkAuth())) return Response.json({ error: 'Não autorizado.' }, { status: 401 })

  let body: ProductInput & { id?: unknown }
  try { body = await req.json() } catch { return Response.json({ error: 'Requisição inválida.' }, { status: 400 }) }

  const id = Number(body.id)
  if (!Number.isFinite(id)) return Response.json({ error: 'ID inválido.' }, { status: 400 })

  const parsed = parseProduct(body)
  if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })

  const db = getAdminDb()
  const { data, error } = await db
    .from('products')
    .update({ ...parsed.value, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ product: data })
}

// DELETE — remove um produto.
export async function DELETE(req: NextRequest) {
  if (!(await checkAuth())) return Response.json({ error: 'Não autorizado.' }, { status: 401 })

  const id = Number(req.nextUrl.searchParams.get('id'))
  if (!Number.isFinite(id)) return Response.json({ error: 'ID inválido.' }, { status: 400 })

  const db = getAdminDb()
  const { error } = await db.from('products').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

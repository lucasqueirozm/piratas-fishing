import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getOrders, updateOrderFulfillment } from '@/lib/orders'
import type { OrderStatus } from '@/lib/orders'
import { verifySessionToken } from '@/lib/admin-auth'

const VALID_STATUSES = new Set<string>([
  'pending', 'paid', 'failed', 'cancelled', 'in_process',
  'packed', 'shipped', 'tracking_sent', 'completed',
])

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session) return false
  return verifySessionToken(session)
}

export async function GET(req: NextRequest) {
  if (!await checkAuth()) {
    return Response.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '100')
  const orders = await getOrders(Math.min(limit, 200))

  return Response.json({ orders })
}

export async function PATCH(req: NextRequest) {
  if (!await checkAuth()) {
    return Response.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const body = await req.json() as { orderId?: string; status?: string; trackingCode?: string }
  if (!body.orderId || !body.status || !VALID_STATUSES.has(body.status)) {
    return Response.json({ error: 'Dados inválidos.' }, { status: 400 })
  }
  await updateOrderFulfillment(body.orderId, body.status as OrderStatus, body.trackingCode)

  return Response.json({ ok: true })
}

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getOrders, getOrderById, updateOrderFulfillment } from '@/lib/orders'
import type { OrderStatus } from '@/lib/orders'
import { verifySessionToken } from '@/lib/admin-auth'
import { ORDERS_QUERY_LIMIT } from '@/lib/constants'
import { sendOrderEmail } from '@/lib/email'

// Status cuja entrada dispara e-mail para o cliente. Os demais são internos.
const EMAIL_ON: Partial<Record<OrderStatus, 'shipped' | 'tracking_sent'>> = {
  shipped: 'shipped',
  tracking_sent: 'tracking_sent',
}

const VALID_STATUSES = new Set<string>([
  'pending', 'paid', 'failed', 'cancelled', 'in_process',
  'supplier_sent', 'packed', 'shipped', 'tracking_sent', 'completed',
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

  const requested = Number(req.nextUrl.searchParams.get('limit') ?? String(ORDERS_QUERY_LIMIT))
  const limit = Math.min(Number.isFinite(requested) ? requested : ORDERS_QUERY_LIMIT, ORDERS_QUERY_LIMIT)
  const orders = await getOrders(limit)

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
  const status = body.status as OrderStatus

  // Estado anterior antes de gravar: o e-mail só sai na transição de verdade, senão
  // um PATCH repetido (ou voltar e avançar o card) reenviaria a mesma mensagem.
  const anterior = await getOrderById(body.orderId)

  await updateOrderFulfillment(body.orderId, status, body.trackingCode)

  const evento = EMAIL_ON[status]
  if (evento && anterior && anterior.status !== status) {
    // trackingCode pode ter acabado de ser preenchido neste mesmo PATCH.
    await sendOrderEmail(
      { ...anterior, status, trackingCode: body.trackingCode ?? anterior.trackingCode },
      evento,
    )
  }

  return Response.json({ ok: true })
}

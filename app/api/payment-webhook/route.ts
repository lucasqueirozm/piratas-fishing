import { NextRequest } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { updateOrderStatus, getOrderById } from '@/lib/orders'
import type { OrderStatus } from '@/lib/orders'

// Status de pré-pagamento: só estes podem ser alterados por um webhook.
// Depois que o pedido entra no fluxo de fulfillment (paid em diante), quem
// controla o status é o admin — webhooks duplicados/atrasados são ignorados.
const PRE_PAYMENT_STATUSES = new Set<OrderStatus>(['pending', 'in_process', 'failed', 'cancelled'])

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
})

// Janela de tolerância para timestamp do webhook (evita replay attacks).
const WEBHOOK_TS_TOLERANCE_S = 300 // 5 minutos

// Verifica a assinatura HMAC-SHA256 enviada pelo MercadoPago e valida o timestamp.
// Se MP_WEBHOOK_SECRET não estiver configurado: rejeita em produção, aceita em dev.
function verifyMpSignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[payment-webhook] MP_WEBHOOK_SECRET não configurado em produção!')
      return false
    }
    return true // sem verificação apenas em desenvolvimento local
  }

  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  if (!xSignature || !xRequestId) return false

  // x-signature: "ts=<timestamp_segundos>,v1=<hmac>"
  const parts: Record<string, string> = {}
  for (const part of xSignature.split(',')) {
    const idx = part.indexOf('=')
    if (idx > 0) parts[part.slice(0, idx).trim()] = part.slice(idx + 1).trim()
  }
  const { ts, v1 } = parts
  if (!ts || !v1) return false

  // Rejeitar webhooks com timestamp fora da janela de tolerância (replay protection)
  const tsSeconds = parseInt(ts, 10)
  const nowSeconds = Math.floor(Date.now() / 1000)
  if (isNaN(tsSeconds) || Math.abs(nowSeconds - tsSeconds) > WEBHOOK_TS_TOLERANCE_S) {
    console.warn('[payment-webhook] Timestamp fora da janela — possível replay attack', { ts, now: nowSeconds })
    return false
  }

  let dataId: string | undefined
  try {
    dataId = (JSON.parse(rawBody) as { data?: { id?: string } }).data?.id
  } catch {
    return false
  }

  const template = `id:${dataId};request-id:${xRequestId};ts:${ts}`
  const expected = createHmac('sha256', secret).update(template).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

function mpStatusToOrderStatus(mpStatus: string): OrderStatus {
  switch (mpStatus) {
    case 'approved':   return 'paid'
    case 'rejected':   return 'failed'
    case 'cancelled':  return 'cancelled'
    case 'pending':    return 'pending'
    case 'in_process': return 'in_process'
    default:           return 'in_process'
  }
}

export async function POST(req: NextRequest) {
  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return Response.json({ received: true }) // corpo ilegível, não retentar
  }

  // Assinatura inválida ou replay: retornar 200 para MP não retentar indefinidamente.
  if (!verifyMpSignature(req, rawBody)) {
    console.error('[payment-webhook] Assinatura inválida ou timestamp expirado — requisição rejeitada')
    return Response.json({ received: true })
  }

  let body: { type?: string; data?: { id?: string } }
  try {
    body = JSON.parse(rawBody) as { type?: string; data?: { id?: string } }
  } catch {
    return Response.json({ received: true })
  }

  // MP envia dois tipos: "payment" e "merchant_order"
  if (body.type !== 'payment' || !body.data?.id) {
    return Response.json({ received: true })
  }

  // Erros de servidor (DB, API do MP) devem retornar 500 para o MP retentar.
  try {
    const paymentId = body.data.id

    // Buscar detalhes do pagamento diretamente no MP (não confiar no body)
    const paymentApi = new Payment(mpClient)
    const payment = await paymentApi.get({ id: paymentId })

    const orderId = payment.external_reference
    if (!orderId) return Response.json({ received: true })

    // Só atualiza pedidos ainda em pré-pagamento. Evita que um webhook
    // duplicado/atrasado de "approved" reverta um pedido já "shipped" para "paid".
    const current = await getOrderById(orderId)
    if (current && !PRE_PAYMENT_STATUSES.has(current.status)) {
      return Response.json({ received: true })
    }

    const status = mpStatusToOrderStatus(payment.status ?? '')
    await updateOrderStatus(orderId, status, String(paymentId), payment.status ?? '')

    return Response.json({ received: true })
  } catch (err) {
    console.error('[payment-webhook] CRITICAL — erro de servidor, MP irá retentar:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

import { NextRequest } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { updateOrderStatus } from '@/lib/orders'
import type { OrderStatus } from '@/lib/orders'

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
})

// Verifica a assinatura HMAC-SHA256 enviada pelo MercadoPago.
// Requer MP_WEBHOOK_SECRET configurado no painel MP (Webhooks → Chave secreta)
// e na variável de ambiente. Se o secret não estiver configurado, a verificação
// é ignorada (desenvolvimento). Em produção, MP_WEBHOOK_SECRET É obrigatório.
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

  // x-signature: "ts=<timestamp>,v1=<hmac>"
  const parts: Record<string, string> = {}
  for (const part of xSignature.split(',')) {
    const idx = part.indexOf('=')
    if (idx > 0) parts[part.slice(0, idx).trim()] = part.slice(idx + 1).trim()
  }
  const { ts, v1 } = parts
  if (!ts || !v1) return false

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
  try {
    const rawBody = await req.text()

    if (!verifyMpSignature(req, rawBody)) {
      console.error('[payment-webhook] Assinatura inválida — requisição rejeitada')
      // Retorna 200 para o MP não reenviar infinitamente, mas não processa
      return Response.json({ received: true })
    }

    const body = JSON.parse(rawBody) as { type?: string; data?: { id?: string } }

    // MP envia dois tipos: "payment" e "merchant_order"
    if (body.type !== 'payment' || !body.data?.id) {
      return Response.json({ received: true })
    }

    const paymentId = body.data.id

    // Buscar detalhes do pagamento diretamente no MP (não confiar no body)
    const paymentApi = new Payment(mpClient)
    const payment = await paymentApi.get({ id: paymentId })

    const orderId = payment.external_reference
    if (!orderId) return Response.json({ received: true })

    const status = mpStatusToOrderStatus(payment.status ?? '')
    await updateOrderStatus(orderId, status, String(paymentId), payment.status ?? '')

    return Response.json({ received: true })
  } catch (err) {
    console.error('[payment-webhook]', err)
    // 200 mesmo em erro para evitar reenvios infinitos do MP
    return Response.json({ received: true })
  }
}

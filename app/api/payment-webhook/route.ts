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

  // O id do manifesto vem do parâmetro "data.id" da URL; usamos o do corpo como
  // alternativa. MP manda ids numéricos (payment); normalizamos p/ minúsculo por spec.
  let bodyDataId: string | undefined
  try {
    bodyDataId = (JSON.parse(rawBody) as { data?: { id?: string } }).data?.id
  } catch {
    // corpo não-JSON — segue só com o data.id da URL
  }
  let urlDataId: string | undefined
  try {
    urlDataId = new URL(req.url).searchParams.get('data.id') ?? undefined
  } catch {
    // URL sem query — ignora
  }

  const idCandidates = new Set<string>()
  for (const id of [urlDataId, bodyDataId]) {
    if (id) { idCandidates.add(id); idCandidates.add(id.toLowerCase()) }
  }
  if (idCandidates.size === 0) return false

  // MP documenta o template "id:...;request-id:...;ts:...;" mas há variação quanto
  // ao ";" final. Testamos ambos os formatos e aceitamos se qualquer um bater —
  // continua exigindo a chave secreta correta, então segue seguro.
  const provided = Buffer.from(v1, 'hex')
  for (const id of idCandidates) {
    for (const template of [
      `id:${id};request-id:${xRequestId};ts:${ts};`,
      `id:${id};request-id:${xRequestId};ts:${ts}`,
    ]) {
      const expected = Buffer.from(createHmac('sha256', secret).update(template).digest('hex'), 'hex')
      if (provided.length === expected.length && timingSafeEqual(provided, expected)) {
        return true
      }
    }
  }
  return false
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

  // Assinatura inválida/ausente ou timestamp fora da janela: retornar 401 para
  // que a falha seja VISÍVEL (no painel do MP e nas retentativas) em vez de um
  // "200 OK" enganoso que esconderia um segredo mal configurado.
  if (!verifyMpSignature(req, rawBody)) {
    console.error('[payment-webhook] Assinatura inválida ou timestamp expirado — requisição rejeitada')
    return Response.json({ error: 'invalid signature' }, { status: 401 })
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

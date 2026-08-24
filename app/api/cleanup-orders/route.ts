import { NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/supabase'
import { updateOrderStatus, getOrderById } from '@/lib/orders'
import { sendOrderEmail } from '@/lib/email'

export const runtime = 'nodejs'

// Pedido pendente vira "Falhou" após este tanto de horas sem confirmação.
// Marcar em vez de apagar: 'failed' está em PRE_PAYMENT_STATUSES no webhook, então
// um boleto que compensa depois ainda recupera o pedido para 'paid'. Apagando, o
// pagamento chegaria sem registro nenhum para associar.
const PENDING_MAX_HOURS = 48
const EVENTS_MAX_DAYS = 90

// Vercel injeta CRON_SECRET automaticamente e envia no header Authorization.
// Em desenvolvimento local pode ser testado com qualquer valor no header.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[cleanup-orders] CRON_SECRET não configurado em produção')
      return false
    }
    return true
  }
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

type MpPayment = { id: number | string; status: string }
type PaymentCheck =
  | { kind: 'approved'; payment: MpPayment }
  | { kind: 'none' }
  | { kind: 'error' }

// Pergunta ao MercadoPago se este pedido tem pagamento aprovado.
// Distingue "não tem" de "não consegui verificar" — nunca apagamos na dúvida.
async function checkPayment(orderId: string): Promise<PaymentCheck> {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) return { kind: 'error' }
  try {
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(orderId)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!res.ok) return { kind: 'error' }
    const data = (await res.json()) as { results?: MpPayment[] }
    const approved = (data.results ?? []).find((p) => p.status === 'approved')
    return approved ? { kind: 'approved', payment: approved } : { kind: 'none' }
  } catch {
    return { kind: 'error' }
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminDb()

  // ── 1. Pedidos pendentes parados há mais de 48h ─────────────────────────────
  // Antes de marcar como falho, confere no MercadoPago: boleto leva até 3 dias
  // úteis para compensar, e o webhook pode ter falhado. Se estiver pago, RECUPERA
  // o pedido. Só marca o que comprovadamente não foi pago.
  const ordersCutoff = new Date(Date.now() - PENDING_MAX_HOURS * 3600_000).toISOString()

  const { data: stale, error: staleError } = await db
    .from('orders')
    .select('id')
    .eq('status', 'pending')
    .lt('created_at', ordersCutoff)

  if (staleError) {
    console.error('[cleanup-orders] Erro ao buscar pedidos pendentes:', staleError)
    return Response.json({ error: staleError.message }, { status: 500 })
  }

  let failed = 0
  let recovered = 0
  let skipped = 0

  for (const order of stale ?? []) {
    const check = await checkPayment(order.id)

    if (check.kind === 'approved') {
      // Pago de verdade — o webhook falhou ou o boleto compensou tarde. Recupera.
      await updateOrderStatus(order.id, 'paid', String(check.payment.id), check.payment.status)
      recovered++
      console.warn(`[cleanup-orders] RECUPERADO pedido pago que estava pendente: ${order.id}`)
      continue
    }

    if (check.kind === 'error') {
      // Não deu para confirmar com o MP — mantém pendente e tenta na próxima execução.
      skipped++
      console.warn(`[cleanup-orders] Não foi possível verificar no MP, mantendo: ${order.id}`)
      continue
    }

    try {
      await updateOrderStatus(order.id, 'failed')
      failed++

      // Avisa o cliente que o pedido expirou e convida a refazer. Falha de e-mail
      // não desfaz a marcação nem interrompe o resto do lote.
      const completo = await getOrderById(order.id)
      if (completo) await sendOrderEmail(completo, 'failed')
    } catch (err) {
      console.error(`[cleanup-orders] Erro ao marcar pedido ${order.id} como falho:`, err)
      skipped++
    }
  }

  // ── 2. Eventos de analytics antigos (evita estourar o storage) ──────────────
  const eventsCutoff = new Date(Date.now() - EVENTS_MAX_DAYS * 86400000).toISOString()
  const { error: eventsError, count: eventsDeleted } = await db
    .from('events')
    .delete({ count: 'exact' })
    .lt('created_at', eventsCutoff)

  if (eventsError) {
    console.error('[cleanup-orders] Erro ao deletar eventos antigos:', eventsError)
    return Response.json({ error: eventsError.message }, { status: 500 })
  }

  console.log(
    `[cleanup-orders] pendentes: ${failed} marcados como falhos, ${recovered} recuperados, ${skipped} mantidos | eventos: ${eventsDeleted ?? 0} removidos`,
  )
  return Response.json({
    ordersFailed: failed,
    ordersRecovered: recovered,
    ordersSkipped: skipped,
    eventsDeleted: eventsDeleted ?? 0,
  })
}

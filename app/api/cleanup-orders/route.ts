import { NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/supabase'
import { updateOrderStatus } from '@/lib/orders'

export const runtime = 'nodejs'

// Pedido pendente é descartado após este tanto de dias úteis sem confirmação.
const PENDING_MAX_BUSINESS_DAYS = 1
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

// Volta N dias úteis a partir de uma data, pulando sábado e domingo.
function subtractBusinessDays(from: Date, n: number): Date {
  const d = new Date(from)
  let remaining = n
  while (remaining > 0) {
    d.setDate(d.getDate() - 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) remaining-- // 0 = domingo, 6 = sábado
  }
  return d
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

  // ── 1. Pedidos pendentes parados há mais de 1 dia útil ──────────────────────
  // Antes de apagar, confere no MercadoPago: boleto leva até 3 dias úteis para
  // compensar, e o webhook pode ter falhado. Se estiver pago, RECUPERA o pedido
  // em vez de perdê-lo. Só apaga o que comprovadamente não foi pago.
  const ordersCutoff = subtractBusinessDays(new Date(), PENDING_MAX_BUSINESS_DAYS).toISOString()

  const { data: stale, error: staleError } = await db
    .from('orders')
    .select('id')
    .eq('status', 'pending')
    .lt('created_at', ordersCutoff)

  if (staleError) {
    console.error('[cleanup-orders] Erro ao buscar pedidos pendentes:', staleError)
    return Response.json({ error: staleError.message }, { status: 500 })
  }

  let deleted = 0
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
      // Não deu para confirmar com o MP — mantém o pedido e tenta na próxima execução.
      skipped++
      console.warn(`[cleanup-orders] Não foi possível verificar no MP, mantendo: ${order.id}`)
      continue
    }

    const { error: delError } = await db.from('orders').delete().eq('id', order.id)
    if (delError) {
      console.error(`[cleanup-orders] Erro ao apagar pedido ${order.id}:`, delError)
      skipped++
    } else {
      deleted++
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
    `[cleanup-orders] pendentes: ${deleted} apagados, ${recovered} recuperados, ${skipped} mantidos | eventos: ${eventsDeleted ?? 0} removidos`,
  )
  return Response.json({
    ordersDeleted: deleted,
    ordersRecovered: recovered,
    ordersSkipped: skipped,
    eventsDeleted: eventsDeleted ?? 0,
  })
}

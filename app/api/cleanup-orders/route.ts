import { NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/supabase'

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

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminDb()

  // 1. Remove pedidos pendentes com mais de 7 dias.
  const ordersCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { error: ordersError, count: ordersDeleted } = await db
    .from('orders')
    .delete({ count: 'exact' })
    .eq('status', 'pending')
    .lt('created_at', ordersCutoff)

  if (ordersError) {
    console.error('[cleanup-orders] Erro ao deletar pedidos expirados:', ordersError)
    return Response.json({ error: ordersError.message }, { status: 500 })
  }

  // 2. Remove eventos de analytics com mais de 90 dias (evita estourar o storage do free tier).
  const eventsCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { error: eventsError, count: eventsDeleted } = await db
    .from('events')
    .delete({ count: 'exact' })
    .lt('created_at', eventsCutoff)

  if (eventsError) {
    console.error('[cleanup-orders] Erro ao deletar eventos antigos:', eventsError)
    return Response.json({ error: eventsError.message }, { status: 500 })
  }

  console.log(`[cleanup-orders] ${ordersDeleted ?? 0} pedidos e ${eventsDeleted ?? 0} eventos removidos`)
  return Response.json({ ordersDeleted: ordersDeleted ?? 0, eventsDeleted: eventsDeleted ?? 0 })
}

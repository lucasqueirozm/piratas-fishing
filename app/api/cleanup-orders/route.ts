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

  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error, count } = await db
    .from('orders')
    .delete({ count: 'exact' })
    .eq('status', 'pending')
    .lt('created_at', cutoff)

  if (error) {
    console.error('[cleanup-orders] Erro ao deletar pedidos expirados:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  console.log(`[cleanup-orders] ${count ?? 0} pedidos pendentes expirados removidos`)
  return Response.json({ deleted: count ?? 0 })
}

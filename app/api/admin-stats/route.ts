import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminDb } from '@/lib/firebase-admin'

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  return session && session === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!await checkAuth()) {
    return Response.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30')
  const cutoff = days > 0 ? new Date(Date.now() - days * 86400000).toISOString() : null

  const db = getAdminDb()
  const funnelCounts: Record<string, number> = {}

  for (const eventType of ['page_view', 'cart_open', 'checkout_start']) {
    let query = db.from('events').select('session_id').eq('event_type', eventType)
    if (cutoff) query = query.gte('created_at', cutoff)
    const { data } = await query
    const unique = new Set((data ?? []).map((r: { session_id: string }) => r.session_id))
    funnelCounts[eventType] = unique.size
  }

  return Response.json({ funnelCounts })
}

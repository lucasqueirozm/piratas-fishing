import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminDb } from '@/lib/supabase'
import { verifySessionToken } from '@/lib/admin-auth'

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

  const rawDays = parseInt(req.nextUrl.searchParams.get('days') ?? '30')
  const days = isNaN(rawDays) || rawDays < 0 ? 30 : Math.min(rawDays, 365)
  const cutoff = days > 0 ? new Date(Date.now() - days * 86400000).toISOString() : null

  const db = getAdminDb()

  // Conta sessões únicas por tipo de evento. Pagina em blocos de 1000 (limite
  // do PostgREST) para não subcontar silenciosamente quando houver muitos eventos.
  const sessions: Record<string, Set<string>> = {
    page_view: new Set(),
    cart_open: new Set(),
    checkout_start: new Set(),
  }

  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    let query = db
      .from('events')
      .select('event_type, session_id')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1)
    if (cutoff) query = query.gte('created_at', cutoff)

    const { data, error } = await query
    if (error) break
    for (const r of (data ?? []) as { event_type: string; session_id: string | null }[]) {
      if (r.session_id && sessions[r.event_type]) sessions[r.event_type].add(r.session_id)
    }
    if (!data || data.length < PAGE) break
  }

  const funnelCounts: Record<string, number> = {
    page_view: sessions.page_view.size,
    cart_open: sessions.cart_open.size,
    checkout_start: sessions.checkout_start.size,
  }

  return Response.json({ funnelCounts })
}

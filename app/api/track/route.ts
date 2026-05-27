import { NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

const ALLOWED = new Set(['page_view', 'cart_open', 'checkout_start'])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { event?: string; sessionId?: string }
    if (!body.event || !ALLOWED.has(body.event)) {
      return Response.json({ ok: false }, { status: 400 })
    }
    const db = getAdminDb()
    await db.from('events').insert({
      event_type: body.event,
      session_id: body.sessionId ?? null,
    })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}

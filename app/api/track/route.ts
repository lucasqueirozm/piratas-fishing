import { NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/supabase'

const ALLOWED = new Set(['page_view', 'cart_open', 'checkout_start'])

export async function POST(req: NextRequest) {
  try {
    // Rejeitar requisições de origens externas (impede bots simples de inflar analytics).
    // Comparação exata: startsWith aceitaria "https://piratasfishing.com.br.evil.com".
    const origin = req.headers.get('origin')
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    if (origin && origin !== baseUrl) {
      return Response.json({ ok: false }, { status: 403 })
    }

    const body = await req.json() as { event?: string; sessionId?: string }

    if (!body.event || !ALLOWED.has(body.event)) {
      return Response.json({ ok: false }, { status: 400 })
    }

    // Validar formato do sessionId para evitar injeção de dados arbitrários
    const sessionId = body.sessionId ?? null
    if (sessionId !== null && !/^[a-z0-9]{6,64}$/.test(sessionId)) {
      return Response.json({ ok: false }, { status: 400 })
    }

    const db = getAdminDb()
    await db.from('events').insert({
      event_type: body.event,
      session_id: sessionId,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}

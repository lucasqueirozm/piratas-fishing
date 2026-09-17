import { NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/supabase'

const ALLOWED = new Set(['page_view', 'cart_open', 'checkout_start'])

// Aceita a origem se o host bater com o da NEXT_PUBLIC_BASE_URL, ignorando
// "www." e barras/porta. Robusto a apex vs www e a barra final na env var
// (era isso que barrava TODO o tracking com 403). Sem Origin, não bloqueia.
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  try {
    const strip = (h: string) => h.replace(/^www\./, '')
    return strip(new URL(origin).hostname) === strip(new URL(base).hostname)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rejeita origens externas (impede bots simples de inflar analytics).
    if (!isAllowedOrigin(req.headers.get('origin'))) {
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

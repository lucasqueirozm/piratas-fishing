import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_MESSAGE } from '@/lib/session-const'
import { ADMIN_SESSION_MAX_AGE_MS } from '@/lib/constants'

function hexToBuffer(hex: string): ArrayBuffer {
  const pairs = hex.match(/.{2}/g) ?? []
  const buf = new ArrayBuffer(pairs.length)
  const view = new Uint8Array(buf)
  pairs.forEach((b, i) => { view[i] = parseInt(b, 16) })
  return buf
}

function encodeText(str: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(str)
  // slice(0) garante um ArrayBuffer sem shared memory ambiguity
  return encoded.buffer.slice(0)
}

// Replica verifySessionToken usando Web Crypto (Edge-compatible).
// Token format: "<issuedAt>.<hmac-hex>"
async function verifySession(token: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return false

  const dotIdx = token.indexOf('.')
  if (dotIdx < 0) return false

  const issuedAt = parseInt(token.slice(0, dotIdx), 10)
  const providedHmac = token.slice(dotIdx + 1)

  if (isNaN(issuedAt) || Date.now() - issuedAt > ADMIN_SESSION_MAX_AGE_MS) return false
  if (!/^[0-9a-f]{64}$/i.test(providedHmac)) return false

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      encodeText(password),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    return await crypto.subtle.verify(
      { name: 'HMAC' },
      key,
      hexToBuffer(providedHmac),
      encodeText(`${ADMIN_SESSION_MESSAGE}:${issuedAt}`),
    )
  } catch {
    return false
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = req.cookies.get('admin_session')?.value
    if (!session || !(await verifySession(session))) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

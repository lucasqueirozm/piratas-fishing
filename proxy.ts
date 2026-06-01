import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_MESSAGE } from '@/lib/session-const'

async function verifySession(session: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return false
  // HMAC-SHA256 digest is always 32 bytes = 64 hex chars
  if (session.length !== 64 || !/^[0-9a-f]+$/i.test(session)) return false
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    const sigBytes = new Uint8Array(session.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
    return await crypto.subtle.verify(
      { name: 'HMAC' },
      key,
      sigBytes,
      new TextEncoder().encode(ADMIN_SESSION_MESSAGE),
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

import { NextRequest, NextResponse } from 'next/server'

// Middleware roda no Edge Runtime (sem Node.js crypto).
// Faz apenas a verificação de presença do cookie para redirect de UX.
// A verificação HMAC real acontece em cada route handler (checkAuth).
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = req.cookies.get('admin_session')?.value
    if (!session) {
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

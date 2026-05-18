import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { password } = await req.json() as { password?: string }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Senha incorreta.' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', process.env.ADMIN_PASSWORD ?? '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
  })

  return Response.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  return Response.json({ ok: true })
}

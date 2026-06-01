import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createSessionToken } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json() as { password?: string }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Senha incorreta.' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
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

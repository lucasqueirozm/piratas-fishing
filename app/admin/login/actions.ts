'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { timingSafeEqual } from 'crypto'
import { createSessionToken } from '@/lib/admin-auth'

export type LoginState = { error: string } | null

// Rate limiting em memória — proteção por instância (serverless).
// Cada instância warm do Vercel mantém seu próprio contador.
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutos

function getRateLimitKey(req: Awaited<ReturnType<typeof headers>>): string {
  return (
    req.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.get('x-real-ip') ??
    'unknown'
  )
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(key)
  if (!record || now > record.resetAt) return false
  return record.count >= MAX_ATTEMPTS
}

function recordFailure(key: string): void {
  const now = Date.now()
  const record = loginAttempts.get(key)
  if (!record || now > record.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOCKOUT_MS })
  } else {
    record.count++
  }
}

function clearAttempts(key: string): void {
  loginAttempts.delete(key)
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8')
  const bBuf = Buffer.from(b, 'utf8')
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const headerStore = await headers()
  const ip = getRateLimitKey(headerStore)

  if (isRateLimited(ip)) {
    return { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
  }

  const password = formData.get('password') as string | null
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!adminPassword) {
    console.error('[admin-login] ADMIN_PASSWORD não configurada')
    return { error: 'Erro de configuração do servidor.' }
  }

  if (!password || !timingSafeStringEqual(password, adminPassword)) {
    recordFailure(ip)
    return { error: 'Senha incorreta.' }
  }

  clearAttempts(ip)

  const cookieStore = await cookies()
  cookieStore.set('admin_session', createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  redirect('/admin')
}

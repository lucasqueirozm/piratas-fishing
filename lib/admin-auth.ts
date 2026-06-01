import { createHmac, timingSafeEqual } from 'crypto'

// Gera um token de sessão opaco derivado da ADMIN_PASSWORD via HMAC.
// Opaco: não é possível recuperar a senha a partir do token.
// Determinístico: sem estado persistente — funciona em serverless.
// Se a ADMIN_PASSWORD mudar, todas as sessões existentes expiram automaticamente.
export function createSessionToken(): string {
  return createHmac('sha256', process.env.ADMIN_PASSWORD ?? 'no-password')
    .update('piratas-admin-session-v1')
    .digest('hex')
}

export function verifySessionToken(token: string): boolean {
  const expected = createSessionToken()
  try {
    return timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

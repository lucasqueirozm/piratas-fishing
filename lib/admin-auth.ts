import { createHmac, timingSafeEqual } from 'crypto'
import { ADMIN_SESSION_MESSAGE } from './session-const'
import { ADMIN_SESSION_MAX_AGE_MS } from './constants'

// Token de sessão: "<issuedAt>.<hmac-sha256>"
// O issuedAt é validado no servidor — sessão expira mesmo que o browser guarde o cookie.
// Se ADMIN_PASSWORD não estiver configurada, nenhum token é emitido.
export function createSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error('ADMIN_PASSWORD não configurada')

  const issuedAt = Date.now()
  const hmac = createHmac('sha256', password)
    .update(`${ADMIN_SESSION_MESSAGE}:${issuedAt}`)
    .digest('hex')
  return `${issuedAt}.${hmac}`
}

export function verifySessionToken(token: string): boolean {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return false

  const dotIdx = token.indexOf('.')
  if (dotIdx < 0) return false

  const issuedAt = parseInt(token.slice(0, dotIdx), 10)
  const providedHmac = token.slice(dotIdx + 1)

  if (isNaN(issuedAt) || Date.now() - issuedAt > ADMIN_SESSION_MAX_AGE_MS) return false

  const expected = createHmac('sha256', password)
    .update(`${ADMIN_SESSION_MESSAGE}:${issuedAt}`)
    .digest('hex')

  try {
    return timingSafeEqual(
      Buffer.from(providedHmac, 'hex'),
      Buffer.from(expected, 'hex'),
    )
  } catch {
    return false
  }
}

let _sessionId: string | null = null

function getSessionId(): string {
  if (_sessionId) return _sessionId
  try {
    let id = sessionStorage.getItem('pf-sid')
    if (!id) {
      id = Date.now().toString(36) + Math.random().toString(36).slice(2)
      sessionStorage.setItem('pf-sid', id)
    }
    _sessionId = id
    return id
  } catch {
    _sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2)
    return _sessionId
  }
}

export function track(event: 'page_view' | 'cart_open' | 'checkout_start'): void {
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, sessionId: getSessionId() }),
    }).catch(() => {})
  } catch {
    // silently ignore tracking errors
  }
}

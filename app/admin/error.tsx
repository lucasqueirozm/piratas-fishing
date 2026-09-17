'use client'

import { useEffect } from 'react'

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('[admin] erro na página:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--s0)' }}>
      <div className="max-w-md w-full text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
          Erro ao carregar o painel
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--ink-dim)' }}>
          {error.message || 'Ocorreu um erro inesperado.'}
        </p>
        <button
          onClick={() => unstable_retry()}
          className="px-6 py-2 rounded-xl font-semibold text-white"
          style={{ backgroundColor: '#FF6B00' }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}

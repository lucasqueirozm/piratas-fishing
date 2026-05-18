'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const CONSENT_KEY = 'cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
    // Inicializa o Google Analytics após consentimento
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MEASUREMENT_ID) {
      import('@/lib/firebase').then(({ initAnalytics }) => initAnalytics())
    }
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4">
      <div className="max-w-4xl mx-auto bg-[#111111] border border-gray-700 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-300">
          <p>
            Usamos cookies analíticos (Google Analytics) para melhorar nossa experiência.
            Dados tratados conforme nossa{' '}
            <Link href="/privacidade" className="text-[#FF6B00] hover:underline font-bold">
              Política de Privacidade
            </Link>{' '}
            (LGPD).
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm font-bold text-gray-400 border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
          >
            Recusar
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-bold text-white bg-[#FF6B00] hover:bg-[#e05f00] rounded-lg transition-colors"
          >
            Aceitar cookies
          </button>
        </div>
      </div>
    </div>
  )
}

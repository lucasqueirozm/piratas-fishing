'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useCart } from '@/components/CartContext'

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { clearCart() }, [])

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--s0)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-4xl font-black mb-3" style={{ color: 'var(--ink)' }}>Pedido Confirmado!</h1>
        <p className="mb-2" style={{ color: 'var(--ink-dim)' }}>
          Seu pagamento foi aprovado com sucesso.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-faint)' }}>
          Preparamos seu pedido para envio. Em caso de dúvidas, entre em contato conosco.
        </p>

        <div className="rounded-2xl p-6 mb-8 text-left space-y-3 border" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
          <div className="flex items-center gap-3" style={{ color: 'var(--ink-dim)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="text-sm">Em caso de dúvidas, entre em contato por e-mail.</span>
          </div>
          <div className="flex items-center gap-3" style={{ color: 'var(--ink-dim)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span className="text-sm">Prazo de entrega: 3 a 7 dias úteis.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/catalogo"
            className="flex-1 py-3 font-bold rounded-xl transition-colors text-center border"
            style={{ borderColor: 'var(--rim-str)', color: 'var(--ink)' }}
          >
            Continuar comprando
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 font-bold rounded-xl transition-colors text-center text-white"
            style={{ backgroundColor: '#FF6B00' }}
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  )
}

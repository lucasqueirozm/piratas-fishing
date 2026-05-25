import Link from 'next/link'

export default function CheckoutFailurePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--s0)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>

        <h1 className="text-4xl font-black mb-3" style={{ color: 'var(--ink)' }}>Pagamento Recusado</h1>
        <p className="mb-2" style={{ color: 'var(--ink-dim)' }}>
          Não foi possível processar seu pagamento.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-faint)' }}>
          Verifique os dados do cartão ou tente outro método de pagamento. Seu carrinho foi mantido.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/checkout"
            className="flex-1 py-3 font-bold rounded-xl transition-colors text-center text-white"
            style={{ backgroundColor: '#FF6B00' }}
          >
            Tentar novamente
          </Link>
          <Link
            href="/catalogo"
            className="flex-1 py-3 font-bold rounded-xl transition-colors text-center border"
            style={{ borderColor: 'var(--rim-str)', color: 'var(--ink)' }}
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </main>
  )
}

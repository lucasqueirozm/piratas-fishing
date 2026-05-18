import Link from 'next/link'

export default function CheckoutFailurePage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Pagamento Recusado</h1>
        <p className="text-gray-400 mb-2">
          Não foi possível processar seu pagamento.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Verifique os dados do cartão ou tente outro método de pagamento. Seu carrinho foi mantido.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/checkout" className="flex-1 py-3 bg-[#FF6B00] hover:bg-[#e05f00] text-white font-bold rounded-xl transition-colors text-center">
            Tentar novamente
          </Link>
          <Link href="/catalogo" className="flex-1 py-3 border border-gray-700 hover:border-[#FF6B00] text-white font-bold rounded-xl transition-colors text-center">
            Ver catálogo
          </Link>
        </div>
      </div>
    </main>
  )
}

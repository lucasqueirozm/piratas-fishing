import Link from 'next/link'

export default function CheckoutPendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--s0)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(234,179,8,0.15)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-4xl font-black mb-3" style={{ color: 'var(--ink)' }}>Pagamento em Análise</h1>
        <p className="mb-2" style={{ color: 'var(--ink-dim)' }}>
          Seu pedido foi recebido e o pagamento está sendo processado.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-faint)' }}>
          Isso pode acontecer com boleto bancário ou PIX. Assim que confirmado, seu pedido será preparado para envio.
        </p>

        <div className="rounded-2xl p-5 mb-8 text-left text-sm border" style={{ backgroundColor: 'var(--s1)', borderColor: 'rgba(234,179,8,0.3)', color: 'var(--ink-dim)' }}>
          <p className="font-bold mb-2" style={{ color: '#eab308' }}>O que acontece agora?</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>O pagamento será confirmado automaticamente.</li>
            <li>A entrega inicia após a confirmação do pagamento.</li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-block py-3 px-8 font-bold rounded-xl transition-colors text-white"
          style={{ backgroundColor: '#FF6B00' }}
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}

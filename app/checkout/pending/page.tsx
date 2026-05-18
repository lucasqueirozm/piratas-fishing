import Link from 'next/link'

export default function CheckoutPendingPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Pagamento em Análise</h1>
        <p className="text-gray-400 mb-2">
          Seu pedido foi recebido e o pagamento está sendo processado.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Isso pode acontecer com boleto bancário ou PIX. Assim que o pagamento for confirmado, você receberá um e-mail e seu pedido será preparado para envio.
        </p>

        <div className="bg-[#222222] border border-yellow-900/50 rounded-2xl p-5 mb-8 text-left text-sm text-gray-400">
          <p className="font-bold text-yellow-400 mb-2">O que acontece agora?</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>O pagamento será confirmado automaticamente.</li>
            <li>Você receberá um e-mail quando aprovado.</li>
            <li>A entrega inicia após a confirmação do pagamento.</li>
          </ul>
        </div>

        <Link href="/" className="inline-block py-3 px-8 bg-[#FF6B00] hover:bg-[#e05f00] text-white font-bold rounded-xl transition-colors">
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}

'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from './CartContext'

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart()
  const router = useRouter()

  if (!isCartOpen) return null

  function handleCheckout() {
    setIsCartOpen(false)
    router.push('/checkout')
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md h-full flex flex-col shadow-2xl border-l animate-in slide-in-from-right duration-300"
        style={{
          backgroundColor: 'var(--s1)',
          borderColor: 'var(--rim-str)',
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--rim)' }}>
          <div>
            <h2 className="text-base font-black uppercase tracking-widest" style={{ color: 'var(--ink)' }}>Carrinho</h2>
            {cart.length > 0 && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--ink-faint)' }}>
                {cart.reduce((acc, i) => acc + i.quantity, 0)} ite{cart.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'm' : 'ns'}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-lg transition-colors hover:bg-[rgba(255,107,0,0.08)]"
            style={{ color: 'var(--ink-faint)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-faint)', opacity: 0.4 }}>
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--ink-dim)' }}>Carrinho vazio</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>Adicione produtos para continuar.</p>
              </div>
            </div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 rounded-xl border"
                style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}
              >
                <div className="w-14 h-14 relative rounded-lg overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--rim)', backgroundColor: 'var(--s0)' }}>
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold leading-tight mb-1 truncate" style={{ color: 'var(--ink)' }}>{product.name}</h4>
                  <p className="text-[#FF6B00] font-black text-sm">{product.priceStr}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded transition-colors font-bold text-sm"
                      style={{ backgroundColor: 'var(--s4)', color: 'var(--ink-dim)' }}
                    >−</button>
                    <span className="text-sm font-bold w-5 text-center" style={{ color: 'var(--ink)' }}>{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded transition-colors font-bold text-sm"
                      style={{ backgroundColor: 'var(--s4)', color: 'var(--ink-dim)' }}
                    >+</button>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(product.id)}
                  className="p-1.5 rounded-lg transition-colors hover:text-red-500"
                  style={{ color: 'var(--ink-faint)' }}
                  aria-label="Remover"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t space-y-4" style={{ backgroundColor: 'var(--s0)', borderColor: 'var(--rim)' }}>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--ink-dim)' }}>Subtotal</span>
                <span style={{ color: 'var(--ink-dim)' }}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--ink-dim)' }}>Frete</span>
                <span className="italic text-xs" style={{ color: 'var(--ink-faint)' }}>calculado no checkout</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: 'var(--rim)' }}>
                <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--ink-dim)' }}>Total parcial</span>
                <span className="text-2xl font-black text-[#FF6B00] tracking-tighter">
                  R$ {cartTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-center" style={{ color: 'var(--ink-faint)' }}>
              Frete calculado no próximo passo.
            </p>

            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-[#FF6B00] hover:bg-[#e05f00] text-white font-bold text-sm rounded-xl uppercase tracking-wider transition-all flex justify-center items-center gap-2.5 shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.45)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Ir para o Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

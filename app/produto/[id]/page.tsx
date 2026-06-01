'use client'

import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/components/CartContext'
import { getProductById } from '@/lib/products'

type ShippingResult = { priceStr: string; deliveryTime: number } | null

export default function ProdutoPage() {
  const { id } = useParams()
  const { addToCart } = useCart()

  const [cep, setCep] = useState('')
  const [shipping, setShipping] = useState<ShippingResult>(null)
  const [shippingError, setShippingError] = useState('')
  const [loadingShip, setLoadingShip] = useState(false)

  async function calcularFrete() {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) { setShippingError('CEP inválido.'); return }
    setLoadingShip(true)
    setShipping(null)
    setShippingError('')
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: clean, totalItems: 1 }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setShippingError(data.error ?? 'Erro ao calcular frete.'); return }
      if (!data.options?.length) { setShippingError('Frete não disponível para este CEP.'); return }
      setShipping(data.options[0])
    } catch {
      setShippingError('Falha de conexão. Tente novamente.')
    } finally {
      setLoadingShip(false)
    }
  }

  const product = getProductById(Number(id))
  if (!product) notFound()

  return (
    <main className="min-h-screen flex-grow" style={{ backgroundColor: 'var(--s0)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex gap-2 text-[10px] font-semibold uppercase tracking-widest mb-10" style={{ color: 'var(--ink-faint)' }}>
          <Link href="/" className="hover:text-[#FF6B00] transition-colors">Início</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-[#FF6B00] transition-colors">Catálogo</Link>
          <span>/</span>
          <span style={{ color: 'var(--ink-dim)' }}>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

          {/* Image */}
          <div className="relative">
            <div
              className="relative w-full aspect-square rounded-2xl overflow-hidden border shadow-[0_0_60px_rgba(0,0,0,0.3)]"
              style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {/* Ambient glow behind image */}
            <div
              className="absolute -inset-6 -z-10 rounded-3xl blur-3xl opacity-15 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.5) 0%, transparent 70%)' }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center py-4">
            <span className="text-[#FF6B00] text-[10px] font-bold uppercase tracking-[0.25em] mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-2 leading-tight" style={{ color: 'var(--ink)' }}>
              {product.name}
            </h1>
            <p className="text-sm mb-6 font-medium" style={{ color: 'var(--ink-faint)' }}>{product.size}</p>

            <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--ink-dim)' }}>
              {product.description}
            </p>

            <div className="text-4xl lg:text-5xl font-black tracking-tight mb-8" style={{ color: 'var(--ink)' }}>
              {product.priceStr}
            </div>

            {/* Buy box */}
            <div className="rounded-2xl p-6 mb-6 border" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--ink-faint)' }}>
                Quantidade
              </p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[5, 10, 20, 50].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => addToCart(product, qty)}
                    className="py-3 font-semibold text-sm rounded-xl transition-all duration-200 border hover:border-[rgba(255,107,0,0.5)] hover:text-[#FF6B00]"
                    style={{ borderColor: 'var(--rim-str)', color: 'var(--ink-dim)', backgroundColor: 'transparent' }}
                  >
                    + {qty} unidades
                  </button>
                ))}
              </div>
              <button
                onClick={() => addToCart(product, 1)}
                className="w-full py-4 bg-[#FF6B00] hover:bg-[#e05f00] text-white font-bold text-base rounded-xl uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,107,0,0.25)] hover:shadow-[0_0_32px_rgba(255,107,0,0.45)] hover:-translate-y-0.5"
              >
                Adicionar 1 Unidade
              </button>

              {product.price < 100 && (
                <p className="text-xs mt-3 pt-3 border-t" style={{ borderColor: 'var(--rim)', color: 'var(--ink-faint)' }}>
                  Pedido mínimo R$ 100 — ao menos {Math.ceil(100 / product.price)} unidades desta isca para finalizar a compra.
                </p>
              )}
            </div>

            {/* Shipping calculator */}
            <div className="rounded-2xl p-5 mb-6 border" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--ink-faint)' }}>
                Calcular frete
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="00000-000"
                  maxLength={9}
                  value={cep}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 8)
                    setCep(v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && calcularFrete()}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium outline-none border transition-colors"
                  style={{ backgroundColor: 'var(--s3)', borderColor: 'var(--rim-str)', color: 'var(--ink)' }}
                />
                <button
                  onClick={calcularFrete}
                  disabled={loadingShip}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#FF6B00', color: '#fff' }}
                >
                  {loadingShip ? 'Calculando...' : 'Calcular'}
                </button>
              </div>
              {shippingError && (
                <p className="mt-2 text-xs" style={{ color: '#f87171' }}>{shippingError}</p>
              )}
              {shipping && (
                <div className="mt-3 flex items-center justify-between rounded-xl px-4 py-3 border" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--ink-dim)' }}>
                    SEDEX — {shipping.deliveryTime} dias úteis
                  </span>
                  <span className="text-base font-black" style={{ color: '#FF6B00' }}>
                    {shipping.priceStr}
                  </span>
                </div>
              )}
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" /><rect x="9" y="11" width="14" height="10" rx="2" /><circle cx="12" cy="20" r="1" /><circle cx="20" cy="20" r="1" /></svg>, text: 'Envio para todo Brasil' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>, text: 'Compra segura' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>, text: 'PIX, boleto ou cartão' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>, text: 'Embalagem segura' },
              ].map((t) => (
                <div key={t.text} className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>
                  <span className="text-[#FF6B00] opacity-70">{t.icon}</span>
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

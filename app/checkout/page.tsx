'use client'

import { useState, useTransition, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'
import type { ShippingOption } from '@/app/api/shipping/route'

type FormData = {
  name: string
  email: string
  cpf: string
  phone: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

function formatCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function formatCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2')
}

type ShippingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; options: ShippingOption[] }
  | { status: 'error'; message: string }
  | { status: 'unconfigured' }

export default function CheckoutPage() {
  const { cart, cartTotal, cartItemCount } = useCart()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [form, setForm] = useState<FormData>({
    name: '', email: '', cpf: '', phone: '',
    cep: '', street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '',
  })

  const [shipping, setShipping] = useState<ShippingState>({ status: 'idle' })
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)

  const shippingCost = selectedShipping?.price ?? 0
  const finalTotal = cartTotal + shippingCost

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    let formatted = value
    if (name === 'cpf') formatted = formatCPF(value)
    if (name === 'phone') formatted = formatPhone(value)
    if (name === 'cep') formatted = formatCEP(value)
    setForm((prev) => ({ ...prev, [name]: formatted }))

    if (name === 'cep' && value.replace(/\D/g, '').length < 8) {
      setShipping({ status: 'idle' })
      setSelectedShipping(null)
    }
  }

  const calculateShipping = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return

    setShipping({ status: 'loading' })
    setSelectedShipping(null)

    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: clean, totalItems: cartItemCount }),
      })

      const data = await res.json() as { options?: ShippingOption[]; error?: string }

      if (!res.ok) {
        if (res.status === 503) {
          setShipping({ status: 'unconfigured' })
        } else {
          setShipping({ status: 'error', message: data.error ?? 'Erro ao calcular frete.' })
        }
        return
      }

      if (!data.options || data.options.length === 0) {
        setShipping({ status: 'error', message: 'Nenhuma opção de frete disponível para este CEP.' })
        return
      }

      setShipping({ status: 'ok', options: data.options })
    } catch {
      setShipping({ status: 'error', message: 'Falha de conexão ao calcular frete.' })
    }
  }, [cartItemCount])

  async function fetchAddress(cep: string) {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json() as { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean }
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          street: data.logradouro ?? '',
          neighborhood: data.bairro ?? '',
          city: data.localidade ?? '',
          state: data.uf ?? '',
        }))
      }
    } catch { /* ViaCEP indisponível — usuário preenche manualmente */ }

    await calculateShipping(cep)
  }

  function validate(): string {
    if (!form.name.trim()) return 'Informe seu nome completo.'
    if (!form.email.includes('@')) return 'Informe um e-mail válido.'
    if (form.cpf.replace(/\D/g, '').length !== 11) return 'CPF inválido.'
    if (form.phone.replace(/\D/g, '').length < 10) return 'Telefone inválido.'
    if (form.cep.replace(/\D/g, '').length !== 8) return 'CEP inválido.'
    if (!form.street.trim()) return 'Informe o logradouro.'
    if (!form.number.trim()) return 'Informe o número.'
    if (!form.neighborhood.trim()) return 'Informe o bairro.'
    if (!form.city.trim()) return 'Informe a cidade.'
    if (!form.state) return 'Selecione o estado.'
    if (cart.length === 0) return 'Seu carrinho está vazio.'
    if (!selectedShipping && shipping.status !== 'unconfigured') return 'Selecione uma opção de frete.'
    return ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')

    startTransition(async () => {
      try {
        const res = await fetch('/api/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: {
              name: form.name,
              email: form.email,
              cpf: form.cpf.replace(/\D/g, ''),
              phone: form.phone.replace(/\D/g, ''),
              address: {
                cep: form.cep.replace(/\D/g, ''),
                street: form.street,
                number: form.number,
                complement: form.complement,
                neighborhood: form.neighborhood,
                city: form.city,
                state: form.state,
              },
            },
            items: cart.map(({ product, quantity }) => ({
              productId: product.id,
              productName: product.name,
              quantity,
              unitPrice: product.price,
              totalPrice: product.price * quantity,
              image: product.image,
            })),
            subtotal: cartTotal,
            shipping: shippingCost,
            shippingService: selectedShipping ? `${selectedShipping.company} – ${selectedShipping.name}` : 'A combinar',
            total: finalTotal,
          }),
        })

        const data = await res.json() as { initPoint?: string; error?: string }
        if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar pagamento.')
        window.location.href = data.initPoint!
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
      }
    })
  }

  const inputStyle = { backgroundColor: 'var(--s1)', borderColor: 'var(--rim-str)', color: 'var(--ink)' }
  const inputClass = 'w-full rounded-lg px-4 py-3 outline-none transition-colors border'

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--s0)', color: 'var(--ink)' }}>
        <h1 className="text-3xl font-black mb-4">Carrinho vazio</h1>
        <p className="mb-8" style={{ color: 'var(--ink-dim)' }}>Adicione produtos antes de finalizar a compra.</p>
        <Link href="/catalogo" className="bg-[#FF6B00] hover:bg-[#e05f00] text-white font-bold px-8 py-3 rounded-lg transition-colors">
          Ver Catálogo
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4" style={{ backgroundColor: 'var(--s0)', color: 'var(--ink)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/catalogo" className="text-sm transition-colors hover:text-[#FF6B00]" style={{ color: 'var(--ink-faint)' }}>
            ← Continuar comprando
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-wider mt-2">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">

            {/* Dados Pessoais */}
            <section className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}>
              <h2 className="text-xl font-black uppercase tracking-wider mb-5 text-[#FF6B00]">Dados Pessoais</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1" style={{ color: 'var(--ink-faint)' }}>Nome completo *</label>
                  <input name="name" value={form.name} onChange={handleChange} required className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--ink-faint)' }}>E-mail *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--ink-faint)' }}>CPF *</label>
                  <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--ink-faint)' }}>Telefone *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="(21) 99999-9999" className={inputClass} style={inputStyle} />
                </div>
              </div>
            </section>

            {/* Endereço de Entrega */}
            <section className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}>
              <h2 className="text-xl font-black uppercase tracking-wider mb-5 text-[#FF6B00]">Endereço de Entrega</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--ink-faint)' }}>CEP *</label>
                  <div className="relative">
                    <input
                      name="cep"
                      value={form.cep}
                      onChange={handleChange}
                      onBlur={(e) => fetchAddress(e.target.value)}
                      placeholder="00000-000"
                      className={`${inputClass} pr-10`}
                      style={inputStyle}
                    />
                    {shipping.status === 'loading' && (
                      <svg className="animate-spin h-4 w-4 text-[#FF6B00] absolute right-3 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1" style={{ color: 'var(--ink-faint)' }}>Logradouro *</label>
                  <input name="street" value={form.street} onChange={handleChange} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--ink-faint)' }}>Número *</label>
                  <input name="number" value={form.number} onChange={handleChange} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--ink-faint)' }}>Complemento</label>
                  <input name="complement" value={form.complement} onChange={handleChange} placeholder="Apto, bloco..." className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--ink-faint)' }}>Bairro *</label>
                  <input name="neighborhood" value={form.neighborhood} onChange={handleChange} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--ink-faint)' }}>Cidade *</label>
                  <input name="city" value={form.city} onChange={handleChange} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--ink-faint)' }}>Estado *</label>
                  <select name="state" value={form.state} onChange={handleChange} className={inputClass} style={inputStyle}>
                    <option value="">Selecione</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Opções de Frete */}
            <section className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}>
              <h2 className="text-xl font-black uppercase tracking-wider mb-1 text-[#FF6B00]">Frete</h2>
              <p className="text-xs mb-5" style={{ color: 'var(--ink-faint)' }}>Calculado automaticamente ao informar o CEP.</p>

              {shipping.status === 'idle' && (
                <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>Preencha o CEP acima para ver as opções de entrega.</p>
              )}

              {shipping.status === 'loading' && (
                <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--ink-dim)' }}>
                  <svg className="animate-spin h-5 w-5 text-[#FF6B00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Calculando opções de frete...
                </div>
              )}

              {shipping.status === 'error' && (
                <p className="text-red-400 text-sm">{shipping.message}</p>
              )}

              {shipping.status === 'unconfigured' && (
                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 text-sm text-yellow-300">
                  Integração com Melhor Envio ainda não configurada. O frete será combinado com o vendedor após o pedido.
                </div>
              )}

              {shipping.status === 'ok' && (
                <div className="space-y-3">
                  {shipping.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedShipping?.id === opt.id ? 'border-[#FF6B00] bg-[#FF6B00]/10' : ''
                      }`}
                      style={selectedShipping?.id !== opt.id ? { borderColor: 'var(--rim-str)' } : undefined}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        className="sr-only"
                        checked={selectedShipping?.id === opt.id}
                        onChange={() => setSelectedShipping(opt)}
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selectedShipping?.id === opt.id ? 'border-[#FF6B00] bg-[#FF6B00]' : ''}`}
                          style={selectedShipping?.id !== opt.id ? { borderColor: 'var(--rim-str)' } : undefined}
                        />
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{opt.company} — {opt.name}</p>
                          <p className="text-xs" style={{ color: 'var(--ink-dim)' }}>
                            {opt.deliveryRange.min === opt.deliveryRange.max
                              ? `${opt.deliveryRange.min} dias úteis`
                              : `${opt.deliveryRange.min}–${opt.deliveryRange.max} dias úteis`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[#FF6B00] font-black text-lg whitespace-nowrap">{opt.priceStr}</span>
                    </label>
                  ))}
                </div>
              )}
            </section>

            {error && (
              <div className="bg-red-900/40 border border-red-600 text-red-300 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
              Ao finalizar, você concorda com nossa{' '}
              <Link href="/privacidade" className="underline hover:text-[#FF6B00]">Política de Privacidade</Link>.
              Seus dados são tratados conforme a LGPD.
            </p>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 border sticky top-24" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}>
              <h2 className="text-xl font-black uppercase tracking-wider mb-5 text-[#FF6B00]">Resumo</h2>

              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 relative rounded-md overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--s1)' }}>
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>{product.name}</p>
                      <p className="text-xs" style={{ color: 'var(--ink-dim)' }}>Qtd: {quantity}</p>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--ink)' }}>
                      R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2" style={{ borderColor: 'var(--rim)' }}>
                <div className="flex justify-between text-sm" style={{ color: 'var(--ink-dim)' }}>
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: 'var(--ink-dim)' }}>
                  <span>Frete</span>
                  <span>
                    {selectedShipping
                      ? selectedShipping.priceStr
                      : shipping.status === 'unconfigured'
                        ? 'A combinar'
                        : <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>—</span>
                    }
                  </span>
                </div>
                <div className="flex justify-between font-black text-xl pt-2 border-t" style={{ color: 'var(--ink)', borderColor: 'var(--rim)' }}>
                  <span>Total</span>
                  <span className="text-[#FF6B00]">
                    R$ {finalTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {selectedShipping && (
                <div className="mt-3 text-xs flex items-center gap-1" style={{ color: 'var(--ink-faint)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  {selectedShipping.company} — {selectedShipping.deliveryRange.min}–{selectedShipping.deliveryRange.max} dias úteis
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-5 py-4 bg-[#FF6B00] hover:bg-[#e05f00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg rounded-xl uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Aguarde...
                  </>
                ) : 'Pagar Agora'}
              </button>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--ink-faint)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Pagamento via Mercado Pago
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

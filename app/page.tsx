'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'
import { products } from '@/lib/products'

const featured = [
  products.find((p) => p.id === 13)!,
  products.find((p) => p.id === 24)!,
  products.find((p) => p.id === 20)!,
]

const stats = [
  { value: '31', label: 'Modelos' },
  { value: '5', label: 'Linhas' },
  { value: 'Brasil', label: 'Entrega' },
  { value: 'MP', label: 'Pagamento' },
]

const features = [
  {
    title: 'Isca Artificial',
    desc: 'Alta durabilidade e máxima atração em água doce e salgada.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
        <path d="m6 17 3.13-5.78c.53-.97.43-2.17-.3-3.05C7.86 7.09 7 5.96 7 4.5a3.5 3.5 0 0 1 7 0c0 1.46-.86 2.59-1.83 3.67-.73.88-.83 2.08-.3 3.05L15 17" />
        <path d="M9.5 14.5h5" />
      </svg>
    ),
  },
  {
    title: 'Entrega Nacional',
    desc: 'Enviamos para todo o Brasil pelos Correios com rastreamento em tempo real.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
        <rect x="9" y="11" width="14" height="10" rx="2" />
        <circle cx="12" cy="20" r="1" /><circle cx="20" cy="20" r="1" />
      </svg>
    ),
  },
  {
    title: 'Compra Segura',
    desc: 'PIX, boleto ou cartão via Mercado Pago. Seus dados protegidos pela LGPD.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Alta Performance',
    desc: 'Desenvolvidas e testadas por pescadores profissionais em condições reais.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m13 2-2 2.5h3L12 7" /><path d="M10 14v-3" /><path d="M14 14v-3" />
        <path d="M11 19c-1.7 0-3-1.3-3-3v-2" /><path d="M13 19c1.7 0 3-1.3 3-3v-2" />
        <path d="M9 11H6.5a2 2 0 0 1 0-4H9" /><path d="M15 11h2.5a2 2 0 0 0 0-4H15" />
      </svg>
    ),
  },
]

export default function Home() {
  const { addToCart } = useCart()

  return (
    <main className="selection:bg-[#FF6B00] selection:text-white flex-grow">

      {/* ─── HERO ─── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'var(--s0)' }}
      >
        {/* Optional photo backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.10]"
          style={{ backgroundImage: "url('/hero_bg.jpg')" }}
        />
        {/* Atmospheric gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 62% 38%, rgba(139,0,0,0.38) 0%, transparent 52%),' +
              'radial-gradient(ellipse at 16% 82%, rgba(255,107,0,0.18) 0%, transparent 42%),' +
              'radial-gradient(ellipse at 84% 12%, rgba(255,107,0,0.08) 0%, transparent 38%)',
          }}
        />
        {/* Floating orbs */}
        <div
          className="absolute top-1/4 left-[12%] w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 70%)',
            animation: 'float-slow 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/4 right-[8%] w-[26rem] h-[26rem] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139,0,0,0.09) 0%, transparent 70%)',
            animation: 'float-slow 16s ease-in-out infinite reverse',
          }}
        />
        {/* Vertical accent lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 bottom-0 w-px left-[20%]" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,107,0,0.10) 35%, rgba(255,107,0,0.10) 65%, transparent)' }} />
          <div className="absolute top-0 bottom-0 w-px right-[20%]" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,107,0,0.06) 35%, rgba(255,107,0,0.06) 65%, transparent)' }} />
        </div>

        {/* Content */}
        <div
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
          style={{ animation: 'fadeInUp 0.7s ease-out both' }}
        >
          <div className="inline-flex items-center gap-2 border text-[#FF6B00] text-[10px] font-bold uppercase tracking-[0.22em] px-5 py-2 rounded-full mb-10" style={{ borderColor: 'rgba(255,107,0,0.28)', backgroundColor: 'rgba(255,107,0,0.06)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
            Iscas de Pesca de Alta Performance
          </div>

          <h1 className="font-black uppercase tracking-tighter leading-none mb-6">
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[7rem]" style={{ color: 'var(--ink)' }}>
              PIRATAS
            </span>
            <span
              className="block text-6xl sm:text-7xl md:text-8xl lg:text-[7rem]"
              style={{ WebkitTextStroke: '2px #FF6B00', color: 'transparent' }}
            >
              FISHING
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl font-light mb-14 max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
            O segredo da fisgada está na isca certa.{' '}
            <span className="font-semibold text-[#FF6B00]">31 modelos</span> para você pescar mais.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="px-10 py-4 bg-[#FF6B00] hover:bg-[#e05f00] text-white font-bold tracking-wider rounded-lg uppercase text-sm transition-all hover:-translate-y-0.5 shadow-[0_0_28px_rgba(255,107,0,0.30)] hover:shadow-[0_0_40px_rgba(255,107,0,0.50)]"
            >
              Ver Catálogo
            </Link>
            <Link
              href="#produtos"
              className="px-10 py-4 border font-bold tracking-wider rounded-lg uppercase text-sm transition-all hover:-translate-y-0.5 hover:text-[#FF6B00]"
              style={{ borderColor: 'var(--rim-str)', color: 'var(--ink-dim)' }}
            >
              Ver Destaques
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
          style={{ animation: 'scroll-hint 2.4s ease-in-out infinite' }}
        >
          <div className="w-px h-10 bg-gradient-to-b from-[#FF6B00]/40 to-transparent" />
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <div style={{ backgroundColor: 'var(--s2)', borderTop: '1px solid var(--rim)', borderBottom: '1px solid var(--rim)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-black tracking-tighter text-[#FF6B00]">{s.value}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--ink-faint)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── POR QUE NOS ESCOLHER ─── */}
      <section style={{ backgroundColor: 'var(--s1)' }} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#FF6B00] text-[10px] font-bold uppercase tracking-[0.28em] mb-4">Por que nos escolher</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
              Feito para Pescar Mais
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-8 group transition-all duration-300 hover:-translate-y-1 border"
                style={{
                  backgroundColor: 'var(--s2)',
                  borderColor: 'var(--rim)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,0,0.30)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--rim)' }}
              >
                <div className="text-[#FF6B00] opacity-70 group-hover:opacity-100 transition-opacity mb-5">
                  {f.icon}
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wide mb-3" style={{ color: 'var(--ink)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUTOS EM DESTAQUE ─── */}
      <section id="produtos" style={{ backgroundColor: 'var(--s0)' }} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-[#FF6B00] text-[10px] font-bold uppercase tracking-[0.28em] mb-3">Selecionados para você</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
                Destaques
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition-colors hover:text-[#FF6B00]"
              style={{ color: 'var(--ink-faint)' }}
            >
              Ver todos
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {featured.map((p, i) => (
              <div
                key={p.id}
                className="group relative rounded-2xl overflow-hidden border transition-all duration-400 hover:-translate-y-1.5"
                style={{
                  backgroundColor: 'var(--s2)',
                  borderColor: 'var(--rim)',
                  boxShadow: 'none',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(255,107,0,0.30)'
                  el.style.boxShadow = '0 20px 48px rgba(255,107,0,0.08)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--rim)'
                  el.style.boxShadow = 'none'
                }}
              >
                <Link href={`/produto/${p.id}`} className="absolute inset-0 z-10" />
                {i === 0 && (
                  <div className="absolute top-3 right-3 z-20 bg-[#FF6B00] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    Destaque
                  </div>
                )}
                <div className="relative h-56 overflow-hidden" style={{ backgroundColor: 'var(--s1)' }}>
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <p className="text-[#FF6B00] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">{p.category}</p>
                  <h3 className="font-bold text-base leading-tight mb-1" style={{ color: 'var(--ink)' }}>{p.name}</h3>
                  <p className="text-xs mb-5" style={{ color: 'var(--ink-faint)' }}>{p.size}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black tracking-tighter" style={{ color: 'var(--ink)' }}>{p.priceStr}</span>
                    <button
                      onClick={(e) => { e.preventDefault(); addToCart(p) }}
                      className="relative z-20 px-4 py-2 bg-[#FF6B00] hover:bg-[#e05f00] text-white font-semibold text-xs rounded-lg uppercase tracking-wide transition-colors"
                    >
                      + Carrinho
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/catalogo"
              className="inline-block px-10 py-3.5 border-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white font-semibold text-sm rounded-lg uppercase tracking-widest transition-all hover:shadow-[0_0_24px_rgba(255,107,0,0.35)]"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* ─── COMO COMPRAR ─── */}
      <section style={{ backgroundColor: 'var(--s1)', borderTop: '1px solid var(--rim)' }} className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(139,0,0,0.05) 0%, transparent 55%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#FF6B00] text-[10px] font-bold uppercase tracking-[0.28em] mb-4">Simples assim</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
              Como Comprar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-9 left-[calc(33.33%+2rem)] right-[calc(33.33%+2rem)] h-px" style={{ background: 'linear-gradient(to right, rgba(255,107,0,0.15), rgba(255,107,0,0.35), rgba(255,107,0,0.15))' }} />

            {[
              { n: '01', title: 'Escolha sua isca', desc: 'Navegue pelo catálogo e adicione ao carrinho.' },
              { n: '02', title: 'Informe seu endereço', desc: 'Preencha seus dados e calcule o frete em tempo real.' },
              { n: '03', title: 'Pague com segurança', desc: 'PIX, boleto ou cartão via Mercado Pago.' },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center px-6">
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-6 relative z-10 border"
                  style={{
                    backgroundColor: 'var(--s2)',
                    borderColor: 'rgba(255,107,0,0.25)',
                    boxShadow: '0 0 20px rgba(255,107,0,0.06)',
                  }}
                >
                  <span className="text-[#FF6B00] font-black text-lg tracking-tighter">{step.n}</span>
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wide mb-3" style={{ color: 'var(--ink)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ backgroundColor: 'var(--s0)', borderTop: '1px solid var(--rim)' }} className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-lg font-black tracking-widest mb-2" style={{ color: 'var(--ink)' }}>🏴‍☠️ Piratas Fishing</p>
              <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>O Segredo da Fisgada.</p>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 pb-2 border-b border-[rgba(255,107,0,0.3)]" style={{ color: 'var(--ink)' }}>
                Links Rápidos
              </h4>
              <ul className="space-y-3 text-center md:text-left w-full">
                {[
                  { href: '/catalogo', label: 'Catálogo' },
                  { href: '/sobre', label: 'Sobre' },
                  { href: '/contato', label: 'Contato' },
                  { href: '/privacidade', label: 'Privacidade' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm font-medium transition-colors hover:text-[#FF6B00]" style={{ color: 'var(--ink-faint)' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 pb-2 border-b border-[rgba(255,107,0,0.3)]" style={{ color: 'var(--ink)' }}>
                Contato
              </h4>
              <ul className="space-y-3 w-full">
                {process.env.NEXT_PUBLIC_EMAIL && (
                  <li>
                    <a
                      href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}
                      className="flex items-center justify-center md:justify-start gap-2.5 text-sm font-medium transition-colors hover:text-[#FF6B00]"
                      style={{ color: 'var(--ink-faint)' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      E-mail
                    </a>
                  </li>
                )}
                <li>
                  <a href="#" className="flex items-center justify-center md:justify-start gap-2.5 text-sm font-medium transition-colors hover:text-[#E1306C]" style={{ color: 'var(--ink-faint)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 text-center" style={{ borderTop: '1px solid var(--rim)' }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>
              © 2026 Piratas Fishing. Todos os direitos reservados.{' '}
              <Link href="/privacidade" className="hover:text-[#FF6B00] transition-colors">Política de Privacidade</Link>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useCart } from './CartContext'
import { useTheme } from './ThemeProvider'
import { products, categories } from '@/lib/products'

const staticLinks = [
  { href: '/', label: 'Início' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
]

const categoryMeta: Record<string, { slug: string; icon: React.ReactNode }> = {
  'Camarão Turbo': {
    slug: 'Camarão Turbo',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10" /><path d="M12 2c2.5 2.5 4 6 4 10" /><path d="M2 12h10" /><path d="m19 16-3-3 3-3" /><path d="M22 16h-6" />
      </svg>
    ),
  },
  'Pirata Turbo': {
    slug: 'Pirata Turbo',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12" /><path d="m4.93 4.93 4.24 4.24" /><path d="M2 12h3" /><path d="M19 5 5 19" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  'Shad Turbo': {
    slug: 'Shad Turbo',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
        <path d="M18 12h3" /><circle cx="20" cy="12" r="1" fill="currentColor" />
        <path d="M6.5 12 3 10" /><path d="M6.5 12 3 14" />
      </svg>
    ),
  },
  'Shad Pirata': {
    slug: 'Shad Pirata',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
        <path d="M18 12h3" /><circle cx="20" cy="12" r="1" fill="currentColor" />
        <path d="M6.5 12 3 10" /><path d="M6.5 12 3 14" />
        <path d="M12 9v6" />
      </svg>
    ),
  },
  'Caixa / Kit': {
    slug: 'Caixa / Kit',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
      </svg>
    ),
  },
}

export default function Navbar() {
  const { setIsCartOpen, cartItemCount } = useCart()
  const { theme, toggle } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const catalogRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openCatalog() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setCatalogOpen(true)
  }

  function scheduleCatalogClose() {
    closeTimerRef.current = setTimeout(() => setCatalogOpen(false), 150)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catalogRef.current && !catalogRef.current.contains(e.target as Node)) {
        setCatalogOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const totalProducts = products.length

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md border-b shadow-[0_2px_20px_rgba(0,0,0,0.35)]'
          : 'border-b'
      }`}
      style={{
        backgroundColor: scrolled ? 'color-mix(in srgb, var(--s0) 92%, transparent)' : 'var(--s1)',
        borderColor: 'var(--rim)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <span className="text-base font-black tracking-widest uppercase transition-colors duration-200 group-hover:text-[#FF6B00]" style={{ color: 'var(--ink)' }}>
              🏴‍☠️ Piratas Fishing
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {staticLinks.slice(0, 1).map((l) => (
              <NavLink key={l.href} href={l.href}>{l.label}</NavLink>
            ))}

            {/* Catálogo with mega menu */}
            <div
              ref={catalogRef}
              className="relative"
              onMouseEnter={openCatalog}
              onMouseLeave={scheduleCatalogClose}
            >
              <div className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-[rgba(255,107,0,0.05)] transition-colors duration-150">
                <Link
                  href="/catalogo"
                  className="text-sm font-semibold uppercase tracking-wider transition-colors duration-150 hover:text-[#FF6B00]"
                  style={{ color: 'var(--ink-dim)' }}
                >
                  Catálogo
                </Link>
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform duration-200 ${catalogOpen ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--ink-dim)' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Mega menu panel */}
              {catalogOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[520px] rounded-2xl border shadow-2xl p-6"
                  onMouseEnter={openCatalog}
                  onMouseLeave={scheduleCatalogClose}
                  style={{
                    backgroundColor: 'var(--s3)',
                    borderColor: 'var(--rim-str)',
                    animation: 'mega-open 0.18s ease-out both',
                  }}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--ink-faint)' }}>
                    Tipos de Isca
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {categories.map((cat) => {
                      const count = products.filter((p) => p.category === cat).length
                      const meta = categoryMeta[cat]
                      return (
                        <Link
                          key={cat}
                          href={`/catalogo?c=${encodeURIComponent(cat)}`}
                          onClick={() => setCatalogOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150 group/item hover:bg-[rgba(255,107,0,0.07)] border border-transparent hover:border-[rgba(255,107,0,0.2)]"
                        >
                          <span className="flex-shrink-0 text-[#FF6B00] opacity-70 group-hover/item:opacity-100 transition-opacity">
                            {meta?.icon}
                          </span>
                          <div>
                            <p className="text-sm font-bold transition-colors group-hover/item:text-[#FF6B00]" style={{ color: 'var(--ink)' }}>
                              {cat}
                            </p>
                            <p className="text-[11px]" style={{ color: 'var(--ink-faint)' }}>
                              {count} modelo{count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  <div className="pt-3 border-t" style={{ borderColor: 'var(--rim)' }}>
                    <Link
                      href="/catalogo"
                      onClick={() => setCatalogOpen(false)}
                      className="flex items-center justify-between text-sm font-bold text-[#FF6B00] hover:text-[#e05f00] transition-colors"
                    >
                      <span>Ver catálogo completo</span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>{totalProducts} modelos</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {staticLinks.slice(1).map((l) => (
              <NavLink key={l.href} href={l.href}>{l.label}</NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-0.5">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2.5 rounded-lg transition-colors hover:bg-[rgba(255,107,0,0.08)]"
              style={{ color: 'var(--ink-dim)' }}
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-lg transition-colors hover:bg-[rgba(255,107,0,0.08)]"
              style={{ color: 'var(--ink-dim)' }}
              aria-label="Abrir carrinho"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#FF6B00] text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 border-2" style={{ borderColor: 'var(--s1)' }}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2.5 rounded-lg transition-colors hover:bg-[rgba(255,107,0,0.08)]"
              style={{ color: 'var(--ink-dim)' }}
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-4" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}>
          {staticLinks.slice(0, 1).map((l) => (
            <MobileLink key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
              {l.label}
            </MobileLink>
          ))}

          {/* Catálogo expandable */}
          <div>
            <button
              onClick={() => setMobileCatalogOpen((v) => !v)}
              className="flex items-center justify-between w-full py-3 px-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors"
              style={{ color: 'var(--ink-dim)' }}
            >
              Catálogo
              <svg
                xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                className={`transition-transform duration-200 ${mobileCatalogOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {mobileCatalogOpen && (
              <div className="ml-4 mb-2 space-y-1">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat).length
                  return (
                    <Link
                      key={cat}
                      href={`/catalogo?c=${encodeURIComponent(cat)}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-2 px-4 rounded-lg text-sm font-medium transition-colors hover:text-[#FF6B00]"
                      style={{ color: 'var(--ink-dim)' }}
                    >
                      <span>{cat}</span>
                      <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>{count}</span>
                    </Link>
                  )
                })}
                <Link
                  href="/catalogo"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 px-4 text-sm font-bold text-[#FF6B00]"
                >
                  Ver tudo →
                </Link>
              </div>
            )}
          </div>

          {staticLinks.slice(1).map((l) => (
            <MobileLink key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
              {l.label}
            </MobileLink>
          ))}
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors duration-150 hover:text-[#FF6B00] hover:bg-[rgba(255,107,0,0.05)]"
      style={{ color: 'var(--ink-dim)' }}
    >
      {children}
    </Link>
  )
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-3 px-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors hover:text-[#FF6B00]"
      style={{ color: 'var(--ink-dim)' }}
    >
      {children}
    </Link>
  )
}

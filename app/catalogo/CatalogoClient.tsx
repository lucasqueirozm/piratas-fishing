'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { categories, type Product } from '@/lib/product-types'

export default function CatalogoClient({ products }: { products: Product[] }) {
  // Multi-seleção de categorias. Vazio = mostra todas.
  const [selected, setSelected] = useState<string[]>([])
  const searchParams = useSearchParams()
  const cParam = searchParams.get('c')

  // Aplica o ?c= do menu suspenso — reage a cada navegação (mesmo já estando
  // na página do catálogo, quando só o parâmetro muda).
  useEffect(() => {
    if (cParam && (categories as string[]).includes(cParam)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected([cParam])
    }
  }, [cParam])

  function toggleCategory(cat: string) {
    setSelected((prev) => (prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat]))
  }

  const filtered =
    selected.length === 0
      ? products
      : products.filter((p) => selected.includes(p.category))

  return (
    <main className="min-h-screen flex-grow" style={{ backgroundColor: 'var(--s0)' }}>
      {/* Page header */}
      <div className="py-14 border-b" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight mb-4" style={{ color: 'var(--ink)' }}>
            Catálogo
          </h1>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--ink-dim)' }}>
            {products.length} modelos disponíveis — encontre o ideal para sua próxima pescaria.
          </p>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div
        className="sticky top-[72px] z-40 border-b py-4"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--s0) 92%, transparent)',
          borderColor: 'var(--rim)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <FilterBtn
              label="Todos"
              count={products.length}
              active={selected.length === 0}
              onClick={() => setSelected([])}
            />
            {categories.map((cat) => (
              <FilterBtn
                key={cat}
                label={cat}
                count={products.filter((p) => p.category === cat).length}
                active={selected.includes(cat)}
                onClick={() => toggleCategory(cat)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--ink-faint)' }}>
          {filtered.length} produto{filtered.length !== 1 ? 's' : ''}
          {selected.length > 0 ? ` · ${selected.join(' + ')}` : ''}
        </p>
        {filtered.length === 0 ? (
          <p className="text-sm py-16 text-center" style={{ color: 'var(--ink-faint)' }}>
            Nenhum produto nesta categoria no momento.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function FilterBtn({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border"
      style={
        active
          ? {
              backgroundColor: '#FF6B00',
              borderColor: '#FF6B00',
              color: '#ffffff',
              boxShadow: '0 0 12px rgba(255,107,0,0.25)',
            }
          : {
              backgroundColor: 'transparent',
              borderColor: 'var(--rim-str)',
              color: 'var(--ink-dim)',
            }
      }
    >
      {label}
      <span className="ml-1.5" style={{ opacity: 0.65 }}>{count}</span>
    </button>
  )
}

function ProductCard({ product: p }: { product: Product }) {
  const router = useRouter()
  return (
    <div
      className="group relative rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-0.5 border"
      style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(255,107,0,0.25)'
        el.style.boxShadow = '0 8px 28px rgba(255,107,0,0.07)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--rim)'
        el.style.boxShadow = 'none'
      }}
    >
      <Link href={`/produto/${p.id}`} className="absolute inset-0 z-10" />

      {/* Image */}
      <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: 'var(--s1)' }}>
        {p.image ? (
          <Image
            src={p.image}
            alt={p.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-600"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--rim-str)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
              <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6-3.56 0-7.56-2.54-8.5-6Z"/>
              <circle cx="17.5" cy="12" r="0.5" fill="currentColor"/>
              <path d="M2 12c1 2 3 4 5 4"/>
            </svg>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold uppercase tracking-widest border border-white/35 px-3 py-1.5 rounded-full" style={{ backdropFilter: 'blur(4px)' }}>
            Ver Produto
          </span>
        </div>
        <span
          className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)' }}
        >
          {p.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-bold leading-tight mb-1 line-clamp-2" style={{ color: 'var(--ink)' }}>{p.name}</h3>
        <p className="text-[10px] mb-2" style={{ color: 'var(--ink-faint)' }}>{p.sizes.join(' · ')}</p>
        <p className="text-[#FF6B00] text-base font-black tracking-tight mt-auto mb-2">{p.priceStr}</p>
        <button
          onClick={(e) => { e.preventDefault(); router.push(`/produto/${p.id}`) }}
          className="relative z-20 w-full text-center py-2 bg-[#FF6B00] hover:bg-[#e05f00] text-white font-semibold text-xs rounded-lg uppercase tracking-wide transition-colors"
        >
          Escolher Tamanho
        </button>
      </div>
    </div>
  )
}

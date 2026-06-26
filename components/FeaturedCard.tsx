'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/product-types'

export default function FeaturedCard({ product: p, highlight }: { product: Product; highlight?: boolean }) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden border transition-all duration-400 hover:-translate-y-1.5"
      style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)', boxShadow: 'none' }}
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
      {highlight && (
        <div className="absolute top-3 right-3 z-20 bg-[#FF6B00] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
          Destaque
        </div>
      )}
      <div className="relative h-56 overflow-hidden" style={{ backgroundColor: 'var(--s1)' }}>
        {p.image ? (
          <Image
            src={p.image}
            alt={p.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--rim-str)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
              <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6-3.56 0-7.56-2.54-8.5-6Z" />
              <circle cx="17.5" cy="12" r="0.5" fill="currentColor" />
              <path d="M2 12c1 2 3 4 5 4" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>
      <div className="p-6">
        <p className="text-[#FF6B00] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">{p.category}</p>
        <h3 className="font-bold text-base leading-tight mb-1" style={{ color: 'var(--ink)' }}>{p.name}</h3>
        <p className="text-xs mb-5" style={{ color: 'var(--ink-faint)' }}>{p.sizes.join(' · ')}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>{p.priceStr}</span>
          <Link
            href={`/produto/${p.id}`}
            onClick={(e) => e.stopPropagation()}
            className="relative z-20 px-4 py-2 bg-[#FF6B00] hover:bg-[#e05f00] text-white font-semibold text-xs rounded-lg uppercase tracking-wide transition-colors"
          >
            Ver Produto
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { categories, SIZE_PRESETS, formatPrice, type ProductCategory } from '@/lib/product-types'

type AdminProduct = {
  id: number
  name: string
  description: string
  price: number | string
  sizes: string[]
  image: string
  category: ProductCategory
  active: boolean
}

const EMPTY: Omit<AdminProduct, 'id'> = {
  name: '', description: '', price: 8, sizes: [], image: '', category: 'Turbo', active: true,
}

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState<AdminProduct | 'new' | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/admin-products')
        if (res.status === 401) { router.push('/admin/login'); return }
        if (!res.ok) throw new Error()
        const data = await res.json() as { products: AdminProduct[] }
        if (!cancelled) setProducts(data.products ?? [])
      } catch {
        if (!cancelled) setLoadError('Não foi possível carregar os produtos. Recarregue a página.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [reloadKey, router])

  function reload() {
    setLoadError('')
    setLoading(true)
    setReloadKey((k) => k + 1)
  }

  const byCategory = categories.map((cat) => ({
    cat,
    items: products.filter((p) => p.category === cat),
  }))

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--s0)' }}>
      <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>Produtos</h1>
          <button
            onClick={() => setEditing('new')}
            className="text-xs font-bold px-4 py-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#FF6B00' }}
          >
            + Novo produto
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64" style={{ color: 'var(--ink-faint)' }}>Carregando...</div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <p className="text-sm font-bold" style={{ color: '#f87171' }}>{loadError}</p>
            <button onClick={() => window.location.reload()} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--s1)', color: 'var(--ink-dim)' }}>
              Recarregar
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {byCategory.map(({ cat, items }) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--ink-dim)' }}>{cat}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,107,0,0.1)', color: '#FF6B00' }}>
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setEditing(p)}
                      className="flex items-center gap-3 p-3 rounded-xl border text-left transition-colors hover:border-[rgba(255,107,0,0.4)]"
                      style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)', opacity: p.active ? 1 : 0.5 }}
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: 'var(--s2)' }}>
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[9px]" style={{ color: 'var(--ink-faint)' }}>sem foto</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>{p.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--ink-faint)' }}>{p.sizes.join(' · ') || 'sem tamanhos'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black" style={{ color: '#FF6B00' }}>{formatPrice(Number(p.price))}</p>
                        {!p.active && <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--ink-faint)' }}>oculto</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <ProductForm
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload() }}
        />
      )}
    </div>
  )
}

// ─── Formulário (drawer) ────────────────────────────────────────────────────

function ProductForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: AdminProduct | null
  onClose: () => void
  onSaved: () => void
}) {
  const isNew = initial === null
  const [name, setName] = useState(initial?.name ?? EMPTY.name)
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? EMPTY.category)
  const [price, setPrice] = useState(String(initial ? Number(initial.price) : EMPTY.price))
  const [description, setDescription] = useState(initial?.description ?? EMPTY.description)
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? [])
  const [image, setImage] = useState(initial?.image ?? '')
  const [active, setActive] = useState(initial?.active ?? true)
  const [sizeInput, setSizeInput] = useState('')

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function addSize(s: string) {
    const v = s.trim()
    if (v && !sizes.includes(v)) setSizes((prev) => [...prev, v])
    setSizeInput('')
  }

  async function handleUpload(file: File) {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('name', name || 'produto')
      const res = await fetch('/api/admin-products/upload', { method: 'POST', body: fd })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Falha no upload.')
      setImage(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no upload.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setError('')
    if (!name.trim()) { setError('Informe o nome.'); return }
    if (sizes.length === 0) { setError('Adicione ao menos um tamanho.'); return }
    const priceNum = Number(price.replace(',', '.'))
    if (!Number.isFinite(priceNum) || priceNum < 0) { setError('Preço inválido.'); return }

    setSaving(true)
    try {
      const payload = { name: name.trim(), category, price: priceNum, description: description.trim(), sizes, image, active }
      const res = await fetch('/api/admin-products', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? payload : { id: initial!.id, ...payload }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar.')
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!initial) return
    if (!window.confirm(`Excluir "${initial.name}"? Esta ação não pode ser desfeita.`)) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin-products?id=${initial.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir.')
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir.')
      setSaving(false)
    }
  }

  const inputStyle = { backgroundColor: 'var(--s2)', borderColor: 'var(--rim-str)', color: 'var(--ink)' }
  const inputCls = 'w-full rounded-lg px-3 py-2.5 text-sm border outline-none'
  const labelCls = 'text-[10px] font-bold uppercase tracking-wider mb-1.5 block'

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md h-full overflow-y-auto border-l shadow-2xl"
        style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
          <h2 className="font-black text-base" style={{ color: 'var(--ink)' }}>{isNew ? 'Novo produto' : 'Editar produto'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--s2)', color: 'var(--ink-dim)' }}>✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Imagem */}
          <div>
            <span className={labelCls} style={{ color: 'var(--ink-faint)' }}>Imagem</span>
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}>
                {image ? (
                  <Image src={image} alt="" fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[9px]" style={{ color: 'var(--ink-faint)' }}>sem foto</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="text-xs font-bold px-3 py-2 rounded-lg border transition-colors disabled:opacity-50"
                  style={{ borderColor: 'var(--rim-str)', color: 'var(--ink-dim)' }}
                >
                  {uploading ? 'Enviando...' : image ? 'Trocar imagem' : 'Enviar imagem'}
                </button>
                {image && (
                  <button onClick={() => setImage('')} className="text-xs font-semibold" style={{ color: '#f87171' }}>
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nome */}
          <div>
            <span className={labelCls} style={{ color: 'var(--ink-faint)' }}>Título</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={inputStyle} placeholder="Ex: Turbo – Musgo" />
          </div>

          {/* Categoria + Preço */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={labelCls} style={{ color: 'var(--ink-faint)' }}>Categoria</span>
              <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)} className={inputCls} style={inputStyle}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <span className={labelCls} style={{ color: 'var(--ink-faint)' }}>Preço (R$)</span>
              <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={inputCls} style={inputStyle} placeholder="8,00" />
            </div>
          </div>

          {/* Tamanhos */}
          <div>
            <span className={labelCls} style={{ color: 'var(--ink-faint)' }}>Tamanhos</span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {sizes.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--s2)', color: 'var(--ink)' }}>
                  {s}
                  <button onClick={() => setSizes((prev) => prev.filter((x) => x !== s))} style={{ color: 'var(--ink-faint)' }}>✕</button>
                </span>
              ))}
              {sizes.length === 0 && <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>Nenhum tamanho.</span>}
            </div>
            <div className="flex gap-2">
              <input
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSize(sizeInput) } }}
                className={inputCls}
                style={inputStyle}
                placeholder="Ex: 7,5 cm"
              />
              <button onClick={() => addSize(sizeInput)} className="text-xs font-bold px-3 rounded-lg shrink-0" style={{ backgroundColor: 'var(--s2)', color: 'var(--ink-dim)' }}>Add</button>
            </div>
            <button
              onClick={() => setSizes(SIZE_PRESETS[category])}
              className="text-[11px] font-semibold mt-2"
              style={{ color: '#FF6B00' }}
            >
              Usar tamanhos padrão de {category} ({SIZE_PRESETS[category].join(' · ')})
            </button>
          </div>

          {/* Descrição */}
          <div>
            <span className={labelCls} style={{ color: 'var(--ink-faint)' }}>Descrição</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} style={inputStyle} placeholder="Descrição do produto..." />
          </div>

          {/* Ativo */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-[#FF6B00]" />
            <span className="text-sm font-semibold" style={{ color: 'var(--ink-dim)' }}>Exibir no site (ativo)</span>
          </label>

          {error && <p className="text-xs font-bold" style={{ color: '#f87171' }}>{error}</p>}

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#FF6B00' }}
            >
              {saving ? 'Salvando...' : isNew ? 'Cadastrar produto' : 'Salvar alterações'}
            </button>
            {!isNew && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-3 rounded-xl font-bold text-sm border transition-colors disabled:opacity-50"
                style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }}
              >
                Excluir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

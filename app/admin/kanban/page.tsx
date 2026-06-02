'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus } from '@/lib/orders'

const FULFILLMENT_STATUSES: OrderStatus[] = ['paid', 'supplier_sent', 'packed', 'shipped', 'tracking_sent', 'completed']

const COLUMN_LABEL: Partial<Record<OrderStatus, string>> = {
  paid: 'Pedido recebido',
  supplier_sent: 'Enviada Fornecedor',
  packed: 'Embalado',
  shipped: 'Enviado',
  tracking_sent: 'Rastreio enviado',
  completed: 'Finalizado',
}

const COLUMN_COLOR: Partial<Record<OrderStatus, string>> = {
  paid: '#3b82f6',
  supplier_sent: '#f97316',
  packed: '#f59e0b',
  shipped: '#8b5cf6',
  tracking_sent: '#06b6d4',
  completed: '#22c55e',
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: 'supplier_sent',
  supplier_sent: 'packed',
  packed: 'shipped',
  shipped: 'tracking_sent',
  tracking_sent: 'completed',
}

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  paid: 'Enviar ao fornecedor',
  supplier_sent: 'Embalar',
  packed: 'Marcar enviado',
  shipped: 'Enviar rastreio',
  tracking_sent: 'Finalizar',
}

const PREV_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  supplier_sent: 'paid',
  packed: 'supplier_sent',
  shipped: 'packed',
  tracking_sent: 'shipped',
  completed: 'tracking_sent',
}

function fmt(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function fmtDate(val: unknown): string {
  if (!val) return '—'
  return new Date(String(val)).toLocaleDateString('pt-BR')
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <aside className="flex flex-col border-l h-full overflow-y-auto" style={{ width: 340, minWidth: 340, backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
        <div>
          <p className="font-black" style={{ color: 'var(--ink)' }}>{order.customer.name}</p>
          <p className="text-xs font-mono" style={{ color: 'var(--ink-faint)' }}>#{order.id?.slice(0, 8)}…</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--s2)', color: 'var(--ink-dim)' }}>✕</button>
      </div>

      <div className="p-5 space-y-4 text-sm">
        {/* Status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLUMN_COLOR[order.status] ?? '#6b7280' }} />
          <span className="font-bold" style={{ color: COLUMN_COLOR[order.status] ?? 'var(--ink-dim)' }}>
            {COLUMN_LABEL[order.status] ?? order.status}
          </span>
          <span className="ml-auto text-xs" style={{ color: 'var(--ink-faint)' }}>{fmtDate(order.createdAt)}</span>
        </div>

        {/* Cliente */}
        <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--s2)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#FF6B00' }}>Cliente</p>
          {[['E-mail', order.customer.email], ['CPF', order.customer.cpf], ['Telefone', order.customer.phone]].map(([l, v]) => (
            <div key={l} className="flex justify-between gap-2">
              <span style={{ color: 'var(--ink-faint)' }}>{l}</span>
              <span className="text-right" style={{ color: 'var(--ink)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Endereço */}
        <div className="rounded-xl p-4 space-y-1" style={{ backgroundColor: 'var(--s2)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#FF6B00' }}>Entrega</p>
          <p style={{ color: 'var(--ink)' }}>{order.customer.address.street}, {order.customer.address.number}{order.customer.address.complement ? ` — ${order.customer.address.complement}` : ''}</p>
          <p style={{ color: 'var(--ink-dim)' }}>{order.customer.address.neighborhood} · {order.customer.address.city}/{order.customer.address.state}</p>
          <p className="font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>CEP {order.customer.address.cep}</p>
        </div>

        {/* Itens */}
        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--s2)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#FF6B00' }}>Itens</p>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-start gap-2">
              <div>
                <p style={{ color: 'var(--ink)' }}>{item.productName}</p>
                <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{item.quantity}x · {fmt(item.unitPrice)}</p>
              </div>
              <span className="font-bold whitespace-nowrap" style={{ color: 'var(--ink)' }}>{fmt(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--s2)' }}>
          {[['Subtotal', fmt(order.subtotal)], ['Frete', order.shipping === 0 ? 'Grátis' : fmt(order.shipping)]].map(([l, v]) => (
            <div key={l} className="flex justify-between">
              <span style={{ color: 'var(--ink-faint)' }}>{l}</span>
              <span style={{ color: 'var(--ink)' }}>{v}</span>
            </div>
          ))}
          <div className="flex justify-between font-black text-base pt-2 border-t" style={{ borderColor: 'var(--rim)' }}>
            <span style={{ color: 'var(--ink)' }}>Total</span>
            <span style={{ color: '#FF6B00' }}>{fmt(order.total)}</span>
          </div>
        </div>

        {/* Rastreio */}
        {order.trackingCode && (
          <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#06b6d4' }}>Rastreio</p>
            <p className="font-mono" style={{ color: 'var(--ink)' }}>{order.trackingCode}</p>
          </div>
        )}
      </div>
    </aside>
  )
}

// ─── Kanban Card ─────────────────────────────────────────────────────────────

function KanbanCard({
  order,
  selected,
  onSelect,
  onMove,
}: {
  order: Order
  selected: boolean
  onSelect: (order: Order) => void
  onMove: (orderId: string, status: OrderStatus, trackingCode?: string) => Promise<void>
}) {
  const [loading, setLoading] = useState<'forward' | 'back' | null>(null)
  const [trackingInput, setTrackingInput] = useState(order.trackingCode ?? '')
  const next = NEXT_STATUS[order.status]
  const prev = PREV_STATUS[order.status]
  const needsTracking = order.status === 'shipped'

  async function handleForward(e: React.MouseEvent) {
    e.stopPropagation()
    if (needsTracking && !trackingInput.trim()) return
    if (next === 'completed' && !window.confirm(`Finalizar pedido de ${order.customer.name}?`)) return
    setLoading('forward')
    await onMove(order.id!, next!, needsTracking ? trackingInput.trim() : undefined)
    setLoading(null)
  }

  async function handleBack(e: React.MouseEvent) {
    e.stopPropagation()
    const prevLabel = COLUMN_LABEL[prev!] ?? prev
    if (!window.confirm(`Voltar pedido de ${order.customer.name} para "${prevLabel}"?`)) return
    setLoading('back')
    await onMove(order.id!, prev!)
    setLoading(null)
  }

  const color = COLUMN_COLOR[order.status]!

  return (
    <div
      onClick={() => onSelect(order)}
      className="rounded-xl p-4 space-y-3 cursor-pointer transition-all"
      style={{
        backgroundColor: 'var(--s0)',
        border: selected ? `2px solid ${color}` : '2px solid var(--rim)',
        boxShadow: selected ? `0 0 0 3px ${color}22` : undefined,
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="font-bold text-sm leading-tight truncate" style={{ color: 'var(--ink)' }}>{order.customer.name}</p>
        <span className="text-sm font-black whitespace-nowrap shrink-0" style={{ color: '#FF6B00' }}>{fmt(order.total)}</span>
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--ink-dim)' }}>
        <span>{order.items.reduce((s, i) => s + i.quantity, 0)} item(s)</span>
        <span>{fmtDate(order.createdAt)}</span>
      </div>

      <p className="font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>#{order.id?.slice(0, 8)}</p>

      {order.trackingCode && order.status !== 'shipped' && (
        <p className="text-xs font-mono rounded-lg px-2 py-1" style={{ backgroundColor: 'var(--s1)', color: 'var(--ink-dim)' }}>📦 {order.trackingCode}</p>
      )}

      {needsTracking && (
        <input
          value={trackingInput}
          onChange={(e) => { e.stopPropagation(); setTrackingInput(e.target.value) }}
          onClick={(e) => e.stopPropagation()}
          placeholder="Código de rastreio..."
          className="w-full rounded-lg px-3 py-2 text-xs outline-none border"
          style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim-str)', color: 'var(--ink)' }}
        />
      )}

      {/* Avançar */}
      {next && (
        <button
          onClick={handleForward}
          disabled={loading !== null || (needsTracking && !trackingInput.trim())}
          className="w-full py-2 rounded-lg text-xs font-bold text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: COLUMN_COLOR[next] }}
        >
          {loading === 'forward' ? '...' : `→ ${NEXT_LABEL[order.status]}`}
        </button>
      )}

      {order.status === 'completed' && (
        <p className="text-center text-xs font-bold" style={{ color: '#22c55e' }}>Concluído ✓</p>
      )}

      {/* Voltar */}
      {prev && (
        <button
          onClick={handleBack}
          disabled={loading !== null}
          className="w-full py-1.5 rounded-lg text-xs font-semibold transition-opacity disabled:opacity-40 border"
          style={{ color: 'var(--ink-faint)', borderColor: 'var(--rim)', backgroundColor: 'transparent' }}
        >
          {loading === 'back' ? '...' : `← ${COLUMN_LABEL[prev]}`}
        </button>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminKanbanPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    async function load() {
      try {
        const res = await fetch('/api/admin-orders')
        if (res.status === 401) { router.push('/admin/login'); return }
        if (!res.ok) throw new Error('Erro do servidor')
        const data = await res.json() as { orders: Order[] }
        setOrders(data.orders ?? [])
      } catch {
        setLoadError('Não foi possível carregar os pedidos. Recarregue a página.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  useEffect(() => {
    if (!saveError) return
    const t = setTimeout(() => setSaveError(''), 5000)
    return () => clearTimeout(t)
  }, [saveError])

  async function handleMove(orderId: string, newStatus: OrderStatus, trackingCode?: string) {
    try {
      const res = await fetch('/api/admin-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus, trackingCode }),
      })
      if (!res.ok) throw new Error('Erro do servidor')
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, ...(trackingCode !== undefined ? { trackingCode } : {}) }
            : o,
        ),
      )
      setSelected((prev) =>
        prev?.id === orderId
          ? { ...prev, status: newStatus, ...(trackingCode !== undefined ? { trackingCode } : {}) }
          : prev,
      )
    } catch {
      setSaveError('Erro ao atualizar pedido. Tente novamente.')
    }
  }

  const searchLower = search.toLowerCase()
  const fulfillmentOrders = orders.filter(
    (o) =>
      FULFILLMENT_STATUSES.includes(o.status) &&
      (!search ||
        o.customer.name.toLowerCase().includes(searchLower) ||
        o.customer.email.toLowerCase().includes(searchLower) ||
        (o.id ?? '').toLowerCase().includes(searchLower)),
  )

  const totalActive = fulfillmentOrders.filter((o) => o.status !== 'completed').length

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--s0)' }}>
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b px-6 py-3 flex items-center gap-4" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
        <span className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>Kanban</span>
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,107,0,0.1)', color: '#FF6B00' }}>
          {totalActive} em aberto
        </span>
        <div className="relative ml-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido..."
            className="rounded-lg pl-8 pr-4 py-1.5 text-sm border outline-none"
            style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)', color: 'var(--ink)', width: 220 }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Kanban columns */}
        <div className="flex-1 overflow-x-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full" style={{ color: 'var(--ink-faint)' }}>Carregando...</div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <p className="text-sm font-bold" style={{ color: '#f87171' }}>{loadError}</p>
              <button onClick={() => window.location.reload()} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--s2)', color: 'var(--ink-dim)' }}>
                Recarregar
              </button>
            </div>
          ) : (
            <div className="flex gap-5 h-full" style={{ minWidth: 'max-content' }}>
              {FULFILLMENT_STATUSES.map((status) => {
                const colOrders = fulfillmentOrders.filter((o) => o.status === status)
                const color = COLUMN_COLOR[status]!
                return (
                  <div key={status} className="flex flex-col" style={{ width: 280 }}>
                    {/* Column header */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--ink-dim)' }}>
                        {COLUMN_LABEL[status]}
                      </span>
                      <span className="ml-auto text-xs font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                        {colOrders.length}
                      </span>
                    </div>

                    {/* Column body */}
                    <div
                      className="flex-1 rounded-2xl p-3 space-y-3 overflow-y-auto"
                      style={{ backgroundColor: 'var(--s1)', border: '1px solid var(--rim)' }}
                    >
                      {colOrders.length === 0 ? (
                        <div className="h-24 flex items-center justify-center text-xs rounded-xl border border-dashed" style={{ borderColor: 'var(--rim)', color: 'var(--ink-faint)' }}>
                          Nenhum pedido
                        </div>
                      ) : (
                        colOrders.map((order) => (
                          <KanbanCard
                            key={order.id}
                            order={order}
                            selected={selected?.id === order.id}
                            onSelect={setSelected}
                            onMove={handleMove}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <DetailPanel order={selected} onClose={() => setSelected(null)} />
        )}
      </div>

      {/* Error toast */}
      {saveError && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold shadow-xl border"
          style={{ backgroundColor: 'var(--s2)', borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {saveError}
        </div>
      )}
    </div>
  )
}

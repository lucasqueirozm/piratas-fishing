'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import type { Order, OrderStatus } from '@/lib/orders'

// ─── Constants ────────────────────────────────────────────────────────────────

const FULFILLMENT_STATUSES: OrderStatus[] = ['paid', 'packed', 'shipped', 'tracking_sent', 'completed']

const COLUMN_LABEL: Partial<Record<OrderStatus, string>> = {
  paid: 'Pedido recebido',
  packed: 'Embalado',
  shipped: 'Enviado',
  tracking_sent: 'Rastreio enviado',
  completed: 'Finalizado',
}

const COLUMN_COLOR: Partial<Record<OrderStatus, string>> = {
  paid: '#3b82f6',
  packed: '#f59e0b',
  shipped: '#8b5cf6',
  tracking_sent: '#06b6d4',
  completed: '#22c55e',
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: 'packed',
  packed: 'shipped',
  shipped: 'tracking_sent',
  tracking_sent: 'completed',
}

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  paid: 'Embalar',
  packed: 'Marcar enviado',
  shipped: 'Enviar rastreio',
  tracking_sent: 'Finalizar',
}

const PRE_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: 'Pendente',
  in_process: 'Em análise',
  failed: 'Falhou',
  cancelled: 'Cancelado',
}

const PRE_STATUS_COLOR: Partial<Record<OrderStatus, string>> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  in_process: 'bg-blue-500/20 text-blue-400',
  failed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
}

const STATUS_COLORS_PIE: Partial<Record<OrderStatus, string>> = {
  paid: '#3b82f6',
  packed: '#f59e0b',
  shipped: '#8b5cf6',
  tracking_sent: '#06b6d4',
  completed: '#22c55e',
  pending: '#eab308',
  in_process: '#6366f1',
  failed: '#ef4444',
  cancelled: '#6b7280',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────


function fmt(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function fmtDate(val: unknown): string {
  if (!val) return '—'
  return new Date(String(val)).toLocaleDateString('pt-BR')
}

function fmtShort(val: unknown): string {
  if (!val) return '—'
  return new Date(String(val)).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function filterByDays(orders: Order[], days: number) {
  if (days === 0) return orders
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return orders.filter((o) => new Date(o.createdAt) >= cutoff)
}

function getRevenueData(orders: Order[], days: number) {
  const count = days === 0 ? 30 : days
  const now = new Date()
  const buckets: Record<string, number> = {}
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    buckets[fmtShort(d)] = 0
  }
  const paid = filterByDays(orders, count).filter((o) => FULFILLMENT_STATUSES.includes(o.status))
  paid.forEach((o) => {
    const key = fmtShort(o.createdAt)
    if (key in buckets) buckets[key] = (buckets[key] ?? 0) + o.total
  })
  return Object.entries(buckets).map(([date, revenue]) => ({ date, revenue }))
}

function getStatusData(orders: Order[]) {
  const counts: Partial<Record<OrderStatus, number>> = {}
  orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1 })
  return Object.entries(counts).map(([status, value]) => ({
    name: COLUMN_LABEL[status as OrderStatus] ?? PRE_STATUS_LABEL[status as OrderStatus] ?? status,
    value,
    status,
  }))
}

function getTopProducts(orders: Order[]) {
  const map: Record<string, { name: string; quantidade: number; receita: number }> = {}
  orders.filter((o) => FULFILLMENT_STATUSES.includes(o.status)).forEach((o) => {
    o.items.forEach((item) => {
      if (!map[item.productName]) map[item.productName] = { name: item.productName, quantidade: 0, receita: 0 }
      map[item.productName].quantidade += item.quantity
      map[item.productName].receita += item.totalPrice
    })
  })
  return Object.values(map).sort((a, b) => b.receita - a.receita).slice(0, 6)
}

function exportCSV(orders: Order[]) {
  const headers = ['ID', 'Data', 'Cliente', 'Email', 'CPF', 'Telefone', 'Subtotal', 'Frete', 'Total', 'Status', 'Rastreio', 'Cidade', 'Estado']
  const rows = orders.map((o) => [
    o.id ?? '',
    fmtDate(o.createdAt),
    o.customer.name,
    o.customer.email,
    o.customer.cpf,
    o.customer.phone,
    o.subtotal.toFixed(2),
    o.shipping.toFixed(2),
    o.total.toFixed(2),
    o.status,
    o.trackingCode ?? '',
    o.customer.address.city,
    o.customer.address.state,
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
        style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
          <div>
            <p className="font-black text-lg" style={{ color: 'var(--ink)' }}>{order.customer.name}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--ink-faint)' }}>#{order.id?.slice(0, 8)}…</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--s2)', color: 'var(--ink-dim)' }}>✕</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLUMN_COLOR[order.status] ?? '#6b7280' }} />
            <span className="text-sm font-bold" style={{ color: COLUMN_COLOR[order.status] ?? 'var(--ink-dim)' }}>
              {COLUMN_LABEL[order.status] ?? PRE_STATUS_LABEL[order.status] ?? order.status}
            </span>
            <span className="ml-auto text-xs" style={{ color: 'var(--ink-faint)' }}>{fmtDate(order.createdAt)}</span>
          </div>

          {/* Cliente */}
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--s2)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#FF6B00' }}>Cliente</p>
            {[
              ['E-mail', order.customer.email],
              ['CPF', order.customer.cpf],
              ['Telefone', order.customer.phone],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: 'var(--ink-faint)' }}>{label}</span>
                <span style={{ color: 'var(--ink)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Endereço */}
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--s2)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#FF6B00' }}>Endereço de entrega</p>
            <p className="text-sm" style={{ color: 'var(--ink)' }}>
              {order.customer.address.street}, {order.customer.address.number}
              {order.customer.address.complement ? ` — ${order.customer.address.complement}` : ''}
            </p>
            <p className="text-sm" style={{ color: 'var(--ink-dim)' }}>
              {order.customer.address.neighborhood} · {order.customer.address.city}/{order.customer.address.state}
            </p>
            <p className="text-sm font-mono" style={{ color: 'var(--ink-faint)' }}>CEP {order.customer.address.cep}</p>
          </div>

          {/* Itens */}
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--s2)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#FF6B00' }}>Itens do pedido</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div>
                  <p style={{ color: 'var(--ink)' }}>{item.productName}</p>
                  <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{item.quantity}x · {fmt(item.unitPrice)} cada</p>
                </div>
                <span className="font-bold" style={{ color: 'var(--ink)' }}>{fmt(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--s2)' }}>
            {[
              ['Subtotal', fmt(order.subtotal)],
              ['Frete', order.shipping === 0 ? 'Grátis' : fmt(order.shipping)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: 'var(--ink-faint)' }}>{label}</span>
                <span style={{ color: 'var(--ink)' }}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between font-black text-base pt-2 border-t" style={{ borderColor: 'var(--rim)', color: 'var(--ink)' }}>
              <span>Total</span>
              <span style={{ color: '#FF6B00' }}>{fmt(order.total)}</span>
            </div>
          </div>

          {/* Rastreio */}
          {order.trackingCode && (
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#06b6d4' }}>Código de rastreio</p>
              <p className="font-mono text-sm" style={{ color: 'var(--ink)' }}>{order.trackingCode}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Kanban Card ─────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onAdvance,
  onOpenDetail,
}: {
  order: Order
  onAdvance: (orderId: string, nextStatus: OrderStatus, trackingCode?: string) => Promise<void>
  onOpenDetail: (order: Order) => void
}) {
  const [loading, setLoading] = useState(false)
  const [trackingInput, setTrackingInput] = useState(order.trackingCode ?? '')
  const next = NEXT_STATUS[order.status]
  const needsTracking = order.status === 'shipped'

  async function handleAdvance(e: React.MouseEvent) {
    e.stopPropagation()
    if (needsTracking && !trackingInput.trim()) return
    setLoading(true)
    await onAdvance(order.id!, next!, needsTracking ? trackingInput.trim() : undefined)
    setLoading(false)
  }

  return (
    <div
      className="rounded-xl border p-4 space-y-3 text-sm cursor-pointer transition-all hover:shadow-lg"
      style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}
      onClick={() => onOpenDetail(order)}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-bold" style={{ color: 'var(--ink)' }}>{order.customer.name}</p>
          <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{order.customer.email}</p>
        </div>
        <span className="font-black text-[#FF6B00] whitespace-nowrap">{fmt(order.total)}</span>
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--ink-dim)' }}>
        <span>{order.items.reduce((s, i) => s + i.quantity, 0)} item(s)</span>
        <span>{fmtDate(order.createdAt)}</span>
      </div>

      <p className="font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>#{order.id?.slice(0, 8)}</p>

      {order.trackingCode && order.status !== 'shipped' && (
        <div className="rounded-lg px-3 py-2 text-xs font-mono" style={{ backgroundColor: 'var(--s2)', color: 'var(--ink-dim)' }}>
          📦 {order.trackingCode}
        </div>
      )}

      {needsTracking && (
        <input
          value={trackingInput}
          onChange={(e) => { e.stopPropagation(); setTrackingInput(e.target.value) }}
          onClick={(e) => e.stopPropagation()}
          placeholder="Código de rastreio..."
          className="w-full rounded-lg px-3 py-2 text-xs outline-none border"
          style={{ backgroundColor: 'var(--s0)', borderColor: 'var(--rim-str)', color: 'var(--ink)' }}
        />
      )}

      {next && (
        <button
          onClick={handleAdvance}
          disabled={loading || (needsTracking && !trackingInput.trim())}
          className="w-full py-2 rounded-lg text-xs font-bold text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: COLUMN_COLOR[next] }}
        >
          {loading ? '...' : `→ ${NEXT_LABEL[order.status]}`}
        </button>
      )}

      {order.status === 'completed' && (
        <div className="text-center text-xs font-bold" style={{ color: '#22c55e' }}>Concluído ✓</div>
      )}
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl border text-sm" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)', color: 'var(--ink)' }}>
      <p className="font-bold mb-1" style={{ color: 'var(--ink-dim)' }}>{label}</p>
      <p className="font-black" style={{ color: '#FF6B00' }}>{fmt(payload[0].value)}</p>
    </div>
  )
}

function BarTooltip({ active, payload }: { active?: boolean; payload?: { payload: { name: string; receita: number; quantidade: number } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl border text-sm" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)', color: 'var(--ink)' }}>
      <p className="font-bold mb-1" style={{ color: 'var(--ink-dim)' }}>{d.name}</p>
      <p style={{ color: '#FF6B00' }}>{fmt(d.receita)}</p>
      <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{d.quantidade} unidades</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<0 | 7 | 30 | 90>(30)
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

  async function handleAdvance(orderId: string, nextStatus: OrderStatus, trackingCode?: string) {
    try {
      const res = await fetch('/api/admin-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: nextStatus, trackingCode }),
      })
      if (!res.ok) throw new Error('Erro do servidor')
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: nextStatus, ...(trackingCode !== undefined ? { trackingCode } : {}) }
            : o,
        ),
      )
    } catch {
      setSaveError('Erro ao atualizar pedido. Tente novamente.')
    }
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  const filteredByDate = useMemo(() => filterByDays(orders, dateRange), [orders, dateRange])

  const paidFiltered = useMemo(() =>
    filteredByDate.filter((o) => FULFILLMENT_STATUSES.includes(o.status)),
    [filteredByDate],
  )

  const stats = useMemo(() => ({
    totalRevenue: paidFiltered.reduce((s, o) => s + o.total, 0),
    totalOrders: filteredByDate.length,
    paidOrders: paidFiltered.length,
    pendingOrders: filteredByDate.filter((o) => o.status === 'pending' || o.status === 'in_process').length,
    avgTicket: paidFiltered.length ? paidFiltered.reduce((s, o) => s + o.total, 0) / paidFiltered.length : 0,
  }), [filteredByDate, paidFiltered])

  const revenueData = useMemo(() => getRevenueData(orders, dateRange), [orders, dateRange])
  const statusData = useMemo(() => getStatusData(filteredByDate), [filteredByDate])
  const topProducts = useMemo(() => getTopProducts(paidFiltered), [paidFiltered])

  const searchLower = search.toLowerCase()
  const matchesSearch = (o: Order) =>
    !search ||
    o.customer.name.toLowerCase().includes(searchLower) ||
    o.customer.email.toLowerCase().includes(searchLower) ||
    o.customer.cpf.includes(search) ||
    (o.id ?? '').toLowerCase().includes(searchLower)

  const fulfillmentOrders = orders.filter((o) => FULFILLMENT_STATUSES.includes(o.status) && matchesSearch(o))
  const preOrders = orders.filter((o) => !FULFILLMENT_STATUSES.includes(o.status) && matchesSearch(o))

  const DATE_RANGES: { label: string; value: 0 | 7 | 30 | 90 }[] = [
    { label: '7 dias', value: 7 },
    { label: '30 dias', value: 30 },
    { label: '90 dias', value: 90 },
    { label: 'Tudo', value: 0 },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--s0)' }}>
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">

        {/* Page title + actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>Dashboard</h1>
          <button
            onClick={() => exportCSV(orders)}
            className="text-xs font-bold px-4 py-2 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--rim-str)', color: 'var(--ink-dim)' }}
          >
            ↓ Exportar CSV
          </button>
        </div>

        <div className="space-y-8">
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
            <>
              {/* ── Filters bar ── */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1 max-w-sm">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nome, e-mail ou CPF..."
                    className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm border outline-none"
                    style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)', color: 'var(--ink)' }}
                  />
                </div>
                <div className="flex gap-1 rounded-xl p-1 border" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
                  {DATE_RANGES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setDateRange(r.value)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={
                        dateRange === r.value
                          ? { backgroundColor: '#FF6B00', color: '#fff' }
                          : { color: 'var(--ink-dim)' }
                      }
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── KPIs ── */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Receita', value: fmt(stats.totalRevenue), color: '#FF6B00' },
                  { label: 'Pedidos', value: String(stats.totalOrders), color: 'var(--ink)' },
                  { label: 'Pagos', value: String(stats.paidOrders), color: '#22c55e' },
                  { label: 'Pendentes', value: String(stats.pendingOrders), color: '#f59e0b' },
                  { label: 'Ticket médio', value: fmt(stats.avgTicket), color: '#8b5cf6' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-2xl p-5 border" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--ink-faint)' }}>{kpi.label}</p>
                    <p className="text-xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* ── Charts ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue line chart */}
                <div className="lg:col-span-2 rounded-2xl border p-6" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
                  <p className="text-sm font-black uppercase tracking-wider mb-6" style={{ color: 'var(--ink-dim)' }}>
                    Receita — últimos {dateRange === 0 ? 30 : dateRange} dias
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--rim)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} width={55} />
                      <Tooltip content={<RevenueTooltip />} />
                      <Line type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#FF6B00' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Status donut */}
                <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
                  <p className="text-sm font-black uppercase tracking-wider mb-6" style={{ color: 'var(--ink-dim)' }}>
                    Pedidos por status
                  </p>
                  {statusData.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-sm" style={{ color: 'var(--ink-faint)' }}>Sem dados</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={statusData} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                            {statusData.map((entry, i) => (
                              <Cell key={i} fill={STATUS_COLORS_PIE[entry.status as OrderStatus] ?? '#6b7280'} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v, n) => [v, n]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1 mt-2">
                        {statusData.map((d, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS_PIE[d.status as OrderStatus] ?? '#6b7280' }} />
                              <span style={{ color: 'var(--ink-dim)' }}>{d.name}</span>
                            </div>
                            <span className="font-bold" style={{ color: 'var(--ink)' }}>{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Top products bar chart */}
              {topProducts.length > 0 && (
                <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
                  <p className="text-sm font-black uppercase tracking-wider mb-6" style={{ color: 'var(--ink-dim)' }}>
                    Produtos mais vendidos (por receita)
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--rim)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} tickLine={false} axisLine={false} width={140} />
                      <Tooltip content={<BarTooltip />} />
                      <Bar dataKey="receita" fill="#FF6B00" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* ── Pré-pagamento ── */}
              {preOrders.length > 0 && (
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
                  <div className="p-5 border-b" style={{ borderColor: 'var(--rim)' }}>
                    <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--ink-dim)' }}>
                      Pré-pagamento ({preOrders.length})
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-xs uppercase tracking-wider" style={{ borderColor: 'var(--rim)', color: 'var(--ink-faint)' }}>
                          <th className="text-left py-3 px-4">ID</th>
                          <th className="text-left py-3 px-4">Cliente</th>
                          <th className="text-left py-3 px-4">Data</th>
                          <th className="text-left py-3 px-4">Total</th>
                          <th className="text-left py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b cursor-pointer transition-colors hover:bg-white/5"
                            style={{ borderColor: 'var(--rim)' }}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>{order.id?.slice(0, 8)}…</td>
                            <td className="py-3 px-4 max-w-[200px]">
                              <p className="font-bold truncate" style={{ color: 'var(--ink)' }}>{order.customer.name}</p>
                              <p className="text-xs truncate" style={{ color: 'var(--ink-faint)' }}>{order.customer.email}</p>
                            </td>
                            <td className="py-3 px-4" style={{ color: 'var(--ink-dim)' }}>{fmtDate(order.createdAt)}</td>
                            <td className="py-3 px-4 font-bold" style={{ color: 'var(--ink)' }}>{fmt(order.total)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${PRE_STATUS_COLOR[order.status] ?? 'bg-gray-500/20 text-gray-400'}`}>
                                {PRE_STATUS_LABEL[order.status] ?? order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

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

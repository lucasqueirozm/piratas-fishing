'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Order } from '@/lib/orders'
import { FULFILLMENT_STATUSES } from '@/lib/constants'

function fmt(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

// 'today' = desde a meia-noite de hoje | 0 = todo o período | N = últimos N dias
type Range = 'today' | 0 | 7 | 30 | 90

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// Retorna o início da janela, ou null quando é "todo o período".
function rangeCutoff(range: Range): Date | null {
  if (range === 0) return null
  if (range === 'today') return startOfToday()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - range)
  return cutoff
}

function filterByRange(orders: Order[], range: Range) {
  const cutoff = rangeCutoff(range)
  if (!cutoff) return orders
  return orders.filter((o) => new Date(o.createdAt) >= cutoff)
}

function getRevenueByState(orders: Order[]) {
  const map: Record<string, number> = {}
  orders.filter((o) => FULFILLMENT_STATUSES.includes(o.status)).forEach((o) => {
    const s = o.customer.address.state
    if (s) map[s] = (map[s] ?? 0) + o.total
  })
  return Object.entries(map)
    .map(([state, revenue]) => ({ state, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
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

const DATE_RANGES: { label: string; value: Range }[] = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
  { label: 'Tudo', value: 0 },
]

export default function EstatisticasPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [funnelCounts, setFunnelCounts] = useState({ page_view: 0, cart_open: 0, checkout_start: 0 })
  const [dateRange, setDateRange] = useState<Range>(30)
  const [loading, setLoading] = useState(true)
  const [eventsReady, setEventsReady] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin-orders')
      .then(async (res) => {
        if (res.status === 401) { router.push('/admin/login'); return }
        const data = await res.json() as { orders: Order[] }
        setOrders(data.orders ?? [])
      })
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    // "Hoje" manda o instante da meia-noite; os demais mandam a quantidade de dias.
    const query = dateRange === 'today'
      ? `since=${encodeURIComponent(startOfToday().toISOString())}`
      : `days=${dateRange}`
    fetch(`/api/admin-stats?${query}`)
      .then(async (res) => {
        if (!res.ok) { setEventsReady(false); return }
        const data = await res.json() as { funnelCounts: Record<string, number> }
        setEventsReady(true)
        setFunnelCounts({
          page_view: data.funnelCounts.page_view ?? 0,
          cart_open: data.funnelCounts.cart_open ?? 0,
          checkout_start: data.funnelCounts.checkout_start ?? 0,
        })
      })
      .catch(() => setEventsReady(false))
  }, [dateRange])

  const filtered = useMemo(() => filterByRange(orders, dateRange), [orders, dateRange])
  const paid = useMemo(() => filtered.filter((o) => FULFILLMENT_STATUSES.includes(o.status)), [filtered])
  const revenueByState = useMemo(() => getRevenueByState(paid), [paid])
  const topProducts = useMemo(() => getTopProducts(paid), [paid])

  const visits = funnelCounts.page_view
  const cartOpens = funnelCounts.cart_open
  const checkoutStarts = funnelCounts.checkout_start
  const purchases = paid.length
  const totalRevenue = paid.reduce((s, o) => s + o.total, 0)

  // Caps at 100% — purchases can exceed visits when tracking was activated after orders existed
  const pct = (a: number, b: number) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0)

  // Detected data skew: more purchases than visits means tracking started after orders
  const dataSkewed = eventsReady && visits > 0 && purchases > visits

  const funnel = [
    { label: 'Visitas ao site', value: visits, bar: 100, pctLabel: null as string | null, color: '#6366f1' },
    { label: 'Abriram o carrinho', value: cartOpens, bar: pct(cartOpens, visits), pctLabel: `${pct(cartOpens, visits)}%`, color: '#f59e0b' },
    { label: 'Iniciaram checkout', value: checkoutStarts, bar: pct(checkoutStarts, visits), pctLabel: `${pct(checkoutStarts, visits)}%`, color: '#FF6B00' },
    { label: 'Compraram', value: purchases, bar: pct(purchases, visits), pctLabel: `${pct(purchases, visits)}%`, color: '#22c55e' },
  ]

  const conversionRate = visits > 0 && purchases <= visits ? `${pct(purchases, visits)}%` : '—'
  const abandonRate = cartOpens > 0 && cartOpens >= purchases
    ? `${Math.round(((cartOpens - purchases) / cartOpens) * 100)}%`
    : '—'

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--s0)' }}>
      <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">

        {/* Page title + filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <h1 className="text-lg font-black uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>Estatísticas</h1>
          <div className="flex gap-1 rounded-xl p-1 border self-start" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
            {DATE_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDateRange(r.value)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={dateRange === r.value ? { backgroundColor: '#FF6B00', color: '#fff' } : { color: 'var(--ink-dim)' }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64" style={{ color: 'var(--ink-faint)' }}>Carregando...</div>
        ) : (
          <div className="space-y-6">

            {/* ── Cards de resumo (topo) ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Taxa de conversão',
                  value: conversionRate,
                  sub: 'visitas → compra',
                  color: '#22c55e',
                },
                {
                  label: 'Abandono de carrinho',
                  value: abandonRate,
                  sub: 'abriram mas não compraram',
                  color: '#f59e0b',
                },
                {
                  label: 'Pedidos pagos',
                  value: String(purchases),
                  sub: dateRange === 'today' ? 'hoje' : dateRange === 0 ? 'no período de todo período' : `no período de ${dateRange} dias`,
                  color: '#FF6B00',
                },
                {
                  label: 'Ticket médio',
                  value: purchases > 0 ? fmt(totalRevenue / purchases) : '—',
                  sub: 'por pedido pago',
                  color: '#8b5cf6',
                },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--ink-faint)' }}>{card.label}</p>
                  <p className="text-2xl font-black mb-1" style={{ color: card.color }}>{card.value}</p>
                  <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{card.sub}</p>
                </div>
              ))}
            </div>

            {/* ── Funil de conversão ── */}
            <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: 'var(--ink-faint)' }}>
                Funil de conversão
              </p>

              {dataSkewed && (
                <div className="mb-4 px-4 py-3 rounded-xl text-xs" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                  ⚠️ O rastreamento de visitas foi ativado recentemente. Pedidos anteriores ao tracking estão contabilizados, então as porcentagens do funil ainda não refletem dados reais. Os números se estabilizam automaticamente com o tempo.
                </div>
              )}

              {!eventsReady ? (
                <div className="rounded-xl p-4 text-sm text-center" style={{ backgroundColor: 'var(--s2)', color: 'var(--ink-faint)' }}>
                  Crie a tabela <code className="font-mono">events</code> no Supabase para ativar o rastreamento.
                  <br />
                  <span className="text-xs">Execute o script em <code className="font-mono">scripts/create-events-table.sql</code></span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {funnel.map((stage, i) => (
                      <div key={i} className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)', borderTop: `3px solid ${stage.color}` }}>
                        <p className="text-2xl font-black mb-1" style={{ color: stage.color }}>{stage.value}</p>
                        <p className="text-xs leading-tight" style={{ color: 'var(--ink-dim)' }}>{stage.label}</p>
                        {stage.pctLabel && (
                          <p className="text-xs font-bold mt-2 px-2 py-0.5 rounded-full inline-block" style={{ backgroundColor: `${stage.color}22`, color: stage.color }}>
                            {stage.pctLabel} das visitas
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-4">
                    {funnel.map((stage, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-bold" style={{ color: 'var(--ink-dim)' }}>{stage.label}</span>
                          <span className="text-sm font-black" style={{ color: stage.color }}>{stage.value.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--s3)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.max(stage.bar, stage.value > 0 ? 2 : 0)}%`, backgroundColor: stage.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {visits === 0 && (
                    <p className="text-xs text-center mt-4" style={{ color: 'var(--ink-faint)' }}>
                      Nenhuma visita registrada no período. Os dados aparecem conforme os usuários acessam o site.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ── Receita por estado ── */}
              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
                <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: 'var(--ink-faint)' }}>
                  Receita por estado
                </p>
                {revenueByState.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--ink-faint)' }}>Sem dados no período</p>
                ) : (
                  <div className="space-y-4">
                    {revenueByState.map(({ state, revenue }, i) => {
                      const max = revenueByState[0].revenue
                      const p = Math.round((revenue / max) * 100)
                      return (
                        <div key={state}>
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                                style={{ backgroundColor: i === 0 ? '#FF6B00' : 'var(--s3)', color: i === 0 ? '#fff' : 'var(--ink-faint)' }}
                              >
                                {i + 1}
                              </span>
                              <span className="text-sm font-bold" style={{ color: 'var(--ink-dim)' }}>{state}</span>
                            </div>
                            <span className="text-sm font-black" style={{ color: '#FF6B00' }}>{fmt(revenue)}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--s3)' }}>
                            <div className="h-full rounded-full" style={{ width: `${p}%`, backgroundColor: '#FF6B00', opacity: 0.5 + p / 200 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ── Top produtos ── */}
              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
                <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: 'var(--ink-faint)' }}>
                  Produtos mais vendidos
                </p>
                {topProducts.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--ink-faint)' }}>Sem dados no período</p>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((p, i) => {
                      const max = topProducts[0].receita
                      const bar = Math.round((p.receita / max) * 100)
                      return (
                        <div key={p.name}>
                          <div className="flex items-center gap-3 mb-1.5">
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                              style={{ backgroundColor: i === 0 ? '#FF6B00' : 'var(--s3)', color: i === 0 ? '#fff' : 'var(--ink-faint)' }}
                            >
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>{p.name}</p>
                              <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{p.quantidade} unidades vendidas</p>
                            </div>
                            <span className="text-sm font-black shrink-0" style={{ color: '#FF6B00' }}>{fmt(p.receita)}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--s3)' }}>
                            <div className="h-full rounded-full" style={{ width: `${bar}%`, backgroundColor: '#8b5cf6' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

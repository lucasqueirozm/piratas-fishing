'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Order } from '@/lib/orders'
import { STATUS_LABEL, STATUS_COLOR } from '@/lib/constants'
import {
  DATE_RANGES,
  filterOrders,
  isRevenue,
  rangeStart,
  summarize,
  type DateRange,
} from '@/lib/order-filters'

function fmt(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function fmtDate(val: string) {
  const date = new Date(val)
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR')
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [range, setRange] = useState<DateRange>(30)
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

  // O recorte de data depende de "agora", então só é calculado depois da montagem
  // (em memo disparado pelos filtros) — nunca durante o render inicial, que precisa
  // bater com o HTML do servidor.
  const [nowMs, setNowMs] = useState<number | null>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNowMs(Date.now())
  }, [])

  const visible = useMemo(() => {
    if (nowMs === null) return []
    return filterOrders(orders, { from: rangeStart(range), search })
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, range, search, nowMs])

  const stats = useMemo(() => summarize(visible), [visible])

  // O relatório recebe o recorte em instantes absolutos: assim o PDF é um retrato
  // exato do que está na tela, sem o servidor recalcular datas em UTC.
  function openReport() {
    const params = new URLSearchParams()
    const from = rangeStart(range)
    if (from) params.set('from', from.toISOString())
    params.set('to', new Date().toISOString())
    params.set('range', String(range))
    if (search.trim()) params.set('q', search.trim())
    params.set('print', '1')
    window.open(`/admin/pedidos/relatorio?${params.toString()}`, '_blank', 'noopener')
  }

  const KPIS = [
    { label: 'Receita do período', value: fmt(stats.revenue), accent: true },
    { label: 'Ticket médio', value: fmt(stats.avgTicket), accent: false },
    { label: 'Pedidos pagos', value: `${stats.paid} de ${stats.total}`, accent: false },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--s0)' }}>
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">

        {/* Título + ação */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-black uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>Pedidos</h1>
          <button
            onClick={openReport}
            disabled={loading || visible.length === 0}
            className="flex items-center gap-2 text-xs font-black px-4 py-2 rounded-lg text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#FF6B00' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" rx="1" />
            </svg>
            Relatório do período
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
          <>
            {/* Filtros */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--s1)' }}>
                {DATE_RANGES.map((r) => (
                  <button
                    key={String(r.value)}
                    onClick={() => setRange(r.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    style={range === r.value
                      ? { backgroundColor: '#FF6B00', color: '#fff' }
                      : { color: 'var(--ink-faint)' }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="relative ml-auto">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cliente, e-mail, CPF ou nº..."
                  className="rounded-lg pl-8 pr-4 py-2 text-sm border outline-none"
                  style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)', color: 'var(--ink)', width: 260 }}
                />
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {KPIS.map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--ink-faint)' }}>{kpi.label}</p>
                  <p className="text-2xl font-black" style={{ color: kpi.accent ? '#FF6B00' : 'var(--ink)' }}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Tabela */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}>
              {visible.length === 0 ? (
                <div className="py-16 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>
                  Nenhum pedido no período selecionado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: 760 }}>
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>
                        <th className="text-left font-black px-4 py-3">Data</th>
                        <th className="text-left font-black px-4 py-3">Pedido</th>
                        <th className="text-left font-black px-4 py-3">Cliente</th>
                        <th className="text-left font-black px-4 py-3">Status</th>
                        <th className="text-right font-black px-4 py-3">Itens</th>
                        <th className="text-right font-black px-4 py-3">Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((order) => {
                        const paid = isRevenue(order.status)
                        const detalhe = `/admin/pedidos/${order.id}`
                        return (
                          <tr
                            key={order.id}
                            onClick={() => router.push(detalhe)}
                            className="cursor-pointer transition-colors hover:brightness-110"
                            style={{ borderTop: '1px solid var(--rim)' }}
                          >
                            <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--ink-dim)' }}>{fmtDate(order.createdAt)}</td>
                            <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                              {/* Link de verdade além do clique na linha: mantém teclado e
                                  "abrir em nova aba" funcionando. */}
                              <Link href={detalhe} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--ink-faint)' }}>
                                #{order.id?.slice(0, 8)}
                              </Link>
                            </td>
                            <td className="px-4 py-3 font-bold" style={{ color: 'var(--ink)' }}>{order.customer.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[order.status] }} />
                                <span style={{ color: STATUS_COLOR[order.status] }}>{STATUS_LABEL[order.status]}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right" style={{ color: 'var(--ink-dim)' }}>
                              {order.items.reduce((s, i) => s + i.quantity, 0)}
                            </td>
                            <td className="px-4 py-3 text-right font-black whitespace-nowrap" style={{ color: paid ? 'var(--ink)' : 'var(--ink-faint)' }}>
                              {paid ? fmt(order.total) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
              Clique em qualquer linha para abrir o detalhe do pedido com os valores.
              Receita conta apenas pedidos confirmados (do &quot;Pedido recebido&quot; em diante).
              {stats.unpaid > 0 && ` ${stats.unpaid} pedido${stats.unpaid === 1 ? '' : 's'} no período ainda não confirmado${stats.unpaid === 1 ? '' : 's'} — aparece${stats.unpaid === 1 ? '' : 'm'} com "—".`}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

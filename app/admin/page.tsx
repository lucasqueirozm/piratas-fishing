'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus } from '@/lib/orders'

type Stats = {
  totalRevenue: number
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  failedOrders: number
  topProducts: { name: string; quantity: number; revenue: number }[]
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  failed: 'Falhou',
  cancelled: 'Cancelado',
  in_process: 'Em análise',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
  in_process: 'bg-blue-500/20 text-blue-400',
}

function computeStats(orders: Order[]): Stats {
  const paid = orders.filter((o) => o.status === 'paid')
  const totalRevenue = paid.reduce((s, o) => s + o.total, 0)

  const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {}
  paid.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.productName
      if (!productMap[key]) productMap[key] = { name: key, quantity: 0, revenue: 0 }
      productMap[key].quantity += item.quantity
      productMap[key].revenue += item.totalPrice
    })
  })

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    totalRevenue,
    totalOrders: orders.length,
    paidOrders: orders.filter((o) => o.status === 'paid').length,
    pendingOrders: orders.filter((o) => o.status === 'pending' || o.status === 'in_process').length,
    failedOrders: orders.filter((o) => o.status === 'failed' || o.status === 'cancelled').length,
    topProducts,
  }
}

function fmt(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function fmtDate(val: unknown): string {
  if (!val) return '—'
  if (val instanceof Date) return val.toLocaleDateString('pt-BR')
  if (typeof val === 'object' && val !== null && 'seconds' in val) {
    return new Date((val as { seconds: number }).seconds * 1000).toLocaleDateString('pt-BR')
  }
  return String(val)
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [logoutPending, startLogout] = useTransition()
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

  function handleLogout() {
    startLogout(async () => {
      await fetch('/api/admin-login', { method: 'DELETE' })
      router.push('/admin/login')
    })
  }

  const stats = computeStats(orders)

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xl font-black">🏴‍☠️ Piratas Fishing — Admin</p>
          <p className="text-xs text-gray-500">Painel de análise de vendas</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={logoutPending}
          className="text-sm text-gray-400 hover:text-red-400 font-bold transition-colors"
        >
          Sair
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">Carregando dados...</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Receita total</p>
                <p className="text-2xl font-black text-[#FF6B00]">{fmt(stats.totalRevenue)}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total de pedidos</p>
                <p className="text-2xl font-black text-white">{stats.totalOrders}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Pedidos pagos</p>
                <p className="text-2xl font-black text-green-400">{stats.paidOrders}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Em análise / pendentes</p>
                <p className="text-2xl font-black text-yellow-400">{stats.pendingOrders}</p>
              </div>
            </div>

            {/* Top produtos */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-lg font-black uppercase tracking-wider mb-4 text-[#FF6B00]">
                Produtos mais vendidos
              </h2>
              {stats.topProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum pedido pago registrado ainda.</p>
              ) : (
                <div className="space-y-3">
                  {stats.topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-4">
                      <span className="text-gray-600 font-black w-5 text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-bold text-white">{p.name}</span>
                          <span className="text-sm text-gray-400">{p.quantity} un · {fmt(p.revenue)}</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF6B00] rounded-full"
                            style={{ width: `${Math.min(100, (p.revenue / (stats.topProducts[0]?.revenue || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pedidos recentes */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-lg font-black uppercase tracking-wider text-[#FF6B00]">Pedidos recentes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Cliente</th>
                      <th className="text-left py-3 px-4">Data</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">Nenhum pedido encontrado.</td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-gray-400">{order.id?.slice(0, 8)}…</td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{order.customer.name}</p>
                            <p className="text-gray-500 text-xs">{order.customer.email}</p>
                          </td>
                          <td className="py-3 px-4 text-gray-400">{fmtDate(order.createdAt)}</td>
                          <td className="py-3 px-4 font-bold text-white">{fmt(order.total)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[order.status] ?? 'bg-gray-700 text-gray-400'}`}>
                              {STATUS_LABEL[order.status] ?? order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

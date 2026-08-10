'use client'

import Image from 'next/image'
import type { Order } from '@/lib/orders'
import { STATUS_LABEL, STATUS_COLOR } from '@/lib/constants'
import { isRevenue, type OrderSummary } from '@/lib/order-filters'
import PrintSheet, { Block, fmtDate, fmtMoney, INK, DIM, FAINT, RULE, ACCENT } from '../../PrintSheet'

export default function ReportSheet({
  orders,
  summary,
  rangeLabel,
  from,
  to,
  search,
  autoPrint,
}: {
  orders: Order[]
  summary: OrderSummary
  rangeLabel: string
  from: string | null
  to: string | null
  search: string
  autoPrint: boolean
}) {
  const periodo = from
    ? `${fmtDate(from)} a ${fmtDate(to ?? undefined)}`
    : to
      ? `até ${fmtDate(to)}`
      : 'Todo o período'

  const KPIS = [
    { label: 'Receita do período', value: fmtMoney(summary.revenue), accent: true },
    { label: 'Ticket médio', value: fmtMoney(summary.avgTicket), accent: false },
    { label: 'Pedidos pagos', value: `${summary.paid} de ${summary.total}`, accent: false },
  ]

  return (
    <PrintSheet autoPrint={autoPrint} backHref="/admin/pedidos" backLabel="Pedidos">
      {/* Cabeçalho */}
      <header className="flex items-start justify-between gap-6 pb-4 mb-5" style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Piratas Fishing" width={54} height={54} priority />
          <div>
            <p className="font-black text-lg leading-none" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
              PIRATAS FISHING
            </p>
            <p className="text-[11px]" style={{ color: DIM }}>O Segredo da Fisgada · piratasfishing.com.br</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: FAINT }}>Relatório de pedidos</p>
          <p className="font-black text-xl leading-tight" style={{ color: ACCENT, fontFamily: 'var(--font-display)' }}>{rangeLabel}</p>
          <p className="text-[11px]" style={{ color: DIM }}>{periodo}</p>
        </div>
      </header>

      {/* Resumo */}
      <div className="mb-6 evitar-quebra">
        <Block title="Resumo do período">
          <div className="grid grid-cols-3 gap-4">
            {KPIS.map((kpi) => (
              <div key={kpi.label}>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] mb-0.5" style={{ color: FAINT }}>{kpi.label}</p>
                <p className="font-black text-xl" style={{ color: kpi.accent ? ACCENT : INK }}>{kpi.value}</p>
              </div>
            ))}
          </div>
          {search && (
            <p className="text-[11px] mt-3" style={{ color: DIM }}>
              Filtrado por busca: <span className="font-bold">{search}</span>
            </p>
          )}
        </Block>
      </div>

      {/* Pedidos */}
      <div className="mb-6">
        <Block title="Pedidos" breakable>
          {orders.length === 0 ? (
            <p className="py-6 text-center" style={{ color: FAINT }}>Nenhum pedido no período.</p>
          ) : (
            <table className="w-full border-collapse" style={{ fontSize: 12 }}>
              <thead>
                <tr style={{ color: FAINT }} className="text-[10px] font-black uppercase tracking-[0.1em]">
                  <th className="text-left pb-2 font-black" style={{ width: 78 }}>Data</th>
                  <th className="text-left pb-2 font-black" style={{ width: 82 }}>Pedido</th>
                  <th className="text-left pb-2 font-black">Cliente</th>
                  <th className="text-left pb-2 font-black" style={{ width: 118 }}>Status</th>
                  <th className="text-right pb-2 font-black" style={{ width: 92 }}>Receita</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const paid = isRevenue(order.status)
                  return (
                    <tr key={order.id} style={{ borderTop: `1px solid ${RULE}` }}>
                      <td className="py-1.5 align-top whitespace-nowrap" style={{ color: DIM }}>{fmtDate(order.createdAt)}</td>
                      <td className="py-1.5 align-top font-mono text-[11px]" style={{ color: DIM }}>#{order.id?.slice(0, 8)}</td>
                      <td className="py-1.5 align-top font-semibold">{order.customer.name}</td>
                      <td className="py-1.5 align-top">
                        <span className="font-bold text-[11px]" style={{ color: STATUS_COLOR[order.status] }}>
                          {STATUS_LABEL[order.status]}
                        </span>
                      </td>
                      <td
                        className="py-1.5 align-top text-right font-black whitespace-nowrap"
                        style={{ color: paid ? INK : FAINT }}
                      >
                        {paid ? fmtMoney(order.total) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Block>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-5 evitar-quebra">
        <div style={{ width: 300 }}>
          <div className="flex justify-between py-1" style={{ color: DIM }}>
            <span>Pedidos no período</span>
            <span>{summary.total}</span>
          </div>
          <div className="flex justify-between py-1" style={{ color: DIM }}>
            <span>Confirmados / não confirmados</span>
            <span>{summary.paid} / {summary.unpaid}</span>
          </div>
          <div className="flex justify-between items-baseline mt-1.5 pt-2" style={{ borderTop: `2px solid ${INK}` }}>
            <span className="font-black uppercase tracking-wider text-[11px]" style={{ fontFamily: 'var(--font-display)' }}>
              Receita do período
            </span>
            <span className="font-black text-xl" style={{ color: ACCENT }}>{fmtMoney(summary.revenue)}</span>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="pt-3 text-[10px]" style={{ borderTop: `1px solid ${RULE}`, color: FAINT }}>
        A receita soma apenas pedidos confirmados — do status &quot;Pedido recebido&quot; em diante.
        Pendentes, em análise, falhos e cancelados aparecem na lista com &quot;—&quot; e não entram no total.
      </footer>
    </PrintSheet>
  )
}

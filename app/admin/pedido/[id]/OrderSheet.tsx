'use client'

import Image from 'next/image'
import type { Order } from '@/lib/orders'
import { STATUS_LABEL, STATUS_COLOR } from '@/lib/constants'
import PrintSheet, { Block, fmtDateTime, INK, DIM, FAINT, RULE, ACCENT } from '../../PrintSheet'

// O checkout grava CEP/CPF/telefone sem máscara. Numa folha que vai para o fornecedor
// e vira etiqueta de envio, o valor formatado evita erro de leitura — mas se vier em
// formato inesperado, mostra o original em vez de mutilar o dado.
function mask(value: string | undefined, digits: number, apply: (d: string) => string) {
  const raw = value?.trim() ?? ''
  const onlyDigits = raw.replace(/\D/g, '')
  return onlyDigits.length === digits ? apply(onlyDigits) : raw
}

const fmtCep = (v?: string) => mask(v, 8, (d) => `${d.slice(0, 5)}-${d.slice(5)}`)

const fmtCpf = (v?: string) =>
  mask(v, 11, (d) => `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`)

const fmtPhone = (v?: string) => {
  const raw = v?.trim() ?? ''
  const d = raw.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return raw
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-2 leading-snug">
      <span className="shrink-0" style={{ color: FAINT, width: 74 }}>{label}</span>
      <span className="font-semibold" style={{ color: INK }}>{value?.trim() || '—'}</span>
    </div>
  )
}

export default function OrderSheet({ order, autoPrint }: { order: Order; autoPrint: boolean }) {
  const { customer, items } = order
  const address = customer.address
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)
  const shortId = (order.id ?? '').slice(0, 8)

  return (
    <PrintSheet autoPrint={autoPrint} backHref="/admin/kanban" backLabel="Kanban">
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
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: FAINT }}>Pedido</p>
          <p className="font-black text-2xl leading-tight font-mono" style={{ color: ACCENT }}>#{shortId}</p>
          <p className="text-[11px]" style={{ color: DIM }}>{fmtDateTime(order.createdAt)}</p>
        </div>
      </header>

      {/* Status + resumo */}
      <div className="flex items-center gap-3 flex-wrap mb-6 evitar-quebra">
        <span
          className="text-[10px] font-black uppercase tracking-[0.12em] px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: STATUS_COLOR[order.status] }}
        >
          {STATUS_LABEL[order.status]}
        </span>
        <span className="text-[11px]" style={{ color: DIM }}>
          {items.length} produto{items.length === 1 ? '' : 's'} · {totalUnits} unidade{totalUnits === 1 ? '' : 's'}
        </span>
        <span className="ml-auto text-[11px]" style={{ color: FAINT }}>
          Atualizado em {fmtDateTime(order.updatedAt)}
        </span>
      </div>

      {/* Cliente + Entrega */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <Block title="Cliente">
          <div className="space-y-1">
            <Field label="Nome" value={customer.name} />
            <Field label="Telefone" value={fmtPhone(customer.phone)} />
            <Field label="E-mail" value={customer.email} />
            <Field label="CPF" value={fmtCpf(customer.cpf)} />
          </div>
        </Block>

        <Block title="Endereço de entrega">
          <div className="space-y-0.5 font-semibold" style={{ color: INK }}>
            <p>
              {address.street}, {address.number}
              {address.complement ? ` — ${address.complement}` : ''}
            </p>
            <p>{address.neighborhood}</p>
            <p>{address.city} / {address.state}</p>
            <p className="font-mono pt-0.5" style={{ color: DIM }}>CEP {fmtCep(address.cep)}</p>
          </div>
        </Block>
      </div>

      {/* Itens */}
      <div className="mb-6">
        <Block title="Itens do pedido" breakable>
          <table className="w-full border-collapse" style={{ fontSize: 12.5 }}>
            <thead>
              <tr style={{ color: FAINT }} className="text-[10px] font-black uppercase tracking-[0.1em]">
                <th className="text-left pb-2 font-black">Produto</th>
                <th className="text-center pb-2 font-black" style={{ width: 130 }}>Tamanho</th>
                <th className="text-right pb-2 font-black" style={{ width: 90 }}>Qtd</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${RULE}` }}>
                  <td className="py-2 font-semibold align-top">{item.productName}</td>
                  <td className="py-2 text-center align-top">
                    {item.size ? (
                      <span className="font-black text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#ffe9d8', color: '#b34c00' }}>
                        {item.size}
                      </span>
                    ) : (
                      <span style={{ color: FAINT }}>—</span>
                    )}
                  </td>
                  {/* Sem os preços, a quantidade é o número que o fornecedor separa. */}
                  <td className="py-2 text-right font-black align-top text-base">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Block>
      </div>

      {/* Rastreio */}
      {order.trackingCode && (
        <div
          className="mb-6 px-4 py-3 rounded evitar-quebra"
          style={{ backgroundColor: '#f6f2ea', border: `1px solid ${RULE}` }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: FAINT }}>Código de rastreio</p>
          <p className="font-mono font-black text-base" style={{ color: INK }}>{order.trackingCode}</p>
        </div>
      )}

      {/* Rodapé */}
      <footer className="pt-3 flex justify-between gap-4 text-[10px]" style={{ borderTop: `1px solid ${RULE}`, color: FAINT }}>
        <span className="font-mono">Pedido {order.id}</span>
        {order.paymentId && <span className="font-mono">Pagamento MP {order.paymentId}</span>}
      </footer>
    </PrintSheet>
  )
}

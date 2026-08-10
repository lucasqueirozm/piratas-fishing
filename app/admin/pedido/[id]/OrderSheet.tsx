'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Order } from '@/lib/orders'
import { STATUS_LABEL, STATUS_COLOR } from '@/lib/constants'

// A folha usa cores fixas em vez das variáveis de tema: o admin roda em tema escuro
// por padrão e imprimir --s0/--ink geraria uma página preta.
const INK = '#14110d'
const DIM = '#5f574c'
const FAINT = '#8d8271'
const RULE = '#ddd6ca'
const ACCENT = '#FF6B00'

const PRINT_CSS = `
@page { size: A4; margin: 12mm; }

#folha { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

@media print {
  /* O layout raiz injeta navbar e banner de cookies em toda rota — esconde tudo
     que não faz parte da folha, sem depender da posição na árvore. */
  body * { visibility: hidden !important; }
  #folha, #folha * { visibility: visible !important; }

  /* Tira o wrapper do fluxo para não gerar páginas em branco depois da folha. */
  #folha-wrap { min-height: 0 !important; padding: 0 !important; background: none !important; }
  #folha {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .nao-imprime { display: none !important; }

  thead { display: table-header-group; }
  tr, .evitar-quebra { break-inside: avoid; }
}
`

// Fuso fixo: sem ele o servidor (UTC) e o browser renderizam datas diferentes e a
// hidratação quebra.
const DATE_TIME = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

function fmt(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function fmtDateTime(val: string | undefined) {
  if (!val) return '—'
  const date = new Date(val)
  return isNaN(date.getTime()) ? '—' : DATE_TIME.format(date)
}

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

// `breakable` para blocos que podem atravessar páginas: sem isso a tabela de itens
// inteira é empurrada para a página seguinte e sobra meia página em branco.
function Block({ title, breakable, children }: { title: string; breakable?: boolean; children: React.ReactNode }) {
  return (
    <section className={breakable ? undefined : 'evitar-quebra'}>
      <h2
        className="text-[10px] font-black uppercase tracking-[0.14em] pb-1.5 mb-2.5 border-b"
        style={{ color: ACCENT, borderColor: RULE, fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function OrderSheet({ order, autoPrint }: { order: Order; autoPrint: boolean }) {
  useEffect(() => {
    if (!autoPrint) return

    let done = false
    const fire = () => {
      if (done) return
      done = true
      window.print()
    }

    // Espera fontes e imagens para o PDF não sair com o cabeçalho vazio, mas nunca
    // deixa o diálogo preso se algum recurso demorar.
    const timer = setTimeout(fire, 3000)
    const windowLoaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))

    Promise.all([windowLoaded, document.fonts.ready]).then(fire).catch(fire)

    return () => { done = true; clearTimeout(timer) }
  }, [autoPrint])

  const { customer, items } = order
  const address = customer.address
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)
  const shortId = (order.id ?? '').slice(0, 8)

  return (
    <div
      id="folha-wrap"
      className="min-h-screen py-8 px-4 flex flex-col items-center gap-5"
      style={{ backgroundColor: 'var(--s0)' }}
    >
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* ── Barra de ações (só na tela) ── */}
      <div className="nao-imprime w-full flex items-center gap-3" style={{ maxWidth: 820 }}>
        <Link
          href="/admin/kanban"
          className="flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'var(--s2)', color: 'var(--ink-dim)' }}
        >
          ← Kanban
        </Link>
        <button
          onClick={() => window.print()}
          className="ml-auto flex items-center gap-2 text-sm font-black px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: ACCENT }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" rx="1" />
          </svg>
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* ── Folha A4 ── */}
      <article
        id="folha"
        className="w-full rounded-sm"
        style={{
          maxWidth: 820,
          backgroundColor: '#ffffff',
          color: INK,
          padding: '40px 44px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
          fontSize: 12.5,
          lineHeight: 1.5,
        }}
      >
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
                  <th className="text-center pb-2 font-black" style={{ width: 70 }}>Tamanho</th>
                  <th className="text-center pb-2 font-black" style={{ width: 46 }}>Qtd</th>
                  <th className="text-right pb-2 font-black" style={{ width: 90 }}>Unitário</th>
                  <th className="text-right pb-2 font-black" style={{ width: 90 }}>Total</th>
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
                    <td className="py-2 text-center font-black align-top">{item.quantity}</td>
                    <td className="py-2 text-right align-top" style={{ color: DIM }}>{fmt(item.unitPrice)}</td>
                    <td className="py-2 text-right font-black align-top">{fmt(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Block>
        </div>

        {/* Totais */}
        <div className="flex justify-end mb-6 evitar-quebra">
          <div style={{ width: 260 }}>
            <div className="flex justify-between py-1" style={{ color: DIM }}>
              <span>Subtotal</span>
              <span>{fmt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1" style={{ color: DIM }}>
              <span>Frete</span>
              <span>{order.shipping === 0 ? 'Grátis' : fmt(order.shipping)}</span>
            </div>
            <div
              className="flex justify-between items-baseline mt-1.5 pt-2"
              style={{ borderTop: `2px solid ${INK}` }}
            >
              <span className="font-black uppercase tracking-wider text-[11px]" style={{ fontFamily: 'var(--font-display)' }}>Total</span>
              <span className="font-black text-xl" style={{ color: ACCENT }}>{fmt(order.total)}</span>
            </div>
          </div>
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
      </article>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import Link from 'next/link'

// Casco compartilhado das folhas imprimíveis do admin (pedido do fornecedor e
// relatório de pedidos): CSS de impressão, barra de ações e o disparo automático
// do diálogo. As folhas em si só cuidam do conteúdo.

// Cores fixas em vez das variáveis de tema: o admin roda em tema escuro por padrão
// e imprimir --s0/--ink geraria uma página preta.
export const INK = '#14110d'
export const DIM = '#5f574c'
export const FAINT = '#8d8271'
export const RULE = '#ddd6ca'
export const ACCENT = '#FF6B00'

export const SHEET_WIDTH = 820

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
const TZ = 'America/Sao_Paulo'

const DATE_TIME = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: TZ })
const DATE_ONLY = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: TZ })

export function fmtDateTime(val: string | undefined) {
  if (!val) return '—'
  const date = new Date(val)
  return isNaN(date.getTime()) ? '—' : DATE_TIME.format(date)
}

export function fmtDate(val: string | undefined) {
  if (!val) return '—'
  const date = new Date(val)
  return isNaN(date.getTime()) ? '—' : DATE_ONLY.format(date)
}

export function fmtMoney(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

// `breakable` para blocos que podem atravessar páginas: sem isso uma tabela longa
// é empurrada inteira para a página seguinte e sobra meia página em branco.
export function Block({ title, breakable, children }: { title: string; breakable?: boolean; children: React.ReactNode }) {
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

export default function PrintSheet({
  autoPrint,
  backHref,
  backLabel,
  children,
}: {
  autoPrint: boolean
  backHref: string
  backLabel: string
  children: React.ReactNode
}) {
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

  return (
    <div
      id="folha-wrap"
      className="min-h-screen py-8 px-4 flex flex-col items-center gap-5"
      style={{ backgroundColor: 'var(--s0)' }}
    >
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* ── Barra de ações (só na tela) ── */}
      <div className="nao-imprime w-full flex items-center gap-3" style={{ maxWidth: SHEET_WIDTH }}>
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'var(--s2)', color: 'var(--ink-dim)' }}
        >
          ← {backLabel}
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
          maxWidth: SHEET_WIDTH,
          backgroundColor: '#ffffff',
          color: INK,
          padding: '40px 44px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
          fontSize: 12.5,
          lineHeight: 1.5,
        }}
      >
        {children}
      </article>
    </div>
  )
}

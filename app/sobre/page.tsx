import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre | Piratas Fishing',
  description: 'Conheça a história da Piratas Fishing, a loja de iscas de pesca com o segredo da fisgada.',
}

export default function SobrePage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4" style={{ backgroundColor: 'var(--s0)', color: 'var(--ink)' }}>
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm transition-colors hover:text-[#FF6B00]" style={{ color: 'var(--ink-faint)' }}>
          ← Voltar ao início
        </Link>

        <h1 className="text-4xl font-black uppercase tracking-wider mt-4 mb-10">Sobre a Piratas Fishing</h1>

        <div className="space-y-8 leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">Nossa história</h2>
            <p>
              A Piratas Fishing nasceu da paixão pela pesca. Fundada por pescadores apaixonados,
              nossa missão é fornecer as melhores iscas do mercado para quem leva a pesca a sério —
              do iniciante ao profissional.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">Nossa missão</h2>
            <p>
              Oferecer iscas de alta qualidade, com entrega rápida para todo o Brasil,
              a preços justos e com o atendimento de quem entende de pesca.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">Nossos produtos</h2>
            <p>
              Trabalhamos com iscas naturais (camarão rosa, salgado e temperado) e iscas artificiais
              (articuladas, fluorescentes e kits de silicone), selecionadas criteriosamente para
              diferentes tipos de pesca e ambientes aquáticos.
            </p>
          </section>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/catalogo"
              className="py-3 px-6 bg-[#FF6B00] hover:bg-[#e05f00] text-white font-bold rounded-xl transition-colors text-center"
            >
              Ver Catálogo
            </Link>
            <Link
              href="/contato"
              className="py-3 px-6 border font-bold rounded-xl transition-colors text-center hover:border-[#FF6B00] hover:text-[#FF6B00]"
              style={{ borderColor: 'var(--rim-str)', color: 'var(--ink-dim)' }}
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

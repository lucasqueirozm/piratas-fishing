import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato | Piratas Fishing',
  description: 'Entre em contato com a Piratas Fishing. Atendimento via e-mail em horário comercial.',
}

const email = process.env.NEXT_PUBLIC_EMAIL ?? ''

export default function ContatoPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4" style={{ backgroundColor: 'var(--s0)' }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm font-medium transition-colors hover:text-[#FF6B00]" style={{ color: 'var(--ink-faint)' }}>
          ← Voltar ao início
        </Link>

        <h1 className="text-4xl font-bold uppercase tracking-wider mt-6 mb-10" style={{ color: 'var(--ink)' }}>Contato</h1>

        <div className="space-y-5">
          {/* E-mail */}
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}>
            <h2 className="text-sm font-bold text-[#FF6B00] mb-1 uppercase tracking-widest">E-mail</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--ink-dim)' }}>
              Nosso canal de atendimento. Respondemos em até 1 dia útil (seg–sex, 9h–18h).
            </p>
            {email ? (
              <a
                href={`mailto:${email}?subject=Dúvida sobre produtos - Piratas Fishing`}
                className="inline-flex items-center gap-3 py-3 px-6 bg-[#FF6B00] hover:bg-[#e05f00] text-white font-bold rounded-xl transition-colors text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Enviar e-mail
              </a>
            ) : (
              <p className="text-sm text-[#FF6B00]">E-mail de contato em breve.</p>
            )}
          </div>

          {/* LGPD */}
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}>
            <h2 className="text-sm font-bold text-[#FF6B00] mb-1 uppercase tracking-widest">Direitos LGPD</h2>
            <p className="text-sm mb-2" style={{ color: 'var(--ink-dim)' }}>
              Para exercer seus direitos como titular de dados (acesso, correção, exclusão, portabilidade),
              envie um e-mail com o assunto <strong style={{ color: 'var(--ink)' }}>&quot;Solicitação LGPD&quot;</strong>.
              Respondemos em até 15 dias corridos conforme a lei.
            </p>
            <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>
              Consulte nossa{' '}
              <Link href="/privacidade" className="text-[#FF6B00] hover:underline">Política de Privacidade</Link>{' '}
              para mais informações.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

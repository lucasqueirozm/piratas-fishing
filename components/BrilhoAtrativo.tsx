import Link from 'next/link'

const SRC = '/brilho-atrativo.mp4'

function Video({ className }: { className?: string }) {
  return (
    <video
      className={className}
      src={SRC}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  )
}

// Seção completa para a página principal.
export function BrilhoAtrativoSection() {
  return (
    <section className="py-24" style={{ backgroundColor: 'var(--s0)', borderTop: '1px solid var(--rim)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Texto */}
          <div>
            <span className="inline-block text-[#FF6B00] text-[10px] font-bold uppercase tracking-[0.22em] px-4 py-1.5 rounded-full mb-6" style={{ border: '1px solid rgba(255,107,0,0.28)', backgroundColor: 'rgba(255,107,0,0.06)' }}>
              Exclusivo Turbo &amp; Shad
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5" style={{ color: 'var(--ink)' }}>
              Brilho Atrativo
            </h2>
            <p className="text-base leading-relaxed mb-5" style={{ color: 'var(--ink-dim)' }}>
              As iscas Turbo e Shad têm brilho atrativo. Dentro d&apos;água elas refletem e brilham,
              chamando a atenção do peixe mesmo em baixa luz ou água turva. Veja no vídeo como esse
              brilho funciona na prática.
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors hover:text-[#FF6B00]"
              style={{ color: '#FF6B00' }}
            >
              Ver iscas com brilho atrativo
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Vídeo */}
          <div
            className="relative aspect-video rounded-2xl overflow-hidden border shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            style={{ backgroundColor: '#000', borderColor: 'var(--rim)' }}
          >
            <Video className="w-full h-full object-cover" />
            {/* Brilho ambiente atrás do vídeo */}
            <div
              className="absolute -inset-6 -z-10 rounded-3xl blur-3xl opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.5) 0%, transparent 70%)' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// Bloco compacto para as páginas de produto (Turbo e Shad).
export function BrilhoAtrativoBlock() {
  return (
    <div className="rounded-2xl p-5 border" style={{ backgroundColor: 'var(--s2)', borderColor: 'var(--rim)' }}>
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#FF6B00' }}>
          Brilho atrativo
        </p>
      </div>
      <div className="relative aspect-video rounded-xl overflow-hidden mb-3" style={{ backgroundColor: '#000' }}>
        <Video className="w-full h-full object-cover" />
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-faint)' }}>
        Dentro d&apos;água esta isca reflete e brilha, atraindo o peixe mesmo em baixa luz. Veja acima como funciona.
      </p>
    </div>
  )
}

'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTransition } from 'react'

const NAV = [
  {
    href: '/admin',
    exact: true,
    label: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/admin/kanban',
    exact: false,
    label: 'Kanban',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="18" rx="1" />
        <rect x="10" y="3" width="5" height="12" rx="1" />
        <rect x="17" y="3" width="5" height="15" rx="1" />
      </svg>
    ),
  },
  {
    href: '/admin/estatisticas',
    exact: false,
    label: 'Estatísticas',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

function LogoutButton() {
  const [pending, start] = useTransition()
  const router = useRouter()

  function handle() {
    start(async () => {
      await fetch('/api/admin-login', { method: 'DELETE' })
      router.push('/admin/login')
    })
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-red-500/10"
      style={{ color: 'var(--ink-faint)' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {pending ? 'Saindo...' : 'Sair'}
    </button>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="flex" style={{ minHeight: '100vh', backgroundColor: 'var(--s0)' }}>
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col border-r shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ width: 220, backgroundColor: 'var(--s1)', borderColor: 'var(--rim)' }}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--rim)' }}>
          <Image
            src="/logo.png"
            alt="Piratas Fishing"
            width={130}
            height={44}
            className="h-11 w-auto object-contain"
            priority
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, exact, label, icon }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={active ? { backgroundColor: '#FF6B00', color: '#fff' } : { color: 'var(--ink-dim)' }}
              >
                {icon}
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--rim)' }}>
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/track'

export default function PageTracker() {
  const pathname = usePathname()
  useEffect(() => {
    // Não contabiliza o painel admin como "visita ao site" — senão o uso diário
    // do dono infla as visitas e distorce a taxa de conversão.
    if (pathname.startsWith('/admin')) return
    track('page_view')
  }, [pathname])
  return null
}

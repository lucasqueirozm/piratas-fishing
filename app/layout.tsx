import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed, Geist_Mono } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'
import CartDrawer from '@/components/CartDrawer'
import CookieBanner from '@/components/CookieBanner'
import PageTracker from '@/components/PageTracker'

const barlow = Barlow({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
})

const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://piratasfishing.com.br'),
  title: {
    default: 'Piratas Fishing',
    template: '%s | Piratas Fishing',
  },
  description: 'O Segredo da Fisgada — Iscas de pesca de alta qualidade entregues para todo o Brasil.',
  keywords: ['iscas de pesca', 'camarão', 'pesca', 'isca artificial', 'piratas fishing'],
  openGraph: {
    siteName: 'Piratas Fishing',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/logo.png' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${barlow.variable} ${barlowCondensed.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Inline script runs before React hydration — prevents flash of wrong theme */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('pf-theme');var sys=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',s||sys);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--s0)', color: 'var(--ink)' }}>
        <ThemeProvider>
          <CartProvider>
            <PageTracker />
            <Navbar />
            {children}
            <CartDrawer />
            <CookieBanner />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

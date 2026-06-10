import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Piratas Fishing — O Segredo da Fisgada'

export default function Image() {
  const logoData = readFileSync(join(process.cwd(), 'public/logo.png'))
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
          gap: '64px',
        }}
      >
        <img
          src={logoSrc}
          width={280}
          height={280}
          style={{ borderRadius: '50%' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '84px',
              fontWeight: 900,
              color: '#FF6B00',
              lineHeight: 1,
              letterSpacing: '-2px',
            }}
          >
            Piratas Fishing
          </span>
          <span style={{ fontSize: '34px', color: '#aaaaaa', marginTop: '16px' }}>
            O Segredo da Fisgada
          </span>
          <span style={{ fontSize: '26px', color: '#666666', marginTop: '8px' }}>
            Iscas de pesca para todo o Brasil
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}

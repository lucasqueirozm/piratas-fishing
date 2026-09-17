import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Piratas Fishing'

export default function Image() {
  let logoSrc = ''
  try {
    const logoData = readFileSync(join(process.cwd(), 'public/logo.png'))
    logoSrc = `data:image/png;base64,${logoData.toString('base64')}`
  } catch {
    // logo.png ausente — renderiza fundo escuro sem imagem
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={logoSrc} width={580} height={580} />
      </div>
    ),
    { ...size },
  )
}

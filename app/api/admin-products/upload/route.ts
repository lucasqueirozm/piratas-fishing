import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import sharp from 'sharp'
import { getAdminDb } from '@/lib/supabase'
import { verifySessionToken } from '@/lib/admin-auth'

export const runtime = 'nodejs'

const BUCKET = 'products'
const MAX_BYTES = 12 * 1024 * 1024 // 12 MB

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session) return false
  return verifySessionToken(session)
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'produto'
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return Response.json({ error: 'Não autorizado.' }, { status: 401 })

  let form: FormData
  try { form = await req.formData() } catch { return Response.json({ error: 'Requisição inválida.' }, { status: 400 }) }

  const file = form.get('file')
  if (!(file instanceof Blob) || file.size === 0) {
    return Response.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'Imagem muito grande (máx. 12 MB).' }, { status: 400 })
  }

  const nameHint = typeof form.get('name') === 'string' ? (form.get('name') as string) : 'produto'

  // Processa igual ao catálogo: 900x900, fundo escuro, realce de cor.
  let processed: Buffer
  try {
    const input = Buffer.from(await file.arrayBuffer())
    processed = await sharp(input)
      .resize(900, 900, { fit: 'contain', background: { r: 20, g: 20, b: 20 } })
      .modulate({ brightness: 1.08, saturation: 1.25 })
      .sharpen({ sigma: 0.8 })
      .jpeg({ quality: 88, progressive: true, mozjpeg: true })
      .toBuffer()
  } catch {
    return Response.json({ error: 'Não foi possível processar a imagem. Envie um PNG ou JPG válido.' }, { status: 400 })
  }

  const path = `${slugify(nameHint)}-${Date.now()}.jpg`
  const db = getAdminDb()

  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(path, processed, { contentType: 'image/jpeg', upsert: true })

  if (uploadError) {
    console.error('[admin-products/upload]', uploadError)
    return Response.json({ error: 'Falha ao salvar a imagem.' }, { status: 500 })
  }

  const { data } = db.storage.from(BUCKET).getPublicUrl(path)
  return Response.json({ url: data.publicUrl })
}

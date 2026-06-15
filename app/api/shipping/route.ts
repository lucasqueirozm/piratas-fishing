import { NextRequest } from 'next/server'
import { quoteShipping } from '@/lib/shipping'

export type { ShippingOption } from '@/lib/shipping'

export async function POST(req: NextRequest) {
  let cep: string
  let totalItems: number
  try {
    const body = await req.json() as { cep?: unknown; totalItems?: unknown }
    cep = String(body.cep ?? '')
    totalItems = Number(body.totalItems) || 1
  } catch {
    return Response.json({ error: 'Requisição inválida.' }, { status: 400 })
  }

  const result = await quoteShipping(cep, totalItems)

  if (result.status === 'unconfigured') {
    return Response.json(
      { error: 'Frete não configurado. Preencha MELHOR_ENVIO_TOKEN e MELHOR_ENVIO_CEP_ORIGEM.' },
      { status: 503 },
    )
  }
  if (result.status === 'error') {
    return Response.json({ error: result.message }, { status: result.httpStatus })
  }

  return Response.json({ options: result.options })
}

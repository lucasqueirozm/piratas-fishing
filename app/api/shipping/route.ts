import { NextRequest } from 'next/server'

export type ShippingOption = {
  id: number
  name: string
  company: string
  price: number
  priceStr: string
  deliveryTime: number
  deliveryRange: { min: number; max: number }
  error?: string
}

type MelhorEnvioService = {
  id: number
  name: string
  price?: string
  custom_price?: string
  delivery_time?: number
  custom_delivery_time?: number
  delivery_range?: { min: number; max: number }
  custom_delivery_range?: { min: number; max: number }
  error?: string
  company: { id: number; name: string }
}

/**
 * Calcula dimensões do pacote com base na quantidade total de itens.
 * Baseado em embalagem padrão de iscas de silicone.
 */
function getPackageDimensions(totalItems: number) {
  if (totalItems <= 3)  return { height: 5,  width: 15, length: 20, weight: 0.3 }
  if (totalItems <= 10) return { height: 8,  width: 20, length: 25, weight: 0.5 }
  if (totalItems <= 20) return { height: 12, width: 25, length: 30, weight: 0.8 }
  return                       { height: 15, width: 30, length: 35, weight: 1.2 }
}

export async function POST(req: NextRequest) {
  const token = process.env.MELHOR_ENVIO_TOKEN
  const originCep = process.env.MELHOR_ENVIO_CEP_ORIGEM
  const email = process.env.MELHOR_ENVIO_EMAIL
  const sandbox = process.env.MELHOR_ENVIO_SANDBOX === 'true'

  if (!token || !originCep) {
    return Response.json(
      { error: 'Frete não configurado. Preencha MELHOR_ENVIO_TOKEN e MELHOR_ENVIO_CEP_ORIGEM.' },
      { status: 503 },
    )
  }

  const { cep, totalItems } = await req.json() as { cep: string; totalItems: number }

  const cleanCep = cep.replace(/\D/g, '')
  if (cleanCep.length !== 8) {
    return Response.json({ error: 'CEP inválido.' }, { status: 400 })
  }

  const pkg = getPackageDimensions(Math.max(1, totalItems))

  const baseUrl = sandbox
    ? 'https://sandbox.melhorenvio.com.br'
    : 'https://melhorenvio.com.br'

  const userAgent = `Piratas Fishing/1.0 (${email ?? 'contato@piratasfishing.com.br'})`

  const body = {
    from: { postal_code: originCep.replace(/\D/g, '') },
    to: { postal_code: cleanCep },
    package: pkg,
    options: {
      insurance_value: 0,
      receipt: false,
      own_hand: false,
    },
  }

  try {
    const res = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': userAgent,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[shipping] Melhor Envio erro:', res.status, text)
      return Response.json(
        { error: `Erro ao consultar frete (${res.status}). Verifique o token.` },
        { status: 502 },
      )
    }

    const services: MelhorEnvioService[] = await res.json()

    const options: ShippingOption[] = services
      .filter((s) => !s.error && s.price != null && /correios/i.test(s.company.name))
      .map((s) => {
        const price = parseFloat(s.custom_price ?? s.price ?? '0')
        const time = s.custom_delivery_time ?? s.delivery_time ?? 0
        const range = s.custom_delivery_range ?? s.delivery_range ?? { min: time, max: time + 2 }

        return {
          id: s.id,
          name: s.name,
          company: s.company.name,
          price,
          priceStr: price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          deliveryTime: time,
          deliveryRange: range,
        }
      })
      .sort((a, b) => a.price - b.price)

    return Response.json({ options })
  } catch (err) {
    console.error('[shipping]', err)
    return Response.json({ error: 'Falha de conexão com o Melhor Envio.' }, { status: 502 })
  }
}

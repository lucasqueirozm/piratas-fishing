import 'server-only'

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

export type ShippingResult =
  | { status: 'ok'; options: ShippingOption[] }
  | { status: 'unconfigured' }
  | { status: 'error'; httpStatus: number; message: string }

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

/**
 * Consulta o Melhor Envio e retorna as opções de frete dos Correios para um CEP.
 * Usado tanto pela rota /api/shipping (cotação no checkout) quanto pela
 * /api/create-payment (revalidação do valor enviado pelo cliente).
 */
export async function quoteShipping(cep: string, totalItems: number): Promise<ShippingResult> {
  const token = process.env.MELHOR_ENVIO_TOKEN
  const originCep = process.env.MELHOR_ENVIO_CEP_ORIGEM
  const email = process.env.MELHOR_ENVIO_EMAIL
  const sandbox = process.env.MELHOR_ENVIO_SANDBOX === 'true'

  if (!token || !originCep) {
    return { status: 'unconfigured' }
  }

  const cleanCep = cep.replace(/\D/g, '')
  if (cleanCep.length !== 8) {
    return { status: 'error', httpStatus: 400, message: 'CEP inválido.' }
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
    options: { insurance_value: 0, receipt: false, own_hand: false },
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
      return { status: 'error', httpStatus: 502, message: `Erro ao consultar frete (${res.status}). Verifique o token.` }
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

    return { status: 'ok', options }
  } catch (err) {
    console.error('[shipping]', err)
    return { status: 'error', httpStatus: 502, message: 'Falha de conexão com o Melhor Envio.' }
  }
}

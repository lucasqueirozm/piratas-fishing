import { NextRequest } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createOrder, updateOrderPreference } from '@/lib/orders'
import type { Customer, OrderItem } from '@/lib/orders'
import { getProductById } from '@/lib/products'
import { quoteShipping } from '@/lib/shipping'
import { MIN_ORDER_VALUE, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

// Tolerância (R$) ao casar o frete enviado pelo cliente com a cotação do servidor.
const SHIPPING_MATCH_TOLERANCE = 1

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
})

function isValidCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  let rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  if (rem !== parseInt(d[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  return rem === parseInt(d[10])
}

// O checkout grava o telefone só em dígitos (10 ou 11). O MercadoPago espera DDD e
// número separados — mandar tudo junto em `number` é um dado malformado a mais na
// conta do antifraude.
function splitPhone(raw: string): { area_code?: string; number?: string } {
  const d = (raw ?? '').replace(/\D/g, '')
  if (d.length === 10 || d.length === 11) return { area_code: d.slice(0, 2), number: d.slice(2) }
  return { number: d || undefined }
}

// `payer` do MP tem nome e sobrenome separados; mandar o nome inteiro em `name`
// deixa `surname` vazio.
function splitName(raw: string): { name: string; surname?: string } {
  const partes = (raw ?? '').trim().split(/\s+/).filter(Boolean)
  if (partes.length <= 1) return { name: partes[0] ?? '' }
  return { name: partes[0], surname: partes.slice(1).join(' ') }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      customer: Customer
      items: OrderItem[]
      subtotal: number
      shipping: number
      total: number
    }

    const { customer, items, shipping } = body

    // Validação de campos obrigatórios
    if (!customer?.name || !customer?.email || !customer?.cpf || !customer?.phone) {
      return Response.json({ error: 'Dados do cliente incompletos.' }, { status: 400 })
    }
    if (!isValidCPF(customer.cpf)) {
      return Response.json({ error: 'CPF inválido.' }, { status: 400 })
    }
    const addr = customer?.address
    if (!addr?.cep || addr.cep.replace(/\D/g, '').length !== 8) {
      return Response.json({ error: 'CEP inválido.' }, { status: 400 })
    }
    if (!addr.street?.trim() || !addr.number?.trim() || !addr.neighborhood?.trim() || !addr.city?.trim() || !addr.state?.trim()) {
      return Response.json({ error: 'Endereço incompleto.' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Nenhum item no pedido.' }, { status: 400 })
    }

    // Preços sempre do servidor — nunca do cliente.
    // Impede manipulação de valores via request adulterado.
    const validatedItems: OrderItem[] = []
    for (const item of items) {
      const product = await getProductById(Number(item.productId))
      if (!product) {
        return Response.json({ error: `Produto ${item.productId} não encontrado.` }, { status: 400 })
      }
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1))
      validatedItems.push({
        productId: product.id,
        productName: product.name,
        size: typeof item.size === 'string' ? item.size : undefined,
        quantity: qty,
        unitPrice: product.price,
        totalPrice: product.price * qty,
        image: product.image,
      })
    }

    const validatedSubtotal = validatedItems.reduce((s, i) => s + i.totalPrice, 0)

    // Pedido mínimo de R$100
    if (validatedSubtotal < MIN_ORDER_VALUE) {
      return Response.json({ error: 'Pedido mínimo de R$ 100,00.' }, { status: 400 })
    }

    // Frete validado no servidor: gratuito acima de R$199,99; obrigatório (>0) abaixo disso.
    const clientShipping = Number(shipping) || 0
    let validatedShipping: number

    if (validatedSubtotal >= FREE_SHIPPING_THRESHOLD) {
      validatedShipping = 0
    } else {
      if (clientShipping <= 0) {
        return Response.json({ error: 'Frete inválido.' }, { status: 400 })
      }

      // Recota o frete no servidor e exige que o valor do cliente case com uma
      // opção real para aquele CEP. Impede pagar frete adulterado (ex.: R$0,01).
      const totalItems = validatedItems.reduce((s, i) => s + i.quantity, 0)
      const quote = await quoteShipping(customer.address.cep, totalItems)

      if (quote.status === 'ok' && quote.options.length > 0) {
        const matches = quote.options.some(
          (opt) => Math.abs(opt.price - clientShipping) <= SHIPPING_MATCH_TOLERANCE,
        )
        if (!matches) {
          return Response.json({ error: 'Valor de frete inválido. Recalcule o frete.' }, { status: 400 })
        }
        validatedShipping = clientShipping
      } else {
        // Melhor Envio indisponível ou não configurado: aceita o valor do cliente
        // dentro de um teto, para o checkout não travar por falha externa.
        validatedShipping = Math.min(clientShipping, 300)
      }
    }

    const validatedTotal = validatedSubtotal + validatedShipping

    // 1. Persistir pedido com status "pending" antes de ir ao MP
    const orderId = await createOrder({
      status: 'pending',
      customer,
      items: validatedItems,
      subtotal: validatedSubtotal,
      shipping: validatedShipping,
      total: validatedTotal,
    })

    // Remove barra(s) final(is) para não gerar "//api/payment-webhook" (barra dupla),
    // o que pode fazer o MercadoPago falhar em notificar o pagamento.
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

    // 2. Criar preferência no MercadoPago
    const preference = new Preference(mpClient)

    const result = await preference.create({
      body: {
        external_reference: orderId,
        items: validatedItems.map((item) => ({
          id: String(item.productId),
          title: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: 'BRL',
        })),
        payer: {
          ...splitName(customer.name),
          email: customer.email,
          identification: {
            type: 'CPF',
            number: customer.cpf.replace(/\D/g, ''),
          },
          phone: splitPhone(customer.phone),
          // `payer.address` do MP aceita só CEP, rua e número. Cidade e estado vão
          // em shipments.receiver_address, que é o objeto que os comporta.
          address: {
            zip_code: customer.address.cep.replace(/\D/g, ''),
            street_name: customer.address.street,
            street_number: customer.address.number,
          },
        },
        shipments: {
          cost: validatedShipping,
          mode: 'not_specified',
          receiver_address: {
            zip_code: customer.address.cep.replace(/\D/g, ''),
            street_name: customer.address.street,
            street_number: customer.address.number,
            city_name: customer.address.city,
            state_name: customer.address.state,
            country_name: 'Brasil',
            ...(customer.address.complement ? { apartment: customer.address.complement } : {}),
          },
        },
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/pending`,
        },
        ...(baseUrl.startsWith('http://localhost') ? {} : { auto_return: 'approved' as const }),
        notification_url: `${baseUrl}/api/payment-webhook`,
        statement_descriptor: 'PIRATAS FISHING',
      },
    })

    // 3. Salvar o ID da preferência no pedido
    if (result.id) {
      await updateOrderPreference(orderId, result.id)
    }

    return Response.json({ initPoint: result.init_point, orderId })
  } catch (err: unknown) {
    console.error('[create-payment]', JSON.stringify(err, Object.getOwnPropertyNames(err as object)))
    return Response.json({ error: 'Erro ao processar pagamento. Tente novamente.' }, { status: 500 })
  }
}

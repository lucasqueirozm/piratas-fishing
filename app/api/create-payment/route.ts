import { NextRequest } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createOrder, updateOrderPreference } from '@/lib/orders'
import type { Customer, OrderItem } from '@/lib/orders'

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      customer: Customer
      items: OrderItem[]
      subtotal: number
      shipping: number
      total: number
    }

    const { customer, items, subtotal, shipping, total } = body

    // 1. Persistir pedido com status "pending" antes de ir ao MP
    const orderId = await createOrder({
      status: 'pending',
      customer,
      items,
      subtotal,
      shipping,
      total,
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

    // 2. Criar preferência no MercadoPago
    const preference = new Preference(mpClient)

    const result = await preference.create({
      body: {
        external_reference: orderId,
        items: items.map((item) => ({
          id: String(item.productId),
          title: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: 'BRL',
        })),
        payer: {
          name: customer.name,
          email: customer.email,
          identification: {
            type: 'CPF',
            number: customer.cpf,
          },
          phone: {
            number: customer.phone,
          },
          address: {
            zip_code: customer.address.cep,
            street_name: customer.address.street,
            street_number: customer.address.number,
          },
        },
        shipments: {
          cost: shipping,
          mode: 'not_specified',
        },
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/pending`,
        },
        auto_return: 'approved',
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
    console.error('[create-payment]', err)
    const message = err instanceof Error ? err.message : 'Erro interno'
    return Response.json({ error: message }, { status: 500 })
  }
}

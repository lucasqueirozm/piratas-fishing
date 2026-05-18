import { NextRequest } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { updateOrderStatus } from '@/lib/orders'
import type { OrderStatus } from '@/lib/orders'

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
})

function mpStatusToOrderStatus(mpStatus: string): OrderStatus {
  switch (mpStatus) {
    case 'approved': return 'paid'
    case 'rejected': return 'failed'
    case 'cancelled': return 'cancelled'
    case 'in_process':
    case 'pending':
    default:
      return 'in_process'
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { type?: string; data?: { id?: string } }

    // MercadoPago envia dois tipos de notificação: "payment" e "merchant_order"
    if (body.type !== 'payment' || !body.data?.id) {
      return Response.json({ received: true })
    }

    const paymentId = body.data.id

    // Buscar detalhes do pagamento no MP
    const paymentApi = new Payment(mpClient)
    const payment = await paymentApi.get({ id: paymentId })

    const orderId = payment.external_reference
    if (!orderId) return Response.json({ received: true })

    const status = mpStatusToOrderStatus(payment.status ?? '')

    await updateOrderStatus(orderId, status, String(paymentId), payment.status ?? '')

    return Response.json({ received: true })
  } catch (err) {
    console.error('[payment-webhook]', err)
    // Retorna 200 mesmo em erro para evitar que o MP reenvie infinitamente
    return Response.json({ received: true })
  }
}

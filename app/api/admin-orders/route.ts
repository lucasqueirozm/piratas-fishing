import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getOrders } from '@/lib/orders'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value

  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '100')
  const orders = await getOrders(Math.min(limit, 200))

  return Response.json({ orders })
}

import { getAdminDb } from './supabase'

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'in_process' | 'packed' | 'shipped' | 'tracking_sent' | 'completed'

export type OrderItem = {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image: string
}

export type CustomerAddress = {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export type Customer = {
  name: string
  email: string
  cpf: string
  phone: string
  address: CustomerAddress
}

export type Order = {
  id?: string
  status: OrderStatus
  createdAt: string
  updatedAt: string
  customer: Customer
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  preferenceId?: string
  paymentId?: string
  mpStatus?: string
  trackingCode?: string
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = getAdminDb()
  const now = new Date().toISOString()

  const { data, error } = await db
    .from('orders')
    .insert({
      status: order.status,
      customer: order.customer,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentId?: string,
  mpStatus?: string,
): Promise<void> {
  const db = getAdminDb()

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (paymentId) update.payment_id = paymentId
  if (mpStatus) update.mp_status = mpStatus

  const { error } = await db.from('orders').update(update).eq('id', orderId)
  if (error) throw error
}

export async function updateOrderFulfillment(
  orderId: string,
  status: OrderStatus,
  trackingCode?: string,
): Promise<void> {
  const db = getAdminDb()

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (trackingCode !== undefined) update.tracking_code = trackingCode

  const { error } = await db.from('orders').update(update).eq('id', orderId)
  if (error) throw error
}

export async function updateOrderPreference(orderId: string, preferenceId: string): Promise<void> {
  const db = getAdminDb()

  const { error } = await db
    .from('orders')
    .update({ preference_id: preferenceId, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) throw error
}

export async function getOrders(limitCount = 50): Promise<Order[]> {
  const db = getAdminDb()

  const { data, error } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limitCount)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    status: row.status as OrderStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: row.customer as Customer,
    items: row.items as OrderItem[],
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    preferenceId: row.preference_id,
    paymentId: row.payment_id,
    mpStatus: row.mp_status,
    trackingCode: row.tracking_code,
  }))
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = getAdminDb()

  const { data, error } = await db.from('orders').select('*').eq('id', id).single()
  if (error || !data) return null

  return {
    id: data.id,
    status: data.status as OrderStatus,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    customer: data.customer as Customer,
    items: data.items as OrderItem[],
    subtotal: data.subtotal,
    shipping: data.shipping,
    total: data.total,
    preferenceId: data.preference_id,
    paymentId: data.payment_id,
    mpStatus: data.mp_status,
    trackingCode: data.tracking_code,
  }
}

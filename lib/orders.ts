import { getAdminDb } from './firebase-admin'

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'in_process'

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
  createdAt: FirebaseFirestore.Timestamp | Date
  updatedAt: FirebaseFirestore.Timestamp | Date
  customer: Customer
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  preferenceId?: string
  paymentId?: string
  mpStatus?: string
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = getAdminDb()
  const now = new Date()

  const docRef = await db.collection('orders').add({
    ...order,
    createdAt: now,
    updatedAt: now,
  })

  return docRef.id
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
    updatedAt: new Date(),
  }
  if (paymentId) update.paymentId = paymentId
  if (mpStatus) update.mpStatus = mpStatus

  await db.collection('orders').doc(orderId).update(update)
}

export async function updateOrderPreference(orderId: string, preferenceId: string): Promise<void> {
  const db = getAdminDb()
  await db.collection('orders').doc(orderId).update({
    preferenceId,
    updatedAt: new Date(),
  })
}

export async function getOrders(limitCount = 50): Promise<Order[]> {
  const db = getAdminDb()
  const snap = await db.collection('orders').orderBy('createdAt', 'desc').limit(limitCount).get()

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Order, 'id'>),
  }))
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = getAdminDb()
  const doc = await db.collection('orders').doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...(doc.data() as Omit<Order, 'id'>) }
}

import { cache } from 'react'
import { getOrderById } from '@/lib/orders'

// generateMetadata e a página carregam o mesmo pedido — cache() dedupa a consulta
// dentro da mesma requisição. Compartilhado pelas duas folhas (fornecedor e detalhe).
export const loadOrder = cache(async (id: string) => {
  try {
    return await getOrderById(id)
  } catch (err) {
    console.error('[pedido] falha ao carregar pedido:', err)
    return null
  }
})

// O browser usa o título da aba como nome sugerido em "Salvar como PDF".
export function sheetTitle(prefix: string, id: string, customerName: string) {
  const name = customerName.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim()
  return { title: { absolute: `${prefix} ${id.slice(0, 8)} - ${name}` } }
}

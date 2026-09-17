// Tipos e constantes de produto — SEM imports de servidor.
// Pode ser importado tanto por client components quanto por server components.

// Anzol não é isca: é acessório. Fica por último na ordem das categorias para as
// linhas de isca virem primeiro no catálogo e no menu.
export type ProductCategory = 'Turbo' | 'Reality' | 'Shad' | 'Anzol'

export type Product = {
  id: number
  name: string
  description: string
  price: number
  priceStr: string
  sizes: string[]
  image: string
  // Fotos adicionais. A `image` continua sendo a principal, a que vai no card
  // do catálogo; estas aparecem como miniaturas na página do produto.
  images: string[]
  category: ProductCategory
}

export const categories: ProductCategory[] = ['Turbo', 'Reality', 'Shad', 'Anzol']

// Tamanhos padrão por categoria — usados como sugestão ao cadastrar no admin.
export const SIZE_PRESETS: Record<ProductCategory, string[]> = {
  Turbo: ['6,5 cm', '7,5 cm', '8,5 cm', '9,5 cm', '10,5 cm'],
  Reality: ['7,5 cm', '8,5 cm'],
  Shad: ['6,5 cm', '7,5 cm'],
  Anzol: ['7 g', '10 g'],
}

export function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { track } from '@/lib/track'

const CART_STORAGE_KEY = 'pf-cart'

export type Product = {
  id: number
  name: string
  price: number
  priceStr: string
  image: string
}

export type CartItem = {
  product: Product
  size: string
  quantity: number
}

type CartContextType = {
  cart: CartItem[]
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
  addToCart: (product: Product, quantity: number, size: string) => void
  removeFromCart: (productId: number, size: string) => void
  updateQuantity: (productId: number, size: string, delta: number) => void
  clearCart: () => void
  cartTotal: number
  cartItemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function itemKey(productId: number, size: string) {
  return `${productId}::${size}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Restaura o carrinho do localStorage no primeiro render do cliente.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Sincroniza estado React a partir do localStorage na montagem — padrão
        // intencional; o persist abaixo é protegido pelo flag `hydrated`.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setCart(parsed)
      }
    } catch {
      // localStorage indisponível ou JSON corrompido — começa com carrinho vazio
    }
    setHydrated(true)
  }, [])

  // Persiste a cada mudança, mas só depois de hidratar (senão o estado inicial
  // vazio sobrescreveria o carrinho salvo antes de ele ser restaurado).
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // storage cheio ou bloqueado — ignora, o carrinho segue em memória
    }
  }, [cart, hydrated])

  function addToCart(product: Product, quantity = 1, size: string) {
    setCart((prev) => {
      const key = itemKey(product.id, size)
      const existing = prev.find((item) => itemKey(item.product.id, item.size) === key)
      if (existing) {
        return prev.map((item) =>
          itemKey(item.product.id, item.size) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [...prev, { product, size, quantity }]
    })
    track('cart_open')
    setIsCartOpen(true)
  }

  function removeFromCart(productId: number, size: string) {
    setCart((prev) =>
      prev.filter((item) => itemKey(item.product.id, item.size) !== itemKey(productId, size)),
    )
  }

  function updateQuantity(productId: number, size: string, delta: number) {
    setCart((prev) =>
      prev.map((item) =>
        itemKey(item.product.id, item.size) === itemKey(productId, size)
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    )
  }

  function clearCart() {
    setCart([])
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

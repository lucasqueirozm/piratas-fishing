'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { track } from '@/lib/track'

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

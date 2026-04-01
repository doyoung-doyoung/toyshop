import '../styles/globals.css'
import { useState, useEffect, createContext, useContext } from 'react'

const CartContext = createContext()

export function useCart() {
  return useContext(CartContext)
}

export default function App({ Component, pageProps }) {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(x => x.id === product.id)
      if (existing) {
        return prev.map(x => x.id === product.id ? { ...x, qty: x.qty + 1 } : x)
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(x => x.id !== id))

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id)
    setCart(prev => prev.map(x => x.id === id ? { ...x, qty } : x))
  }

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((a, c) => a + c.price * c.qty, 0)
  const cartCount = cart.reduce((a, c) => a + c.qty, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount }}>
      <Component {...pageProps} />
    </CartContext.Provider>
  )
}

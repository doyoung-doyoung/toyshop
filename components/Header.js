import Link from 'next/link'
import { useCart } from '../pages/_app'

export default function Header() {
  const { cartCount } = useCart()

  return (
    <header className="header">
      <Link href="/" className="logo">
        🧸 youdon'tknow
      </Link>
      <nav className="nav">
        <Link href="/" className="nav-btn">🛍️ ร้านค้า</Link>
        <Link href="/cart" className="nav-btn cart-btn">
          🛒 ตะกร้า
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
      </nav>
    </header>
  )
}

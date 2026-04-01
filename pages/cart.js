import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import { useCart } from './_app'

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal } = useCart()
  const router = useRouter()
  const shipping = cartTotal > 500 ? 0 : 50
  const grand = cartTotal + shipping

  return (
    <>
      <Head><title>ตะกร้าสินค้า — youdon&apos;tknowidon&apos;tknow</title></Head>
      <Header />

      <div className="container">
        <h1 style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 26, marginBottom: 24 }}>
          🛒 ตะกร้าสินค้า
        </h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 80 }}>🛒</div>
            <p style={{ fontSize: 18, color: 'var(--muted)', margin: '16px 0 24px' }}>
              ตะกร้าว่างเปล่า
            </p>
            <Link href="/" className="btn btn-primary">🛍️ เลือกสินค้า</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

            {/* Cart items */}
            <div>
              {cart.map(item => (
                <div key={item.id} className="card" style={{
                  display: 'flex', alignItems: 'center',
                  gap: 16, padding: 16, marginBottom: 12
                }}>
                  <div style={{ fontSize: 48 }}>{item.emoji || '🧸'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Kanit', fontWeight: 700, fontSize: 15 }}>
                      {item.name_th}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>฿{item.price} / ชิ้น</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)}
                        style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--primary)', background: '#fff', color: 'var(--primary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        −
                      </button>
                      <span style={{ fontWeight: 700, fontSize: 16, minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}
                        style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--primary)', background: '#fff', color: 'var(--primary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        +
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>
                      ฿{(item.price * item.qty).toLocaleString()}
                    </div>
                    <button onClick={() => removeFromCart(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 18, marginTop: 4 }}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="card" style={{ padding: 24, height: 'fit-content', position: 'sticky', top: 80 }}>
              <h2 style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 18, marginBottom: 20 }}>
                📝 สรุปคำสั่งซื้อ
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                <span>สินค้า</span>
                <span>฿{cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                <span>ค่าจัดส่ง</span>
                <span style={{ color: shipping === 0 ? 'var(--accent)' : 'inherit' }}>
                  {shipping === 0 ? 'ฟรี!' : `฿${shipping}`}
                </span>
              </div>
              {cartTotal < 500 && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                  ซื้อครบ ฿500 ส่งฟรี!
                </div>
              )}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontFamily: 'Kanit', fontWeight: 800, fontSize: 22, color: 'var(--primary)',
                borderTop: '2px solid var(--border)', paddingTop: 16, marginTop: 8
              }}>
                <span>รวม</span><span>฿{grand.toLocaleString()}</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 16, padding: 16, fontSize: 16 }}
                onClick={() => router.push('/checkout')}
              >
                📦 กรอกที่อยู่จัดส่ง →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

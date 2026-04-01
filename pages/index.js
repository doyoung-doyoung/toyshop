import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import { useCart } from './_app'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const { addToCart } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  function handleAddToCart(product) {
    if (product.stock <= 0) return
    addToCart(product)
    showToast(`✅ เพิ่ม ${product.name_th} แล้ว!`)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const gradients = [
    'linear-gradient(135deg,#ffecd2,#fcb69f)',
    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
    'linear-gradient(135deg,#fccb90,#d57eeb)',
    'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
    'linear-gradient(135deg,#fd7043,#ff8a65)',
    'linear-gradient(135deg,#66bb6a,#a5d6a7)',
  ]

  return (
    <>
      <Head>
        <title>youdon&apos;tknowidon&apos;tknow — ของเล่นสุดฮิต</title>
        <meta name="description" content="ของเล่นคุณภาพดี ราคาถูก ส่งตรงถึงบ้าน" />
      </Head>

      <Header />

      <div className="container">
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 20, padding: '40px 32px',
          marginBottom: 28, color: '#fff', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-block', background: '#FFA502',
              borderRadius: 20, padding: '5px 16px',
              fontSize: 13, fontWeight: 700, marginBottom: 12
            }}>🎉 ของเล่นคุณภาพดี ราคาถูก!</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
              youdon&apos;tknowidon&apos;tknow
            </h1>
            <p style={{ fontSize: 15, opacity: 0.85 }}>
              ของเล่นสนุก ส่งตรงถึงบ้าน 🚀 รับชำระผ่าน PromptPay ✓
            </p>
          </div>
          <div style={{
            position: 'absolute', right: -20, top: '50%',
            transform: 'translateY(-50%)', fontSize: 80,
            letterSpacing: 8, opacity: 0.12, whiteSpace: 'nowrap'
          }}>🎮🧸🚀🎪🎨🪀</div>
        </div>

        {/* Products */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 18 }}>
            กำลังโหลด... ⏳
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: 64 }}>🧸</div>
            <p style={{ fontSize: 18, marginTop: 16 }}>ยังไม่มีสินค้า<br/>เพิ่มสินค้าใน Admin ได้เลย!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20
          }}>
            {products.map((p, i) => (
              <div key={p.id} className="card" style={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                {/* Product image */}
                <div style={{
                  height: 160,
                  background: p.image_url ? `url(${p.image_url}) center/cover` : gradients[i % gradients.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 72, position: 'relative'
                }}>
                  {!p.image_url && (p.emoji || '🧸')}
                  <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'}`}
                    style={{ position: 'absolute', top: 10, right: 10 }}>
                    {p.stock === 0 ? '❌ หมด' : p.stock <= 5 ? `⚠️ เหลือ ${p.stock}` : '✓ มีสินค้า'}
                  </span>
                </div>

                {/* Product info */}
                <div style={{ padding: 16 }}>
                  <div style={{ fontFamily: 'Kanit', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                    {p.name_en}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                    {p.name_th}
                  </div>
                  <div style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 22, color: 'var(--primary)' }}>
                    ฿{Number(p.price).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                    {p.description}
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px' }}
                    disabled={p.stock === 0}
                    onClick={() => handleAddToCart(p)}
                  >
                    {p.stock === 0 ? 'สินค้าหมด' : '🛒 เพิ่มลงตะกร้า'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}

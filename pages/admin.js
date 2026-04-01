import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  // New product form
  const [np, setNp] = useState({
    name_en: '', name_th: '', price: '', stock: '',
    emoji: '🧸', description: '', active: true
  })

  function login(e) {
    e.preventDefault()
    if (pw === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin1234')) {
      setAuthed(true)
      fetchAll()
    } else {
      alert('รหัสผ่านไม่ถูกต้อง')
    }
  }

  async function fetchAll() {
    setLoading(true)
    const [{ data: o }, { data: p }] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
    ])
    setOrders(o || [])
    setProducts(p || [])
    setLoading(false)
  }

  async function updateOrderStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    showToast('✅ อัปเดตสถานะแล้ว')
  }

  async function updateStock(id, stock) {
    await supabase.from('products').update({ stock }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p))
    showToast('✅ อัปเดตสต็อกแล้ว')
  }

  async function addProduct(e) {
    e.preventDefault()
    if (!np.name_en || !np.name_th || !np.price || !np.stock) {
      alert('กรอกข้อมูลให้ครบ')
      return
    }
    const { data, error } = await supabase.from('products').insert([{
      name_en: np.name_en,
      name_th: np.name_th,
      price: parseFloat(np.price),
      stock: parseInt(np.stock),
      emoji: np.emoji,
      description: np.description,
      active: true
    }]).select().single()
    if (!error) {
      setProducts(prev => [data, ...prev])
      setNp({ name_en: '', name_th: '', price: '', stock: '', emoji: '🧸', description: '', active: true })
      showToast('✅ เพิ่มสินค้าแล้ว!')
      setTab('inventory')
    }
  }

  async function toggleActive(id, active) {
    await supabase.from('products').update({ active }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active } : p))
    showToast(active ? '✅ เปิดขายแล้ว' : '⏸ ซ่อนสินค้าแล้ว')
  }

  function printOrderLabel(o) {
    const w = window.open('', '_blank')
    w.document.write(`
      <html><head><title>ใบจ่าหน้า ${o.id?.slice(0,8).toUpperCase()}</title>
      <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@700;800&family=Sarabun&display=swap" rel="stylesheet">
      <style>body{font-family:Sarabun,sans-serif;padding:24px;max-width:420px;margin:0 auto}
      .box{border:3px dashed #333;padding:20px;border-radius:12px}
      h2{font-family:Kanit;font-weight:800;font-size:20px}
      h3{font-family:Kanit;font-weight:700;font-size:15px;margin:10px 0 4px}
      .id{background:#f1f2f6;padding:4px 10px;border-radius:6px;font-family:monospace;font-size:12px}
      .item{display:flex;justify-content:space-between;font-size:13px;padding:3px 0;border-bottom:1px solid #eee}
      .total{display:flex;justify-content:space-between;font-family:Kanit;font-weight:800;font-size:15px;color:#FF4757;padding-top:6px}
      @media print{body{padding:0}}</style></head><body>
      <div class="box">
        <div style="display:flex;justify-content:space-between;align-items:start;border-bottom:2px solid #333;padding-bottom:12px;margin-bottom:12px">
          <div><h2>🧸 youdon'tknowidon'tknow</h2><div style="font-size:12px;color:#666">ผู้ส่ง: [ที่อยู่ร้านของคุณ]</div></div>
          <span class="id">${o.id?.slice(0,8).toUpperCase()}</span>
        </div>
        <h3>📦 ผู้รับ</h3>
        <div style="font-family:Kanit;font-weight:700;font-size:17px">${o.customer_name}</div>
        <div style="font-size:14px;line-height:1.7">โทร: ${o.customer_phone}<br>${o.address}</div>
        ${o.note ? `<div style="font-size:12px;color:#777;margin-top:6px">หมายเหตุ: ${o.note}</div>` : ''}
        <div style="background:#f8f9fa;border-radius:8px;padding:12px;margin-top:12px">
          <div style="font-size:11px;font-weight:700;color:#666;margin-bottom:6px">รายการสินค้า</div>
          ${(o.items || []).map(i => `<div class="item"><span>${i.name_th} x${i.qty}</span><span>฿${(i.price*i.qty).toLocaleString()}</span></div>`).join('')}
          <div class="total"><span>รวม</span><span>฿${o.total?.toLocaleString()}</span></div>
        </div>
      </div>
      <script>window.onload=()=>setTimeout(()=>window.print(),500)<\/script>
      </body></html>
    `)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const totalRevenue = orders.reduce((a, o) => a + (o.total || 0), 0)
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'shipped').length
  const lowStock = products.filter(p => p.stock <= 3).length

  const STATUS_LABELS = {
    pending: '⏳ รอชำระ',
    paid: '💰 ชำระแล้ว',
    shipped: '🚚 จัดส่งแล้ว',
    cancelled: '❌ ยกเลิก'
  }

  const EMOJIS = '🧸🚀🎮🚗🎨🪀🎯🤖👾🦄🐉🏰🎠🎡🎢🥁🎻'

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <Head><title>Admin Login</title></Head>
        <div className="card" style={{ padding: 40, width: 360, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h1 style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 22, marginBottom: 24 }}>Admin Login</h1>
          <form onSubmit={login}>
            <div className="form-group">
              <label>รหัสผ่าน</label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14, marginTop: 8 }}>
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head><title>Admin — youdon&apos;tknowidon&apos;tknow</title></Head>

      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        {/* Admin Header */}
        <div style={{ background: 'var(--dark)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Kanit', fontWeight: 800, color: '#fff', fontSize: 18 }}>
            ⚙️ Admin Panel
          </span>
          <a href="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>← กลับหน้าร้าน</a>
        </div>

        <div className="container">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { emoji: '📦', val: orders.length, label: 'คำสั่งซื้อทั้งหมด' },
              { emoji: '💰', val: `฿${totalRevenue.toLocaleString()}`, label: 'ยอดขายรวม' },
              { emoji: '🧸', val: products.length, label: 'สินค้าทั้งหมด' },
              { emoji: '⚠️', val: lowStock, label: 'สินค้าใกล้หมด' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
                <div style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 22, color: 'var(--primary)' }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { id: 'orders', label: '📋 คำสั่งซื้อ' },
              { id: 'inventory', label: '📦 สินค้า/คลัง' },
              { id: 'add', label: '➕ เพิ่มสินค้า' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="btn"
                style={{
                  background: tab === t.id ? 'var(--primary)' : '#fff',
                  color: tab === t.id ? '#fff' : 'var(--dark)',
                  border: `2px solid ${tab === t.id ? 'var(--primary)' : 'var(--border)'}`,
                  padding: '10px 20px'
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontFamily: 'Kanit', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>📋 รายการคำสั่งซื้อ</h2>
              {loading ? <p>กำลังโหลด...</p> : orders.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>ยังไม่มีคำสั่งซื้อ</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        {['หมายเลข', 'ลูกค้า', 'ที่อยู่', 'สินค้า', 'ยอด', 'สถานะ', 'จัดการ'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, borderBottom: '2px solid var(--border)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <strong>{o.id?.slice(0,8).toUpperCase()}</strong>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(o.created_at).toLocaleDateString('th-TH')}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {o.customer_name}
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{o.customer_phone}</div>
                          </td>
                          <td style={{ padding: '14px 16px', maxWidth: 160, fontSize: 12 }}>{o.address?.slice(0,60)}...</td>
                          <td style={{ padding: '14px 16px' }}>
                            {(o.items || []).map(i => `${i.emoji || '🧸'}x${i.qty}`).join(' ')}
                          </td>
                          <td style={{ padding: '14px 16px' }}><strong>฿{o.total?.toLocaleString()}</strong></td>
                          <td style={{ padding: '14px 16px' }}>
                            <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                              style={{ padding: '4px 8px', borderRadius: 8, border: '2px solid var(--border)', fontSize: 12 }}>
                              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <button className="btn btn-dark" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => printOrderLabel(o)}>
                              🖨️ พิมพ์
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* INVENTORY TAB */}
          {tab === 'inventory' && (
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontFamily: 'Kanit', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>📦 จัดการสินค้า</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      {['สินค้า', 'ราคา', 'สต็อก', 'สถานะ', 'แก้ไขสต็อก', 'เปิด/ปิด'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, borderBottom: '2px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 28, marginRight: 8 }}>{p.emoji}</span>
                          <strong>{p.name_en}</strong>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.name_th}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>฿{p.price}</td>
                        <td style={{ padding: '14px 16px' }}><strong>{p.stock}</strong></td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'}`}>
                            {p.stock === 0 ? 'หมด' : p.stock <= 5 ? 'เหลือน้อย' : 'มีสินค้า'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="number" defaultValue={p.stock} min="0"
                              style={{ width: 70, padding: '6px 10px', border: '2px solid var(--border)', borderRadius: 8, textAlign: 'center', fontWeight: 700 }}
                              id={`stock-${p.id}`} />
                            <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: 12 }}
                              onClick={() => updateStock(p.id, parseInt(document.getElementById(`stock-${p.id}`).value))}>
                              บันทึก
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            className={`btn ${p.active ? 'btn-outline' : 'btn-primary'}`}
                            style={{ padding: '6px 14px', fontSize: 12 }}
                            onClick={() => toggleActive(p.id, !p.active)}>
                            {p.active ? '⏸ ซ่อน' : '▶ เปิดขาย'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADD PRODUCT TAB */}
          {tab === 'add' && (
            <div className="card" style={{ padding: 24, maxWidth: 600 }}>
              <h2 style={{ fontFamily: 'Kanit', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>➕ เพิ่มสินค้าใหม่</h2>
              <form onSubmit={addProduct}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>ชื่อสินค้า (อังกฤษ)</label>
                    <input value={np.name_en} onChange={e => setNp(p => ({ ...p, name_en: e.target.value }))} placeholder="Robot Toy" required />
                  </div>
                  <div className="form-group">
                    <label>ชื่อสินค้า (ไทย)</label>
                    <input value={np.name_th} onChange={e => setNp(p => ({ ...p, name_th: e.target.value }))} placeholder="หุ่นยนต์ของเล่น" required />
                  </div>
                  <div className="form-group">
                    <label>ราคา (บาท)</label>
                    <input type="number" value={np.price} onChange={e => setNp(p => ({ ...p, price: e.target.value }))} placeholder="350" required />
                  </div>
                  <div className="form-group">
                    <label>จำนวนสต็อก</label>
                    <input type="number" value={np.stock} onChange={e => setNp(p => ({ ...p, stock: e.target.value }))} placeholder="20" required />
                  </div>
                  <div className="form-group form-full">
                    <label>เลือก Emoji สินค้า</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {EMOJIS.split('').map(em => (
                        <span key={em}
                          onClick={() => setNp(p => ({ ...p, emoji: em }))}
                          style={{
                            fontSize: 28, cursor: 'pointer', padding: 6, borderRadius: 8,
                            border: `2px solid ${np.emoji === em ? 'var(--primary)' : 'transparent'}`,
                            background: np.emoji === em ? '#fff5f6' : 'transparent',
                            transition: 'all 0.1s'
                          }}>
                          {em}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="form-group form-full">
                    <label>คำอธิบาย</label>
                    <textarea value={np.description} onChange={e => setNp(p => ({ ...p, description: e.target.value }))} placeholder="รายละเอียดสินค้า..." />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15 }}>
                  ✅ เพิ่มสินค้า
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}

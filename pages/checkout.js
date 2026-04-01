import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import { useCart } from './_app'
import { supabase } from '../lib/supabase'

export default function Checkout() {
  const [router, setRouter] = useState(null)

  useEffect(() => {
    const { default: Router } = require('next/router')
    setRouter(Router)
  }, [])
  const { cart, cartTotal, clearCart } = useCart()
  const shipping = cartTotal > 500 ? 0 : 50
  const grand = cartTotal + shipping

  const [step, setStep] = useState(1) // 1=address, 2=payment, 3=success
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [payMethod, setPayMethod] = useState('promptpay')

  const [form, setForm] = useState({
    fname: '', lname: '', phone: '', email: '',
    address: '', subdistrict: '', district: '',
    province: '', zipcode: '', note: ''
  })

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  async function submitAddress(e) {
    e.preventDefault()
    if (!form.fname || !form.phone || !form.address || !form.province) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }
    setStep(2)
  }

  async function confirmPayment() {
    setLoading(true)
    try {
      // Save order to Supabase
      const orderData = {
        customer_name: `${form.fname} ${form.lname}`,
        customer_phone: form.phone,
        customer_email: form.email,
        address: `${form.address} ${form.subdistrict} ${form.district} ${form.province} ${form.zipcode}`,
        note: form.note,
        items: cart,
        subtotal: cartTotal,
        shipping: shipping,
        total: grand,
        payment_method: payMethod,
        status: 'pending'
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (error) throw error

      // Reduce stock
      for (const item of cart) {
        await supabase.rpc('reduce_stock', {
          product_id: item.id,
          qty: item.qty
        })
      }

      setOrder(data)
      clearCart()
      setStep(3)
    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
    setLoading(false)
  }

  function printLabel() {
    const w = window.open('', '_blank')
    w.document.write(`
      <html><head><title>ใบจ่าหน้า ${order.id}</title>
      <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@700;800&family=Sarabun&display=swap" rel="stylesheet">
      <style>
        body{font-family:Sarabun,sans-serif;padding:24px;max-width:420px;margin:0 auto}
        .box{border:3px dashed #333;padding:20px;border-radius:12px}
        h2{font-family:Kanit;font-weight:800;font-size:20px;margin-bottom:4px}
        h3{font-family:Kanit;font-weight:700;font-size:16px;margin:12px 0 4px}
        .id{background:#f1f2f6;padding:4px 10px;border-radius:6px;font-family:monospace;font-size:12px}
        .item{display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px solid #eee}
        .total{display:flex;justify-content:space-between;font-family:Kanit;font-weight:800;font-size:16px;color:#FF4757;padding-top:8px}
        @media print{body{padding:0}}
      </style></head><body>
      <div class="box">
        <div style="display:flex;justify-content:space-between;align-items:start;border-bottom:2px solid #333;padding-bottom:12px;margin-bottom:12px">
          <div>
            <h2>🧸 youdon'tknowidon'tknow</h2>
            <div style="font-size:12px;color:#666">ผู้ส่ง: [ที่อยู่ร้านของคุณ]</div>
          </div>
          <span class="id">${order.id?.slice(0,8).toUpperCase()}</span>
        </div>
        <h3>📦 ผู้รับ</h3>
        <div style="font-family:Kanit;font-weight:700;font-size:17px">${order.customer_name}</div>
        <div style="font-size:14px;line-height:1.7;margin-top:4px">โทร: ${order.customer_phone}<br>${order.address}</div>
        ${order.note ? `<div style="font-size:12px;color:#666;margin-top:6px">หมายเหตุ: ${order.note}</div>` : ''}
        <div style="background:#f8f9fa;border-radius:8px;padding:12px;margin-top:12px">
          <div style="font-size:12px;font-weight:700;color:#666;margin-bottom:6px">รายการสินค้า</div>
          ${order.items?.map(i => `<div class="item"><span>${i.name_th} x${i.qty}</span><span>฿${(i.price*i.qty).toLocaleString()}</span></div>`).join('')}
          <div class="total"><span>รวมทั้งหมด</span><span>฿${order.total?.toLocaleString()}</span></div>
        </div>
      </div>
      <script>window.onload=()=>setTimeout(()=>window.print(),500)<\/script>
      </body></html>
    `)
  }

  if (cart.length === 0 && step < 3) {
    if (router) router.push('/')
    return null
  }

  return (
    <>
      <Head><title>ชำระเงิน — youdon&apos;tknowidon&apos;tknow</title></Head>
      <Header />

      <div className="container" style={{ maxWidth: 600 }}>

        {/* Step 1: Address */}
        {step === 1 && (
          <>
            <h1 style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 24, marginBottom: 24 }}>
              📦 ที่อยู่จัดส่ง
            </h1>
            <div className="card" style={{ padding: 24 }}>
              <form onSubmit={submitAddress}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>ชื่อ *</label>
                    <input value={form.fname} onChange={e => set('fname', e.target.value)} placeholder="สมชาย" required />
                  </div>
                  <div className="form-group">
                    <label>นามสกุล</label>
                    <input value={form.lname} onChange={e => set('lname', e.target.value)} placeholder="ใจดี" />
                  </div>
                  <div className="form-group">
                    <label>เบอร์โทร *</label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="081-234-5678" required />
                  </div>
                  <div className="form-group">
                    <label>อีเมล</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="example@email.com" />
                  </div>
                  <div className="form-group form-full">
                    <label>ที่อยู่ *</label>
                    <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 ถ.สุขุมวิท" required />
                  </div>
                  <div className="form-group">
                    <label>ตำบล/แขวง</label>
                    <input value={form.subdistrict} onChange={e => set('subdistrict', e.target.value)} placeholder="คลองเตย" />
                  </div>
                  <div className="form-group">
                    <label>อำเภอ/เขต</label>
                    <input value={form.district} onChange={e => set('district', e.target.value)} placeholder="วัฒนา" />
                  </div>
                  <div className="form-group">
                    <label>จังหวัด *</label>
                    <input value={form.province} onChange={e => set('province', e.target.value)} placeholder="กรุงเทพมหานคร" required />
                  </div>
                  <div className="form-group">
                    <label>รหัสไปรษณีย์</label>
                    <input value={form.zipcode} onChange={e => set('zipcode', e.target.value)} placeholder="10110" />
                  </div>
                  <div className="form-group form-full">
                    <label>หมายเหตุ</label>
                    <textarea value={form.note} onChange={e => set('note', e.target.value)} placeholder="เช่น ฝากไว้กับ รปภ." />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 16, fontSize: 16 }}>
                  💳 ไปชำระเงิน →
                </button>
              </form>
            </div>
          </>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <>
            <h1 style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 24, marginBottom: 24 }}>
              💳 ชำระเงิน
            </h1>

            {/* Payment method selector */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'promptpay', label: '📱 PromptPay QR' },
                { id: 'card', label: '💳 บัตรเครดิต' },
                { id: 'cod', label: '💵 เก็บปลายทาง' },
              ].map(m => (
                <button key={m.id}
                  onClick={() => setPayMethod(m.id)}
                  style={{
                    padding: '10px 16px', borderRadius: 10,
                    border: `2px solid ${payMethod === m.id ? 'var(--primary)' : 'var(--border)'}`,
                    background: payMethod === m.id ? '#fff5f6' : '#fff',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer'
                  }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* PromptPay QR */}
            {payMethod === 'promptpay' && (
              <div className="card" style={{
                padding: 32, textAlign: 'center',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff'
              }}>
                <div style={{ color: '#FFD700', fontFamily: 'Kanit', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  📱 สแกน QR Code ชำระเงิน
                </div>
                <div style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>PromptPay / พร้อมเพย์</div>
                {/* QR Placeholder — จะแทนด้วย GBPrimePay QR จริง */}
                <div style={{
                  width: 180, height: 180, background: '#fff', borderRadius: 12,
                  margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, color: '#666', padding: 16, textAlign: 'center', lineHeight: 1.6
                }}>
                  🔧 QR จริงจะแสดงเมื่อ<br/>เชื่อมต่อ GBPrimePay<br/>แล้ว
                </div>
                <div style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 28, marginBottom: 4 }}>
                  ฿{grand.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>
                  หมายเลขบัญชี: [GBPrimePay จะใส่อัตโนมัติ]
                </div>
                <button className="btn btn-success" onClick={confirmPayment} disabled={loading}>
                  {loading ? '⏳ กำลังบันทึก...' : '✅ ยืนยันชำระเงินแล้ว'}
                </button>
              </div>
            )}

            {/* COD */}
            {payMethod === 'cod' && (
              <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💵</div>
                <div style={{ fontFamily: 'Kanit', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>เก็บเงินปลายทาง</div>
                <div style={{ color: 'var(--muted)', marginBottom: 8 }}>มีค่าธรรมเนียม COD ฿20</div>
                <div style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 24, color: 'var(--primary)', marginBottom: 20 }}>
                  ยอดชำระ ฿{(grand + 20).toLocaleString()}
                </div>
                <button className="btn btn-success" onClick={confirmPayment} disabled={loading}>
                  {loading ? '⏳...' : '✅ ยืนยันคำสั่งซื้อ'}
                </button>
              </div>
            )}

            {/* Card */}
            {payMethod === 'card' && (
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontFamily: 'Kanit', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
                  💳 ข้อมูลบัตร (ผ่าน GBPrimePay)
                </div>
                <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 20, textAlign: 'center', color: 'var(--muted)' }}>
                  🔧 ฟอร์มบัตรเครดิตจะพร้อมเมื่อเชื่อมต่อ GBPrimePay แล้ว
                </div>
                <button className="btn btn-success" style={{ width: '100%', marginTop: 16 }} onClick={confirmPayment} disabled={loading}>
                  {loading ? '⏳...' : `✅ ชำระ ฿${grand.toLocaleString()}`}
                </button>
              </div>
            )}

            <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => setStep(1)}>
              ← แก้ไขที่อยู่
            </button>
          </>
        )}

        {/* Step 3: Success */}
        {step === 3 && order && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 80 }}>🎉</div>
            <h1 style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 28, color: 'var(--accent)', margin: '16px 0 8px' }}>
              ชำระเงินสำเร็จ!
            </h1>
            <p style={{ color: 'var(--muted)', marginBottom: 32 }}>
              ขอบคุณที่ซื้อสินค้า • หมายเลข: <strong>{order.id?.slice(0,8).toUpperCase()}</strong>
            </p>

            {/* Shipping label preview */}
            <div style={{
              border: '3px dashed var(--dark)', borderRadius: 16,
              padding: 24, maxWidth: 440, margin: '0 auto 24px', textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--dark)', paddingBottom: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: 'Kanit', fontWeight: 800, fontSize: 18 }}>🧸 youdon'tknowidon'tknow</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>ผู้ส่ง: [ที่อยู่ร้านของคุณ]</div>
                </div>
                <div style={{ background: '#f1f2f6', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace' }}>
                  {order.id?.slice(0,8).toUpperCase()}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>📦 ผู้รับ</div>
                <div style={{ fontFamily: 'Kanit', fontWeight: 700, fontSize: 16 }}>{order.customer_name}</div>
                <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                  โทร: {order.customer_phone}<br />
                  {order.address}
                </div>
              </div>
              <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 12 }}>
                {order.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 4 }}>
                    <span>{item.name_th} x{item.qty}</span>
                    <span>฿{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Kanit', fontWeight: 800, fontSize: 16, color: 'var(--primary)', borderTop: '1px solid #ddd', paddingTop: 8, marginTop: 4 }}>
                  <span>รวม</span><span>฿{order.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button className="btn btn-dark" style={{ margin: 8 }} onClick={printLabel}>
              🖨️ พิมพ์ใบจ่าหน้า
            </button>
            <button className="btn btn-primary" style={{ margin: 8 }} onClick={() => router && router.push('/')}>
              🛍️ สั่งซื้ออีกครั้ง
            </button>
          </div>
        )}
      </div>
    </>
  )
}
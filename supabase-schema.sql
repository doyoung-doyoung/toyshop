-- =============================================
-- youdon'tknowidon'tknow Toy Shop - DB Schema
-- Supabase SQL Editor에 붙여넣고 실행하세요
-- =============================================

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_th TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  emoji TEXT DEFAULT '🧸',
  description TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  address TEXT NOT NULL,
  note TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2),
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'promptpay',
  payment_ref TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to reduce stock safely
CREATE OR REPLACE FUNCTION reduce_stock(product_id UUID, qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = stock - qty
  WHERE id = product_id AND stock >= qty;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) - allow all for now
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all orders" ON orders FOR ALL USING (true);

-- Sample products (ลบได้ถ้าไม่ต้องการ)
INSERT INTO products (name_en, name_th, price, stock, emoji, description) VALUES
('Robot Warrior', 'หุ่นยนต์นักรบ', 350, 15, '🤖', 'หุ่นยนต์สุดเท่ มีเสียงและไฟ'),
('Unicorn Plush', 'ตุ๊กตายูนิคอร์น', 290, 8, '🦄', 'นุ่มน่ากอด สีสันสดใส'),
('Race Car Set', 'ชุดรถแข่ง', 450, 3, '🚗', 'รถแข่งมีไฟ พร้อมสนาม'),
('Space Rocket', 'จรวดอวกาศ', 520, 12, '🚀', 'ยิงได้จริง! ความสูง 30 ซม.'),
('Magic Yoyo', 'โยโย่เวทมนตร์', 180, 25, '🪀', 'หมุนได้นาน มีไฟ LED');

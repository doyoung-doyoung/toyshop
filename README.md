# 🧸 youdon'tknowidon'tknow Toy Shop

태국 장난감 쇼핑몰 — Next.js + Supabase + GBPrimePay

---

## 🚀 배포 순서 (Step by Step)

### Step 1 — GitHub에 올리기
1. GitHub.com → New Repository → 이름: `toyshop`
2. 아래 명령어 실행:
```bash
cd toyshop
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/YOUR_USERNAME/toyshop.git
git push -u origin main
```

### Step 2 — Supabase 설정
1. https://supabase.com → New Project 만들기
2. Settings → API → URL과 anon key 복사
3. SQL Editor → `supabase-schema.sql` 내용 붙여넣고 실행

### Step 3 — Netlify 배포
1. https://netlify.com → Add new site → Import from GitHub
2. Repository: toyshop 선택
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Environment variables 추가:
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon key
   - `NEXT_PUBLIC_ADMIN_PASSWORD` = 관리자 비밀번호

### Step 4 — GBPrimePay 연동 (계정 생성 후)
- `.env.local`에 GBPrimePay 키 추가
- `pages/checkout.js`에서 QR 코드 연동

---

## 📁 파일 구조
```
toyshop/
├── pages/
│   ├── index.js      ← 쇼핑몰 메인
│   ├── cart.js       ← 장바구니
│   ├── checkout.js   ← 결제
│   └── admin.js      ← 관리자
├── components/
│   └── Header.js
├── lib/
│   └── supabase.js
├── styles/
│   └── globals.css
└── supabase-schema.sql
```

## 🔑 관리자 페이지
- URL: `/admin`
- 기본 비밀번호: `admin1234` (꼭 바꾸세요!)

## 📱 주요 기능
- ✅ 태국어 + 영어 지원
- ✅ 장바구니
- ✅ PromptPay QR 결제 (GBPrimePay 연동 후)
- ✅ 주문 후 배송 라벨 자동 출력
- ✅ 관리자: 주문 관리, 재고 관리, 상품 추가

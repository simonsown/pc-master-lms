# PC Master Builder - Tai Lieu Du An

## Tong Quan

**PC Master Builder** la mot ung dung hoc tap tin hoc va lap rap may tinh tuong tac, duoc xay dung tren neng tang Next.js 16 voi Supabase. Du an huong den doi tuong hoc sinh cap 3 (lop 10-12) tai Viet Nam, giao vien tin hoc, phu huynh va nha quan ly truong hoc.

**Muc tieu:** Bien viec hoc tin hoc tro thanh trai nghiem truc quan, sinh dong thong qua mo phong lap rap PC 2D, tich hop AI va cong nghe nhan dien co tay (hand tracking).

**URL Trien Khai:** https://pc-master-lms.vercel.app

---

## Cau Truc Tong The

```
one-mission-pj/
  app/                    # Next.js App Router - Pages & API routes
  components/             # React components tai su dung
  lib/                    # Server actions, utilities, auth
  hooks/                  # Custom React hooks
  providers/              # React context providers
  types/                  # TypeScript definitions
  utils/                  # Ham tien ich
  data/                   # Du lieu tinh / fixtures
  database/               # Schema & migration files
  public/                 # Static assets (images)
  middleware.ts           # Next.js middleware (auth + RBAC)
  next.config.mjs         # Next.js config (security headers, CSP)
```

---

## Cac Module Chinh va Chuc Nang

### 1. Trang Landing (`/`)
Trang chu gioi thieu du an, tinh nang noi bat, thong ke, huong dan su dung, FAQ. Hien thi thuong hieu "PC MASTER BUILDER" bang tieng Viet.

### 2. Xac Thuc & Nguoi Dung (`/login`, `/register`, `/auth/callback`)

| Chuc nang | Mo ta |
|-----------|-------|
| Dang nhap Email | Dang nhap bang email + mat khau qua Supabase Auth |
| Dang nhap Google | OAuth 2.0 Google, sau do vao `/onboarding` de chon vai tro |
| Dang ky | Dang ky tai khoan moi (3 buoc: thong tin -> vai tro -> hoan thien) |
| Onboarding | Trang nhap thong tin bo sung cho nguoi dung OAuth lan dau |

**Vai tro nguoi dung:** Admin, Giao vien, Hoc sinh, Phu huynh

### 3. Trinh Lap Rap PC - Builder (`/builder`)

**Module core cua ung dung.** Mo phong lap rap may tinh 2D voi cac che do:

| Che do | Mo ta |
|--------|-------|
| Assembly | Tu do lap rap, keo-tha linh kien |
| Mission | Thach thuc voi ngan sach va muc tieu co dinh |
| Learning | Huong dan tung buoc |
| Course | Xem bai giang ly thuyet |
| Market | Cho linh kien - mua linh kien voi ngan sach ao |
| Multiplayer | Thi dau 2 nguoi |
| Exams | Thi trong builder |
| Challenge | Thach thu hang ngay nhan XP |
| Lab | Phong thi nghiem AI voi Guru |

**Tinh nang Builder:**
- Tinh toan TDP (cong suat) thoi gian thuc
- Kiem tra tuong thich socket (CPU + Mainboard)
- Kiem tra kich thuoc case
- Checklist linh kien (CPU, COOLER, RAMx2, GPU, SSD, PSU)
- Hand tracking qua webcam (MediaPipe)
- AI Guru huong dan thoi gian thuc
- Ban phao hoa khi hoan thanh nhiem vu
- Ghi nhan phien lam viec vao database

### 4. Hoc Sinh Dashboard (`/student`)

- Thong ke: so lop, bai tap, linh kien da hoc
- Danh sach lop hoc
- Tien do hoc tap
- Lich su hoc tap
- Bai kiem tra, bai thi
- Chung chi dat duoc
- Diem danh / bang xep hang
- Ho so ca nhan
- Thao luan nhom

### 5. Giao Vien Dashboard (`/teacher`)

- Thong ke: so lop, so hoc sinh, bai tap
- Quan ly lop hoc (tao, sua, xoa lop, ma tham gia)
- Quan ly bai giang (tao, xuat ban, gan cho lop)
- Quan ly bai kiem tra / bai thi
- Quan ly chung chi
- Quan ly bai tap ve nha
- Cham diem tu dong
- Duong hoc tap (learning path)

### 6. Phu Huynh Dashboard (`/parent`)

- Theo doi thoi gian thuc con em dang hoc
- Hien thi nhieu con (tab)
- So bai da hoc
- Thoi gian hoc
- Diem kiem tra trung binh
- Hoat dong gan day
- Lien ket tai khoan con

### 7. Quan Tri Vien Dashboard (`/admin`)

- Tong quan he thong: so nguoi dung, giao vien, hoc sinh, lop, bai hoc, bai thi
- Quan ly nguoi dung
- Quan ly truong hoc
- Cau hinh he thong
- Phan tich du lieu (bieu do)
- Lich su hoat dong
- Health monitoring (do tre DB, uptime, trang thai)
- Quan ly noi dung

### 8. He Thong Kiem Tra (`/quiz`, `/exam`)

- Bai kiem tra nhanh (trac nghiem) voi 5 dang cau hoi:
  - Single choice
  - Multiple choice
  - True/False
  - Fill blank
  - Ordering
- Bai thi co gio
- Thi co giam sat (proctored)
- Thi lab (lab-exam)
- Tu dong cham diem
- Xem ket qua + diem so

### 9. Khoa Hoc & Bai Hoc (`/courses`, `/lessons`)

- Danh muc khoa hoc, loc theo trinh do (Co ban/Trung cap/Nang cao)
- Bai hoc co noi dung Markdown, hinh anh, video
- Gan bai hoc cho lop
- Theo doi tien do hoan thanh
- Huy hieu/thanh tich

### 10. He Thong AI (AI Guru)

- Tro ly ao Gemini AI
- Tra loi cau hoi ve lap rap PC
- Goi y linh kien phu hop
- Tao cau hoi kiem tra tu dong
- Tom tat bai giang
- Phan tich loi sai

### 11. Nhan Dien Co Tay (Hand Tracking)

- Su dung MediaPipe Tasks Vision
- Theo doi co tay qua webcam
- Chuyen dong tay thanh con tro chuot
- Dieu khien thao tac lap rap bang tay

### 12. Chung Chi (`/certificates`)

- Tao chung chi PDF tu dong
- Ma QR de xac thuc
- Xac thuc chung chi tai `/verify/[ma]`

### 13. Thong Bao (`/notifications`)

- Thong bao thoi gian thuc
- Phan loai: he thong, bai tap, diem so, tin nhan
- Tuong tac voi thong bao

### 14. Thao Luan (`/discussion`)

- Dien dan thao luan trong lop
- Tao chu de, tra loi, upvote
- Gan bai hoc / khoa hoc

---

## Cong Nghe Su Dung

| Cong nghe | Muc dich |
|-----------|----------|
| Next.js 16.1.6 | Framework chinh, App Router |
| React 19.2.3 | UI library |
| Supabase | Auth, PostgreSQL, Realtime, Storage |
| @supabase/ssr | SSR auth helpers |
| Tailwind CSS | Styling |
| Framer Motion | Animation |
| Google Generative AI (Gemini) | AI Guru |
| MediaPipe Tasks Vision | Hand tracking |
| TanStack React Query | State management |
| Recharts | Bieu do |
| Lucide React | Icon |
| DnD Kit | Keo-tha linh kien |
| @react-pdf/renderer | Tao PDF chung chi |
| canvas-confetti | Hieu ung ban phao hoa |

---

## Cac Van De Da Khac Phuc

### 1. Dang nhap Google
- **Van de:** Middleware khong cho phep `/auth/callback` la route public, gay redirect vong lap
- **Khac phuc:** Da them `/auth/callback` vao `PUBLIC_ROUTES` trong `middleware.ts`
- **Van de:** CSP thieu `accounts.google.com`
- **Khac phuc:** Da them Google vao CSP: `frame-src`, `connect-src`, `script-src`

### 2. Bao mat
- **Van de:** Tai khoan admin hardcoded trong code (`nguyen200113`)
- **Khac phuc:** Chuyen thanh xac thuc qua Supabase Auth dung `ADMIN_EMAIL` env
- **Van de:** Login admin bang localStorage bypass (`admin_auth` flag)
- **Khac phuc:** Xoa bo localStorage bypass, chuyen qua dung `login()` server action
- **Van de:** Thieu HSTS header
- **Khac phuc:** Da them `Strict-Transport-Security` vao `next.config.mjs`
- **Van de:** Thieu Permissions Policy
- **Khac phuc:** Da them `Permissions-Policy` gioi han quyen camera, microphone

### 3. Env Configuration
- **Van de:** Thieu `.env.example`, `NEXT_PUBLIC_SITE_URL` khong duoc cau hinh cho production
- **Khac phuc:** Da tao `.env.example` va cap nhat code dung `VERCEL_URL` lam fallback

---

## Huong Dan Cai Dat & Trien Khai

### Yeu cau
- Node.js 18+
- Tai khoan Supabase
- Tai khoan Vercel

### Buoc 1: Clone va cai dat
```bash
cd one-mission-pj-main
npm install
```

### Buoc 2: Cau hinh moi truong
```bash
cp .env.example .env.local
```
Dieu cac bien:
- `NEXT_PUBLIC_SUPABASE_URL` - URL Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side)
- `NEXT_PUBLIC_SITE_URL` - URL site cho OAuth (VD: https://pc-master-lms.vercel.app)
- `ADMIN_EMAIL` - Email tai khoan admin trong Supabase

### Buoc 3: Supabase Setup
1. Tao project tren Supabase
2. Chay file SQL trong `database/` de tao bang
3. Cai dat Google OAuth trong Supabase Dashboard:
   - Authentication > Providers > Google
   - Them Client ID va Client Secret tu Google Cloud Console
   - Them URL callback: `https://[your-project].supabase.co/auth/v1/callback`

### Buoc 4: Chay local
```bash
npm run dev
```

### Buoc 5: Trien khai Vercel
```bash
npm i -g vercel
vercel
```
Them environment variables tren Vercel Dashboard.

### Luu y tren Vercel
- `NEXT_PUBLIC_SITE_URL` phai dung URL Vercel: `https://pc-master-lms.vercel.app`
- Trong Supabase Dashboard > Authentication > URL Configuration:
  - Them `https://pc-master-lms.vercel.app` vao redirect URLs
- Google Cloud Console:
  - Them `https://pc-master-lms.vercel.app/auth/callback` vao Authorized redirect URIs
  - Them `https://[project].supabase.co/auth/v1/callback` (callback cua Supabase)

---

## File Quan Trong

| File | Vai tro |
|------|---------|
| `middleware.ts` | Bao ve route, phan quyen theo role |
| `lib/auth-actions.ts` | Server actions: login, register, logout, Google OAuth |
| `lib/supabase-ssr-server.ts` | SSR client cho Server Components |
| `lib/supabase-ssr-client.ts` | Browser client cho Client Components |
| `lib/supabase-service.ts` | Service role client (admin operations) |
| `lib/auth/rbac.ts` | Role-based access control utilities |
| `app/auth/callback/route.ts` | Xu ly OAuth callback tu Google |
| `app/onboarding/page.tsx` | Trang nhap thong tin cho nguoi dung OAuth lan dau |
| `next.config.mjs` | Security headers, CSP, image config |
| `vercel.json` | Vercel config (cron jobs, rewrites) |

---

## Huong Phat Trien Tiep Theo

- Them ho tro ngon ngu tieng Anh
- Toi uu hinh anh cho nguoi dung mobile
- Them tinh nang cham diem tu dong cho bai tap tu luan
- Tich hop them provider AI khac (GPT, Claude)
- Them he thong gio hang thuc cho linh kien
- Toi uu hand tracking cho mobile
- Them dark mode mac dinh

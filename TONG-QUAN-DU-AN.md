# 🖥️ PC Master Builder - Hệ Thống Quản Lý Học Tập Lắp Ráp Máy Tính

## Tổng Quan

**PC Master Builder** là một nền tảng giáo dục tương tác trực tuyến, được xây dựng trên công nghệ **Next.js 16** và **Supabase**, chuyên về giảng dạy tin học và lắp ráp máy tính. Dự án hướng tới học sinh cấp 3 (lớp 10-12) tại Việt Nam, giáo viên tin học, phụ huynh và nhà quản lý trường học.

**Tên đầy đủ:** PC Master Builder - PC Master LMS  
**URL triển khai:** https://pc-master-lms.vercel.app  
**Tech Stack:** Next.js 16, React 19, Supabase, Tailwind CSS, Gemini AI, MediaPipe Hand Tracking

---

## Mục Tiêu & Tầm Nhìn

### Sứ mệnh
Biến việc học tin học trở thành trải nghiệm trực quan, sinh động và thực hành thông qua mô phỏng lắp ráp PC 2D, tích hợp trí tuệ nhân tạo (AI) và công nghệ nhận diện cử chỉ tay (hand tracking).

### Mục tiêu cụ thể
1. **Giáo dục tương tác:** Thay thế phương pháp học lý thuyết khô khan bằng mô phỏng thực hành trực quan.
2. **Phổ cập kiến thức phần cứng:** Giúp học sinh hiểu rõ về linh kiện máy tính, cách lắp ráp và kiểm tra tương thích.
3. **Cá nhân hóa lộ trình học:** Mỗi học sinh có một lộ trình học riêng, theo dõi tiến độ và nhận đề xuất từ AI.
4. **Đa vai trò người dùng:** Hỗ trợ 4 vai trò: Admin, Giáo viên, Học sinh, Phụ huynh với giao diện và quyền hạn riêng.
5. **Ứng dụng AI trong giảng dạy:** Sử dụng Gemini AI để hỗ trợ tạo câu hỏi, tóm tắt bài giảng, gợi ý linh kiện.
6. **Công nghệ hiện đại:** Tích hợp nhận diện cử chỉ tay qua webcam (MediaPipe) để điều khiển thao tác lắp ráp.

---

## Đối Tượng Người Dùng

| Vai trò | Mô tả | Chức năng chính |
|---------|-------|-----------------|
| **Admin** | Quản trị viên hệ thống | Quản lý người dùng, trường học, cấu hình, phân tích dữ liệu, health monitoring |
| **Giáo viên** | Giảng viên tin học | Quản lý lớp, bài giảng, bài kiểm tra, chấm điểm, cấp chứng chỉ |
| **Học sinh** | Học sinh cấp 3 | Học bài, lắp ráp PC, làm kiểm tra, thi đua, nhận chứng chỉ |
| **Phụ huynh** | Cha mẹ học sinh | Theo dõi tiến độ học tập, điểm số, thời gian học của con |

---

## Các Module Chính

### 1. 🔧 Trình Lắp Ráp PC (`/builder`)
Module cốt lõi của ứng dụng - mô phỏng lắp ráp máy tính 2D với nhiều chế độ:
- **Assembly:** Tự do lắp ráp, kéo-thả linh kiện
- **Mission:** Thử thách với ngân sách và mục tiêu cố định
- **Learning:** Hướng dẫn từng bước
- **Course:** Xem bài giảng lý thuyết
- **Market:** Chợ linh kiện - mua bán với ngân sách ảo
- **Multiplayer:** Thi đấu 2 người
- **Exams:** Thi trong builder
- **Challenge:** Thử thách hàng ngày nhận XP
- **Lab:** Phòng thí nghiệm AI với Guru

**Tính năng builder:**
- Tính toán TDP (công suất) thời gian thực
- Kiểm tra tương thích socket (CPU + Mainboard)
- Kiểm tra kích thước case
- Checklist linh kiện (CPU, COOLER, RAMx2, GPU, SSD, PSU)
- Hand tracking qua webcam (MediaPipe)
- AI Guru hướng dẫn thời gian thực
- Hiệu ứng pháo hoa khi hoàn thành nhiệm vụ
- Ghi nhận phiên làm việc vào database

### 2. 🎓 Học Sinh Dashboard (`/student`)
- Thống kê: số lớp, bài tập, linh kiện đã học
- Danh sách lớp học
- Tiến độ học tập
- Lịch sử học tập
- Bài kiểm tra, bài thi
- Chứng chỉ đạt được
- Điểm danh / bảng xếp hạng
- Hồ sơ cá nhân
- Thảo luận nhóm

### 3. 👨‍🏫 Giáo Viên Dashboard (`/teacher`)
- Thống kê: số lớp, số học sinh, bài tập
- Quản lý lớp học (tạo, sửa, xóa lớp, mã tham gia)
- Quản lý bài giảng (tạo, xuất bản, gán cho lớp)
- Quản lý bài kiểm tra / bài thi
- Quản lý chứng chỉ
- Quản lý bài tập về nhà
- Chấm điểm tự động
- Đường học tập (learning path)

### 4. 👪 Phụ Huynh Dashboard (`/parent`)
- Theo dõi thời gian thực con em đang học
- Hiển thị nhiều con (tab)
- Số bài đã học
- Thời gian học
- Điểm kiểm tra trung bình
- Hoạt động gần đây
- Liên kết tài khoản con

### 5. 🔐 Quản Trị Viên Dashboard (`/admin`)
- Tổng quan hệ thống: số người dùng, giáo viên, học sinh, lớp, bài học, bài thi
- Quản lý người dùng
- Quản lý trường học
- Cấu hình hệ thống
- Phân tích dữ liệu (biểu đồ)
- Lịch sử hoạt động
- Health monitoring (độ trễ DB, uptime, trạng thái)
- Quản lý nội dung

### 6. 📝 Hệ Thống Kiểm Tra (`/quiz`, `/exam`)
- Bài kiểm tra nhanh (trắc nghiệm) với 5 dạng câu hỏi:
  - Single choice
  - Multiple choice
  - True/False
  - Fill blank
  - Ordering
- Bài thi có giờ
- Thi có giám sát (proctored)
- Thi lab (lab-exam)
- Tự động chấm điểm
- Xem kết quả + điểm số

### 7. 📚 Khóa Học & Bài Học (`/courses`, `/lessons`)
- Danh mục khóa học, lọc theo trình độ (Cơ bản/Trung cấp/Nâng cao)
- Bài học có nội dung Markdown, hình ảnh, video
- Gán bài học cho lớp
- Theo dõi tiến độ hoàn thành
- Huy hiệu/thành tích

### 8. 🤖 Hệ Thống AI (AI Guru)
- Trợ lý ảo Gemini AI
- Trả lời câu hỏi về lắp ráp PC
- Gợi ý linh kiện phù hợp
- Tạo câu hỏi kiểm tra tự động
- Tóm tắt bài giảng
- Phân tích lỗi sai

### 9. 🖐️ Nhận Diện Cử Chỉ Tay (Hand Tracking)
- Sử dụng MediaPipe Tasks Vision
- Theo dõi cử chỉ tay qua webcam
- Chuyển động tay thành con trỏ chuột
- Điều khiển thao tác lắp ráp bằng tay

### 10. 🏆 Chứng Chỉ (`/certificates`)
- Tạo chứng chỉ PDF tự động
- Mã QR để xác thực
- Xác thực chứng chỉ tại `/verify/[code]`

### 11. 🔔 Thông Báo (`/notifications`)
- Thông báo thời gian thực
- Phân loại: hệ thống, bài tập, điểm số, tin nhắn
- Tương tác với thông báo

### 12. 💬 Thảo Luận (`/discussion`)
- Diễn đàn thảo luận trong lớp
- Tạo chủ đề, trả lời, upvote
- Gắn bài học / khóa học

---

## Công Nghệ Sử Dụng

| Công nghệ | Mục đích |
|-----------|----------|
| Next.js 16.1.6 | Framework chính, App Router |
| React 19.2.3 | UI Library |
| Supabase | Auth, PostgreSQL, Realtime, Storage |
| @supabase/ssr | SSR Auth Helpers |
| Tailwind CSS | Styling |
| Framer Motion | Animation |
| Google Gemini AI | AI Guru |
| MediaPipe Tasks Vision | Hand Tracking |
| TanStack React Query | State Management |
| Recharts | Biểu đồ |
| Lucide React | Icon |
| DnD Kit | Kéo-thả linh kiện |
| @react-pdf/renderer | Tạo PDF chứng chỉ |
| canvas-confetti | Hiệu ứng pháo hoa |
| qrcode / qrcode.react | Tạo mã QR xác thực |
| react-markdown + remark-gfm | Render nội dung Markdown |
| date-fns | Xử lý ngày tháng |
| jspdf + html2canvas | Xuất PDF |
| react-hot-toast | Thông báo toast |

---

## Cấu Trúc Thư Mục

```
one-mission-pj/
├── app/                    # Next.js App Router - Pages & API routes
│   ├── (auth)/             # Đăng nhập, đăng ký
│   ├── (dashboard)/        # Dashboard các vai trò
│   ├── builder/            # Trình lắp ráp PC (module core)
│   ├── courses/            # Khóa học
│   ├── lessons/            # Bài học
│   ├── quiz/               # Kiểm tra
│   ├── exam/               # Thi
│   ├── certificates/       # Chứng chỉ
│   ├── student/            # Học sinh
│   ├── teacher/            # Giáo viên
│   ├── parent/             # Phụ huynh
│   ├── admin/              # Quản trị viên
│   ├── notifications/      # Thông báo
│   └── discussion/         # Thảo luận
├── components/             # React components tái sử dụng
│   ├── ui/                 # UI components (BackButton, ...)
│   ├── quiz/               # Components cho quiz
│   ├── profile/            # Components cho hồ sơ
│   ├── parent/             # Components cho phụ huynh
│   └── progress/           # Components cho tiến độ
├── lib/                    # Server actions, utilities, auth
│   ├── auth/               # RBAC, auth utilities
│   └── grading/            # Auto-grading engine
├── hooks/                  # Custom React hooks
├── providers/              # React context providers
├── types/                  # TypeScript definitions
├── utils/                  # Hàm tiện ích
├── data/                   # Dữ liệu tĩnh / fixtures
├── database/               # Schema & migration files
├── public/                 # Static assets (images, manifest, robots)
├── middleware.ts           # Next.js middleware (auth + RBAC)
├── next.config.mjs         # Next.js config (security headers, CSP)
└── vercel.json             # Vercel deployment config
```

---

## Tính Năng Nổi Bật

### Bảo mật
- Xác thực đa vai trò qua Supabase Auth (Email/Password + Google OAuth)
- Middleware bảo vệ route tự động theo vai trò
- CSP headers chặt chẽ
- HSTS + Permissions Policy
- Không còn hardcode admin credentials

### Trải nghiệm người dùng
- Onboarding cho người dùng OAuth lần đầu
- Dashboard riêng cho từng vai trò
- Thông báo thời gian thực
- Hiệu ứng animation (Framer Motion)
- Pháo hoa khi hoàn thành thử thách
- Page transition mượt mà

### Giáo dục
- Lộ trình học tập cá nhân hóa
- Hệ thống bài kiểm tra đa dạng (5 dạng câu hỏi)
- Thi có giám sát (proctoring)
- Chấm điểm tự động
- Chứng chỉ PDF có mã QR xác thực
- Thành tích, huy hiệu, bảng xếp hạng

### Công nghệ tiên tiến
- AI Gemini tích hợp làm trợ giảng ảo
- Hand tracking qua webcam
- Tương thích linh kiện thời gian thực
- Multiplayer (thi đấu 2 người trong builder)

---

## Hướng Dẫn Cài Đặt

### Yêu cầu
- Node.js 18+
- Tài khoản Supabase
- Tài khoản Vercel (triển khai)

### Cài đặt local
```bash
cd one-mission-pj-main
npm install
cp .env.example .env.local
# Điền các biến môi trường
npm run dev
```

### Biến môi trường (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=       # URL Supabase project
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Anon key
SUPABASE_SERVICE_ROLE_KEY=      # Service role key
NEXT_PUBLIC_SITE_URL=           # URL site cho OAuth
ADMIN_EMAIL=                    # Email tài khoản admin
```

### Triển khai lên Vercel
```bash
npm i -g vercel
vercel
```

---

## Hướng Phát Triển Tiếp Theo

- [ ] Hỗ trợ ngôn ngữ tiếng Anh
- [ ] Tối ưu hình ảnh cho người dùng mobile
- [ ] Chấm điểm tự động cho bài tập tự luận
- [ ] Tích hợp thêm provider AI khác (GPT, Claude)
- [ ] Hệ thống giỏ hàng thực cho linh kiện
- [ ] Tối ưu hand tracking cho mobile
- [ ] Dark mode mặc định

---

## Thông Tin Liên Quan

- **Framework:** Next.js 16.1.6 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email + Google OAuth)
- **Deployment:** Vercel
- **AI:** Google Generative AI (Gemini)
- **Computer Vision:** MediaPipe Tasks Vision

# PC Master Builder — Mô Tả Chi Tiết Web & Chức Năng

> URL: https://pc-master-lms.vercel.app
> Framework: Next.js 16 + React 19 + Supabase

---

## 1. TRANG LANDING (`/`)

**Mô tả:** Trang chủ giới thiệu dự án, thu hút người dùng mới.

**Chức năng:**
- Navbar: Logo, link "Về chúng tôi", "Thực hành", nút Đăng nhập / Đăng ký
- Hero section: Tiêu đề "Học Tin học qua mô phỏng PC thực tế"
- Badge công nghệ: AI hướng dẫn chi tiết, 100% Web-based, Không cần cài đặt
- 2 CTA buttons: "Tôi là Học sinh" → `/builder`, "Tôi là Giáo viên" → `/teacher/lessons`
- Thanh thống kê: THPT Chuyên, 5,000+ Học sinh, Sách KNTT & Cánh Diều
- Grid số liệu: 50+ Linh kiện, 10+ Nhiệm vụ, 100% Web-based, 99% Độ chính xác
- Feature section: 3 cards (TDP, tương thích socket, AI phân tích) + ảnh showcase
- 4 bước hướng dẫn: Chọn vai trò → Tham gia lớp → Thực hành → AI hỗ trợ
- FAQ accordion: 5 câu hỏi thường gặp
- Footer: Logo, liên kết, email/số điện thoại, bản quyền

---

## 2. HỆ THỐNG XÁC THỰC (AUTH)

### 2.1. Đăng nhập (`/login`)

**Chức năng:**
- Đăng nhập bằng email + mật khẩu (Supabase Auth)
- Đăng nhập bằng Google OAuth (redirect → `/auth/callback` → `/onboarding`)
- Nút "Đăng nhập với tư cách Admin" (ẩn, click vào shield icon để hiện)
- Hiển thị lỗi đăng nhập (sai mật khẩu, email không tồn tại)
- Loading spinner khi xử lý
- Toggle hiện/ẩn mật khẩu
- Link "Quên mật khẩu?" → `/forgot-password`
- Link "Đăng ký ngay" → `/register`
- Redirect theo role sau login: admin→/admin, teacher→/teacher, parent→/parent/dashboard, student→/builder

### 2.2. Đăng ký (`/register`)

**Chức năng:**
- 3 bước đăng ký: Thông tin → Vai trò → Hoàn thiện
- **Bước 1:** Họ tên, Email, Mật khẩu (kiểm tra độ mạnh), Xác nhận mật khẩu
- **Bước 2:** Chọn vai trò: Học sinh, Giáo viên, Phụ huynh
- **Bước 3 (theo role):**
  - Học sinh: Mã lớp, Mã trường, Tên trường, Ngày sinh, Tỉnh/TP, Avatar
  - Giáo viên: Mã trường, Tên trường, Avatar
  - Phụ huynh: Avatar, Đồng ý điều khoản
- Upload avatar (có preview)
- Đồng ý điều khoản sử dụng
- Hỗ trợ OAuth completion (khi đăng ký lần đầu sau Google login)

### 2.3. Quên mật khẩu (`/forgot-password`)

**Chức năng:**
- Nhập email để nhận link reset mật khẩu
- Xác nhận gửi email thành công

### 2.4. Onboarding (`/onboarding`)

**Chức năng:**
- Trang dành cho user đăng nhập lần đầu (OAuth)
- Chọn vai trò, nhập thông tin bổ sung
- Tạo profile trong database

---

## 3. PC BUILDER — TRUNG TÂM LẮP RÁP (`/builder`)

**Mô tả:** Module cốt lõi của ứng dụng. Mô phỏng lắp ráp PC 2D.

### 3.1. Màn hình khởi động
- Boot sequence animation (3 vòng tròn xoay, logo, thanh loading)
- Click/Touch để bỏ qua intro

### 3.2. Sidebar Menu (trái)
- **Header:** Logo + "PC Master Builder" + Version V1.0
- **User section:** Avatar, tên, "Khách" nếu chưa đăng nhập
- **Menu items:**
  - "Xem bảng điều khiển" → dashboard theo role
  - Bài Giảng, Tiến Độ Học Tập, Lộ Trình Học, Lịch Sử Học Tập
  - Luyện Tập, Chợ Máy Tính, Kỳ Thi, 2 Người Chơi
  - Ngân Hàng Đề Thi, Thành Tích, Chứng Chỉ
- **Controls:** Theo dõi tay (on/off), Độ nhạy slider
- **Tính năng khác:** Tham gia lớp học, Thông Báo, Thảo Luận, Hồ Sơ Cá Nhân, Về chúng tôi
- **Language toggle:** VN / EN

### 3.3. Chế độ chính

| Chế độ | Mô tả |
|--------|-------|
| **Bài Giảng** | Lý thuyết phần cứng theo chủ đề, tích hợp sách giáo khoa PDF |
| **Luyện Tập** | Lắp ráp tự do — kéo thả linh kiện, kiểm tra tương thích, tính TDP |
| **Chợ Máy Tính** | Mua linh kiện với ngân sách ảo, so sánh giá 6 shop đối tác |
| **2 Người Chơi** | Đối kháng — ai lắp nhanh hơn thắng (Multiplayer) |
| **Kỳ Thi** | Kiểm tra kiến thức định kỳ |
| **Thử Thách** | Nhiệm vụ hàng ngày nhận XP |

### 3.4. Tính năng Builder

- **Game Engine 2D:** Đồ họa linh kiện chi tiết, snap vào socket
- **Component Info:** Click vào linh kiện để xem thông số kỹ thuật
- **Component Preview:** Preview 2D của linh kiện
- **Part Picker Sidebar:** Chọn linh kiện từ danh sách
- **TDP Calculator:** Tính tổng công suất tiêu thụ thời gian thực
- **Compatibility Check:** Kiểm tra socket CPU+Mainboard, kích thước Case
- **Component Checklist:** Theo dõi linh kiện đã gắn (CPU, COOLER, RAMx2, GPU, SSD, PSU)
- **Hand Tracking (Webcam):** Điều khiển bằng cử chỉ tay qua MediaPipe
- **Webcam Cursor:** Con trỏ chuột theo dõi bàn tay
- **Gesture Controls:** 9 cử chỉ tay (pinch, fist, palm, point_up, victory, gun...)
- **AI Guru:** Hộp thoại chat với AI, hướng dẫn thời gian thực
- **Windows Simulator:** Mô phỏng Windows 11 sau khi build xong PC
- **Virtual Assistant:** Trợ lý ảo trong builder
- **Confetti:** Hiệu ứng pháo hoa khi hoàn thành build
- **Builder Session Tracking:** Ghi nhận phiên làm việc vào database
- **Burger Menu:** Menu di động responsive

---

## 4. STUDENT DASHBOARD (`/student`)

### 4.1. Trang chủ Student (`/student`)

**Chức năng:**
- Danh sách lớp học đã tham gia
- Thống kê nhanh: số lớp, bài tập, linh kiện đã học
- Join Class Modal: nhập mã lớp để tham gia
- Notification panel: 5 thông báo gần nhất
- Career Recommendation: gợi ý ngành nghề dựa trên kết quả học tập

### 4.2. Dashboard chi tiết (`/student/dashboard`)

**Server Component:**
- Lời chào theo thời gian (sáng/chiều/tối)
- Biểu đồ hoạt động học tập (phút/ngày trong 7 ngày) — Recharts
- XP, Level, Streak hiện tại
- Tiến trình bài học (completed/total)
- Số lần làm quiz
- Thành tích đạt được
- Link "Tiếp tục học" → bài học tiếp theo

### 4.3. Các trang Student khác

| Route | Chức năng |
|-------|-----------|
| `/student/classes` | Danh sách lớp học, điểm số |
| `/student/lessons` | Bài giảng đã giao |
| `/student/history` | Lịch sử học tập |
| `/student/profile` | Hồ sơ cá nhân, avatar, preferences, security |
| `/student/learning-path` | Lộ trình học tập cá nhân hóa |
| `/student/progress` | Chi tiết tiến độ học tập |
| `/student/quiz` | Ngân hàng đề thi, bài kiểm tra |
| `/student/achievements` | Thành tích và huy hiệu đã đạt |
| `/student/certificates` | Chứng chỉ đã cấp |
| `/student/discussion` | Diễn đàn thảo luận |

---

## 5. TEACHER DASHBOARD (`/teacher`)

### 5.1. Trang chủ Teacher (`/teacher`)

**Chức năng:**
- Thống kê: số lớp, học sinh, bài tập, điểm trung bình
- Hoạt động gần đây: học sinh nộp bài, đặt câu hỏi
- Link nhanh đến quản lý lớp, bài giảng, bài tập

### 5.2. Quản lý lớp (`/teacher/classes`)

**Chức năng:**
- Tạo lớp học mới (tên, mã lớp tự sinh, khối, môn)
- Danh sách lớp đang dạy
- Mã tham gia lớp (share cho học sinh)
- Xem danh sách học sinh trong lớp
- Giao bài tập cho lớp

### 5.3. Quản lý bài giảng (`/teacher/lessons`)

**Chức năng:**
- Tạo bài giảng mới (Markdown editor)
- Thêm sections: video (YouTube/Google Drive), text, quiz, hình ảnh
- Xuất bản/gỡ xuất bản bài giảng
- Gán bài giảng cho lớp học
- Xem trước bài giảng

### 5.4. Các trang Teacher khác

| Route | Chức năng |
|-------|-----------|
| `/teacher/certificates` | Cấp chứng chỉ cho học sinh |
| `/teacher/quiz` | Tạo và quản lý bộ câu hỏi |
| `/teacher/learning-path` | Tạo lộ trình học tập cho lớp |
| `/teacher/dashboard` | Dashboard chi tiết với analytics |

---

## 6. PARENT DASHBOARD (`/parent`)

### 6.1. Dashboard (`/parent/dashboard`)

**Server Component + Client Component:**
- Xác thực parent role
- Query danh sách con đã liên kết (parent_student_links)
- Hiển thị realtime activity của con

**Chức năng:**
- **Theo dõi thời gian thực:** Con đang học gì, online/offline (Supabase Realtime)
- **Multi-child tabs:** Chuyển giữa các con
- **Thông tin mỗi con:**
  - Avatar, tên, trường, mã số
  - XP, Level hiện tại
  - Số bài học đã hoàn thành
  - Thời gian học hôm nay
  - Điểm quiz trung bình
  - Lịch sử hoạt động gần đây
- **Biểu đồ:** Tiến độ học tập theo thời gian (Recharts)
- **Notifications:** Thông báo khi con hoàn thành bài, đạt thành tích mới

### 6.2. Quản lý liên kết (`/parent/link-child`)

**Chức năng:**
- Tìm kiếm học sinh bằng mã số
- Gửi yêu cầu liên kết
- Xác nhận/Thu hồi liên kết

---

## 7. ADMIN DASHBOARD (`/admin`)

### 7.1. Dashboard (`/admin`)

**Chức năng:**
- **System Uptime:** Thời gian hoạt động của hệ thống
- **User Stats:** Tổng users, teachers, students, active classes, lessons, exams
- **Real-time Users table:** Lọc, tìm kiếm, phân trang
- **Real-time Event Feed:** Hoạt động gần đây (user tạo, lesson tạo, exam hoàn thành)
- **System Health:** DB latency, API status, cache status, storage status
- **Charts:**
  - Biểu đồ tăng trưởng user (AreaChart — 30 ngày)
  - Biểu đồ hoạt động (BarChart — 7 ngày)
  - Server metrics: CPU, Memory, Bandwidth (dummy metrics)

### 7.2. Các trang Admin khác

| Route | Chức năng |
|-------|-----------|
| `/admin/users` | Quản lý người dùng (CRUD, filter, search, phân quyền) |
| `/admin/schools` | Quản lý trường học (thêm, sửa, xóa) |
| `/admin/content` | Quản lý nội dung bài giảng |
| `/admin/settings` | Cấu hình hệ thống |
| `/admin/activity` | Lịch sử hoạt động toàn hệ thống |
| `/admin/analytics` | Phân tích dữ liệu chi tiết |
| `/admin/notifications-admin` | Gửi thông báo toàn hệ thống |

---

## 8. HỆ THỐNG QUIZ & EXAM

### 8.1. Quiz Listing (`/quiz`)

**Chức năng:**
- Danh sách mini-quiz từ lesson_sections (content_type='quiz')
- Search bar + bộ lọc danh mục
- Card: tên quiz, difficulty badge, số câu hỏi
- Link vào từng quiz

### 8.2. Quiz Player (`/quiz/[quizId]`)

**Chức năng:**
- Questions sinh động bởi AI (`/api/ai/generate-quiz`)
- 5 câu hỏi / lượt
- 15 giây cho mỗi câu hỏi (timer)
- Streak counter: trả lời đúng liên tiếp
- Feedback ngay sau mỗi câu: đúng (xanh) / sai (đỏ) + đáp án đúng
- Score tracking
- Hiệu ứng confetti khi hoàn thành
- Màn hình kết quả: điểm, streak, số câu đúng/sai
- Link "Thử lại" hoặc "Bài học tiếp theo"

### 8.3. Exam Center (`/exams`)

**Chức năng:**
- Danh sách bài thi từ `assignments` table
- Search + filter
- Card exam: tiêu đề, lớp, thời gian, phần thưởng XP
- Link vào bài thi

### 8.4. Exam Player (`/exam/[examId]`)

**Chức năng:**
- **Standard mode:** 10 câu hỏi kiến trúc máy tính (Von Neumann, CPU, Cache, RAM, PSU...)
- Timer đếm ngược (30 phút)
- Question navigation sidebar
- Trước khi rời trang: cảnh báo
- Nộp bài → chấm điểm tự động
- Kết quả + XP reward
- **Proctored mode (`/exam/[examId]/proctored`):**
  - Webcam tự động bật
  - Identity verification (chụp ảnh khuôn mặt)
  - Full-screen enforcement
  - Tab switch detection
  - Copy/paste/right-click prevention
  - Snapshot định kỳ (30s/lần)
  - Face detection (phân tích màu da)
  - Max 3 violations → auto-submit
  - 60 phút
- **Lab Exam (`/exam/[examId]/lab-exam`):**
  - Mission scenario (VD: build PC văn phòng 15 triệu)
  - Tích hợp GameEngine lắp ráp
  - Hand tracking
  - AI Guru hỗ trợ
  - Auto-grading (PSU wattage, component compatibility)
  - 30 phút

### 8.5. Exam Result (`/exam/[examId]/result/[attemptId]`)

**Chức năng:**
- Pass/Fail state + confetti nếu pass
- Circular progress ring (SVG)
- Score breakdown: đúng/sai/trống
- Topic-based breakdown (progress bars)
- Grade: Xuất sắc/Giỏi/Khá/Trung bình/Yếu
- Badge: grade, time spent, rank
- Actions: Thi lại, Bài học tiếp, Chia sẻ

### 8.6. Daily Quiz (`/daily-quiz/[quizId]`)

**Chức năng:**
- 1 quiz mới mỗi ngày
- Câu hỏi về kiến thức PC, linh kiện
- Giới hạn thời gian
- Tích lũy XP

---

## 9. COURSES & LESSONS

### 9.1. Course Catalog (`/courses`)

**Chức năng:**
- Danh sách khóa học published từ `courses` table
- Grid/List toggle view
- Search by title
- Card course: ảnh, tiêu đề, mô tả, số bài học, thời lượng, level badge
- Level filter: Cơ bản/Trung cấp/Nâng cao
- Link vào chi tiết khóa học

### 9.2. Lessons List (`/lessons`)

**Chức năng:**
- Server component: authenticate → fetch class memberships → fetch assigned lessons
- Danh sách bài học được gán cho lớp
- Card lesson: thumbnail, tiêu đề, mô tả, estimated_minutes, progress status
- Trạng thái: chưa học/đang học/hoàn thành

### 9.3. Lesson Detail (`/lessons/[id]`)

**Chức năng:**
- Bài học với sections: video (YouTube/Google Drive), text, quiz, hình ảnh
- Hiển thị nội dung Markdown qua ReactMarkdown
- Xem sections theo thứ tự (order_index)
- Modal xem sách giáo khoa PDF (lesson_books)
- Progress tracking: ghi nhận thời gian, completion percentage
- Prerequisites: bài học yêu cầu trước

---

## 10. CHỢ MÁY TÍNH / MARKETPLACE (`/marketplace`)

### 10.1. Marketplace Page (`/marketplace/page.js`)

**Chức năng:**
- Danh sách linh kiện từ `products` table (CPU, GPU, RAM, MB, PSU, SSD, HDD, CASE, COOLER, FAN)
- Grid hiển thị: tên, hình ảnh, thông số kỹ thuật, giá
- Bộ lọc: loại linh kiện, hãng sản xuất, khoảng giá
- So sánh giá từ 6 shop đối tác: Phong Vũ, GearVN, An Phát, HACOM, TNC Store, Minh Khoa
- Virtual budget: tích lũy từ điểm quiz (1 điểm = 100,000 VND)
- Mua hàng: trừ budget, thêm vào kho
- Affiliate links: tracking click đến shop thật

### 10.2. Build Sharing

**Chức năng:**
- Public build gallery (`builds` table)
- Upvote/downvote build
- Share build config
- Clone build của người khác

---

## 11. LEADERBOARD (`/leaderboard`)

**Chức năng:**
- Bảng xếp hạng toàn cầu theo XP
- Top 3: Podium với huy hiệu (Vàng/Bạc/Đồng)
- Danh sách xếp hạng từ 4+
- Tab: TOÀN CẦU / LỚP HỌC
- Real-time updates qua Supabase Realtime subscription
- "My Rank" section: thứ hạng hiện tại + target để cải thiện
- Framer Motion animations

---

## 12. CHỨNG CHỈ (`/certificates`, `/verify/[code]`)

### 12.1. Certificates List (`/certificates`)

**Chức năng:**
- Danh sách chứng chỉ + huy hiệu đã đạt
- Card: title, ngày cấp, đơn vị, xếp loại, ảnh certificate
- Thống kê: số chứng chỉ, huy hiệu đã collect
- Nút Download / Share

### 12.2. Verify Certificate (`/verify/[certificateNumber]`)

**Chức năng:**
- Public page (không cần login)
- Tra cứu chứng chỉ từ `certificates` table
- Kết quả:
  - **Valid:** Green checkmark + chi tiết chứng chỉ (tên, title, ngày cấp)
  - **Not Found:** Red X + thông báo
- Mã số chứng chỉ định dạng: `PCM-2026-XXXXX`
- PDF generation qua pdf-lib/jspdf
- QR code trên chứng chỉ

---

## 13. AI GURU (TRỢ LÝ ẢO)

**Triển khai:** Toàn bộ ứng dụng (floating button)

**Chức năng:**
- Floating button (góc dưới phải) với hiệu ứng glow
- Chat widget: input text, lịch sử chat
- Powered by Groq API (Llama-3.3-70B-versatile) + Gemini fallback
- AI context-aware: biết chế độ hiện tại, giỏ hàng, budget
- Response bằng tiếng Việt
- Chủ đề hỗ trợ: kiến thức phần cứng, quiz, builder, marketplace, lessons
- Fallback: khi API lỗi, dùng knowledge base + key questions
- Silent notification: toast nhẹ khi có thông báo mới
- AI Optimizer (`/api/ai-optimizer`): tối ưu cấu hình PC
- AI Suggest Resources (`/api/ai/suggest-resources`)
- AI Generate Quiz (`/api/ai/generate-quiz`)

---

## 14. HAND TRACKING (COMPUTER VISION)

**Triển khai:** Builder page (`/builder`)

**Chức năng:**
- **MediaPipe Tasks Vision** — landmark detection
- **9 gestures:**
  - pinch (chạm): nắm linh kiện
  - fist (nắm): reset
  - palm (xòe): thả
  - point_up (chỉ lên): click
  - victory (chữ V): confirm
  - gun (súng): cancel
  - dual_fist (2 nắm): pause
  - three (3 ngón): menu
  - mid_pinch (chạm giữa): drag
- **GestureControls overlay:** lịch sử gesture, hướng dẫn
- **HandFilter:** bộ lọc nhiễu smoothing
- **WebcamCursor:** con trỏ chuột theo tay
- **Sensitivity slider:** 0.5x → 2.0x
- Tự động bật/tắt camera

---

## 15. THÔNG BÁO (`/notifications`)

**Chức năng:**
- Danh sách thông báo (Supabase Realtime)
- Loại: info, success, warning, error, assignment, quiz
- Unread count badge (bell icon)
- Mark as read / Mark all as read
- Delete notification
- Action URL: click → điều hướng đến trang liên quan
- Parent notification: riêng cho phụ huynh

---

## 16. THẢO LUẬN — DISCUSSION (`/student/discussion`)

**Chức năng:**
- Thread-based forum
- Tạo thread mới (title, body, category)
- Reply với nested comments
- Upvote thread/reply
- DiscussionMessages: real-time chat trong lớp
- Gắn với bài học cụ thể

---

## 17. LỘ TRÌNH HỌC TẬP (`/roadmap`)

**Chức năng:**
- Visual timeline — 4 stages:
  1. Nhập môn Máy tính
  2. Linh kiện & Phần cứng
  3. Kỹ năng Lắp ráp
  4. Cài đặt & Tối ưu
- Trạng thái: completed (xanh) / current (vàng) / locked (xám)
- Dựa trên lesson_progress thực tế từ database

---

## 18. JUDGES — TRANG GIỚI THIỆU DỰ ÁN (`/judges`)

**Chức năng:**
- 11 sections giới thiệu toàn diện:
  1. Tổng Quan Dự Án
  2. Công Nghệ & AI
  3. Mô Phỏng Lắp Ráp 2D
  4. Hand Tracking
  5. Chợ Máy Tính
  6. Hệ Thống Quiz & Bài Tập
  7. Bảng Điều Khiển
  8. Thi Cử & Chứng Chỉ
  9. Tính Năng Khác (Multiplayer, Windows Sim)
  10. Công Nghệ Kỹ Thuật
  11. Triển Khai
- QR code để demo trên điện thoại
- Language toggle: VN / EN
- Accordion UI
- Team member info (2 developers)

---

## 19. TÍNH NĂNG BỔ SUNG

### 19.1. Pricing (`/pricing`)
- Bảng giá 3 gói (Miễn phí / Pro / Enterprise)
- So sánh tính năng

### 19.2. About (`/about`)
- Trang giới thiệu về đội ngũ, sứ mệnh

### 19.3. Onboarding Tour
- Driver.js integration
- Hướng dẫn từng bước cho người dùng mới

### 19.4. Theme Support
- Dark/Light mode via localStorage
- CSS variables cho theme

### 19.5. Certificate PDF Generation
- pdf-lib: tạo PDF certificate
- QR code: xác thực
- jsPDF + html2canvas: export

### 19.6. Security Headers
- HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Permissions-Policy: giới hạn camera, microphone

### 19.7. Cron Jobs
- Daily quiz generation (6h sáng hàng ngày)

---

## 20. DATABASE — SUPABASE TABLES

| Table | Mục đích |
|-------|----------|
| `profiles` | Thông tin người dùng (id, email, name, role, avatar, school, xp, level...) |
| `schools` | Danh sách trường học |
| `parent_student_links` | Liên kết phụ huynh - học sinh |
| `classes` | Lớp học (name, code, teacher, subject, grade) |
| `class_members` | Học sinh trong lớp |
| `assignments` | Bài tập (build_config, optimize_budget, quiz...) |
| `submissions` | Bài nộp + auto-grading |
| `lessons` | Bài giảng |
| `lesson_sections` | Sections trong bài giảng (video, text, quiz) |
| `lesson_progress` | Tiến độ học sinh |
| `lesson_comments` | Bình luận bài giảng |
| `courses` | Khóa học |
| `products` | Linh kiện PC (CPU, GPU, RAM, MB, PSU, SSD, HDD, CASE, COOLER) |
| `builds` | PC builds của người dùng |
| `build_upvotes` | Vote cho build |
| `shop_prices` | Giá từ shops đối tác |
| `partner_shops` | Shop đối tác |
| `affiliate_clicks` | Click link affiliate |
| `question_banks` | Ngân hàng câu hỏi |
| `questions` | Câu hỏi (single, multiple, true_false, fill_blank) |
| `question_options` | Đáp án |
| `quizzes` | Bài quiz |
| `quiz_attempts` | Lần làm quiz |
| `quiz_answers` | Đáp án đã chọn |
| `exam_attempts` | Lần thi |
| `exam_logs` | Log giám sát thi (tab_switch, snapshot...) |
| `certificates` | Chứng chỉ |
| `notifications` | Thông báo |
| `learning_paths` | Lộ trình học tập |
| `path_items` | Mục trong lộ trình |
| `achievement_definitions` | Định nghĩa huy hiệu |
| `student_achievements` | Huy hiệu đã đạt |
| `discussion_threads` | Chủ đề thảo luận |
| `discussion_replies` | Trả lời trong thảo luận |
| `discussion_upvotes` | Vote trong thảo luận |
| `user_preferences` | Cài đặt người dùng (theme, language, notifications) |
| `builder_sessions` | Phiên làm việc builder |
| `daily_quests` | Nhiệm vụ hàng ngày |
| `user_quests` | Nhiệm vụ người dùng |
| `parent_email_cooldown` | Cooldown email phụ huynh |

---

## 21. API ROUTES

| Route | Chức năng |
|-------|-----------|
| `POST /api/auth` | Xác thực |
| `POST /api/ai/chat` | AI chat (Groq Llama/Gemini) |
| `POST /api/ai/generate-quiz` | Sinh câu hỏi quiz bằng AI |
| `POST /api/ai/suggest-resources` | Gợi ý tài nguyên |
| `POST /api/ai-optimizer` | Tối ưu cấu hình PC |
| `POST /api/ai-guru` | AI Guru endpoint |
| `GET /api/lesson-ai` | AI hỗ trợ bài học |
| `POST /api/quiz` | Quiz API |
| `POST /api/notifications` | Notifications API |
| `POST /api/marketplace` | Marketplace API |
| `POST /api/pdf` | PDF generation |
| `GET /api/cron/daily-quiz` | Cron job daily quiz |
| `GET /api/classes` | Classes API |
| `GET /api/chat` | Chat API |
| `GET /api/debug-role` | Debug role |

---

## 22. MIDDLEWARE (RBAC)

**File:** `middleware.ts`

**Chức năng:**
- Bảo vệ tất cả routes trừ PUBLIC_ROUTES
- Public routes: `/`, `/login`, `/register`, `/about`, `/builder`, `/forgot-password`, `/verify`, `/auth/callback`, `/onboarding`, `/admin/*`
- Role-based access control:
  - `/admin` → admin
  - `/teacher` → teacher, admin
  - `/student` → student, admin
  - `/parent` → parent, admin
  - `/builder` → student, admin (chặn teacher, parent)
  - `/profile` → tất cả roles
  - `/notifications`, `/leaderboard` → tất cả roles
- Redirect theo role sau login: admin→/admin, teacher→/teacher, parent→/parent/dashboard, student→/student
- Set headers: `x-user-role`, `x-user-id`

---

## 23. ENVIRONMENT VARIABLES

| Variable | Mục đích |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server) |
| `NEXT_PUBLIC_SITE_URL` | URL site (VD: https://pc-master-lms.vercel.app) |
| `ADMIN_EMAIL` | Email admin |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key (alt) |
| `CRON_SECRET` | Secret cho cron jobs |
| `AI_API_KEY` | AI API key |
| `NEXTAUTH_URL` | NextAuth URL |

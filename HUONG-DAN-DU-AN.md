# 🚀 PC Master LMS - Hệ thống Quản lý Học tập Đa vai trò

Dự án này đã được nâng cấp toàn diện với các tính năng sau:

## 📋 Các tính năng chính
- **Xác thực đa vai trò:** Admin, Giáo viên, Học sinh, Phụ huynh.
- **Middleware bảo mật:** Tự động phân quyền và bảo vệ các tuyến đường (routes).
- **Dashboard riêng biệt:** Mỗi vai trò có một giao diện và chức năng riêng.
- **Quản lý bài giảng:** Giáo viên có thể tạo, sửa, xóa và xuất bản bài giảng.
- **Trình lắp ráp PC:** Không gian thực hành cho học sinh.
- **Hệ thống AI:** Hỗ trợ tạo câu hỏi và tóm tắt bài giảng.

## 🛠 Hướng dẫn Kỹ thuật
- **Framework:** Next.js 14+ (App Router).
- **Database:** Supabase (Auth + PostgreSQL).
- **Styling:** Tailwind CSS & Lucide Icons.

## 🗂 Cấu trúc thư mục mới
- `/app/(auth)`: Xử lý Đăng nhập & Đăng ký.
- `/app/(dashboard)`: Chứa giao diện cho từng vai trò.
- `/lib`: Chứa các tiện ích kết nối Supabase và xử lý Auth.
- `/supabase_auth_roles.sql`: File SQL để thiết lập database (CẦN CHẠY TRÊN SUPABASE).

---
*Người thực hiện: Antigravity AI Assistant*

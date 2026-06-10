-- THÊM DỮ LIỆU MẪU (SEED DATA) CHO PC MASTER LMS

-- 1. Thêm trường học mẫu
INSERT INTO public.schools (id, name, address, code)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'THPT Chuyên Lê Hồng Phong', 'TP.HCM', 'THPT01'),
  ('22222222-2222-2222-2222-222222222222', 'THPT Chuyên Khoa Học Tự Nhiên', 'Hà Nội', 'THPT02')
ON CONFLICT (code) DO NOTHING;

-- Lưu ý: Supabase Auth quản lý password riêng bằng bcrypt ở Schema 'auth'. 
-- Việc seed User (cả email/password) bằng SQL trực tiếp vào auth.users phức tạp do mã hoá mật khẩu.
-- MÌNH KHUYÊN BẠN NÊN DÙNG GIAO DIỆN TRANG WEB ĐỂ ĐĂNG KÝ (SIGN UP) 10 TÀI KHOẢN NÀY LÀ NHANH VÀ AN TOÀN NHẤT.

-- Tuy nhiên, dưới đây là cách chèn thẳng vào Auth cho môi trường dev (Supabase local):
-- Nếu bạn đang dùng dự án Supabase Hosted, bạn bắt buộc phải dùng Client API (giao diện Đăng Ký của web bạn) 
-- để đăng ký tài khoản, sau đó vào bảng profiles để đổi `role` thành 'admin', 'teacher', v.v.

/*
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'admin@lms.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Admin Tổng", "role": "admin"}'),
  ('44444444-4444-4444-4444-444444444444', 'teacher1@lms.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "GV. Trần Văn A", "role": "teacher"}'),
  ('55555555-5555-5555-5555-555555555555', 'student1@lms.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "HS. Nguyễn Văn B", "role": "student"}'),
  ('66666666-6666-6666-6666-666666666666', 'parent1@lms.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "PH. Nguyễn Văn C", "role": "parent"}');
*/

-- 3. Ví dụ liên kết phụ huynh - học sinh (Chỉ chạy được sau khi tài khoản đã được tạo)
/*
INSERT INTO public.parent_student_links (parent_id, student_id, relationship)
VALUES ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'father');
*/

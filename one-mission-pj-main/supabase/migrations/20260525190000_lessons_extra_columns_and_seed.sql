-- ============================================================
-- Thêm columns mới cho lessons table
-- ============================================================
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'Tin học';
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS chapter TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS estimated_minutes INT DEFAULT 30;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;

-- Function increment view_count
CREATE OR REPLACE FUNCTION public.increment_lesson_views(lesson_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.lessons SET view_count = view_count + 1 WHERE id = lesson_id;
END;
$$;

-- ============================================================
-- Seed data: bài giảng mẫu (chỉ chạy nếu chưa có bài nào)
-- ============================================================
DO $$
DECLARE
  teacher_id UUID;
  lesson_id UUID;
BEGIN
  -- Chỉ seed nếu chưa có bài giảng nào
  IF (SELECT COUNT(*) FROM public.lessons) > 0 THEN
    RETURN;
  END IF;

  -- Lấy teacher đầu tiên
  SELECT id INTO teacher_id FROM public.profiles WHERE role = 'teacher' LIMIT 1;
  
  -- Nếu không có teacher thật, dùng user đầu tiên
  IF teacher_id IS NULL THEN
    SELECT id INTO teacher_id FROM auth.users LIMIT 1;
  END IF;

  -- Bài 1: Giới thiệu về Phần cứng Máy tính
  INSERT INTO public.lessons (id, teacher_id, title, description, is_published, subject, estimated_minutes, view_count)
  VALUES (gen_random_uuid(), teacher_id, 'Giới thiệu về Phần cứng Máy tính', 'Tổng quan về các linh kiện PC cơ bản: CPU, RAM, Mainboard, GPU, ổ cứng và nguồn.', true, 'Tin học - Lắp ráp PC', 25, 0)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, type, content, order_index) VALUES
    (lesson_id, 'PC là gì?', 'text', 'Máy tính cá nhân (PC) là một hệ thống bao gồm nhiều linh kiện điện tử hoạt động cùng nhau. Mỗi linh kiện đảm nhận một vai trò riêng, từ xử lý dữ liệu đến lưu trữ và hiển thị thông tin.\n\nTrong bài học này, chúng ta sẽ tìm hiểu tổng quan về các thành phần chính của một chiếc máy tính để bàn.', 0),
    (lesson_id, 'Các linh kiện cơ bản', 'video', 'https://www.youtube.com/watch?v=7X8eH3rF5HQ', 1),
    (lesson_id, 'Sơ đồ khối hệ thống', 'image', 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1074&auto=format&fit=crop', 2),
    (lesson_id, 'Tổng kết', 'text', 'Một PC hoàn chỉnh gồm:\n- **CPU**: Bộ xử lý trung tâm\n- **RAM**: Bộ nhớ tạm thời\n- **Mainboard**: Bo mạch chủ kết nối các linh kiện\n- **GPU**: Card đồ họa xử lý hình ảnh\n- **Storage**: Ổ cứng lưu trữ dữ liệu\n- **PSU**: Nguồn điện cung cấp năng lượng', 3);

  -- Bài 2: CPU - Bộ xử lý Trung tâm
  INSERT INTO public.lessons (id, teacher_id, title, description, is_published, subject, estimated_minutes, view_count)
  VALUES (gen_random_uuid(), teacher_id, 'CPU - Bộ xử lý Trung tâm', 'Kiến trúc CPU, các hãng sản xuất, socket, tốc độ xung nhịp và hiệu năng.', true, 'Tin học - Lắp ráp PC', 35, 0)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, type, content, order_index) VALUES
    (lesson_id, 'CPU là gì?', 'text', 'CPU (Central Processing Unit) là bộ xử lý trung tâm, được coi là "bộ não" của máy tính. CPU thực thi các lệnh từ chương trình máy tính bằng cách thực hiện các phép tính số học, logic, điều khiển và nhập/xuất (I/O).', 0),
    (lesson_id, 'Cấu tạo CPU', 'video', 'https://www.youtube.com/watch?v=1GvT0U7I3gA', 1),
    (lesson_id, 'Các hãng sản xuất', 'text', '**Intel** và **AMD** là hai nhà sản xuất CPU lớn nhất cho thị trường PC.\n\n- Intel: Core i3/i5/i7/i9, dòng Xeon cho máy chủ\n- AMD: Ryzen 3/5/7/9, dòng Threadripper cho workstation\n\nMỗi hãng sử dụng các loại socket riêng, không tương thích chéo.', 2),
    (lesson_id, 'Cách chọn CPU', 'text', 'Khi chọn CPU cần quan tâm:\n1. **Socket**: Phải tương thích với mainboard\n2. **Số nhân/luồng**: Càng nhiều càng tốt cho đa nhiệm\n3. **Xung nhịp**: GHz càng cao càng nhanh\n4. **TDP**: Công suất tỏa nhiệt, ảnh hưởng đến tản nhiệt\n5. **Cache**: Bộ nhớ đệm giúp tăng tốc xử lý', 3);

  -- Bài 3: RAM - Bộ nhớ Tạm thời
  INSERT INTO public.lessons (id, teacher_id, title, description, is_published, subject, estimated_minutes, view_count)
  VALUES (gen_random_uuid(), teacher_id, 'RAM - Bộ nhớ Tạm thời', 'DDR4 vs DDR5, timing, bus speed, dung lượng và cách lắp đặt.', true, 'Tin học - Lắp ráp PC', 20, 0)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, type, content, order_index) VALUES
    (lesson_id, 'RAM là gì?', 'text', 'RAM (Random Access Memory) là bộ nhớ truy cập ngẫu nhiên, dùng để lưu trữ dữ liệu tạm thời cho CPU xử lý. Khi tắt máy, dữ liệu trong RAM sẽ mất.', 0),
    (lesson_id, 'DDR4 vs DDR5', 'video', 'https://www.youtube.com/watch?v=8s2y7i6Qa1E', 1),
    (lesson_id, 'Thông số quan trọng', 'text', 'Các thông số cần biết:\n- **Dung lượng**: 8GB (cơ bản), 16GB (tốt), 32GB+ (chuyên nghiệp)\n- **Tốc độ bus**: MHz - càng cao càng nhanh\n- **CAS Latency (CL)**: Độ trễ - càng thấp càng tốt\n- **Kênh**: Single/Dual/Quad channel', 2);

  -- Bài 4: Mainboard - Bo mạch Chủ
  INSERT INTO public.lessons (id, teacher_id, title, description, is_published, subject, estimated_minutes, view_count)
  VALUES (gen_random_uuid(), teacher_id, 'Mainboard - Bo mạch Chủ', 'Chipset, form factor, các cổng kết nối và cách chọn mainboard phù hợp.', true, 'Tin học - Lắp ráp PC', 30, 0)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, type, content, order_index) VALUES
    (lesson_id, 'Mainboard là gì?', 'text', 'Mainboard (bo mạch chủ) là bảng mạch in chính kết nối tất cả linh kiện của máy tính. Nó phân phối điện năng và cho phép các linh kiện giao tiếp với nhau.', 0),
    (lesson_id, 'Các thành phần trên Mainboard', 'image', 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1170&auto=format&fit=crop', 1),
    (lesson_id, 'Form Factor', 'text', 'Các kích thước mainboard phổ biến:\n\n- **ATX**: Kích thước chuẩn, nhiều khe mở rộng\n- **Micro-ATX**: Nhỏ gọn hơn, đủ khe cắm cơ bản\n- **Mini-ITX**: Rất nhỏ, chỉ 1 khe PCIe\n\nChọn case phải tương thích với form factor của mainboard.', 2);

  -- Bài 5: GPU - Card Đồ họa
  INSERT INTO public.lessons (id, teacher_id, title, description, is_published, subject, estimated_minutes, view_count)
  VALUES (gen_random_uuid(), teacher_id, 'GPU - Card Đồ họa', 'GPU cho gaming và đồ họa chuyên nghiệp, cách chọn card phù hợp nhu cầu.', true, 'Tin học - Lắp ráp PC', 25, 0)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, type, content, order_index) VALUES
    (lesson_id, 'GPU là gì?', 'text', 'GPU (Graphics Processing Unit) là bộ xử lý đồ họa, chuyên xử lý các tác vụ liên quan đến hình ảnh, video và game.', 0),
    (lesson_id, 'NVIDIA vs AMD', 'video', 'https://www.youtube.com/watch?v=3Ua4Gk7R0Vc', 1),
    (lesson_id, 'Chọn GPU theo nhu cầu', 'text', '- **Học tập/Văn phòng**: GPU tích hợp (Intel UHD, AMD Radeon Graphics)\n- **Gaming tầm trung**: GTX 1660, RTX 3060, RX 6600\n- **Gaming cao cấp**: RTX 4070+, RX 7800+\n- **Đồ họa/Dựng phim**: RTX 4080+, RTX 4090, Workstation GPU', 2);

  -- Bài 6: Nguồn điện (PSU) và Case
  INSERT INTO public.lessons (id, teacher_id, title, description, is_published, subject, estimated_minutes, view_count)
  VALUES (gen_random_uuid(), teacher_id, 'Nguồn điện (PSU) và Case máy tính', 'Tính TDP, chọn nguồn phù hợp, các loại case và kích thước.', true, 'Tin học - Lắp ráp PC', 20, 0)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, type, content, order_index) VALUES
    (lesson_id, 'PSU - Nguồn điện', 'text', 'PSU (Power Supply Unit) cung cấp điện năng cho toàn bộ hệ thống. Công suất PSU được tính bằng Watt (W).\n\n**Công thức tính**: TDP của CPU + TDP của GPU + 100W dự phòng.\n\n**80 Plus Certification**: Chuẩn hiệu suất: White, Bronze, Silver, Gold, Platinum, Titanium.', 0),
    (lesson_id, 'Case máy tính', 'text', 'Case bảo vệ các linh kiện và đảm bảo luồng khí làm mát. Các loại case:\n\n- **Full Tower**: Lớn nhất, nhiều không gian\n- **Mid Tower**: Phổ biến nhất\n- **Mini Tower**: Nhỏ gọn, tiết kiệm không gian\n- **SFF (Small Form Factor)**: Siêu nhỏ gọn\n\nLưu ý: Case phải tương thích với form factor của mainboard và chiều dài của GPU.', 1),
    (lesson_id, 'Lưu ý khi ráp máy', 'text', 'Một số lưu ý quan trọng:\n\n1. Luôn tắt nguồn và rút dây điện trước khi ráp\n2. Sử dụng dây đeo chống tĩnh điện (ESD wrist strap)\n3. Lắp CPU trước, sau đó RAM → Mainboard → VGA → Ổ cứng → Nguồn\n4. Cable management giúp luồng khí tốt hơn\n5. Bật máy lần đầu không cần gắn case (test bench)', 2);
END;
$$;

-- Fix: content_type column NOT NULL nhưng không có DEFAULT
ALTER TABLE public.lesson_sections
  ALTER COLUMN content_type SET DEFAULT 'text',
  ALTER COLUMN content_type SET NOT NULL;

-- Fix: Cho phép tìm lớp theo mã code khi tham gia (RLS)
DROP POLICY IF EXISTS "students_lookup_class_by_code" ON public.classes;
CREATE POLICY "students_lookup_class_by_code" ON public.classes
  FOR SELECT USING (true);

-- Bật realtime cho các bảng chính
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_sections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

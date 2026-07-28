-- ==========================================
-- SEED: Khóa học "Phần Cứng Máy Tính & Ngành Nghề"
-- Nội dung dựa trên file Word document
-- ==========================================

DO $$
DECLARE
  teacher_id UUID;
  course_id UUID;
  lesson_id UUID;
BEGIN
  -- Lấy teacher đầu tiên
  SELECT id INTO teacher_id FROM public.profiles WHERE role = 'teacher' LIMIT 1;
  IF teacher_id IS NULL THEN
    SELECT id INTO teacher_id FROM auth.users LIMIT 1;
  END IF;

  -- ========== TẠO KHÓA HỌC ==========
  INSERT INTO public.courses (id, teacher_id, title, description, thumbnail_url, category, level, is_published, price_vnd, free_lesson_count, total_lessons, total_hours, student_count, rating)
  VALUES (
    gen_random_uuid(),
    teacher_id,
    'Phần Cứng Máy Tính & Các Ngành Nghề Liên Quan',
    'Khóa học toàn diện về phần cứng máy tính: từ CPU, RAM, Mainboard, GPU, ổ cứng, nguồn, tản nhiệt đến các ngành nghề trong lĩnh vực phần cứng. Phù hợp cho học sinh THPT, sinh viên và người mới bắt đầu.',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop',
    'Phần cứng',
    'Cơ bản',
    true,
    199000,
    3,
    12,
    8,
    1247,
    4.8
  )
  RETURNING id INTO course_id;

  -- ========== BÀI 1: MIỄN PHÍ - Tổng quan về Phần cứng ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'Tổng quan về Phần cứng Máy tính',
    'Khái niệm phần cứng, phân loại thiết bị nội ngoại vi và sơ đồ tổng quan hệ thống máy tính.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    true, 'Phần cứng', 25)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'Phần cứng là gì?', 'text', NULL,
'Phần cứng (Hardware) là thuật ngữ dùng để miêu tả tất cả những thiết bị vật lý hữu hình nằm bên trong và bên ngoài máy tính mà người dùng có thể nhìn thấy và cầm nắm được.

Một chiếc máy tính được cấu thành từ các thiết bị phần cứng nằm bên ngoài như: Màn hình máy tính, bàn phím, chuột máy tính, tai nghe, máy in, máy chiếu, loa, USB...

Bên cạnh đó không thể không kể đến những thiết bị nằm bên trong bao gồm: bộ nguồn, chip CPU, bo mạch chủ Mainboard, RAM, ROM, card màn hình, card âm thanh, quạt tản nhiệt, Modem cùng một số Drive như: Bluray, DVD, CD-ROM, ổ cứng, ổ đĩa mềm.', 0),
    (lesson_id, 'Phân loại thiết bị phần cứng', 'video', 'https://www.youtube.com/watch?v=7X8eH3rF5HQ', NULL, 1),
    (lesson_id, 'Sơ đồ khối hệ thống máy tính', 'image', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop', NULL, 2),
    (lesson_id, 'Tổng kết bài học', 'text', NULL,
'Trong bài này chúng ta đã học:

- **Phần cứng** là tất cả thiết bị vật lý của máy tính
- **Thiết bị ngoại vi**: Màn hình, bàn phím, chuột, loa, máy in...
- **Thiết bị nội vi**: CPU, RAM, Mainboard, GPU, ổ cứng, nguồn...
- **Vai trò**: Mỗi linh kiện đảm nhận một chức năng riêng, phối hợp để tạo thành hệ thống hoàn chỉnh', 3);

  -- ========== BÀI 2: MIỄN PHÍ - CPU ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'CPU - Bộ vi xử lý Trung tâm',
    'CPU là bộ não của máy tính. Tìm hiểu kiến trúc, socket, xung nhịp, các hãng sản xuất và cách chọn CPU.',
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop',
    true, 'Phần cứng - CPU', 35)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'CPU là gì?', 'text', NULL,
'CPU (Central Processing Unit) là bộ não của máy tính, đảm nhận vai trò xử lý mọi phép tính và điều khiển hoạt động của các linh kiện khác.

Chính CPU quyết định tốc độ xử lý và khả năng đa nhiệm của hệ thống, ảnh hưởng trực tiếp đến trải nghiệm người dùng. CPU càng mạnh mẽ, các tác vụ càng được thực thi nhanh và mượt mà, đặc biệt trong các ứng dụng đòi hỏi hiệu năng cao như biên tập video, chơi game hay làm việc với dữ liệu lớn.

(Nguồn: Thế giới di động)', 0),
    (lesson_id, 'Cấu tạo chi tiết CPU', 'video', 'https://www.youtube.com/watch?v=1GvT0U7I3gA', NULL, 1),
    (lesson_id, 'Intel vs AMD', 'text', NULL,
'Hai nhà sản xuất CPU lớn nhất cho thị trường PC:

**Intel:**
- Dòng Core: i3 (cơ bản), i5 (trung cấp), i7 (cao cấp), i9 (siêu cao cấp)
- Socket: LGA1700, LGA1851 (thế hệ mới)
- Ưu điểm: Hiệu năng đơn nhân tốt, ổn định

**AMD:**
- Dòng Ryzen: R3, R5, R7, R9
- Socket: AM4, AM5
- Ưu điểm: Đa nhân mạnh, giá cạnh tranh

*Lưu ý: Socket giữa Intel và AMD không tương thích chéo!*', 2),
    (lesson_id, 'Cách chọn CPU phù hợp', 'text', NULL,
'Khi chọn CPU cần quan tâm các thông số:

1. **Socket**: Phải tương thích với Mainboard (ví dụ: CPU Intel LGA1700 → Mainboard chipset 600/700 series)
2. **Số nhân / luồng (Cores/Threads)**: Càng nhiều càng tốt cho đa nhiệm, render, biên tập
3. **Xung nhịp (GHz)**: Xung boost càng cao xử lý càng nhanh
4. **TDP (W)**: Công suất tỏa nhiệt, quyết định khả năng tản nhiệt cần có
5. **Cache (MB)**: Bộ nhớ đệm trên CPU, giúp tăng tốc xử lý

> Mẹo: Với học sinh và văn phòng, Intel i5 hoặc AMD Ryzen 5 là lựa chọn tối ưu về giá/hiệu năng.', 3);

  -- ========== BÀI 3: MIỄN PHÍ - Mainboard ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'Mainboard - Bo mạch Chủ',
    'Bo mạch chủ là xương sống kết nối toàn bộ linh kiện. Chipset, form factor, socket và cách chọn mainboard.',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
    true, 'Phần cứng - Mainboard', 30)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'Mainboard là gì?', 'text', NULL,
'Bo mạch chủ đóng vai trò làm bộ khung kết nối và giao tiếp giữa các linh kiện quan trọng như CPU, RAM, GPU, ổ cứng và thiết bị ngoại vi khác.

Nhiệm vụ của bo mạch chủ là đảm bảo tín hiệu truyền tải chính xác, nhanh chóng và ổn định, từ đó giúp các thành phần phối hợp nhịp nhàng, tối ưu hiệu suất toàn hệ thống. Đồng thời, bo mạch chủ còn chịu trách nhiệm cung cấp nguồn điện ổn định và các chế độ bảo vệ linh kiện khỏi các sự cố phần cứng.

(Nguồn: Thế giới di động)', 0),
    (lesson_id, 'Các thành phần trên Mainboard', 'image', 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop', NULL, 1),
    (lesson_id, 'Form Factor và kích thước', 'text', NULL,
'Các kích thước mainboard phổ biến:

| Loại | Kích thước | Khe mở rộng | Phù hợp |
|------|-----------|-------------|---------|
| **ATX** | 305x244mm | Nhiều nhất | Case Mid/Full Tower |
| **Micro-ATX** | 244x244mm | Đủ cơ bản | Case Mid Tower |
| **Mini-ITX** | 170x170mm | Tối thiểu | Case nhỏ gọn |

> Lưu ý: Case và Mainboard phải cùng form factor hoặc case phải hỗ trợ form factor lớn hơn mainboard.', 2),
    (lesson_id, 'Socket và Chipset', 'text', NULL,
'**Socket**: Là khe cắm CPU trên mainboard. Mỗi đời CPU chỉ tương thích với một số socket nhất định.

- Intel: LGA1200 (10/11th Gen), LGA1700 (12-14th Gen), LGA1851 (Ultra 200S)
- AMD: AM4 (Ryzen 1000-5000), AM5 (Ryzen 7000+)

**Chipset**: Là chip điều khiển trên mainboard, quyết định tính năng:
- Hỗ trợ ép xung (Overclocking)
- Số làn PCIe, cổng USB, SATA
- Hỗ trợ RAM và tốc độ tối đa', 3);

  -- ========== BÀI 4: TRẢ PHÍ - RAM ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'RAM - Bộ nhớ Truy cập Ngẫu nhiên',
    'RAM là bộ nhớ tạm thời lưu trữ dữ liệu cho CPU xử lý. DDR4 vs DDR5, dung lượng, bus speed và cách lắp đặt.',
    'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop',
    true, 'Phần cứng - RAM', 30)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'RAM là gì?', 'text', NULL,
'RAM (Random Access Memory) là bộ nhớ tạm thời lưu trữ dữ liệu và lệnh mà CPU đang xử lý, giúp tăng tốc độ thao tác và khả năng thực thi đa nhiệm của máy.

Dung lượng và tốc độ RAM ảnh hưởng trực tiếp đến khả năng xử lý các tác vụ nặng như chỉnh sửa video, chơi game, chạy máy ảo hay các phần mềm kỹ thuật. RAM càng nhanh và có dung lượng lớn thì hệ thống càng phản hồi nhanh, hạn chế giật lag.

(Nguồn: Thế giới di động)', 0),
    (lesson_id, 'DDR4 vs DDR5 - So sánh', 'video', 'https://www.youtube.com/watch?v=8s2y7i6Qa1E', NULL, 1),
    (lesson_id, 'Các thông số quan trọng', 'text', NULL,
'Các thông số cần biết khi chọn RAM:

1. **Dung lượng (GB)**: 8GB (cơ bản), 16GB (tốt, khuyến nghị), 32GB+ (chuyên nghiệp)
2. **Tốc độ Bus (MHz)**: DDR4 ~ 3200MHz, DDR5 ~ 4800-6000MHz+
3. **CAS Latency (CL)**: Độ trễ - CL càng thấp càng tốt (VD: CL16 < CL18)
4. **Kênh (Channel)**: Single (1 thanh), Dual (2 thanh - nên dùng), Quad (4 thanh)
5. **Dual Channel**: Lắp RAM vào khe thứ 2 và 4 trên mainboard để kích hoạt

> Mẹo: Luôn lắp RAM thành cặp (2 thanh) để chạy Dual Channel, tăng băng thông gấp đôi!', 2),
    (lesson_id, 'Cách lắp đặt RAM', 'text', NULL,
'Các bước lắp RAM:

1. Mở khóa hai đầu khe RAM trên mainboard
2. Căn chỉnh khuyết trên thanh RAM với khe cắm
3. Ấn đều hai đầu cho đến khi nghe tiếng "tách"
4. Kiểm tra đèn khóa đã tự động gài chặt

> Đối với mainboard 4 khe: Lắp vào khe A2 và B2 (khe thứ 2 và 4) để chạy Dual Channel tối ưu nhất.', 3);

  -- ========== BÀI 5: TRẢ PHÍ - Ổ cứng ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'Ổ cứng Lưu trữ - HDD vs SSD',
    'Ổ cứng là nơi lưu trữ toàn bộ dữ liệu. So sánh chi tiết HDD và SSD: tốc độ, độ bền và cách chọn.',
    'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&auto=format&fit=crop',
    true, 'Phần cứng - Lưu trữ', 25)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'Ổ cứng là gì?', 'text', NULL,
'Ổ cứng là nơi lưu trữ toàn bộ dữ liệu bao gồm hệ điều hành, phần mềm, trò chơi và tài liệu cá nhân.

Tốc độ và độ bền của ổ cứng ảnh hưởng trực tiếp đến thời gian khởi động máy, mở ứng dụng và sao chép dữ liệu. Ổ cứng càng nhanh thì trải nghiệm sử dụng càng mượt mà và hiệu quả.

Có hai loại ổ cứng là HDD (Hard Disk Drive) và SSD (Solid State Drive).

(Nguồn: Thế giới di động)', 0),
    (lesson_id, 'HDD - Ổ cứng cơ học', 'text', NULL,
'**HDD (Hard Disk Drive)** là ổ cứng truyền thống sử dụng đĩa từ quay và đầu đọc cơ học.

**Ưu điểm:**
- Giá rẻ hơn SSD (khoảng 1/3 đến 1/5)
- Dung lượng lớn (1TB - 20TB+)
- Phù hợp lưu trữ dữ liệu dung lượng cao

**Nhược điểm:**
- Tốc độ chậm (~80-160MB/s đọc/ghi)
- Dễ hư hỏng do va đập vì có bộ phận cơ học
- Tiêu tốn nhiều điện năng hơn
- Ồn và rung khi hoạt động', 1),
    (lesson_id, 'SSD - Ổ cứng thể rắn', 'video', 'https://www.youtube.com/watch?v=YQEjGKYXjw8', NULL, 2),
    (lesson_id, 'SSD vs HDD - Nên chọn loại nào?', 'text', NULL,
'| Tiêu chí | HDD | SSD |
|----------|-----|-----|
| Tốc độ đọc | ~80-160 MB/s | ~500-7000 MB/s |
| Chống sốc | Kém | Tốt |
| Độ ồn | Có | Không |
| Giá/GB | ~500đ/GB | ~3000đ/GB |
| Tuổi thọ | 3-5 năm | 5-10 năm |

**Khuyến nghị:**
- **Dùng SSD cho ổ chính**: Cài Windows, phần mềm, game (250GB-1TB NVMe)
- **Dùng HDD cho lưu trữ**: Dữ liệu, phim, nhạc, backup (1TB+)
- **Tối ưu**: SSD NVMe 500GB + HDD 1TB = combo chuẩn cho đa số người dùng', 3);

  -- ========== BÀI 6: TRẢ PHÍ - GPU ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'GPU - Card Đồ họa',
    'GPU chuyên xử lý tác vụ đồ họa, video và AI. NVIDIA vs AMD, cách chọn card theo nhu cầu sử dụng.',
    'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&auto=format&fit=crop',
    true, 'Phần cứng - GPU', 35)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'GPU là gì?', 'text', NULL,
'GPU (Graphics Processing Unit) chuyên xử lý các tác vụ đồ họa, video và các thuật toán tính toán chuyên sâu như trí tuệ nhân tạo.

Với những người làm thiết kế, dựng phim hoặc game thủ, card đồ họa là thành phần không thể thiếu để đảm bảo hình ảnh sắc nét, mượt mà.

(Nguồn: Thế giới di động)', 0),
    (lesson_id, 'NVIDIA vs AMD', 'video', 'https://www.youtube.com/watch?v=3Ua4Gk7R0Vc', NULL, 1),
    (lesson_id, 'Cách chọn GPU theo nhu cầu', 'text', NULL,
'- **Học tập / Văn phòng**: GPU tích hợp (Intel UHD, AMD Radeon Graphics trên CPU)
- **Gaming tầm trung (1080p)**: GTX 1660 Super, RTX 3060, RX 6600
- **Gaming cao cấp (1440p)**: RTX 4070, RTX 4070 Super, RX 7800 XT
- **Đồ họa / Dựng phim**: RTX 4080, RTX 4090 (hoặc workstation NVIDIA RTX A series)
- **AI / Deep Learning**: RTX 4090 24GB, RTX 6000 Ada

> Lưu ý: Kiểm tra chiều dài GPU có vừa với Case không và PSU có đủ công suất không!', 2),
    (lesson_id, 'Thông số kỹ thuật GPU', 'text', NULL,
'Các thông số quan trọng:

1. **VRAM (GB)**: Bộ nhớ đồ họa - 4GB (cơ bản), 8GB (tốt), 12-24GB (chuyên nghiệp)
2. **Xung nhịp (MHz)**: Boost clock càng cao càng mạnh
3. **Băng thông (GB/s)**: Phụ thuộc vào loại nhớ GDDR6/GDDR7
4. **Cổng xuất hình**: HDMI 2.1, DisplayPort 1.4a/2.0
5. **TDP (W)**: Công suất tiêu thụ - cần PSU tương ứng
6. **Kích thước (mm)**: Chiều dài GPU phải vừa với Case', 3);

  -- ========== BÀI 7: TRẢ PHÍ - PSU ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'PSU - Nguồn điện và Cách tính TDP',
    'Nguồn điện cung cấp năng lượng cho toàn bộ hệ thống. Cách tính công suất, chuẩn 80 Plus và chọn nguồn.',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&auto=format&fit=crop',
    true, 'Phần cứng - PSU', 30)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'PSU là gì?', 'text', NULL,
'PSU (Power Supply Unit) có nhiệm vụ cung cấp nguồn điện ổn định và an toàn cho toàn bộ hệ thống máy tính.

Một bộ nguồn chất lượng cao không chỉ đảm bảo máy chạy ổn định mà còn bảo vệ các linh kiện khỏi hiện tượng quá tải, sụt áp hay sốc điện.

(Nguồn: Thế giới di động)', 0),
    (lesson_id, 'Cách tính TDP', 'text', NULL,
'**Công suất (TDP) là tổng điện năng tiêu thụ của toàn bộ linh kiện.**

Công thức tính: TDP = TDP(CPU) + TDP(GPU) + 100W (dự phòng cho các linh kiện khác)

Ví dụ:
- CPU Intel i5-14600K: TDP ~180W
- GPU RTX 4070: TDP ~200W
- Dự phòng: ~100W
- **Tổng cộng cần PSU: ~480W → Chọn PSU 550W-650W**

> Mẹo: Luôn chọn PSU cao hơn 20-30% so với TDP tính được để đảm bảo hiệu suất và tuổi thọ.', 1),
    (lesson_id, 'Chuẩn 80 Plus', 'text', NULL,
'**80 Plus** là chứng nhận hiệu suất của nguồn điện:

| Hạng | Hiệu suất | Giá thành | Phù hợp |
|------|----------|-----------|---------|
| White | < 80% | Rẻ nhất | PC văn phòng |
| Bronze | 82-85% | Phổ thông | PC tầm trung |
| Gold | 87-90% | Tốt | PC gaming/workstation |
| Platinum | 89-92% | Cao | Server/Workstation |
| Titanium | 90-96% | Cao nhất | Chuyên nghiệp |

> Khuyến nghị: Chọn PSU 80 Plus Gold cho đa số người dùng - cân bằng giữa giá và hiệu suất.', 2),
    (lesson_id, 'Cách chọn nguồn phù hợp', 'text', NULL,
'Khi chọn PSU cần quan tâm:

1. **Công suất (W)**: Tính theo TDP + dư 20-30%
2. **Chuẩn 80 Plus**: Gold được khuyến nghị
3. **Dây modular**: Full modular dễ quản lý dây nhất
4. **Đầu cắm**: Đủ đầu cắm cho GPU (6+2 pin PCIe), CPU (4+4 pin EPS), Mainboard (24 pin ATX)
5. **Thương hiệu**: Corsair, Seasonic, EVGA, Cooler Master, FSP
6. **Bảo hành**: Nên chọn nguồn có bảo hành 5-10 năm

> Cảnh báo: KHÔNG bao giờ tiết kiệm trên PSU! Nguồn kém chất lượng có thể cháy nổ, hỏng toàn bộ linh kiện!', 3);

  -- ========== BÀI 8: TRẢ PHÍ - Hệ thống làm mát ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'Hệ thống Làm mát - Tản nhiệt',
    'Tản nhiệt khí, tản nhiệt nước AIO và custom loop. Cách chọn giải pháp làm mát phù hợp cho từng cấu hình.',
    'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&auto=format&fit=crop',
    true, 'Phần cứng - Làm mát', 25)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'Tại sao cần tản nhiệt?', 'text', NULL,
'Hệ thống làm mát trên máy tính để bàn đảm nhiệm vai trò quan trọng trong việc duy trì nhiệt độ phù hợp cho các linh kiện như CPU và GPU, giúp máy hoạt động ổn định và tránh hư hỏng do quá nhiệt.

Thông thường, CPU được làm mát bằng một bộ tản nhiệt gồm heatsink bằng nhôm hoặc đồng kết hợp với quạt làm mát, hoặc hệ thống tản nhiệt nước hiệu quả hơn cho những dòng cao cấp. GPU cũng được trang bị bộ tản nhiệt riêng với quạt hoặc giải pháp làm mát tương tự, đáp ứng lượng nhiệt sinh ra trong quá trình xử lý đồ họa nặng.

Bên cạnh đó, thùng máy tính để bàn còn có nhiều quạt tản nhiệt đặt ở các vị trí như mặt trước, mặt sau hoặc bên hông để tạo luồng khí lưu thông, đẩy không khí nóng ra ngoài và hút không khí mát vào.

(Nguồn: Thế giới di động)', 0),
    (lesson_id, 'Các loại tản nhiệt', 'video', 'https://www.youtube.com/watch?v=1GvT0U7I3gA', NULL, 1),
    (lesson_id, 'Chọn tản nhiệt phù hợp', 'text', NULL,
'| Loại | Hiệu quả | Giá | Độ ồn | Phù hợp |
|------|---------|-----|-------|---------|
| **Air (khí)** | Trung bình | Thấp (~300k-1.5tr) | Trung bình | CPU tầm trung, ngân sách thấp |
| **AIO (nước)** | Cao | Trung bình (~1.5-5tr) | Thấp | CPU cao cấp, gaming |
| **Custom Loop** | Rất cao | Cao (~5-20tr+) | Rất thấp | Workstation, đam mê |

> Lưu ý: Kiểm tra chiều cao tản nhiệt CPU có vừa với Case không! Air cooler phổ biến cao 150-165mm, Case Mid Tower thường hỗ trợ tối đa ~160mm.', 2);

  -- ========== BÀI 9: TRẢ PHÍ - Thực hành Build PC ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'Thực hành: Build PC Hoàn chỉnh',
    'Hướng dẫn từng bước lắp ráp một PC hoàn chỉnh: từ chuẩn bị linh kiện, lắp đặt, đi dây đến bật máy lần đầu.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop',
    true, 'Thực hành', 45)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'Chuẩn bị linh kiện', 'text', NULL,
'Trước khi bắt đầu, hãy đảm bảo bạn có đầy đủ:

**Linh kiện:**
- CPU, Mainboard, RAM, GPU, SSD/HDD, PSU, Case
- Tản nhiệt CPU (kèm keo tản nhiệt nếu dùng air cooler rời)

**Dụng cụ:**
- Tua vít 4 cạnh (Phillips #2)
- Dây buộc cáp (cable tie)
- Nhíp hoặc kềm nhỏ
- Vòng đeo chống tĩnh điện (ESD wrist strap) - *khuyến nghị*

**Môi trường:**
- Bề mặt phẳng, sạch, khô ráo
- Không thảm len/lông thú (dễ gây tĩnh điện)
- Đủ ánh sáng', 0),
    (lesson_id, 'Quy trình lắp ráp (8 bước)', 'text', NULL,
'**Bước 1: Lắp CPU vào Mainboard**
- Mở khóa socket, căn chỉnh dấu tam giác trên CPU
- Đặt CPU nhẹ nhàng, không dùng lực - nó sẽ tự khớp
- Đóng khóa socket

**Bước 2: Lắp RAM**
- Mở khóa khe RAM, căn chỉnh khuyết trên thanh RAM
- Lắp vào khe A2 và B2 (khe 2 và 4) cho Dual Channel
- Ấn đều đến khi nghe "tách"

**Bước 3: Lắp SSD NVMe**
- Cắm SSD vào khe M.2 trên mainboard
- Vít giữ SSD lại

**Bước 4: Lắp tản nhiệt CPU**
- Bôi keo tản nhiệt (size hạt đậu)
- Gắn tản nhiệt và cố định

**Bước 5: Lắp Mainboard vào Case**
- Đặt I/O shield vào case trước
- Vít mainboard vào standoff

**Bước 6: Lắp PSU và đi dây**
- Đặt PSU vào case, vít cố định
- Đi dây 24-pin, CPU 8-pin, PCIe, SATA

**Bước 7: Lắp GPU**
- Mở khe PCIe, cắm GPU, vít cố định
- Cắm dây nguồn PCIe cho GPU

**Bước 8: Cable Management**
- Buộc gọn dây, tạo luồng khí thông thoáng
- Kiểm tra tất cả kết nối', 1),
    (lesson_id, 'Lần đầu bật máy', 'video', 'https://www.youtube.com/watch?v=7X8eH3rF5HQ', NULL, 2),
    (lesson_id, 'Checklist hoàn thiện', 'text', NULL,
'**Trước khi bật máy:**
- [ ] Đã cắm dây nguồn 24-pin Mainboard?
- [ ] Đã cắm dây CPU 8-pin (góc trên bên trái)?
- [ ] Đã cắm dây PCIe cho GPU?
- [ ] RAM đã nghe "tách"?
- [ ] CPU đã khóa?
- [ ] Quạt tản nhiệt đã cắm vào header CPU_FAN?
- [ ] Công tắc nguồn case đã cắm đúng chân?

**Sau khi bật máy:**
- [ ] Vào BIOS/UEFI: nhấn Del/F2 ngay khi khởi động
- [ ] Kiểm tra nhận đủ RAM, CPU, SSD
- [ ] Cài đặt Windows từ USB
- [ ] Cài driver: Chipset, GPU, LAN, Audio
- [ ] Chạy benchmark kiểm tra ổn định', 3);

  -- ========== BÀI 10: TRẢ PHÍ - Chuẩn đoán lỗi ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'Chuẩn đoán & Sửa lỗi Phần cứng',
    'Các lỗi thường gặp khi build PC: không boot, màn hình đen, reset liên tục, và cách khắc phục từng bước.',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
    true, 'Thực hành', 40)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'Lỗi thường gặp và cách xử lý', 'text', NULL,
'| Triệu chứng | Nguyên nhân | Cách xử lý |
|-------------|------------|------------|
| **Không lên nguồn** | PSU chưa bật/ dây chưa cắm | Kiểm tra công tắc PSU, dây 24-pin, dây front panel |
| **Màn hình đen** | GPU chưa cắm nguồn/ cáp màn hình sai | Kiểm tra dây PCIe, cắm cáp vào GPU (không phải Mainboard) |
| **Reset liên tục** | RAM chưa đúng khe/ quá nhiệt | Lắp lại RAM, kiểm tra tản nhiệt CPU |
| **Beep code** | Lỗi phần cứng | Tra mã beep theo hãng mainboard (AMI/Award/Phoenix) |
| **Không vào Windows** | Lỗi ổ cứng/ boot order | Vào BIOS, kiểm tra boot order và nhận ổ cứng |', 0),
    (lesson_id, 'Xử lý lỗi bằng phương pháp loại trừ', 'text', NULL,
'**Quy trình chuẩn đoán: Minimum Boot**

1. **Rút hết linh kiện không cần thiết** (chỉ giữ CPU + 1 thanh RAM + PSU)
2. **Bật máy**: Nếu có hình BIOS → từ từ gắn thêm từng linh kiện
3. **Nếu không có hình**: 
   - Kiểm tra lại CPU socket (có cong chân không?)
   - Thử thanh RAM kia (nếu có 2 thanh)
   - Thử mainboard khác nếu có

> Mẹo: Card debug (POST card) hoặc loa beep speaker trên mainboard rất hữu ích để chuẩn đoán nhanh.', 1),
    (lesson_id, 'Tool chuẩn đoán phần mềm', 'text', NULL,
'**Công cụ phần mềm hữu ích để kiểm tra ổn định hệ thống:**

1. **CPU-Z / HWMonitor**: Kiểm tra thông số, nhiệt độ, điện áp
2. **Cinebench / Geekbench**: Benchmark CPU
3. **FurMark / 3DMark**: Benchmark GPU, kiểm tra nhiệt độ GPU
4. **MemTest86**: Kiểm tra lỗi RAM (chạy từ USB boot)
5. **CrystalDiskInfo**: Kiểm tra sức khỏe ổ cứng SSD/HDD
6. **OCCT**: Stress test toàn hệ thống', 2);

  -- ========== BÀI 11: TRẢ PHÍ - Ngành nghề Hardware ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'Ngành nghề: Kỹ sư Phần cứng & Thiết kế Vi mạch',
    'Tìm hiểu về ngành Kỹ sư phần cứng (Hardware Engineer) và Kỹ sư thiết kế vi mạch (VLSI/IC Design).',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop',
    true, 'Định hướng nghề nghiệp', 35)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'Kỹ sư Phần cứng (Hardware Engineer)', 'text', NULL,
'**Kỹ sư Phần cứng (Hardware Engineer)** là người thiết kế bo mạch điện tử, nghiên cứu và phát triển linh kiện máy tính, vi xử lý.

**Công việc chính:**
- Thiết kế và phát triển các bo mạch chủ (PCB)
- Kiểm tra và đánh giá linh kiện phần cứng
- Tối ưu hiệu năng và công suất tiêu thụ
- Phối hợp với kỹ sư firmware và phần mềm
- Nghiên cứu công nghệ mới (chip, bus, kết nối...)

**Kỹ năng cần có:**
- Kiến thức vững về điện tử và vi mạch
- Kỹ năng sử dụng phần mềm thiết kế PCB (Altium, Eagle, KiCad)
- Hiểu biết về tín hiệu số và tương tự
- Kỹ năng giải quyết vấn đề và tư duy logic', 0),
    (lesson_id, 'Kỹ sư Thiết kế Vi mạch (VLSI/IC Design)', 'text', NULL,
'**Kỹ sư Thiết kế Vi mạch (VLSI/IC Design Engineer)** là người thiết kế các chip bán dẫn và mạch tích hợp thu nhỏ.

**Công việc chính:**
- Thiết kế vi mạch ở cấp độ RTL (Register Transfer Level) dùng Verilog/VHDL
- Tối ưu hóa diện tích, công suất và hiệu năng (PPA)
- Mô phỏng và kiểm tra hoạt động của chip
- Phối hợp với team fabrication (sản xuất chip)
- Làm việc với kiến trúc ISA như ARM, x86, RISC-V

**Kỹ năng cần có:**
- Thành thạo Verilog/VHDL/SystemVerilog
- Kiến thức về Digital Design, Computer Architecture
- Sử dụng công cụ EDA (Synopsys, Cadence, Mentor)
- Tư duy toán học và logic mạnh

> Đây là ngành có mức lương cao nhất trong lĩnh vực phần cứng tại Việt Nam và quốc tế.', 1),
    (lesson_id, 'Lộ trình học tập để trở thành Kỹ sư Phần cứng', 'text', NULL,
'**Nếu bạn muốn theo đuổi ngành này, hãy bắt đầu từ hôm nay:**

Lớp 10-12: Học tốt Toán, Lý, Tin → Tham gia các cuộc thi KHKT, Robotics

Đại học (4-5 năm):
- Ngành: Điện tử Viễn thông, Kỹ thuật Máy tính, Khoa học Máy tính
- Các trường tốt: ĐH Bách Khoa HN, ĐH Bách Khoa TP.HCM, ĐH Công nghệ - ĐHQGHN, ĐH FPT

Sau đại học:
- Chứng chỉ: IC Design Fundamentals (Synopsys), VLSI Design (Cadence)
- Thạc sĩ: Vi mạch bán dẫn (chương trình hợp tác với nước ngoài)

**Cơ hội việc làm tại Việt Nam:**
- Intel, Samsung, Renesas, Synopsys (thiết kế vi mạch)
- Viettel, VNPT (nghiên cứu phát triển)
- Các công ty start-up về chip bán dẫn đang phát triển mạnh', 2);

  -- ========== BÀI 12: TRẢ PHÍ - IT Support + Cert ==========
  INSERT INTO public.lessons (id, course_id, teacher_id, title, description, thumbnail_url, is_published, subject, estimated_minutes)
  VALUES (gen_random_uuid(), course_id, teacher_id,
    'Ngành nghề IT Hardware/Support & Chứng chỉ Cuối khóa',
    'Chuyên viên IT phần cứng-mạng: lắp ráp, bảo trì, sửa chữa. Tổng kết khóa học và cấp chứng chỉ.',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop',
    true, 'Định hướng nghề nghiệp', 40)
  RETURNING id INTO lesson_id;

  INSERT INTO public.lesson_sections (lesson_id, title, content_type, content_url, content_body, order_index) VALUES
    (lesson_id, 'Chuyên viên IT Phần cứng - Mạng (IT Hardware/Support)', 'text', NULL,
'**Chuyên viên IT phần cứng - mạng (IT Hardware/Support)** là người lắp ráp, bảo trì, sửa chữa và xử lý sự cố thiết bị máy tính, hệ thống mạng cho doanh nghiệp.

**Công việc chính:**
- Lắp ráp, cài đặt và cấu hình máy tính cho nhân viên
- Bảo trì, nâng cấp và sửa chữa phần cứng định kỳ
- Xử lý sự cố mạng LAN, Wi-Fi, máy in, thiết bị văn phòng
- Quản lý tài sản CNTT (inventory management)
- Hỗ trợ người dùng cuối (helpdesk)

**Kỹ năng cần có:**
- Kiến thức vững về lắp ráp và sửa chữa PC (từ khóa học này!)
- Hiểu biết về mạng cơ bản (TCP/IP, LAN, VLAN)
- Kỹ năng giao tiếp và giải quyết vấn đề nhanh
- Kiên nhẫn, tỉ mỉ và có trách nhiệm', 0),
    (lesson_id, 'So sánh các ngành nghề', 'text', NULL,
'| Ngành | Mức lương (VNĐ) | Yêu cầu đào tạo | Cơ hội |
|-------|----------------|----------------|--------|
| **Hardware Engineer** | 15-40 triệu/tháng | Đại học CNTT/Điện tử | Intel, Samsung, Start-up chip |
| **VLSI/IC Design** | 20-80 triệu/tháng | Đại học + Chứng chỉ | Synopsys, Renesas, Marvell |
| **IT Hardware/Support** | 8-15 triệu/tháng | Cao đẳng/Đại học | Mọi doanh nghiệp có IT |
| **PC Builder/Gamer** | 10-20 triệu/tháng | Tay nghề + Chứng chỉ | GearVN, Phong Vũ, FPT Shop |

> Tất cả các ngành đều bắt đầu từ kiến thức nền tảng về phần cứng - chính là nội dung khóa học này!', 1),
    (lesson_id, 'Bài kiểm tra cuối khóa', 'quiz', 'quiz_end_course', NULL, 2),
    (lesson_id, 'Tổng kết khóa học', 'text', NULL,
'🎉 **Chúc mừng bạn đã hoàn thành khóa học!**

**Những gì bạn đã học được:**
✅ Khái niệm và phân loại phần cứng máy tính
✅ CPU - Bộ xử lý trung tâm, socket, xung nhịp
✅ Mainboard - Chipset, form factor, socket
✅ RAM - DDR4/DDR5, dung lượng, Dual Channel
✅ Ổ cứng - HDD vs SSD, NVMe
✅ GPU - Card đồ họa, VRAM, cách chọn
✅ PSU - Tính TDP, 80 Plus, chọn nguồn
✅ Hệ thống làm mát - Air vs AIO vs Custom
✅ Kỹ năng build PC hoàn chỉnh
✅ Chuẩn đoán và sửa lỗi phần cứng
✅ Định hướng ngành nghề phần cứng

**Bước tiếp theo:**
📥 Tải chứng chỉ hoàn thành khóa học (PDF + QR)
🛠️ Thực hành trên PC Builder Lab
📚 Khám phá các khóa học nâng cao

*"Kiến thức phần cứng là nền tảng cho mọi công nghệ!"*', 3);

END;
$$;

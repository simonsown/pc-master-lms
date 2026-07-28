export const KNOWLEDGE_BASE = [
  {
    topic: "CPU",
    content: `CPU (Central Processing Unit) là bộ não của máy tính. 
    Các loại socket phổ biến: Intel dùng LGA (như LGA1700), AMD dùng AM4 hoặc AM5.
    Cores (nhân) và Threads (luồng): Càng nhiều nhân luồng thì xử lý đa nhiệm càng tốt.
    Xung nhịp (Clock speed): Tính bằng GHz, quyết định tốc độ xử lý của từng nhân.
    TDP (Thermal Design Power): Chỉ số thoát nhiệt, giúp chọn tản nhiệt phù hợp.
    Cache: Bộ nhớ đệm giúp CPU truy cập dữ liệu nhanh hơn.`
  },
  {
    topic: "RAM",
    content: `RAM (Random Access Memory) là bộ nhớ tạm thời của hệ thống.
    DDR4 vs DDR5: DDR5 có tốc độ (bus) cao hơn và điện áp thấp hơn DDR4.
    Dung lượng: Phổ biến là 8GB, 16GB, 32GB. 16GB là mức tiêu chuẩn cho gaming hiện nay.
    Dual Channel: Cắm 2 thanh RAM giúp băng thông tăng gấp đôi, cải thiện hiệu năng đáng kể.
    Bus RAM: Tốc độ truyền tải dữ liệu, ví dụ 3200MHz (DDR4) hoặc 5600MHz (DDR5).`
  },
  {
    topic: "GPU",
    content: `GPU (Graphics Processing Unit) xử lý hình ảnh và đồ họa.
    VRAM: Bộ nhớ video, ví dụ 8GB, 12GB GDDR6. Quan trọng khi chơi game ở độ phân giải cao (4K).
    CUDA Cores (NVIDIA) hoặc Stream Processors (AMD): Số lượng nhân xử lý đồ họa.
    Kết nối: Hầu hết dùng khe cắm PCIe x16 trên mainboard.
    TDP: GPU thường là linh kiện ngốn điện nhất trong máy tính.`
  },
  {
    topic: "PSU",
    content: `PSU (Power Supply Unit) là bộ nguồn cấp điện cho toàn bộ máy tính.
    Wattage: Công suất định mức (ví dụ 500W, 650W, 750W). Phải lớn hơn tổng công suất linh kiện.
    Hiệu suất 80 Plus: Các chuẩn White, Bronze, Silver, Gold, Platinum, Titanium. Chuẩn càng cao càng tiết kiệm điện.
    Modular: Nguồn Full-Modular cho phép tháo rời tất cả dây cáp để đi dây gọn gàng.`
  },
  {
    topic: "SSD",
    content: `SSD (Solid State Drive) là ổ cứng thể rắn, tốc độ cao hơn HDD nhiều lần.
    NVMe vs SATA: SSD NVMe (M.2) có tốc độ cực nhanh (lên đến 7000MB/s), SSD SATA giới hạn ở 550MB/s.
    Cổng kết nối: M.2 (gắn trực tiếp lên mainboard) hoặc SATA (dùng dây cáp).
    Tốc độ đọc ghi: Yếu tố quyết định thời gian khởi động Win và mở ứng dụng.`
  },
  {
    topic: "Mainboard",
    content: `Mainboard (Bo mạch chủ) kết nối mọi linh kiện lại với nhau.
    Chipset: Ví dụ H610 (phổ thông), B760 (tầm trung), Z790 (cao cấp cho Intel). Quyết định khả năng ép xung.
    Form Factor: ATX (lớn), Micro-ATX (vừa), Mini-ITX (nhỏ).
    Slot: Khe cắm RAM (2 hoặc 4 khe), khe PCIe cho GPU, và các khe cắm SSD M.2.`
  },
  {
    topic: "CASE",
    content: `Case (Vỏ máy tính) bảo vệ linh kiện và quyết định tính thẩm mỹ.
    Kích thước (Form Factor): Full Tower (lớn nhất), Mid Tower (phổ biến nhất), Mini-ITX (nhỏ gọn).
    Airflow: Luồng không khí trong máy, quan trọng để giữ linh kiện mát mẻ.
    Kính cường lực (Tempered Glass): Giúp khoe linh kiện bên trong và đèn LED RGB.`
  },
  {
    topic: "COOLING",
    content: `Hệ thống làm mát giúp CPU và GPU không bị quá nhiệt.
    Tản nhiệt khí (Air Cooling): Dùng tháp tản nhiệt và quạt, bền bỉ và giá rẻ.
    Tản nhiệt nước (AIO/Liquid Cooling): Dùng dung dịch làm mát và radiator, hiệu quả cao và đẹp mắt.
    Quạt Case (Case Fans): Thường có kích thước 120mm hoặc 140mm, lắp theo hướng hút vào (Intake) và thổi ra (Exhaust).`
  },
  {
    topic: "MONITOR",
    content: `Màn hình hiển thị hình ảnh từ máy tính.
    Độ phân giải: Full HD (1080p), 2K (1440p), 4K (2160p).
    Tần số quét (Refresh Rate): Tính bằng Hz (60Hz, 144Hz, 240Hz). Càng cao thì hình ảnh chuyển động càng mượt.
    Tấm nền (Panel Type): IPS (màu đẹp, góc nhìn rộng), VA (độ tương phản cao), TN (tốc độ phản hồi nhanh nhưng màu sắc kém hơn).`
  },
  {
    topic: "SLIDE_CHAPTER1_HARDWARE",
    content: `Giáo trình Chương 1 - Giới thiệu về Phần cứng máy tính PC:
    1. Quan hệ Hardware & Software: Hardware là các thiết bị vật lý hữu hình, không tự chạy được nếu thiếu Software và Driver.
    2. 4 Chức năng cơ bản: Nhập (Input), Xử lý (Processing / CPU), Lưu trữ (Storage / RAM/HDD/SSD), Xuất (Output).
    3. Phương thức giao tiếp: Ngắt (IRQ), DMA (Direct Memory Access), Driver điều khiển và Nguồn điện PSU.
    4. Bo mạch hệ thống (Systemboard / Mainboard): Chứa CPU Socket, Chipset (Northbridge/Southbridge), RAM slots (SIMM, DIMM, RIMM), BIOS ROM, CMOS setup chip & pin CMOS, Jumper & DIP switches.
    5. Bộ nhớ chính vs Phụ: RAM là bộ nhớ chính tạm thời (tự xóa khi tắt máy), HDD/SSD là bộ nhớ phụ cố định.
    6. Hệ thống Bus & Khe cắm mở rộng: Data Bus truyền dữ liệu, System Clock đồng bộ xung nhịp. Khe cắm PCI, AGP, ISA dùng cắm các Card rời (Sound card, Video card, NIC, Modem).`
  },
  {
    topic: "IC3_SPARK_HARDWARE",
    content: `Kiến thức chuẩn quốc tế IC3 Spark GS5 - IT Digital Literacy:
    1. Phân loại máy tính: Máy chủ (Servers: Tower, Rack, Blade), Máy tính bàn (Desktop PC / Mac OS X), Máy tính xách tay (Laptop/Notebook), Chromebooks (Chrome OS & Đám mây), Máy tính bảng (Tablets), Điện thoại thông minh (Smartphones).
    2. Quy trình hoạt động RAM: Ổ đĩa cứng HDD/SSD ➔ Nạp ứng dụng vào RAM ➔ CPU xử lý ➔ Xuất màn hình.
    3. Lưu trữ Cục bộ vs Đám mây: Cục bộ (HDD, SSD, USB, Thẻ SD) vs Đám mây (Google Drive, OneDrive, iCloud, Dropbox, NAS).
    4. Chỉ số kỹ thuật: Dung lượng lưu trữ (Bytes, GB, TB), Tần số xung nhịp CPU (GHz), Tần số quét màn hình (Hz / FPS), Băng thông truyền dữ liệu (Bandwidth).`
  },
  {
    topic: "FPT_POLYTECHNIC_HISTORY",
    content: `Giáo trình Tổng quan Phần cứng FPT Polytechnic:
    1. Các thế hệ máy tính:
       - Thế hệ 0 (1642-1940): Máy tính cơ học Pascaline của Blaise Pascal.
       - Thế hệ I (1940-1956): Đèn chân không (Máy ENIAC 1943, máy IAS dựa trên kiến trúc Von Neumann).
       - Thế hệ II (1956-1963): Transistor bóng bán dẫn (Bell Labs 1947 bởi Bardeen, Brattain, Shockley).
       - Thế hệ III (1964-1971): Mạch tích hợp IC (Integrated Circuit - IBM System/360, IBM 5100).
       - Thế hệ IV (1971-nay): Mạch tích hợp mật độ siêu cao VLSI (IBM PC 5150 năm 1981 với Intel 8088 & MS-DOS).
    2. Xu hướng tương lai: Tiến trình sản xuất vi chip nhỏ (22nm, 14nm, 10nm, 7nm), CPU đa nhân (Multi-core), Máy tính lượng tử (Quantum Computing).
    3. Hệ thống Bus chuẩn Von Neumann: Control Bus (lệnh), Address Bus (địa chỉ ô nhớ), Data Bus (dữ liệu).`
  }
];

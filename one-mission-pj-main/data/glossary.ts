export const GLOSSARY: Record<string, string> = {
  'CPU': 'Bộ vi xử lý trung tâm (Central Processing Unit) – "bộ não" của máy tính, thực hiện các tính toán và điều khiển mọi hoạt động.',
  'GPU': 'Bộ xử lý đồ họa (Graphics Processing Unit) – chuyên xử lý hình ảnh, render đồ họa game, hỗ trợ AI và tính toán song song.',
  'RAM': 'Bộ nhớ truy cập ngẫu nhiên (Random Access Memory) – lưu dữ liệu tạm thời để CPU truy xuất nhanh, mất khi tắt máy.',
  'VRAM': 'Bộ nhớ video trên card đồ họa – lưu texture, frame buffer, dữ liệu đồ họa để GPU xử lý.',
  'SSD': 'Ổ cứng thể rắn (Solid State Drive) – lưu trữ dữ liệu với tốc độ đọc ghi nhanh hơn HDD gấp nhiều lần, không có đĩa quay.',
  'NVMe': 'Giao thức kết nối SSD qua PCIe, tốc độ cực nhanh (7000 MB/s), nhỏ gọn dạng M.2.',
  'HDD': 'Ổ cứng từ tính (Hard Disk Drive) – lưu trữ trên đĩa quay từ, dung lượng lớn giá rẻ nhưng chậm hơn SSD.',
  'PSU': 'Bộ nguồn máy tính (Power Supply Unit) – cấp điện cho toàn bộ linh kiện, quan trọng về công suất và hiệu suất.',
  'TDP': 'Công suất tỏa nhiệt thiết kế (Thermal Design Power) – chỉ số nhiệt lượng tối đa mà linh kiện tỏa ra, đo bằng Watt.',
  'AIO': 'Tản nhiệt nước all-in-one – hệ thống tản nhiệt bằng chất lỏng kín, gồm pump, radiator và quạt, dễ lắp đặt.',
  'BIOS': 'Hệ thống đầu vào/đầu ra cơ bản – firmware khởi động máy, kiểm tra phần cứng (POST) và nạp hệ điều hành.',
  'UEFI': 'Giao diện firmware mở rộng – thay thế BIOS, giao diện đồ họa, hỗ trợ ổ đĩa lớn hơn 2TB và Secure Boot.',
  'POST': 'Power-On Self-Test – quá trình tự kiểm tra phần cứng khi bật máy trước khi nạp hệ điều hành.',
  'VRM': 'Module điều chỉnh điện áp (Voltage Regulator Module) – trên mainboard, cấp điện ổn định cho CPU.',
  'PCIe': 'Peripheral Component Interconnect Express – chuẩn kết nối tốc độ cao cho GPU, SSD NVMe, card mở rộng.',
  'SATA': 'Serial ATA – chuẩn kết nối ổ cứng HDD/SSD và ổ quang, băng thông tối đa 6 Gbps (SATA III).',
  'M.2': 'Chuẩn kết nối SSD NVMe nhỏ gọn, cắm trực tiếp lên mainboard, tốc độ cao hơn SATA nhiều lần.',
  'DDR': 'Double Data Rate – công nghệ RAM truyền dữ liệu 2 lần mỗi xung nhịp: DDR4, DDR5.',
  'XMP': 'Extreme Memory Profile – hồ sơ ép xung RAM tự động của Intel, giúp chạy RAM ở tốc độ cao hơn mặc định.',
  'CAS': 'Column Address Strobe (CAS Latency) – độ trễ của RAM, số càng thấp càng nhanh.',
  'DLSS': 'Deep Learning Super Sampling – công nghệ NVIDIA dùng AI nâng độ phân giải, tăng FPS mà giữ chất lượng.',
  'FSR': 'FidelityFX Super Resolution – công nghệ AMD nâng độ phân giải, tương tự DLSS, chạy được trên nhiều GPU.',
  'RTX': 'Dòng card đồ họa NVIDIA hỗ trợ Ray Tracing và AI (Tensor Core).',
  'FPS': 'Số khung hình trên giây (Frames Per Second) – chỉ số đo độ mượt của game, càng cao càng mượt.',
  'LED': 'Light Emitting Diode – đèn báo hiệu hoặc trang trí trên linh kiện PC.',
  'RGB': 'Đèn LED đỏ-lục-lam (Red-Green-Blue) – có thể tùy chỉnh hàng triệu màu sắc, phổ biến trên quạt, mainboard, RAM.',
  'ARGB': 'Addressable RGB – đèn LED có thể điều khiển từng đèn riêng lẻ, tạo hiệu ứng phức tạp hơn RGB thường.',
  'PWM': 'Pulse Width Modulation – công nghệ điều chỉnh tốc độ quạt bằng xung điện, quạt chạy êm và tiết kiệm điện.',
  'CMOS': 'Complementary Metal-Oxide-Semiconductor – pin nhỏ trên mainboard giữ cài đặt BIOS khi tắt máy.',
  'Socket': 'Đế cắm CPU trên mainboard, mỗi dòng CPU có socket riêng (LGA1700 cho Intel, AM5 cho AMD).',
  'Chipset': 'Con chip điều khiển giao tiếp giữa CPU và các linh kiện khác trên mainboard (Z790, B650, v.v.).',
  'ATX': 'Chuẩn mainboard phổ biến nhất, kích thước 305x244mm, nhiều khe mở rộng và cổng kết nối.',
  'ITX': 'Mini-ITX – chuẩn mainboard nhỏ gọn 170x170mm, dùng cho PC nhỏ, ít khe mở rộng.',
  'Ethernet': 'Công nghệ mạng có dây, dùng cáp RJ45, phổ biến chuẩn Gigabit Ethernet (1 Gbps).',
  'Thunderbolt': 'Chuẩn kết nối tốc độ cao 40 Gbps của Intel, tích hợp dữ liệu, video và sạc qua 1 cổng USB-C.',
  'HDMI': 'High-Definition Multimedia Interface – cổng xuất hình ảnh + âm thanh, HDMI 2.1 hỗ trợ 8K 60Hz.',
  'DisplayPort': 'Cổng xuất hình ảnh chuyên dụng cho PC, băng thông cao hơn HDMI, hỗ trợ tần số quét cao.',
  'TPM': 'Trusted Platform Module – chip bảo mật trên mainboard, yêu cầu cho Windows 11.',
  'ECC': 'Error-Correcting Code – RAM có khả năng tự sửa lỗi, dùng trong máy chủ/server.',
  'RAID': 'Redundant Array of Independent Disks – ghép nhiều ổ cứng để tăng tốc hoặc dự phòng dữ liệu.',
  'NAS': 'Network Attached Storage – thiết bị lưu trữ mạng, nhiều ổ cứng, truy cập qua mạng LAN.',
  'Hyper-Threading': 'Công nghệ của Intel biến 1 nhân vật lý thành 2 luồng xử lý, tăng hiệu năng đa nhiệm.',
  'Ray Tracing': 'Công nghệ mô phỏng ánh sáng thực tế (phản chiếu, đổ bóng, khúc xạ) trong game, yêu cầu GPU mạnh.',
  'Overclocking': 'Ép xung – chạy linh kiện ở xung nhịp cao hơn mặc định để tăng hiệu năng, cần tản nhiệt tốt.',
  'Undervolting': 'Giảm điện áp linh kiện để giảm nhiệt độ và tiết kiệm điện mà vẫn giữ hiệu năng.',
  'Benchmark': 'Phần mềm đo hiệu năng (Cinebench, 3DMark, CrystalDiskMark) để đánh giá và so sánh linh kiện.',
  'Thermal Paste': 'Kem tản nhiệt – bôi giữa CPU và tản nhiệt để truyền nhiệt hiệu quả hơn không khí.',
  'Radiator': 'Bộ tản nhiệt dạng lưới trong hệ thống tản nước, tỏa nhiệt từ chất lỏng ra không khí qua quạt.',
}

export function findTerms(text: string): string[] {
  const terms: string[] = []
  const sorted = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length)
  const lower = text.toLowerCase()
  for (const term of sorted) {
    if (lower.includes(term.toLowerCase())) {
      terms.push(term)
    }
  }
  return terms
}

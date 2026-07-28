export const GLOSSARY: Record<string, { definition: string; fullTitle?: string; category?: string }> = {
  'CPU': {
    fullTitle: 'Central Processing Unit - Bộ Vi Xử Lý Trung Tâm',
    category: 'Linh kiện cốt lõi',
    definition: '"Bộ não" của máy tính, có nhiệm vụ thực hiện các lệnh của chương trình, tính toán logic và điều khiển toàn bộ hoạt động của hệ thống PC.'
  },
  'GPU': {
    fullTitle: 'Graphics Processing Unit - Bộ Xử Lý Đồ Họa',
    category: 'Linh kiện cốt lõi',
    definition: 'Chip chuyên dụng xử lý hình ảnh, render đồ họa 2D/3D, hiển thị video, chơi game và hỗ trợ tính toán song song cho AI/Machine Learning.'
  },
  'RAM': {
    fullTitle: 'Random Access Memory - Bộ Nhớ Truy Cập Ngẫu Nhiên',
    category: 'Bộ nhớ',
    definition: 'Bộ nhớ tạm thời tốc độ cao giúp CPU truy xuất dữ liệu cực nhanh khi các ứng dụng đang chạy. Dữ liệu trong RAM sẽ bị xóa sạch khi tắt máy.'
  },
  'VRAM': {
    fullTitle: 'Video Random Access Memory - Bộ Nhớ Đồ Họa',
    category: 'Card màn hình',
    definition: 'Bộ nhớ chuyên dụng tích hợp trên Card đồ họa (GPU), dùng để lưu trữ hình ảnh, texture 3D, frame buffer giúp GPU xử lý mà không bị nghẽn.'
  },
  'SSD': {
    fullTitle: 'Solid State Drive - Ổ Cứng Thể Rắn',
    category: 'Lưu trữ',
    definition: 'Ổ đĩa lưu trữ dữ liệu sử dụng chip nhớ Flash NAND, không có bộ phận chuyển động cơ học, mang lại tốc độ đọc/ghi cực nhanh và chống sốc tốt.'
  },
  'NVMe': {
    fullTitle: 'Non-Volatile Memory Express',
    category: 'Chuẩn giao tiếp SSD',
    definition: 'Giao thức kết nối SSD tốc độ cao trực tiếp qua làn PCIe, đạt tốc độ từ 3.500 MB/s tới hơn 7.000 MB/s, nhanh hơn gấp nhiều lần SSD SATA truyền thống.'
  },
  'HDD': {
    fullTitle: 'Hard Disk Drive - Ổ Cứng Từ Tính',
    category: 'Lưu trữ',
    definition: 'Thiết bị lưu trữ dữ liệu truyền thống dùng các đĩa từ quay cơ học (5400/7200 RPM) và đầu đọc/ghi từ. Có dung lượng lớn, giá thành thấp nhưng tốc độ chậm.'
  },
  'PSU': {
    fullTitle: 'Power Supply Unit - Bộ Nguồn Máy Tính',
    category: 'Cấp điện',
    definition: 'Linh kiện biến đổi dòng điện xoay chiều (AC 220V) thành dòng điện một chiều (DC 3.3V, 5V, 12V) ổn định để cung cấp điện năng cho toàn bộ hệ thống PC.'
  },
  'TDP': {
    fullTitle: 'Thermal Design Power - Công Suất Tỏa Nhiệt Thiết Kế',
    category: 'Thông số kỹ thuật',
    definition: 'Mức tiêu thụ điện và tỏa nhiệt tối đa mà linh kiện (CPU/GPU) phát ra khi hoạt động ở tải mặc định, tính bằng Watt (W), dùng để chọn tản nhiệt phù hợp.'
  },
  'AIO': {
    fullTitle: 'All-In-One Liquid Cooler - Tản Nhiệt Nước Khép Kín',
    category: 'Tản nhiệt',
    definition: 'Hệ thống tản nhiệt bằng chất lỏng được lắp sẵn hoàn chỉnh gồm Block nước, Bơm (Pump), Ống dẫn, Két nước (Radiator) và Quạt, giúp làm mát CPU tối ưu.'
  },
  'BIOS': {
    fullTitle: 'Basic Input/Output System - Hệ Thống Đầu Vào/Đầu Ra Cơ Bản',
    category: 'Firmware',
    definition: 'Chương trình firmware lưu trong chip nhớ ROM/Flash trên Mainboard, có nhiệm vụ kiểm tra phần cứng (POST), khởi động các linh kiện và nạp Hệ Điều Hành.'
  },
  'UEFI': {
    fullTitle: 'Unified Extensible Firmware Interface',
    category: 'Firmware',
    definition: 'Chuẩn giao diện firmware hiện đại thay thế BIOS cũ, hỗ trợ giao diện đồ họa dùng chuột, hỗ trợ ổ cứng lớn hơn 2TB (chuẩn GPT) và tính năng Secure Boot.'
  },
  'POST': {
    fullTitle: 'Power-On Self-Test - Tự Kiểm Tra Khi Bật Máy',
    category: 'Quy trình khởi động',
    definition: 'Quá trình kiểm tra sơ bộ phần cứng (CPU, RAM, Mainboard, GPU, Keyboard) do BIOS/UEFI thực hiện ngay khi bấm nút nguồn máy tính.'
  },
  'VRM': {
    fullTitle: 'Voltage Regulator Module - Mạch Điều Áp Mainboard',
    category: 'Bo mạch chủ',
    definition: 'Hệ thống mạch điện tử trên Mainboard (gồm MOSFET, Choke cuộn cảm, Tụ điện) có nhiệm vụ hạ áp và biến đổi điện nguồn thành dòng điện chính xác cấp cho CPU.'
  },
  'PCIe': {
    fullTitle: 'Peripheral Component Interconnect Express',
    category: 'Chuẩn kết nối',
    definition: 'Giao lộ kết nối tốc độ cao trên bo mạch chủ dùng để cắm Card đồ họa (GPU), SSD NVMe M.2, Card âm thanh và Card mạng với băng thông cực lớn.'
  },
  'SATA': {
    fullTitle: 'Serial Advanced Technology Attachment',
    category: 'Chuẩn kết nối',
    definition: 'Chuẩn kết nối cáp dữ liệu phổ biến giữa Mainboard và ổ cứng HDD/SSD 2.5 inch hoặc ổ đĩa quang, băng thông tối đa 6 Gbps (khoảng 550-600 MB/s).'
  },
  'M.2': {
    fullTitle: 'Next Generation Form Factor (NGFF)',
    category: 'Kích thước linh kiện',
    definition: 'Kích thước khe cắm siêu nhỏ gọn trực tiếp trên Mainboard dành cho ổ cứng SSD NVMe/SATA hoặc card Wifi/Bluetooth.'
  },
  'DDR': {
    fullTitle: 'Double Data Rate - Tốc Độ Dữ Liệu Kép',
    category: 'Bộ nhớ RAM',
    definition: 'Công nghệ truyền dữ liệu RAM 2 lần trong 1 xung nhịp (ví dụ DDR3, DDR4, DDR5), giúp tăng gấp đôi băng thông so với công nghệ SDRAM cũ.'
  },
  'XMP': {
    fullTitle: 'Extreme Memory Profile - Hồ Sơ Ép Xung RAM Intel',
    category: 'Bộ nhớ RAM',
    definition: 'Hồ sơ thiết lập sẵn của nhà sản xuất lưu trên RAM, cho phép bật trong BIOS để RAM chạy đúng bus cao nhất và độ trễ tối ưu.'
  },
  'CAS': {
    fullTitle: 'Column Address Strobe Latency (CL)',
    category: 'Thông số RAM',
    definition: 'Số chu kỳ xung nhịp trễ trước khi RAM phản hồi yêu cầu dữ liệu từ CPU. Chỉ số CAS Latency càng nhỏ thì độ trễ RAM càng thấp.'
  },
  'CMOS': {
    fullTitle: 'Complementary Metal-Oxide-Semiconductor',
    category: 'Bo mạch chủ',
    definition: 'Chip nhớ lưu giữ các thông tin cấu hình BIOS và giờ hệ thống. Được duy trì nguồn điện liên tục bởi 1 viên pin cúc áo CR2032 trên Mainboard.'
  },
  'Socket': {
    fullTitle: 'CPU Socket - Đế Cắm CPU',
    category: 'Bo mạch chủ',
    definition: 'Khung đế cắm vật lý trên Mainboard có các chân tiếp xúc (LGA) hoặc lỗ cắm (PGA) để gắn và cố định vi xử lý CPU.'
  },
  'Chipset': {
    fullTitle: 'Bo Mạch Bộ Chip Điều Khiển Trung Tâm',
    category: 'Bo mạch chủ',
    definition: 'Con chip điều phối mọi luồng dữ liệu giao tiếp giữa CPU với RAM, PCIe, ổ cứng và các thiết bị ngoại vi trên bo mạch chủ (VD: B760, Z790, B650).'
  },
  'Northbridge': {
    fullTitle: 'Northbridge - Cầu Bắc Mainboard',
    category: 'Bo mạch chủ truyền thống',
    definition: 'Con chip trên các mainboard thế hệ cũ chịu trách nhiệm điều khiển giao tiếp tốc độ cao giữa CPU, RAM và Card đồ họa AGP/PCIe.'
  },
  'Southbridge': {
    fullTitle: 'Southbridge - Cầu Nam Mainboard',
    category: 'Bo mạch chủ truyền thống',
    definition: 'Con chip chịu trách nhiệm quản lý các cổng kết nối tốc độ thấp hơn như ổ đĩa SATA/IDE, cổng USB, âm thanh, khe PCI và BIOS.'
  },
  'FDISK': {
    fullTitle: 'Fixed Disk Partitioning Utility',
    category: 'Tiện ích đĩa cứng',
    definition: 'Công cụ dòng lệnh huyền thoại trên hệ điều hành MS-DOS giúp chia ổ cứng thành các phân vùng Primary, Extended và Logical Drive.'
  },
  'Partition': {
    fullTitle: 'Phân Vùng Ổ Đĩa Cứng',
    category: 'Hệ thống tệp',
    definition: 'Việc chia một ổ đĩa vật lý thành nhiều vùng logic riêng biệt (như ổ C:, ổ D:) để cài Hệ điều hành và quản lý dữ liệu hiệu quả.'
  },
  'Ghost': {
    fullTitle: 'Symantec Norton Ghost - Tiện Ích Tải Ảnh Đĩa',
    category: 'Sao lưu & Phôi',
    definition: 'Phần mềm sao lưu và khôi phục toàn bộ phân vùng/ổ cứng thành một file ảnh (.GHO), giúp cài lại Windows và ứng dụng chỉ trong vài phút.'
  },
  'FSB': {
    fullTitle: 'Front Side Bus - Bus Mặt Trước',
    category: 'Bo mạch chủ truyền thống',
    definition: 'Tuyến bus dữ liệu kết nối trực tiếp giữa CPU với chip Cầu Bắc (Northbridge) trên các hệ thống máy tính truyền thống.'
  },
  'AGP': {
    fullTitle: 'Accelerated Graphics Port - Cổng Đồ Họa Tốc Độ Cao',
    category: 'Khe cắm mở rộng',
    definition: 'Chuẩn khe cắm chuyên dụng cho Card đồ họa trước khi chuẩn PCIe ra đời (với các tốc độ AGP 1x, 2x, 4x, 8x).'
  },
  'IDE': {
    fullTitle: 'Integrated Drive Electronics (PATA)',
    category: 'Chuẩn kết nối',
    definition: 'Chuẩn kết nối cáp bẹt 40-pin/80-pin truyền thống dành cho ổ cứng HDD và ổ đĩa quang CD/DVD trước khi có chuẩn SATA.'
  },
  'Jumper': {
    fullTitle: 'Cầu Nối Jumper',
    category: 'Phần cứng Mainboard',
    definition: 'Miếng nhựa chứa lõi kim loại nhỏ dùng để cắm nối các chân pin trên Mainboard nhằm thiết lập cấu hình hardware (như Clear CMOS, Master/Slave).'
  },
  'Overclocking': {
    fullTitle: 'Ép Xung Phần Cứng (OC)',
    category: 'Kỹ thuật nâng cao',
    definition: 'Thao tác điều chỉnh tăng xung nhịp, hệ số nhân và điện áp của CPU, RAM hoặc GPU vượt mức mặc định để tăng hiệu năng tối đa.'
  },
  'Benchmark': {
    fullTitle: 'Đánh Giá Hiệu Năng',
    category: 'Kểm thử phần cứng',
    definition: 'Chạy các bài kiểm tra áp lực (sử dụng phần mềm như Cinebench, 3DMark, FurMark) để đo lường sức mạnh tính toán và độ ổn định của PC.'
  },
  'Thermal Paste': {
    fullTitle: 'Kem Tản Nhiệt CPU/GPU',
    category: 'Tản nhiệt',
    definition: 'Hợp chất dẫn nhiệt bôi vào giữa bề mặt chip CPU/GPU và đế tản nhiệt để lấp đầy các vi khe hở không khí, giúp truyền nhiệt tối ưu.'
  },
  'Master': {
    fullTitle: 'Ổ Cứng Master (Chính)',
    category: 'Chuẩn IDE cũ',
    definition: 'Chế độ thiết lập qua Jumper cho ổ đĩa ưu tiên chính trên tuyến cáp IDE song song.'
  },
  'Slave': {
    fullTitle: 'Ổ Cứng Slave (Phụ)',
    category: 'Chuẩn IDE cũ',
    definition: 'Chế độ thiết lập qua Jumper cho ổ đĩa phụ thứ 2 cùng chia sẻ tuyến cáp IDE với ổ Master.'
  },
  'Beep Code': {
    fullTitle: 'Mã Âm Thanh Báo Lỗi BIOS',
    category: 'Chẩn đoán sự cố',
    definition: 'Các tiếng bíp ngắn/dài phát ra từ loa Speaker nhỏ trên Mainboard khi quá trình POST thất bại, giúp kỹ thuật viên nhận biết linh kiện bị lỗi.'
  }
};

export function findTerms(text: string): string[] {
  const terms: string[] = [];
  const sorted = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  const lower = text.toLowerCase();
  for (const term of sorted) {
    if (lower.includes(term.toLowerCase())) {
      terms.push(term);
    }
  }
  return terms;
}

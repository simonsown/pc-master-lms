export const FULL_QUIZ_BANK = {
  'cpu-arch': {
    id: 'cpu-arch',
    title: 'Kiến Trúc CPU & Tập Lệnh',
    icon: '🔧',
    color: '#6366f1',
    description: 'Kiến thức về bộ vi xử lý, kiến trúc, tập lệnh và công nghệ CPU',
    questions: [
      {
        id: 'q1',
        text: 'CPU là viết tắt của từ gì?',
        options: ['A. Central Processing Unit', 'B. Computer Personal Unit', 'C. Central Program Utility', 'D. Core Processing Unit'],
        correct: 0,
        explanation: 'CPU là viết tắt của Central Processing Unit (Bộ xử lý trung tâm)'
      },
      {
        id: 'q2',
        text: 'Đơn vị đo tốc độ xung nhịp CPU là gì?',
        options: ['A. GHz (Gigahertz)', 'B. MB (Megabyte)', 'C. GB/s (Gigabyte trên giây)', 'D. RPM (Vòng trên phút)'],
        correct: 0,
        explanation: 'Tốc độ CPU được đo bằng GHz - số tỷ chu kỳ mỗi giây'
      },
      {
        id: 'q3',
        text: 'Cache L1, L2, L3 được đặt ở đâu trong hệ thống?',
        options: ['A. Trong CPU', 'B. Trên Mainboard', 'C. Trong RAM', 'D. Trong GPU'],
        correct: 0,
        explanation: 'Bộ nhớ đệm Cache được tích hợp trực tiếp trong CPU để truy cập nhanh'
      },
      {
        id: 'q4',
        text: 'CPU nào sau đây thuộc dòng sản phẩm của AMD?',
        options: ['A. Core i7', 'B. Ryzen 7', 'C. Xeon', 'D. Pentium'],
        correct: 1,
        explanation: 'Ryzen 7 là dòng CPU của AMD, Core i7 và Pentium là của Intel'
      },
      {
        id: 'q5',
        text: 'Hyper-Threading là công nghệ cho phép CPU làm gì?',
        options: ['A. Xử lý đa luồng hiệu quả hơn', 'B. Tăng xung nhịp tự động', 'C. Giảm nhiệt độ hoạt động', 'D. Tiết kiệm điện năng'],
        correct: 0,
        explanation: 'Hyper-Threading cho phép mỗi lõi vật lý xử lý 2 luồng cùng lúc'
      },
      {
        id: 'q6',
        text: 'Socket LGA 1700 dùng cho CPU Intel thế hệ nào?',
        options: ['A. Thế hệ 12/13/14', 'B. Thế hệ 10/11', 'C. Thế hệ 8/9', 'D. Thế hệ 6/7'],
        correct: 0,
        explanation: 'LGA 1700 được Intel sử dụng cho Core thế hệ 12 (Alder Lake), 13 (Raptor Lake) và 14'
      },
      {
        id: 'q7',
        text: 'TDP là viết tắt của thuật ngữ gì?',
        options: ['A. Thermal Design Power', 'B. Total Data Processing', 'C. Technology Development Plan', 'D. Thermal Dynamic Power'],
        correct: 0,
        explanation: 'TDP (Thermal Design Power) là công suất nhiệt thiết kế, đo nhiệt lượng tỏa ra'
      },
      {
        id: 'q8',
        text: 'CPU AMD sử dụng socket nào phổ biến nhất hiện nay?',
        options: ['A. AM5', 'B. LGA 1700', 'C. AM4', 'D. TR4'],
        correct: 0,
        explanation: 'AMD đang sử dụng socket AM5 cho dòng Ryzen 7000/9000 series'
      },
      {
        id: 'q9',
        text: 'Số nhân (cores) nhiều hơn mang lại lợi ích gì?',
        options: ['A. Đa nhiệm và xử lý song song tốt hơn', 'B. Tốc độ đơn luồng cao hơn', 'C. Tiết kiệm điện hơn', 'D. Đồ họa đẹp hơn'],
        correct: 0,
        explanation: 'Nhiều nhân hơn giúp CPU xử lý nhiều tác vụ song song hiệu quả'
      },
      {
        id: 'q10',
        text: 'CPU Intel Core i5 thường phù hợp với đối tượng nào?',
        options: ['A. Người dùng phổ thông và gaming tầm trung', 'B. Máy chủ doanh nghiệp', 'C. Đồ họa chuyên nghiệp', 'D. AI/ML research'],
        correct: 0,
        explanation: 'Core i5 là lựa chọn cân bằng giữa giá cả và hiệu năng cho đa số người dùng'
      },
    ]
  },
  'ram-storage': {
    id: 'ram-storage',
    title: 'RAM & Bộ Nhớ',
    icon: '🧠',
    color: '#8b5cf6',
    description: 'Kiến thức về bộ nhớ trong, RAM, thông số và công nghệ bộ nhớ',
    questions: [
      {
        id: 'q1',
        text: 'RAM là viết tắt của thuật ngữ nào?',
        options: ['A. Random Access Memory', 'B. Read Access Memory', 'C. Rapid Application Module', 'D. Real Application Memory'],
        correct: 0,
        explanation: 'RAM là Random Access Memory - bộ nhớ truy cập ngẫu nhiên'
      },
      {
        id: 'q2',
        text: 'DDR5 RAM có tốc độ bus bao nhiêu?',
        options: ['A. 4800-8400 MT/s', 'B. 2400-3200 MT/s', 'C. 1600-2133 MT/s', 'D. 800-1066 MT/s'],
        correct: 0,
        explanation: 'DDR5 có tốc độ từ 4800 MT/s đến 8400 MT/s tùy phiên bản'
      },
      {
        id: 'q3',
        text: 'Dung lượng RAM phổ biến cho PC gaming hiện nay là bao nhiêu?',
        options: ['A. 16-32GB', 'B. 4-8GB', 'C. 64-128GB', 'D. 2-4GB'],
        correct: 0,
        explanation: '16-32GB RAM là tiêu chuẩn cho gaming hiện đại'
      },
      {
        id: 'q4',
        text: 'CAS Latency (CL) thấp có ý nghĩa gì?',
        options: ['A. Độ trễ thấp, truy cập nhanh hơn', 'B. Dung lượng lớn hơn', 'C. Tiết kiệm điện hơn', 'D. Tương thích tốt hơn'],
        correct: 0,
        explanation: 'CL thấp đồng nghĩa với độ trễ thấp hơn và hiệu năng cao hơn'
      },
      {
        id: 'q5',
        text: 'Dual Channel là gì?',
        options: ['A. Chạy 2 thanh RAM cùng lúc để tăng băng thông', 'B. RAM có 2 mặt chip nhớ', 'C. RAM hỗ trợ 2 thế hệ', 'D. Loại RAM đặc biệt cho server'],
        correct: 0,
        explanation: 'Dual Channel sử dụng 2 thanh RAM song song để tăng băng thông bộ nhớ'
      },
      {
        id: 'q6',
        text: 'RAM DDR4 có bao nhiêu chân?',
        options: ['A. 288 chân', 'B. 240 chân', 'C. 260 chân', 'D. 204 chân'],
        correct: 0,
        explanation: 'DDR4 có 288 chân, trong khi DDR3 chỉ có 240 chân'
      },
      {
        id: 'q7',
        text: 'Loại RAM nào tiết kiệm điện nhất?',
        options: ['A. LPDDR5 (Low Power DDR5)', 'B. DDR4', 'C. DDR5', 'D. DDR3'],
        correct: 0,
        explanation: 'LPDDR5 được thiết kế đặc biệt để tiết kiệm điện cho thiết bị di động'
      },
      {
        id: 'q8',
        text: 'ECC RAM thường được sử dụng trong môi trường nào?',
        options: ['A. Máy chủ/Server yêu cầu độ tin cậy cao', 'B. PC Gaming', 'C. Laptop văn phòng', 'D. Máy tính bảng'],
        correct: 0,
        explanation: 'ECC RAM có khả năng phát hiện và sửa lỗi, rất quan trọng cho server'
      },
      {
        id: 'q9',
        text: 'XMP là công nghệ ép xung RAM tự động của hãng nào?',
        options: ['A. Intel (Extreme Memory Profile)', 'B. AMD', 'C. Corsair', 'D. Kingston'],
        correct: 0,
        explanation: 'XMP là công nghệ của Intel, AMD có công nghệ tương tự là EXPO'
      },
      {
        id: 'q10',
        text: 'Dung lượng RAM tối đa Windows 11 Home hỗ trợ là bao nhiêu?',
        options: ['A. 128GB', 'B. 64GB', 'C. 256GB', 'D. 32GB'],
        correct: 0,
        explanation: 'Windows 11 Home hỗ trợ tối đa 128GB RAM'
      },
    ]
  },
  'gpu-graphics': {
    id: 'gpu-graphics',
    title: 'Card Đồ Họa & Xử Lý Đồ Họa',
    icon: '🎮',
    color: '#ef4444',
    description: 'Kiến thức về GPU, VRAM, công nghệ đồ họa và render',
    questions: [
      {
        id: 'q1',
        text: 'GPU là viết tắt của thuật ngữ nào?',
        options: ['A. Graphics Processing Unit', 'B. General Processing Unit', 'C. Graphical Program Utility', 'D. Graphics Power Unit'],
        correct: 0,
        explanation: 'GPU là Graphics Processing Unit - đơn vị xử lý đồ họa'
      },
      {
        id: 'q2',
        text: 'VRAM là bộ nhớ của thành phần nào?',
        options: ['A. Card đồ họa (GPU)', 'B. CPU', 'C. Mainboard', 'D. RAM hệ thống'],
        correct: 0,
        explanation: 'VRAM (Video RAM) là bộ nhớ riêng của card đồ họa'
      },
      {
        id: 'q3',
        text: 'Ray Tracing là công nghệ gì?',
        options: ['A. Mô phỏng ánh sáng vật lý chân thực', 'B. Công nghệ tăng FPS', 'C. Công nghệ giảm nhiệt GPU', 'D. Công nghệ nén texture'],
        correct: 0,
        explanation: 'Ray Tracing mô phỏng đường đi của ánh sáng để tạo hình ảnh chân thực'
      },
      {
        id: 'q4',
        text: 'DLSS là công nghệ AI của hãng nào?',
        options: ['A. NVIDIA', 'B. AMD', 'C. Intel', 'D. Apple'],
        correct: 0,
        explanation: 'DLSS (Deep Learning Super Sampling) là công nghệ độc quyền của NVIDIA'
      },
      {
        id: 'q5',
        text: 'CUDA Core là kiến trúc tính toán của hãng nào?',
        options: ['A. NVIDIA', 'B. AMD', 'C. Intel', 'D. Qualcomm'],
        correct: 0,
        explanation: 'CUDA là nền tảng tính toán song song của NVIDIA'
      },
      {
        id: 'q6',
        text: 'PCIe 5.0 có băng thông gấp mấy lần PCIe 4.0?',
        options: ['A. Gấp đôi (2x)', 'B. Gấp 3 lần', 'C. Gấp 1.5 lần', 'D. Gấp 4 lần'],
        correct: 0,
        explanation: 'PCIe 5.0 có băng thông 32 GT/s, gấp đôi so với 16 GT/s của PCIe 4.0'
      },
      {
        id: 'q7',
        text: 'RTX 4090 sử dụng kiến trúc GPU nào?',
        options: ['A. Ada Lovelace', 'B. Ampere', 'C. Turing', 'D. Pascal'],
        correct: 0,
        explanation: 'RTX 4090 dùng kiến trúc Ada Lovelace, ra mắt năm 2022'
      },
      {
        id: 'q8',
        text: 'FidelityFX Super Resolution (FSR) là công nghệ của hãng nào?',
        options: ['A. AMD', 'B. NVIDIA', 'C. Intel', 'D. Microsoft'],
        correct: 0,
        explanation: 'FSR là công nghệ upscaling độc quyền của AMD, đối thủ cạnh tranh với DLSS'
      },
      {
        id: 'q9',
        text: 'TDP (công suất tiêu thụ) của RTX 4090 khoảng bao nhiêu?',
        options: ['A. 450W', 'B. 250W', 'C. 350W', 'D. 550W'],
        correct: 0,
        explanation: 'RTX 4090 có TDP 450W, yêu cầu nguồn tối thiểu 850W'
      },
      {
        id: 'q10',
        text: 'Độ phân giải 4K có kích thước bao nhiêu pixel?',
        options: ['A. 3840x2160', 'B. 2560x1440', 'C. 1920x1080', 'D. 5120x2880'],
        correct: 0,
        explanation: '4K UHD có độ phân giải 3840x2160, gấp 4 lần Full HD'
      },
    ]
  },
  'motherboard': {
    id: 'motherboard',
    title: 'Bo Mạch Chủ & Chipset',
    icon: '🔌',
    color: '#10b981',
    description: 'Kiến thức về mainboard, chipset, khe cắm và kết nối',
    questions: [
      {
        id: 'q1',
        text: 'Chipset Z790 dành cho CPU Intel thế hệ nào?',
        options: ['A. Thế hệ 12/13/14', 'B. Thế hệ 10/11', 'C. Thế hệ 8/9', 'D. Thế hệ 6/7'],
        correct: 0,
        explanation: 'Z790 hỗ trợ Intel Core thế hệ 12, 13 và 14 với khả năng ép xung'
      },
      {
        id: 'q2',
        text: 'Form factor mainboard phổ biến nhất hiện nay là gì?',
        options: ['A. ATX', 'B. Mini-ITX', 'C. E-ATX', 'D. Micro-ATX'],
        correct: 0,
        explanation: 'ATX là chuẩn phổ biến nhất với kích thước 305x244mm'
      },
      {
        id: 'q3',
        text: 'Khe M.2 trên mainboard dùng để kết nối thiết bị gì?',
        options: ['A. SSD NVMe', 'B. RAM', 'C. GPU', 'D. CPU'],
        correct: 0,
        explanation: 'Khe M.2 chủ yếu dùng cho SSD NVMe tốc độ cao'
      },
      {
        id: 'q4',
        text: 'VRM trên mainboard có chức năng gì?',
        options: ['A. Cấp điện ổn định cho CPU', 'B. Tản nhiệt chipset', 'C. Kết nối USB', 'D. Điều khiển tốc độ quạt'],
        correct: 0,
        explanation: 'VRM (Voltage Regulator Module) chuyển đổi và ổn định điện áp cho CPU'
      },
      {
        id: 'q5',
        text: 'Khe PCIe x16 thường được dùng cho thiết bị nào?',
        options: ['A. Card đồ họa (GPU)', 'B. SSD M.2', 'C. RAM', 'D. Card mạng'],
        correct: 0,
        explanation: 'Khe PCIe x16 có băng thông cao nhất, thường dùng cho GPU'
      },
      {
        id: 'q6',
        text: 'USB 3.2 Gen 2 có tốc độ truyền tối đa là bao nhiêu?',
        options: ['A. 10 Gbps', 'B. 5 Gbps', 'C. 20 Gbps', 'D. 40 Gbps'],
        correct: 0,
        explanation: 'USB 3.2 Gen 2 có tốc độ 10 Gbps, gấp đôi Gen 1'
      },
      {
        id: 'q7',
        text: 'BIOS là viết tắt của thuật ngữ nào?',
        options: ['A. Basic Input Output System', 'B. Binary Integrated Operating System', 'C. Base Input Output Standard', 'D. Built-in Operating System'],
        correct: 0,
        explanation: 'BIOS là Basic Input/Output System - hệ thống xuất nhập cơ bản'
      },
      {
        id: 'q8',
        text: 'Pin CMOS trên mainboard có tác dụng gì?',
        options: ['A. Giữ cài đặt BIOS khi tắt máy', 'B. Cấp nguồn cho CPU', 'C. Cấp nguồn cho RAM', 'D. Khởi động mainboard'],
        correct: 0,
        explanation: 'Pin CMOS giúp lưu cài đặt BIOS và thời gian hệ thống khi mất điện'
      },
      {
        id: 'q9',
        text: 'Mainboard ATX thường có tối đa bao nhiêu khe RAM?',
        options: ['A. 4 khe', 'B. 2 khe', 'C. 6 khe', 'D. 8 khe'],
        correct: 0,
        explanation: 'Mainboard ATX tiêu chuẩn thường có 4 khe RAM DIMM'
      },
      {
        id: 'q10',
        text: 'Chuẩn WiFi mới nhất thường tích hợp trên mainboard cao cấp là gì?',
        options: ['A. WiFi 6E / WiFi 7', 'B. WiFi 5 (802.11ac)', 'C. WiFi 4 (802.11n)', 'D. Bluetooth 5.0'],
        correct: 0,
        explanation: 'Mainboard cao cấp hiện nay tích hợp WiFi 6E (6GHz) hoặc WiFi 7'
      },
    ]
  },
  'psu-cooling': {
    id: 'psu-cooling',
    title: 'Nguồn & Tản Nhiệt',
    icon: '❄️',
    color: '#06b6d4',
    description: 'Kiến thức về nguồn điện, tản nhiệt, quạt và quản lý nhiệt',
    questions: [
      {
        id: 'q1',
        text: 'PSU đạt chuẩn 80 Plus Gold có hiệu suất tối thiểu là bao nhiêu?',
        options: ['A. 87%', 'B. 80%', 'C. 90%', 'D. 85%'],
        correct: 0,
        explanation: '80 Plus Gold yêu cầu hiệu suất tối thiểu 87% ở tải 50%'
      },
      {
        id: 'q2',
        text: 'Loại tản nhiệt nào hiệu quả nhất cho CPU hiệu năng cao?',
        options: ['A. Tản nhiệt nước AIO', 'B. Tản nhiệt khí (air cooler)', 'C. Tản nhiệt dầu', 'D. Tản nhiệt bán dẫn'],
        correct: 0,
        explanation: 'AIO water cooling hiệu quả hơn air cooler với CPU cao cấp'
      },
      {
        id: 'q3',
        text: 'Nguồn điện modular là gì?',
        options: ['A. Nguồn có dây cáp tháo rời được', 'B. Nguồn điện di động', 'C. Nguồn có quạt lớn', 'D. Nguồn tiết kiệm điện'],
        correct: 0,
        explanation: 'PSU modular cho phép tháo rời dây cáp không dùng đến, giúp quản lý dây gọn gàng'
      },
      {
        id: 'q4',
        text: 'Thermal Paste (keo tản nhiệt) có tác dụng gì?',
        options: ['A. Truyền nhiệt từ CPU lên đế tản nhiệt', 'B. Dẫn điện cho CPU', 'C. Bảo vệ CPU khỏi ẩm', 'D. Tăng tốc xung nhịp CPU'],
        correct: 0,
        explanation: 'Thermal paste lấp đầy khe hở giữa CPU và tản nhiệt để dẫn nhiệt tốt hơn'
      },
      {
        id: 'q5',
        text: 'PSU ATX 3.0 hỗ trợ chuẩn cáp nguồn mới nào?',
        options: ['A. 12VHPWR (12+4 pin)', 'B. ATX12VO', 'C. SFX', 'D. EPS12V'],
        correct: 0,
        explanation: 'ATX 3.0 giới thiệu chuẩn 12VHPWR cho GPU thế hệ mới'
      },
      {
        id: 'q6',
        text: 'Kích thước quạt tản nhiệt khí phổ biến nhất là bao nhiêu?',
        options: ['A. 120mm', 'B. 80mm', 'C. 140mm', 'D. 92mm'],
        correct: 0,
        explanation: 'Quạt 120mm là kích thước tiêu chuẩn phổ biến nhất'
      },
      {
        id: 'q7',
        text: 'Nhiệt độ CPU an toàn khi chơi game là bao nhiêu?',
        options: ['A. 60-80°C', 'B. 90-100°C', 'C. 40-50°C', 'D. Trên 100°C'],
        correct: 0,
        explanation: 'CPU hoạt động an toàn ở 60-80°C khi chơi game'
      },
      {
        id: 'q8',
        text: 'Liquid Metal (kim loại lỏng) là gì?',
        options: ['A. Kem tản nhiệt từ kim loại lỏng dẫn nhiệt siêu tốt', 'B. Nước làm mát tuần hoàn', 'C. Dầu silicon tản nhiệt', 'D. Gel tản nhiệt thông thường'],
        correct: 0,
        explanation: 'Liquid Metal là hợp kim lỏng có độ dẫn nhiệt rất cao nhưng dẫn điện'
      },
      {
        id: 'q9',
        text: 'Fan Controller có chức năng gì?',
        options: ['A. Điều chỉnh tốc độ quạt thủ công hoặc tự động', 'B. Tăng điện áp cho quạt', 'C. Giảm tiếng ồn quạt', 'D. Chống bụi cho quạt'],
        correct: 0,
        explanation: 'Fan Controller cho phép kiểm soát chính xác tốc độ quạt hệ thống'
      },
      {
        id: 'q10',
        text: 'PSU 850W đủ cho cấu hình PC nào sau đây?',
        options: ['A. RTX 4070 + Intel Core i5', 'B. RTX 4090 + Intel Core i9', 'C. RTX 3060 + Intel Core i3', 'D. RTX 4080 + Intel Core i9'],
        correct: 0,
        explanation: '850W đủ cho tầm trung-cao như RTX 4070 + i5, nhưng không đủ cho RTX 4090'
      },
    ]
  },
  'storage-devices': {
    id: 'storage-devices',
    title: 'Ổ Cứng SSD/HDD',
    icon: '💾',
    color: '#f59e0b',
    description: 'Kiến thức về ổ cứng, SSD, HDD, chuẩn kết nối và lưu trữ',
    questions: [
      {
        id: 'q1',
        text: 'SSD NVMe PCIe 4.0 có tốc độ đọc tuần tự tối đa khoảng bao nhiêu?',
        options: ['A. 7000 MB/s', 'B. 500 MB/s', 'C. 2000 MB/s', 'D. 15000 MB/s'],
        correct: 0,
        explanation: 'SSD NVMe PCIe 4.0 đạt tốc độ đọc ~7000 MB/s'
      },
      {
        id: 'q2',
        text: 'HDD 7200RPM có tốc độ đọc tuần tự khoảng bao nhiêu?',
        options: ['A. ~160 MB/s', 'B. ~500 MB/s', 'C. ~50 MB/s', 'D. ~1000 MB/s'],
        correct: 0,
        explanation: 'HDD 7200RPM đạt tốc độ đọc tuần tự khoảng 160 MB/s'
      },
      {
        id: 'q3',
        text: 'Chuẩn SATA III có băng thông tối đa là bao nhiêu?',
        options: ['A. 6 Gbps', 'B. 3 Gbps', 'C. 12 Gbps', 'D. 1.5 Gbps'],
        correct: 0,
        explanation: 'SATA III có băng thông 6 Gbps (~600 MB/s thực tế)'
      },
      {
        id: 'q4',
        text: 'SSD NVMe PCIe 3.0 có tốc độ đọc tuần tự khoảng bao nhiêu?',
        options: ['A. ~3500 MB/s', 'B. ~7000 MB/s', 'C. ~10000 MB/s', 'D. ~2000 MB/s'],
        correct: 0,
        explanation: 'NVMe PCIe 3.0 đạt tốc độ ~3500 MB/s, bằng một nửa PCIe 4.0'
      },
      {
        id: 'q5',
        text: 'TBW là chỉ số đo gì trên ổ SSD?',
        options: ['A. Tuổi thọ ghi của SSD (Terabytes Written)', 'B. Tốc độ đọc tối đa', 'C. Dung lượng tối đa', 'D. Nhiệt độ hoạt động'],
        correct: 0,
        explanation: 'TBW cho biết tổng lượng dữ liệu có thể ghi vào SSD trong suốt vòng đời'
      },
      {
        id: 'q6',
        text: 'Các loại NAND Flash phổ biến trong SSD là gì?',
        options: ['A. TLC, QLC, MLC, SLC', 'B. DDR, SDR, NAND', 'C. NVMe, SATA, SAS', 'D. AIO, Air, Water'],
        correct: 0,
        explanation: 'Các loại NAND Flash gồm SLC, MLC, TLC, QLC với mật độ lưu trữ khác nhau'
      },
      {
        id: 'q7',
        text: 'Dung lượng ổ cứng phổ biến nhất cho PC người dùng hiện nay?',
        options: ['A. 1TB - 2TB', 'B. 128GB - 256GB', 'C. 4TB - 8TB', 'D. 500GB'],
        correct: 0,
        explanation: '1-2TB là dung lượng phổ biến, cân bằng giữa giá và không gian lưu trữ'
      },
      {
        id: 'q8',
        text: 'Công nghệ S.M.A.R.T trên ổ cứng dùng để làm gì?',
        options: ['A. Theo dõi và dự đoán tình trạng sức khỏe ổ cứng', 'B. Tăng tốc đọc ghi dữ liệu', 'C. Nén dữ liệu tự động', 'D. Mã hóa dữ liệu trên ổ cứng'],
        correct: 0,
        explanation: 'S.M.A.R.T theo dõi các chỉ số sức khỏe để cảnh báo trước khi ổ hỏng'
      },
      {
        id: 'q9',
        text: 'SSD khác HDD ở điểm cơ bản nào?',
        options: ['A. Không có đĩa quay cơ học', 'B. Dung lượng lưu trữ lớn hơn', 'C. Giá thành rẻ hơn trên mỗi GB', 'D. Bền hơn khi va đập mạnh'],
        correct: 0,
        explanation: 'SSD dùng chip nhớ Flash, không có đĩa quay như HDD'
      },
      {
        id: 'q10',
        text: 'Chuẩn ổ cứng 2.5 inch thường được dùng cho thiết bị nào?',
        options: ['A. Laptop và ổ cứng di động', 'B. PC Desktop', 'C. Máy chủ doanh nghiệp', 'D. Máy tính bảng'],
        correct: 0,
        explanation: 'Ổ 2.5 inch phổ biến trong laptop và ổ cứng di động nhờ kích thước nhỏ'
      },
    ]
  },
  'pc-assembly': {
    id: 'pc-assembly',
    title: 'Quy Trình Lắp Ráp PC',
    icon: '🛠️',
    color: '#f97316',
    description: 'Kiến thức về quy trình, kỹ thuật và lưu ý khi lắp ráp máy tính',
    questions: [
      {
        id: 'q1',
        text: 'Bước đầu tiên khi lắp ráp một chiếc PC là gì?',
        options: ['A. Lắp CPU lên mainboard', 'B. Lắp nguồn (PSU) vào case', 'C. Lắp RAM', 'D. Lắp card đồ họa (GPU)'],
        correct: 0,
        explanation: 'Nên lắp CPU lên mainboard trước khi đặt mainboard vào case'
      },
      {
        id: 'q2',
        text: 'Nên bôi thermal paste (keo tản nhiệt) ở đâu?',
        options: ['A. Trên IHS (nắp kim loại) của CPU', 'B. Trên chân cắm CPU', 'C. Trên bề mặt tản nhiệt', 'D. Trên mainboard quanh socket'],
        correct: 0,
        explanation: 'Bôi thermal paste lên giữa IHS CPU để tản nhiệt tiếp xúc tốt'
      },
      {
        id: 'q3',
        text: 'Dây 24-pin ATX cấp nguồn cho thành phần nào?',
        options: ['A. Mainboard', 'B. CPU', 'C. GPU', 'D. Ổ cứng SSD'],
        correct: 0,
        explanation: 'Đầu nối 24-pin ATX cấp nguồn chính cho mainboard'
      },
      {
        id: 'q4',
        text: 'Dây EPS 8-pin (4+4) cấp nguồn cho thành phần nào?',
        options: ['A. CPU', 'B. GPU', 'C. Mainboard', 'D. Quạt case'],
        correct: 0,
        explanation: 'Cáp EPS 8-pin cung cấp nguồn riêng cho CPU'
      },
      {
        id: 'q5',
        text: 'Khi lắp RAM cần chú ý điều gì quan trọng?',
        options: ['A. Căn chỉnh khuyết trên thanh RAM với khe cắm', 'B. Bôi keo tản nhiệt lên RAM', 'C. Gắn cáp nguồn riêng cho RAM', 'D. Cài driver trước khi lắp'],
        correct: 0,
        explanation: 'RAM có khuyết ở vị trí đặc biệt để chống cắm sai chiều'
      },
      {
        id: 'q6',
        text: 'Tĩnh điện (ESD) có thể gây hại gì cho linh kiện PC?',
        options: ['A. Hỏng linh kiện vĩnh viễn', 'B. Tăng tốc độ linh kiện', 'C. Giảm nhiệt độ hoạt động', 'D. Tiết kiệm điện năng'],
        correct: 0,
        explanation: 'Tĩnh điện có thể phá hủy linh kiện nhạy cảm như CPU, RAM, mainboard'
      },
      {
        id: 'q7',
        text: 'Công cụ nào giúp chống tĩnh điện khi lắp ráp PC?',
        options: ['A. Dây đeo tay ESD (chống tĩnh điện)', 'B. Găng tay cao su', 'C. Kìm cách điện', 'D. Tua vít nhựa'],
        correct: 0,
        explanation: 'Dây đeo tay ESD giúp xả tĩnh điện từ cơ thể xuống đất'
      },
      {
        id: 'q8',
        text: 'Sau khi lắp ráp xong PC, bước đầu tiên cần làm là gì?',
        options: ['A. Kiểm tra nguồn và xem có POST không', 'B. Cài đặt Windows ngay', 'C. Cài driver cho các thiết bị', 'D. Test nhiệt độ CPU'],
        correct: 0,
        explanation: 'Kiểm tra POST (Power-On Self-Test) để xác nhận hệ thống hoạt động'
      },
      {
        id: 'q9',
        text: 'POST là viết tắt của thuật ngữ nào?',
        options: ['A. Power-On Self-Test', 'B. Program Operating System Test', 'C. Processor Optimization Standard Test', 'D. Power Output System Test'],
        correct: 0,
        explanation: 'POST là quá trình tự kiểm tra khi khởi động máy tính'
      },
      {
        id: 'q10',
        text: 'Đèn LED trên mainboard báo lỗi được gọi là gì?',
        options: ['A. Debug LED', 'B. RGB LED', 'C. Status LED', 'D. Power LED'],
        correct: 0,
        explanation: 'Debug LED hiển thị mã lỗi giúp chẩn đoán sự cố phần cứng'
      },
    ]
  },
  'bios-uefi': {
    id: 'bios-uefi',
    title: 'BIOS & UEFI',
    icon: '⚙️',
    color: '#14b8a6',
    description: 'Kiến thức về firmware, BIOS, UEFI và cài đặt hệ thống khởi động',
    questions: [
      {
        id: 'q1',
        text: 'UEFI là gì?',
        options: ['A. Giao diện firmware hiện đại thay thế BIOS', 'B. Loại ổ cứng đặc biệt', 'C. Phần mềm diệt virus', 'D. Hệ điều hành chuyên dụng'],
        correct: 0,
        explanation: 'UEFI (Unified Extensible Firmware Interface) là chuẩn firmware hiện đại hơn BIOS'
      },
      {
        id: 'q2',
        text: 'Phím tắt thường dùng để vào BIOS/UEFI khi khởi động là gì?',
        options: ['A. Del / F2', 'B. F12', 'C. Esc', 'D. F10'],
        correct: 0,
        explanation: 'Del và F2 là hai phím phổ biến nhất để vào BIOS Setup'
      },
      {
        id: 'q3',
        text: 'XMP Profile trong BIOS giúp làm gì?',
        options: ['A. Ép xung RAM tự động theo thông số nhà sản xuất', 'B. Ép xung CPU tự động', 'C. Tăng tốc GPU', 'D. Tối ưu tốc độ ổ cứng'],
        correct: 0,
        explanation: 'XMP tự động cài đặt thông số RAM tối ưu từ nhà sản xuất'
      },
      {
        id: 'q4',
        text: 'Secure Boot có tác dụng gì?',
        options: ['A. Chống phần mềm độc hại khởi động cùng hệ thống', 'B. Tăng tốc quá trình khởi động', 'C. Mã hóa toàn bộ ổ cứng', 'D. Bảo vệ BIOS khỏi virus'],
        correct: 0,
        explanation: 'Secure Boot chỉ cho phép chạy các phần mềm khởi động đã được ký số'
      },
      {
        id: 'q5',
        text: 'Boot Order trong BIOS dùng để làm gì?',
        options: ['A. Sắp xếp thứ tự ưu tiên khởi động từ thiết bị', 'B. Sắp xếp thứ tự quạt làm mát', 'C. Cấu hình tốc độ RAM', 'D. Cài đặt ngôn ngữ hiển thị'],
        correct: 0,
        explanation: 'Boot Order xác định thiết bị nào được khởi động trước (SSD, USB, DVD...)'
      },
      {
        id: 'q6',
        text: 'Legacy Boot khác UEFI Boot như thế nào?',
        options: ['A. Legacy dùng MBR (cũ), UEFI dùng GPT (hiện đại)', 'B. Legacy nhanh hơn', 'C. Legacy bảo mật hơn', 'D. Legacy hỗ trợ SSD tốt hơn'],
        correct: 0,
        explanation: 'Legacy sử dụng bảng phân vùng MBR, UEFI sử dụng GPT hiện đại hơn'
      },
      {
        id: 'q7',
        text: 'CMOS Clear (hay Clear RTC) có tác dụng gì?',
        options: ['A. Reset cài đặt BIOS về mặc định', 'B. Xóa toàn bộ dữ liệu ổ cứng', 'C. Cập nhật BIOS lên phiên bản mới', 'D. Tăng xung nhịp CPU'],
        correct: 0,
        explanation: 'Clear CMOS giúp khôi phục cài đặt BIOS gốc khi gặp sự cố'
      },
      {
        id: 'q8',
        text: 'Tính năng BIOS Flashback cho phép làm gì?',
        options: ['A. Cập nhật BIOS mà không cần CPU/RAM', 'B. Khởi động máy nhanh hơn', 'C. Ép xung CPU tự động', 'D. Khôi phục mật khẩu BIOS'],
        correct: 0,
        explanation: 'Flashback cho phép nạp BIOS ngay cả khi không có CPU hoặc RAM'
      },
      {
        id: 'q9',
        text: 'VT-d (Intel Virtualization Technology for Directed I/O) là công nghệ của hãng nào?',
        options: ['A. Intel', 'B. AMD', 'C. NVIDIA', 'D. Microsoft'],
        correct: 0,
        explanation: 'VT-d là công nghệ ảo hóa I/O của Intel, AMD có IOMMU tương tự'
      },
      {
        id: 'q10',
        text: 'Resizable BAR (Re-Size BAR) giúp cải thiện điều gì?',
        options: ['A. CPU có thể truy cập toàn bộ VRAM GPU', 'B. Tăng dung lượng RAM hệ thống', 'C. Giảm nhiệt độ GPU', 'D. Tăng tốc độ ổ cứng'],
        correct: 0,
        explanation: 'Resizable BAR cho phép CPU truy cập toàn bộ VRAM, cải thiện hiệu năng game'
      },
    ]
  },
  'network': {
    id: 'network',
    title: 'Mạng Máy Tính',
    icon: '🌐',
    color: '#3b82f6',
    description: 'Kiến thức về mạng máy tính, giao thức, thiết bị mạng và kết nối Internet',
    questions: [
      {
        id: 'q1',
        text: 'IP là viết tắt của thuật ngữ nào?',
        options: ['A. Internet Protocol', 'B. Internal Processing', 'C. Input Protocol', 'D. Integrated Program'],
        correct: 0,
        explanation: 'IP (Internet Protocol) là giao thức Internet cốt lõi'
      },
      {
        id: 'q2',
        text: 'Cáp Ethernet Cat6 có tốc độ tối đa là bao nhiêu?',
        options: ['A. 10 Gbps', 'B. 1 Gbps', 'C. 100 Mbps', 'D. 40 Gbps'],
        correct: 0,
        explanation: 'Cat6 hỗ trợ 10 Gbps ở khoảng cách tối đa 55m'
      },
      {
        id: 'q3',
        text: 'WiFi 6 (802.11ax) hoạt động tốt ở dải tần nào?',
        options: ['A. 2.4GHz và 5GHz', 'B. Chỉ 2.4GHz', 'C. Chỉ 5GHz', 'D. 5GHz và 6GHz (WiFi 6E)'],
        correct: 0,
        explanation: 'WiFi 6 hỗ trợ cả 2.4GHz và 5GHz, WiFi 6E thêm băng tần 6GHz'
      },
      {
        id: 'q4',
        text: 'Router (bộ định tuyến) có chức năng chính là gì?',
        options: ['A. Định tuyến và chuyển tiếp gói tin giữa các mạng', 'B. Khuếch đại tín hiệu WiFi', 'C. Lưu trữ dữ liệu mạng', 'D. Bảo mật và chặn virus'],
        correct: 0,
        explanation: 'Router chuyển tiếp gói tin giữa các mạng khác nhau'
      },
      {
        id: 'q5',
        text: 'Băng tần WiFi 5GHz có ưu điểm gì so với 2.4GHz?',
        options: ['A. Tốc độ cao hơn, ít nhiễu hơn', 'B. Khả năng xuyên tường tốt hơn', 'C. Phạm vi phủ sóng rộng hơn', 'D. Tiết kiệm pin thiết bị hơn'],
        correct: 0,
        explanation: '5GHz có tốc độ cao và ít nhiễu hơn nhưng phạm vi hẹp hơn 2.4GHz'
      },
      {
        id: 'q6',
        text: 'Bộ giao thức TCP/IP là gì?',
        options: ['A. Bộ giao thức nền tảng cho Internet', 'B. Phần mềm quản lý mạng', 'C. Loại cáp mạng thông dụng', 'D. Thiết bị mạng chuyên dụng'],
        correct: 0,
        explanation: 'TCP/IP là bộ giao thức làm nền tảng cho toàn bộ Internet'
      },
      {
        id: 'q7',
        text: 'LAN là viết tắt của thuật ngữ nào?',
        options: ['A. Local Area Network', 'B. Large Area Network', 'C. Logical Access Node', 'D. Link Access Network'],
        correct: 0,
        explanation: 'LAN là mạng cục bộ kết nối các thiết bị trong phạm vi nhỏ'
      },
      {
        id: 'q8',
        text: 'Switch khác Hub ở điểm quan trọng nào?',
        options: ['A. Switch chuyển mạch thông minh, Hub kém hiệu quả', 'B. Switch rẻ hơn Hub', 'C. Switch nhanh hơn Hub gấp 10 lần', 'D. Switch an toàn hơn'],
        correct: 0,
        explanation: 'Switch chỉ gửi dữ liệu đến đúng thiết bị đích, còn Hub gửi đến tất cả'
      },
      {
        id: 'q9',
        text: 'Ping là chỉ số đo gì trong mạng?',
        options: ['A. Độ trễ (latency) kết nối mạng', 'B. Tốc độ download', 'C. Băng thông mạng', 'D. Độ ổn định kết nối'],
        correct: 0,
        explanation: 'Ping đo thời gian phản hồi của gói tin, tính bằng ms'
      },
      {
        id: 'q10',
        text: 'DNS (Domain Name System) dùng để làm gì?',
        options: ['A. Phân giải tên miền thành địa chỉ IP', 'B. Mã hóa dữ liệu truyền qua mạng', 'C. Tăng tốc kết nối Internet', 'D. Bảo vệ máy tính khỏi virus'],
        correct: 0,
        explanation: 'DNS chuyển đổi tên miền (google.com) thành địa chỉ IP (142.250.xx.xx)'
      },
    ]
  },
  'peripherals': {
    id: 'peripherals',
    title: 'Thiết Bị Ngoại Vi',
    icon: '🖱️',
    color: '#ec4899',
    description: 'Kiến thức về chuột, bàn phím, màn hình, webcam và thiết bị ngoại vi',
    questions: [
      {
        id: 'q1',
        text: 'Monitor có Response Time (thời gian đáp ứng) thấp mang lại lợi ích gì?',
        options: ['A. Giảm hiện tượng bóng mờ (ghosting)', 'B. Màu sắc hiển thị đẹp hơn', 'C. Độ phân giải cao hơn', 'D. Tiết kiệm điện năng hơn'],
        correct: 0,
        explanation: 'Response Time thấp giúp giảm bóng mờ khi chuyển động nhanh'
      },
      {
        id: 'q2',
        text: 'Tần số quét (Hz) của màn hình ảnh hưởng đến điều gì?',
        options: ['A. Độ mượt của chuyển động trên màn hình', 'B. Độ phân giải hiển thị', 'C. Chất lượng màu sắc', 'D. Độ sáng tối đa'],
        correct: 0,
        explanation: 'Tần số quét cao (144Hz+) cho hình ảnh chuyển động mượt mà hơn'
      },
      {
        id: 'q3',
        text: 'Bàn phím cơ (Mechanical Keyboard) sử dụng cơ chế gì?',
        options: ['A. Switch lò xo vật lý cho từng phím', 'B. Màng cao su dẫn điện', 'C. Cảm ứng điện dung', 'D. Công nghệ laser'],
        correct: 0,
        explanation: 'Bàn phím cơ dùng switch vật lý riêng biệt cho mỗi phím'
      },
      {
        id: 'q4',
        text: 'DPI của chuột máy tính là chỉ số đo gì?',
        options: ['A. Độ nhạy và tốc độ di chuyển con trỏ', 'B. Tốc độ click chuột', 'C. Số lượng nút bấm trên chuột', 'D. Trọng lượng của chuột'],
        correct: 0,
        explanation: 'DPI càng cao, con trỏ di chuyển càng xa khi chuột di chuyển'
      },
      {
        id: 'q5',
        text: 'Webcam 1080p có độ phân giải là bao nhiêu?',
        options: ['A. 1920x1080', 'B. 1280x720', 'C. 3840x2160', 'D. 640x480'],
        correct: 0,
        explanation: '1080p Full HD có độ phân giải 1920x1080 pixel'
      },
      {
        id: 'q6',
        text: 'Cổng USB Type-C có đặc điểm nổi bật gì?',
        options: ['A. Cắm được 2 chiều (reversible)', 'B. Chỉ truyền dữ liệu, không sạc được', 'C. Tốc độ chậm hơn Type-A', 'D. Chỉ dùng cho điện thoại'],
        correct: 0,
        explanation: 'USB-C có thiết kế đối xứng, có thể cắm theo bất kỳ chiều nào'
      },
      {
        id: 'q7',
        text: 'Bluetooth 5.0 có phạm vi kết nối tối đa trong nhà là bao nhiêu?',
        options: ['A. ~40m', 'B. ~10m', 'C. ~50m', 'D. ~100m'],
        correct: 0,
        explanation: 'Bluetooth 5.0 có phạm vi lên tới 40m trong nhà (gấp 4 lần BT 4.2)'
      },
      {
        id: 'q8',
        text: 'Cổng HDMI 2.1 hỗ trợ độ phân giải tối đa là bao nhiêu?',
        options: ['A. 8K @60Hz', 'B. 4K @60Hz', 'C. 1080p @240Hz', 'D. 5K @30Hz'],
        correct: 0,
        explanation: 'HDMI 2.1 hỗ trợ 8K ở 60Hz hoặc 4K ở 120Hz'
      },
      {
        id: 'q9',
        text: 'Cổng DisplayPort khác HDMI ở điểm chính nào?',
        options: ['A. Băng thông cao hơn, không thu phí bản quyền', 'B. DisplayPort không hỗ trợ âm thanh', 'C. DisplayPort phổ biến hơn trong TV', 'D. Dây DisplayPort dài hơn'],
        correct: 0,
        explanation: 'DisplayPort thường có băng thông cao hơn và không thu phí như HDMI'
      },
      {
        id: 'q10',
        text: 'Microphone condenser (tụ điện) phù hợp cho mục đích nào?',
        options: ['A. Thu âm phòng thu chất lượng cao', 'B. Chơi game thông thường', 'C. Họp online văn phòng', 'D. Ghi âm ngoài trời'],
        correct: 0,
        explanation: 'Micro condenser có độ nhạy cao, phù hợp thu âm trong môi trường kiểm soát'
      },
    ]
  },
  'os-windows': {
    id: 'os-windows',
    title: 'Hệ Điều Hành Windows',
    icon: '🪟',
    color: '#0078d4',
    description: 'Kiến thức về hệ điều hành Windows, cài đặt, cấu hình và bảo trì',
    questions: [
      {
        id: 'q1',
        text: 'Hệ điều hành là gì?',
        options: ['A. Phần mềm quản lý tài nguyên phần cứng và phần mềm', 'B. Phần mềm diệt virus', 'C. Trình duyệt Internet', 'D. Phần mềm văn phòng'],
        correct: 0,
        explanation: 'Hệ điều hành quản lý tài nguyên và cung cấp giao diện cho người dùng'
      },
      {
        id: 'q2',
        text: 'Windows 11 yêu cầu tối thiểu RAM bao nhiêu?',
        options: ['A. 4GB', 'B. 8GB', 'C. 2GB', 'D. 16GB'],
        correct: 0,
        explanation: 'Windows 11 yêu cầu tối thiểu 4GB RAM'
      },
      {
        id: 'q3',
        text: 'File hệ thống quan trọng của Windows là gì?',
        options: ['A. NTOSKRNL.EXE (Windows kernel)', 'B. WIN.COM', 'C. SYSTEM.INI', 'D. BOOT.INI'],
        correct: 0,
        explanation: 'NTOSKRNL.EXE là nhân (kernel) chính của Windows'
      },
      {
        id: 'q4',
        text: 'Công cụ nào dùng để phân vùng ổ cứng trong Windows?',
        options: ['A. Disk Management (diskmgmt.msc)', 'B. Task Manager', 'C. Device Manager', 'D. Registry Editor'],
        correct: 0,
        explanation: 'Disk Management cho phép tạo, xóa, thu nhỏ và mở rộng phân vùng'
      },
      {
        id: 'q5',
        text: 'BSOD (Blue Screen of Death) thường xuất hiện khi nào?',
        options: ['A. Khi Windows gặp lỗi hệ thống nghiêm trọng', 'B. Khi cập nhật Windows', 'C. Khi khởi động máy', 'D. Khi cài phần mềm mới'],
        correct: 0,
        explanation: 'BSOD xuất hiện khi hệ thống gặp lỗi không thể phục hồi'
      },
      {
        id: 'q6',
        text: 'Safe Mode trong Windows có tác dụng gì?',
        options: ['A. Khởi động với tối thiểu driver và dịch vụ để gỡ lỗi', 'B. Chế độ bảo mật tối đa', 'C. Tăng tốc hệ thống', 'D. Kết nối Internet an toàn'],
        correct: 0,
        explanation: 'Safe Mode giúp chẩn đoán và khắc phục sự cố với driver/dịch vụ tối thiểu'
      },
      {
        id: 'q7',
        text: 'NTFS là viết tắt của hệ thống file nào?',
        options: ['A. New Technology File System', 'B. Network File System', 'C. Windows File System', 'D. Normal File System'],
        correct: 0,
        explanation: 'NTFS là hệ thống tập tin công nghệ mới của Windows'
      },
      {
        id: 'q8',
        text: 'Công cụ nào dùng để kiểm tra lỗi ổ cứng trong Windows?',
        options: ['A. CHKDSK (Check Disk)', 'B. DEFRAG', 'C. SFC (System File Checker)', 'D. DISM'],
        correct: 0,
        explanation: 'CHKDSK kiểm tra và sửa lỗi hệ thống tập tin trên ổ cứng'
      },
      {
        id: 'q9',
        text: 'Registry Editor (regedit) dùng để làm gì?',
        options: ['A. Chỉnh sửa cơ sở dữ liệu cấu hình Windows', 'B. Quản lý tài khoản người dùng', 'C. Cài đặt phần mềm', 'D. Sao lưu dữ liệu'],
        correct: 0,
        explanation: 'Registry lưu trữ cấu hình hệ thống, phần mềm và người dùng'
      },
      {
        id: 'q10',
        text: 'Windows Update có chức năng gì?',
        options: ['A. Cập nhật bản vá bảo mật và tính năng mới', 'B. Diệt virus', 'C. Tăng tốc máy tính', 'D. Sao lưu dữ liệu'],
        correct: 0,
        explanation: 'Windows Update cung cấp bản vá bảo mật, sửa lỗi và tính năng mới'
      },
    ]
  },
  'troubleshooting': {
    id: 'troubleshooting',
    title: 'Xử Lý Sự Cố',
    icon: '🩺',
    color: '#22c55e',
    description: 'Kỹ năng chẩn đoán và xử lý các sự cố phần cứng, phần mềm thường gặp',
    questions: [
      {
        id: 'q1',
        text: 'PC có đèn nguồn sáng nhưng không lên hình, nên kiểm tra gì đầu tiên?',
        options: ['A. Kiểm tra RAM và GPU cắm chưa', 'B. Thay nguồn mới', 'C. Thay mainboard', 'D. Cài lại Windows'],
        correct: 0,
        explanation: 'RAM lỏng hoặc GPU chưa cắm là nguyên nhân thường gặp nhất'
      },
      {
        id: 'q2',
        text: 'Tiếng beep dài liên tục từ mainboard báo hiệu lỗi gì?',
        options: ['A. Lỗi RAM không được phát hiện', 'B. Lỗi CPU', 'C. Lỗi card đồ họa', 'D. Lỗi nguồn'],
        correct: 0,
        explanation: 'Beep dài liên tục thường báo lỗi RAM theo mã AMI/Phoenix BIOS'
      },
      {
        id: 'q3',
        text: 'Màn hình xanh (BSOD) thường do nguyên nhân gì?',
        options: ['A. Driver lỗi hoặc phần cứng hỏng', 'B. Virus máy tính', 'C. Màn hình bị hỏng', 'D. Thiếu bản cập nhật Windows'],
        correct: 0,
        explanation: 'Driver xung đột hoặc phần cứng lỗi là nguyên nhân chính gây BSOD'
      },
      {
        id: 'q4',
        text: 'CPU nhiệt độ quá cao cần xử lý thế nào?',
        options: ['A. Kiểm tra tản nhiệt, vệ sinh và bôi lại keo tản nhiệt', 'B. Tăng tốc quạt lên tối đa', 'C. Giảm xung nhịp CPU', 'D. Thay case mới'],
        correct: 0,
        explanation: 'Vệ sinh tản nhiệt và thay keo tản nhiệt là giải pháp đầu tiên'
      },
      {
        id: 'q5',
        text: 'PC tự động restart liên tục sau khi bật, nguyên nhân thường là gì?',
        options: ['A. Nguồn yếu hoặc CPU quá nhiệt', 'B. Lỗi RAM', 'C. Cần cài lại Windows', 'D. Driver cũ'],
        correct: 0,
        explanation: 'Nguồn yếu hoặc quá nhiệt là nguyên nhân phổ biến nhất'
      },
      {
        id: 'q6',
        text: 'Không có tín hiệu hình ảnh khi bật máy, nên thử cách nào đầu tiên?',
        options: ['A. Reset CMOS và kiểm tra cáp kết nối màn hình', 'B. Mua card đồ họa mới', 'C. Mua mainboard mới', 'D. Gọi thợ sửa chữa'],
        correct: 0,
        explanation: 'Reset CMOS và kiểm tra cáp đơn giản mà hiệu quả'
      },
      {
        id: 'q7',
        text: 'Ổ cứng phát ra tiếng kêu lạch cạch là dấu hiệu gì?',
        options: ['A. HDD sắp hỏng đầu đọc, cần backup dữ liệu ngay', 'B. Ổ cứng hoạt động bình thường', 'C. Thiếu điện cho ổ cứng', 'D. Lỗi cáp SATA'],
        correct: 0,
        explanation: 'Tiếng lạch cạch (click of death) báo hiệu đầu đọc sắp hỏng'
      },
      {
        id: 'q8',
        text: 'Windows không nhận đủ dung lượng RAM đã lắp, nên kiểm tra gì?',
        options: ['A. Kiểm tra vị trí gắn RAM và vệ sinh chân tiếp xúc', 'B. Mua RAM mới', 'C. Cập nhật BIOS', 'D. Cài driver chipset'],
        correct: 0,
        explanation: 'RAM lỏng hoặc bụi bẩn ở khe cắm thường gây mất nhận diện'
      },
      {
        id: 'q9',
        text: 'Quạt CPU quay nhưng máy không boot, nguyên nhân có thể là gì?',
        options: ['A. Lỗi CPU, RAM hoặc nguồn cấp CPU', 'B. Quạt không đủ mạnh', 'C. Cần cài lại Windows', 'D. Lỗi ổ cứng'],
        correct: 0,
        explanation: 'CPU chưa cắm nguồn EPS hoặc RAM lỏng là nguyên nhân thường gặp'
      },
      {
        id: 'q10',
        text: 'PC chạy chậm, thời gian khởi động lâu nên kiểm tra gì trước tiên?',
        options: ['A. Kiểm tra sức khỏe SSD/HDD và phần mềm khởi động cùng Windows', 'B. Mua thêm RAM', 'C. Cài lại Windows ngay', 'D. Mua máy tính mới'],
        correct: 0,
        explanation: 'SSD yếu hoặc quá nhiều phần mềm khởi động cùng Windows làm chậm máy'
      },
    ]
  },
  'laptop-mobile': {
    id: 'laptop-mobile',
    title: 'Laptop & Thiết Bị Di Động',
    icon: '💻',
    color: '#a855f7',
    description: 'Kiến thức về laptop, linh kiện di động, pin và công nghệ mobile',
    questions: [
      {
        id: 'q1',
        text: 'Chuẩn MXM là gì trong laptop?',
        options: ['A. Chuẩn card đồ họa rời trên laptop', 'B. Chuẩn RAM laptop', 'C. Chuẩn ổ cứng laptop', 'D. Chuẩn kết nối màn hình'],
        correct: 0,
        explanation: 'MXM (Mobile PCI Express Module) là chuẩn GPU rời cho laptop'
      },
      {
        id: 'q2',
        text: 'Soldered RAM (RAM hàn) trên laptop có đặc điểm gì?',
        options: ['A. Được hàn cố định trên mainboard, không thể nâng cấp', 'B. Là RAM rời có thể tháo lắp', 'C. Là RAM ảo do hệ điều hành tạo ra', 'D. Là loại RAM đặc biệt chỉ dùng cho MacBook'],
        correct: 0,
        explanation: 'Soldered RAM được hàn chết, không thể thay thế hoặc nâng cấp'
      },
      {
        id: 'q3',
        text: 'Ultrabook là dòng laptop như thế nào?',
        options: ['A. Mỏng nhẹ, hiệu năng cân bằng, thời lượng pin tốt', 'B. Laptop gaming mạnh mẽ', 'C. Laptop đồ họa chuyên nghiệp', 'D. Laptop giá rẻ cho học sinh'],
        correct: 0,
        explanation: 'Ultrabook là tiêu chuẩn Intel cho laptop mỏng nhẹ, hiệu năng tốt'
      },
      {
        id: 'q4',
        text: 'Cổng Thunderbolt 4 có băng thông tối đa là bao nhiêu?',
        options: ['A. 40 Gbps', 'B. 20 Gbps', 'C. 10 Gbps', 'D. 80 Gbps'],
        correct: 0,
        explanation: 'Thunderbolt 4 và 3 đều có băng thông 40 Gbps'
      },
      {
        id: 'q5',
        text: 'TGP (Total Graphics Power) là chỉ số đo gì trên laptop?',
        options: ['A. Công suất tiêu thụ của GPU trên laptop', 'B. Tốc độ xung nhịp CPU', 'C. Nhiệt độ tối đa cho phép', 'D. Dung lượng pin laptop'],
        correct: 0,
        explanation: 'TGP cho biết mức điện năng GPU laptop được phép tiêu thụ'
      },
      {
        id: 'q6',
        text: 'eGPU (External GPU) là gì?',
        options: ['A. Card đồ họa rời kết nối qua Thunderbolt/USB4', 'B. Card đồ họa tích hợp trong CPU', 'C. Card đồ họa ảo trên cloud', 'D. Card mạng không dây'],
        correct: 0,
        explanation: 'eGPU cho phép laptop sử dụng GPU desktop mạnh qua kết nối ngoài'
      },
      {
        id: 'q7',
        text: 'Laptop gaming thường có trọng lượng khoảng bao nhiêu?',
        options: ['A. 2-3 kg', 'B. 1-1.5 kg', 'C. 3-4 kg', 'D. Dưới 1 kg'],
        correct: 0,
        explanation: 'Laptop gaming nặng 2-3kg do tản nhiệt và linh kiện hiệu năng cao'
      },
      {
        id: 'q8',
        text: 'Pin Lithium Polymer (Li-Po) khác Lithium Ion (Li-Ion) ở điểm gì?',
        options: ['A. Dẻo hơn, nhẹ hơn, thiết kế linh hoạt hơn', 'B. Dung lượng lớn hơn đáng kể', 'C. Tuổi thọ cao hơn nhiều', 'D. Giá thành rẻ hơn'],
        correct: 0,
        explanation: 'Li-Po có thể chế tạo dạng mỏng, dẻo, nhẹ hơn Li-Ion'
      },
      {
        id: 'q9',
        text: 'VRM trên laptop thường có đặc điểm gì?',
        options: ['A. Ít pha hơn và tản nhiệt kém hơn desktop', 'B. Nhiều pha hơn desktop', 'C. Giống hệt VRM desktop', 'D. Không có VRM'],
        correct: 0,
        explanation: 'VRM laptop đơn giản hơn do giới hạn không gian và tản nhiệt'
      },
      {
        id: 'q10',
        text: 'Laptop workstation (như Dell Precision, HP ZBook) dùng cho ai?',
        options: ['A. Đồ họa chuyên nghiệp, CAD, render, khoa học', 'B. Chơi game giải trí', 'C. Văn phòng cơ bản', 'D. Học sinh, sinh viên'],
        correct: 0,
        explanation: 'Workstation được chứng nhận ISV cho phần mềm chuyên nghiệp'
      },
    ]
  },
  'monitor-display': {
    id: 'monitor-display',
    title: 'Màn Hình & Công Nghệ Hiển Thị',
    icon: '🖥️',
    color: '#f43f5e',
    description: 'Kiến thức về màn hình, tấm nền, độ phân giải và công nghệ hiển thị',
    questions: [
      {
        id: 'q1',
        text: 'Tấm nền IPS có ưu điểm chính là gì?',
        options: ['A. Góc nhìn rộng, màu sắc chính xác', 'B. Tần số quét cực cao', 'C. Giá thành rẻ nhất', 'D. Tiết kiệm điện nhất'],
        correct: 0,
        explanation: 'IPS nổi tiếng với góc nhìn rộng (178°) và màu sắc chính xác'
      },
      {
        id: 'q2',
        text: 'Công nghệ OLED khác LCD ở điểm cơ bản nào?',
        options: ['A. Mỗi pixel tự phát sáng, không cần đèn nền', 'B. Cần đèn nền LED', 'C. Giá thành rẻ hơn LCD', 'D. Bền hơn LCD'],
        correct: 0,
        explanation: 'OLED có điểm ảnh tự phát sáng, cho màu đen sâu và tương phản vô cực'
      },
      {
        id: 'q3',
        text: 'HDR (High Dynamic Range) là công nghệ gì?',
        options: ['A. Dải tương phản động rộng, màu sắc sống động hơn', 'B. Công nghệ tần số quét cao', 'C. Công nghệ độ phân giải cao', 'D. Công nghệ hiển thị 3D'],
        correct: 0,
        explanation: 'HDR mở rộng dải tương phản và màu sắc so với SDR'
      },
      {
        id: 'q4',
        text: 'FreeSync là công nghệ đồng bộ hóa của hãng nào?',
        options: ['A. AMD', 'B. NVIDIA', 'C. Intel', 'D. Samsung'],
        correct: 0,
        explanation: 'FreeSync là công nghệ chống xé hình của AMD, dùng chuẩn VESA Adaptive-Sync'
      },
      {
        id: 'q5',
        text: 'G-Sync là công nghệ đồng bộ hóa của hãng nào?',
        options: ['A. NVIDIA', 'B. AMD', 'C. Intel', 'D. LG'],
        correct: 0,
        explanation: 'G-Sync là công nghệ độc quyền của NVIDIA, yêu cầu module phần cứng'
      },
      {
        id: 'q6',
        text: 'Độ phủ màu sRGB 100% nghĩa là gì?',
        options: ['A. Màn hình hiển thị được toàn bộ dải màu chuẩn sRGB', 'B. Màn hình có màu trắng tinh khiết', 'C. Độ sáng đạt 100%', 'D. Màu đen sâu nhất'],
        correct: 0,
        explanation: 'sRGB 100% đảm bảo tái tạo chính xác dải màu tiêu chuẩn'
      },
      {
        id: 'q7',
        text: 'Màn hình 144Hz phù hợp nhất cho đối tượng nào?',
        options: ['A. Game thủ FPS (bắn súng góc nhìn thứ nhất)', 'B. Nhà thiết kế đồ họa', 'C. Nhân viên văn phòng', 'D. Xem phim giải trí'],
        correct: 0,
        explanation: 'Tần số quét cao rất quan trọng cho game FPS cần phản xạ nhanh'
      },
      {
        id: 'q8',
        text: 'Màn hình cong (Curved Monitor) có ưu điểm gì?',
        options: ['A. Trải nghiệm xem nhập vai, giảm mỏi mắt', 'B. Tiết kiệm diện tích bàn làm việc', 'C. Góc nhìn rộng hơn màn hình phẳng', 'D. Giá thành rẻ hơn màn hình phẳng'],
        correct: 0,
        explanation: 'Màn hình cong ôm sát tầm nhìn, tăng cảm giác đắm chìm'
      },
      {
        id: 'q9',
        text: 'Tỉ lệ màn hình 21:9 được gọi là gì?',
        options: ['A. Ultrawide', 'B. Standard', 'C. CinemaScope', 'D. Widescreen'],
        correct: 0,
        explanation: '21:9 là tỉ lệ ultrawide, rộng hơn 16:9 tiêu chuẩn'
      },
      {
        id: 'q10',
        text: 'Màn hình có độ phân giải 2560x1440 được gọi là gì?',
        options: ['A. 1440p (QHD / 2K)', 'B. 1080p (Full HD)', 'C. 4K (UHD)', 'D. 720p (HD)'],
        correct: 0,
        explanation: '2560x1440 là QHD (Quad HD) hay còn gọi là 2K'
      },
    ]
  },
  'ai-tech': {
    id: 'ai-tech',
    title: 'AI & Công Nghệ Mới',
    icon: '🤖',
    color: '#8b5cf6',
    description: 'Kiến thức về trí tuệ nhân tạo, machine learning và công nghệ mới',
    questions: [
      {
        id: 'q1',
        text: 'AI là viết tắt của thuật ngữ nào?',
        options: ['A. Artificial Intelligence', 'B. Automated Interface', 'C. Advanced Integration', 'D. Automated Intelligence'],
        correct: 0,
        explanation: 'AI là Artificial Intelligence - Trí tuệ nhân tạo'
      },
      {
        id: 'q2',
        text: 'Machine Learning (ML) là gì?',
        options: ['A. Máy học từ dữ liệu để cải thiện hiệu suất', 'B. Máy tự suy nghĩ như con người', 'C. Robot vật lý thông minh', 'D. Phần mềm tự động hóa'],
        correct: 0,
        explanation: 'ML là nhánh của AI, cho phép máy học từ dữ liệu mà không cần lập trình cụ thể'
      },
      {
        id: 'q3',
        text: 'Neural Network (mạng nơ-ron) mô phỏng cấu trúc gì?',
        options: ['A. Nơ-ron thần kinh trong não người', 'B. Mạng lưới máy tính', 'C. Mạng xã hội trực tuyến', 'D. Hệ thống tập tin'],
        correct: 0,
        explanation: 'Neural Network lấy cảm hứng từ cấu trúc nơ-ron trong não bộ'
      },
      {
        id: 'q4',
        text: 'GPU quan trọng trong AI/ML vì lý do gì?',
        options: ['A. Khả năng xử lý song song hàng nghìn luồng', 'B. Tiết kiệm điện năng', 'C. Giá thành rẻ hơn CPU', 'D. Kích thước nhỏ gọn'],
        correct: 0,
        explanation: 'GPU có hàng nghìn lõi nhỏ, lý tưởng cho tính toán song song trong AI'
      },
      {
        id: 'q5',
        text: 'Tensor Core là kiến trúc tính toán AI của hãng nào?',
        options: ['A. NVIDIA', 'B. AMD', 'C. Intel', 'D. Google'],
        correct: 0,
        explanation: 'Tensor Core là đơn vị tính toán tensor chuyên dụng cho AI của NVIDIA'
      },
      {
        id: 'q6',
        text: 'TPU (Tensor Processing Unit) là chip AI của hãng nào?',
        options: ['A. Google', 'B. NVIDIA', 'C. AMD', 'D. Apple'],
        correct: 0,
        explanation: 'TPU là chip tùy chỉnh của Google cho machine learning'
      },
      {
        id: 'q7',
        text: 'LLM (Large Language Model) là gì? Cho ví dụ?',
        options: ['A. Mô hình ngôn ngữ lớn như GPT, Claude, Gemini', 'B. Hệ điều hành mới', 'C. Phần mềm thiết kế đồ họa', 'D. Trình duyệt web'],
        correct: 0,
        explanation: 'LLM là mô hình AI xử lý ngôn ngữ tự nhiên, ví dụ: GPT-4, Claude, Gemini'
      },
      {
        id: 'q8',
        text: 'Để huấn luyện (training) AI cần yếu tố nào nhất?',
        options: ['A. Dữ liệu lớn và GPU mạnh', 'B. CPU nhanh nhất', 'C. RAM dung lượng cao', 'D. Ổ cứng dung lượng lớn'],
        correct: 0,
        explanation: 'Training AI cần lượng lớn dữ liệu chất lượng và sức mạnh tính toán GPU'
      },
      {
        id: 'q9',
        text: 'CUDA là nền tảng tính toán song song của hãng nào?',
        options: ['A. NVIDIA', 'B. AMD', 'C. Intel', 'D. Google'],
        correct: 0,
        explanation: 'CUDA cho phép lập trình GPU NVIDIA cho tính toán đa năng'
      },
      {
        id: 'q10',
        text: 'Edge AI là gì?',
        options: ['A. AI chạy trực tiếp trên thiết bị cục bộ (edge devices)', 'B. AI hoạt động trên đám mây', 'C. AI biên giới mới', 'D. AI mạng xã hội'],
        correct: 0,
        explanation: 'Edge AI xử lý dữ liệu ngay trên thiết bị, không cần kết nối cloud'
      },
    ]
  },
  'overclocking': {
    id: 'overclocking',
    title: 'Ép Xung & Tuning',
    icon: '⚡',
    color: '#eab308',
    description: 'Kiến thức về ép xung CPU, RAM, GPU và tối ưu hiệu năng hệ thống',
    questions: [
      {
        id: 'q1',
        text: 'Overclocking là gì?',
        options: ['A. Tăng xung nhịp hoạt động của linh kiện lên cao hơn mặc định', 'B. Giảm xung nhịp để tiết kiệm điện', 'C. Tăng dung lượng RAM ảo', 'D. Cập nhật driver mới nhất'],
        correct: 0,
        explanation: 'Overclocking chạy linh kiện ở tốc độ cao hơn thông số nhà sản xuất'
      },
      {
        id: 'q2',
        text: 'CPU multiplier (hệ số nhân) trong ép xung là gì?',
        options: ['A. Hệ số nhân với bus speed để ra xung nhịp CPU', 'B. Bộ nhân dữ liệu của RAM', 'C. Số nhân vật lý của CPU', 'D. Điện áp cấp cho CPU'],
        correct: 0,
        explanation: 'Xung CPU = Base Clock × Multiplier'
      },
      {
        id: 'q3',
        text: 'Vcore trong ép xung là gì?',
        options: ['A. Điện áp cấp cho lõi CPU', 'B. Tốc độ xung nhịp CPU', 'C. Nhiệt độ lõi CPU', 'D. Bộ nhớ đệm L2'],
        correct: 0,
        explanation: 'Vcore là điện áp lõi CPU, tăng Vcore giúp ổn định khi ép xung'
      },
      {
        id: 'q4',
        text: 'Tăng điện áp (Vcore) quá cao có nguy cơ gì?',
        options: ['A. Gây hỏng CPU do quá nhiệt hoặc quá áp', 'B. Tăng hiệu năng tuyến tính', 'C. Giảm nhiệt độ CPU', 'D. Tiết kiệm điện năng'],
        correct: 0,
        explanation: 'Vcore quá cao gây nhiệt độ cao và có thể phá hủy CPU'
      },
      {
        id: 'q5',
        text: 'Thermal Throttling là gì?',
        options: ['A. CPU tự giảm xung nhịp khi quá nhiệt để bảo vệ', 'B. CPU tự tăng xung khi đủ mát', 'C. Máy tính tự tắt nguồn', 'D. Cảnh báo nhiệt độ bằng âm thanh'],
        correct: 0,
        explanation: 'Thermal throttling bảo vệ CPU khỏi hư hỏng do nhiệt độ quá cao'
      },
      {
        id: 'q6',
        text: 'Precision Boost Overdrive (PBO) là công nghệ ép xung tự động của hãng nào?',
        options: ['A. AMD', 'B. Intel', 'C. NVIDIA', 'D. MSI'],
        correct: 0,
        explanation: 'PBO là công nghệ ép xung tự động của AMD dành cho CPU Ryzen'
      },
      {
        id: 'q7',
        text: 'Intel XTU (Extreme Tuning Utility) là phần mềm gì?',
        options: ['A. Ép xung và tinh chỉnh CPU Intel', 'B. Test hiệu năng GPU', 'C. Điều khiển quạt tản nhiệt', 'D. Cập nhật driver Intel'],
        correct: 0,
        explanation: 'Intel XTU cho phép ép xung và theo dõi CPU Intel trên Windows'
      },
      {
        id: 'q8',
        text: 'Undervolting là kỹ thuật gì?',
        options: ['A. Giảm điện áp CPU để giảm nhiệt, vẫn giữ hiệu năng', 'B. Tăng điện áp để ép xung', 'C. Giảm xung nhịp CPU', 'D. Tăng xung nhịp CPU'],
        correct: 0,
        explanation: 'Undervolting giúp giảm nhiệt và tiết kiệm điện mà không mất hiệu năng'
      },
      {
        id: 'q9',
        text: 'Memory Timing (thông số thời gian RAM) là gì?',
        options: ['A. Các thông số độ trễ của RAM như CL, tRCD, tRP...', 'B. Tốc độ xung nhịp của RAM', 'C. Dung lượng của RAM', 'D. Loại RAM DDR4 hay DDR5'],
        correct: 0,
        explanation: 'Timings là các thông số độ trễ, càng thấp càng nhanh'
      },
      {
        id: 'q10',
        text: '"Silicon Lottery" (xổ số silicon) nói về điều gì?',
        options: ['A. Chất lượng chip khác nhau giữa các CPU cùng loại', 'B. Trò chơi may rủi với linh kiện', 'C. Tên một hãng sản xuất chip', 'D. Phiên bản giới hạn của CPU'],
        correct: 0,
        explanation: 'Mỗi chip có chất lượng silicon khác nhau, ảnh hưởng khả năng ép xung'
      },
    ]
  },
  'benchmark': {
    id: 'benchmark',
    title: 'Đánh Giá Hiệu Năng',
    icon: '📊',
    color: '#0ea5e9',
    description: 'Kiến thức về benchmark, phần mềm kiểm tra và đánh giá hiệu năng PC',
    questions: [
      {
        id: 'q1',
        text: 'Cinebench là phần mềm dùng để test hiệu năng gì?',
        options: ['A. Hiệu năng CPU (render đa nhân và đơn nhân)', 'B. Hiệu năng GPU chơi game', 'C. Tốc độ đọc ghi ổ cứng', 'D. Nhiệt độ và điện áp hệ thống'],
        correct: 0,
        explanation: 'Cinebench render ảnh 3D để đánh giá hiệu năng CPU'
      },
      {
        id: 'q2',
        text: '3DMark là phần mềm benchmark dùng cho mục đích gì?',
        options: ['A. Đánh giá hiệu năng đồ họa game', 'B. Test CPU đa luồng đơn thuần', 'C. Đo tốc độ RAM', 'D. Kiểm tra pin laptop'],
        correct: 0,
        explanation: '3DMark test hiệu năng gaming qua các cảnh đồ họa thực tế'
      },
      {
        id: 'q3',
        text: 'CrystalDiskMark dùng để làm gì?',
        options: ['A. Đo tốc độ đọc/ghi của ổ cứng SSD/HDD', 'B. Test hiệu năng GPU', 'C. Benchmark CPU đa nhân', 'D. Kiểm tra độ ổn định RAM'],
        correct: 0,
        explanation: 'CrystalDiskMark đo tốc độ tuần tự và ngẫu nhiên của ổ lưu trữ'
      },
      {
        id: 'q4',
        text: 'FPS là viết tắt của thuật ngữ nào trong game?',
        options: ['A. Frames Per Second (khung hình trên giây)', 'B. Focus Point System', 'C. Fast Processing Speed', 'D. Frequency Per Second'],
        correct: 0,
        explanation: 'FPS đo số khung hình hiển thị mỗi giây, càng cao càng mượt'
      },
      {
        id: 'q5',
        text: 'Chỉ số 1% Low FPS cho biết điều gì?',
        options: ['A. FPS thấp nhất trong 1% thời gian, đo độ giật lag', 'B. FPS trung bình của game', 'C. FPS cao nhất đạt được', 'D. Độ trễ input lag'],
        correct: 0,
        explanation: '1% Low càng cao, trải nghiệm càng mượt, ít giật'
      },
      {
        id: 'q6',
        text: 'Stress test CPU dùng để làm gì?',
        options: ['A. Kiểm tra độ ổn định và nhiệt độ khi CPU hoạt động tối đa', 'B. Đo tốc độ CPU thông thường', 'C. Test khả năng ép xung', 'D. Kiểm tra tốc độ khởi động'],
        correct: 0,
        explanation: 'Stress test đẩy CPU lên 100% để kiểm tra ổn định và nhiệt'
      },
      {
        id: 'q7',
        text: 'Phần mềm HWMonitor dùng để làm gì?',
        options: ['A. Theo dõi nhiệt độ, điện áp, tốc độ quạt', 'B. Benchmark GPU', 'C. Test tốc độ RAM', 'D. Đo tốc độ mạng Internet'],
        correct: 0,
        explanation: 'HWMonitor hiển thị cảm biến nhiệt độ, điện áp, xung nhịp và quạt'
      },
      {
        id: 'q8',
        text: 'OCCT là phần mềm chuyên dùng để làm gì?',
        options: ['A. Stress test toàn diện CPU, GPU, RAM, nguồn', 'B. Chỉnh sửa ảnh chuyên nghiệp', 'C. Chơi game trực tuyến', 'D. Lập trình và code'],
        correct: 0,
        explanation: 'OCCT test ổn định toàn bộ hệ thống với nhiều dạng tải khác nhau'
      },
      {
        id: 'q9',
        text: 'PassMark có đặc điểm gì trong benchmark?',
        options: ['A. Đánh giá tổng thể toàn bộ hệ thống PC', 'B. Chỉ test CPU', 'C. Chỉ test GPU', 'D. Chỉ tốc độ ổ cứng'],
        correct: 0,
        explanation: 'PassMark đưa ra điểm tổng hợp cho CPU, GPU, RAM, ổ cứng'
      },
      {
        id: 'q10',
        text: 'Geekbench đánh giá hiệu năng ở khía cạnh nào?',
        options: ['A. CPU đơn nhân và đa nhân đa nền tảng', 'B. GPU gaming', 'C. RAM và bộ nhớ đệm', 'D. Tốc độ Internet'],
        correct: 0,
        explanation: 'Geekbench cho điểm đơn nhân và đa nhân, so sánh được giữa các nền tảng'
      },
    ]
  },
  'pc-gaming': {
    id: 'pc-gaming',
    title: 'Cấu Hình PC Gaming',
    icon: '🎯',
    color: '#dc2626',
    description: 'Kiến thức về xây dựng cấu hình PC chơi game các tầm giá',
    questions: [
      {
        id: 'q1',
        text: 'Card đồ họa tầm trung phù hợp cho PC gaming 2024 là gì?',
        options: ['A. RTX 4060 / RX 7600', 'B. RTX 4090', 'C. GT 1030', 'D. RTX 3060'],
        correct: 0,
        explanation: 'RTX 4060 và RX 7600 là lựa chọn tầm trung tốt nhất'
      },
      {
        id: 'q2',
        text: 'CPU gaming được đánh giá tốt nhất hiện nay cho game thủ?',
        options: ['A. AMD Ryzen 7 7800X3D', 'B. Intel Core i9-14900K', 'C. AMD Ryzen 5 7600', 'D. Intel Core i5-14600K'],
        correct: 0,
        explanation: '7800X3D với 3D V-Cache cho hiệu năng gaming vượt trội'
      },
      {
        id: 'q3',
        text: 'Dung lượng RAM tối thiểu cho PC gaming hiện nay là bao nhiêu?',
        options: ['A. 16GB', 'B. 8GB', 'C. 32GB', 'D. 64GB'],
        correct: 0,
        explanation: '16GB là tối thiểu cho gaming hiện đại, 32GB khuyên dùng'
      },
      {
        id: 'q4',
        text: 'Loại SSD nào cần thiết cho PC gaming để load game nhanh?',
        options: ['A. NVMe PCIe 4.0 / 5.0', 'B. SATA SSD', 'C. HDD 7200RPM', 'D. NVMe PCIe 3.0'],
        correct: 0,
        explanation: 'NVMe PCIe 4.0 với tốc độ cao giúp giảm thời gian load game'
      },
      {
        id: 'q5',
        text: 'Công suất nguồn phù hợp cho PC gaming tầm trung là bao nhiêu?',
        options: ['A. 650W - 750W', 'B. 450W - 550W', 'C. 850W - 1000W', 'D. 300W - 400W'],
        correct: 0,
        explanation: '650-750W đủ cho cấu hình tầm trung với RTX 4060/4070'
      },
      {
        id: 'q6',
        text: 'Tản nhiệt cho CPU gaming nên chọn loại nào?',
        options: ['A. AIO 240mm hoặc tản khí tower kép cao cấp', 'B. Tản nhiệt stock đi kèm CPU', 'C. Chỉ cần quạt case', 'D. Custom loop water cooling'],
        correct: 0,
        explanation: 'AIO 240mm hoặc tower kép đủ cho hầu hết CPU gaming'
      },
      {
        id: 'q7',
        text: 'Mainboard cho PC gaming nên chọn chipset nào?',
        options: ['A. B650 (AMD) hoặc Z790 (Intel)', 'B. H610 (Intel) rẻ tiền', 'C. A520 (AMD) cơ bản', 'D. X670 (AMD) cao cấp'],
        correct: 0,
        explanation: 'B650 và Z790 cân bằng giữa tính năng và giá cho gaming'
      },
      {
        id: 'q8',
        text: 'Khi chọn case cho PC gaming cần lưu ý điều gì nhất?',
        options: ['A. Luồng khí tốt và đủ không gian cho GPU dài', 'B. Nhiều đèn RGB', 'C. Giá rẻ nhất có thể', 'D. Kích thước nhỏ gọn'],
        correct: 0,
        explanation: 'Case cần airflow tốt và đủ dài cho GPU gaming hiện đại'
      },
      {
        id: 'q9',
        text: 'GPU nào đủ mạnh để chơi game ở độ phân giải 4K 60FPS?',
        options: ['A. RTX 4080 trở lên', 'B. RTX 4060', 'C. RX 7600', 'D. GTX 1660 Super'],
        correct: 0,
        explanation: '4K gaming yêu cầu GPU cao cấp như RTX 4080/4090 hoặc RX 7900 XTX'
      },
      {
        id: 'q10',
        text: 'Tỉ lệ phân bổ ngân sách CPU/GPU hợp lý cho PC gaming là bao nhiêu?',
        options: ['A. 30% CPU, 40% GPU', 'B. 50% CPU, 30% GPU', 'C. 20% CPU, 60% GPU', 'D. 40% CPU, 40% GPU'],
        correct: 0,
        explanation: 'GPU chiếm phần lớn ngân sách vì quan trọng nhất cho gaming'
      },
    ]
  },
  'server-workstation': {
    id: 'server-workstation',
    title: 'Máy Chủ & Workstation',
    icon: '🏢',
    color: '#7c3aed',
    description: 'Kiến thức về máy chủ, workstation, server hardware và trung tâm dữ liệu',
    questions: [
      {
        id: 'q1',
        text: 'CPU thường dùng cho máy chủ (server) là dòng nào?',
        options: ['A. Intel Xeon / AMD EPYC', 'B. Intel Core i9', 'C. AMD Ryzen 9', 'D. Intel Core i5'],
        correct: 0,
        explanation: 'Xeon và EPYC được thiết kế cho server với nhiều lõi, ECC hỗ trợ'
      },
      {
        id: 'q2',
        text: 'ECC RAM khác RAM thường (non-ECC) ở điểm gì?',
        options: ['A. Có khả năng phát hiện và sửa lỗi dữ liệu tự động', 'B. Tốc độ nhanh hơn', 'C. Dung lượng lớn hơn', 'D. Giá thành rẻ hơn'],
        correct: 0,
        explanation: 'ECC tự động sửa lỗi bit, rất quan trọng cho server và workstation'
      },
      {
        id: 'q3',
        text: 'RAID 1 là gì?',
        options: ['A. Nhân bản (mirror) dữ liệu giữa 2 ổ cứng', 'B. Dự phòng chẵn lẻ (parity)', 'C. Ghép ổ tăng tốc (striping)', 'D. Kết hợp RAID 0 và 1'],
        correct: 0,
        explanation: 'RAID 1 ghi dữ liệu giống hệt lên 2 ổ, nếu 1 ổ hỏng vẫn còn dữ liệu'
      },
      {
        id: 'q4',
        text: 'Uptime trong ngữ cảnh server là gì?',
        options: ['A. Thời gian hệ thống hoạt động liên tục không gián đoạn', 'B. Tốc độ kết nối mạng', 'C. Dung lượng lưu trữ khả dụng', 'D. Băng thông Internet'],
        correct: 0,
        explanation: 'Uptime đo thời gian server hoạt động không restart từ lần boot cuối'
      },
      {
        id: 'q5',
        text: 'Kích thước rack mount server được đo bằng đơn vị gì?',
        options: ['A. U (1U, 2U, 4U)', 'B. ATX, Micro-ATX', 'C. Inch', 'D. Mét'],
        correct: 0,
        explanation: '1U = 1.75 inch chiều cao rack server'
      },
      {
        id: 'q6',
        text: 'Tính năng Hot Swap cho phép làm gì?',
        options: ['A. Thay ổ cứng khi hệ thống đang chạy mà không tắt nguồn', 'B. Tăng tốc xử lý dữ liệu', 'C. Sao lưu dữ liệu tự động', 'D. Chịu lỗi hệ thống'],
        correct: 0,
        explanation: 'Hot swap cho phép thay ổ cứng nóng mà không ảnh hưởng hệ thống'
      },
      {
        id: 'q7',
        text: 'Virtualization (ảo hóa) trong server cho phép làm gì?',
        options: ['A. Chạy nhiều máy chủ ảo trên 1 máy chủ vật lý', 'B. Tăng dung lượng RAM', 'C. Tạo mạng nội bộ ảo', 'D. Lưu trữ đám mây'],
        correct: 0,
        explanation: 'Ảo hóa chia 1 server vật lý thành nhiều VM độc lập'
      },
      {
        id: 'q8',
        text: 'NAS (Network Attached Storage) dùng để làm gì?',
        options: ['A. Lưu trữ tập trung qua mạng cho nhiều người dùng', 'B. Chạy web server động', 'C. Render đồ họa 3D', 'D. Chơi game trực tuyến'],
        correct: 0,
        explanation: 'NAS là thiết bị lưu trữ mạng, chia sẻ file qua LAN/Internet'
      },
      {
        id: 'q9',
        text: 'GPU trong workstation chuyên nghiệp thường dùng dòng nào?',
        options: ['A. NVIDIA RTX/Quadro, AMD Radeon Pro', 'B. Card gaming GeForce GTX/RTX thường', 'C. Card đồ họa tích hợp', 'D. Card server không có xuất hình'],
        correct: 0,
        explanation: 'Card workstation có driver ISV certified cho ứng dụng chuyên nghiệp'
      },
      {
        id: 'q10',
        text: 'UPS (Uninterruptible Power Supply) có tác dụng gì?',
        options: ['A. Cấp điện tạm thời khi mất điện, bảo vệ thiết bị', 'B. Tăng tốc độ xử lý của PC', 'C. Tiết kiệm hóa đơn tiền điện', 'D. Giảm nhiệt độ thiết bị'],
        correct: 0,
        explanation: 'UPS giữ cho hệ thống chạy tạm thời và tắt an toàn khi mất điện'
      },
    ]
  },
  'cable-connectivity': {
    id: 'cable-connectivity',
    title: 'Cáp Kết Nối & Chuẩn Giao Tiếp',
    icon: '🔗',
    color: '#64748b',
    description: 'Kiến thức về cáp kết nối, chuẩn giao tiếp phần cứng và đấu nối',
    questions: [
      {
        id: 'q1',
        text: 'Cáp dữ liệu SATA có bao nhiêu chân?',
        options: ['A. 7 chân', 'B. 15 chân', 'C. 4 chân', 'D. 24 chân'],
        correct: 0,
        explanation: 'SATA data cable có 7 chân, còn SATA power có 15 chân'
      },
      {
        id: 'q2',
        text: 'Cáp nguồn SATA (SATA power) có bao nhiêu chân?',
        options: ['A. 15 chân', 'B. 7 chân', 'C. 4 chân', 'D. 24 chân'],
        correct: 0,
        explanation: 'SATA power 15 chân cung cấp 3.3V, 5V và 12V'
      },
      {
        id: 'q3',
        text: 'Cáp HDMI có hỗ trợ truyền tín hiệu âm thanh không?',
        options: ['A. Có, HDMI tích hợp cả âm thanh và hình ảnh', 'B. Không, chỉ truyền hình ảnh', 'C. Chỉ hỗ trợ âm thanh stereo', 'D. Cần cáp âm thanh riêng'],
        correct: 0,
        explanation: 'HDMI truyền cả video và audio qua một cáp duy nhất'
      },
      {
        id: 'q4',
        text: 'Cáp quang (Fiber Optic) truyền tín hiệu bằng gì?',
        options: ['A. Xung ánh sáng qua sợi thủy tinh', 'B. Xung điện qua dây đồng', 'C. Sóng radio qua không khí', 'D. Từ trường'],
        correct: 0,
        explanation: 'Fiber optic dùng ánh sáng, cho tốc độ cao và khoảng cách xa'
      },
      {
        id: 'q5',
        text: 'Cổng USB 3.0 có màu sắc đặc trưng là gì?',
        options: ['A. Màu xanh dương (blue)', 'B. Màu đen', 'C. Màu đỏ', 'D. Màu vàng'],
        correct: 0,
        explanation: 'USB 3.0/3.1 thường có màu xanh dương để nhận biết'
      },
      {
        id: 'q6',
        text: 'Cáp Thunderbolt 3 sử dụng đầu nối dạng nào?',
        options: ['A. USB Type-C', 'B. Mini DisplayPort', 'C. USB Type-A', 'D. Lightning'],
        correct: 0,
        explanation: 'Thunderbolt 3 dùng đầu nối USB Type-C, tích hợp PCIe và DisplayPort'
      },
      {
        id: 'q7',
        text: 'RGB header trên mainboard có mấy loại chính?',
        options: ['A. 4-pin 12V RGB và 3-pin 5V ARGB', 'B. 2-pin duy nhất', 'C. 6-pin RGB', 'D. SATA power'],
        correct: 0,
        explanation: 'RGB (4-pin 12V) và ARGB (3-pin 5V) là 2 chuẩn phổ biến'
      },
      {
        id: 'q8',
        text: 'Fan header (đầu cắm quạt) trên mainboard thường là loại nào?',
        options: ['A. 4-pin PWM (điều chỉnh tốc độ)', 'B. 3-pin DC cố định', 'C. 2-pin đơn giản', 'D. SATA power'],
        correct: 0,
        explanation: '4-pin PWM cho phép mainboard điều chỉnh tốc độ quạt tự động'
      },
      {
        id: 'q9',
        text: 'Cáp mạng RJ45 (Ethernet) có bao nhiêu chân?',
        options: ['A. 8 chân (4 cặp xoắn)', 'B. 4 chân', 'C. 6 chân', 'D. 10 chân'],
        correct: 0,
        explanation: 'Cáp RJ45 có 8 chân tương ứng 4 cặp dây xoắn'
      },
      {
        id: 'q10',
        text: 'Cable management (quản lý dây) trong case PC là gì?',
        options: ['A. Sắp xếp dây cáp gọn gàng để tối ưu luồng khí', 'B. Làm dây cáp tùy chỉnh theo ý thích', 'C. Nối dây điện kéo dài', 'D. Cố định dây bằng keo'],
        correct: 0,
        explanation: 'Cable management giúp case gọn đẹp và luồng khí lưu thông tốt hơn'
      },
    ]
  },
  'virtual-reality': {
    id: 'virtual-reality',
    title: 'Thực Tế Ảo (VR) & AR',
    icon: '🥽',
    color: '#d946ef',
    description: 'Kiến thức về thực tế ảo, thực tế tăng cường, thiết bị VR/AR và ứng dụng',
    questions: [
      {
        id: 'q1',
        text: 'VR là viết tắt của thuật ngữ gì?',
        options: ['A. Virtual Reality (Thực tế ảo)', 'B. Visual Reality', 'C. Video Recording', 'D. Virtual Resource'],
        correct: 0,
        explanation: 'VR tạo ra môi trường hoàn toàn ảo để người dùng tương tác'
      },
      {
        id: 'q2',
        text: 'Headset VR phổ biến nhất hiện nay là gì?',
        options: ['A. Meta Quest 3, Valve Index, PlayStation VR2', 'B. Samsung Galaxy Watch', 'C. Apple Vision Pro', 'D. Nintendo Switch'],
        correct: 0,
        explanation: 'Meta Quest 3 là headset VR phổ biến nhất với giá phải chăng'
      },
      {
        id: 'q3',
        text: 'Cấu hình PC tối thiểu cho VR gaming là gì?',
        options: ['A. RTX 3060 + Core i5 + 16GB RAM', 'B. GTX 1650 + Core i3', 'C. Card đồ họa tích hợp', 'D. RTX 4090 + Core i9'],
        correct: 0,
        explanation: 'VR yêu cầu GPU mạnh để đạt 90 FPS ở độ phân giải cao'
      },
      {
        id: 'q4',
        text: 'Inside-out tracking trong VR là gì?',
        options: ['A. Camera trên headset tự theo dõi vị trí, không cần trạm ngoài', 'B. Cần đặt trạm theo dõi trong phòng', 'C. Chỉ theo dõi tay cầm', 'D. Theo dõi chuyển động mắt'],
        correct: 0,
        explanation: 'Inside-out dùng camera tích hợp trên headset để định vị không gian'
      },
      {
        id: 'q5',
        text: 'FOV (Field of View) trong VR là gì?',
        options: ['A. Trường nhìn, góc quan sát trong headset VR', 'B. Tốc độ khung hình', 'C. Độ phân giải màn hình', 'D. Khoảng cách tối đa'],
        correct: 0,
        explanation: 'FOV thường 100-120 độ, càng rộng càng nhập vai'
      },
      {
        id: 'q6',
        text: 'AR (Augmented Reality) khác VR (Virtual Reality) ở điểm nào?',
        options: ['A. AR thêm đối tượng ảo vào thế giới thật, VR thay thế hoàn toàn', 'B. AR tạo môi trường hoàn toàn ảo', 'C. AR không cần thiết bị đặc biệt', 'D. AR không tương tác được'],
        correct: 0,
        explanation: 'AR chồng lớp thông tin ảo lên thế giới thực (Pokemon Go, HoloLens)'
      },
      {
        id: 'q7',
        text: 'Độ trễ (lag) cao trong VR có thể gây ra vấn đề gì?',
        options: ['A. Motion sickness (say tàu xe ảo), chóng mặt', 'B. Hình ảnh bị giật nhẹ', 'C. Mất kết nối âm thanh', 'D. Giảm chất lượng đồ họa'],
        correct: 0,
        explanation: 'VR yêu cầu độ trễ cực thấp để tránh gây khó chịu'
      },
      {
        id: 'q8',
        text: 'Tần số quét (refresh rate) tối thiểu của headset VR chất lượng là bao nhiêu?',
        options: ['A. 90Hz', 'B. 60Hz', 'C. 120Hz', 'D. 144Hz'],
        correct: 0,
        explanation: '90Hz là tối thiểu, 120Hz trở lên cho trải nghiệm VR tốt nhất'
      },
      {
        id: 'q9',
        text: 'SteamVR là nền tảng phần mềm của hãng nào?',
        options: ['A. Valve', 'B. Meta (Facebook)', 'C. Microsoft', 'D. Sony'],
        correct: 0,
        explanation: 'SteamVR của Valve hỗ trợ nhiều headset và game VR'
      },
      {
        id: 'q10',
        text: 'Tính năng Passthrough trên headset VR cho phép làm gì?',
        options: ['A. Nhìn thấy thế giới thật qua camera mà không cần tháo headset', 'B. Xuyên tường trong game', 'C. Truyền dữ liệu tốc độ cao', 'D. Kết nối không dây với PC'],
        correct: 0,
        explanation: 'Passthrough giúp người dùng quan sát môi trường thực tế khi đang đeo headset'
      },
    ]
  },
  'cybersecurity': {
    id: 'cybersecurity',
    title: 'An Ninh Mạng Cơ Bản',
    icon: '🔒',
    color: '#059669',
    description: 'Kiến thức cơ bản về an ninh mạng, bảo mật và phòng chống tấn công',
    questions: [
      {
        id: 'q1',
        text: 'Firewall (tường lửa) có chức năng gì?',
        options: ['A. Kiểm soát và lọc lưu lượng mạng vào/ra', 'B. Tăng tốc kết nối Internet', 'C. Lưu trữ dữ liệu tạm thời', 'D. Diệt virus tự động'],
        correct: 0,
        explanation: 'Firewall ngăn chặn truy cập trái phép từ/tới mạng máy tính'
      },
      {
        id: 'q2',
        text: 'Malware là gì?',
        options: ['A. Phần mềm độc hại gây hại cho máy tính', 'B. Phần mềm diệt virus', 'C. Phần mềm hợp pháp', 'D. Trình duyệt web'],
        correct: 0,
        explanation: 'Malware bao gồm virus, trojan, ransomware, spyware...'
      },
      {
        id: 'q3',
        text: 'Phishing là hình thức tấn công như thế nào?',
        options: ['A. Lừa đảo lấy thông tin nhạy cảm qua email/website giả mạo', 'B. Tấn công từ chối dịch vụ', 'C. Lây nhiễm virus qua USB', 'D. Đánh cắp mật khẩu qua mạng WiFi'],
        correct: 0,
        explanation: 'Phishing giả mạo tổ chức uy tín để lừa nạn nhân cung cấp thông tin'
      },
      {
        id: 'q4',
        text: 'Mật khẩu mạnh nên có những yếu tố nào?',
        options: ['A. Kết hợp chữ hoa, chữ thường, số, ký tự đặc biệt, dài 12+ ký tự', 'B. Dùng tên và ngày tháng năm sinh', 'C. Dùng mật khẩu 123456', 'D. Dùng từ điển phổ biến'],
        correct: 0,
        explanation: 'Mật khẩu mạnh khó đoán và khó bị brute-force'
      },
      {
        id: 'q5',
        text: '2FA (Two-Factor Authentication) là gì?',
        options: ['A. Xác thực 2 yếu tố: mật khẩu + mã xác nhận thứ 2', 'B. Đăng nhập 2 lần', 'C. 2 tài khoản khác nhau', 'D. 2 mật khẩu khác nhau'],
        correct: 0,
        explanation: '2FA thêm lớp bảo vệ thứ 2 (SMS, app authenticator, vân tay...)'
      },
      {
        id: 'q6',
        text: 'Ransomware là loại mã độc gì?',
        options: ['A. Mã độc mã hóa dữ liệu và đòi tiền chuộc', 'B. Phần mềm quảng cáo', 'C. Virus làm hỏng phần cứng', 'D. Phần mềm gián điệp'],
        correct: 0,
        explanation: 'Ransomware mã hóa file nạn nhân, yêu cầu trả tiền để giải mã'
      },
      {
        id: 'q7',
        text: 'VPN (Virtual Private Network) có tác dụng gì?',
        options: ['A. Mã hóa kết nối Internet và ẩn địa chỉ IP', 'B. Tăng tốc Internet', 'C. Miễn phí hoàn toàn', 'D. Diệt virus trực tuyến'],
        correct: 0,
        explanation: 'VPN tạo kênh mã hóa an toàn giữa thiết bị và server VPN'
      },
      {
        id: 'q8',
        text: 'Xác thực sinh trắc học (biometric) trên PC là gì?',
        options: ['A. Đăng nhập bằng vân tay, khuôn mặt hoặc mống mắt', 'B. Đăng nhập bằng giọng nói', 'C. Xác thực qua email', 'D. Mật khẩu hình vẽ'],
        correct: 0,
        explanation: 'Windows Hello hỗ trợ vân tay và nhận diện khuôn mặt'
      },
      {
        id: 'q9',
        text: 'Cách phát hiện email lừa đảo (phishing) là gì?',
        options: ['A. Kiểm tra địa chỉ người gửi, lỗi chính tả, link đáng ngờ', 'B. Click vào link để kiểm tra', 'C. Forward cho bạn bè', 'D. Trả lời email để xác nhận'],
        correct: 0,
        explanation: 'Email giả thường có địa chỉ lạ, lỗi chính tả và link đáng ngờ'
      },
      {
        id: 'q10',
        text: 'Cập nhật phần mềm và hệ điều hành thường xuyên có tác dụng gì?',
        options: ['A. Vá các lỗ hổng bảo mật đã được phát hiện', 'B. Làm chậm máy tính', 'C. Tốn dung lượng ổ cứng', 'D. Không cần thiết'],
        correct: 0,
        explanation: 'Cập nhật vá lỗ hổng zero-day và bảo vệ trước các mối đe dọa mới'
      },
    ]
  }
};

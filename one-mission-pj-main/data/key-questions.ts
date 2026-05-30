export interface KeyQuestion {
  q: string
  a: string
}

export const KEY_QUESTIONS: Record<string, KeyQuestion[]> = {
  'Bộ vi xử lý (CPU)': [
    { q: 'CPU ảnh hưởng thế nào đến hiệu năng máy tính?', a: 'CPU quyết định tốc độ xử lý tính toán. Số nhân (cores) càng nhiều càng xử lý đa nhiệm tốt. Xung nhịp (GHz) càng cao càng xử lý nhanh từng tác vụ. Cache lớn giúp giảm độ trễ truy xuất dữ liệu.' },
    { q: 'Nên chọn CPU Intel hay AMD?', a: 'Intel Core i5 phù hợp đa số người dùng, i7/i9 cho gaming/hiệu năng cao. AMD Ryzen 5/7 có giá cạnh tranh, Ryzen 9 cho workstation. Quan trọng nhất là chọn theo ngân sách và nhu cầu.' },
    { q: 'Socket CPU là gì và tại sao quan trọng?', a: 'Socket là đế cắm CPU trên mainboard. Intel LGA1700 chỉ dùng cho CPU thế hệ 12-14, AMD AM5 dùng cho Ryzen 7000+. Phải chọn mainboard cùng socket với CPU.' },
    { q: 'TDP có ý nghĩa gì khi chọn CPU?', a: 'TDP (Thermal Design Power) cho biết nhiệt lượng CPU tỏa ra. TDP cao cần tản nhiệt tốt hơn. Ví dụ: CPU 65W dùng tản khí, 125W+ nên dùng tản nước AIO.' },
  ],
  'RAM & SSD': [
    { q: 'Nên chọn DDR4 hay DDR5?', a: 'DDR5 mới hơn, tốc độ cao hơn (4800-8400 MT/s) nhưng đắt hơn. DDR4 đủ dùng cho đa số tác vụ, giá rẻ hơn. DDR4 và DDR5 không tương thích ngược.' },
    { q: 'Bao nhiêu RAM là đủ?', a: '8GB: văn phòng cơ bản. 16GB: gaming, đa nhiệm (khuyến nghị). 32GB: đồ họa, dựng phim, máy ảo. 64GB+: workstation chuyên nghiệp.' },
    { q: 'SSD NVMe khác SATA thế nào?', a: 'NVMe tốc độ 7000 MB/s (gấp 10+ lần SATA 550 MB/s). NVMe dạng M.2 cắm thẳng mainboard. SATA dùng cáp, chậm hơn nhưng tương thích rộng.' },
    { q: 'Nên mua SSD dung lượng bao nhiêu?', a: '250GB: cài Windows + ứng dụng cơ bản. 500GB-1TB: tiêu chuẩn cho gaming. 2TB+: lưu nhiều game, dữ liệu lớn. Luôn dùng SSD cho ổ chính.' },
  ],
  'Card đồ họa (GPU)': [
    { q: 'GPU quan trọng thế nào với gaming?', a: 'GPU là linh kiện quan trọng nhất cho gaming. Nó xử lý đồ họa, render hình ảnh. GPU mạnh = FPS cao, hình ảnh đẹp, chơi được độ phân giải cao.' },
    { q: 'Nên chọn NVIDIA hay AMD?', a: 'NVIDIA RTX có Ray Tracing, DLSS (AI tăng FPS), CUDA cho công việc. AMD Radeon RX giá cạnh tranh, FSR tương tự DLSS. NVIDIA chiếm ưu thế ở phân khúc cao cấp.' },
    { q: 'VRAM bao nhiêu là đủ?', a: '4GB: game cũ, eSports. 6-8GB: game 1080p (tối thiểu). 12GB: game 1440p (khuyến nghị). 16GB+: game 4K, dựng phim, AI.' },
    { q: 'Ray Tracing và DLSS là gì?', a: 'Ray Tracing: mô phỏng ánh sáng thực tế (phản chiếu, đổ bóng) — đẹp nhưng nặng. DLSS: AI nâng độ phân giải thấp lên cao — tăng FPS mà giữ chất lượng.' },
  ],
  'Nguồn & Tản nhiệt': [
    { q: 'Chọn nguồn công suất bao nhiêu?', a: 'Tính tổng TDP linh kiện + 20-30% dư. 450-550W: PC văn phòng. 550-650W: PC gaming tầm trung. 750-850W: gaming cao cấp. 1000W+: SLI/Crossfire.' },
    { q: '80 Plus là gì?', a: 'Chứng nhận hiệu suất nguồn: White 80%, Bronze 82-85%, Silver 85-88%, Gold 87-90%, Platinum 89-92%, Titanium 90-96%. Nên chọn Gold trở lên.' },
    { q: 'Nên dùng tản khí hay tản nước?', a: 'Tản khí: rẻ, dễ lắp, bền, đủ cho CPU tầm trung (65-105W). Tản nước AIO: hiệu quả hơn, ồn ít hơn, cần cho CPU cao cấp (125W+), đẹp hơn.' },
    { q: 'Nguồn modular là gì?', a: 'Nguồn modular có dây cáp tháo rời được. Chỉ cắm dây cần dùng → quản lý dây gọn gàng, luồng khí tốt hơn. Nên chọn modular hoặc semi-modular.' },
  ],
  'Bo mạch chủ': [
    { q: 'Cách chọn mainboard phù hợp?', a: 'Chọn theo socket CPU (Intel LGA1700/AMD AM5), chipset (Z790/B760 cho Intel, B650/X670 cho AMD), form factor (ATX/M-ATX/ITX), đủ cổng kết nối.' },
    { q: 'Chipset nào cho nhu cầu nào?', a: 'H610: cơ bản, rẻ. B660/B760: trung bình, ép xung RAM. Z690/Z790: cao cấp, ép xung CPU. B650: AMD tầm trung. X670/X870: AMD cao cấp.' },
    { q: 'ATX, M-ATX, ITX khác nhau thế nào?', a: 'ATX: đầy đủ khe mở rộng (4 khe RAM, nhiều PCIe). M-ATX: nhỏ gọn hơn, ít khe hơn. ITX: rất nhỏ, chỉ 2 khe RAM, 1 khe PCIe, dùng cho PC nhỏ.' },
    { q: 'VRM trên mainboard có tác dụng gì?', a: 'VRM (Voltage Regulator Module) cấp điện ổn định cho CPU. VRM tốt giúp CPU chạy ổn định, đặc biệt khi ép xung. Mainboard cao cấp có VRM nhiều pha hơn.' },
  ],
  'Lưu trữ dữ liệu': [
    { q: 'SSD hay HDD cho việc gì?', a: 'SSD: cài Windows, ứng dụng, game — tốc độ nhanh. HDD: lưu dữ liệu lớn, backup — giá rẻ/dung lượng cao. Nên dùng SSD + HDD kết hợp.' },
    { q: 'Cách kiểm tra sức khỏe ổ cứng?', a: 'Dùng CrystalDiskInfo (Windows) hoặc S.M.A.R.T. SSD còn TBW (Terabytes Written) là dung lượng ghi tối đa. HDD kêu lạch cạch là sắp hỏng.' },
    { q: 'Nên chọn SSD chuẩn nào?', a: 'NVMe PCIe 4.0: tốc độ 7000 MB/s (tốt nhất). NVMe PCIe 3.0: 3500 MB/s (đủ dùng). SATA III: 550 MB/s (cho PC cũ). M.2 NVMe là khuyến nghị.' },
  ],
  'Thực hành lắp ráp': [
    { q: 'Các bước lắp ráp PC cơ bản?', a: '1. Lắp CPU lên mainboard. 2. Gắn RAM. 3. Lắp SSD M.2. 4. Lắp mainboard vào case. 5. Lắp PSU. 6. Lắp GPU. 7. Kết nối dây. 8. Bôi thermal paste + gắn tản nhiệt. 9. Cắm dây nguồn. 10. Bật máy kiểm tra.' },
    { q: 'Chú ý gì khi lắp CPU?', a: 'Căn chỉnh dấu tam giác trên CPU với góc socket. Nhẹ nhàng, không dùng lực. Đóng khung giữ CPU trước khi gắn tản nhiệt.' },
    { q: 'Chống tĩnh điện khi lắp ráp?', a: 'Dùng dây đeo tay ESD hoặc chạm vào vỏ kim loại trước. Làm việc trên mặt bàn gỗ, tránh thảm len. Cầm linh kiện ở cạnh, không chạm chân/tiếp xúc.' },
    { q: 'Sau khi lắp xong cần làm gì?', a: 'Kiểm tra đèn LED mainboard, quạt CPU quay, POST. Vào BIOS kiểm tra nhận RAM, SSD. Cài Windows, driver. Test stress với Cinebench/OCCT.' },
  ],
  'Mạng & Kết nối': [
    { q: 'Nên dùng WiFi có dây hay không dây?', a: 'Có dây (Ethernet): ổn định, tốc độ cao, ping thấp — tốt cho gaming. WiFi: tiện lợi, không cần kéo dây. WiFi 6 (802.11ax) tốc độ tương đương có dây.' },
    { q: 'Router nào phù hợp?', a: 'WiFi 5 (AC): đủ cho nhu cầu cơ bản. WiFi 6 (AX): gaming, nhiều thiết bị. WiFi 6E/7: băng tần 6GHz, tương lai. Chọn router theo diện tích nhà và số thiết bị.' },
    { q: 'Cách kiểm tra tốc độ mạng?', a: 'Dùng Speedtest.net hoặc Fast.com. Ping < 20ms: tốt. Download/Upload gần với gói cước. Kiểm tra bằng dây để loại trừ nhiễu WiFi.' },
  ],
  'Thiết bị ngoại vi': [
    { q: 'Cách chọn màn hình phù hợp?', a: 'Kích thước 24-27" phổ biến. Độ phân giải 1080p (24") / 1440p (27"). Tần số quét 60Hz (văn phòng) / 144Hz+ (gaming). IPS cho màu đẹp, VA cho tương phản tốt.' },
    { q: 'Bàn phím cơ hay thường?', a: 'Bàn phím cơ: bền, cảm giác gõ tốt, nhiều loại switch (Blue: clicky, Red: linear, Brown: tactile). Bàn phím thường: rẻ, êm, mỏng nhẹ — phù hợp văn phòng.' },
    { q: 'DPI chuột bao nhiêu là đủ?', a: '800-1600 DPI cho gaming, văn phòng. DPI cao hơn không = chính xác hơn. Quan trọng là cảm biến (PixArt, Logitech HERO).' },
  ],
  'Hệ thống khởi động': [
    { q: 'UEFI khác BIOS thế nào?', a: 'UEFI: giao diện đồ họa, hỗ trợ chuột, ổ đĩa >2TB, Secure Boot, khởi động nhanh hơn. BIOS (Legacy): giao diện text, cũ, chỉ hỗ trợ MBR, ổ <2TB.' },
    { q: 'Cách vào BIOS?', a: 'Nhấn phím Del/F2 ngay khi bật máy (trước logo Windows). Trên một số máy: F12 (boot menu), F10 (BIOS setup), Esc.' },
    { q: 'Secure Boot là gì?', a: 'Tính năng bảo mật ngăn malware khởi động. Yêu cầu cho Windows 11. Kiểm tra chữ ký số của hệ điều hành trước khi boot.' },
    { q: 'Nên bật XMP không?', a: 'Có. XMP chạy RAM ở tốc độ nhà sản xuất (thay vì mặc định thấp). Vào BIOS bật XMP/DOCP để RAM chạy đúng tốc độ.' },
  ],
  'Công nghệ màn hình': [
    { q: 'IPS, VA, TN khác nhau thế nào?', a: 'IPS: màu đẹp, góc nhìn rộng (thiết kế). VA: tương phản cao, đen sâu (xem phim). TN: tần số quét cao nhất, giá rẻ, góc nhìn hẹp (gaming eSports).' },
    { q: 'Nên chọn 1080p, 1440p hay 4K?', a: '1080p: 24", gaming tầm trung, giá rẻ. 1440p: 27", cân bằng đẹp + hiệu năng (khuyến nghị). 4K: 32"+, cần GPU mạnh (RTX 4080+).' },
    { q: 'HDR có cần thiết không?', a: 'HDR cho dải màu rộng, sáng/tối chi tiết hơn. Cần màn hình HDR600+ và nội dung HDR. Không bắt buộc nhưng trải nghiệm tốt hơn.' },
  ],
  'Hệ thống âm thanh': [
    { q: 'Cần card âm thanh rời không?', a: 'Không cần nếu dùng loa/tai nghe thường. Card rời cần khi: làm nhạc chuyên nghiệp, cần DAC chất lượng cao, giảm nhiễu.' },
    { q: 'Tai nghe nào cho gaming?', a: 'Tai nghe over-ear: cách âm tốt, âm trường rộng. 7.1 ảo cho định vị trong game. Microphone rời chất lượng hơn mic tích hợp.' },
    { q: 'Loa 2.0 hay 2.1?', a: '2.0: gọn, đủ nghe nhạc cơ bản. 2.1: có subwoofer, bass mạnh hơn — phù hợp xem phim, chơi game.' },
  ],
  'Vỏ case & quạt': [
    { q: 'Cách chọn case phù hợp?', a: 'Chọn theo form factor mainboard (ATX case cho ATX main). Đảm bảo đủ chỗ cho GPU dài và tản nhiệt cao. Luồng khí (mesh mặt trước) quan trọng hơn thẩm mỹ.' },
    { q: 'Cách bố trí quạt case tối ưu?', a: 'Hút vào: mặt trước + đáy. Thải ra: mặt sau + trên. Tạo áp suất dương (hút vào nhiều hơn thải ra) để giảm bụi. Quạt 120mm là phổ biến.' },
    { q: 'Quạt PWM là gì?', a: 'Quạt PWM tự điều chỉnh tốc độ theo nhiệt độ. Chạy êm khi mát, tăng tốc khi nóng. Cắm vào header 4-pin PWM trên mainboard.' },
  ],
  'Đánh giá hiệu năng': [
    { q: 'Các phần mềm benchmark quan trọng?', a: 'CPU: Cinebench (render), Geekbench (đa năng). GPU: 3DMark (game), FurMark (stress). SSD: CrystalDiskMark. Tổng thể: PassMark, PCMark.' },
    { q: 'FPS bao nhiêu là chơi được?', a: '30 FPS: chơi được (console). 60 FPS: mượt (tiêu chuẩn). 144 FPS: rất mượt (màn 144Hz). Thấp hơn 30 FPS: giật, khó chịu.' },
    { q: 'Cách đọc kết quả benchmark?', a: 'So sánh điểm số với các cấu hình tương tự. Chú ý nhiệt độ trong quá trình test. 1% Low FPS (FPS thấp nhất) quan trọng hơn FPS trung bình.' },
  ],
  'Laptop': [
    { q: 'Nên mua laptop hay desktop?', a: 'Laptop: di động, gọn nhẹ, tiện mang theo — phù hợp học tập, văn phòng. Desktop: hiệu năng cao hơn cùng giá, dễ nâng cấp — phù hợp gaming, đồ họa.' },
    { q: 'Các dòng laptop phổ biến?', a: 'Ultrabook: mỏng nhẹ, pin lâu (Dell XPS, MacBook Air). Gaming laptop: hiệu năng cao, nặng (ROG, Legion). Workstation: đồ họa chuyên nghiệp (ThinkPad P, Precision).' },
    { q: 'Thunderbolt 4 có gì đặc biệt?', a: 'Băng thông 40 Gbps, truyền dữ liệu + video + sạc qua 1 cổng USB-C. Kết nối eGPU, màn hình, ổ cứng ngoài.' },
  ],
  'Ép xung & tối ưu': [
    { q: 'Có nên ép xung CPU không?', a: 'CPU đời mới đã có turbo boost tự động. Ép xung thủ công tăng thêm 5-15% hiệu năng nhưng cần tản nhiệt tốt, có thể giảm tuổi thọ. Không cần ép xung nếu không có nhu cầu đặc biệt.' },
    { q: 'Nhiệt độ CPU an toàn là bao nhiêu?', a: 'Idle: 30-40°C. Xem phim/lướt web: 40-55°C. Chơi game: 60-80°C. >90°C: quá nóng, có thể throttle. Tối đa an toàn: 95-100°C.' },
    { q: 'Undervolting là gì?', a: 'Giảm điện áp CPU/GPU để giảm nhiệt độ và tiêu thụ điện mà vẫn giữ hiệu năng. Giúp laptop chạy mát hơn, pin lâu hơn. An toàn nếu làm đúng.' },
  ],
  'Tản nhiệt nâng cao': [
    { q: 'Custom loop water cooling là gì?', a: 'Hệ thống tản nhiệt nước tự lắp: pump, reservoir, radiator, block, ống nước. Hiệu quả tản nhiệt cao nhất, tùy chỉnh thẩm mỹ. Đắt, cần bảo dưỡng định kỳ.' },
    { q: 'AIO vs Custom loop khác nhau?', a: 'AIO: lắp sẵn, kín, dễ dùng, ít bảo dưỡng, giá rẻ hơn. Custom loop: tự ráp, hiệu quả cao hơn, tùy chỉnh được, cần kinh nghiệm và bảo trì.' },
    { q: 'Cần bảo dưỡng tản nước thế nào?', a: 'AIO: không cần bảo dưỡng, nếu hỏng thì thay mới. Custom loop: thay nước 6-12 tháng/lần, vệ sinh block và radiator.' },
  ],
  'PC Gaming': [
    { q: 'Cấu hình PC gaming 15 triệu?', a: 'CPU: AMD Ryzen 5 7600. GPU: RTX 4060. RAM: 16GB DDR5. SSD: 1TB NVMe. PSU: 650W Gold. Main: B650. Case: ATX mesh. Tản khí.' },
    { q: 'Cấu hình PC gaming 30 triệu?', a: 'CPU: Intel i5-14600K / Ryzen 7 7800X3D. GPU: RTX 4070 Super. RAM: 32GB DDR5. SSD: 2TB NVMe. PSU: 850W Gold. Main: Z790/B650. Tản nước AIO 240mm.' },
    { q: 'Yếu tố nào quan trọng nhất cho gaming?', a: 'GPU là quan trọng nhất (40% budget). CPU (30%). RAM (10%). SSD (10%). PSU + Case + Tản (10%). Đầu tư vào GPU trước, CPU sau.' },
  ],
  'Máy chủ & Workstation': [
    { q: 'Server khác PC thường thế nào?', a: 'Server dùng CPU Xeon/EPYC, ECC RAM, RAID, hot-swap, chạy 24/7. Workstation dùng GPU Quadro/RTX, nhiều RAM, ổn định cho đồ họa/AI.' },
    { q: 'ECC RAM là gì?', a: 'RAM có khả năng phát hiện và sửa lỗi tự động. Quan trọng cho server và workstation vì dữ liệu nhạy cảm. Cần CPU và mainboard hỗ trợ ECC.' },
    { q: 'RAID nên dùng loại nào?', a: 'RAID 0: gộp ổ → nhanh nhưng không dự phòng. RAID 1: nhân đôi → an toàn. RAID 5: 3 ổ + parity → cân bằng. RAID 10: nhanh + an toàn.' },
  ],
  'Cáp & đấu nối': [
    { q: 'Các loại cáp nguồn cần biết?', a: '24-pin ATX: cấp nguồn mainboard. 4+4-pin EPS: cấp nguồn CPU. 6+2-pin PCIe: cấp nguồn GPU. SATA power: ổ cứng. Molex: quạt, LED.' },
    { q: 'Cable management là gì?', a: 'Sắp xếp dây cáp gọn gàng trong case. Luồn dây ra sau khay mainboard. Dùng dây rút/băng keo cố định. Giúp luồng khí tốt hơn, dễ vệ sinh, đẹp.' },
    { q: 'Nên dùng cáp nối nào cho màn hình?', a: 'HDMI 2.1: 4K 144Hz hoặc 8K 60Hz (cho TV, màn hình). DisplayPort 1.4: 4K 240Hz hoặc 8K 60Hz (cho PC gaming, băng thông cao hơn).' },
  ],
  'Xử lý sự cố': [
    { q: 'PC không boot, xử lý thế nào?', a: '1. Kiểm tra nguồn (quạt nguồn quay?). 2. Reset CMOS (tháo pin mainboard). 3. Rút RAM lau chân, gắn lại. 4. Thử boot với tối thiểu: 1 thanh RAM, CPU, không GPU.' },
    { q: 'Màn hình xanh (BSOD) fix thế nào?', a: 'Ghi lại mã lỗi (VD: MEMORY_MANAGEMENT). Cập nhật driver đặc biệt là GPU. Kiểm tra RAM bằng Windows Memory Diagnostic. Gần đây cài gì thì gỡ đó.' },
    { q: 'Máy chạy chậm, khắc phục ra sao?', a: 'Kiểm tra sức khỏe SSD/HDD. Dọn dẹp ổ đĩa. Tắt ứng dụng khởi động cùng Windows. Cập nhật driver. Nếu vẫn chậm, nâng cấp lên SSD.' },
    { q: 'Nhiệt độ cao khi chơi game?', a: 'Kiểm tra quạt tản nhiệt CPU có quay không. Vệ sinh bụi bẩn. Bôi lại thermal paste. Tăng tốc quạt trong BIOS. Mở case kiểm tra luồng khí.' },
  ],
  'VR/AR': [
    { q: 'PC cần cấu hình gì cho VR?', a: 'Tối thiểu: RTX 3060 + i5/Ryzen 5 + 16GB RAM. Khuyến nghị: RTX 4070+ cho trải nghiệm mượt. VR yêu cầu FPS cao (90Hz+) để tránh chóng mặt.' },
    { q: 'VR Headset nào phổ biến?', a: 'Meta Quest 3: không dây, giá phải chăng. Valve Index: chất lượng cao, cần PC mạnh. PlayStation VR2: cho PS5. Apple Vision Pro: cao cấp nhất.' },
    { q: 'AR khác VR thế nào?', a: 'AR (Thực tế tăng cường): chồng hình ảnh ảo lên thế giới thật (Pokemon Go, HoloLens). VR (Thực tế ảo): đưa bạn vào thế giới hoàn toàn ảo (Meta Quest).' },
  ],
  'Lịch sử PC': [
    { q: 'Những cột mốc quan trọng trong lịch sử PC?', a: '1945: ENIAC (máy tính đầu). 1971: Intel 4004 (vi xử lý đầu). 1981: IBM PC. 1984: Macintosh. 1991: Web. 1996: USB. 2007: SSD consumer.' },
    { q: 'Định luật Moore là gì?', a: 'Số lượng transistor trên chip tăng gấp đôi mỗi 2 năm, dự đoán bởi Gordon Moore (Intel). Đúng trong nhiều thập kỷ, gần đây chậm lại do giới hạn vật lý.' },
  ],
  'Đạo đức & an toàn': [
    { q: 'Bảo vệ dữ liệu cá nhân thế nào?', a: 'Dùng mật khẩu mạnh (chữ hoa/thường/số/ký tự). Bật 2FA. Cập nhật phần mềm thường xuyên. Không click link lạ. Sao lưu dữ liệu định kỳ.' },
    { q: 'Xử lý rác thải điện tử đúng cách?', a: 'Không vứt linh kiện vào thùng rác thường. Mang đến điểm thu hồi rác điện tử. Có thể tái chế hoặc quyên góp thiết bị cũ còn dùng được.' },
    { q: 'Bản quyền phần mềm?', a: 'Phần mềm có bản quyền: Windows, Office, Adobe. Dùng bản quyền để ủng hộ nhà phát triển và tránh rủi ro bảo mật. Có phần mềm mã nguồn mở (miễn phí) thay thế.' },
  ],
  'Trí tuệ nhân tạo': [
    { q: 'AI và Machine Learning khác nhau thế nào?', a: 'AI: máy mô phỏng trí thông minh con người. Machine Learning: nhánh của AI, máy học từ dữ liệu. Deep Learning: ML dùng neural network nhiều lớp.' },
    { q: 'GPU quan trọng với AI thế nào?', a: 'GPU có hàng nghìn lõi xử lý song song, lý tưởng cho training AI. NVIDIA dẫn đầu với CUDA, Tensor Core. RTX 4090 đủ cho nghiên cứu, A100/H100 cho data center.' },
    { q: 'Các ứng dụng AI phổ biến?', a: 'ChatGPT/Gemini (chatbot), Midjourney/DALL-E (tạo ảnh), GitHub Copilot (lập trình), Siri/Google Assistant (trợ lý ảo), đề xuất YouTube/TikTok.' },
  ],
  default: [
    { q: 'Làm sao để bắt đầu học?', a: '1. Đăng nhập tài khoản. 2. Vào Student để xem dashboard. 3. Học theo bài giảng trong Lessons. 4. Làm quiz để kiểm tra kiến thức. 5. Thực hành lắp ráp trong Builder.' },
    { q: 'Kiếm ngân sách thế nào?', a: 'Làm quiz trắc nghiệm, mỗi điểm = 100.000₫. Vào Student → Quiz để chọn bài. Đạt 80/100 điểm là qua. Điểm tích luỹ để mua linh kiện trong Chợ máy tính.' },
    { q: 'Cách sử dụng glossary?', a: 'Trong khi làm quiz, thuật ngữ được tô xanh. Click vào để xem định nghĩa. Hoặc bấm nút "Tra cứu" trên đầu trang để mở bảng tra cứu có thanh tìm kiếm.' },
  ]
}

export function getKeyQuestions(lessonTitle: string): KeyQuestion[] {
  return KEY_QUESTIONS[lessonTitle] || KEY_QUESTIONS.default
}

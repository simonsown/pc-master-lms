export interface AssemblyVideo {
  videoId: string;
  title: string;
  channelName: string;
  startSeconds: number;
  endSeconds?: number;
  language: 'vi' | 'en';
  description: string;
}

export interface AssemblyError {
  id: string;
  code: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  howToFix: string;
  youtubeVideo: AssemblyVideo[];
  animation: {
    type: 'shake' | 'red-flash' | 'arrow-wrong' | 'highlight-both' | 'cross-mark';
    targetComponents: string[];
    durationMs: number;
  };
  affectedParts: string[];
  suggestedFix?: {
    replaceComponent: string;
    recommendation: string;
  };
}

export const ASSEMBLY_ERRORS: AssemblyError[] = [
  {
    id: 'err-cpu-socket-001',
    code: 'CPU_SOCKET_MISMATCH',
    severity: 'critical',
    title: 'CPU không khớp socket Mainboard',
    description: 'CPU Intel LGA1700 không thể gắn vào Mainboard AMD AM5 và ngược lại. Đây là lỗi phổ biến nhất khi mua linh kiện không đồng bộ.',
    howToFix: '1. Kiểm tra socket của CPU (LGA1700, AM5, AM4...)\n2. Chọn Mainboard có cùng socket\n3. Intel gen 12-14 → LGA1700 | AMD Ryzen 7000 → AM5 | AMD Ryzen 5000 → AM4',
    youtubeVideo: [
      {
        videoId: 'PXaLc9AYIcg',
        title: 'CPU Socket Explained — LGA vs AM4 vs AM5',
        channelName: 'Linus Tech Tips',
        startSeconds: 45,
        endSeconds: 210,
        language: 'en',
        description: 'Giải thích rõ sự khác biệt giữa các loại socket CPU'
      },
      {
        videoId: 'dcuLVS5pzHE',
        title: 'Lỗi socket CPU thường gặp khi lắp máy tính',
        channelName: 'PC Việt',
        startSeconds: 30,
        language: 'vi',
        description: 'Hướng dẫn kiểm tra socket CPU bằng tiếng Việt'
      }
    ],
    animation: { type: 'highlight-both', targetComponents: ['cpu', 'motherboard'], durationMs: 2000 },
    affectedParts: ['cpu', 'motherboard']
  },
  {
    id: 'err-ram-type-002',
    code: 'RAM_TYPE_MISMATCH',
    severity: 'critical',
    title: 'RAM DDR4 cắm vào Mainboard DDR5 (hoặc ngược lại)',
    description: 'DDR4 và DDR5 có khe lệch nhau — vật lý không thể cắm vào sai loại. Tuy nhiên nếu mua nhầm thì máy sẽ hoàn toàn không nhận.',
    howToFix: '1. Kiểm tra Mainboard hỗ trợ DDR4 hay DDR5 (không có board nào hỗ trợ cả 2)\n2. Intel B760/Z790 có 2 phiên bản: một bản DDR4, một bản DDR5\n3. AMD AM5 chỉ hỗ trợ DDR5 | AMD AM4 chỉ hỗ trợ DDR4',
    youtubeVideo: [
      {
        videoId: 'R7CO9v9rpOk',
        title: 'DDR4 vs DDR5 RAM — What You Need to Know',
        channelName: 'GamersNexus',
        startSeconds: 120,
        endSeconds: 340,
        language: 'en',
        description: 'So sánh DDR4 và DDR5, cách phân biệt'
      }
    ],
    animation: { type: 'red-flash', targetComponents: ['ram', 'motherboard'], durationMs: 1500 },
    affectedParts: ['ram', 'motherboard']
  },
  {
    id: 'err-psu-watt-003',
    code: 'PSU_INSUFFICIENT_WATTAGE',
    severity: 'critical',
    title: 'PSU không đủ điện cho toàn bộ build',
    description: 'Tổng TDP của CPU + GPU + các linh kiện khác vượt quá 80% công suất PSU. Máy sẽ tắt đột ngột khi chạy tải nặng (gaming, render).',
    howToFix: '1. Tính tổng TDP: CPU TDP + GPU TDP + 50W (RAM, SSD, fans)\n2. PSU cần = Tổng TDP ÷ 0.8 (buffer 20%)\n3. Ví dụ: i5-13600K (125W) + RTX 4070 (200W) + 50W = 375W → cần PSU tối thiểu 470W → chọn 550W Gold',
    youtubeVideo: [
      {
        videoId: 'qyLCuYkZGA0',
        title: 'How Much Power Does Your PC Need?',
        channelName: 'Linus Tech Tips',
        startSeconds: 60,
        endSeconds: 280,
        language: 'en',
        description: 'Cách tính wattage PSU cần thiết'
      },
      {
        videoId: 'HmVFm-UrEJM',
        title: 'Cách chọn nguồn PSU đúng watt cho PC',
        channelName: 'Thế Giới Di Động Tech',
        startSeconds: 45,
        language: 'vi',
        description: 'Hướng dẫn tiếng Việt cách tính và chọn PSU phù hợp'
      }
    ],
    animation: { type: 'red-flash', targetComponents: ['psu', 'cpu', 'gpu'], durationMs: 2500 },
    affectedParts: ['psu', 'cpu', 'gpu']
  },
  {
    id: 'err-gpu-size-004',
    code: 'GPU_TOO_LONG_FOR_CASE',
    severity: 'critical',
    title: 'GPU dài hơn Case cho phép',
    description: 'GPU có chiều dài vật lý lớn hơn khoảng trống tối đa của Case. GPU sẽ chạm vào drive cage hoặc không đóng được side panel.',
    howToFix: '1. Kiểm tra "Max GPU Length" trong spec của Case\n2. Kiểm tra "Length (mm)" của GPU\n3. GPU dài điển hình: RTX 4090 = 336mm | RTX 4070 = 285mm | RTX 4060 = 200mm\n4. Chọn Case larger hoặc GPU nhỏ hơn',
    youtubeVideo: [
      {
        videoId: 'BblBMJFNmFY',
        title: 'GPU Size vs Case Clearance — Common Mistake',
        channelName: 'JayzTwoCents',
        startSeconds: 30,
        endSeconds: 200,
        language: 'en',
        description: 'Lỗi GPU dài hơn case và cách tránh'
      }
    ],
    animation: { type: 'arrow-wrong', targetComponents: ['gpu', 'case'], durationMs: 2000 },
    affectedParts: ['gpu', 'case']
  },
  {
    id: 'err-cooler-height-005',
    code: 'COOLER_TOO_TALL_FOR_CASE',
    severity: 'critical',
    title: 'Cooler CPU cao hơn Case cho phép',
    description: 'Cooler tower air có chiều cao vượt quá CPU clearance của Case. Side panel sẽ không đóng được hoặc phải bẻ cong.',
    howToFix: '1. Kiểm tra "Max CPU Cooler Height" trong spec Case\n2. Cooler phổ biến: Noctua NH-D15 = 165mm | DeepCool AK620 = 160mm | Be Quiet Dark Rock Pro 4 = 162mm\n3. Mid-tower thường có clearance 155-170mm\n4. Hoặc chuyển sang AIO liquid cooler (không bị vấn đề chiều cao)',
    youtubeVideo: [
      {
        videoId: 'Hmb2QFEOMODE',
        title: 'Air Cooler vs Case — Height Clearance Guide',
        channelName: 'Hardware Canucks',
        startSeconds: 90,
        language: 'en',
        description: 'Cách đo và kiểm tra clearance cooler vs case'
      }
    ],
    animation: { type: 'cross-mark', targetComponents: ['cooler', 'case'], durationMs: 1800 },
    affectedParts: ['cooler', 'case']
  },
  {
    id: 'err-no-display-006',
    code: 'NO_DISPLAY_OUTPUT',
    severity: 'critical',
    title: 'Không có nguồn xuất hình',
    description: 'CPU không có iGPU (integrated graphics) VÀ cũng không có GPU rời. Máy sẽ không xuất được tín hiệu hình ảnh ra màn hình.',
    howToFix: '1. CPU Intel Core có chữ "F" (i5-13600KF) = KHÔNG có iGPU → bắt buộc cần GPU rời\n2. CPU AMD Ryzen không có chữ "G" = KHÔNG có iGPU → bắt buộc cần GPU rời\n3. Hoặc đổi CPU có iGPU nếu không cần GPU rời',
    youtubeVideo: [
      {
        videoId: 'RN9sqc7mEWE',
        title: 'Integrated vs Dedicated GPU Explained',
        channelName: 'Tech Quickie',
        startSeconds: 20,
        endSeconds: 180,
        language: 'en',
        description: 'Giải thích iGPU và khi nào cần GPU rời'
      }
    ],
    animation: { type: 'red-flash', targetComponents: ['cpu', 'motherboard'], durationMs: 2000 },
    affectedParts: ['cpu', 'gpu']
  },
  {
    id: 'err-ram-slot-007',
    code: 'RAM_WRONG_DUAL_CHANNEL_SLOT',
    severity: 'warning',
    title: 'RAM cắm sai slot — mất dual channel',
    description: 'Với 2 thanh RAM, phải cắm vào slot A2+B2 (thường là slot 2 và 4 tính từ CPU). Cắm A1+B1 hoặc A1+A2 sẽ mất dual channel, hiệu năng giảm 10-15%.',
    howToFix: '1. Xem manual mainboard để biết đúng slot dual channel\n2. Thông thường: slot màu giống nhau (thường là slot 2 và 4)\n3. Có text trên mainboard: "A2" và "B2" — cắm vào 2 slot này\n4. Sau khi gắn đúng: vào BIOS → Memory tab → kiểm tra Dual Channel mode',
    youtubeVideo: [
      {
        videoId: '0FKJLpZ5ByY',
        title: 'RAM Dual Channel — Which Slots to Use?',
        channelName: 'Linus Tech Tips',
        startSeconds: 180,
        endSeconds: 360,
        language: 'en',
        description: 'Hướng dẫn cắm RAM đúng slot dual channel'
      }
    ],
    animation: { type: 'arrow-wrong', targetComponents: ['ram'], durationMs: 2000 },
    affectedParts: ['ram', 'motherboard']
  },
  {
    id: 'err-psu-connector-008',
    code: 'PSU_MISSING_CONNECTORS',
    severity: 'critical',
    title: 'PSU thiếu đầu cấp nguồn cho GPU',
    description: 'GPU cần các đầu cấp nguồn PCIe power connector nhưng PSU không có đủ số lượng hoặc loại connector tương ứng.',
    howToFix: '1. Kiểm tra số lượng PCIe power connector của PSU\n2. GPU mid-range cần 1x 8-pin, GPU cao cấp cần 2x 8-pin hoặc 12VHPWR\n3. Dùng cáp adapter nếu cần hoặc nâng cấp PSU',
    youtubeVideo: [
      {
        videoId: '2CkU4-T1R9c',
        title: 'PSU Cables Explained — What You Need',
        channelName: 'Bitwit',
        startSeconds: 120,
        language: 'en',
        description: 'Giải thích các loại cáp nguồn PSU'
      }
    ],
    animation: { type: 'shake', targetComponents: ['psu', 'gpu'], durationMs: 1500 },
    affectedParts: ['psu', 'gpu']
  },
  {
    id: 'err-form-factor-009',
    code: 'FORM_FACTOR_MISMATCH',
    severity: 'critical',
    title: 'Mainboard không vừa Case',
    description: 'Mainboard có form factor (ATX, mATX, ITX) không tương thích với Case. Ví dụ: mainboard ATX không thể lắp vào case ITX.',
    howToFix: '1. Kiểm tra form factor của Case (hỗ trợ: ATX, mATX, ITX)\n2. Chọn mainboard có form factor nằm trong danh sách hỗ trợ\n3. Case ATX hỗ trợ: ATX, mATX, ITX | Case mATX: mATX, ITX | Case ITX: ITX',
    youtubeVideo: [
      {
        videoId: 'SJXTjNy_b64',
        title: 'Motherboard Form Factors Explained',
        channelName: 'TechQuickie',
        startSeconds: 60,
        endSeconds: 240,
        language: 'en',
        description: 'Giải thích form factor ATX, mATX, ITX'
      }
    ],
    animation: { type: 'cross-mark', targetComponents: ['motherboard', 'case'], durationMs: 2000 },
    affectedParts: ['motherboard', 'case']
  },
  {
    id: 'err-cooler-socket-010',
    code: 'COOLER_SOCKET_MISMATCH',
    severity: 'critical',
    title: 'Cooler không hỗ trợ socket CPU',
    description: 'Cooler không bao gồm mounting bracket cho socket của CPU. Không thể gắn cooler lên CPU nếu thiếu bracket tương thích.',
    howToFix: '1. Kiểm tra danh sách socket hỗ trợ của Cooler\n2. Nếu thiếu bracket: liên hệ hãng để xin bracket riêng\n3. Hoặc đổi cooler khác có hỗ trợ socket đầy đủ',
    youtubeVideo: [
      {
        videoId: 'dk_3tE3E_DI',
        title: 'CPU Cooler Compatibility — Socket Guide',
        channelName: 'GamersNexus',
        startSeconds: 180,
        language: 'en',
        description: 'Kiểm tra tương thích socket của cooler'
      }
    ],
    animation: { type: 'highlight-both', targetComponents: ['cooler', 'cpu'], durationMs: 2000 },
    affectedParts: ['cooler', 'cpu']
  },
  {
    id: 'err-m2-slot-011',
    code: 'NOT_ENOUGH_M2_SLOTS',
    severity: 'warning',
    title: 'Thiếu slot M.2 cho SSD',
    description: 'Số lượng SSD M.2 vượt quá số slot M.2 có sẵn trên Mainboard. Cần dùng SSD SATA hoặc giảm số lượng SSD M.2.',
    howToFix: '1. Kiểm tra số slot M.2 trên Mainboard\n2. Dùng SSD SATA 2.5-inch cho các ổ còn lại\n3. Hoặc nâng cấp Mainboard có nhiều slot M.2 hơn',
    youtubeVideo: [
      {
        videoId: 'RkSUk9lzT0s',
        title: 'M.2 vs SATA SSD — Which One to Choose?',
        channelName: 'Linus Tech Tips',
        startSeconds: 60,
        language: 'en',
        description: 'So sánh M.2 NVMe và SATA SSD'
      }
    ],
    animation: { type: 'red-flash', targetComponents: ['ssd', 'motherboard'], durationMs: 1500 },
    affectedParts: ['ssd', 'motherboard']
  },
  {
    id: 'err-bottleneck-012',
    code: 'CPU_GPU_BOTTLENECK',
    severity: 'warning',
    title: 'CPU và GPU mất cân bằng — nghẽn cổ chai',
    description: 'Tỷ lệ sức mạnh giữa CPU và GPU quá chênh lệch. Một component sẽ bị ngồi chờ component kia, gây lãng phí hiệu năng.',
    howToFix: '1. GPU quá mạnh (>2.5x CPU): nâng cấp CPU hoặc giảm GPU\n2. CPU quá mạnh (<0.4x GPU): nâng cấp GPU hoặc giảm CPU\n3. Lý tưởng: tỷ lệ GPU/CPU từ 1.0x đến 2.0x',
    youtubeVideo: [
      {
        videoId: '4Vymf3DkI4Y',
        title: 'CPU Bottleneck Explained — How to Fix',
        channelName: 'JayzTwoCents',
        startSeconds: 60,
        endSeconds: 300,
        language: 'en',
        description: 'Giải thích bottleneck CPU/GPU và cách khắc phục'
      }
    ],
    animation: { type: 'arrow-wrong', targetComponents: ['cpu', 'gpu'], durationMs: 2000 },
    affectedParts: ['cpu', 'gpu']
  },
  {
    id: 'err-cooler-tdp-013',
    code: 'COOLER_INSUFFICIENT_TDP',
    severity: 'warning',
    title: 'Cooler không đủ tản nhiệt cho CPU',
    description: 'TDP tối đa của Cooler thấp hơn TDP của CPU. CPU sẽ bị nóng quá mức, gây throttling giảm hiệu năng hoặc hư hỏng.',
    howToFix: '1. Cooler cần hỗ trợ TDP ≥ CPU TDP × 0.9 (buffer)\n2. Ví dụ: CPU 125W → Cooler tối thiểu 112W hỗ trợ\n3. Nâng cấp lên cooler khí cao cấp hoặc AIO liquid cooler',
    youtubeVideo: [
      {
        videoId: 't6ono8R_nAM',
        title: 'CPU Cooler TDP Ratings Explained',
        channelName: 'Hardware Canucks',
        startSeconds: 200,
        language: 'en',
        description: 'Cách đọc và hiểu TDP trên CPU cooler'
      }
    ],
    animation: { type: 'red-flash', targetComponents: ['cooler', 'cpu'], durationMs: 2000 },
    affectedParts: ['cooler', 'cpu']
  },
  {
    id: 'err-psu-length-014',
    code: 'PSU_TOO_LONG_FOR_CASE',
    severity: 'critical',
    title: 'PSU dài hơn Case cho phép',
    description: 'Chiều dài vật lý của PSU vượt quá khoảng trống tối đa trong Case. Không thể lắp PSU vào case.',
    howToFix: '1. Kiểm tra max PSU length của Case\n2. Chọn PSU có chiều dài nhỏ hơn giới hạn\n3. PSU dài phổ biến: 140mm (SFX), 150mm (ATX ngắn), 180-200mm (ATX dài)',
    youtubeVideo: [
      {
        videoId: 'IEsOILC_8jg',
        title: 'PSU Size Guide — ATX vs SFX',
        channelName: 'Optimum Tech',
        startSeconds: 60,
        language: 'en',
        description: 'Hướng dẫn chọn kích thước PSU phù hợp với case'
      }
    ],
    animation: { type: 'cross-mark', targetComponents: ['psu', 'case'], durationMs: 1800 },
    affectedParts: ['psu', 'case']
  },
  {
    id: 'err-ram-speed-015',
    code: 'RAM_SPEED_MISMATCH',
    severity: 'info',
    title: 'RAM chạy không đúng tốc độ tối đa',
    description: 'RAM có tốc độ cao hơn Mainboard hỗ trợ. RAM sẽ tự động giảm xung nhịp xuống mức tối đa mà Mainboard hỗ trợ.',
    howToFix: '1. Kiểm tra max RAM speed của Mainboard\n2. Nếu muốn tốc độ cao: vào BIOS bật XMP/EXPO\n3. Nếu Mainboard không hỗ trợ tốc độ đó: chấp nhận chạy ở tốc độ thấp hơn hoặc thay Mainboard',
    youtubeVideo: [
      {
        videoId: 'Jv5g0KRxh-E',
        title: 'What is XMP? RAM Speed Explained',
        channelName: 'Tech Quickie',
        startSeconds: 30,
        endSeconds: 180,
        language: 'en',
        description: 'Giải thích XMP/EXPO và tốc độ RAM'
      }
    ],
    animation: { type: 'shake', targetComponents: ['ram', 'motherboard'], durationMs: 1000 },
    affectedParts: ['ram', 'motherboard']
  },
  {
    id: 'err-cpu-cooler-paste-016',
    code: 'NO_THERMAL_PASTE',
    severity: 'info',
    title: 'Chưa có keo tản nhiệt cho CPU',
    description: 'Không có thermal paste giữa CPU IHS và cooler baseplate. Nhiệt sẽ không truyền được, CPU nhanh chóng quá nhiệt.',
    howToFix: '1. Hầu hết cooler đều có sẵn thermal paste (pre-applied hoặc tube nhỏ)\n2. Nếu không: mua thermal paste riêng (Arctic MX-6, Noctua NT-H2, Thermal Grizzly Kryonaut)\n3. Bôi một chấm cỡ hạt đậu ở giữa CPU IHS trước khi gắn cooler',
    youtubeVideo: [
      {
        videoId: '5QxNwWWNH7o',
        title: 'How to Apply Thermal Paste — Perfect Guide',
        channelName: 'GamersNexus',
        startSeconds: 60,
        endSeconds: 240,
        language: 'en',
        description: 'Cách bôi keo tản nhiệt đúng cách'
      }
    ],
    animation: { type: 'red-flash', targetComponents: ['cpu', 'cooler'], durationMs: 1500 },
    affectedParts: ['cpu', 'cooler']
  },
  {
    id: 'err-standoff-017',
    code: 'MISSING_STANDOFFS',
    severity: 'warning',
    title: 'Thiếu standoff cho Mainboard',
    description: 'Mainboard được bắt trực tiếp vào case mà không có standoff (ốc đệm). Mainboard có thể bị chập mạch hoặc hư hỏng.',
    howToFix: '1. Luôn gắn standoff trước khi đặt mainboard vào case\n2. Số lượng standoff tương ứng với số lỗ bắt vít trên mainboard (thường 6-9 cái)\n3. Vặn standoff vào case, đặt mainboard lên, dùng ốc vặn chặt',
    youtubeVideo: [
      {
        videoId: 'N0J6Gjxl-CI',
        title: 'How to Install Motherboard — Standoffs Guide',
        channelName: "Paul's Hardware",
        startSeconds: 120,
        endSeconds: 300,
        language: 'en',
        description: 'Hướng dẫn lắp mainboard đúng cách'
      }
    ],
    animation: { type: 'shake', targetComponents: ['motherboard', 'case'], durationMs: 1500 },
    affectedParts: ['motherboard', 'case']
  },
  {
    id: 'err-pcie-riser-018',
    code: 'GPU_PCIE_RISER_ISSUE',
    severity: 'warning',
    title: 'Cáp PCIe riser có thể gây mất tín hiệu',
    description: 'Sử dụng cáp PCIe riser kém chất lượng có thể gây mất tín hiệu, lỗi màn hình đen, hoặc GPU không hoạt động.',
    howToFix: '1. Dùng PCIe riser chính hãng (Phanteks, Cooler Master, Thermaltake)\n2. Set BIOS sang PCIe Gen 3 thay vì Auto/Gen 4\n3. Hoặc gắn GPU trực tiếp vào slot PCIe trên mainboard',
    youtubeVideo: [
      {
        videoId: 'J_frJZcU1TY',
        title: 'PCIe Riser Cable Issues Fixed!',
        channelName: 'GamersNexus',
        startSeconds: 90,
        language: 'en',
        description: 'Khắc phục lỗi PCIe riser cable'
      }
    ],
    animation: { type: 'arrow-wrong', targetComponents: ['gpu', 'motherboard'], durationMs: 2000 },
    affectedParts: ['gpu', 'motherboard']
  },
  {
    id: 'err-ram-voltage-019',
    code: 'RAM_VOLTAGE_HIGH',
    severity: 'info',
    title: 'RAM có điện áp cao hơn mặc định',
    description: 'RAM XMP/EXPO có thể chạy ở điện áp 1.35V-1.5V, cao hơn mặc định 1.2V. Cần kiểm tra Mainboard có hỗ trợ không.',
    howToFix: '1. Vào BIOS enable XMP/EXPO để RAM chạy đúng tốc độ và voltage\n2. Hầu hết Mainboard đều hỗ trợ voltage 1.35V (DDR4) và 1.1V (DDR5)\n3. Nếu không vào được BIOS: reset CMOS bằng cách tháo pin',
    youtubeVideo: [
      {
        videoId: '4c5P5F5D3Fs',
        title: 'RAM Voltage and XMP Explained',
        channelName: 'Tech Deals',
        startSeconds: 120,
        language: 'en',
        description: 'Giải thích về điện áp RAM và XMP'
      }
    ],
    animation: { type: 'shake', targetComponents: ['ram', 'motherboard'], durationMs: 1000 },
    affectedParts: ['ram', 'motherboard']
  },
  {
    id: 'err-case-fan-020',
    code: 'CASE_FAN_MISMATCH',
    severity: 'info',
    title: 'Quạt case không đồng bộ',
    description: 'Các quạt case không cùng loại (PWM vs DC) hoặc không cùng tốc độ, gây khó khăn trong việc kiểm soát nhiệt độ và tiếng ồn.',
    howToFix: '1. Dùng toàn bộ quạt PWM (4-pin) để dễ kiểm soát tốc độ qua BIOS/software\n2. Hoặc toàn bộ quạt DC (3-pin) nếu không cần điều chỉnh\n3. Hub quạt nếu thiếu header trên mainboard',
    youtubeVideo: [
      {
        videoId: 'akR_dU4qGso',
        title: 'Case Fans Guide — PWM vs DC',
        channelName: 'Hardware Canucks',
        startSeconds: 90,
        language: 'en',
        description: 'So sánh quạt PWM và DC cho case'
      }
    ],
    animation: { type: 'red-flash', targetComponents: ['case'], durationMs: 1200 },
    affectedParts: ['case']
  },
  {
    id: 'err-aio-orientation-021',
    code: 'AIO_MOUNTING_ERROR',
    severity: 'warning',
    title: 'Gắn AIO cooler sai hướng',
    description: 'AIO liquid cooler nếu gắn sai hướng (pump ở vị trí cao nhất) có thể gây tiếng ồn, giảm tuổi thọ, hoặc làm hỏng pump.',
    howToFix: '1. Pump (block trên CPU) không được là điểm cao nhất của loop\n2. Radiator phải cao hơn pump để bọt khí lên rad\n3. Tubes từ pump xuống dưới hoặc ngang, không hướng lên trên',
    youtubeVideo: [
      {
        videoId: 'qgN88TQSTGQ',
        title: "AIO Cooler Orientation Guide — Don't Do This!",
        channelName: 'JayzTwoCents',
        startSeconds: 60,
        endSeconds: 360,
        language: 'en',
        description: 'Hướng dẫn gắn AIO cooler đúng cách'
      }
    ],
    animation: { type: 'arrow-wrong', targetComponents: ['cooler', 'cpu'], durationMs: 2000 },
    affectedParts: ['cooler', 'cpu']
  },
  {
    id: 'err-front-panel-022',
    code: 'FRONT_PANEL_WRONG',
    severity: 'warning',
    title: 'Cắm sai dây front panel',
    description: 'Các dây Power SW, Reset SW, HDD LED, Power LED từ case có thể bị cắm sai thứ tự, gây không bật nguồn hoặc đèn không hoạt động.',
    howToFix: '1. Xem manual mainboard để biết sơ đồ chân front panel\n2. Cắm theo thứ tự từ trái sang: Power SW (2 pin) | Reset SW | HDD LED\n3. Power LED có polarity (+, -) — cắm đúng chiều\n4. Nếu không bật: dùng tua vít chạm vào 2 chân Power SW để test',
    youtubeVideo: [
      {
        videoId: '2zVPxGq_aR4',
        title: 'Front Panel Connectors Guide',
        channelName: "Paul's Hardware",
        startSeconds: 180,
        endSeconds: 360,
        language: 'en',
        description: 'Hướng dẫn cắm dây front panel case'
      }
    ],
    animation: { type: 'shake', targetComponents: ['motherboard', 'case'], durationMs: 1500 },
    affectedParts: ['motherboard', 'case']
  },
  {
    id: 'err-cable-management-023',
    code: 'POOR_CABLE_MANAGEMENT',
    severity: 'info',
    title: 'Quản lý dây cáp kém',
    description: 'Dây cáp trong case bừa bộn, cản luồng khí, gây tăng nhiệt độ 5-10°C và khó vệ sinh sau này.',
    howToFix: '1. Đi dây sau mainboard tray (cable routing hole)\n2. Dùng dây rút (zip tie) để gom dây gọn\n3. Dây nguồn đi riêng, dây SATA gom chung\n4. Dùng ống dây (cable sleeve) cho dây 24-pin và GPU',
    youtubeVideo: [
      {
        videoId: 'P6SYFwH3Y04',
        title: 'PC Cable Management for Beginners',
        channelName: 'Bitwit',
        startSeconds: 120,
        endSeconds: 480,
        language: 'en',
        description: 'Hướng dẫn quản lý dây cáp trong case'
      }
    ],
    animation: { type: 'red-flash', targetComponents: ['case'], durationMs: 1800 },
    affectedParts: ['case']
  },
  {
    id: 'err-bios-settings-024',
    code: 'BIOS_SETTINGS_WRONG',
    severity: 'warning',
    title: 'Cài đặt BIOS không tối ưu',
    description: 'BIOS chưa được cấu hình đúng: chưa bật XMP, chưa set boot order, hoặc fan curve mặc định không tối ưu.',
    howToFix: '1. Vào BIOS (Del/F2 khi khởi động)\n2. Bật XMP/EXPO cho RAM\n3. Set Boot Order: ưu tiên SSD cài OS\n4. Điều chỉnh fan curve: 30°C 30% → 60°C 60% → 80°C 100%',
    youtubeVideo: [
      {
        videoId: 'b-pFHBL4_F8',
        title: 'BIOS Settings You Should Change Right Now',
        channelName: 'Linus Tech Tips',
        startSeconds: 60,
        endSeconds: 360,
        language: 'en',
        description: 'Các cài đặt BIOS quan trọng cần thay đổi'
      }
    ],
    animation: { type: 'shake', targetComponents: ['motherboard'], durationMs: 1200 },
    affectedParts: ['motherboard']
  },
  {
    id: 'err-gpu-sag-025',
    code: 'GPU_SAG_RISK',
    severity: 'info',
    title: 'GPU có nguy cơ bị võng (GPU sag)',
    description: 'GPU nặng (RTX 4080/4090 trở lên) có thể bị võng do trọng lực, gây hỏng slot PCIe và PCB về lâu dài.',
    howToFix: '1. Dùng GPU support bracket (chân đỡ GPU) đi kèm trong hộp case hoặc mua riêng\n2. Hoặc dùng GPU vertical mount kit (gắn GPU dọc)\n3. Một số mainboard có PCIe slot được gia cố (reinforced slot) giúp giảm sag',
    youtubeVideo: [
      {
        videoId: 'qNcnlVBEY84',
        title: 'GPU Sag Fix - Best Anti-Sag Solutions',
        channelName: 'JayzTwoCents',
        startSeconds: 60,
        endSeconds: 240,
        language: 'en',
        description: 'Các giải pháp chống võng GPU'
      }
    ],
    animation: { type: 'cross-mark', targetComponents: ['gpu', 'motherboard'], durationMs: 1500 },
    affectedParts: ['gpu', 'motherboard']
  },
];

export function findErrorByCode(code: string): AssemblyError | undefined {
  return ASSEMBLY_ERRORS.find((e) => e.code === code);
}

export function findErrorsByPart(partType: string): AssemblyError[] {
  return ASSEMBLY_ERRORS.filter((e) => e.affectedParts.includes(partType));
}

export function getErrorAnimationStyle(error: AssemblyError): Record<string, string | number> {
  const base: Record<string, string | number> = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 100,
  };
  switch (error.animation.type) {
    case 'shake':
      return {
        ...base,
        animation: `shake ${error.animation.durationMs}ms ease-in-out`,
      };
    case 'red-flash':
      return {
        ...base,
        background: 'rgba(239, 68, 68, 0.3)',
        animation: `redFlash ${error.animation.durationMs}ms ease-in-out`,
      };
    case 'cross-mark':
      return {
        ...base,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4rem',
        color: '#ef4444',
        animation: `crossMark ${error.animation.durationMs}ms ease-out`,
      };
    default:
      return base;
  }
}

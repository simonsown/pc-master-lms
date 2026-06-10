'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

const TOOLS = [
  { id: 'multimeter', icon: '⚡', label: 'Multimeter', label_vn: 'Đồng hồ đo' },
  { id: 'screwdriver', icon: '🔧', label: 'Screwdriver', label_vn: 'Tua vít' },
  { id: 'compressed_air', icon: '💨', label: 'Compressed Air', label_vn: 'Bình xịt khí' },
  { id: 'spare_psu', icon: '🔌', label: 'Spare PSU', label_vn: 'Nguồn dự phòng' },
  { id: 'bios_speaker', icon: '🔊', label: 'BIOS Speaker', label_vn: 'Loa BIOS' },
];

const SCENARIOS = [
  {
    id: 'no_power',
    title: 'No Power',
    title_vn: 'Không Lên Nguồn',
    description: 'PC does not turn on when pressing the power button. Fans do not spin.',
    description_vn: 'PC không lên khi bấm nút nguồn. Quạt không quay.',
    symptoms: ['No fan spin', 'No LEDs', 'Power button does nothing'],
    symptoms_vn: ['Quạt không quay', 'Đèn không sáng', 'Nút nguồn không tác dụng'],
    correct_answer: 'psu',
    hints: ['Check if the PSU switch is on', 'Check power cable connection', 'Try a different power outlet', 'PSU may be dead'],
    hints_vn: ['Kiểm tra công tắc nguồn PSU', 'Kiểm tra dây nguồn', 'Thử ổ cắm khác', 'PSU có thể bị hỏng'],
    difficulty: 'easy',
    icon: '🔌',
    options: [
      { id: 'psu', label: 'Dead PSU (Nguồn chết)', label_vn: 'Nguồn chết', correct: true },
      { id: 'cpu', label: 'CPU fried', label_vn: 'CPU cháy' },
      { id: 'ram', label: 'Loose RAM', label_vn: 'RAM lỏng' },
      { id: 'case', label: 'Short circuit in case', label_vn: 'Case bị chập' },
    ],
    tool_hints: {
      multimeter: 'PSU voltage rails read 0V on all lines.',
      multimeter_vn: 'Các đường điện PSU đều 0V.',
      screwdriver: 'All components appear seated. Power button header looks fine.',
      screwdriver_vn: 'Các linh kiện gắn chặt. Đầu nối nút nguồn bình thường.',
      compressed_air: 'No significant dust buildup inside.',
      compressed_air_vn: 'Không có bụi bẩn đáng kể bên trong.',
      spare_psu: 'PC boots normally with a known-good PSU.',
      spare_psu_vn: 'PC hoạt động bình thường với nguồn khác.',
      bios_speaker: 'No beep at all - no power reaching the board.',
      bios_speaker_vn: 'Không có tiếng beep - bo mạch không có điện.',
    },
    beep_pattern: '... (silence)',
    diagram: 'psu',
    diagnosis_step: 1,
  },
  {
    id: 'no_display',
    title: 'No Display / Black Screen',
    title_vn: 'Không Có Hình Ảnh',
    description: 'PC turns on (fans spin, LEDs on) but monitor shows no signal.',
    description_vn: 'PC lên nguồn (quạt quay, đèn sáng) nhưng màn hình không có tín hiệu.',
    symptoms: ['Fans spinning', 'LEDs on', 'No display output', 'No BIOS beep'],
    symptoms_vn: ['Quạt quay', 'Đèn sáng', 'Không có hình', 'Không có tiếng beep'],
    correct_answer: 'ram_reseat',
    hints: ['Try reseating RAM modules', 'Try one RAM stick at a time', 'Check GPU is seated properly', 'Clear CMOS'],
    hints_vn: ['Gắn lại RAM', 'Thử từng thanh RAM một', 'Kiểm tra GPU gắn chặt chưa', 'Clear CMOS'],
    difficulty: 'easy',
    icon: '🖥️',
    options: [
      { id: 'ram_reseat', label: 'Reseat RAM modules', label_vn: 'Gắn lại RAM', correct: true },
      { id: 'replace_cpu', label: 'Replace CPU', label_vn: 'Thay CPU' },
      { id: 'replace_monitor', label: 'Replace monitor', label_vn: 'Thay màn hình' },
      { id: 'reinstall_os', label: 'Reinstall Windows', label_vn: 'Cài lại Windows' },
    ],
    tool_hints: {
      multimeter: 'Voltages are normal. PSU functioning correctly.',
      multimeter_vn: 'Điện áp bình thường. Nguồn hoạt động tốt.',
      screwdriver: 'Reseating RAM modules fixed the issue - one stick was loose.',
      screwdriver_vn: 'Gắn lại RAM đã khắc phục - một thanh bị lỏng.',
      compressed_air: 'RAM slots cleaned. Minor dust present.',
      compressed_air_vn: 'Khe RAM đã được vệ sinh. Có bụi nhẹ.',
      spare_psu: 'Same issue with spare PSU - problem is not the PSU.',
      spare_psu_vn: 'Vẫn lỗi với nguồn khác - không phải do nguồn.',
      bios_speaker: 'Continuous long beep pattern - RAM error.',
      bios_speaker_vn: 'Tiếng beep dài liên tục - lỗi RAM.',
    },
    beep_pattern: 'BEEP... BEEP... BEEP... (long repeating)',
    diagram: 'ram',
    diagnosis_step: 1,
  },
  {
    id: 'blue_screen',
    title: 'Blue Screen (CRITICAL_PROCESS_DIED)',
    title_vn: 'Màn Hình Xanh (CRITICAL_PROCESS_DIED)',
    description: 'PC blue-screens with CRITICAL_PROCESS_DIED error shortly after booting Windows.',
    description_vn: 'PC bị màn hình xanh lỗi CRITICAL_PROCESS_DIED sau khi vào Windows.',
    symptoms: ['BSOD on boot', 'CRITICAL_PROCESS_DIED error', 'Boots to recovery', 'Safe mode also crashes'],
    symptoms_vn: ['BSOD khi khởi động', 'Lỗi CRITICAL_PROCESS_DIED', 'Vào recovery', 'Safe mode cũng lỗi'],
    correct_answer: 'repair_os',
    hints: ['Try Startup Repair', 'Check for recent driver updates', 'Run SFC /scannow', 'Reinstall Windows if needed'],
    hints_vn: ['Thử Startup Repair', 'Kiểm tra driver mới cài', 'Chạy SFC /scannow', 'Cài lại Windows nếu cần'],
    difficulty: 'medium',
    icon: '💀',
    options: [
      { id: 'repair_os', label: 'Repair corrupted system files', label_vn: 'Sửa file hệ thống', correct: true },
      { id: 'replace_ram', label: 'Replace RAM', label_vn: 'Thay RAM' },
      { id: 'replace_gpu', label: 'Replace GPU', label_vn: 'Thay GPU' },
      { id: 'replace_cpu', label: 'Replace CPU', label_vn: 'Thay CPU' },
    ],
    tool_hints: {
      multimeter: 'All voltage readings are within spec.',
      multimeter_vn: 'Điện áp đều trong ngưỡng cho phép.',
      screwdriver: 'Hardware appears correctly seated. Nothing loose.',
      screwdriver_vn: 'Phần cứng gắn chặt. Không có gì lỏng.',
      compressed_air: 'System is clean, no overheating signs.',
      compressed_air_vn: 'Hệ thống sạch, không có dấu hiệu quá nhiệt.',
      spare_psu: 'BSOD still occurs with spare PSU.',
      spare_psu_vn: 'BSOD vẫn xảy ra với nguồn khác.',
      bios_speaker: 'Single short beep - POST OK, problem is software.',
      bios_speaker_vn: 'Một beep ngắn - POST OK, lỗi phần mềm.',
    },
    beep_pattern: 'BEEP (single short - POST OK)',
    diagram: 'motherboard',
    diagnosis_step: 1,
  },
  {
    id: 'overheating',
    title: 'Overheating / Random Shutdowns',
    title_vn: 'Quá Nhiệt / Tắt Đột Ngột',
    description: 'PC randomly shuts down under load. Case feels hot. Fans run loud then stop.',
    description_vn: 'PC tắt đột ngột khi chạy nặng. Vỏ nóng. Quạt chạy to rồi ngừng.',
    symptoms: ['Random shutdowns', 'Loud fan noise then silence', 'Hot case', 'Crashes under load'],
    symptoms_vn: ['Tắt đột ngột', 'Quạt ồn rồi im', 'Vỏ máy nóng', 'Treo khi chạy nặng'],
    correct_answer: 'cooler_issue',
    hints: ['Check CPU cooler is spinning', 'Reapply thermal paste', 'Check fan curves in BIOS', 'Clean dust from heatsink'],
    hints_vn: ['Kiểm tra quạt CPU có quay không', 'Bôi lại keo tản nhiệt', 'Kiểm tra fan curve BIOS', 'Vệ sinh bụi tản nhiệt'],
    difficulty: 'medium',
    icon: '🌡️',
    options: [
      { id: 'cooler_issue', label: 'CPU cooler failure / dust clogged', label_vn: 'Quạt CPU hỏng / bụi bít', correct: true },
      { id: 'psu_overload', label: 'PSU overload', label_vn: 'PSU quá tải' },
      { id: 'virus', label: 'Virus / malware', label_vn: 'Virus' },
      { id: 'ram_error', label: 'RAM error', label_vn: 'RAM lỗi' },
    ],
    tool_hints: {
      multimeter: 'PSU voltages fluctuate but stay in range.',
      multimeter_vn: 'Điện áp PSU dao động nhưng trong ngưỡng.',
      screwdriver: 'CPU cooler mounting screws are loose. Heatsink not making full contact.',
      screwdriver_vn: 'Ốc tản nhiệt CPU lỏng. Tản nhiệt không tiếp xúc đủ.',
      compressed_air: 'Heatsink fins completely clogged with dust. Airflow blocked.',
      compressed_air_vn: 'Khe tản nhiệt bị bụi bít hoàn toàn. Không khí không lưu thông.',
      spare_psu: 'Same shutdowns with spare PSU.',
      spare_psu_vn: 'Vẫn tắt với nguồn khác.',
      bios_speaker: 'Single short beep. Overheat warning in BIOS.',
      bios_speaker_vn: 'Một beep ngắn. BIOS báo quá nhiệt.',
    },
    beep_pattern: 'BEEP (short) + overheat warning LED',
    diagram: 'cpu_cooler',
    diagnosis_step: 2,
  },
  {
    id: 'gpu_artifacts',
    title: 'GPU Artifacts / Glitched Display',
    title_vn: 'Lỗi Hiển Thị GPU',
    description: 'Screen shows strange colored squares, lines, or flickering. Happens in games and desktop.',
    description_vn: 'Màn hình có ô màu lạ, đường kẻ, nhấp nháy. Xảy ra cả game và desktop.',
    symptoms: ['Colored artifacts on screen', 'Flickering', 'Lines across display', 'Driver crashes'],
    symptoms_vn: ['Ô màu lạ trên màn', 'Nhấp nháy', 'Đường kẻ ngang dọc', 'Driver bị crash'],
    correct_answer: 'gpu_dying',
    hints: ['Check GPU temperatures', 'Try underclocking GPU', 'Test with another monitor', 'Check GPU seating'],
    hints_vn: ['Kiểm tra nhiệt GPU', 'Thử underclock GPU', 'Dùng màn hình khác', 'Kiểm tra gắn GPU'],
    difficulty: 'medium',
    icon: '🎮',
    options: [
      { id: 'gpu_dying', label: 'GPU is failing / VRAM damaged', label_vn: 'GPU hỏng / VRAM lỗi', correct: true },
      { id: 'cable_loose', label: 'Loose display cable', label_vn: 'Dây màn hình lỏng' },
      { id: 'monitor_broken', label: 'Monitor broken', label_vn: 'Màn hình hỏng' },
      { id: 'driver_issue', label: 'Driver issue only', label_vn: 'Chỉ lỗi driver' },
    ],
    tool_hints: {
      multimeter: 'GPU power delivery lines are stable.',
      multimeter_vn: 'Đường điện GPU ổn định.',
      screwdriver: 'GPU is seated firmly. Reseating did not help.',
      screwdriver_vn: 'GPU gắn chặt. Gắn lại không hết lỗi.',
      compressed_air: 'GPU fans are clean. Some dust but not overheating.',
      compressed_air_vn: 'Quạt GPU sạch. Có bụi nhưng không quá nhiệt.',
      spare_psu: 'Artifacts persist with spare PSU.',
      spare_psu_vn: 'Lỗi hiển thị vẫn còn với nguồn khác.',
      bios_speaker: 'One short beep. Artifacts visible even in BIOS - hardware failure.',
      bios_speaker_vn: 'Một beep ngắn. Lỗi hiển thị ngay cả trong BIOS - lỗi phần cứng.',
    },
    beep_pattern: 'BEEP (short)',
    diagram: 'gpu',
    diagnosis_step: 2,
  },
  {
    id: 'slow_pc',
    title: 'Slow PC / 100% Disk Usage',
    title_vn: 'Máy Chậm / Disk 100%',
    description: 'PC is extremely slow. Task Manager shows 100% disk usage constantly.',
    description_vn: 'Máy tính rất chậm. Task Manager hiển thị disk 100% liên tục.',
    symptoms: ['100% disk usage', 'Slow boot times', 'Applications freeze', 'File explorer hangs'],
    symptoms_vn: ['Disk 100%', 'Khởi động chậm', 'Ứng dụng đứng', 'File explorer treo'],
    correct_answer: 'hdd_failing',
    hints: ['Check Task Manager disk usage', 'Run CHKDSK', 'Check S.M.A.R.T. status', 'Consider replacing the drive'],
    hints_vn: ['Kiểm tra Task Manager', 'Chạy CHKDSK', 'Kiểm tra S.M.A.R.T.', 'Cân nhắc thay ổ cứng'],
    difficulty: 'medium',
    icon: '🐌',
    options: [
      { id: 'hdd_failing', label: 'HDD failing / SSD full', label_vn: 'HDD sắp hỏng / SSD đầy', correct: true },
      { id: 'virus', label: 'Virus infection', label_vn: 'Nhiễm virus' },
      { id: 'ram_low', label: 'Not enough RAM', label_vn: 'Thiếu RAM' },
      { id: 'cpu_old', label: 'CPU too old', label_vn: 'CPU quá cũ' },
    ],
    tool_hints: {
      multimeter: 'Drive power is normal.',
      multimeter_vn: 'Nguồn ổ cứng bình thường.',
      screwdriver: 'Cable connections are secure. Drive mounted properly.',
      screwdriver_vn: 'Kết nối cáp chặt. Ổ gắn đúng cách.',
      compressed_air: 'Drive enclosure is clean and cool.',
      compressed_air_vn: 'Vỏ ổ cứng sạch và mát.',
      spare_psu: 'Still slow with spare PSU.',
      spare_psu_vn: 'Vẫn chậm với nguồn khác.',
      bios_speaker: 'Single short beep. BIOS detects the drive but with high latency.',
      bios_speaker_vn: 'Một beep ngắn. BIOS phát hiện ổ nhưng độ trễ cao.',
    },
    beep_pattern: 'BEEP (short)',
    diagram: 'storage',
    diagnosis_step: 2,
  },
  {
    id: 'no_boot_device',
    title: 'No Boot Device Found',
    title_vn: 'Không Tìm Thấy Ổ Khởi Động',
    description: 'Screen says "No boot device found" or "Reboot and Select proper Boot device".',
    description_vn: 'Màn hình báo "No boot device found" hoặc "Reboot and Select proper Boot device".',
    symptoms: ['No boot device error', 'BIOS shows no drive', 'Clicking sound from HDD', 'Was working yesterday'],
    symptoms_vn: ['Lỗi không có boot device', 'BIOS không thấy ổ', 'Âm thanh lạ từ HDD', 'Hôm qua còn chạy'],
    correct_answer: 'ssd_dead',
    hints: ['Check SATA/NVMe connections', 'Boot into BIOS setup', 'Try a different SATA port', 'Check if drive appears in BIOS'],
    hints_vn: ['Kiểm tra kết nối SATA/NVMe', 'Vào BIOS setup', 'Thử cổng SATA khác', 'Kiểm tra BIOS có thấy ổ không'],
    difficulty: 'easy',
    icon: '💿',
    options: [
      { id: 'ssd_dead', label: 'SSD disconnected or dead', label_vn: 'SSD mất kết nối hoặc chết', correct: true },
      { id: 'os_corrupt', label: 'Windows corrupted', label_vn: 'Windows hỏng' },
      { id: 'bios_bug', label: 'BIOS settings wrong', label_vn: 'Cài đặt BIOS sai' },
      { id: 'cable_loose', label: 'Loose SATA cable', label_vn: 'Cáp SATA lỏng' },
    ],
    tool_hints: {
      multimeter: 'SATA power cable has correct voltage.',
      multimeter_vn: 'Cáp nguồn SATA có điện áp đúng.',
      screwdriver: 'SSD is not detected even after reseating. Try a known-working SSD.',
      screwdriver_vn: 'SSD không được phát hiện dù đã gắn lại. Thử SSD khác.',
      compressed_air: 'SATA ports cleaned. No visible damage.',
      compressed_air_vn: 'Cổng SATA đã vệ sinh. Không hư hỏng thấy được.',
      spare_psu: 'Same issue with spare PSU.',
      spare_psu_vn: 'Vẫn lỗi với nguồn khác.',
      bios_speaker: 'Beep codes indicate missing storage device.',
      bios_speaker_vn: 'Mã beep báo thiếu thiết bị lưu trữ.',
    },
    beep_pattern: 'BEEP (short) + "No boot device"',
    diagram: 'storage',
    diagnosis_step: 1,
  },
  {
    id: 'boot_loop',
    title: 'Boot Loop / Continuous Restart',
    title_vn: 'Boot Loop / Khởi Động Liên Tục',
    description: 'PC turns on, shows BIOS splash, then restarts repeatedly before reaching Windows.',
    description_vn: 'PC bật lên, thấy BIOS splash, rồi khởi động lại liên tục trước khi vào Windows.',
    symptoms: ['Continuous restart loop', 'Never reaches desktop', 'Sometimes shows Windows repair', 'Started after BIOS change'],
    symptoms_vn: ['Khởi động lại liên tục', 'Không vào được desktop', 'Đôi khi thấy Windows repair', 'Bắt đầu sau khi thay đổi BIOS'],
    correct_answer: 'bios_ram_instability',
    hints: ['Clear CMOS by removing the battery', 'Try booting with one RAM stick', 'Check if XMP/DOCP profile is stable', 'Update BIOS firmware'],
    hints_vn: ['Clear CMOS bằng cách tháo pin', 'Thử boot với 1 thanh RAM', 'Kiểm tra profile XMP/DOCP ổn định không', 'Cập nhật firmware BIOS'],
    difficulty: 'hard',
    icon: '🔄',
    options: [
      { id: 'bios_ram_instability', label: 'Bad BIOS settings / RAM instability', label_vn: 'BIOS sai / RAM không ổn định', correct: true },
      { id: 'psu_failing', label: 'PSU failing under load', label_vn: 'Nguồn yếu khi tải' },
      { id: 'gpu_driver', label: 'GPU driver crash loop', label_vn: 'Driver GPU lỗi' },
      { id: 'windows_update', label: 'Corrupted Windows update', label_vn: 'Update Windows lỗi' },
    ],
    tool_hints: {
      multimeter: 'PSU voltages fluctuate during boot attempt.',
      multimeter_vn: 'Điện áp PSU dao động khi khởi động.',
      screwdriver: 'Clearing CMOS by removing battery for 5 minutes resolved the boot loop.',
      screwdriver_vn: 'Clear CMOS bằng cách tháo pin 5 phút đã khắc phục boot loop.',
      compressed_air: 'System is clean. No dust issues.',
      compressed_air_vn: 'Hệ thống sạch. Không có vấn đề bụi.',
      spare_psu: 'Boot loop persists with spare PSU.',
      spare_psu_vn: 'Boot loop vẫn còn với nguồn khác.',
      bios_speaker: 'Repeating short beeps - memory or BIOS error.',
      bios_speaker_vn: 'Beep ngắn lặp lại - lỗi RAM hoặc BIOS.',
    },
    beep_pattern: 'BEEP BEEP BEEP BEEP (continuous short)',
    diagram: 'motherboard',
    diagnosis_step: 3,
  },
  {
    id: 'strange_noise',
    title: 'Strange Noise from PC',
    title_vn: 'Âm Thanh Lạ Từ PC',
    description: 'PC makes grinding, clicking, or buzzing noise. Performance seems normal otherwise.',
    description_vn: 'PC phát ra tiếng lạ: lách cách, ù hoặc rít. Hiệu năng vẫn bình thường.',
    symptoms: ['Grinding noise', 'Clicking sound', 'Buzzing from PSU area', 'Noise changes with load'],
    symptoms_vn: ['Tiếng lách cách', 'Tiếng lộp cộp', 'Ù từ vùng nguồn', 'Tiếng ồn thay đổi theo tải'],
    correct_answer: 'fan_bearing',
    hints: ['Locate where the noise is coming from', 'Stop fans one by one to identify', 'Check HDD for clicking sounds', 'Inspect fan blades for obstructions'],
    hints_vn: ['Xác định vị trí tiếng ồn', 'Dừng từng quạt để xác định', 'Kiểm tra HDD có tiếng lộp cộp', 'Kiểm tra cánh quạt có vướng gì không'],
    difficulty: 'easy',
    icon: '🔊',
    options: [
      { id: 'fan_bearing', label: 'Fan bearing worn out', label_vn: 'Bạc quạt bị mòn', correct: true },
      { id: 'hdd_damage', label: 'HDD head crash', label_vn: 'HDD đầu đọc hỏng' },
      { id: 'coil_whine', label: 'GPU coil whine (normal)', label_vn: 'Cuộn cảm GPU kêu' },
      { id: 'loose_screw', label: 'Loose screw vibrating', label_vn: 'Ốc lỏng rung' },
    ],
    tool_hints: {
      multimeter: 'No electrical issues detected.',
      multimeter_vn: 'Không phát hiện vấn đề điện.',
      screwdriver: 'Stopping the CPU fan temporarily stops the noise. Bearing is worn.',
      screwdriver_vn: 'Dừng quạt CPU tạm thời hết tiếng ồn. Bạc quạt bị mòn.',
      compressed_air: 'Blowing out dust from the fan did not help.',
      compressed_air_vn: 'Xịt bụi quạt không hết tiếng ồn.',
      spare_psu: 'Noise still present with spare PSU.',
      spare_psu_vn: 'Tiếng ồn vẫn còn với nguồn khác.',
      bios_speaker: 'No beep errors. System POSTs fine.',
      bios_speaker_vn: 'Không lỗi beep. System POST bình thường.',
    },
    beep_pattern: 'BEEP (short - normal)',
    diagram: 'fan',
    diagnosis_step: 1,
  },
  {
    id: 'no_wifi',
    title: 'Network Not Working / WiFi Missing',
    title_vn: 'Mất Mạng / Không Có WiFi',
    description: 'WiFi icon shows no networks available. Ethernet works fine.',
    description_vn: 'Biểu tượng WiFi không thấy mạng nào. Ethernet vẫn dùng được.',
    symptoms: ['WiFi networks not showing', 'WiFi adapter missing in Device Manager', 'Physical WiFi switch off', 'Driver error'],
    symptoms_vn: ['Không thấy mạng WiFi', 'Thiếu WiFi adapter trong Device Manager', 'Nút WiFi tắt', 'Lỗi driver'],
    correct_answer: 'wifi_driver',
    hints: ['Check WiFi is enabled in Windows', 'Toggle Airplane mode', 'Check Device Manager for errors', 'Reinstall WiFi driver'],
    hints_vn: ['Kiểm tra WiFi đã bật chưa', 'Bật/tắt chế độ máy bay', 'Kiểm tra Device Manager', 'Cài lại driver WiFi'],
    difficulty: 'medium',
    icon: '📶',
    options: [
      { id: 'wifi_driver', label: 'WiFi driver corrupted / antenna disconnected', label_vn: 'Driver WiFi lỗi / mất antenna', correct: true },
      { id: 'router_down', label: 'Router is down', label_vn: 'Router hỏng' },
      { id: 'isp_outage', label: 'ISP internet outage', label_vn: 'Mất internet ISP' },
      { id: 'windows_bug', label: 'Windows network bug', label_vn: 'Lỗi Windows' },
    ],
    tool_hints: {
      multimeter: 'WiFi card power pins are getting correct voltage.',
      multimeter_vn: 'Chân nguồn card WiFi có điện áp đúng.',
      screwdriver: 'WiFi card is seated. Antenna cables are connected but one seems loose.',
      screwdriver_vn: 'Card WiFi gắn chặt. Cáp antenna có vẻ lỏng một bên.',
      compressed_air: 'WiFi card cleaned. No visible damage.',
      compressed_air_vn: 'Card WiFi đã vệ sinh. Không hư hỏng thấy được.',
      spare_psu: 'WiFi still missing with spare PSU.',
      spare_psu_vn: 'WiFi vẫn mất với nguồn khác.',
      bios_speaker: 'POST OK. No hardware beep errors.',
      bios_speaker_vn: 'POST OK. Không lỗi beep phần cứng.',
    },
    beep_pattern: 'BEEP (short - normal)',
    diagram: 'wifi',
    diagnosis_step: 2,
  },
];

const DIFFICULTY_MAP = {
  easy: { label: 'Easy', label_vn: 'Dễ', color: '#28c76f' },
  medium: { label: 'Medium', label_vn: 'Trung bình', color: '#ffa300' },
  hard: { label: 'Hard', label_vn: 'Khó', color: '#e84855' },
};

function BeepAnimation({ pattern }) {
  const count = (pattern.match(/BEEP/g) || []).length;
  const isSilence = pattern.includes('silence');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px' }}>
      {isSilence ? (
        <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>... (silence)</span>
      ) : (
        Array.from({ length: Math.min(count, 6) }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: 'var(--success)',
              animation: 'diagnosisBeepPulse 0.8s ease-in-out ' + (i * 0.15) + 's infinite',
            }}
          />
        ))
      )}
    </div>
  );
}

function ToolCard({ tool, selected, disabled, onClick, lang }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        padding: '12px 8px', borderRadius: '10px', cursor: disabled ? 'default' : 'pointer',
        background: selected ? 'rgba(0,212,170,0.15)' : 'var(--bg-elevated)',
        border: selected ? '2px solid var(--success)' : '2px solid transparent',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s', minWidth: '80px', fontFamily: 'inherit',
        color: 'var(--text-primary)',
      }}
      type="button"
    >
      <span style={{ fontSize: '24px' }}>{tool.icon}</span>
      <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center' }}>
        {lang === 'vn' ? tool.label_vn : tool.label}
      </span>
    </button>
  );
}

function SymptomPanel({ symptoms, symptomsVn, beepPattern, icon, title, titleVn, difficulty, description, descriptionVn, lang }) {
  const diff = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP.easy;
  return (
    <div
      style={{
        background: 'var(--bg-surface)', borderRadius: '12px',
        border: '1px solid var(--border-default)', overflow: 'hidden',
        animation: 'diagnosisFadeIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}
      >
        <span style={{ fontSize: '32px' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {lang === 'vn' ? titleVn : title}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {lang === 'vn' ? descriptionVn : description}
          </div>
        </div>
        <div
          style={{
            padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
            fontWeight: 700, background: diff.color + '22', color: diff.color,
          }}
        >
          {lang === 'vn' ? diff.label_vn : diff.label}
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            {(lang === 'vn') ? 'Triệu chứng' : 'Symptoms'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(lang === 'vn' ? symptomsVn : symptoms).map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--danger)', flexShrink: 0,
                    animation: 'diagnosisPulseWarning 1.5s ease-in-out infinite',
                  }}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            {(lang === 'vn') ? 'Mã Beep' : 'Beep Pattern'}
          </div>
          <BeepAnimation pattern={beepPattern} />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{beepPattern}</div>
        </div>
      </div>
    </div>
  );
}

function ComponentDiagram({ type }) {
  const diagrams = {
    psu: { label: 'PSU', label_vn: 'Nguồn', color: '#e84855', parts: ['PSU Unit', 'Motherboard', 'CPU', 'GPU'] },
    ram: { label: 'RAM Slots', label_vn: 'Khe RAM', color: '#ffa300', parts: ['RAM Slot 1', 'RAM Slot 2', 'CPU', 'Motherboard'] },
    motherboard: { label: 'Motherboard', label_vn: 'Bo mạch chủ', color: '#4a90e2', parts: ['BIOS Chip', 'CMOS Battery', 'RAM Slots', 'CPU Socket'] },
    cpu_cooler: { label: 'CPU Cooler', label_vn: 'Tản nhiệt CPU', color: '#e84855', parts: ['Heatsink', 'Fan', 'Thermal Paste', 'CPU'] },
    gpu: { label: 'GPU', label_vn: 'Card đồ họa', color: '#28c76f', parts: ['GPU Chip', 'VRAM', 'Cooler', 'PCB'] },
    storage: { label: 'Storage Drive', label_vn: 'Ổ cứng', color: '#ffa300', parts: ['SATA Port', 'Power Cable', 'Data Cable', 'Drive'] },
    fan: { label: 'Case Fan', label_vn: 'Quạt case', color: '#4a90e2', parts: ['Fan Blade', 'Bearing', 'Motor', 'Frame'] },
    wifi: { label: 'WiFi Card', label_vn: 'Card WiFi', color: '#28c76f', parts: ['Antenna', 'Chip', 'PCIe Slot', 'Driver'] },
  };
  const d = diagrams[type] || diagrams.psu;
  return (
    <div
      style={{
        background: 'var(--bg-elevated)', borderRadius: '10px', padding: '16px',
        border: '1px solid var(--border-default)',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
        {d.label}
      </div>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '20px 12px', background: 'var(--bg-base)', borderRadius: '8px',
          border: '2px solid ' + d.color + '44',
        }}
      >
        <div style={{ fontSize: '36px', textAlign: 'center', color: d.color, opacity: 0.6 }}>
          ⬡
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
        {d.parts.map((part, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px',
              borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)',
              background: i === 0 ? d.color + '15' : 'transparent',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? d.color : 'var(--text-muted)' }} />
            <span style={{ fontWeight: i === 0 ? 700 : 400 }}>{part}</span>
            {i === 0 && (
              <span style={{ fontSize: '10px', color: d.color, fontWeight: 700, marginLeft: 'auto' }}>
                {'← ' + d.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Lives({ count }) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: '20px', transition: 'all 0.3s',
            opacity: i < count ? 1 : 0.2,
            filter: i < count ? 'none' : 'grayscale(1)',
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}

function ProgressBar({ current, total, lang }) {
  const pct = Math.round(((current) / total) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
      <div
        style={{
          flex: 1, height: '6px', background: 'var(--bg-elevated)',
          borderRadius: '3px', overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%', width: pct + '%',
            background: 'linear-gradient(90deg, var(--success), var(--accent-blue))',
            borderRadius: '3px', transition: 'width 0.4s ease-out',
          }}
        />
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {lang === 'vn' ? (current + 1) + '/' + total : (current + 1) + '/' + total}
      </span>
    </div>
  );
}

function getGrade(score) {
  if (score >= 450) return { grade: 'S', label: 'Excellent', label_vn: 'Xuất sắc', color: 'var(--success)' };
  if (score >= 350) return { grade: 'A', label: 'Great', label_vn: 'Giỏi', color: 'var(--success)' };
  if (score >= 250) return { grade: 'B', label: 'Good', label_vn: 'Khá', color: 'var(--accent-blue)' };
  if (score >= 150) return { grade: 'C', label: 'Average', label_vn: 'Trung bình', color: 'var(--warning)' };
  return { grade: 'F', label: 'Fail', label_vn: 'Trượt', color: 'var(--danger)' };
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
}

export default function DiagnosisMode({ lang = 'en', onComplete, onExit }) {
  const [phase, setPhase] = useState('intro');
  const [currentScenario, setCurrentScenario] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolUsedThisStep, setToolUsedThisStep] = useState(false);
  const [showResult, setShowResult] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [completedScenarios, setCompletedScenarios] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [finalResults, setFinalResults] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const timerRef = useRef(null);

  const tr = useCallback((en, vn) => (lang === 'vn' ? vn : en), [lang]);

  useEffect(() => {
    if (!document.getElementById('diagnosis-mode-styles')) {
      const style = document.createElement('style');
      style.id = 'diagnosis-mode-styles';
      style.textContent = [
        '@keyframes diagnosisFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }',
        '@keyframes diagnosisPulseWarning { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }',
        '@keyframes diagnosisBeepPulse { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.5); opacity: 1; } }',
        '@keyframes diagnosisGlow { 0%, 100% { box-shadow: 0 0 5px var(--success); } 50% { box-shadow: 0 0 20px var(--success); } }',
        '@keyframes diagnosisSlideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }',
        '@keyframes diagnosisShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 50% { transform: translateX(8px); } 75% { transform: translateX(-4px); } }',
        '.diagnosis-terminal { background: #0a0e17; color: #00ff88; font-family: "Courier New", monospace; text-shadow: 0 0 8px rgba(0,255,136,0.3); }',
      ].join(' ');
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsed(function(e) { return e + 1; });
      }, 1000);
      return function() { clearInterval(timerRef.current); };
    }
  }, [phase]);

  const handleStart = useCallback(function() {
    setPhase('playing');
    setCurrentScenario(0);
    setLives(3);
    setScore(0);
    setCompletedScenarios([]);
    setElapsed(0);
    setSelectedTool(null);
    setToolUsedThisStep(false);
    setShowResult(null);
    setShowExplanation(false);
  }, []);

  const handleToolSelect = useCallback(function(toolId) {
    if (toolUsedThisStep) return;
    setSelectedTool(toolId);
    setToolUsedThisStep(true);
  }, [toolUsedThisStep]);

  const finishGame = useCallback(function() {
    clearInterval(timerRef.current);
    var g = getGrade(score);
    setFinalResults({ score: score, scenariosCompleted: completedScenarios.length + 1, livesRemaining: lives, grade: g.grade });
    setPhase('results');
    if (onComplete) {
      onComplete({ score: score, scenariosCompleted: SCENARIOS.length, livesRemaining: lives, grade: g.grade });
    }
  }, [score, lives, completedScenarios, onComplete]);

  const handleScenarioFail = useCallback(function() {
    setCompletedScenarios(function(c) { return c.concat([currentScenario]); });
    if (currentScenario >= SCENARIOS.length - 1) {
      finishGame();
    } else {
      setCurrentScenario(function(c) { return c + 1; });
      setSelectedTool(null);
      setToolUsedThisStep(false);
      setShowResult(null);
      setShowExplanation(false);
    }
  }, [currentScenario, finishGame]);

  const handleNextScenario = useCallback(function() {
    setCompletedScenarios(function(c) { return c.concat([currentScenario]); });
    setShowResult(null);
    setShowExplanation(false);
    setSelectedTool(null);
    setToolUsedThisStep(false);
    if (currentScenario >= SCENARIOS.length - 1) {
      finishGame();
    } else {
      setCurrentScenario(function(c) { return c + 1; });
    }
  }, [currentScenario, finishGame]);

  const handleAnswer = useCallback(function(optionId) {
    var scenario = SCENARIOS[currentScenario];
    var isCorrect = optionId === scenario.correct_answer;
    var selectedOption = scenario.options.find(function(o) { return o.id === optionId; });

    if (isCorrect) {
      var timeBonus = Math.max(0, 60 - (elapsed % 60)) * 2;
      var livesBonus = lives * 25;
      var stepScore = 100 + timeBonus + livesBonus;
      setScore(function(s) { return s + stepScore; });
      setShowResult('correct');
      setFeedback(tr(
        'Correct! The issue was: ' + selectedOption.label + '. ' + scenario.hints[scenario.hints.length - 1],
        'Đúng! Vấn đề là: ' + selectedOption.label_vn + '. ' + scenario.hints_vn[scenario.hints_vn.length - 1]
      ));
      setShowExplanation(true);
    } else {
      var newLives = lives - 1;
      setLives(newLives);
      setShowResult('wrong');
      setFeedback(tr(
        'Wrong! ' + selectedOption.label + ' is not the issue.',
        'Sai! ' + selectedOption.label_vn + ' không phải vấn đề.'
      ));
      if (newLives <= 0) {
        setTimeout(function() { handleScenarioFail(); }, 1500);
        return;
      }
    }
  }, [currentScenario, lives, elapsed, handleScenarioFail, tr]);

  var scenario = SCENARIOS[currentScenario];

  if (phase === 'intro') {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'var(--bg-base)', display: 'flex', flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '32px', maxWidth: '640px',
            margin: '0 auto', textAlign: 'center', gap: '24px',
          }}
        >
          <div style={{ fontSize: '72px' }}>🔬</div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
            {tr('PC Diagnosis Mode', 'Chế Độ Chẩn Đoán PC')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, maxWidth: '480px' }}>
            {tr(
              'Become a PC technician! Diagnose 10 common PC problems by reading symptoms, using virtual tools, and identifying the faulty component. Choose wisely - you only have 3 lives!',
              'Trở thành kỹ thuật viên PC! Chẩn đoán 10 lỗi PC phổ biến bằng cách đọc triệu chứng, sử dụng công cụ ảo và xác định linh kiện hỏng. Chọn đúng - bạn chỉ có 3 mạng!'
            )}
          </p>

          <div
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
              width: '100%', maxWidth: '420px',
            }}
          >
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>📋</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{SCENARIOS.length}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {tr('Scenarios', 'Kịch bản')}
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>❤️</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>3</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {tr('Lives', 'Mạng')}
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>🛠️</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>5</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {tr('Tools', 'Công cụ')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={handleStart}
              style={{
                padding: '14px 40px', background: 'var(--brand-primary)', color: '#fff',
                border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              type="button"
            >
              {tr('Start Diagnosis', 'Bắt Đầu Chẩn Đoán')}
            </button>
            {onExit && (
              <button
                onClick={onExit}
                style={{
                  padding: '14px 24px', background: 'transparent', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-default)', borderRadius: '10px', fontSize: '15px',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                type="button"
              >
                {tr('Exit', 'Thoát')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    var g = getGrade(finalResults ? finalResults.score : score);
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'var(--bg-base)', display: 'flex', flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '32px', gap: '24px', maxWidth: '520px',
            margin: '0 auto', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '72px' }}>🏆</div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            {tr('Diagnosis Complete!', 'Chẩn Đoán Hoàn Tất!')}
          </h1>

          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '120px', height: '120px', borderRadius: '50%',
              background: g.color + '22', border: '4px solid ' + g.color,
            }}
          >
            <span style={{ fontSize: '48px', fontWeight: 900, color: g.color }}>
              {g.grade}
            </span>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)', borderRadius: '12px', padding: '20px',
              border: '1px solid var(--border-default)', width: '100%',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{tr('Total Score', 'Tổng điểm')}</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800 }}>
                {(finalResults ? finalResults.score : score).toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{tr('Scenarios Completed', 'Kịch bản hoàn thành')}</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 700 }}>
                {SCENARIOS.length}/{SCENARIOS.length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{tr('Lives Remaining', 'Mạng còn lại')}</span>
              <span style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: 3 }).map(function(_, i) {
                  return (
                    <span key={i} style={{ opacity: i < (finalResults ? finalResults.livesRemaining : lives) ? 1 : 0.2, fontSize: '16px' }}>
                      ❤️
                    </span>
                  );
                })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{tr('Time', 'Thời gian')}</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>
                {formatTime(elapsed)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{tr('Grade', 'Xếp loại')}</span>
              <span style={{ color: g.color, fontSize: '16px', fontWeight: 800 }}>{g.grade} - {lang === 'vn' ? g.label_vn : g.label}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleStart}
              style={{
                padding: '14px 32px', background: 'var(--brand-primary)', color: '#fff',
                border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
              type="button"
            >
              {tr('Play Again', 'Chơi Lại')}
            </button>
            {onExit && (
              <button
                onClick={onExit}
                style={{
                  padding: '14px 24px', background: 'transparent', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-default)', borderRadius: '10px', fontSize: '14px',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
                type="button"
              >
                {tr('Exit', 'Thoát')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  var toolHint = null;
  if (selectedTool && scenario.tool_hints) {
    toolHint = scenario.tool_hints[selectedTool + (lang === 'vn' ? '_vn' : '')] || scenario.tool_hints[selectedTool];
  }

  var headerStyle = {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 20px', borderBottom: '1px solid var(--border-default)',
    background: 'var(--bg-surface)',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--bg-base)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={headerStyle}>
        <button
          onClick={onExit}
          style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '18px', padding: '4px', fontFamily: 'inherit',
          }}
          type="button"
        >
          ✕
        </button>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {tr('PC Diagnosis', 'Chẩn đoán PC')}
        </span>
        <ProgressBar current={currentScenario} total={SCENARIOS.length} lang={lang} />
        <Lives count={lives} />
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'monospace' }}>
          {score.toLocaleString()}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {formatTime(elapsed)}
        </div>
      </div>

      <div
        style={{
          flex: 1, overflow: 'auto', padding: '20px',
          maxWidth: '900px', margin: '0 auto', width: '100%',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}
      >
        {scenario && (
          <SymptomPanel
            symptoms={scenario.symptoms}
            symptomsVn={scenario.symptoms_vn}
            beepPattern={scenario.beep_pattern}
            icon={scenario.icon}
            title={scenario.title}
            titleVn={scenario.title_vn}
            difficulty={scenario.difficulty}
            description={scenario.description}
            descriptionVn={scenario.description_vn}
            lang={lang}
          />
        )}

        <div
          style={{
            background: 'var(--bg-surface)', borderRadius: '12px',
            border: '1px solid var(--border-default)', padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            {tr('Toolbox', 'Hộp dụng cụ')}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {TOOLS.map(function(tool) {
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  selected={selectedTool === tool.id}
                  disabled={toolUsedThisStep}
                  onClick={function() { handleToolSelect(tool.id); }}
                  lang={lang}
                />
              );
            })}
          </div>

          {toolHint && (
            <div
              className="diagnosis-terminal"
              style={{
                marginTop: '12px', padding: '12px 16px', borderRadius: '8px',
                fontSize: '13px', lineHeight: '1.5',
                animation: 'diagnosisFadeIn 0.2s ease-out',
              }}
            >
              <div style={{ color: '#00ff88', opacity: 0.5, fontSize: '11px', marginBottom: '4px' }}>
                {'>'} {tr('Tool Result:', 'Kết quả công cụ:')}
              </div>
              <div>{toolHint}</div>
            </div>
          )}

          {!toolUsedThisStep && selectedTool === null && (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '10px', fontStyle: 'italic' }}>
              {tr('Select a tool above to inspect the system...', 'Chọn công cụ bên trên để kiểm tra hệ thống...')}
            </div>
          )}
        </div>

        <div
          style={{
            background: 'var(--bg-surface)', borderRadius: '12px',
            border: '1px solid var(--border-default)', padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            {tr('What is the problem?', 'Vấn đề là gì?')}
          </div>

          {showExplanation ? (
            <div
              style={{
                animation: 'diagnosisFadeIn 0.3s ease-out',
                display: 'flex', flexDirection: 'column', gap: '16px',
              }}
            >
              {showResult === 'correct' ? (
                <div
                  style={{
                    padding: '16px', borderRadius: '10px',
                    background: 'rgba(0,212,170,0.1)',
                    border: '1px solid var(--success)',
                    animation: 'diagnosisGlow 1.5s ease-in-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>✅</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--success)' }}>
                      {tr('Correct Diagnosis!', 'Chẩn Đoán Chính Xác!')}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                    {feedback}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    padding: '16px', borderRadius: '10px',
                    background: 'rgba(232,72,85,0.1)',
                    border: '1px solid var(--danger)',
                    animation: 'diagnosisShake 0.4s ease-in-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>❌</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--danger)' }}>
                      {tr('Wrong!', 'Sai!')}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                    {feedback}
                  </p>
                </div>
              )}

              {showResult === 'correct' && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleNextScenario}
                    style={{
                      padding: '12px 28px', background: 'var(--brand-primary)', color: '#fff',
                      border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                    type="button"
                  >
                    {currentScenario >= SCENARIOS.length - 1
                      ? tr('View Results', 'Xem Kết Quả')
                      : tr('Next Scenario', 'Kịch bản tiếp')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {scenario && scenario.options.map(function(option) {
                var isSelected = false;
                return (
                  <button
                    key={option.id}
                    onClick={function() { handleAnswer(option.id); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '12px 16px', borderRadius: '10px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      color: 'var(--text-primary)', fontSize: '13px',
                      transition: 'all 0.15s', width: '100%',
                    }}
                    type="button"
                  >
                    <div
                      style={{
                        width: '18px', height: '18px', borderRadius: '50%',
                        border: '2px solid var(--text-muted)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--brand-primary)' }} />}
                    </div>
                    <span>{lang === 'vn' ? option.label_vn : option.label}</span>
                  </button>
                );
              })}
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', marginTop: '4px' }}>
                {tr('Use a tool from the toolbox to get hints before answering!', 'Dùng công cụ để nhận gợi ý trước khi trả lời!')}
              </div>
            </div>
          )}
        </div>

        {scenario && !showExplanation && (
          <ComponentDiagram type={scenario.diagram} />
        )}
      </div>
    </div>
  );
}

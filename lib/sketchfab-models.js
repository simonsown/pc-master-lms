'use client';

export const COLOR_THEMES = {
  case: { label: 'Case', labelEn: 'Case', color: '#3b82f6', bg: '#0a1420', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  computerParts: { label: 'Computer Parts', labelEn: 'Computer Parts', color: '#f59e0b', bg: '#1a1008', gradient: 'linear-gradient(135deg, #f59e0b, #b45309)' },
  fullComponent: { label: 'Full Component', labelEn: 'Full Component', color: '#10b981', bg: '#0a1a12', gradient: 'linear-gradient(135deg, #10b981, #047857)' },
  psu: { label: 'PSU', labelEn: 'Power Supply', color: '#f97316', bg: '#1c1000', gradient: 'linear-gradient(135deg, #f97316, #7c2d12)' },
  mainboard: { label: 'Mainboard', labelEn: 'Mainboard', color: '#22d3ee', bg: '#0a1a1e', gradient: 'linear-gradient(135deg, #22d3ee, #155e75)' },
  cpu: { label: 'CPU', labelEn: 'CPU', color: '#ef4444', bg: '#1a0a0a', gradient: 'linear-gradient(135deg, #ef4444, #7f1d1d)' },
  gpu: { label: 'GPU', labelEn: 'GPU', color: '#a855f7', bg: '#1a0a1e', gradient: 'linear-gradient(135deg, #a855f7, #6b21a8)' },
  ram: { label: 'RAM', labelEn: 'RAM', color: '#f59e0b', bg: '#1c1000', gradient: 'linear-gradient(135deg, #f59e0b, #78350f)' },
  cooler: { label: 'Cooler', labelEn: 'Cooler', color: '#06b6d4', bg: '#080e14', gradient: 'linear-gradient(135deg, #06b6d4, #0e7490)' },
};

export const CATEGORIES = [
  {
    id: 'case',
    analyzedBy: 'Nguyễn Văn A - Kỹ thuật viên phần cứng',
    knowledge: 'Phân biệt các loại vỏ case theo kích thước (ATX, Micro-ATX, Mini-ITX), chất liệu (thép, nhôm, kính cường lực) và khả năng tản nhiệt. Tìm hiểu về luồng khí (airflow), vị trí lắp quạt và tản nhiệt nước.',
    items: [
      { id: '1', title: 'Dream Computer Setup', embedId: '82f78bbaf2d34f01af854a52151dbf49', description: 'Case màu tím với đầy đủ linh kiện bên trong' },
      { id: '2', title: 'Computer Components', embedId: 'ae35c58af1ae4e91aea4a81c7c225147', description: 'Case thùng màu trắng - thiết kế tối giản' },
      { id: '3', title: 'Tower Gaming Computer', embedId: '085d3328dc2e4618bfea9ebce7fd63a5', description: 'Case gaming tower màu trắng - RGB đầy đủ' },
      { id: '4', title: 'Computer Case', embedId: 'cfb12fe17c64464e8fb69a60d20c1d8d', description: 'Case máy tính màu trắng - kích thước chuẩn' },
    ],
  },
  {
    id: 'computerParts',
    analyzedBy: 'Trần Thị B - Giảng viên Kiến trúc máy tính',
    knowledge: 'Tổng quan về các bộ phận cấu thành máy tính để bàn: cách các linh kiện kết nối và tương tác với nhau trong một hệ thống hoàn chỉnh.',
    items: [
      { id: '1', title: 'Computer Parts (Built PC)', embedId: 'bd6fb0ed93f3475b890a099fedecf351', description: 'Mô hình PC hoàn chỉnh với case + linh kiện bên trong' },
    ],
  },
  {
    id: 'fullComponent',
    analyzedBy: 'Lê Văn C - Chuyên gia tư vấn cấu hình PC',
    knowledge: 'Nhận diện tất cả linh kiện trong một hệ thống máy tính: từ mainboard, CPU, GPU, RAM, PSU, ổ cứng đến các thiết bị ngoại vi.',
    items: [
      { id: '1', title: 'Computer Components (Full)', embedId: '4daeb72925d140809bdfd51634a1908e', description: 'Tổng hợp đầy đủ các linh kiện máy tính trong một mô hình' },
    ],
  },
  {
    id: 'psu',
    analyzedBy: 'Phạm Thị D - Kỹ sư điện tử',
    knowledge: 'Tìm hiểu về bộ nguồn máy tính (PSU): công suất (wattage), hiệu suất (80 Plus), các loại đầu cắm và cách chọn nguồn phù hợp cho cấu hình.',
    items: [
      { id: '1', title: 'PSU', embedId: '26fead1e09ae41c08d8596aea24dcad6', description: 'Bộ nguồn máy tính tiêu chuẩn' },
      { id: '2', title: 'PSU Power Supply Unit', embedId: '69ccd1be3a77497cb2acc9e39e7c52b3', description: 'Bộ nguồn PSU - view chi tiết' },
    ],
  },
  {
    id: 'mainboard',
    analyzedBy: 'Hoàng Văn E - Kỹ thuật viên sửa chữa mainboard',
    knowledge: 'Cấu tạo và chức năng của mainboard: chipset, socket CPU, khe RAM PCIe, các cổng kết nối I/O và cách lựa chọn mainboard phù hợp.',
    items: [
      { id: '1', title: 'MotherBoard + Components', embedId: '3bc94057328243d4b341a55f59160f8a', description: 'Mainboard với CPU, RAM và tản nhiệt gắn sẵn' },
      { id: '2', title: 'Asus Mainboard', embedId: '87723202fb8f4a66a1b6b69bd901f50c', description: 'Mainboard Asus màu đen' },
      { id: '3', title: 'Mainboard Dreamer', embedId: '64939d99ac544ed79bbaa7ef1d88b283', description: 'Mainboard dreamer' },
      { id: '4', title: 'Mainboard', embedId: '3675514fef19434493df6e8cdfa916dd', description: 'Mainboard tiêu chuẩn' },
      { id: '5', title: 'Mainboard Asus ROG Strix', embedId: '0f3029d57f8d470f99153c50f0285e53', description: 'Mainboard ROG Strix cao cấp' },
      { id: '6', title: 'Mainboard (6)', embedId: 'd880ab7a3ffb49d29ef5f4fe3aa1da2b', description: 'Mainboard màu đen' },
    ],
  },
  {
    id: 'cpu',
    analyzedBy: 'Ngô Văn F - Chuyên gia vi xử lý',
    knowledge: 'So sánh kiến trúc CPU Intel và AMD: số nhân, luồng, xung nhịp, TDP và cách chọn CPU phù hợp với nhu cầu học tập, làm việc hay gaming.',
    items: [
      { id: '1', title: 'INTEL CPU', embedId: 'ec11f729b05848488522ba6f8c6f254f', description: 'CPU Intel - kiến trúc chip xử lý' },
      { id: '2', title: 'Intel Core i3-3220', embedId: '34a8a97940514abb90e29c6d6a2579cd', description: 'CPU Intel Core i3 thế hệ 3' },
      { id: '3', title: 'AMD 9600x CPU', embedId: 'b433826fb4b1432dbc18a90b89dede71', description: 'CPU AMD Ryzen 9600x Low Poly' },
    ],
  },
  {
    id: 'gpu',
    analyzedBy: 'Đặng Thị G - Chuyên gia đồ họa & render',
    knowledge: 'Kiến thức về card đồ họa (GPU): kiến trúc, VRAM, xung nhịp, CUDA cores và cách chọn GPU cho gaming, render hay AI.',
    items: [
      { id: '1', title: 'GPU', embedId: '0124232c57f047b98a0afeb7f0ac1a26', description: 'Card đồ họa GPU' },
      { id: '2', title: 'Nvidia RTX 3090', embedId: '22158616a1a44455917ee8e1e8fc4b09', description: 'GPU Nvidia GeForce RTX 3090' },
      { id: '3', title: 'RX 480 GPU', embedId: '61e69f50bcd44c7284bef31a8f21c6a7', description: 'GPU AMD Radeon RX 480' },
      { id: '4', title: 'RTX 3060 TI Zotac', embedId: 'a5a78b9331b14c61b6bc0e99afd21b1c', description: 'GPU Zotac RTX 3060 Ti Twin Edge' },
      { id: '5', title: 'GPU RX 580', embedId: '6b3db05319be48028321ac94c4834bcb', description: 'GPU AMD Radeon RX 580' },
    ],
  },
  {
    id: 'ram',
    analyzedBy: 'Bùi Văn H - Kỹ sư hệ thống',
    knowledge: 'Phân biệt các loại RAM: DDR3, DDR4, DDR5 - dung lượng, bus speed, latency và cách chọn RAM phù hợp cho từng nhu cầu.',
    items: [
      { id: '1', title: 'Crucial 8GB DDR4', embedId: '6fa0d3b8c5684741be7d7e396e01bc9f', description: 'RAM Crucial 8GB DDR4 2133' },
      { id: '2', title: 'RAM', embedId: '50ca01ea09cf43318b84e176a127bd09', description: 'RAM máy tính' },
      { id: '3', title: 'RAM DDR3', embedId: 'd2715d60f139421eb6028efd5153fdaf', description: 'RAM DDR3 - thế hệ cũ' },
      { id: '4', title: 'Old Computer RAM', embedId: '9d3016df1c44484096c589b75a53936e', description: 'RAM máy tính đời cũ' },
    ],
  },
  {
    id: 'cooler',
    analyzedBy: 'Vũ Thị I - Chuyên gia tản nhiệt & overclock',
    knowledge: 'Các loại tản nhiệt CPU: tản khí (air cooler) vs tản nhiệt nước (liquid cooler), quạt RGB, thermal paste và cách lắp đặt đúng kỹ thuật.',
    items: [
      { id: '1', title: 'Cooler RGB', embedId: '5da990ba782943eb985723c3cb470880', description: 'Tản nhiệt LED RGB' },
      { id: '2', title: 'Corsair H150i Elite', embedId: 'faa8f55407404fd2870e35ab6a8f03bb', description: 'Tản nhiệt nước CPU Liquid Cooler' },
      { id: '3', title: 'CPU Cooler', embedId: '672a0a74a98c452a862016bee99f3579', description: 'Tản nhiệt CPU khí' },
    ],
  },
];

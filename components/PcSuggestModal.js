'use client';

import React, { useState, useMemo, useEffect } from 'react';

const PC_DATA = [
  { id: 1, name: 'MSI Titan GT77 HX', price: 145000000, img: 'https://images.unsplash.com/photo-1593640408182-31c228b14c73?w=600&q=80', cpu: 'Intel Core i9-13980HX', gpu: 'RTX 4090 Laptop', ram: '64GB DDR5', storage: '4TB NVMe', jobs: { dev: 92, ai: 95, render: 98, video: 97, game: 99, office: 70 }, pros: ['Hiệu năng đỉnh cao nhất', 'RAM 64GB DDR5', 'GPU 4090 cho AI/3D'], cons: ['Giá cao', 'Nặng 3.5kg', 'Pin yếu'], stores: [{ name: 'GearVN', price: 145000000 }, { name: 'Phong Vũ', price: 148000000 }], badge: 'Best Overall', badgeColor: '#f59e0b' },
  { id: 2, name: 'ASUS ROG Zephyrus G16', price: 62000000, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80', cpu: 'AMD Ryzen 9 7945HX', gpu: 'RTX 4070 Ti', ram: '32GB DDR5', storage: '2TB NVMe', jobs: { dev: 90, ai: 85, render: 90, video: 92, game: 95, office: 72 }, pros: ['Mỏng nhẹ 1.9kg', 'Màn OLED 2.5K', 'Pin 10h'], cons: ['Sạc chậm', 'Giá trung bình cao'], stores: [{ name: 'GearVN', price: 62000000 }, { name: 'Phong Vũ', price: 63500000 }], badge: 'Best Portable', badgeColor: '#06b6d4' },
  { id: 3, name: 'Apple MacBook Pro M3 Max', price: 85000000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', cpu: 'Apple M3 Max 16-core', gpu: 'GPU 40-core Metal', ram: '64GB Unified', storage: '2TB SSD', jobs: { dev: 98, ai: 90, render: 96, video: 99, game: 45, office: 95 }, pros: ['Pin 22h', 'Màn 16" Liquid Retina XDR', 'CPU mạnh nhất'], cons: ['Không game Windows', 'Giá cao'], stores: [{ name: 'Apple Store VN', price: 85000000 }, { name: 'Hoàng Hà Mobile', price: 84500000 }], badge: 'Best Dev/Video', badgeColor: '#a855f7' },
  { id: 4, name: 'Lenovo ThinkPad X1 Carbon Gen 11', price: 42000000, img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80', cpu: 'Intel Core i7-1365U', gpu: 'Intel Iris Xe', ram: '32GB LPDDR5', storage: '1TB SSD', jobs: { dev: 88, ai: 60, render: 50, video: 65, game: 30, office: 99 }, pros: ['Nhẹ nhất 1.12kg', 'Pin 15h', 'Bàn phím tuyệt vời'], cons: ['Không GPU rời', 'Màn thường'], stores: [{ name: 'Phong Vũ', price: 42000000 }, { name: 'Lazada', price: 41000000 }], badge: 'Best Business', badgeColor: '#10b981' },
  { id: 5, name: 'Dell XPS 15 9530', price: 58000000, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', cpu: 'Intel Core i9-13900H', gpu: 'RTX 4070', ram: '32GB DDR5', storage: '1TB NVMe', jobs: { dev: 93, ai: 80, render: 85, video: 90, game: 80, office: 85 }, pros: ['Thiết kế sang trọng', 'Build quality cao', 'Màn 4K OLED'], cons: ['Pin 6-8h', 'Nặng 2.0kg'], stores: [{ name: 'Phong Vũ', price: 58000000 }, { name: 'GearVN', price: 57500000 }], badge: 'Best Design', badgeColor: '#6366f1' },
  { id: 6, name: 'HP OMEN 16 RTX 4080', price: 52000000, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80', cpu: 'AMD Ryzen 9 7945HX', gpu: 'RTX 4080', ram: '32GB DDR5', storage: '1TB NVMe', jobs: { dev: 85, ai: 88, render: 92, video: 88, game: 97, office: 65 }, pros: ['GPU RTX 4080 cực mạnh', 'Màn 240Hz QHD'], cons: ['Nặng 2.5kg', 'Thiết kế thô'], stores: [{ name: 'GearVN', price: 52000000 }, { name: 'HP Store', price: 53000000 }], badge: 'Best Gaming', badgeColor: '#ef4444' },
  { id: 7, name: 'Acer Predator Helios 16', price: 48000000, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', cpu: 'Intel Core i9-13900HX', gpu: 'RTX 4080', ram: '32GB DDR5', storage: '1TB SSD', jobs: { dev: 83, ai: 86, render: 91, video: 86, game: 96, office: 60 }, pros: ['MiniLED 3.2K 240Hz', 'RGB đẹp'], cons: ['Ồn khi tải cao', 'Nặng 2.8kg'], stores: [{ name: 'Phong Vũ', price: 48000000 }, { name: 'GearVN', price: 47500000 }], badge: 'Gaming Beast', badgeColor: '#ef4444' },
  { id: 8, name: 'Gigabyte AORUS 17X', price: 75000000, img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80', cpu: 'Intel Core i9-13980HX', gpu: 'RTX 4090', ram: '64GB DDR5', storage: '2TB NVMe', jobs: { dev: 90, ai: 93, render: 97, video: 95, game: 98, office: 68 }, pros: ['RTX 4090 full power', 'Màn 17" 4K 144Hz', 'Thunderbolt 5'], cons: ['Giá cao', 'Pin 5h', 'Nặng 3.2kg'], stores: [{ name: 'GearVN', price: 75000000 }, { name: 'Phong Vũ', price: 76000000 }], badge: 'Extreme Power', badgeColor: '#f59e0b' },
  { id: 9, name: 'ASUS VivoBook 16X OLED', price: 22000000, img: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80', cpu: 'AMD Ryzen 7 7745H', gpu: 'RTX 4060 8GB', ram: '16GB DDR5', storage: '512GB NVMe', jobs: { dev: 78, ai: 72, render: 75, video: 78, game: 80, office: 88 }, pros: ['Màn OLED 16" đẹp', 'Giá hợp lý', 'Pin 10h'], cons: ['RAM 16GB hạn chế', 'SSD 512GB nhỏ'], stores: [{ name: 'Phong Vũ', price: 22000000 }, { name: 'GearVN', price: 21500000 }], badge: 'Best Value', badgeColor: '#22c55e' },
  { id: 10, name: 'MSI Creator Z17 HX Studio', price: 68000000, img: 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=600&q=80', cpu: 'Intel Core i9-13980HX', gpu: 'RTX 4080', ram: '64GB DDR5', storage: '2TB NVMe', jobs: { dev: 90, ai: 87, render: 96, video: 98, game: 85, office: 80 }, pros: ['True Pixel 4K+ 120Hz', 'Studio Mode', 'RAM 64GB'], cons: ['Giá cao', 'Nặng 2.8kg'], stores: [{ name: 'GearVN', price: 68000000 }, { name: 'Phong Vũ', price: 70000000 }], badge: 'Best Creator', badgeColor: '#a855f7' },
  { id: 11, name: 'Razer Blade 16', price: 95000000, img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80', cpu: 'Intel Core i9-14900HX', gpu: 'RTX 4090', ram: '32GB DDR5', storage: '2TB SSD', jobs: { dev: 88, ai: 92, render: 95, video: 96, game: 98, office: 72 }, pros: ['Thiết kế cao cấp nhất', 'RTX 4090 mỏng', 'Dual Mode display'], cons: ['Giá cực cao', 'Pin 6h'], stores: [{ name: 'GearVN', price: 95000000 }], badge: 'Premium', badgeColor: '#8b5cf6' },
  { id: 12, name: 'HP Spectre x360 14', price: 40000000, img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80', cpu: 'Intel Core Ultra 7 155H', gpu: 'Intel Arc', ram: '32GB LPDDR5', storage: '2TB SSD', jobs: { dev: 87, ai: 68, render: 60, video: 70, game: 40, office: 96 }, pros: ['2-in-1 xoay 360', 'OLED 2.8K cảm ứng', 'Pin 17h'], cons: ['Không GPU rời', 'Giá cao'], stores: [{ name: 'HP Store', price: 40000000 }], badge: 'Best 2-in-1', badgeColor: '#06b6d4' },
  { id: 13, name: 'Lenovo Legion 9i', price: 80000000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', cpu: 'Intel Core i9-13980HX', gpu: 'RTX 4090', ram: '64GB DDR5', storage: '2TB NVMe', jobs: { dev: 88, ai: 90, render: 95, video: 94, game: 99, office: 67 }, pros: ['Tản nhiệt nước tích hợp', 'Màn 3.2K 165Hz'], cons: ['Nặng 2.9kg', 'Giá rất cao'], stores: [{ name: 'Lenovo Store', price: 80000000 }], badge: 'Best Cooling', badgeColor: '#0ea5e9' },
  { id: 14, name: 'ASUS ProArt Studiobook 16', price: 72000000, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', cpu: 'AMD Ryzen 9 7945HX', gpu: 'RTX 4070', ram: '32GB DDR5', storage: '1TB SSD', jobs: { dev: 87, ai: 85, render: 94, video: 97, game: 75, office: 82 }, pros: ['Màn OLED 4K DCI-P3 100%', 'Dial sáng tạo'], cons: ['RTX 4070 giới hạn TDP'], stores: [{ name: 'GearVN', price: 72000000 }], badge: 'Best Artist', badgeColor: '#d946ef' },
  { id: 15, name: 'Samsung Galaxy Book4 Ultra', price: 55000000, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80', cpu: 'Intel Core Ultra 9 185H', gpu: 'RTX 4070', ram: '32GB LPDDR5x', storage: '1TB SSD', jobs: { dev: 90, ai: 82, render: 86, video: 90, game: 78, office: 90 }, pros: ['Mỏng nhẹ 1.86kg với RTX', 'Màn 3K AMOLED 120Hz'], cons: ['Pin 6-8h', 'Giá cao'], stores: [{ name: 'Samsung Store', price: 55000000 }], badge: 'Best Ecosystem', badgeColor: '#1a73e8' },
  { id: 16, name: 'Acer Swift X 16', price: 28000000, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80', cpu: 'Intel Core Ultra 5 125H', gpu: 'RTX 4060', ram: '16GB LPDDR5', storage: '512GB SSD', jobs: { dev: 82, ai: 76, render: 80, video: 82, game: 78, office: 85 }, pros: ['Mỏng 19.9mm, nhẹ 1.8kg', 'Giá tốt'], cons: ['RAM 16GB', 'SSD 512GB'], stores: [{ name: 'Phong Vũ', price: 28000000 }], badge: 'Thin & Light', badgeColor: '#22c55e' },
  { id: 17, name: 'MSI Prestige 16 AI Evo', price: 35000000, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', cpu: 'Intel Core Ultra 7 155H', gpu: 'Intel Arc + NPU', ram: '32GB LPDDR5', storage: '1TB SSD', jobs: { dev: 88, ai: 79, render: 68, video: 75, game: 50, office: 95 }, pros: ['Intel Evo certified', 'AI NPU tích hợp', 'Pin 13h'], cons: ['Không GPU rời mạnh'], stores: [{ name: 'GearVN', price: 35000000 }], badge: 'AI Optimized', badgeColor: '#00d4aa' },
  { id: 18, name: 'Dell G15 5530 Gaming', price: 26000000, img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80', cpu: 'Intel Core i7-13650HX', gpu: 'RTX 4060', ram: '16GB DDR5', storage: '512GB SSD', jobs: { dev: 77, ai: 70, render: 75, video: 75, game: 85, office: 72 }, pros: ['Giá gaming tốt', 'Màn 165Hz'], cons: ['Màn IPS thường', 'RAM 16GB', 'Nặng 2.8kg'], stores: [{ name: 'Phong Vũ', price: 26000000 }], badge: 'Budget Gaming', badgeColor: '#ef4444' },
  { id: 19, name: 'Lenovo ThinkPad T14s Gen 4', price: 32000000, img: 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=600&q=80', cpu: 'AMD Ryzen 7 Pro 7840U', gpu: 'AMD Radeon 780M', ram: '32GB LPDDR5', storage: '512GB SSD', jobs: { dev: 88, ai: 72, render: 62, video: 65, game: 40, office: 98 }, pros: ['vPro bảo mật', 'Bàn phím tốt nhất', 'Pin 15h'], cons: ['GPU tích hợp'], stores: [{ name: 'Lenovo Store', price: 32000000 }], badge: 'Best Security', badgeColor: '#1a73e8' },
  { id: 20, name: 'ASUS ROG Flow Z13', price: 42000000, img: 'https://images.unsplash.com/photo-1593640408182-31c228b14c73?w=600&q=80', cpu: 'Intel Core i9-13900H', gpu: 'RTX 4070', ram: '16GB LPDDR5', storage: '1TB SSD', jobs: { dev: 80, ai: 78, render: 82, video: 80, game: 88, office: 70 }, pros: ['Gaming tablet 2-in-1', 'Màn 165Hz'], cons: ['RAM 16GB', 'Bàn phím rời'], stores: [{ name: 'GearVN', price: 42000000 }], badge: 'Most Unique', badgeColor: '#f59e0b' },
  { id: 21, name: 'HP EliteBook 1040 G10', price: 45000000, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80', cpu: 'Intel Core Ultra 7 165U', gpu: 'Intel Iris Xe', ram: '32GB LPDDR5', storage: '1TB SSD', jobs: { dev: 86, ai: 65, render: 55, video: 62, game: 30, office: 99 }, pros: ['4G LTE tích hợp', 'Pin 17h', 'Nhẹ 1.27kg'], cons: ['Không GPU rời'], stores: [{ name: 'HP Store', price: 45000000 }], badge: 'Best Travel', badgeColor: '#0ea5e9' },
  { id: 22, name: 'Gigabyte G6X 2024', price: 32000000, img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80', cpu: 'Intel Core i7-13650HX', gpu: 'RTX 4060', ram: '16GB DDR5', storage: '1TB NVMe', jobs: { dev: 79, ai: 74, render: 78, video: 78, game: 86, office: 68 }, pros: ['Giá tốt GPU 4060', 'SSD 1TB'], cons: ['RAM 16GB'], stores: [{ name: 'GearVN', price: 32000000 }], badge: 'Best Spec/Price', badgeColor: '#22c55e' },
  { id: 23, name: 'Acer Nitro 17 AN17', price: 30000000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', cpu: 'AMD Ryzen 7 7745H', gpu: 'RTX 4060', ram: '16GB DDR5', storage: '512GB SSD', jobs: { dev: 78, ai: 72, render: 77, video: 76, game: 85, office: 65 }, pros: ['Màn 17.3 rộng', 'Giá tốt'], cons: ['RAM/SSD cần nâng', 'Nặng 3.1kg'], stores: [{ name: 'Phong Vũ', price: 30000000 }], badge: 'Big Screen', badgeColor: '#8b5cf6' },
  { id: 24, name: 'LG Gram 17 2024', price: 45000000, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', cpu: 'Intel Core Ultra 7 155H', gpu: 'Intel Arc', ram: '32GB LPDDR5', storage: '1TB SSD', jobs: { dev: 87, ai: 68, render: 58, video: 68, game: 38, office: 96 }, pros: ['Nhẹ nhất 17": 1.35kg', 'Pin 22h', 'MIL-SPEC chống sốc'], cons: ['GPU tích hợp yếu'], stores: [{ name: 'LG Store', price: 45000000 }], badge: 'Lightest 17"', badgeColor: '#0ea5e9' },
  { id: 25, name: 'Lenovo Legion 5 Pro Gen 8', price: 38000000, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80', cpu: 'AMD Ryzen 9 7945HX', gpu: 'RTX 4070', ram: '32GB DDR5', storage: '1TB SSD', jobs: { dev: 86, ai: 83, render: 88, video: 86, game: 93, office: 70 }, pros: ['QHD 240Hz', 'RTX 4070 đủ mạnh', 'Giá hợp lý'], cons: ['Design vuông vức'], stores: [{ name: 'GearVN', price: 38000000 }], badge: 'Best Balance', badgeColor: '#22c55e' },
  { id: 26, name: 'MSI GF63 Thin 12UC', price: 18000000, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', cpu: 'Intel Core i7-12650H', gpu: 'RTX 3050', ram: '8GB DDR4', storage: '512GB SSD', jobs: { dev: 70, ai: 58, render: 60, video: 62, game: 70, office: 78 }, pros: ['Giá rẻ nhất có GPU', 'Mỏng nhẹ 1.86kg'], cons: ['RTX 3050 yếu', 'RAM 8GB thấp'], stores: [{ name: 'Phong Vũ', price: 18000000 }], badge: 'Cheapest GPU', badgeColor: '#ef4444' },
  { id: 27, name: 'HP Victus 16 RTX 4060', price: 25000000, img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80', cpu: 'AMD Ryzen 7 7745H', gpu: 'RTX 4060 8GB', ram: '16GB DDR5', storage: '512GB NVMe', jobs: { dev: 78, ai: 74, render: 78, video: 76, game: 84, office: 70 }, pros: ['RTX 4060 giá mềm', 'Màn 144Hz'], cons: ['SSD 512GB', 'Pin 5h gaming'], stores: [{ name: 'HP Store', price: 25000000 }], badge: 'Budget Gaming+', badgeColor: '#ef4444' },
  { id: 28, name: 'ASUS ExpertBook B7 Flip', price: 38000000, img: 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=600&q=80', cpu: 'Intel Core Ultra 7 165U', gpu: 'Intel Iris Xe', ram: '32GB LPDDR5', storage: '1TB SSD', jobs: { dev: 85, ai: 66, render: 55, video: 62, game: 32, office: 97 }, pros: ['OLED 14" 2.8K cảm ứng', '4G LTE', 'Pin 14h'], cons: ['Không GPU rời'], stores: [{ name: 'GearVN', price: 38000000 }], badge: 'Enterprise', badgeColor: '#1a73e8' },
  { id: 29, name: 'ROG Strix SCAR 18 G834', price: 90000000, img: 'https://images.unsplash.com/photo-1593640408182-31c228b14c73?w=600&q=80', cpu: 'Intel Core i9-14900HX', gpu: 'RTX 4090 175W', ram: '64GB DDR5', storage: '2TB SSD', jobs: { dev: 89, ai: 93, render: 98, video: 96, game: 100, office: 66 }, pros: ['RTX 4090 full 175W TGP', 'QHD+ 240Hz MiniLED'], cons: ['Giá cực cao', 'Pin 3-4h', 'Nặng 3.1kg'], stores: [{ name: 'GearVN', price: 90000000 }], badge: 'Max Gaming', badgeColor: '#ef4444' },
  { id: 30, name: 'Surface Pro 10', price: 35000000, img: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80', cpu: 'Intel Core Ultra 7 165U', gpu: 'Intel Arc', ram: '32GB LPDDR5x', storage: '1TB SSD', jobs: { dev: 82, ai: 68, render: 60, video: 70, game: 35, office: 97 }, pros: ['Tablet + Laptop đẳng cấp', 'OLED 13" 120Hz'], cons: ['Không GPU rời', 'Bàn phím rời'], stores: [{ name: 'Microsoft Store', price: 35000000 }], badge: 'Best Tablet Pro', badgeColor: '#0078d4' },
  { id: 31, name: 'Lenovo IdeaPad Slim 5', price: 18500000, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80', cpu: 'AMD Ryzen 7 7730U', gpu: 'AMD Radeon', ram: '16GB DDR4', storage: '512GB SSD', jobs: { dev: 72, ai: 58, render: 50, video: 58, game: 42, office: 88 }, pros: ['Giá rẻ hợp lý', 'Pin 9h', 'Nhẹ 1.47kg'], cons: ['GPU tích hợp', 'RAM DDR4'], stores: [{ name: 'Lenovo Store', price: 18500000 }], badge: 'Student Pick', badgeColor: '#22c55e' },
  { id: 32, name: 'Dell Inspiron 16 Plus 7630', price: 35000000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', cpu: 'Intel Core i7-13700H', gpu: 'RTX 4060', ram: '16GB DDR5', storage: '512GB SSD', jobs: { dev: 80, ai: 75, render: 78, video: 79, game: 82, office: 79 }, pros: ['Màn 16" 3.2K IPS', 'Thiết kế đẹp'], cons: ['RAM/SSD cần nâng'], stores: [{ name: 'Phong Vũ', price: 35000000 }], badge: 'Beautiful Display', badgeColor: '#6366f1' },
  { id: 33, name: 'HP ZBook Power G10', price: 55000000, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', cpu: 'AMD Ryzen 9 PRO 7940HS', gpu: 'NVIDIA RTX 3000 Ada', ram: '64GB DDR5', storage: '2TB SSD', jobs: { dev: 88, ai: 82, render: 92, video: 90, game: 70, office: 85 }, pros: ['Workstation GPU chuyên nghiệp', '64GB ECC RAM'], cons: ['Nặng 2.2kg'], stores: [{ name: 'HP Store', price: 55000000 }], badge: 'Best Workstation', badgeColor: '#334155' },
  { id: 34, name: 'Acer ConceptD 9 Pro', price: 110000000, img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80', cpu: 'Intel Core i9-13900H', gpu: 'RTX 4090', ram: '64GB DDR5', storage: '4TB SSD', jobs: { dev: 88, ai: 90, render: 99, video: 99, game: 85, office: 78 }, pros: ['Ezel hinge độc nhất', 'Màn 4K 120Hz Pantone'], cons: ['Giá cực cao', 'Nặng 4.5kg'], stores: [{ name: 'GearVN', price: 110000000 }], badge: 'Pro Video', badgeColor: '#d946ef' },
  { id: 35, name: 'Framework Laptop 16', price: 52000000, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80', cpu: 'AMD Ryzen 9 7940HX', gpu: 'RX 7700S (module)', ram: '32GB DDR5', storage: '1TB SSD', jobs: { dev: 88, ai: 75, render: 78, video: 78, game: 80, office: 85 }, pros: ['Có thể nâng cấp mọi thứ', 'Mở nguồn'], cons: ['GPU module hạn chế'], stores: [{ name: 'Framework Store', price: 52000000 }], badge: 'Most Upgradeable', badgeColor: '#22c55e' },
  { id: 36, name: 'Lenovo Yoga Book 9i', price: 65000000, img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80', cpu: 'Intel Core Ultra 7 155U', gpu: 'Intel Iris Xe', ram: '32GB LPDDR5x', storage: '1TB SSD', jobs: { dev: 80, ai: 65, render: 58, video: 68, game: 28, office: 95 }, pros: ['Dual screen 13.3" OLED', 'Design futuristic'], cons: ['Không GPU rời', 'Giá rất cao'], stores: [{ name: 'Lenovo Store', price: 65000000 }], badge: 'Dual Screen', badgeColor: '#f59e0b' },
  { id: 37, name: 'ASUS ROG Zephyrus Duo 16', price: 85000000, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80', cpu: 'AMD Ryzen 9 7945HX', gpu: 'RTX 4090', ram: '64GB DDR5', storage: '2TB SSD', jobs: { dev: 90, ai: 93, render: 97, video: 96, game: 98, office: 72 }, pros: ['Dual screen 16+14"', 'RTX 4090 mạnh', 'Tản nhiệt xuất sắc'], cons: ['Nặng 2.78kg', 'Giá rất cao'], stores: [{ name: 'GearVN', price: 85000000 }], badge: 'Dual Gaming', badgeColor: '#8b5cf6' },
  { id: 38, name: 'HP Dragonfly Pro Chromebook', price: 28000000, img: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80', cpu: 'Intel Core i5-1235U', gpu: 'Intel Iris Xe', ram: '16GB LPDDR5', storage: '256GB SSD', jobs: { dev: 68, ai: 52, render: 40, video: 55, game: 20, office: 90 }, pros: ['ChromeOS nhẹ, bảo mật', 'OLED 14" cảm ứng', 'Nhẹ 1.34kg'], cons: ['Chỉ chạy web/Android', 'GPU yếu'], stores: [{ name: 'HP Store', price: 28000000 }], badge: 'Cloud First', badgeColor: '#1a73e8' },
  { id: 39, name: 'MSI Summit E16 Flip', price: 45000000, img: 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=600&q=80', cpu: 'Intel Core Ultra 7 155H', gpu: 'RTX 4060', ram: '32GB DDR5', storage: '1TB SSD', jobs: { dev: 87, ai: 78, render: 80, video: 83, game: 76, office: 90 }, pros: ['Màn 4K OLED cảm ứng', 'Bút cảm ứng kèm theo', '2-in-1 + GPU'], cons: ['Pin 8h'], stores: [{ name: 'GearVN', price: 45000000 }], badge: 'Best Pen Input', badgeColor: '#d946ef' },
  { id: 40, name: 'Huawei MateBook X Pro 2024', price: 48000000, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', cpu: 'Intel Core Ultra 9 185H', gpu: 'Intel Arc', ram: '32GB LPDDR5', storage: '2TB SSD', jobs: { dev: 88, ai: 70, render: 62, video: 70, game: 40, office: 95 }, pros: ['Mỏng 14.6mm, nhẹ 1.26kg', 'Màn OLED 3.1K 90Hz', 'Pin 14h'], cons: ['Không GPU rời'], stores: [{ name: 'Phong Vũ', price: 48000000 }], badge: 'Thinnest Premium', badgeColor: '#ef4444' },
  { id: 41, name: 'Alienware m18 R2', price: 105000000, img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80', cpu: 'Intel Core i9-14900HX', gpu: 'RTX 4090', ram: '64GB DDR5', storage: '4TB SSD', jobs: { dev: 88, ai: 93, render: 98, video: 97, game: 100, office: 65 }, pros: ['Desktop-class GPU', '18" 4K IPS 120Hz'], cons: ['Nặng 4.4kg', 'Pin 2-3h gaming'], stores: [{ name: 'GearVN', price: 105000000 }], badge: 'Most Powerful', badgeColor: '#0ea5e9' },
  { id: 42, name: 'Lenovo IdeaPad Gaming 3', price: 20000000, img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80', cpu: 'AMD Ryzen 5 7535H', gpu: 'RTX 4050', ram: '8GB DDR5', storage: '512GB SSD', jobs: { dev: 70, ai: 62, render: 65, video: 65, game: 75, office: 68 }, pros: ['Entry gaming giá rẻ nhất', 'RTX 4050 chơi được AAA'], cons: ['RAM 8GB cần nâng', 'Màn 60Hz'], stores: [{ name: 'Phong Vũ', price: 20000000 }], badge: 'Entry Gaming', badgeColor: '#f59e0b' },
  { id: 43, name: 'Apple MacBook Air M3', price: 32000000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', cpu: 'Apple M3 8-core', gpu: 'GPU 10-core Metal', ram: '16GB Unified', storage: '512GB SSD', jobs: { dev: 92, ai: 75, render: 82, video: 87, game: 38, office: 97 }, pros: ['Nhẹ 1.24kg, mỏng 11.5mm', 'Pin 18h', 'Fanless yên tĩnh'], cons: ['RAM 16GB hạn chế AI/3D'], stores: [{ name: 'Apple Store VN', price: 32000000 }], badge: 'Silent Pro', badgeColor: '#a855f7' },
  { id: 44, name: 'ASUS ROG Strix G18 2024', price: 65000000, img: 'https://images.unsplash.com/photo-1593640408182-31c228b14c73?w=600&q=80', cpu: 'Intel Core i9-14900HX', gpu: 'RTX 4090', ram: '32GB DDR5', storage: '1TB SSD', jobs: { dev: 88, ai: 92, render: 96, video: 95, game: 99, office: 66 }, pros: ['RTX 4090 QHD+ MiniLED 240Hz', 'Vapor Chamber', 'Giá tốt hơn SCAR'], cons: ['Nặng 3.1kg', 'Pin 5h'], stores: [{ name: 'GearVN', price: 65000000 }], badge: 'Flagship Value', badgeColor: '#ef4444' },
  { id: 45, name: 'MSI Cyborg 15 A13V', price: 22000000, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80', cpu: 'Intel Core i7-13620H', gpu: 'RTX 4060', ram: '16GB DDR5', storage: '512GB SSD', jobs: { dev: 77, ai: 72, render: 75, video: 75, game: 83, office: 70 }, pros: ['Design trong suốt độc đáo', 'RTX 4060 giá tốt'], cons: ['RAM/SSD cần nâng', 'Pin 6h'], stores: [{ name: 'Phong Vũ', price: 22000000 }], badge: 'Transparent Design', badgeColor: '#06b6d4' },
  { id: 46, name: 'HP Envy 16 x360', price: 38000000, img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80', cpu: 'Intel Core Ultra 7 155H', gpu: 'RTX 4060', ram: '32GB DDR5', storage: '1TB SSD', jobs: { dev: 86, ai: 80, render: 83, video: 86, game: 79, office: 88 }, pros: ['OLED 16" 4K 120Hz cảm ứng', '2-in-1 + GPU rời', 'Pin 11h'], cons: ['Nặng 2.3kg'], stores: [{ name: 'HP Store', price: 38000000 }], badge: 'Premium 2-in-1', badgeColor: '#0ea5e9' },
  { id: 47, name: 'Acer Predator Triton 500 SE', price: 72000000, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80', cpu: 'Intel Core i9-12900H', gpu: 'RTX 3080 Ti', ram: '32GB DDR5', storage: '2TB SSD', jobs: { dev: 86, ai: 88, render: 92, video: 90, game: 96, office: 70 }, pros: ['Mỏng nhất RTX 3080 Ti 19.9mm', 'Màn QHD 240Hz mini-LED'], cons: ['RTX 3080 Ti cũ', 'Giá cao'], stores: [{ name: 'GearVN', price: 72000000 }], badge: 'Thin Gaming Pro', badgeColor: '#06b6d4' },
  { id: 48, name: 'ASUS TUF Gaming F15 2024', price: 22000000, img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80', cpu: 'Intel Core i7-13620H', gpu: 'RTX 4060', ram: '16GB DDR5', storage: '512GB SSD', jobs: { dev: 76, ai: 70, render: 74, video: 74, game: 83, office: 70 }, pros: ['MIL-SPEC bền vững', 'Giá gaming tốt', 'Tản nhiệt ổn định lâu'], cons: ['Màn FHD 144Hz bình thường'], stores: [{ name: 'GearVN', price: 22000000 }], badge: 'Most Durable', badgeColor: '#f59e0b' },
  { id: 49, name: 'MSI Katana 17 B13V', price: 28000000, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', cpu: 'Intel Core i7-13620H', gpu: 'RTX 4070', ram: '16GB DDR5', storage: '512GB SSD', jobs: { dev: 80, ai: 76, render: 80, video: 80, game: 88, office: 70 }, pros: ['RTX 4070 giá tốt nhất', 'Màn FHD 144Hz'], cons: ['RAM/SSD cần nâng', 'Nặng 2.6kg'], stores: [{ name: 'GearVN', price: 28000000 }], badge: 'Best RTX4070 Value', badgeColor: '#22c55e' },
  { id: 50, name: 'Dell Latitude 9440 2-in-1', price: 52000000, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', cpu: 'Intel Core Ultra 7 165U', gpu: 'Intel Iris Xe', ram: '32GB LPDDR5x', storage: '1TB SSD', jobs: { dev: 86, ai: 68, render: 58, video: 66, game: 30, office: 99 }, pros: ['OLED 14" 2880x1800 120Hz', '5G + 4G dual SIM', 'Pin 18h'], cons: ['Không GPU rời', 'Giá doanh nghiệp'], stores: [{ name: 'Dell Store', price: 52000000 }], badge: 'Best Connectivity', badgeColor: '#1a73e8' },
];

const JOBS = [
  { key: 'all', label: 'Tất cả', icon: '🖥️', color: '#00d4aa' },
  { key: 'dev', label: 'Lập Trình', icon: '💻', color: '#6366f1' },
  { key: 'ai', label: 'AI / ML', icon: '🤖', color: '#00d4aa' },
  { key: 'render', label: '3D Render', icon: '🎨', color: '#a855f7' },
  { key: 'video', label: 'Video 4K', icon: '🎬', color: '#ef4444' },
  { key: 'game', label: 'Gaming', icon: '🎮', color: '#f59e0b' },
  { key: 'office', label: 'Văn phòng', icon: '📊', color: '#22c55e' },
];

function ScoreBar({ label, score }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: score >= 90 ? '#00d4aa' : score >= 75 ? '#f59e0b' : '#64748b' }}>{score}%</span>
      </div>
      <div style={{ height: '5px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: score + '%', background: score >= 90 ? 'linear-gradient(90deg,#00d4aa,#22c55e)' : score >= 75 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : '#334155', borderRadius: '3px' }} />
      </div>
    </div>
  );
}

function PcDetailModal({ pc, onClose }) {
  const [imgErr, setImgErr] = useState(false);
  const cheapest = pc.stores.reduce((a, b) => a.price < b.price ? a : b);
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 10010, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto', background: 'linear-gradient(145deg,#0f1729 0%,#1a2540 100%)', borderRadius: '20px', border: '1px solid #1e3a5f', boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
          {imgErr ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1628', fontSize: '64px' }}>💻</div> : <img src={pc.img} alt={pc.name} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,0.2),rgba(15,23,41,0.95))' }} />
          <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, fontSize: '18px', fontFamily: 'inherit' }}>✕</button>
          <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '60px' }}>
            <div style={{ display: 'inline-block', background: pc.badgeColor, color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', marginBottom: '8px' }}>{pc.badge}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '4px' }}>{pc.name}</div>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#00d4aa' }}>{(pc.price / 1000000).toFixed(0)} triệu đ</span>
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#00d4aa', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Cấu hình chi tiết</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px', marginBottom: '20px' }}>
            {[['CPU', pc.cpu], ['GPU', pc.gpu], ['RAM', pc.ram], ['SSD', pc.storage]].map(([k, v]) => (
              <div key={k} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>{k}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#0a1628', borderRadius: '12px', padding: '14px', border: '1px solid #1e293b', marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#00d4aa', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Phù hợp với công việc</div>
            {JOBS.filter(j => j.key !== 'all').map(j => <ScoreBar key={j.key} label={j.icon + ' ' + j.label} score={pc.jobs[j.key]} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#22c55e', marginBottom: '8px' }}>✅ Ưu điểm</div>
              {pc.pros.map((p, i) => <div key={i} style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>• {p}</div>)}
            </div>
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>⚠️ Hạn chế</div>
              {pc.cons.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>• {c}</div>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#00d4aa', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>So sánh giá cửa hàng</div>
            {pc.stores.map((store, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', marginBottom: '6px', background: store.name === cheapest.name ? 'rgba(0,212,170,0.08)' : '#0f172a', border: '1px solid ' + (store.name === cheapest.name ? '#00d4aa' : '#1e293b'), borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>{store.name}</span>
                  {store.name === cheapest.name && <span style={{ background: '#00d4aa', color: '#0a0f1a', fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>RẺ NHẤT</span>}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: store.name === cheapest.name ? '#00d4aa' : '#e2e8f0' }}>{store.price.toLocaleString('vi-VN')}đ</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PcCard({ pc, jobFilter, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  const score = jobFilter !== 'all' ? pc.jobs[jobFilter] : Math.max(...Object.values(pc.jobs));
  const bestJob = JOBS.find(j => j.key !== 'all' && pc.jobs[j.key] === Math.max(...JOBS.filter(x => x.key !== 'all').map(j2 => pc.jobs[j2.key])));
  return (
    <div onClick={() => onClick(pc)} style={{ background: 'linear-gradient(145deg,#0f172a 0%,#1e293b 100%)', border: '1px solid #1e3a5f', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease', position: 'relative' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#00d4aa'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,212,170,0.2)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#1e3a5f'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, background: pc.badgeColor + 'cc', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', backdropFilter: 'blur(8px)' }}>{pc.badge}</div>
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2, background: score >= 90 ? 'rgba(0,212,170,0.9)' : score >= 75 ? 'rgba(245,158,11,0.9)' : 'rgba(100,116,139,0.9)', color: '#fff', fontSize: '11px', fontWeight: 800, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{score}</div>
      <div style={{ height: '160px', overflow: 'hidden', position: 'relative', background: '#0a1628' }}>
        {imgErr ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>💻</div> : <img src={pc.img} alt={pc.name} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.06)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'} />}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(transparent,#0f172a)' }} />
      </div>
      <div style={{ padding: '14px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px', lineHeight: 1.3 }}>{pc.name}</div>
        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px' }}>{pc.cpu} · {pc.gpu}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#00d4aa' }}>{(pc.price / 1000000).toFixed(0)}tr ₫</div>
          {bestJob && <div style={{ fontSize: '9px', background: bestJob.color + '22', color: bestJob.color, padding: '2px 7px', borderRadius: '10px', fontWeight: 700 }}>{bestJob.icon} {bestJob.label}</div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
          {JOBS.filter(j => j.key !== 'all').slice(0, 4).map(j => (
            <div key={j.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '9px' }}>{j.icon}</span>
              <div style={{ flex: 1, height: '3px', background: '#1e293b', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: pc.jobs[j.key] + '%', background: pc.jobs[j.key] >= 90 ? '#00d4aa' : pc.jobs[j.key] >= 75 ? '#f59e0b' : '#334155', borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '8px', color: '#64748b', minWidth: '18px', textAlign: 'right' }}>{pc.jobs[j.key]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PcSuggestModal({ onClose }) {
  const [jobFilter, setJobFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [priceMax, setPriceMax] = useState(200);
  const filtered = useMemo(() => {
    return PC_DATA
      .filter(pc => jobFilter === 'all' || pc.jobs[jobFilter] >= 70)
      .filter(pc => pc.price / 1000000 <= priceMax)
      .filter(pc => pc.name.toLowerCase().includes(search.toLowerCase()) || pc.cpu.toLowerCase().includes(search.toLowerCase()) || pc.gpu.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => jobFilter === 'all' ? b.price - a.price : b.jobs[jobFilter] - a.jobs[jobFilter]);
  }, [jobFilter, search, priceMax]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape' && !selected) onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose, selected]);
  return (
    <>
      {selected && <PcDetailModal pc={selected} onClose={() => setSelected(null)} />}
      <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(2,6,20,0.97)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexShrink: 0 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>🖥️ Top 50 Máy Tính <span style={{ background: 'linear-gradient(90deg,#00d4aa,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gợi Ý</span></h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Lọc theo nghề nghiệp · Bấm vào máy để xem chi tiết & so sánh giá</p>
            </div>
            <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontFamily: 'inherit', flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', flexShrink: 0 }}>
            {JOBS.map(j => <button key={j.key} onClick={() => setJobFilter(j.key)} style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, border: '1.5px solid ' + (jobFilter === j.key ? j.color : 'rgba(255,255,255,0.1)'), background: jobFilter === j.key ? j.color + '22' : 'transparent', color: jobFilter === j.key ? j.color : '#64748b', cursor: 'pointer', transition: 'all 0.2s', boxShadow: jobFilter === j.key ? '0 0 12px ' + j.color + '40' : 'none', fontFamily: 'inherit' }}>{j.icon} {j.label}</button>)}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexShrink: 0 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm theo tên, CPU, GPU..." style={{ width: '100%', padding: '9px 12px 9px 34px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', color: '#e2e8f0', fontSize: '12px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>max {priceMax}tr</span>
              <input type="range" min={10} max={200} step={5} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} style={{ flex: 1, accentColor: '#00d4aa' }} />
            </div>
          </div>
          <div style={{ marginBottom: '12px', fontSize: '12px', color: '#64748b', flexShrink: 0 }}>Hiển thị <strong style={{ color: '#00d4aa' }}>{filtered.length}</strong> / 50 máy tính</div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px', alignContent: 'start', paddingRight: '4px' }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                <div style={{ fontSize: '14px' }}>Không tìm thấy máy phù hợp. Hãy thay đổi bộ lọc!</div>
              </div>
            ) : filtered.map(pc => <PcCard key={pc.id} pc={pc} jobFilter={jobFilter} onClick={setSelected} />)}
          </div>
        </div>
      </div>
    </>
  );
}
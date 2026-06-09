-- ==========================================================
-- PC Master Builder — Seed Data: Real Components (2026)
-- Migration: 20260610_seed_products
-- ==========================================================

INSERT INTO public.products (category, brand, model, full_name, release_year, price_vnd, cpu_socket, cpu_tdp_watts, cpu_cores, cpu_threads, cpu_base_ghz, cpu_boost_ghz, cpu_l3_cache_mb, cpu_has_igpu, cpu_ram_type, cpu_max_ram_mhz, cpu_generation, cpu_cinebench_r23_single, cpu_cinebench_r23_multi) VALUES
-- Intel 14th Gen
('CPU', 'Intel', 'i5-14600K', 'Intel Core i5-14600K', 2024, 8490000, 'LGA1700', 125, 14, 20, 3.5, 5.3, 24.0, true, 'DDR5', 5600, 'Raptor Lake Refresh', 2020, 24500),
('CPU', 'Intel', 'i5-14600KF', 'Intel Core i5-14600KF', 2024, 7990000, 'LGA1700', 125, 14, 20, 3.5, 5.3, 24.0, false, 'DDR5', 5600, 'Raptor Lake Refresh', 2020, 24500),
('CPU', 'Intel', 'i7-14700K', 'Intel Core i7-14700K', 2024, 12990000, 'LGA1700', 125, 20, 28, 3.4, 5.6, 33.0, true, 'DDR5', 5600, 'Raptor Lake Refresh', 2100, 35000),
('CPU', 'Intel', 'i9-14900K', 'Intel Core i9-14900K', 2024, 16990000, 'LGA1700', 125, 24, 32, 3.2, 6.0, 36.0, true, 'DDR5', 5600, 'Raptor Lake Refresh', 2200, 41000),
-- Intel 13th Gen
('CPU', 'Intel', 'i3-13100F', 'Intel Core i3-13100F', 2023, 2750000, 'LGA1700', 58, 4, 8, 3.4, 4.5, 12.0, false, 'DDR5', 4800, 'Raptor Lake', 1800, 8700),
('CPU', 'Intel', 'i5-13600K', 'Intel Core i5-13600K', 2022, 7490000, 'LGA1700', 125, 14, 20, 3.5, 5.1, 24.0, true, 'DDR5', 5600, 'Raptor Lake', 1980, 23900),
-- AMD Ryzen 7000
('CPU', 'AMD', 'R5-7600', 'AMD Ryzen 5 7600', 2023, 6500000, 'AM5', 65, 6, 12, 3.8, 5.1, 32.0, true, 'DDR5', 5200, 'Zen 4', 1900, 14500),
('CPU', 'AMD', 'R5-7600X', 'AMD Ryzen 5 7600X', 2022, 7100000, 'AM5', 105, 6, 12, 4.7, 5.3, 32.0, true, 'DDR5', 5200, 'Zen 4', 1950, 15200),
('CPU', 'AMD', 'R7-7800X3D', 'AMD Ryzen 7 7800X3D', 2023, 11800000, 'AM5', 120, 8, 16, 4.2, 5.0, 96.0, true, 'DDR5', 5200, 'Zen 4 3D V-Cache', 1810, 18300),
('CPU', 'AMD', 'R9-7950X', 'AMD Ryzen 9 7950X', 2022, 17600000, 'AM5', 170, 16, 32, 4.5, 5.7, 64.0, true, 'DDR5', 5200, 'Zen 4', 2000, 38000),
-- AMD Ryzen 5000
('CPU', 'AMD', 'R5-5600', 'AMD Ryzen 5 5600', 2022, 3300000, 'AM4', 65, 6, 12, 3.5, 4.4, 32.0, false, 'DDR4', 3200, 'Zen 3', 1520, 11400),
('CPU', 'AMD', 'R7-5800X3D', 'AMD Ryzen 7 5800X3D', 2022, 8100000, 'AM4', 105, 8, 16, 3.4, 4.5, 96.0, false, 'DDR4', 3200, 'Zen 3 3D V-Cache', 1490, 15500);

-- GPUs
INSERT INTO public.products (category, brand, model, full_name, release_year, price_vnd, gpu_vram_gb, gpu_tdp_watts, gpu_pcie_gen, gpu_length_mm, gpu_benchmark_1080p, gpu_recommended_psu, gpu_display_outputs, gpu_power_connectors) VALUES
('GPU', 'NVIDIA', 'RTX 4060', 'NVIDIA GeForce RTX 4060', 2023, 8200000, 8, 115, '4.0', 200, 18000, 550, '["HDMI 2.1","DP 1.4a"]'::jsonb, '[{"type":"8-pin","qty":1}]'::jsonb),
('GPU', 'NVIDIA', 'RTX 4060 Ti 8GB', 'NVIDIA GeForce RTX 4060 Ti 8GB', 2023, 11000000, 8, 160, '4.0', 240, 20000, 600, '["HDMI 2.1","DP 1.4a"]'::jsonb, '[{"type":"8-pin","qty":1}]'::jsonb),
('GPU', 'NVIDIA', 'RTX 4060 Ti 16GB', 'NVIDIA GeForce RTX 4060 Ti 16GB', 2024, 13500000, 16, 160, '4.0', 240, 21000, 600, '["HDMI 2.1","DP 1.4a"]'::jsonb, '[{"type":"8-pin","qty":1}]'::jsonb),
('GPU', 'NVIDIA', 'RTX 4070 Super', 'NVIDIA GeForce RTX 4070 Super', 2024, 15500000, 12, 220, '4.0', 260, 26000, 650, '["HDMI 2.1","DP 1.4a"]'::jsonb, '[{"type":"8-pin","qty":1}]'::jsonb),
('GPU', 'NVIDIA', 'RTX 4070 Ti Super', 'NVIDIA GeForce RTX 4070 Ti Super', 2024, 19000000, 16, 285, '4.0', 285, 29000, 700, '["HDMI 2.1","DP 1.4a"]'::jsonb, '[{"type":"8-pin","qty":1}]'::jsonb),
('GPU', 'NVIDIA', 'RTX 4080 Super', 'NVIDIA GeForce RTX 4080 Super', 2024, 28000000, 16, 320, '4.0', 310, 35000, 750, '["HDMI 2.1","DP 1.4a"]'::jsonb, '[{"type":"12VHPWR","qty":1}]'::jsonb),
('GPU', 'NVIDIA', 'RTX 4090', 'NVIDIA GeForce RTX 4090', 2022, 42000000, 24, 450, '4.0', 357, 52000, 850, '["HDMI 2.1","DP 1.4a"]'::jsonb, '[{"type":"12VHPWR","qty":1}]'::jsonb),
('GPU', 'AMD', 'RX 7600', 'AMD Radeon RX 7600', 2023, 6500000, 8, 165, '4.0', 204, 14000, 550, '["HDMI 2.1","DP 2.1"]'::jsonb, '[{"type":"8-pin","qty":1}]'::jsonb),
('GPU', 'AMD', 'RX 7700 XT', 'AMD Radeon RX 7700 XT', 2023, 9500000, 12, 245, '4.0', 267, 18000, 650, '["HDMI 2.1","DP 2.1"]'::jsonb, '[{"type":"8-pin","qty":2}]'::jsonb),
('GPU', 'AMD', 'RX 7800 XT', 'AMD Radeon RX 7800 XT', 2023, 12500000, 16, 263, '4.0', 267, 21500, 700, '["HDMI 2.1","DP 2.1"]'::jsonb, '[{"type":"8-pin","qty":2}]'::jsonb),
('GPU', 'NVIDIA', 'GTX 1650', 'NVIDIA GeForce GTX 1650', 2019, 2500000, 4, 75, '3.0', 170, 6000, 300, '["HDMI","DP"]'::jsonb, '[]'::jsonb);

-- Mainboards / ATX / LGA1700
INSERT INTO public.products (category, brand, model, full_name, release_year, price_vnd, mb_socket, mb_chipset, mb_form_factor, mb_ram_slots, mb_max_ram_gb, mb_ram_type, mb_max_ram_mhz, mb_m2_slots, mb_m2_pcie_gens, mb_pcie_x16_slots, mb_pcie_x16_gens, mb_sata_ports, mb_has_wifi, mb_usb_ports, mb_front_panel_headers) VALUES
('MAINBOARD', 'ASUS', 'TUF GAMING Z790-PLUS', 'ASUS TUF Gaming Z790-PLUS WiFi', 2023, 6500000, 'LGA1700', 'Z790', 'ATX', 4, 192, 'DDR5', 7200, 4, '["4.0","5.0"]'::jsonb, 2, '["5.0","4.0"]'::jsonb, 4, true, '[{"type":"USB 3.2 Gen2","qty":3},{"type":"USB 3.2 Gen1","qty":4}]'::jsonb, '[{"type":"USB 3.2 Gen1","pin":19},{"type":"USB-C","pin":19}]'::jsonb),
('MAINBOARD', 'MSI', 'PRO Z790-A MAX', 'MSI PRO Z790-A MAX WiFi', 2024, 5800000, 'LGA1700', 'Z790', 'ATX', 4, 192, 'DDR5', 7800, 5, '["4.0","5.0"]'::jsonb, 2, '["5.0","4.0"]'::jsonb, 6, true, '[{"type":"USB 3.2 Gen2","qty":4},{"type":"USB 3.2 Gen1","qty":4}]'::jsonb, '[{"type":"USB 3.2 Gen1","pin":19},{"type":"USB-C","pin":19}]'::jsonb),
('MAINBOARD', 'Gigabyte', 'B760M DS3H', 'Gigabyte B760M DS3H WiFi', 2024, 3200000, 'LGA1700', 'B760', 'mATX', 2, 64, 'DDR5', 6400, 2, '["4.0"]'::jsonb, 1, '["4.0"]'::jsonb, 4, true, '[{"type":"USB 3.2 Gen1","qty":4},{"type":"USB 2.0","qty":2}]'::jsonb, '[{"type":"USB 3.2 Gen1","pin":19}]'::jsonb),
('MAINBOARD', 'ASUS', 'PRIME B760M-A', 'ASUS Prime B760M-A WiFi', 2024, 2800000, 'LGA1700', 'B760', 'mATX', 2, 64, 'DDR5', 6400, 2, '["4.0"]'::jsonb, 1, '["4.0"]'::jsonb, 3, true, '[{"type":"USB 3.2 Gen1","qty":4}]'::jsonb, '[{"type":"USB 3.2 Gen1","pin":19}]'::jsonb),
-- AM5
('MAINBOARD', 'ASUS', 'TUF GAMING B650-PLUS', 'ASUS TUF Gaming B650-PLUS WiFi', 2023, 5200000, 'AM5', 'B650', 'ATX', 4, 128, 'DDR5', 6400, 3, '["4.0","5.0"]'::jsonb, 2, '["5.0","4.0"]'::jsonb, 4, true, '[{"type":"USB 3.2 Gen2","qty":3},{"type":"USB 3.2 Gen1","qty":2}]'::jsonb, '[{"type":"USB 3.2 Gen1","pin":19}]'::jsonb),
('MAINBOARD', 'MSI', 'MAG X670E TOMAHAWK', 'MSI MAG X670E Tomahawk WiFi', 2023, 7500000, 'AM5', 'X670E', 'ATX', 4, 192, 'DDR5', 7600, 4, '["4.0","5.0"]'::jsonb, 3, '["5.0","4.0"]'::jsonb, 6, true, '[{"type":"USB 3.2 Gen2","qty":4},{"type":"USB-C","qty":1}]'::jsonb, '[{"type":"USB 3.2 Gen2","pin":19}]'::jsonb),
-- AM4
('MAINBOARD', 'ASUS', 'TUF GAMING B550M', 'ASUS TUF Gaming B550M WiFi', 2022, 2800000, 'AM4', 'B550', 'mATX', 4, 128, 'DDR4', 4400, 2, '["3.0","4.0"]'::jsonb, 2, '["4.0","3.0"]'::jsonb, 6, true, '[{"type":"USB 3.2 Gen2","qty":2},{"type":"USB 3.2 Gen1","qty":4}]'::jsonb, '[{"type":"USB 3.2 Gen1","pin":19}]'::jsonb);

-- RAM DDR5
INSERT INTO public.products (category, brand, model, full_name, release_year, price_vnd, ram_ddr_type, ram_speed_mhz, ram_cl_latency, ram_capacity_gb, ram_kit_count, ram_has_xmp, ram_has_expo, ram_voltage_v, ram_height_mm) VALUES
('RAM', 'Kingston', 'KF560C36-16', 'Kingston Fury Beast 16GB DDR5-6000', 2023, 1200000, 'DDR5', 6000, 36, 16, 1, true, false, 1.35, 33),
('RAM', 'Kingston', 'KF560C36-32', 'Kingston Fury Beast 32GB (2x16) DDR5-6000', 2023, 2200000, 'DDR5', 6000, 36, 32, 2, true, false, 1.35, 33),
('RAM', 'G.Skill', 'F5-6000J3636F16G', 'G.Skill Trident Z5 32GB (2x16) DDR5-6000 CL36', 2023, 2500000, 'DDR5', 6000, 36, 32, 2, true, true, 1.35, 42),
('RAM', 'Corsair', 'CMK32GX5M2B6000C36', 'Corsair Vengeance 32GB (2x16) DDR5-6000', 2023, 2400000, 'DDR5', 6000, 36, 32, 2, true, true, 1.35, 36),
('RAM', 'G.Skill', 'F5-6000J3040G32G', 'G.Skill Trident Z5 Neo 64GB (2x32) DDR5-6000 CL30', 2024, 4800000, 'DDR5', 6000, 30, 64, 2, true, true, 1.40, 42),
('RAM', 'Kingston', 'KF560C30-64', 'Kingston Fury Beast 64GB (2x32) DDR5-6000', 2024, 4500000, 'DDR5', 6000, 30, 64, 2, true, true, 1.35, 33);

-- RAM DDR4
INSERT INTO public.products (category, brand, model, full_name, release_year, price_vnd, ram_ddr_type, ram_speed_mhz, ram_cl_latency, ram_capacity_gb, ram_kit_count, ram_has_xmp, ram_has_expo, ram_voltage_v, ram_height_mm) VALUES
('RAM', 'Kingston', 'KF432C16-8', 'Kingston Fury Beast 8GB DDR4-3200', 2022, 400000, 'DDR4', 3200, 16, 8, 1, true, false, 1.35, 33),
('RAM', 'Kingston', 'KF432C16-16', 'Kingston Fury Beast 16GB DDR4-3200', 2022, 700000, 'DDR4', 3200, 16, 16, 1, true, false, 1.35, 33),
('RAM', 'G.Skill', 'F4-3600C18D-32', 'G.Skill Ripjaws V 32GB (2x16) DDR4-3600', 2022, 1350000, 'DDR4', 3600, 18, 32, 2, true, false, 1.35, 42);

-- PSU
INSERT INTO public.products (category, brand, model, full_name, release_year, price_vnd, psu_wattage, psu_efficiency, psu_modular, psu_connectors, psu_has_12vhpwr, psu_length_mm) VALUES
('PSU', 'Corsair', 'CX550', 'Corsair CX550 550W 80+ Bronze', 2022, 1200000, 550, '80plus_bronze', 'semi_modular', '[{"type":"PCIe 6+2-pin","qty":2},{"type":"SATA","qty":6}]'::jsonb, false, 125),
('PSU', 'Corsair', 'RM650', 'Corsair RM650 650W 80+ Gold', 2023, 2200000, 650, '80plus_gold', 'full_modular', '[{"type":"PCIe 6+2-pin","qty":2},{"type":"SATA","qty":6},{"type":"CPU 8-pin","qty":2}]'::jsonb, false, 140),
('PSU', 'Corsair', 'RM750', 'Corsair RM750 750W 80+ Gold', 2023, 2600000, 750, '80plus_gold', 'full_modular', '[{"type":"PCIe 6+2-pin","qty":4},{"type":"SATA","qty":8},{"type":"CPU 8-pin","qty":2}]'::jsonb, false, 150),
('PSU', 'Corsair', 'RM850', 'Corsair RM850 850W 80+ Gold', 2023, 3100000, 850, '80plus_gold', 'full_modular', '[{"type":"PCIe 6+2-pin","qty":4},{"type":"SATA","qty":8},{"type":"CPU 8-pin","qty":2}]'::jsonb, false, 160),
('PSU', 'Corsair', 'RM1000x', 'Corsair RM1000x 1000W 80+ Gold', 2024, 4200000, 1000, '80plus_gold', 'full_modular', '[{"type":"PCIe 6+2-pin","qty":6},{"type":"SATA","qty":10},{"type":"12VHPWR","qty":1},{"type":"CPU 8-pin","qty":2}]'::jsonb, true, 180),
('PSU', 'FSP', 'VITA GM 750', 'FSP VITA GM 750W 80+ Gold', 2024, 1750000, 750, '80plus_gold', 'full_modular', '[{"type":"PCIe 6+2-pin","qty":2},{"type":"SATA","qty":4},{"type":"CPU 8-pin","qty":1}]'::jsonb, false, 140);

-- Cases
INSERT INTO public.products (category, brand, model, full_name, release_year, price_vnd, case_supported_forms, case_max_gpu_length_mm, case_max_cooler_height_mm, case_max_psu_length_mm, case_drive_bays, case_fan_slots, case_supports_aio, case_mesh_front, case_side_panel) VALUES
('CASE', 'NZXT', 'H5 Flow', 'NZXT H5 Flow (2024)', 2024, 2200000, '["ATX","mATX","ITX"]'::jsonb, 365, 165, 200, '[{"type":"3.5","qty":1},{"type":"2.5","qty":2}]'::jsonb, '[{"size":120,"qty":2,"type":"intake"},{"size":120,"qty":1,"type":"exhaust"}]'::jsonb, '[240,280]'::jsonb, true, 'glass'),
('CASE', 'Corsair', '4000D Airflow', 'Corsair 4000D Airflow', 2022, 2400000, '["ATX","mATX","ITX"]'::jsonb, 360, 170, 220, '[{"type":"3.5","qty":2},{"type":"2.5","qty":2}]'::jsonb, '[{"size":120,"qty":2,"type":"intake"},{"size":120,"qty":1,"type":"exhaust"}]'::jsonb, '[240,280,360]'::jsonb, true, 'glass'),
('CASE', 'Lian Li', 'LANCOOL 216', 'Lian Li LANCOOL 216', 2023, 2600000, '["ATX","mATX","ITX"]'::jsonb, 392, 180, 200, '[{"type":"3.5","qty":2},{"type":"2.5","qty":2}]'::jsonb, '[{"size":140,"qty":2,"type":"intake"},{"size":120,"qty":1,"type":"exhaust"}]'::jsonb, '[240,280,360]'::jsonb, true, 'glass'),
('CASE', 'Fractal', 'Pop Air', 'Fractal Design Pop Air', 2023, 1900000, '["ATX","mATX","ITX"]'::jsonb, 405, 170, 190, '[{"type":"3.5","qty":2},{"type":"2.5","qty":2}]'::jsonb, '[{"size":120,"qty":3,"type":"intake"},{"size":120,"qty":1,"type":"exhaust"}]'::jsonb, '[240,280,360]'::jsonb, true, 'glass'),
('CASE', 'Cooler Master', 'MasterBox Q300L', 'Cooler Master MasterBox Q300L', 2020, 900000, '["mATX","ITX"]'::jsonb, 360, 157, 160, '[{"type":"3.5","qty":1},{"type":"2.5","qty":1}]'::jsonb, '[{"size":120,"qty":2,"type":"intake"},{"size":120,"qty":1,"type":"exhaust"}]'::jsonb, '[240]'::jsonb, true, 'mesh');

-- Coolers
INSERT INTO public.products (category, brand, model, full_name, release_year, price_vnd, cooler_max_tdp_support, cooler_height_mm, cooler_supported_sockets, cooler_type, cooler_aio_size_mm, cooler_fan_rpm_max, cooler_fan_noise_dba, cooler_fan_qty, cooler_has_rgb) VALUES
('COOLER', 'Cooler Master', 'Hyper 212', 'Cooler Master Hyper 212 Black', 2022, 650000, 150, 152, '["LGA1700","LGA1200","AM5","AM4"]'::jsonb, 'air', NULL, 2000, 26.0, 1, false),
('COOLER', 'Noctua', 'NH-D15', 'Noctua NH-D15', 2020, 1850000, 250, 165, '["LGA1700","LGA1200","LGA1151","AM5","AM4"]'::jsonb, 'air', NULL, 1500, 24.6, 2, false),
('COOLER', 'Deepcool', 'AK400', 'Deepcool AK400 Black', 2023, 550000, 180, 155, '["LGA1700","LGA1200","AM5","AM4"]'::jsonb, 'air', NULL, 1850, 28.5, 1, false),
('COOLER', 'Corsair', 'H100i RGB', 'Corsair H100i RGB Elite 240mm', 2023, 3100000, 250, NULL, '["LGA1700","LGA1200","AM5","AM4"]'::jsonb, 'aio', 240, 2100, 34.0, 2, true),
('COOLER', 'Corsair', 'H150i RGB', 'Corsair H150i RGB Elite 360mm', 2023, 4200000, 300, NULL, '["LGA1700","LGA1200","AM5","AM4"]'::jsonb, 'aio', 360, 2100, 36.0, 3, true),
('COOLER', 'NZXT', 'Kraken X63', 'NZXT Kraken X63 280mm', 2023, 3800000, 280, NULL, '["LGA1700","LGA1200","AM5","AM4"]'::jsonb, 'aio', 280, 1800, 33.0, 2, true);

-- SSDs
INSERT INTO public.products (category, brand, model, full_name, release_year, price_vnd, ssd_interface, ssd_pcie_gen, ssd_capacity_gb, ssd_read_mbps, ssd_write_mbps, ssd_has_dram_cache, ssd_form_factor, ssd_nand_type, ssd_tbw, ssd_max_seq_read, ssd_max_seq_write, ssd_max_rand_read, ssd_max_rand_write) VALUES
('SSD', 'Samsung', '990 Pro', 'Samsung 990 Pro 1TB NVMe', 2024, 3200000, 'm2_nvme', '4.0', 1000, 7450, 6900, true, 'M.2 2280', 'TLC', 600, 7450, 6900, 1200000, 1100000),
('SSD', 'Samsung', '990 Pro 2TB', 'Samsung 990 Pro 2TB NVMe', 2024, 5600000, 'm2_nvme', '4.0', 2000, 7450, 6900, true, 'M.2 2280', 'TLC', 1200, 7450, 6900, 1400000, 1300000),
('SSD', 'SK Hynix', 'P41 Plat', 'SK Hynix Platinum P41 1TB', 2023, 3000000, 'm2_nvme', '4.0', 1000, 7000, 6500, true, 'M.2 2280', 'TLC', 750, 7000, 6500, 1000000, 900000),
('SSD', 'WD', 'SN850X', 'WD Black SN850X 1TB NVMe', 2023, 2900000, 'm2_nvme', '4.0', 1000, 7300, 6300, true, 'M.2 2280', 'TLC', 600, 7300, 6300, 1100000, 1000000),
('SSD', 'Kingston', 'NV3', 'Kingston NV3 1TB NVMe', 2024, 1400000, 'm2_nvme', '4.0', 1000, 6000, 4000, false, 'M.2 2280', 'QLC', 320, 6000, 4000, 450000, 300000),
('SSD', 'Crucial', 'MX500', 'Crucial MX500 1TB SATA', 2021, 1900000, 'sata_ssd', NULL, 1000, 560, 510, true, '2.5 inch', 'TLC', 360, 560, 510, 95000, 90000);

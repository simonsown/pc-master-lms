-- ==========================================================
-- PC Master Builder — Products Table with Full Tech Specs
-- Migration: 20260610_products_full_specs
-- ==========================================================

-- 1. ENUMS
CREATE TYPE component_category AS ENUM (
  'CPU', 'GPU', 'MAINBOARD', 'RAM', 'PSU', 'CASE', 'COOLER', 'SSD', 'HDD'
);

CREATE TYPE socket_type AS ENUM (
  'LGA1700', 'LGA1851', 'LGA1200', 'LGA1151', 'AM5', 'AM4', 'sTR5', 'sTRX4'
);

CREATE TYPE form_factor_type AS ENUM (
  'ATX', 'mATX', 'ITX', 'eATX', 'Mini-ITX', 'XL-ATX'
);

CREATE TYPE ddr_type AS ENUM ('DDR4', 'DDR5');

CREATE TYPE psu_efficiency AS ENUM (
  '80plus_white', '80plus_bronze', '80plus_silver',
  '80plus_gold', '80plus_platinum', '80plus_titanium'
);

CREATE TYPE psu_modular AS ENUM ('non_modular', 'semi_modular', 'full_modular');

CREATE TYPE cooler_type AS ENUM ('air', 'aio', 'custom_loop');

CREATE TYPE storage_interface AS ENUM (
  'm2_nvme', 'm2_sata', 'sata_ssd', 'sata_hdd'
);

CREATE TYPE pcie_gen AS ENUM ('3.0', '4.0', '5.0');

-- 2. DROP EXISTING products table if present
DROP TABLE IF EXISTS public.products CASCADE;

-- 3. MAIN PRODUCTS TABLE
CREATE TABLE public.products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category      component_category NOT NULL,
  brand         TEXT NOT NULL,
  model         TEXT NOT NULL,
  full_name     TEXT NOT NULL,           -- e.g. "Intel Core i5-13600K"
  release_year  SMALLINT,
  image_url     TEXT,                    -- real photo URL
  image_angles  JSONB DEFAULT '[]'::jsonb, -- ["top.jpg", "bottom.jpg", "side.jpg"]
  video_url     TEXT,                    -- 10s installation video
  price_vnd     BIGINT,                 -- base price in VND
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),

  -- CPU-specific
  cpu_socket      socket_type,
  cpu_tdp_watts   SMALLINT,
  cpu_cores       SMALLINT,
  cpu_threads     SMALLINT,
  cpu_base_ghz    NUMERIC(4,1),
  cpu_boost_ghz   NUMERIC(4,1),
  cpu_l3_cache_mb NUMERIC(4,1),
  cpu_has_igpu    BOOLEAN DEFAULT false,
  cpu_igpu_model  TEXT,
  cpu_ram_type    ddr_type,             -- what RAM the memory controller supports
  cpu_max_ram_mhz SMALLINT,
  cpu_generation  TEXT,                  -- "Raptor Lake", "Zen 4", etc.
  cpu_cinebench_r23_single INT,         -- benchmark score
  cpu_cinebench_r23_multi  INT,

  -- GPU-specific
  gpu_vram_gb         NUMERIC(3,1),
  gpu_tdp_watts       SMALLINT,
  gpu_pcie_gen        pcie_gen,
  gpu_length_mm       SMALLINT,          -- critical for case compatibility
  gpu_width_mm        SMALLINT,
  gpu_height_mm       SMALLINT,
  gpu_power_connectors JSONB DEFAULT '[]'::jsonb, -- [{"type":"8pin","qty":2}]
  gpu_benchmark_1080p INT,               -- relative performance score
  gpu_display_outputs JSONB DEFAULT '[]'::jsonb, -- ["HDMI 2.1","DP 1.4a"]
  gpu_recommended_psu SMALLINT,          -- minimum PSU wattage recommended

  -- Mainboard-specific
  mb_socket           socket_type,
  mb_chipset          TEXT,
  mb_form_factor      form_factor_type,
  mb_ram_slots        SMALLINT,
  mb_max_ram_gb       SMALLINT,
  mb_ram_type         ddr_type,
  mb_max_ram_mhz      SMALLINT,
  mb_m2_slots         SMALLINT,
  mb_m2_pcie_gens     JSONB DEFAULT '[]'::jsonb, -- ["4.0","5.0"]
  mb_pcie_x16_slots   SMALLINT,
  mb_pcie_x16_gens    JSONB DEFAULT '[]'::jsonb,
  mb_sata_ports       SMALLINT,
  mb_has_wifi         BOOLEAN DEFAULT false,
  mb_wifi_version     TEXT,
  mb_usb_ports        JSONB DEFAULT '[]'::jsonb, -- [{"type":"USB 3.2 Gen2","qty":4}]
  mb_front_panel_headers JSONB DEFAULT '[]'::jsonb, -- [{type:"USB 3.0",pin:19}]

  -- PSU-specific
  psu_wattage         SMALLINT,
  psu_efficiency      psu_efficiency,
  psu_modular         psu_modular,
  psu_connectors      JSONB DEFAULT '[]'::jsonb, -- [{type:"PCIe 8-pin",qty:4},{type:"SATA",qty:8}]
  psu_has_12vhpwr     BOOLEAN DEFAULT false,
  psu_length_mm       SMALLINT,
  psu_fan_size_mm     SMALLINT,

  -- Case-specific
  case_supported_forms JSONB DEFAULT '[]'::jsonb, -- ["ATX","mATX","ITX"]
  case_max_gpu_length_mm  SMALLINT,
  case_max_cooler_height_mm SMALLINT,
  case_max_psu_length_mm  SMALLINT,
  case_drive_bays      JSONB DEFAULT '[]'::jsonb, -- [{type:"3.5",qty:2},{type:"2.5",qty:4}]
  case_fan_slots       JSONB DEFAULT '[]'::jsonb, -- [{size:120,qty:3,type:"intake"},{size:120,qty:1,type:"exhaust"}]
  case_supports_aio    JSONB DEFAULT '[]'::jsonb, -- [240,280,360]
  case_mesh_front      BOOLEAN DEFAULT false,
  case_has_cable_management BOOLEAN DEFAULT true,
  case_side_panel      TEXT,             -- "glass", "mesh", "solid", "acrylic"
  case_weight_kg       NUMERIC(4,1),

  -- Cooler-specific
  cooler_max_tdp_support SMALLINT,
  cooler_height_mm       SMALLINT,
  cooler_supported_sockets JSONB DEFAULT '[]'::jsonb, -- ["LGA1700","AM5"]
  cooler_type            cooler_type,
  cooler_aio_size_mm     SMALLINT,      -- 120/240/280/360 if AIO
  cooler_fan_rpm_max     SMALLINT,
  cooler_fan_noise_dba   NUMERIC(3,1),
  cooler_fan_qty         SMALLINT,
  cooler_has_rgb         BOOLEAN DEFAULT false,

  -- RAM-specific
  ram_ddr_type      ddr_type,
  ram_speed_mhz     SMALLINT,
  ram_cl_latency    SMALLINT,            -- CAS latency
  ram_capacity_gb   SMALLINT,
  ram_kit_count     SMALLINT DEFAULT 1,  -- 1/2/4 sticks in package
  ram_has_xmp       BOOLEAN DEFAULT false,
  ram_has_expo      BOOLEAN DEFAULT false,
  ram_voltage_v     NUMERIC(3,2),
  ram_height_mm     SMALLINT,           -- for cooler clearance

  -- SSD-specific
  ssd_interface      storage_interface,
  ssd_pcie_gen       pcie_gen,
  ssd_read_mbps      INT,
  ssd_write_mbps     INT,
  ssd_has_dram_cache BOOLEAN DEFAULT false,
  ssd_capacity_gb    INT,
  ssd_form_factor    TEXT,              -- "M.2 2280", "2.5 inch", "U.2"
  ssd_nand_type      TEXT,              -- "TLC", "QLC", "MLC", "SLC"
  ssd_tbw            INT,               -- Terabytes Written endurance
  ssd_max_seq_read   INT,
  ssd_max_seq_write  INT,
  ssd_max_rand_read  INT,
  ssd_max_rand_write INT,

  -- HDD-specific
  hdd_capacity_gb  INT,
  hdd_rpm          SMALLINT,             -- 5400/7200/10000
  hdd_cache_mb     SMALLINT,
  hdd_form_factor  TEXT,                 -- "3.5 inch", "2.5 inch"
  hdd_read_mbps    INT,
  hdd_write_mbps   INT,

  CONSTRAINT unique_product UNIQUE (category, brand, model)
);

-- 4. INDEXES
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_socket ON public.products(cpu_socket);
CREATE INDEX idx_products_mb_socket ON public.products(mb_socket);
CREATE INDEX idx_products_form_factor ON public.products(mb_form_factor);
CREATE INDEX idx_products_ram_type ON public.products(ram_ddr_type);
CREATE INDEX idx_products_case_forms ON public.products USING gin(case_supported_forms);

-- 5. RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Products are insertable by admin only"
  ON public.products FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

CREATE POLICY "Products are updatable by admin only"
  ON public.products FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 6. TRIGGER: auto-update updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_products_updated_at();

-- 7. COMPATIBILITY CHECK FUNCTION
-- Returns compatibility issues between components in a build
CREATE OR REPLACE FUNCTION check_build_compatibility(
  p_cpu_id      UUID,
  p_mb_id       UUID,
  p_gpu_id      UUID DEFAULT NULL,
  p_ram_ids     UUID[] DEFAULT '{}',
  p_psu_id      UUID DEFAULT NULL,
  p_case_id     UUID DEFAULT NULL,
  p_cooler_id   UUID DEFAULT NULL,
  p_ssd_ids     UUID[] DEFAULT '{}'
)
RETURNS TABLE(
  severity   TEXT,
  check_type TEXT,
  message    TEXT,
  fix        TEXT
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  cpu      RECORD;
  mb       RECORD;
  gpu      RECORD;
  psu      RECORD;
  case_rec RECORD;
  cooler   RECORD;
  total_tdp INT := 0;
  total_components INT;
  gpu_length INT;
  cooler_height INT;
  wattage_available INT;
BEGIN
  -- Fetch CPU
  SELECT * INTO cpu FROM products WHERE id = p_cpu_id AND category = 'CPU';
  IF NOT FOUND THEN RETURN; END IF;

  -- Fetch Mainboard
  SELECT * INTO mb FROM products WHERE id = p_mb_id AND category = 'MAINBOARD';
  IF NOT FOUND THEN RETURN; END IF;

  -- 1. Socket check
  IF cpu.cpu_socket IS DISTINCT FROM mb.mb_socket THEN
    RETURN QUERY SELECT
      'error'::TEXT,
      'socket_mismatch'::TEXT,
      format('CPU %s (socket %s) không tương thích với Mainboard %s (socket %s)',
             cpu.full_name, cpu.cpu_socket, mb.full_name, mb.mb_socket),
      format('Chọn Mainboard socket %s hoặc CPU socket %s', cpu.cpu_socket, mb.mb_socket);
  END IF;

  -- 2. RAM type check
  IF cpu.cpu_ram_type IS DISTINCT FROM mb.mb_ram_type THEN
    RETURN QUERY SELECT
      'error'::TEXT,
      'ram_type_mismatch'::TEXT,
      format('CPU hỗ trợ %s nhưng Mainboard chỉ hỗ trợ %s',
             cpu.cpu_ram_type, mb.mb_ram_type),
      format('Chọn CPU %s hoặc Mainboard %s phù hợp', mb.mb_ram_type, cpu.cpu_ram_type);
  END IF;

  -- 3. GPU checks
  IF p_gpu_id IS NOT NULL THEN
    SELECT * INTO gpu FROM products WHERE id = p_gpu_id AND category = 'GPU';
    IF FOUND THEN
      total_tdp := total_tdp + COALESCE(gpu.gpu_tdp_watts, 0);
      gpu_length := gpu.gpu_length_mm;

      -- GPU length vs Case
      IF p_case_id IS NOT NULL THEN
        SELECT * INTO case_rec FROM products WHERE id = p_case_id AND category = 'CASE';
        IF FOUND AND gpu_length > case_rec.case_max_gpu_length_mm THEN
          RETURN QUERY SELECT 'error'::TEXT, 'gpu_too_long'::TEXT,
            format('GPU %s (dài %dmm) quá dài so với Case %s (hỗ trợ tối đa %dmm)',
                   gpu.full_name, gpu_length, case_rec.full_name, case_rec.case_max_gpu_length_mm),
            format('Chọn GPU ngắn hơn %dmm hoặc Case hỗ trợ GPU dài hơn', case_rec.case_max_gpu_length_mm);
        END IF;
      END IF;
    END IF;
  END IF;

  -- 4. PSU check
  total_tdp := total_tdp + COALESCE(cpu.cpu_tdp_watts, 0);

  IF p_psu_id IS NOT NULL THEN
    SELECT * INTO psu FROM products WHERE id = p_psu_id AND category = 'PSU';
    IF FOUND THEN
      wattage_available := psu.psu_wattage * 0.8;
      IF total_tdp > wattage_available THEN
        RETURN QUERY SELECT 'error'::TEXT, 'psu_insufficient'::TEXT,
          format('Tổng TDP ước tính %dW vượt quá 80%% công suất PSU (%dW) — có thể gây tắt máy khi tải nặng',
                 total_tdp, psu.psu_wattage),
          format('Nâng PSU lên ít nhất %dW hoặc giảm TDP build', (total_tdp * 1.25)::INT);
      END IF;
    END IF;
  END IF;

  -- 5. Cooler check
  IF p_cooler_id IS NOT NULL THEN
    SELECT * INTO cooler FROM products WHERE id = p_cooler_id AND category = 'COOLER';
    IF FOUND THEN
      cooler_height := cooler.cooler_height_mm;

      IF cpu.cpu_tdp_watts > cooler.cooler_max_tdp_support * 0.9 THEN
        RETURN QUERY SELECT 'warning'::TEXT, 'cooler_insufficient'::TEXT,
          format('CPU TDP %dW gần đạt giới hạn tản nhiệt của Cooler %s (%dW)',
                 cpu.cpu_tdp_watts, cooler.full_name, cooler.cooler_max_tdp_support),
          format('Cân nhắc nâng cooler lên AIO hoặc cooler khí hiệu năng cao hơn');
      END IF;

      -- Cooler height vs Case
      IF p_case_id IS NOT NULL AND case_rec.id IS NOT NULL THEN
        IF cooler_height > case_rec.case_max_cooler_height_mm THEN
          RETURN QUERY SELECT 'error'::TEXT, 'cooler_too_tall'::TEXT,
            format('Cooler %s (cao %dmm) quá cao cho Case %s (hỗ trợ tối đa %dmm)',
                   cooler.full_name, cooler_height, case_rec.full_name, case_rec.case_max_cooler_height_mm),
            format('Chọn cooler thấp hơn %dmm hoặc Case rộng hơn', case_rec.case_max_cooler_height_mm);
        END IF;
      END IF;

      -- Cooler socket vs CPU socket
      IF NOT cooler.cooler_supported_sockets @> to_jsonb(cpu.cpu_socket::TEXT) THEN
        RETURN QUERY SELECT 'error'::TEXT, 'cooler_socket_mismatch'::TEXT,
          format('Cooler %s không hỗ trợ socket %s', cooler.full_name, cpu.cpu_socket),
          format('Chọn cooler hỗ trợ socket %s', cpu.cpu_socket);
      END IF;
    END IF;
  END IF;

  -- 6. Mainboard form factor vs Case
  IF p_case_id IS NOT NULL AND case_rec.id IS NOT NULL THEN
    IF NOT case_rec.case_supported_forms @> to_jsonb(mb.mb_form_factor::TEXT) THEN
      RETURN QUERY SELECT 'error'::TEXT, 'form_factor_mismatch'::TEXT,
        format('Mainboard %s (form factor %s) không vừa Case %s (hỗ trợ %s)',
               mb.full_name, mb.mb_form_factor, case_rec.full_name,
               (SELECT string_agg(elem::TEXT, ', ') FROM jsonb_array_elements_text(case_rec.case_supported_forms) elem)),
        format('Chọn Mainboard %s hoặc Case hỗ trợ %s', case_rec.case_supported_forms, mb.mb_form_factor);
    END IF;
  END IF;

  -- 7. No iGPU + No GPU warning
  IF NOT cpu.cpu_has_igpu AND p_gpu_id IS NULL THEN
    RETURN QUERY SELECT 'warning'::TEXT, 'no_display_output'::TEXT,
      'CPU không có iGPU và chưa chọn GPU rời — sẽ không có hình ảnh đầu ra',
      'Thêm GPU rời hoặc chọn CPU có iGPU (dòng Intel non-F)';
  END IF;

  -- 8. RAM check
  IF array_length(p_ram_ids, 1) > 0 THEN
    IF array_length(p_ram_ids, 1) > mb.mb_ram_slots THEN
      RETURN QUERY SELECT 'error'::TEXT, 'too_many_ram'::TEXT,
        format('Số thanh RAM (%d) vượt quá số slot của Mainboard (%d)',
               array_length(p_ram_ids, 1), mb.mb_ram_slots),
        format('Giảm số thanh RAM xuống còn %d hoặc nâng Mainboard', mb.mb_ram_slots);
    END IF;
  END IF;

  -- 9. SSD M.2 check
  IF array_length(p_ssd_ids, 1) > 0 THEN
    total_components := (
      SELECT COUNT(*) FROM products WHERE id = ANY(p_ssd_ids)
    );
    IF total_components > mb.mb_m2_slots THEN
      RETURN QUERY SELECT 'warning'::TEXT, 'not_enough_m2_slots'::TEXT,
        format('Số lượng SSD M.2 (%d) vượt quá số slot M.2 của Mainboard (%d)',
               total_components, mb.mb_m2_slots),
        format('Giảm SSD M.2 hoặc dùng SSD SATA cho các ổ còn lại');
    END IF;
  END IF;
END;
$$;

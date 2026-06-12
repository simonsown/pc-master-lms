-- Migration: Components + Collaboration Tables for PC Master Builder
-- Adds component_creator role, components table, pc_builds table, RLS policies

-- ══════════════════════════════════
-- ALTER EXISTING PROFILES ROLE CHECK
-- ══════════════════════════════════
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'teacher', 'admin', 'parent', 'component_creator'));

-- ══════════════════════════════════
-- TABLE: components (linh kiện)
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Thông tin cơ bản
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cpu','gpu','ram','motherboard','psu','case','cooler','ssd','hdd')),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,

  -- Render data (2D/3D)
  dimensions JSONB NOT NULL DEFAULT '{}',
  colors JSONB NOT NULL DEFAULT '{}',
  connectors JSONB DEFAULT '[]',

  -- Technical specs
  tech_specs JSONB NOT NULL DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  is_published BOOLEAN DEFAULT false,

  -- Ownership + audit
  created_by UUID REFERENCES profiles(id),
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Lock mechanism (chống conflict)
  locked_by UUID REFERENCES profiles(id),
  locked_at TIMESTAMPTZ,
  lock_expires_at TIMESTAMPTZ
);

-- ══════════════════════════════════
-- TABLE: pc_builds (bản lắp ráp)
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS pc_builds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'My PC Build',
  owner_id UUID REFERENCES profiles(id) NOT NULL,

  -- Linh kiện được chọn (chỉ từ published components)
  selected_components JSONB DEFAULT '{}',

  -- Layout trên canvas 2D
  canvas_layout JSONB DEFAULT '{}',

  -- Trạng thái build
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress','complete','submitted')),
  compatibility_score INTEGER,
  error_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════
-- INDEXES
-- ══════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_components_type ON components(type);
CREATE INDEX IF NOT EXISTS idx_components_status ON components(status);
CREATE INDEX IF NOT EXISTS idx_components_created_by ON components(created_by);
CREATE INDEX IF NOT EXISTS idx_components_published ON components(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_pc_builds_owner ON pc_builds(owner_id);

-- ══════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE pc_builds ENABLE ROW LEVEL SECURITY;

-- Components: ai cũng đọc được published
CREATE POLICY "anyone_can_read_published_components"
  ON components FOR SELECT
  USING (is_published = true);

-- Components: creator/admin mới write
CREATE POLICY "creator_can_manage_own_components"
  ON components FOR ALL
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'component_creator')
    )
  );

-- PC Builds: chỉ owner mới write
CREATE POLICY "owner_can_manage_own_builds"
  ON pc_builds FOR ALL
  USING (owner_id = auth.uid());

-- PC Builds: ai cũng đọc được
CREATE POLICY "anyone_can_read_builds"
  ON pc_builds FOR SELECT
  USING (true);

-- ══════════════════════════════════
-- FUNCTION: Auto-release lock sau 5 phút
-- ══════════════════════════════════
CREATE OR REPLACE FUNCTION release_expired_locks()
RETURNS void AS $$
BEGIN
  UPDATE components
  SET locked_by = NULL, locked_at = NULL, lock_expires_at = NULL
  WHERE lock_expires_at < now() AND locked_by IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════
-- TRIGGER: tự động cập nhật updated_at
-- ══════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_pc_builds_updated_at
  BEFORE UPDATE ON pc_builds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

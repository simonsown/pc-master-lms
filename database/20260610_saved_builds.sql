-- Saved Builds table (Idea #2 + #7)
CREATE TABLE IF NOT EXISTS public.saved_builds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT 'Build mới',
  cpu_id          UUID REFERENCES public.products(id) ON DELETE SET NULL,
  gpu_id          UUID REFERENCES public.products(id) ON DELETE SET NULL,
  mainboard_id    UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ram_ids         UUID[] DEFAULT '{}',
  psu_id          UUID REFERENCES public.products(id) ON DELETE SET NULL,
  case_id         UUID REFERENCES public.products(id) ON DELETE SET NULL,
  cooler_id       UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ssd_ids         UUID[] DEFAULT '{}',
  compatibility_score INT DEFAULT 0,
  total_tdp       INT DEFAULT 0,
  total_price     BIGINT DEFAULT 0,
  is_public       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_saved_builds_user ON public.saved_builds(user_id);
CREATE INDEX idx_saved_builds_public ON public.saved_builds(is_public);

ALTER TABLE public.saved_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own builds"
  ON public.saved_builds FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own builds"
  ON public.saved_builds FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own builds"
  ON public.saved_builds FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own builds"
  ON public.saved_builds FOR DELETE USING (auth.uid() = user_id);

-- Build Scenarios table (Idea #7)
CREATE TABLE IF NOT EXISTS public.build_scenarios (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  name_vn             TEXT NOT NULL,
  description         TEXT NOT NULL,
  description_vn      TEXT NOT NULL,
  icon                TEXT DEFAULT '🖥️',
  difficulty          TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard','expert')),
  budget_min          BIGINT DEFAULT 0,
  budget_max          BIGINT DEFAULT 999999999,
  requirements        JSONB DEFAULT '{}'::jsonb,
  weight_components   JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.build_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scenarios viewable by all" ON public.build_scenarios FOR SELECT USING (true);

-- Scenario scoring table
CREATE TABLE IF NOT EXISTS public.build_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id        UUID REFERENCES public.saved_builds(id) ON DELETE CASCADE,
  scenario_id     UUID REFERENCES public.build_scenarios(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score           INT NOT NULL,
  rank            INT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(build_id, scenario_id)
);

ALTER TABLE public.build_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scores viewable by all" ON public.build_scores FOR SELECT USING (true);
CREATE POLICY "Users can insert own scores" ON public.build_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cable Management scores (Idea #3)
CREATE TABLE IF NOT EXISTS public.cable_management_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score           INT NOT NULL,
  time_seconds    INT,
  cables_used     INT,
  difficulty      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cable_management_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cable scores viewable by all" ON public.cable_management_scores FOR SELECT USING (true);
CREATE POLICY "Users can insert own cable scores" ON public.cable_management_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- OS Installation progress (Idea #4)
CREATE TABLE IF NOT EXISTS public.os_installation_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  step            INT DEFAULT 0,
  completed       BOOLEAN DEFAULT false,
  time_seconds    INT,
  errors_count    INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.os_installation_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "OS progress viewable by owner" ON public.os_installation_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own OS progress" ON public.os_installation_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own OS progress" ON public.os_installation_progress FOR UPDATE USING (auth.uid() = user_id);

-- PC Diagnosis scenarios (Idea #6)
CREATE TABLE IF NOT EXISTS public.diagnosis_scenarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  title_vn        TEXT NOT NULL,
  description     TEXT NOT NULL,
  description_vn  TEXT NOT NULL,
  symptoms        TEXT[] DEFAULT '{}',
  symptoms_vn     TEXT[] DEFAULT '{}',
  correct_answer  TEXT NOT NULL,
  hints           TEXT[] DEFAULT '{}',
  hints_vn        TEXT[] DEFAULT '{}',
  difficulty      TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  icon            TEXT DEFAULT '🔧',
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.diagnosis_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Diagnosis viewable by all" ON public.diagnosis_scenarios FOR SELECT USING (true);

-- Thermal simulation data (Idea #5)
CREATE TABLE IF NOT EXISTS public.thermal_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_type  TEXT NOT NULL,
  max_temp_c      INT NOT NULL,
  idle_temp_c     INT NOT NULL,
  load_temp_c     INT NOT NULL,
  color_hex       TEXT DEFAULT '#ff4444',
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.thermal_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Thermal profiles viewable by all" ON public.thermal_profiles FOR SELECT USING (true);

INSERT INTO public.thermal_profiles (component_type, max_temp_c, idle_temp_c, load_temp_c, color_hex) VALUES
('CPU', 100, 40, 85, '#ff4444'),
('GPU', 85, 35, 78, '#ff6600'),
('RAM', 85, 30, 55, '#ffaa00'),
('SSD', 70, 28, 55, '#ffcc00'),
('PSU', 80, 30, 65, '#ff8800'),
('CASE', 50, 25, 40, '#44aaff');

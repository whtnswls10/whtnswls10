-- =========================================================
-- Supabase Schema: circle_activities
-- 원의 방정식 표현 탐구 활동 데이터베이스 테이블 및 RLS 정책
-- =========================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.circle_activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT,
  difficulty TEXT DEFAULT '발전',
  equation_type TEXT,
  equation_formula TEXT NOT NULL,
  target_grade TEXT DEFAULT '고등학교 1학년',
  competency TEXT[] DEFAULT ARRAY['문제해결'],
  keywords TEXT[] DEFAULT ARRAY['원의방정식'],
  concept_summary TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  evaluation_criteria TEXT,
  real_world_application TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.circle_activities ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for public access (allow read and insert for demonstration/educational hub)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.circle_activities;
DROP POLICY IF EXISTS "Allow public insert and update" ON public.circle_activities;

-- Public read access
CREATE POLICY "Allow public read access"
  ON public.circle_activities
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public insert/upsert access
CREATE POLICY "Allow public insert and update"
  ON public.circle_activities
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Enable Realtime (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_activities;

COMMENT ON TABLE public.circle_activities IS '고등학교 공통수학1 원의 방정식 표현 탐구 활동 데이터베이스';

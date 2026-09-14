-- =========================================================
-- Supabase Schema: circle_activities (원의 방정식 활동 DB)
-- Supabase 대시보드 SQL Editor에 전체 복사 후 [Run] 실행
-- =========================================================

-- 1. 원의 방정식 탐구 활동 테이블 생성
CREATE TABLE IF NOT EXISTS public.circle_activities (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "category_name" TEXT,
  "difficulty" TEXT DEFAULT '발전',
  "equation_type" TEXT,
  "equation_formula" TEXT NOT NULL,
  "target_grade" TEXT DEFAULT '고등학교 1학년',
  "competency" TEXT[] DEFAULT ARRAY['문제해결']::TEXT[],
  "keywords" TEXT[] DEFAULT ARRAY['원의방정식']::TEXT[],
  "concept_summary" TEXT,
  "parameters" JSONB DEFAULT '{}'::JSONB,
  "steps" JSONB DEFAULT '[]'::JSONB,
  "evaluation_criteria" TEXT,
  "real_world_application" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row Level Security(행 단위 보안) 활성화
ALTER TABLE public.circle_activities ENABLE ROW LEVEL SECURITY;

-- 3. 기존 정책이 있을 경우 삭제 (중복 방지)
DROP POLICY IF EXISTS "circle_activities_select_policy" ON public.circle_activities;
DROP POLICY IF EXISTS "circle_activities_insert_policy" ON public.circle_activities;
DROP POLICY IF EXISTS "circle_activities_update_policy" ON public.circle_activities;

-- 4. 읽기 정책 (누구나 활동 목록 조회 가능)
CREATE POLICY "circle_activities_select_policy"
  ON public.circle_activities
  FOR SELECT
  TO public
  USING (true);

-- 5. 쓰기 정책 (누구나 새 활동 등록 및 Upsert 가능)
CREATE POLICY "circle_activities_insert_policy"
  ON public.circle_activities
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 6. 수정 정책 (Upsert 덮어쓰기 지원)
CREATE POLICY "circle_activities_update_policy"
  ON public.circle_activities
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

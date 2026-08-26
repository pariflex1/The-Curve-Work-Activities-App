-- ==============================================================================
-- REAL ESTATE PROJECT WORK & PAYMENT MANAGEMENT SYSTEM
-- Target Supabase Project: pxofmqorcpbnwapnzjkv (https://pxofmqorcpbnwapnzjkv.supabase.co)
-- Master Consolidated Migration: Tables, Indexes, Seeds, Functions, RLS, Triggers & Storage
-- ==============================================================================

-- 1. Create Core Tables
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('admin','employee','contractor','owner')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','on_hold','completed','archived')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, profile_id)
);

CREATE TABLE IF NOT EXISTS project_contractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  company_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, profile_id)
);

CREATE TABLE IF NOT EXISTS project_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, profile_id)
);

CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid REFERENCES blocks(id) ON DELETE CASCADE NOT NULL,
  unit_number text NOT NULL,
  floor text,
  unit_type text,
  area numeric,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  category text,
  description text,
  default_unit text,
  sort_order int DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS unit_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES units(id) ON DELETE CASCADE NOT NULL,
  activity_master_id uuid REFERENCES activity_master(id) NOT NULL,
  contractor_id uuid REFERENCES project_contractors(id),
  estimated_cost numeric DEFAULT 0,
  progress_percentage numeric NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  start_date date,
  expected_completion_date date,
  actual_completion_date date,
  remarks text,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_unit_activities_unit_id ON unit_activities (unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_activities_contractor_id ON unit_activities (contractor_id);

CREATE TABLE IF NOT EXISTS progress_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_activity_id uuid REFERENCES unit_activities(id) ON DELETE CASCADE NOT NULL,
  contractor_id uuid REFERENCES project_contractors(id) NOT NULL,
  previous_progress numeric NOT NULL,
  new_progress numeric NOT NULL,
  work_completed_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_progress_reports_unit_activity_id ON progress_reports (unit_activity_id);

CREATE TABLE IF NOT EXISTS progress_report_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_report_id uuid REFERENCES progress_reports(id) ON DELETE CASCADE NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_activity_id uuid REFERENCES unit_activities(id),
  project_id uuid REFERENCES projects(id) NOT NULL,
  amount numeric NOT NULL,
  payment_type text,
  paid_to text,
  payment_date date NOT NULL DEFAULT current_date,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  meta_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Seed Standard Activities
INSERT INTO activity_master (name, code, category, description, sort_order) VALUES
  ('Foundation', 'FND', 'Structural', 'Foundation and footing work', 1),
  ('RCC', 'RCC', 'Structural', 'Reinforced cement concrete work', 2),
  ('Brick Work', 'BRK', 'Masonry', 'Brick wall construction', 3),
  ('Plaster', 'PLT', 'Finishing', 'Plastering of walls and ceilings', 4),
  ('Electrical', 'ELC', 'MEP', 'Electrical wiring and fixtures', 5),
  ('Plumbing', 'PLB', 'MEP', 'Plumbing and sanitary work', 6),
  ('Flooring', 'FLR', 'Finishing', 'Floor tile and marble work', 7),
  ('Painting', 'PNT', 'Finishing', 'Interior and exterior painting', 8)
ON CONFLICT (code) DO NOTHING;

-- 3. Security Definer Helper Functions
CREATE OR REPLACE FUNCTION public.get_my_profile_id() RETURNS uuid AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS text AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_assigned_to_project(p_project_id uuid) RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM project_employees WHERE project_id = p_project_id AND profile_id = public.get_my_profile_id()
    UNION ALL
    SELECT 1 FROM project_contractors WHERE project_id = p_project_id AND profile_id = public.get_my_profile_id()
    UNION ALL
    SELECT 1 FROM project_owners WHERE project_id = p_project_id AND profile_id = public.get_my_profile_id()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. Enable Row-Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_report_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (
  public.get_my_role() = 'admin' OR user_id = auth.uid()
);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin' OR user_id = auth.uid()
);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (
  public.get_my_role() = 'admin'
);

CREATE POLICY "projects_select" ON projects FOR SELECT USING (
  public.get_my_role() = 'admin' OR public.is_assigned_to_project(id)
);
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
);
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (
  public.get_my_role() = 'admin'
);

CREATE POLICY "project_employees_select" ON project_employees FOR SELECT USING (
  public.get_my_role() = 'admin' OR public.is_assigned_to_project(project_id)
);
CREATE POLICY "project_employees_insert" ON project_employees FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
);
CREATE POLICY "project_employees_update" ON project_employees FOR UPDATE USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "project_employees_delete" ON project_employees FOR DELETE USING (
  public.get_my_role() = 'admin'
);

CREATE POLICY "project_contractors_select" ON project_contractors FOR SELECT USING (
  public.get_my_role() = 'admin' OR public.is_assigned_to_project(project_id)
);
CREATE POLICY "project_contractors_insert" ON project_contractors FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
);
CREATE POLICY "project_contractors_update" ON project_contractors FOR UPDATE USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "project_contractors_delete" ON project_contractors FOR DELETE USING (
  public.get_my_role() = 'admin'
);

CREATE POLICY "project_owners_select" ON project_owners FOR SELECT USING (
  public.get_my_role() = 'admin' OR public.is_assigned_to_project(project_id)
);
CREATE POLICY "project_owners_insert" ON project_owners FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
);
CREATE POLICY "project_owners_update" ON project_owners FOR UPDATE USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "project_owners_delete" ON project_owners FOR DELETE USING (
  public.get_my_role() = 'admin'
);

CREATE POLICY "blocks_select" ON blocks FOR SELECT USING (
  public.get_my_role() = 'admin' OR public.is_assigned_to_project(project_id)
);
CREATE POLICY "blocks_insert" ON blocks FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
);
CREATE POLICY "blocks_update" ON blocks FOR UPDATE USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "blocks_delete" ON blocks FOR DELETE USING (
  public.get_my_role() = 'admin'
);

CREATE POLICY "units_select" ON units FOR SELECT USING (
  public.get_my_role() = 'admin'
  OR public.is_assigned_to_project((SELECT project_id FROM blocks WHERE id = units.block_id))
);
CREATE POLICY "units_insert" ON units FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
);
CREATE POLICY "units_update" ON units FOR UPDATE USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "units_delete" ON units FOR DELETE USING (
  public.get_my_role() = 'admin'
);

CREATE POLICY "activity_master_select" ON activity_master FOR SELECT USING (true);
CREATE POLICY "activity_master_insert" ON activity_master FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
);
CREATE POLICY "activity_master_update" ON activity_master FOR UPDATE USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "activity_master_delete" ON activity_master FOR DELETE USING (
  public.get_my_role() = 'admin'
);

CREATE POLICY "unit_activities_select" ON unit_activities FOR SELECT USING (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() IN ('employee', 'owner')
    AND public.is_assigned_to_project(
      (SELECT b.project_id FROM units u JOIN blocks b ON b.id = u.block_id WHERE u.id = unit_activities.unit_id)
    )
  )
  OR (
    public.get_my_role() = 'contractor'
    AND contractor_id IN (SELECT pc.id FROM project_contractors pc WHERE pc.profile_id = public.get_my_profile_id())
  )
);
CREATE POLICY "unit_activities_insert" ON unit_activities FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
);
CREATE POLICY "unit_activities_update" ON unit_activities FOR UPDATE USING (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() = 'employee'
    AND public.is_assigned_to_project(
      (SELECT b.project_id FROM units u JOIN blocks b ON b.id = u.block_id WHERE u.id = unit_activities.unit_id)
    )
  )
);
CREATE POLICY "unit_activities_delete" ON unit_activities FOR DELETE USING (
  public.get_my_role() = 'admin'
);

CREATE POLICY "progress_reports_select" ON progress_reports FOR SELECT USING (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() = 'contractor'
    AND contractor_id IN (SELECT pc.id FROM project_contractors pc WHERE pc.profile_id = public.get_my_profile_id())
  )
  OR (
    public.get_my_role() IN ('employee', 'owner')
    AND public.is_assigned_to_project(
      (SELECT b.project_id FROM unit_activities ua JOIN units u ON u.id = ua.unit_id JOIN blocks b ON b.id = u.block_id WHERE ua.id = progress_reports.unit_activity_id)
    )
  )
);
CREATE POLICY "progress_reports_insert" ON progress_reports FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() = 'contractor'
    AND contractor_id IN (SELECT pc.id FROM project_contractors pc WHERE pc.profile_id = public.get_my_profile_id())
  )
);
CREATE POLICY "progress_reports_update" ON progress_reports FOR UPDATE USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "progress_reports_delete" ON progress_reports FOR DELETE USING (
  public.get_my_role() = 'admin'
);

CREATE POLICY "progress_report_photos_select" ON progress_report_photos FOR SELECT USING (
  public.get_my_role() = 'admin'
  OR EXISTS(
    SELECT 1 FROM progress_reports pr
    WHERE pr.id = progress_report_photos.progress_report_id
    AND (
      (public.get_my_role() = 'contractor' AND pr.contractor_id IN (SELECT pc.id FROM project_contractors pc WHERE pc.profile_id = public.get_my_profile_id()))
      OR (
        public.get_my_role() IN ('employee', 'owner')
        AND public.is_assigned_to_project(
          (SELECT b.project_id FROM unit_activities ua JOIN units u ON u.id = ua.unit_id JOIN blocks b ON b.id = u.block_id WHERE ua.id = pr.unit_activity_id)
        )
      )
    )
  )
);
CREATE POLICY "progress_report_photos_insert" ON progress_report_photos FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() = 'contractor'
    AND EXISTS(
      SELECT 1 FROM progress_reports pr
      WHERE pr.id = progress_report_photos.progress_report_id
      AND pr.contractor_id IN (SELECT pc.id FROM project_contractors pc WHERE pc.profile_id = public.get_my_profile_id())
    )
  )
);
CREATE POLICY "progress_report_photos_update" ON progress_report_photos FOR UPDATE USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "progress_report_photos_delete" ON progress_report_photos FOR DELETE USING (
  public.get_my_role() = 'admin'
);

CREATE POLICY "payments_select" ON payments FOR SELECT USING (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() IN ('employee', 'owner')
    AND public.is_assigned_to_project(project_id)
  )
);
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() = 'owner'
    AND public.is_assigned_to_project(project_id)
  )
);
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() = 'owner'
    AND public.is_assigned_to_project(project_id)
  )
);
CREATE POLICY "payments_delete" ON payments FOR DELETE USING (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() = 'owner'
    AND public.is_assigned_to_project(project_id)
  )
);

CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (
  public.get_my_role() = 'admin' OR actor_profile_id = public.get_my_profile_id()
);
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "audit_logs_update" ON audit_logs FOR UPDATE USING (false);
CREATE POLICY "audit_logs_delete" ON audit_logs FOR DELETE USING (false);

-- 6. Trigger to auto-create profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Storage Bucket & Policies for progress-photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access to progress photos' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Access to progress photos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'progress-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to upload progress photos' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload progress photos"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'progress-photos' AND auth.role() = 'authenticated');
  END IF;
END $$;

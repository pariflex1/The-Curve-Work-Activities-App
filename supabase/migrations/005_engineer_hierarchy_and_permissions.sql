-- ==============================================================================
-- 005_engineer_hierarchy_and_permissions.sql
-- Hierarchy & Scoping for Site Engineers / Supervisors
-- Default: 'full_project' (view and manage all blocks and units)
-- Optional: 'block_level' (assigned specific blocks) or 'unit_level' (assigned specific units)
-- Target Supabase Project: pxofmqorcpbnwapnzjkv
-- ==============================================================================

-- 1. Add access_level to project_employees
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_employees' AND column_name = 'access_level'
  ) THEN
    ALTER TABLE project_employees 
    ADD COLUMN access_level text NOT NULL DEFAULT 'full_project' 
    CHECK (access_level IN ('full_project', 'block_level', 'unit_level'));
  END IF;
END $$;

-- 2. Create project_employee_blocks table
CREATE TABLE IF NOT EXISTS project_employee_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_employee_id uuid REFERENCES project_employees(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  block_id uuid REFERENCES blocks(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, block_id)
);

CREATE INDEX IF NOT EXISTS idx_peb_profile ON project_employee_blocks(profile_id);
CREATE INDEX IF NOT EXISTS idx_peb_project ON project_employee_blocks(project_id);
CREATE INDEX IF NOT EXISTS idx_peb_block ON project_employee_blocks(block_id);

-- 3. Create project_employee_units table
CREATE TABLE IF NOT EXISTS project_employee_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_employee_id uuid REFERENCES project_employees(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id uuid REFERENCES units(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, unit_id)
);

CREATE INDEX IF NOT EXISTS idx_peu_profile ON project_employee_units(profile_id);
CREATE INDEX IF NOT EXISTS idx_peu_project ON project_employee_units(project_id);
CREATE INDEX IF NOT EXISTS idx_peu_unit ON project_employee_units(unit_id);

-- 4. Enable RLS
ALTER TABLE project_employee_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_employee_units ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "project_employee_blocks_select" ON project_employee_blocks;
CREATE POLICY "project_employee_blocks_select" ON project_employee_blocks FOR SELECT USING (
  public.get_my_role() = 'admin' OR profile_id = public.get_my_profile_id()
);

DROP POLICY IF EXISTS "project_employee_blocks_admin_all" ON project_employee_blocks;
CREATE POLICY "project_employee_blocks_admin_all" ON project_employee_blocks FOR ALL USING (
  public.get_my_role() = 'admin'
);

DROP POLICY IF EXISTS "project_employee_units_select" ON project_employee_units;
CREATE POLICY "project_employee_units_select" ON project_employee_units FOR SELECT USING (
  public.get_my_role() = 'admin' OR profile_id = public.get_my_profile_id()
);

DROP POLICY IF EXISTS "project_employee_units_admin_all" ON project_employee_units;
CREATE POLICY "project_employee_units_admin_all" ON project_employee_units FOR ALL USING (
  public.get_my_role() = 'admin'
);

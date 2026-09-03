-- ==============================================================================
-- 006_multi_tenant_and_organizations.sql
-- Multi-Tenant & Multi-Organization System Migration
-- Target Supabase Project: pxofmqorcpbnwapnzjkv
-- ==============================================================================

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

-- 3. Create designations table
CREATE TABLE IF NOT EXISTS designations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, title)
);

-- 4. Create user_organizations junction table (Staffing multiple organizations)
CREATE TABLE IF NOT EXISTS user_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  designation_id uuid REFERENCES designations(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin','employee','contractor','owner')),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, organization_id)
);

-- 5. Add organization & department/designation columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'active_organization_id') THEN
    ALTER TABLE profiles ADD COLUMN active_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'department_id') THEN
    ALTER TABLE profiles ADD COLUMN department_id uuid REFERENCES departments(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'designation_id') THEN
    ALTER TABLE profiles ADD COLUMN designation_id uuid REFERENCES designations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6. Add organization_id to projects, activity_master, audit_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'organization_id') THEN
    ALTER TABLE projects ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_master' AND column_name = 'organization_id') THEN
    ALTER TABLE activity_master ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'organization_id') THEN
    ALTER TABLE audit_logs ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 7. Seed Default Organization & Data for Backward Compatibility
DO $$
DECLARE
  v_default_org_id uuid;
  v_dept_civil_id uuid;
  v_dept_mgmt_id uuid;
  v_desig_eng_id uuid;
  v_desig_mgr_id uuid;
  r_profile record;
  r_project record;
  r_activity record;
BEGIN
  -- Check if default org exists, else create
  SELECT id INTO v_default_org_id FROM organizations WHERE name = 'The Curve Real Estate Ltd' LIMIT 1;

  IF v_default_org_id IS NULL THEN
    INSERT INTO organizations (name, code, status)
    VALUES ('The Curve Real Estate Ltd', 'CURVE', 'active')
    RETURNING id INTO v_default_org_id;
  END IF;

  -- Seed Departments
  SELECT id INTO v_dept_civil_id FROM departments WHERE organization_id = v_default_org_id AND name = 'Civil Engineering' LIMIT 1;
  IF v_dept_civil_id IS NULL THEN
    INSERT INTO departments (organization_id, name) VALUES (v_default_org_id, 'Civil Engineering') RETURNING id INTO v_dept_civil_id;
  END IF;

  SELECT id INTO v_dept_mgmt_id FROM departments WHERE organization_id = v_default_org_id AND name = 'Management' LIMIT 1;
  IF v_dept_mgmt_id IS NULL THEN
    INSERT INTO departments (organization_id, name) VALUES (v_default_org_id, 'Management') RETURNING id INTO v_dept_mgmt_id;
  END IF;

  -- Seed Designations
  SELECT id INTO v_desig_eng_id FROM designations WHERE organization_id = v_default_org_id AND title = 'Site Engineer' LIMIT 1;
  IF v_desig_eng_id IS NULL THEN
    INSERT INTO designations (organization_id, department_id, title) VALUES (v_default_org_id, v_dept_civil_id, 'Site Engineer') RETURNING id INTO v_desig_eng_id;
  END IF;

  SELECT id INTO v_desig_mgr_id FROM designations WHERE organization_id = v_default_org_id AND title = 'Project Manager' LIMIT 1;
  IF v_desig_mgr_id IS NULL THEN
    INSERT INTO designations (organization_id, department_id, title) VALUES (v_default_org_id, v_dept_mgmt_id, 'Project Manager') RETURNING id INTO v_desig_mgr_id;
  END IF;

  -- Update existing records without organization_id
  UPDATE projects SET organization_id = v_default_org_id WHERE organization_id IS NULL;
  UPDATE activity_master SET organization_id = v_default_org_id WHERE organization_id IS NULL;
  UPDATE audit_logs SET organization_id = v_default_org_id WHERE organization_id IS NULL;
  UPDATE profiles SET active_organization_id = v_default_org_id WHERE active_organization_id IS NULL;

  -- Ensure all existing profiles have an entry in user_organizations
  FOR r_profile IN SELECT id, role FROM profiles LOOP
    INSERT INTO user_organizations (profile_id, organization_id, role, is_default, department_id, designation_id)
    VALUES (
      r_profile.id,
      v_default_org_id,
      r_profile.role,
      true,
      v_dept_civil_id,
      v_desig_eng_id
    )
    ON CONFLICT (profile_id, organization_id) DO NOTHING;
  END LOOP;

END $$;

-- 8. Create Helper Functions for Multi-Tenant Context
CREATE OR REPLACE FUNCTION public.get_my_active_org_id() RETURNS uuid AS $$
  SELECT active_organization_id FROM public.profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 9. Enable RLS on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for Organizations & Departments
DROP POLICY IF EXISTS "organizations_select" ON organizations;
CREATE POLICY "organizations_select" ON organizations FOR SELECT USING (
  public.get_my_role() = 'admin' OR id IN (
    SELECT organization_id FROM user_organizations WHERE profile_id = public.get_my_profile_id()
  )
);

DROP POLICY IF EXISTS "organizations_admin_all" ON organizations;
CREATE POLICY "organizations_admin_all" ON organizations FOR ALL USING (
  public.get_my_role() = 'admin'
);

DROP POLICY IF EXISTS "departments_select" ON departments;
CREATE POLICY "departments_select" ON departments FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE profile_id = public.get_my_profile_id()
  )
);

DROP POLICY IF EXISTS "departments_admin_all" ON departments;
CREATE POLICY "departments_admin_all" ON departments FOR ALL USING (
  public.get_my_role() = 'admin'
);

DROP POLICY IF EXISTS "designations_select" ON designations;
CREATE POLICY "designations_select" ON designations FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE profile_id = public.get_my_profile_id()
  )
);

DROP POLICY IF EXISTS "designations_admin_all" ON designations;
CREATE POLICY "designations_admin_all" ON designations FOR ALL USING (
  public.get_my_role() = 'admin'
);

DROP POLICY IF EXISTS "user_organizations_select" ON user_organizations;
CREATE POLICY "user_organizations_select" ON user_organizations FOR SELECT USING (
  public.get_my_role() = 'admin' OR profile_id = public.get_my_profile_id()
);

DROP POLICY IF EXISTS "user_organizations_admin_all" ON user_organizations;
CREATE POLICY "user_organizations_admin_all" ON user_organizations FOR ALL USING (
  public.get_my_role() = 'admin'
);

-- ==============================================================================
-- 004_fix_engineer_rls_policies.sql
-- Allow Site Engineers (role = 'employee') to insert, update, and delete unit_activities
-- on projects they are assigned to, and create custom activity master records.
-- Target Supabase Project: pxofmqorcpbnwapnzjkv
-- ==============================================================================

-- 1. ACTIVITY_MASTER: Allow employees to insert custom activities
DROP POLICY IF EXISTS "activity_master_insert" ON activity_master;
CREATE POLICY "activity_master_insert" ON activity_master FOR INSERT WITH CHECK (
  public.get_my_role() IN ('admin', 'employee')
);

-- 2. UNIT_ACTIVITIES: Allow employees to INSERT, UPDATE, and DELETE activities on assigned projects
DROP POLICY IF EXISTS "unit_activities_insert" ON unit_activities;
CREATE POLICY "unit_activities_insert" ON unit_activities FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() = 'employee'
    AND public.is_assigned_to_project(
      (SELECT b.project_id FROM units u JOIN blocks b ON b.id = u.block_id WHERE u.id = unit_activities.unit_id)
    )
  )
);

DROP POLICY IF EXISTS "unit_activities_update" ON unit_activities;
CREATE POLICY "unit_activities_update" ON unit_activities FOR UPDATE USING (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() = 'employee'
    AND public.is_assigned_to_project(
      (SELECT b.project_id FROM units u JOIN blocks b ON b.id = u.block_id WHERE u.id = unit_activities.unit_id)
    )
  )
);

DROP POLICY IF EXISTS "unit_activities_delete" ON unit_activities;
CREATE POLICY "unit_activities_delete" ON unit_activities FOR DELETE USING (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() = 'employee'
    AND public.is_assigned_to_project(
      (SELECT b.project_id FROM units u JOIN blocks b ON b.id = u.block_id WHERE u.id = unit_activities.unit_id)
    )
  )
);

-- 3. PROGRESS_REPORTS: Allow engineers to insert inspection reports
DROP POLICY IF EXISTS "progress_reports_insert" ON progress_reports;
CREATE POLICY "progress_reports_insert" ON progress_reports FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin'
  OR (
    public.get_my_role() = 'contractor'
    AND contractor_id IN (SELECT pc.id FROM project_contractors pc WHERE pc.profile_id = public.get_my_profile_id())
  )
  OR (
    public.get_my_role() = 'employee'
    AND public.is_assigned_to_project(
      (SELECT b.project_id FROM unit_activities ua JOIN units u ON u.id = ua.unit_id JOIN blocks b ON b.id = u.block_id WHERE ua.id = progress_reports.unit_activity_id)
    )
  )
);

-- 4. PROGRESS_REPORT_PHOTOS: Allow engineers to insert inspection photos
DROP POLICY IF EXISTS "progress_report_photos_insert" ON progress_report_photos;
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
  OR (
    public.get_my_role() = 'employee'
    AND EXISTS(
      SELECT 1 FROM progress_reports pr
      WHERE pr.id = progress_report_photos.progress_report_id
      AND public.is_assigned_to_project(
        (SELECT b.project_id FROM unit_activities ua JOIN units u ON u.id = ua.unit_id JOIN blocks b ON b.id = u.block_id WHERE ua.id = pr.unit_activity_id)
      )
    )
  )
);

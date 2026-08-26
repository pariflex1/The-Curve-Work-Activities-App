-- Phase 2: Enable RLS on all tables and create policies

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_employees enable row level security;
alter table project_contractors enable row level security;
alter table project_owners enable row level security;
alter table blocks enable row level security;
alter table units enable row level security;
alter table activity_master enable row level security;
alter table unit_activities enable row level security;
alter table progress_reports enable row level security;
alter table progress_report_photos enable row level security;
alter table payments enable row level security;
alter table audit_logs enable row level security;

-- Helper function: get current user's profile id
create or replace function public.get_my_profile_id() returns uuid as $$
  select id from public.profiles where user_id = auth.uid()
$$ language sql security definer stable;

-- Helper function: get current user's role
create or replace function public.get_my_role() returns text as $$
  select role from public.profiles where user_id = auth.uid()
$$ language sql security definer stable;

-- Helper function: check if user is assigned to a project
create or replace function public.is_assigned_to_project(p_project_id uuid) returns boolean as $$
  select exists(
    select 1 from project_employees where project_id = p_project_id and profile_id = public.get_my_profile_id()
    union all
    select 1 from project_contractors where project_id = p_project_id and profile_id = public.get_my_profile_id()
    union all
    select 1 from project_owners where project_id = p_project_id and profile_id = public.get_my_profile_id()
  )
$$ language sql security definer stable;

-- ==========================================
-- PROFILES POLICIES
-- ==========================================
create policy "profiles_select_own" on profiles for select using (
  public.get_my_role() = 'admin' or user_id = auth.uid()
);
create policy "profiles_insert" on profiles for insert with check (
  public.get_my_role() = 'admin' or user_id = auth.uid()
);
create policy "profiles_update" on profiles for update using (
  public.get_my_role() = 'admin'
);
create policy "profiles_delete" on profiles for delete using (
  public.get_my_role() = 'admin'
);

-- ==========================================
-- PROJECTS POLICIES
-- ==========================================
create policy "projects_select" on projects for select using (
  public.get_my_role() = 'admin' or public.is_assigned_to_project(id)
);
create policy "projects_insert" on projects for insert with check (
  public.get_my_role() = 'admin'
);
create policy "projects_update" on projects for update using (
  public.get_my_role() = 'admin'
);
create policy "projects_delete" on projects for delete using (
  public.get_my_role() = 'admin'
);

-- ==========================================
-- PROJECT_EMPLOYEES POLICIES
-- ==========================================
create policy "project_employees_select" on project_employees for select using (
  public.get_my_role() = 'admin' or public.is_assigned_to_project(project_id)
);
create policy "project_employees_insert" on project_employees for insert with check (
  public.get_my_role() = 'admin'
);
create policy "project_employees_update" on project_employees for update using (
  public.get_my_role() = 'admin'
);
create policy "project_employees_delete" on project_employees for delete using (
  public.get_my_role() = 'admin'
);

-- ==========================================
-- PROJECT_CONTRACTORS POLICIES
-- ==========================================
create policy "project_contractors_select" on project_contractors for select using (
  public.get_my_role() = 'admin' or public.is_assigned_to_project(project_id)
);
create policy "project_contractors_insert" on project_contractors for insert with check (
  public.get_my_role() = 'admin'
);
create policy "project_contractors_update" on project_contractors for update using (
  public.get_my_role() = 'admin'
);
create policy "project_contractors_delete" on project_contractors for delete using (
  public.get_my_role() = 'admin'
);

-- ==========================================
-- PROJECT_OWNERS POLICIES
-- ==========================================
create policy "project_owners_select" on project_owners for select using (
  public.get_my_role() = 'admin' or public.is_assigned_to_project(project_id)
);
create policy "project_owners_insert" on project_owners for insert with check (
  public.get_my_role() = 'admin'
);
create policy "project_owners_update" on project_owners for update using (
  public.get_my_role() = 'admin'
);
create policy "project_owners_delete" on project_owners for delete using (
  public.get_my_role() = 'admin'
);

-- ==========================================
-- BLOCKS POLICIES
-- ==========================================
create policy "blocks_select" on blocks for select using (
  public.get_my_role() = 'admin' or public.is_assigned_to_project(project_id)
);
create policy "blocks_insert" on blocks for insert with check (
  public.get_my_role() = 'admin'
);
create policy "blocks_update" on blocks for update using (
  public.get_my_role() = 'admin'
);
create policy "blocks_delete" on blocks for delete using (
  public.get_my_role() = 'admin'
);

-- ==========================================
-- UNITS POLICIES
-- ==========================================
create policy "units_select" on units for select using (
  public.get_my_role() = 'admin'
  or public.is_assigned_to_project((select project_id from blocks where id = units.block_id))
);
create policy "units_insert" on units for insert with check (
  public.get_my_role() = 'admin'
);
create policy "units_update" on units for update using (
  public.get_my_role() = 'admin'
);
create policy "units_delete" on units for delete using (
  public.get_my_role() = 'admin'
);

-- ==========================================
-- ACTIVITY_MASTER POLICIES
-- ==========================================
create policy "activity_master_select" on activity_master for select using (true);
create policy "activity_master_insert" on activity_master for insert with check (
  public.get_my_role() = 'admin'
);
create policy "activity_master_update" on activity_master for update using (
  public.get_my_role() = 'admin'
);
create policy "activity_master_delete" on activity_master for delete using (
  public.get_my_role() = 'admin'
);

-- ==========================================
-- UNIT_ACTIVITIES POLICIES
-- ==========================================
create policy "unit_activities_select" on unit_activities for select using (
  public.get_my_role() = 'admin'
  or (
    public.get_my_role() in ('employee', 'owner')
    and public.is_assigned_to_project(
      (select b.project_id from units u join blocks b on b.id = u.block_id where u.id = unit_activities.unit_id)
    )
  )
  or (
    public.get_my_role() = 'contractor'
    and contractor_id in (select pc.id from project_contractors pc where pc.profile_id = public.get_my_profile_id())
  )
);
create policy "unit_activities_insert" on unit_activities for insert with check (
  public.get_my_role() = 'admin'
);
create policy "unit_activities_update" on unit_activities for update using (
  public.get_my_role() = 'admin'
  or (
    public.get_my_role() = 'employee'
    and public.is_assigned_to_project(
      (select b.project_id from units u join blocks b on b.id = u.block_id where u.id = unit_activities.unit_id)
    )
  )
);
create policy "unit_activities_delete" on unit_activities for delete using (
  public.get_my_role() = 'admin'
);

-- ==========================================
-- PROGRESS_REPORTS POLICIES (append-only)
-- ==========================================
create policy "progress_reports_select" on progress_reports for select using (
  public.get_my_role() = 'admin'
  or (
    public.get_my_role() = 'contractor'
    and contractor_id in (select pc.id from project_contractors pc where pc.profile_id = public.get_my_profile_id())
  )
  or (
    public.get_my_role() in ('employee', 'owner')
    and public.is_assigned_to_project(
      (select b.project_id from unit_activities ua join units u on u.id = ua.unit_id join blocks b on b.id = u.block_id where ua.id = progress_reports.unit_activity_id)
    )
  )
);
create policy "progress_reports_insert" on progress_reports for insert with check (
  public.get_my_role() = 'admin'
  or (
    public.get_my_role() = 'contractor'
    and contractor_id in (select pc.id from project_contractors pc where pc.profile_id = public.get_my_profile_id())
  )
);
create policy "progress_reports_update" on progress_reports for update using (
  public.get_my_role() = 'admin'
);
create policy "progress_reports_delete" on progress_reports for delete using (
  public.get_my_role() = 'admin'
);

-- ==========================================
-- PROGRESS_REPORT_PHOTOS POLICIES
-- ==========================================
create policy "progress_report_photos_select" on progress_report_photos for select using (
  public.get_my_role() = 'admin'
  or exists(
    select 1 from progress_reports pr
    where pr.id = progress_report_photos.progress_report_id
    and (
      (public.get_my_role() = 'contractor' and pr.contractor_id in (select pc.id from project_contractors pc where pc.profile_id = public.get_my_profile_id()))
      or (
        public.get_my_role() in ('employee', 'owner')
        and public.is_assigned_to_project(
          (select b.project_id from unit_activities ua join units u on u.id = ua.unit_id join blocks b on b.id = u.block_id where ua.id = pr.unit_activity_id)
        )
      )
    )
  )
);
create policy "progress_report_photos_insert" on progress_report_photos for insert with check (
  public.get_my_role() = 'admin'
  or (
    public.get_my_role() = 'contractor'
    and exists(
      select 1 from progress_reports pr
      where pr.id = progress_report_photos.progress_report_id
      and pr.contractor_id in (select pc.id from project_contractors pc where pc.profile_id = public.get_my_profile_id())
    )
  )
);
create policy "progress_report_photos_update" on progress_report_photos for update using (
  public.get_my_role() = 'admin'
);
create policy "progress_report_photos_delete" on progress_report_photos for delete using (
  public.get_my_role() = 'admin'
);

-- ==========================================
-- PAYMENTS POLICIES
-- ==========================================
create policy "payments_select" on payments for select using (
  public.get_my_role() = 'admin'
  or (
    public.get_my_role() in ('employee', 'owner')
    and public.is_assigned_to_project(project_id)
  )
);
create policy "payments_insert" on payments for insert with check (
  public.get_my_role() = 'admin'
  or (
    public.get_my_role() = 'owner'
    and public.is_assigned_to_project(project_id)
  )
);
create policy "payments_update" on payments for update using (
  public.get_my_role() = 'admin'
  or (
    public.get_my_role() = 'owner'
    and public.is_assigned_to_project(project_id)
  )
);
create policy "payments_delete" on payments for delete using (
  public.get_my_role() = 'admin'
  or (
    public.get_my_role() = 'owner'
    and public.is_assigned_to_project(project_id)
  )
);

-- ==========================================
-- AUDIT_LOGS POLICIES
-- ==========================================
create policy "audit_logs_select" on audit_logs for select using (
  public.get_my_role() = 'admin' or actor_profile_id = public.get_my_profile_id()
);
create policy "audit_logs_insert" on audit_logs for insert with check (true);
create policy "audit_logs_update" on audit_logs for update using (false);
create policy "audit_logs_delete" on audit_logs for delete using (false);

-- Phase 1: Database Schema & Migrations
-- Create all core tables for Real Estate Work & Payment System

-- 1. profiles
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  full_name text not null,
  phone text,
  role text not null check (role in ('admin','employee','contractor','owner')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  status text not null default 'active' check (status in ('active','on_hold','completed','archived')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. project_employees
create table project_employees (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  profile_id uuid references profiles(id) not null,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

-- 4. project_contractors
create table project_contractors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  profile_id uuid references profiles(id) not null,
  company_name text not null,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

-- 5. project_owners
create table project_owners (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  profile_id uuid references profiles(id) not null,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

-- 6. blocks
create table blocks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. units
create table units (
  id uuid primary key default gen_random_uuid(),
  block_id uuid references blocks(id) on delete cascade not null,
  unit_number text not null,
  floor text,
  unit_type text,
  area numeric,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. activity_master
create table activity_master (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  category text,
  description text,
  default_unit text,
  sort_order int default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. unit_activities (the key table)
create table unit_activities (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id) on delete cascade not null,
  activity_master_id uuid references activity_master(id) not null,
  contractor_id uuid references project_contractors(id),
  estimated_cost numeric default 0,
  progress_percentage numeric not null default 0 check (progress_percentage between 0 and 100),
  status text not null default 'pending' check (status in ('pending','in_progress','completed')),
  start_date date,
  expected_completion_date date,
  actual_completion_date date,
  remarks text,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_unit_activities_unit_id on unit_activities (unit_id);
create index idx_unit_activities_contractor_id on unit_activities (contractor_id);

-- 10. progress_reports (append-only)
create table progress_reports (
  id uuid primary key default gen_random_uuid(),
  unit_activity_id uuid references unit_activities(id) on delete cascade not null,
  contractor_id uuid references project_contractors(id) not null,
  previous_progress numeric not null,
  new_progress numeric not null,
  work_completed_note text,
  created_at timestamptz not null default now()
);
create index idx_progress_reports_unit_activity_id on progress_reports (unit_activity_id);

-- 11. progress_report_photos
create table progress_report_photos (
  id uuid primary key default gen_random_uuid(),
  progress_report_id uuid references progress_reports(id) on delete cascade not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- 12. payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  unit_activity_id uuid references unit_activities(id),
  project_id uuid references projects(id) not null,
  amount numeric not null,
  payment_type text,
  paid_to text,
  payment_date date not null default current_date,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 13. audit_logs
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  meta_json jsonb,
  created_at timestamptz not null default now()
);

# Execution Prompt Pack — Real Estate Work & Payment System

Companion to `PRD_Real_Estate_Work_Payment_System_v2.md`. Paste one phase's prompt into your AI coding agent at a time. Do not paste the next phase's prompt until the agent has reported its acceptance checklist and stop condition for the current one.

**MCP stack assumed:** Supabase MCP (database/auth/storage), GitHub MCP (repo/branches/PRs), Vercel MCP (deploy/env vars).

**Paste this once at the start of the session, before Phase 0:**

```
You are building the Real Estate Project Work & Payment Management System
described in PRD_Real_Estate_Work_Payment_System_v2.md. You have access to
Supabase MCP, GitHub MCP, and Vercel MCP tools — use them directly instead
of giving me manual instructions to run.

Operating rules for the whole project:
1. Work phase by phase. Only build what the current phase's prompt asks for.
   Do not create tables, RLS policies, routes, or screens belonging to a
   later phase, even if related.
2. Never overwrite historical rows (progress_reports, audit_logs) — these
   are append-only for the life of the app.
3. Never let one role's queries return another role's restricted data —
   enforce this with RLS via Supabase MCP, not just by hiding UI elements.
4. All schema changes go through versioned migrations via Supabase MCP —
   no ad-hoc schema edits.
5. All code changes go through a GitHub branch + PR via GitHub MCP, named
   phase-N-<short-description>. Do not push directly to main.
6. After finishing a phase's scope, self-run that phase's acceptance
   checklist, report pass/fail per line item, and output the phase's exact
   stop condition. Then stop and wait for my approval before continuing.
7. If anything is ambiguous — especially around money or permissions —
   stop and ask rather than guessing.
```

---

## Phase 0 — Environment & Project Skeleton

```
Phase 0: Environment & Project Skeleton.

Using GitHub MCP: create a new repo (or branch `phase-0-skeleton` if the
repo exists) for this project.

Scaffold: Next.js App Router + TypeScript + Tailwind + shadcn/ui.

Using Supabase MCP: connect this project to a Supabase project. Create the
server and browser Supabase clients per Next.js App Router conventions.
Store credentials as environment variables — do not hardcode them.

Add one route at `/` that calls `select now()` against Supabase and
displays the result, to prove connectivity end to end.

Using Vercel MCP: create a new Vercel project linked to the GitHub repo,
set the required environment variables, and deploy. Give me the live URL.

When done, run Phase 0's acceptance checklist from the PRD, report
pass/fail per item, and output the Phase 0 stop condition.
```

---

## Phase 1 — Database Schema & Migrations

```
Phase 1: Database Schema & Migrations.

Using Supabase MCP, create versioned migrations for every table below (see
also PRD Section 2). Apply them to the dev database and confirm they run
cleanly on a fresh database.

Reference schema (adapt exact SQL to Supabase MCP conventions, but do not
deviate from these tables/columns/relationships):

Use this supabase project to create database : https://supabase.com/dashboard/project/pxofmqorcpbnwapnzjkv
```

```sql
-- profiles
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  full_name text not null,
  phone text,
  role text not null check (role in ('admin','employee','contractor','owner')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  status text not null default 'active' check (status in ('active','on_hold','completed','archived')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- project_employees / project_contractors / project_owners
create table project_employees (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  profile_id uuid references profiles(id) not null,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

create table project_contractors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  profile_id uuid references profiles(id) not null,
  company_name text not null,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

create table project_owners (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  profile_id uuid references profiles(id) not null,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

-- blocks
create table blocks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- units
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

-- activity_master
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

-- unit_activities (the key table)
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
create index on unit_activities (unit_id);
create index on unit_activities (contractor_id);

-- progress_reports (append-only)
create table progress_reports (
  id uuid primary key default gen_random_uuid(),
  unit_activity_id uuid references unit_activities(id) on delete cascade not null,
  contractor_id uuid references project_contractors(id) not null,
  previous_progress numeric not null,
  new_progress numeric not null,
  work_completed_note text,
  created_at timestamptz not null default now()
);
create index on progress_reports (unit_activity_id);

-- progress_report_photos
create table progress_report_photos (
  id uuid primary key default gen_random_uuid(),
  progress_report_id uuid references progress_reports(id) on delete cascade not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- payments
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

-- audit_logs
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  meta_json jsonb,
  created_at timestamptz not null default now()
);
```

```
Also seed activity_master (dev/test only) with: Foundation, RCC, Brick
Work, Plaster, Electrical, Plumbing, Flooring, Painting.

Do not add RLS policies yet — that's Phase 2. Open a PR via GitHub MCP
named phase-1-schema-migrations.

When done, run Phase 1's acceptance checklist, report pass/fail per item,
and output the Phase 1 stop condition.
```

---

## Phase 2 — Authentication, Roles & Row-Level Security

```
Phase 2: Authentication, Roles & RLS.

Set up Supabase Auth (email/password login + forgot-password) in the
Next.js app. On signup/first login, create a matching `profiles` row.

Using Supabase MCP, enable RLS on every table from Phase 1 and write
policies enforcing exactly the permission matrix in PRD Appendix A. At minimum:

- profiles: a user can read their own row; admin can read/write all.
- projects/blocks/units: admin full CRUD; employee/contractor/owner can
  SELECT only rows belonging to projects they're assigned to via
  project_employees / project_contractors / project_owners.
- activity_master: admin CRUD; everyone else SELECT only.
- unit_activities: admin full CRUD; employee can SELECT + UPDATE
  contractor_id/assignment fields only for units in their assigned
  projects; contractor can SELECT only rows where contractor_id matches
  their own project_contractors row; owner SELECT only, assigned projects.
- progress_reports: contractor can INSERT rows only for unit_activities
  assigned to them, and SELECT only their own; employee/owner/admin can
  SELECT all for their scope; nobody can UPDATE or DELETE existing rows
  (append-only, enforce with a policy that blocks UPDATE/DELETE entirely
  except for admin).
- progress_report_photos: same scoping as their parent progress_report.
- payments: owner and admin can INSERT/UPDATE/DELETE for their scope;
  employee SELECT only; contractor no access at all.
- audit_logs: admin full read; each other role can read only rows where
  actor_profile_id = their own profile.

Add Next.js middleware/route guards that redirect unauthenticated users to
login, and redirect a role away from another role's route group
(/admin, /employee, /contractor, /owner).

Write and run negative tests: for each role, attempt at least one action
that should be denied, and confirm it's denied at the Supabase API level
(not just hidden in the UI). Include these as an automated test file in
the repo, not just manual notes.

Open a PR via GitHub MCP named phase-2-auth-rls.

When done, run Phase 2's acceptance checklist, report pass/fail per item
(including the negative-test results), and output the Phase 2 stop condition.
```

---

## Phase 3 — Core CRUD: Projects, Blocks, Units, Assignments

```
Phase 3: Core CRUD — Projects, Blocks, Units, Assignments.

Build Admin screens: Projects (CRUD), Blocks (CRUD, nested under a
project), Units (CRUD, nested under a block) — using Server
Components/Server Actions against Supabase (via Supabase MCP), respecting
the RLS from Phase 2.

Build Admin screens to assign/remove employees, contractors, and owners on
a project (writing to project_employees / project_contractors /
project_owners).

Build read-only "My Projects" views for Employee, Contractor, and Owner,
scoped to their assignments.

Do not build anything related to Activity Master, unit activities,
progress, or payments in this phase — those come later.

Open a PR via GitHub MCP named phase-3-core-crud.

When done, run Phase 3's acceptance checklist, report pass/fail per item,
and output the Phase 3 stop condition.
```

---

## Phase 4 — Activity Master & Unit Activity Repeater

```
Phase 4: Activity Master & Unit Activity Repeater.

Build Admin > Activity Master screen: CRUD for activity_master rows.

Build the unit creation/edit flow with two modes, per PRD Section 4:
1. "From template" — checklist of active activity_master items; on
   submit, insert one unit_activities row per checked item for that unit
   (contractor null, progress 0, status pending).
2. "Copy from another unit" — pick a source unit in the same project;
   clone its unit_activities rows (activity + estimated_cost) into the
   target unit as new, independent rows.

Write and run a test proving independence: editing one unit's copy of an
activity (cost, progress, remarks) must not change another unit's copy or
the activity_master template, and vice versa.

Do not build contractor-assignment UI, progress reporting, or payments in
this phase.

Open a PR via GitHub MCP named phase-4-activity-repeater.

When done, run Phase 4's acceptance checklist, report pass/fail per item,
and output the Phase 4 stop condition.
```

---

## Phase 5 — Contractor Assignment

```
Phase 5: Contractor Assignment.

Build the Employee screen: for each unit, list its unit_activities and let
the employee assign/reassign a contractor from the dropdown of
contractors already linked to that project (project_contractors).

On reassignment, write an audit_logs row capturing old and new contractor.

Build the Contractor "My Work" dashboard: unit_activities grouped by unit,
restricted by RLS to rows where contractor_id matches their own
project_contractors row.

Do not build progress % submission or payments in this phase.

Open a PR via GitHub MCP named phase-5-contractor-assignment.

When done, run Phase 5's acceptance checklist, report pass/fail per item,
and output the Phase 5 stop condition.
```

---

## Phase 6 — Progress Reporting, History & Photos

```
Phase 6: Progress Reporting, History & Photos.

Build the mobile-first Contractor progress form (PRD Appendix C): current
%, new % input, work-completed note, remarks, add-photos (camera or
gallery).

On submit: insert a new progress_reports row (never update/overwrite an
existing one), update unit_activities.progress_percentage and status to
the new cached value, upload photos to Supabase Storage via Supabase MCP
and insert progress_report_photos rows with the storage paths.

Auto-transition status: 0% = pending, 1-99% = in_progress, 100% =
completed (and set actual_completion_date when reaching 100%).

Build the activity detail screen: full chronological progress history +
photo gallery, visible per Appendix A (contractor sees only their own
submissions; employee/owner/admin see all for their scope).

Confirm via test that a contractor cannot UPDATE or DELETE a past
progress_reports row — this must be blocked by the Phase 2 RLS policy, not
just missing UI buttons.

Do not build the aggregate Unit Work Progress dashboard or payments yet.

Open a PR via GitHub MCP named phase-6-progress-reporting.

When done, run Phase 6's acceptance checklist, report pass/fail per item,
and output the Phase 6 stop condition.
```

---

## Phase 7 — Unit Work Progress Dashboard

```
Phase 7: Unit Work Progress Dashboard (the core screen).

Build Project → Block → Unit → Work Progress per PRD Sections 6/14/23:
- Header: overall progress (average of the unit's activity progress
  values), estimated cost, paid (show ₹0 for now — real payments come in
  Phase 8), balance.
- Activity list with progress bars, contractor name, status.
- Contractor filter dropdown that recomputes the filtered contractor's own
  average progress.
- Click-through from an activity to its Phase 6 detail screen (history,
  reports, photos).

Ensure each role sees this screen scoped exactly per Appendix A (admin/
employee: all their units; contractor: their assigned activities
highlighted/filterable; owner: view-only across their assigned projects).

Seed at least 50 units × 8 activities of test data and confirm the screen
performs acceptably at that scale.

Do not build payments logic in this phase — paid/balance stay placeholder.

Open a PR via GitHub MCP named phase-7-unit-progress-dashboard.

When done, run Phase 7's acceptance checklist, report pass/fail per item,
and output the Phase 7 stop condition.
```

---

## Phase 8 — Payments

```
Phase 8: Payments.

Build Owner screens to add/edit/delete payments against a unit_activity or
project, per Appendix A (Owner: Create/Edit/Delete; Admin: CRUD; Employee:
View only; Contractor: no access — enforce via RLS, not just UI).

Wire real Paid and Balance (Estimated Cost − Paid) into the Phase 7 unit
dashboard, replacing the placeholder ₹0 values.

Build a payment history list per unit/activity, visible to
Admin/Employee/Owner.

Deleting a payment must recalculate balance correctly and write an
audit_logs entry.

Open a PR via GitHub MCP named phase-8-payments.

When done, run Phase 8's acceptance checklist, report pass/fail per item,
and output the Phase 8 stop condition.
```

---

## Phase 9 — Reports, Audit Logs, Mobile Hardening & Launch

```
Phase 9: Reports, Audit Logs, Mobile Hardening & Launch.

Build Admin audit log viewer with filters (actor, entity, date range).

Build role-scoped report views reusing the Unit Work Progress data layer
(don't build a parallel query path): Admin (all), Employee/Owner (assigned
projects), Contractor (own work only).

Do a dedicated mobile pass on the Phase 6 contractor progress form: touch
target sizing, real device camera capture test, retry-on-failed-upload
behavior for flaky connections.

Re-run the Phase 2 negative RLS tests against the now-complete schema to
confirm no endpoint leaks another role's data.

Add pagination to large unit/activity lists and verify indexes from Phase
1 are actually being used (check query plans).

Using Vercel MCP: confirm production environment variables are set,
promote to production, and set up basic error monitoring. Using Supabase
MCP: confirm backups are enabled on the production project.

Write a short runbook (in the repo) for restoring from backup and rotating
Supabase keys.

Open a final PR via GitHub MCP named phase-9-launch-hardening.

When done, run Phase 9's acceptance checklist, report pass/fail per item,
and confirm the system is live in production.
```

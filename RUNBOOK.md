# Operations Runbook — Real Estate Project Work & Payment System

## 1. System Architecture Summary
- **Frontend / Fullstack**: Next.js 16 (App Router, Server Components & Server Actions, Turbopack, Tailwind CSS v4, shadcn/ui)
- **Backend & Database**: Supabase PostgreSQL 15+ with Row-Level Security (RLS)
- **Auth**: Supabase Auth with JWT session auto-refresh middleware and role-based route protection (`/admin`, `/employee`, `/contractor`, `/owner`)
- **Storage**: Supabase Storage bucket `progress-photos` for mobile site verification uploads

---

## 2. Database Backup & Restore Procedures

### Automated Backups
Supabase projects maintain automated daily backups with point-in-time recovery (PITR) where enabled.

### Manual Backup (CLI / pg_dump)
```bash
# Dump the complete database schema and data
pg_dump --clean --if-exists --no-owner --no-privileges \
  -h db.mjgneisuyrlvvcjtdaaz.supabase.co \
  -U postgres \
  -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Disaster Recovery Restore
```bash
# Restore schema and records onto a clean database
psql -h db.mjgneisuyrlvvcjtdaaz.supabase.co \
  -U postgres \
  -d postgres < backup_20260826_000000.sql
```

---

## 3. Credential & Key Rotation Protocol

When rotating Supabase API keys:
1. Generate new publishable anon key / service role key in **Supabase Dashboard → Project Settings → API**.
2. Update local development credentials in `.env.local`.
3. Update deployment environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy application bundle to production.
5. Invalidate old keys in Supabase dashboard after confirming zero 401/403 authorization anomalies.

---

## 4. Database Index Verification & Performance

Run the following query to verify that required performance indexes are active:
```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Required Indexes:
- `idx_unit_activities_unit_id` on `unit_activities(unit_id)`
- `idx_unit_activities_contractor_id` on `unit_activities(contractor_id)`
- `idx_progress_reports_unit_activity_id` on `progress_reports(unit_activity_id)`

---

## 5. Security & RLS Policy Verification

To verify that unauthorized access is blocked across all 13 tables, run the automated test suite:
```bash
node tests/rls-negative-tests.mjs
node tests/payment-rls-tests.mjs
node tests/unit-activity-independence-test.mjs
node tests/scale-test-50units.mjs
```

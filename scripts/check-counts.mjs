import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pxofmqorcpbnwapnzjkv.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzcwNTkwNCwiZXhwIjoyMTAzMjgxOTA0fQ.0U9AT1LJ-OXlhAx-QIKchi4C2ZilfdlFjmvzRFJuHRw";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function check() {
  const tables = [
    "projects",
    "blocks",
    "units",
    "activity_master",
    "unit_activities",
    "progress_reports",
    "progress_report_photos",
    "payments",
    "audit_logs",
    "project_employees",
    "project_contractors",
    "project_owners",
    "profiles",
  ];

  console.log("Current table row counts on pxofmqorcpbnwapnzjkv:");
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    console.log(`  ${t}: ${error ? error.message : count}`);
  }

  const { data: users } = await supabase.auth.admin.listUsers();
  console.log(`  auth.users: ${users?.users?.length ?? 0}`);
}

check();

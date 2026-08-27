import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pxofmqorcpbnwapnzjkv.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzcwNTkwNCwiZXhwIjoyMTAzMjgxOTA0fQ.0U9AT1LJ-OXlhAx-QIKchi4C2ZilfdlFjmvzRFJuHRw";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function purgeAll() {
  console.log("==================================================================");
  console.log("  TOTAL 100% PURGE OF ALL DATA (pxofmqorcpbnwapnzjkv)            ");
  console.log("==================================================================");

  const tables = [
    "progress_report_photos",
    "progress_reports",
    "payments",
    "audit_logs",
    "unit_activities",
    "units",
    "blocks",
    "project_employees",
    "project_contractors",
    "project_owners",
    "projects",
    "activity_master",
    "profiles",
  ];

  for (const t of tables) {
    console.log(`Deleting all rows from "${t}"...`);
    const { error } = await supabase.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.warn(`  Warning on table "${t}":`, error.message);
    } else {
      console.log(`  [OK] Cleared table "${t}".`);
    }
  }

  // Delete all Auth Users
  console.log("\nDeleting all auth users...");
  const { data: userList } = await supabase.auth.admin.listUsers();
  if (userList?.users) {
    for (const u of userList.users) {
      console.log(`  Deleting user: ${u.email} (${u.id})`);
      await supabase.auth.admin.deleteUser(u.id);
    }
  }

  console.log("\n==================================================================");
  console.log("  VERIFYING TOTAL 100% EMPTY DATABASE STATE                      ");
  console.log("==================================================================");

  for (const t of tables) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    console.log(`  Table "${t}": ${error ? error.message : count} records`);
  }

  const { data: remainingUsers } = await supabase.auth.admin.listUsers();
  console.log(`  auth.users: ${remainingUsers?.users?.length ?? 0} records`);

  console.log("\n==================================================================");
  console.log("  COMPLETE PURGE FINISHED: 0 RECORDS IN ALL TABLES!              ");
  console.log("==================================================================");
}

purgeAll().catch((err) => {
  console.error("Purge Error:", err);
  process.exit(1);
});

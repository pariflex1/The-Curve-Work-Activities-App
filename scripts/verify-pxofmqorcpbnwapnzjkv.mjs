import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pxofmqorcpbnwapnzjkv.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzcwNTkwNCwiZXhwIjoyMTAzMjgxOTA0fQ.0U9AT1LJ-OXlhAx-QIKchi4C2ZilfdlFjmvzRFJuHRw";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function verifyTables() {
  const tables = [
    "profiles",
    "projects",
    "project_employees",
    "project_contractors",
    "project_owners",
    "blocks",
    "units",
    "activity_master",
    "unit_activities",
    "progress_reports",
    "progress_report_photos",
    "payments",
    "audit_logs",
  ];

  console.log("Checking tables on pxofmqorcpbnwapnzjkv...");
  let existing = 0;
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (!error) {
      console.log(`  [OK] Table "${table}" exists.`);
      existing++;
    } else {
      console.log(`  [MISSING] Table "${table}":`, error.message);
    }
  }

  console.log(`\nTotal verified tables: ${existing}/${tables.length}`);
}

verifyTables();

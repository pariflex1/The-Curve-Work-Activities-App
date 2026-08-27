import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pxofmqorcpbnwapnzjkv.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzcwNTkwNCwiZXhwIjoyMTAzMjgxOTA0fQ.0U9AT1LJ-OXlhAx-QIKchi4C2ZilfdlFjmvzRFJuHRw";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function clearAndReset() {
  console.log("==================================================================");
  console.log("  CLEARING ALL DATA & RESETTING DATABASE (pxofmqorcpbnwapnzjkv)   ");
  console.log("==================================================================");

  // 1. Delete all relational data in proper foreign key order
  const tablesToClear = [
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
  ];

  for (const table of tablesToClear) {
    console.log(`Clearing table "${table}"...`);
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.warn(`  Warning on table "${table}":`, error.message);
    } else {
      console.log(`  [OK] Table "${table}" cleared.`);
    }
  }

  // 2. Clear out existing non-demo auth users & profiles
  const demoAccounts = [
    { email: "admin@thecurve.com", password: "Password123!", role: "admin", name: "Rajesh Sharma (Admin)" },
    { email: "engineer@thecurve.com", password: "Password123!", role: "employee", name: "Vikram Mehta (Site Engineer)" },
    { email: "apex.contractor@thecurve.com", password: "Password123!", role: "contractor", name: "Amit Patel", company: "Apex Civil Structures" },
    { email: "volt.mep@thecurve.com", password: "Password123!", role: "contractor", name: "Sunil Verma", company: "Volt MEP Solutions" },
    { email: "owner@thecurve.com", password: "Password123!", role: "owner", name: "Anita Deshmukh (Investor/Owner)" },
  ];

  const demoEmails = new Set(demoAccounts.map((a) => a.email.toLowerCase()));

  console.log("\nCleaning up user accounts...");
  const { data: userList } = await supabase.auth.admin.listUsers();
  if (userList?.users) {
    for (const u of userList.users) {
      if (!demoEmails.has(u.email?.toLowerCase())) {
        console.log(`  Deleting non-demo auth user: ${u.email} (${u.id})`);
        await supabase.from("profiles").delete().eq("user_id", u.id);
        await supabase.auth.admin.deleteUser(u.id);
      }
    }
  }

  // 3. Re-initialize standard demo accounts
  console.log("\nRe-initializing standard demo accounts...");
  for (const u of demoAccounts) {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let authUser = existingUsers?.users?.find((x) => x.email?.toLowerCase() === u.email.toLowerCase());

    if (!authUser) {
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.name, role: u.role },
      });
      if (error) {
        console.error(`  Error creating ${u.email}:`, error.message);
        continue;
      }
      authUser = created.user;
      console.log(`  [USER CREATED] ${u.email} (${u.role})`);
    } else {
      // Update password to ensure it matches
      await supabase.auth.admin.updateUserById(authUser.id, {
        password: u.password,
        user_metadata: { full_name: u.name, role: u.role },
      });
      console.log(`  [USER UPDATED] ${u.email} (${u.role})`);
    }

    // Upsert Profile
    await supabase.from("profiles").upsert(
      {
        user_id: authUser.id,
        full_name: u.name,
        role: u.role,
        is_active: true,
      },
      { onConflict: "user_id" }
    );
  }

  // 4. Ensure standard Master Activity templates exist
  console.log("\nEnsuring standard Master Activity templates exist...");
  const standardActivities = [
    { name: "Foundation", code: "ACT-FND", category: "Civil", default_cost: 250000, sort_order: 1 },
    { name: "RCC", code: "ACT-RCC", category: "Structural", default_cost: 450000, sort_order: 2 },
    { name: "Brick Work", code: "ACT-BRK", category: "Civil", default_cost: 180000, sort_order: 3 },
    { name: "Plaster", code: "ACT-PLS", category: "Finishing", default_cost: 120000, sort_order: 4 },
    { name: "Electrical", code: "ACT-ELE", category: "MEP", default_cost: 220000, sort_order: 5 },
    { name: "Plumbing", code: "ACT-PLM", category: "MEP", default_cost: 160000, sort_order: 6 },
    { name: "Flooring", code: "ACT-FLR", category: "Finishing", default_cost: 300000, sort_order: 7 },
    { name: "Painting", code: "ACT-PNT", category: "Finishing", default_cost: 140000, sort_order: 8 },
  ];

  for (const act of standardActivities) {
    const { data: existing } = await supabase.from("activity_master").select("id").eq("name", act.name).maybeSingle();
    if (!existing) {
      await supabase.from("activity_master").insert(act);
      console.log(`  [ACTIVITY ADDED] ${act.name}`);
    }
  }

  // 5. Verify counts
  console.log("\n==================================================================");
  console.log("  VERIFYING FINAL CLEAN DATABASE STATE                           ");
  console.log("==================================================================");

  const verificationTables = [
    "projects",
    "blocks",
    "units",
    "unit_activities",
    "progress_reports",
    "progress_report_photos",
    "payments",
    "audit_logs",
    "profiles",
    "activity_master",
  ];

  for (const t of verificationTables) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    if (!error) {
      console.log(`  Table "${t}": ${count} records`);
    }
  }

  console.log("\n==================================================================");
  console.log("  ALL DATA SUCCESSFULLY CLEARED! READY FOR FRESH PROJECTS.         ");
  console.log("==================================================================");
  console.log("  Demo Login Accounts:");
  console.log("  • Admin:         admin@thecurve.com           (Password123!)");
  console.log("  • Site Engineer: engineer@thecurve.com        (Password123!)");
  console.log("  • Contractor:    apex.contractor@thecurve.com (Password123!)");
  console.log("  • Owner:         owner@thecurve.com           (Password123!)");
  console.log("==================================================================");
}

clearAndReset().catch((err) => {
  console.error("Reset Error:", err);
  process.exit(1);
});

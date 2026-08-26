import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pxofmqorcpbnwapnzjkv.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzcwNTkwNCwiZXhwIjoyMTAzMjgxOTA0fQ.0U9AT1LJ-OXlhAx-QIKchi4C2ZilfdlFjmvzRFJuHRw";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function seed() {
  console.log("==================================================");
  console.log("  Seeding Demo Data for The Curve Work Activities");
  console.log("==================================================");

  // 1. Create or get Demo Users
  const demoUsers = [
    { email: "admin@thecurve.com", password: "Password123!", role: "admin", name: "Rajesh Sharma (Admin)" },
    { email: "engineer@thecurve.com", password: "Password123!", role: "employee", name: "Vikram Mehta (Site Engineer)" },
    { email: "apex.contractor@thecurve.com", password: "Password123!", role: "contractor", name: "Amit Patel", company: "Apex Civil Structures" },
    { email: "volt.mep@thecurve.com", password: "Password123!", role: "contractor", name: "Sunil Verma", company: "Volt MEP Solutions" },
    { email: "owner@thecurve.com", password: "Password123!", role: "owner", name: "Anita Deshmukh (Investor/Owner)" },
  ];

  const profileMap = {};

  for (const u of demoUsers) {
    // Check if user exists in auth.users
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let authUser = existingUsers?.users?.find((x) => x.email === u.email);

    if (!authUser) {
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.name, role: u.role },
      });
      if (error) {
        console.error(`Error creating user ${u.email}:`, error.message);
        continue;
      }
      authUser = created.user;
      console.log(`  [USER CREATED] ${u.email} (${u.role})`);
    } else {
      console.log(`  [USER EXISTS] ${u.email}`);
    }

    // Upsert Profile
    const { data: profile } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: authUser.id,
          full_name: u.name,
          role: u.role,
          is_active: true,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (profile) {
      profileMap[u.role] = profileMap[u.role] || [];
      profileMap[u.role].push({ ...profile, company: u.company, email: u.email });
    }
  }

  const adminProfile = profileMap.admin?.[0];
  const employeeProfile = profileMap.employee?.[0];
  const contractor1 = profileMap.contractor?.[0];
  const contractor2 = profileMap.contractor?.[1];
  const ownerProfile = profileMap.owner?.[0];

  // 2. Create Project
  console.log("\nCreating Demo Project...");
  const { data: project } = await supabase
    .from("projects")
    .upsert({
      name: "The Curve Luxury Residences",
      location: "Bandra Kurla Complex, Mumbai",
      status: "active",
      created_by: adminProfile?.id,
    })
    .select()
    .single();

  console.log(`  [PROJECT] "${project.name}" (ID: ${project.id})`);

  // 3. Assign Project Team
  if (employeeProfile) {
    await supabase.from("project_employees").upsert(
      { project_id: project.id, profile_id: employeeProfile.id },
      { onConflict: "project_id,profile_id" }
    );
  }

  let contractorId1 = null;
  let contractorId2 = null;

  if (contractor1) {
    const { data: pc1 } = await supabase.from("project_contractors").upsert(
      { project_id: project.id, profile_id: contractor1.id, company_name: "Apex Civil Structures" },
      { onConflict: "project_id,profile_id" }
    ).select().single();
    contractorId1 = pc1?.id;
  }

  if (contractor2) {
    const { data: pc2 } = await supabase.from("project_contractors").upsert(
      { project_id: project.id, profile_id: contractor2.id, company_name: "Volt MEP Solutions" },
      { onConflict: "project_id,profile_id" }
    ).select().single();
    contractorId2 = pc2?.id;
  }

  if (ownerProfile) {
    await supabase.from("project_owners").upsert(
      { project_id: project.id, profile_id: ownerProfile.id },
      { onConflict: "project_id,profile_id" }
    );
  }
  console.log("  [TEAM] Assigned Site Engineer, 2 Contractors, and 1 Owner to project.");

  // 4. Create Blocks
  console.log("\nCreating Blocks & Units...");
  const { data: blockA } = await supabase
    .from("blocks")
    .upsert({ project_id: project.id, name: "Tower A (North Wing)", sort_order: 1 })
    .select()
    .single();

  const { data: blockB } = await supabase
    .from("blocks")
    .upsert({ project_id: project.id, name: "Tower B (South Wing)", sort_order: 2 })
    .select()
    .single();

  // 5. Create Units
  const { data: unit101 } = await supabase
    .from("units")
    .upsert({
      block_id: blockA.id,
      unit_number: "Unit 101",
      floor: "1st Floor",
      unit_type: "3BHK Luxury",
      area: 1850,
      status: "active",
    })
    .select()
    .single();

  const { data: unit102 } = await supabase
    .from("units")
    .upsert({
      block_id: blockA.id,
      unit_number: "Unit 102",
      floor: "1st Floor",
      unit_type: "2BHK Premium",
      area: 1350,
      status: "active",
    })
    .select()
    .single();

  console.log(`  [UNITS] Created Unit 101 and Unit 102 in ${blockA.name}`);

  // 6. Provision Unit Activities for Unit 101
  console.log("\nProvisioning Unit Activities with real progress...");
  const { data: masterActivities } = await supabase.from("activity_master").select("*").order("sort_order");

  if (masterActivities && masterActivities.length > 0) {
    const activitySpecs = [
      { name: "Foundation", cost: 250000, progress: 100, status: "completed", contractor: contractorId1 },
      { name: "RCC", cost: 450000, progress: 85, status: "in_progress", contractor: contractorId1 },
      { name: "Brick Work", cost: 180000, progress: 40, status: "in_progress", contractor: contractorId1 },
      { name: "Plaster", cost: 120000, progress: 0, status: "pending", contractor: contractorId1 },
      { name: "Electrical", cost: 220000, progress: 10, status: "in_progress", contractor: contractorId2 },
      { name: "Plumbing", cost: 160000, progress: 0, status: "pending", contractor: contractorId2 },
      { name: "Flooring", cost: 300000, progress: 0, status: "pending", contractor: null },
      { name: "Painting", cost: 140000, progress: 0, status: "pending", contractor: null },
    ];

    for (const spec of activitySpecs) {
      const master = masterActivities.find((m) => m.name.toLowerCase() === spec.name.toLowerCase());
      if (master) {
        const { data: unitAct } = await supabase
          .from("unit_activities")
          .upsert({
            unit_id: unit101.id,
            activity_master_id: master.id,
            contractor_id: spec.contractor,
            estimated_cost: spec.cost,
            progress_percentage: spec.progress,
            status: spec.status,
            sort_order: master.sort_order,
            remarks: `Phase 1 schedule for ${spec.name}`,
          })
          .select()
          .single();

        // If in progress or completed, add sample progress reports
        if (unitAct && spec.progress > 0 && spec.contractor) {
          await supabase.from("progress_reports").insert({
            unit_activity_id: unitAct.id,
            contractor_id: spec.contractor,
            previous_progress: 0,
            new_progress: spec.progress,
            work_completed_note: `Site verification complete: ${spec.name} reached ${spec.progress}% milestone.`,
          });
        }
      }
    }
    console.log("  [ACTIVITIES] Provisioned 8 activities for Unit 101 with progress history.");
  }

  // 7. Create Sample Payments
  console.log("\nRecording Sample Payments & Financial Ledger...");
  await supabase.from("payments").insert([
    {
      project_id: project.id,
      amount: 250000,
      payment_type: "Milestone",
      paid_to: "Apex Civil Structures",
      payment_date: "2026-08-20",
      notes: "Full payment for Foundation completion",
      created_by: adminProfile?.id,
    },
    {
      project_id: project.id,
      amount: 300000,
      payment_type: "Advance",
      paid_to: "Apex Civil Structures",
      payment_date: "2026-08-24",
      notes: "Running bill for RCC structural slab",
      created_by: adminProfile?.id,
    },
  ]);
  console.log("  [PAYMENTS] Recorded ₹5,50,000 across 2 disbursements.");

  // 8. Log Audit Events
  await supabase.from("audit_logs").insert([
    {
      actor_profile_id: adminProfile?.id,
      action: "PROJECT_CREATED",
      entity_type: "projects",
      entity_id: project.id,
      meta_json: { name: project.name },
    },
    {
      actor_profile_id: employeeProfile?.id,
      action: "CONTRACTOR_ASSIGNED",
      entity_type: "unit_activities",
      meta_json: { contractor: "Apex Civil Structures", unit: "Unit 101" },
    },
  ]);

  console.log("\n==================================================");
  console.log("  DEMO DATA SEEDED SUCCESSFULLY!");
  console.log("==================================================");
  console.log("\nDemo Credentials:");
  console.log("  • Admin:      admin@thecurve.com           (Password123!)");
  console.log("  • Engineer:   engineer@thecurve.com        (Password123!)");
  console.log("  • Contractor: apex.contractor@thecurve.com (Password123!)");
  console.log("  • Owner:      owner@thecurve.com           (Password123!)");
  console.log("==================================================");
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});

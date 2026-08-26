import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pxofmqorcpbnwapnzjkv.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MDU5MDQsImV4cCI6MjEwMzI4MTkwNH0.trZKNdYcsO2vkJqDJHaEM1xBaRSWRUMR8qRq5cfu6H0";

async function runNegativeTests() {
  console.log("==========================================");
  console.log("  Running Phase 2 Negative RLS Tests");
  console.log("==========================================");

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let passedCount = 0;
  let totalCount = 0;

  // Test 1: Unauthenticated user cannot read profiles
  totalCount++;
  console.log(`\nTest ${totalCount}: Unauthenticated user reading profiles...`);
  const { data: profiles, error: pError } = await anonClient.from("profiles").select("*");
  if (!profiles || profiles.length === 0) {
    console.log("  [PASS] Unauthenticated access to profiles returned 0 rows.");
    passedCount++;
  } else {
    console.error("  [FAIL] Unauthenticated access to profiles leaked data:", profiles);
  }

  // Test 2: Unauthenticated user cannot read payments
  totalCount++;
  console.log(`\nTest ${totalCount}: Unauthenticated user reading payments...`);
  const { data: payments, error: payError } = await anonClient.from("payments").select("*");
  if (!payments || payments.length === 0) {
    console.log("  [PASS] Unauthenticated access to payments returned 0 rows.");
    passedCount++;
  } else {
    console.error("  [FAIL] Unauthenticated access to payments leaked data:", payments);
  }

  // Test 3: Unauthenticated user cannot insert projects
  totalCount++;
  console.log(`\nTest ${totalCount}: Unauthenticated user inserting a project...`);
  const { data: projInsert, error: projError } = await anonClient
    .from("projects")
    .insert({ name: "Hacker Project" })
    .select();
  if (projError || !projInsert || projInsert.length === 0) {
    console.log("  [PASS] Project insert by unauthenticated user correctly blocked.");
    passedCount++;
  } else {
    console.error("  [FAIL] Project insert succeeded unexpectedly:", projInsert);
  }

  // Test 4: Unauthenticated user cannot mutate activity_master
  totalCount++;
  console.log(`\nTest ${totalCount}: Unauthenticated user updating activity_master...`);
  const { data: actUpdate, error: actError } = await anonClient
    .from("activity_master")
    .update({ name: "Tampered Name" })
    .eq("code", "FND")
    .select();
  if (actError || !actUpdate || actUpdate.length === 0) {
    console.log("  [PASS] activity_master update by non-admin correctly blocked.");
    passedCount++;
  } else {
    console.error("  [FAIL] activity_master update succeeded unexpectedly:", actUpdate);
  }

  // Test 5: Public user can SELECT activity_master (per PRD)
  totalCount++;
  console.log(`\nTest ${totalCount}: Public user selecting activity_master (allowed read)...`);
  const { data: actSelect, error: actSelError } = await anonClient
    .from("activity_master")
    .select("name, code");
  if (actSelect && actSelect.length > 0) {
    console.log(`  [PASS] Read allowed: retrieved ${actSelect.length} standard activities.`);
    passedCount++;
  } else {
    console.error("  [FAIL] Could not read activity_master:", actSelError);
  }

  console.log("\n==========================================");
  console.log(`Results: ${passedCount}/${totalCount} tests passed.`);
  console.log("==========================================");

  if (passedCount === totalCount) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runNegativeTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

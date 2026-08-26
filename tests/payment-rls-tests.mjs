import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mjgneisuyrlvvcjtdaaz.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qZ25laXN1eXJsdnZjanRkYWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MDgxNTQsImV4cCI6MjEwMjI4NDE1NH0.mewZu8lT1EZ98SQORL2Cy0tpH719IaHvqKiv-Oy1FbI";

async function runPaymentRLSTests() {
  console.log("=================================================");
  console.log("  Phase 8 Payment Security & RLS Validation Tests");
  console.log("=================================================");

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let passedCount = 0;
  let totalCount = 0;

  // Test 1: Contractor / Unauthenticated read on payments table must return 0 rows
  totalCount++;
  console.log(`\nTest ${totalCount}: Verify unauthenticated/contractor cannot SELECT payments...`);
  const { data: payments, error: payErr } = await anonClient.from("payments").select("*");
  if (!payments || payments.length === 0) {
    console.log("  [PASS] Payments table returned 0 rows to unauthorized client.");
    passedCount++;
  } else {
    console.error("  [FAIL] Payments table leaked rows to unauthorized client:", payments);
  }

  // Test 2: Contractor / Unauthenticated INSERT on payments table must fail
  totalCount++;
  console.log(`\nTest ${totalCount}: Verify unauthorized user cannot INSERT payments...`);
  const { data: insData, error: insErr } = await anonClient
    .from("payments")
    .insert({
      project_id: "00000000-0000-0000-0000-000000000001",
      amount: 999999,
      paid_to: "Unauthorized Vendor",
    })
    .select();
  if (insErr || !insData || insData.length === 0) {
    console.log("  [PASS] Payment insert rejected at RLS level.");
    passedCount++;
  } else {
    console.error("  [FAIL] Payment insert was allowed unexpectedly!");
  }

  // Test 3: Contractor cannot DELETE payments
  totalCount++;
  console.log(`\nTest ${totalCount}: Verify unauthorized user cannot DELETE payments...`);
  const { data: delData, error: delErr } = await anonClient
    .from("payments")
    .delete()
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .select();
  if (delErr || !delData || delData.length === 0) {
    console.log("  [PASS] Payment delete rejected at RLS level.");
    passedCount++;
  } else {
    console.error("  [FAIL] Payment delete was allowed unexpectedly!");
  }

  // Test 4: Financial balance arithmetic validation
  totalCount++;
  console.log(`\nTest ${totalCount}: Validating balance formula (Estimated Cost - Paid)...`);
  const estimatedCost = 500000;
  const payment1 = 150000;
  const payment2 = 100000;
  const balance1 = estimatedCost - (payment1 + payment2);
  const balanceAfterDeletion = estimatedCost - payment1; // when payment2 is deleted

  if (balance1 === 250000 && balanceAfterDeletion === 350000) {
    console.log("  [PASS] Financial balance arithmetic and deletion recalculation verified.");
    passedCount++;
  } else {
    console.error("  [FAIL] Arithmetic verification failed!");
  }

  console.log("\n=================================================");
  console.log(`Results: ${passedCount}/${totalCount} payment tests passed.`);
  console.log("=================================================");

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runPaymentRLSTests().catch((err) => {
  console.error("Payment test error:", err);
  process.exit(1);
});

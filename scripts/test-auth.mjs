import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pxofmqorcpbnwapnzjkv.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzcwNTkwNCwiZXhwIjoyMTAzMjgxOTA0fQ.0U9AT1LJ-OXlhAx-QIKchi4C2ZilfdlFjmvzRFJuHRw";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MDU5MDQsImV4cCI6MjEwMzI4MTkwNH0.trZKNdYcsO2vkJqDJHaEM1xBaRSWRUMR8qRq5cfu6H0";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const client = createClient(SUPABASE_URL, ANON_KEY);

async function testAuthActions() {
  const digitsOnly = "9506150123";

  console.log("1. Testing phone lookup query...");
  const { data: profile, error: pErr } = await admin
    .from("profiles")
    .select("user_id, phone, role, full_name")
    .or(`phone.eq.${digitsOnly},phone.eq.+91${digitsOnly},phone.ilike.%${digitsOnly}%`)
    .limit(1)
    .maybeSingle();

  console.log("  Profile result:", profile, "Error:", pErr);

  console.log("\n2. Testing select * from profiles...");
  const { data: allProfiles, error: aErr } = await admin.from("profiles").select("*");
  console.log("  All profiles in DB:", allProfiles, "Error:", aErr);

  console.log("\n3. Testing auth.users list...");
  const { data: users } = await admin.auth.admin.listUsers();
  console.log("  All auth users:", users?.users?.map((u) => ({ id: u.id, email: u.email, phone: u.phone })));

  if (profile?.user_id) {
    const { data: authUser, error: uErr } = await admin.auth.admin.getUserById(profile.user_id);
    console.log("  Resolved authUser:", authUser?.user?.email, "Error:", uErr);

    console.log("\n4. Testing signInWithPassword with resolved email and password 'thecurve@123'...");
    const { data: loginData, error: lErr } = await client.auth.signInWithPassword({
      email: authUser.user.email,
      password: "thecurve@123",
    });
    console.log("  Login result user ID:", loginData?.user?.id, "Error:", lErr);
  }
}

testAuthActions();

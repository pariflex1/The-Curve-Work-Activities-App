import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pxofmqorcpbnwapnzjkv.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzcwNTkwNCwiZXhwIjoyMTAzMjgxOTA0fQ.0U9AT1LJ-OXlhAx-QIKchi4C2ZilfdlFjmvzRFJuHRw";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function createAdmin() {
  const adminData = {
    email: "info@thecurveconsultants.com",
    password: "thecurve@123",
    displayName: "The Curve",
    phone: "9506150123",
    role: "admin",
  };

  console.log("Creating Admin account on pxofmqorcpbnwapnzjkv...");
  console.log(`  Email: ${adminData.email}`);
  console.log(`  Phone: ${adminData.phone}`);
  console.log(`  Name:  ${adminData.displayName}`);
  console.log(`  Role:  ${adminData.role}`);

  // 1. Check if auth user exists
  const { data: userList } = await supabase.auth.admin.listUsers();
  let authUser = userList?.users?.find(
    (u) => u.email?.toLowerCase() === adminData.email.toLowerCase()
  );

  if (authUser) {
    console.log(`  Auth user exists (ID: ${authUser.id}), updating password and metadata...`);
    const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(authUser.id, {
      password: adminData.password,
      phone: `+91${adminData.phone}`,
      user_metadata: {
        full_name: adminData.displayName,
        role: adminData.role,
        phone: adminData.phone,
      },
      email_confirm: true,
    });
    if (updateErr) {
      // If phone with +91 format fails, try without phone in auth
      await supabase.auth.admin.updateUserById(authUser.id, {
        password: adminData.password,
        user_metadata: {
          full_name: adminData.displayName,
          role: adminData.role,
          phone: adminData.phone,
        },
        email_confirm: true,
      });
    }
  } else {
    console.log("  Creating new Auth user...");
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true,
      user_metadata: {
        full_name: adminData.displayName,
        role: adminData.role,
        phone: adminData.phone,
      },
    });

    if (createErr) {
      throw new Error(`Failed to create auth user: ${createErr.message}`);
    }
    authUser = created.user;
    console.log(`  Auth user created with ID: ${authUser.id}`);
  }

  // 2. Create or Upsert Profile
  const profilePayload = {
    user_id: authUser.id,
    full_name: adminData.displayName,
    role: adminData.role,
    phone: adminData.phone,
    is_active: true,
  };

  console.log("  Upserting profile record...");
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "user_id" })
    .select()
    .single();

  if (profileErr) {
    // If phone column doesn't exist, try without phone column
    console.warn("  Profile upsert with phone error:", profileErr.message);
    const { data: fallbackProfile, error: fallbackErr } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: authUser.id,
          full_name: adminData.displayName,
          role: adminData.role,
          is_active: true,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (fallbackErr) {
      throw new Error(`Failed to create profile: ${fallbackErr.message}`);
    }
    console.log("  [SUCCESS] Profile created without phone column:", fallbackProfile);
  } else {
    console.log("  [SUCCESS] Profile created with phone:", profile);
  }

  console.log("\n==================================================");
  console.log("  ADMIN USER ACCOUNT READY FOR LOGIN!             ");
  console.log("==================================================");
  console.log(`  • Login via Email: ${adminData.email}`);
  console.log(`  • Login via Phone: ${adminData.phone}`);
  console.log(`  • Password:        ${adminData.password}`);
  console.log("==================================================");
}

createAdmin().catch((err) => {
  console.error("Error creating admin:", err);
  process.exit(1);
});

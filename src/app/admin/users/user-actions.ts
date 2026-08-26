"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

// Verify that the caller is an active authenticated Administrator
async function verifyAdminCaller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: "Unauthorized. Please log in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { authorized: false, error: "Access denied. Only Administrators can manage user accounts." };
  }

  return { authorized: true, profile, adminClient: createAdminClient() };
}

// 1. Create a new user account with credentials (Site Engineer, Contractor, Owner, Admin)
export async function createUserAccount(payload: {
  fullName: string;
  phone: string;
  role: "employee" | "contractor" | "owner" | "admin";
  password: string;
  email?: string;
  companyName?: string;
}) {
  const check = await verifyAdminCaller();
  if (!check.authorized || !check.adminClient) {
    return { error: check.error };
  }

  const admin = check.adminClient;

  const fullName = payload.fullName?.trim();
  const phone = payload.phone?.trim();
  const role = payload.role;
  const password = payload.password?.trim();
  const rawEmail = payload.email?.trim();

  if (!fullName) return { error: "Full Name is required." };
  if (!phone) return { error: "Mobile Number is required." };
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length < 10) {
    return { error: "Please enter a valid 10-digit mobile number." };
  }

  // Check if a profile already has this phone number
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, full_name, role")
    .or(`phone.eq.${digitsOnly},phone.eq.+91${digitsOnly},phone.ilike.%${digitsOnly}%`)
    .maybeSingle();

  if (existingProfile) {
    return {
      error: `Mobile number ${digitsOnly} is already assigned to "${existingProfile.full_name}" (${existingProfile.role}).`,
    };
  }

  // Determine email address for Supabase Auth
  const targetEmail = rawEmail || `${digitsOnly}@thecurve.app`;

  // Create Auth User
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: targetEmail,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: role,
      phone: digitsOnly,
    },
  });

  if (authError || !authData?.user) {
    return { error: authError?.message || "Failed to create authentication credentials." };
  }

  // Upsert Profile row
  const { data: newProfile, error: profileErr } = await admin
    .from("profiles")
    .upsert(
      {
        user_id: authData.user.id,
        full_name: fullName,
        role: role,
        phone: digitsOnly,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (profileErr) {
    return { error: profileErr.message };
  }

  // Write audit log
  if (check.profile?.id) {
    await admin.from("audit_logs").insert({
      actor_profile_id: check.profile.id,
      action: "CREATE_USER_ACCOUNT",
      entity_type: "profiles",
      entity_id: newProfile.id,
      meta_json: {
        full_name: fullName,
        phone: digitsOnly,
        email: targetEmail,
        role: role,
        company_name: payload.companyName || null,
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/users");
  return { success: true, profile: newProfile };
}

// 2. Reset or update a user's password
export async function updateUserPassword(profileId: string, newPassword: string) {
  const check = await verifyAdminCaller();
  if (!check.authorized || !check.adminClient) {
    return { error: check.error };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const admin = check.adminClient;

  // Find user_id from profile
  const { data: targetProfile, error: fetchErr } = await admin
    .from("profiles")
    .select("id, user_id, full_name, role")
    .eq("id", profileId)
    .single();

  if (fetchErr || !targetProfile) {
    return { error: "User profile not found." };
  }

  const { error: updateErr } = await admin.auth.admin.updateUserById(targetProfile.user_id, {
    password: newPassword.trim(),
  });

  if (updateErr) {
    return { error: updateErr.message };
  }

  // Write audit log
  if (check.profile?.id) {
    await admin.from("audit_logs").insert({
      actor_profile_id: check.profile.id,
      action: "RESET_USER_PASSWORD",
      entity_type: "profiles",
      entity_id: profileId,
      meta_json: {
        user_name: targetProfile.full_name,
        role: targetProfile.role,
      },
    });
  }

  return { success: true };
}

// 3. Delete a user account and profile
export async function deleteUserAccount(profileId: string) {
  const check = await verifyAdminCaller();
  if (!check.authorized || !check.adminClient) {
    return { error: check.error };
  }

  const admin = check.adminClient;

  // Find user_id
  const { data: targetProfile, error: fetchErr } = await admin
    .from("profiles")
    .select("id, user_id, full_name, role")
    .eq("id", profileId)
    .single();

  if (fetchErr || !targetProfile) {
    return { error: "User profile not found." };
  }

  // Delete Auth User
  const { error: delAuthErr } = await admin.auth.admin.deleteUser(targetProfile.user_id);
  if (delAuthErr) {
    // If auth user already deleted or errored, still try to delete profile
  }

  const { error: delProfileErr } = await admin.from("profiles").delete().eq("id", profileId);
  if (delProfileErr) {
    return { error: delProfileErr.message };
  }

  // Write audit log
  if (check.profile?.id) {
    await admin.from("audit_logs").insert({
      actor_profile_id: check.profile.id,
      action: "DELETE_USER_ACCOUNT",
      entity_type: "profiles",
      entity_id: profileId,
      meta_json: {
        user_name: targetProfile.full_name,
        role: targetProfile.role,
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/users");
  return { success: true };
}

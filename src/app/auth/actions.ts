"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const identifier = (formData.get("identifier") || formData.get("email")) as string;
  const password = formData.get("password") as string;

  if (!identifier || !identifier.trim()) {
    return { error: "Please enter your mobile number or email address." };
  }
  if (!password || !password.trim()) {
    return { error: "Please enter your password." };
  }

  const trimmed = identifier.trim();
  let targetEmail = trimmed;

  // Check if identifier is a phone number (contains digits and no '@')
  if (!trimmed.includes("@")) {
    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return { error: "Please enter a valid 10-digit mobile number." };
    }

    // Lookup profile by phone number using admin client
    try {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("user_id, phone")
        .or(`phone.eq.${digitsOnly},phone.eq.+91${digitsOnly},phone.ilike.%${digitsOnly}%`)
        .limit(1)
        .maybeSingle();

      if (profile?.user_id) {
        const { data: authUser } = await admin.auth.admin.getUserById(profile.user_id);
        if (authUser?.user?.email) {
          targetEmail = authUser.user.email;
        } else {
          targetEmail = `${digitsOnly}@thecurve.app`;
        }
      } else {
        // Fallback to synthetic email format
        targetEmail = `${digitsOnly}@thecurve.app`;
      }
    } catch {
      targetEmail = `${digitsOnly}@thecurve.app`;
    }
  }

  // Authenticate with Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password: password.trim(),
  });

  if (error) {
    return { error: "Invalid mobile number/email or password. Please try again." };
  }

  // Get user's role to redirect appropriately
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role) {
      redirect(`/${profile.role}`);
    }
  }

  redirect("/");
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) return { error: "Email or mobile is required." };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset instructions have been generated." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

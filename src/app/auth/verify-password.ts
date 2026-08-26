"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createJsClient } from "@supabase/supabase-js";

export async function verifyUserPassword(password: string): Promise<{ valid: boolean; error?: string }> {
  if (!password || !password.trim()) {
    return { valid: false, error: "Password is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { valid: false, error: "You must be logged in to perform this action." };
  }

  // Verify credentials by attempting a scoped sign-in with the current user's email
  const verifyClient = createJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { error } = await verifyClient.auth.signInWithPassword({
    email: user.email,
    password: password.trim(),
  });

  if (error) {
    return { valid: false, error: "Incorrect password. Action cancelled." };
  }

  return { valid: true };
}

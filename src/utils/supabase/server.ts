import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                maxAge: ONE_YEAR_IN_SECONDS,
                path: "/",
                sameSite: "lax",
              })
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}

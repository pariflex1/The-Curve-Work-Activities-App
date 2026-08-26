import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: ONE_YEAR_IN_SECONDS,
              path: "/",
              sameSite: "lax",
            })
          );
        },
      },
    }
  );

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  // This refreshes the session if expired - required for Server Components
  await supabase.auth.getUser();

  return supabaseResponse;
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/forgot-password", "/auth/callback"];

// Role-based route groups
const roleRoutes: Record<string, string> = {
  "/admin": "admin",
  "/employee": "employee",
  "/contractor": "contractor",
  "/owner": "owner",
};

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // If user is already logged in, redirect to their dashboard
    if (user && (pathname === "/login" || pathname === "/signup")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const url = request.nextUrl.clone();
        url.pathname = `/${profile.role}`;
        return NextResponse.redirect(url);
      }
    }
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Check role-based route access
  for (const [routePrefix, requiredRole] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!profile || profile.role !== requiredRole) {
        // Redirect to user's own role dashboard
        const url = request.nextUrl.clone();
        url.pathname = profile ? `/${profile.role}` : "/login";
        return NextResponse.redirect(url);
      }
    }
  }

  // Root path: redirect to role dashboard
  if (pathname === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const url = request.nextUrl.clone();
      url.pathname = `/${profile.role}`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

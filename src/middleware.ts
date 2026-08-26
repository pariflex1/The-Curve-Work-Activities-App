import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pxofmqorcpbnwapnzjkv.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MDU5MDQsImV4cCI6MjEwMzI4MTkwNH0.trZKNdYcsO2vkJqDJHaEM1xBaRSWRUMR8qRq5cfu6H0";

// Routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/forgot-password", "/auth/callback"];

// Role-based route groups
const roleRoutes: Record<string, string> = {
  "/admin": "admin",
  "/employee": "employee",
  "/contractor": "contractor",
  "/owner": "owner",
};

async function getUserRole(user: any, supabase: any): Promise<string | null> {
  if (user?.user_metadata?.role) {
    return user.user_metadata.role;
  }
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    return profile?.role || null;
  } catch (err) {
    console.error("getUserRole error:", err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
    });

    const pathname = request.nextUrl.pathname;

    // Refresh the session safely
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Allow public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      // If user is already logged in, redirect to their dashboard
      if (user && (pathname === "/login" || pathname === "/signup")) {
        const role = await getUserRole(user, supabase);
        if (role) {
          const url = request.nextUrl.clone();
          url.pathname = `/${role}`;
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
        const role = await getUserRole(user, supabase);
        if (!role || role !== requiredRole) {
          // Redirect to user's own role dashboard
          const url = request.nextUrl.clone();
          url.pathname = role ? `/${role}` : "/login";
          return NextResponse.redirect(url);
        }
      }
    }

    // Root path: redirect to role dashboard
    if (pathname === "/") {
      const role = await getUserRole(user, supabase);
      if (role) {
        const url = request.nextUrl.clone();
        url.pathname = `/${role}`;
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware crash prevented:", error);
    return supabaseResponse;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt)$).*)",
  ],
};



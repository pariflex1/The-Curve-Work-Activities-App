import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import {
  Building2,
  HardHat,
  ShieldCheck,
  Coins,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";
import UserManualModal, { UserRoleType } from "@/components/UserManualModal";
import PWAInstallButton from "@/components/PWAInstallButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = null;
  let userName = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("user_id", user.id)
      .single();
    userRole = profile?.role;
    userName = profile?.full_name;
  }

  const portals = [
    {
      title: "Admin Portal",
      desc: "Projects, hierarchy, activity templates & financial audit",
      href: "/admin",
      icon: ShieldCheck,
      badge: "Full Control",
      badgeColor: "bg-black text-white",
    },
    {
      title: "Site Engineer",
      desc: "Unit inspections, contractor allocations & milestone tracking",
      href: "/employee",
      icon: Layers,
      badge: "Field Ops",
      badgeColor: "bg-slate-100 text-black border border-slate-300",
    },
    {
      title: "Contractor Portal",
      desc: "Assigned tasks & mobile photo verification reports",
      href: "/contractor",
      icon: HardHat,
      badge: "Execution",
      badgeColor: "bg-slate-100 text-black border border-slate-300",
    },
    {
      title: "Investor / Owner",
      desc: "Real-time construction progress & payment disbursements",
      href: "/owner",
      icon: Coins,
      badge: "Financials",
      badgeColor: "bg-slate-100 text-black border border-slate-300",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-2xl text-black tracking-tight block leading-none">
                THE CURVE
              </span>
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mt-1 block">
                Work &amp; Payment System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PWAInstallButton />
            <UserManualModal role={(userRole as UserRoleType) || "admin"} triggerLabel="User Manual" />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 hidden sm:inline font-normal">
                  Signed in as <strong className="text-black font-semibold">{userName || user.email}</strong>
                </span>
                <Link
                  href={
                    userRole === "admin"
                      ? "/admin"
                      : userRole === "employee"
                      ? "/employee"
                      : userRole === "contractor"
                      ? "/contractor"
                      : "/owner"
                  }
                  className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold tracking-wide rounded-xl shadow-sm transition-all flex items-center gap-2 min-h-[42px]"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold tracking-wide rounded-xl shadow-sm transition-all min-h-[42px] flex items-center"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        <div className="text-center max-w-4xl mx-auto space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-black text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Real Estate Construction &amp; Financial Governance</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-black tracking-tight leading-[1.1]">
            Master Site Progress &amp; Financial Disbursements
          </h1>

          <p className="text-slate-600 text-lg sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
            Multi-tenant real estate workflow system with photo-verified progress reporting, immutable audit trails, and live balance aggregation.
          </p>
        </div>

        {/* Role Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link
                key={portal.title}
                href={portal.href}
                className="group relative bg-white border border-slate-200 hover:border-black rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-black group-hover:text-white flex items-center justify-center text-black transition-colors shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${portal.badgeColor}`}
                    >
                      {portal.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-2xl text-black tracking-tight group-hover:translate-x-0.5 transition-transform">
                    {portal.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal mt-2.5 leading-relaxed">
                    {portal.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>Enter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Demo Credentials Helper Card */}
        <div className="mt-16 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-black tracking-tight">
              Pre-Configured Demo Accounts (Password: <span className="font-mono font-semibold text-black">Password123!</span>)
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-normal">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="font-bold text-black block mb-1">👑 Admin</span>
              <span className="font-mono text-slate-700">admin@thecurve.com</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="font-bold text-black block mb-1">👷 Site Engineer</span>
              <span className="font-mono text-slate-700">engineer@thecurve.com</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="font-bold text-black block mb-1">🔨 Civil Contractor</span>
              <span className="font-mono text-slate-700">apex.contractor@thecurve.com</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="font-bold text-black block mb-1">📊 Project Owner</span>
              <span className="font-mono text-slate-700">owner@thecurve.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-semibold tracking-wide uppercase">
          THE CURVE WORK &amp; PAYMENT SYSTEM • ENTERPRISE REAL ESTATE MANAGEMENT
        </div>
      </footer>
    </main>
  );
}

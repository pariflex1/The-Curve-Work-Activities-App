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
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between overflow-x-hidden">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src="/the-curve-logo.webp"
              alt="The Curve Consultants"
              className="h-9 sm:h-12 w-auto object-contain"
            />
            <div>
              <span className="font-bold text-lg sm:text-2xl text-black tracking-tight block leading-none">
                THE CURVE
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500 font-semibold mt-0.5 sm:mt-1 block">
                Work &amp; Payments
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton />
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
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
                  className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold tracking-wide rounded-xl shadow-sm transition-all flex items-center gap-1.5 min-h-[38px] sm:min-h-[42px]"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold tracking-wide rounded-xl shadow-sm transition-all min-h-[38px] sm:min-h-[42px] flex items-center"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
        <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-black tracking-tight leading-tight">
            Site Progress &amp; Financial Disbursements
          </h1>
        </div>

        {/* Role Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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

        {/* Demo Credentials Card */}
        <div className="mt-8 sm:mt-16 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-3 sm:mb-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm sm:text-lg font-bold text-black tracking-tight">
              Demo Accounts (Password: <span className="font-mono font-semibold text-black">Password123!</span>)
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs font-normal">
            <div className="bg-slate-50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200">
              <span className="font-bold text-black block mb-0.5">Admin</span>
              <span className="font-mono text-slate-700 text-[11px] sm:text-xs truncate block">admin@thecurve.com</span>
            </div>
            <div className="bg-slate-50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200">
              <span className="font-bold text-black block mb-0.5">Site Engineer</span>
              <span className="font-mono text-slate-700 text-[11px] sm:text-xs truncate block">engineer@thecurve.com</span>
            </div>
            <div className="bg-slate-50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200">
              <span className="font-bold text-black block mb-0.5">Contractor</span>
              <span className="font-mono text-slate-700 text-[11px] sm:text-xs truncate block">apex.contractor@thecurve.com</span>
            </div>
            <div className="bg-slate-50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200">
              <span className="font-bold text-black block mb-0.5">Project Owner</span>
              <span className="font-mono text-slate-700 text-[11px] sm:text-xs truncate block">owner@thecurve.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wide uppercase">
          THE CURVE WORK &amp; PAYMENTS SYSTEM
        </div>
      </footer>
    </main>
  );
}

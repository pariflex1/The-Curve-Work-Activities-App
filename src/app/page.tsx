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
      badgeClass: "bg-slate-900 text-white",
    },
    {
      title: "Site Engineer",
      desc: "Unit inspections, contractor allocations & milestone tracking",
      href: "/employee",
      icon: Layers,
      badge: "Field Ops",
      badgeClass: "bg-blue-50 text-blue-900 border border-blue-200/60",
    },
    {
      title: "Contractor Portal",
      desc: "Assigned tasks & mobile photo verification reports",
      href: "/contractor",
      icon: HardHat,
      badge: "Execution",
      badgeClass: "bg-amber-50 text-amber-900 border border-amber-200/60",
    },
    {
      title: "Investor / Owner",
      desc: "Real-time construction progress & payment disbursements",
      href: "/owner",
      icon: Coins,
      badge: "Financials",
      badgeClass: "bg-emerald-50 text-emerald-900 border border-emerald-200/60",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f9fe] text-slate-900 flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Material 3 Top App Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/the-curve-logo.webp"
              alt="The Curve Consultants"
              className="h-9 sm:h-11 w-auto object-contain"
            />
            <div>
              <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight block leading-none">
                THE CURVE
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500 font-medium mt-0.5 sm:mt-1 block">
                Work &amp; Payments
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton className="py-2 px-4 rounded-full bg-[#FFE5CC] hover:bg-[#ffd9b3] text-[#933D00] text-xs font-medium border border-[#FFD4AA] transition-all android-ripple" />
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
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs sm:text-sm font-medium rounded-full shadow-md shadow-[#FF7903]/20 transition-all flex items-center gap-2 min-h-[38px] sm:min-h-[42px] android-ripple"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs sm:text-sm font-medium rounded-full shadow-md shadow-[#FF7903]/20 transition-all min-h-[38px] sm:min-h-[42px] flex items-center android-ripple"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
        <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-900 text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Android Material Design Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            Site Progress &amp; Financial Disbursements
          </h1>
        </div>

        {/* Role Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link
                key={portal.title}
                href={portal.href}
                className="group relative bg-white border border-slate-200/80 hover:border-slate-400 rounded-3xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between android-ripple"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-800 transition-colors shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-medium tracking-wide px-3 py-1 rounded-full ${portal.badgeClass}`}
                    >
                      {portal.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 tracking-tight group-hover:translate-x-0.5 transition-transform">
                    {portal.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal mt-2 leading-relaxed">
                    {portal.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>Enter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Demo Credentials Card */}
        <div className="mt-8 sm:mt-14 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Demo Accounts (Password: <span className="font-mono font-medium text-slate-900">Password123!</span>)
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#f8f9fe] p-3.5 sm:p-4 rounded-2xl border border-slate-200/70">
              <span className="font-semibold text-slate-900 block mb-0.5">Admin</span>
              <span className="font-mono text-slate-600 text-[11px] sm:text-xs truncate block">admin@thecurve.com</span>
            </div>
            <div className="bg-[#f8f9fe] p-3.5 sm:p-4 rounded-2xl border border-slate-200/70">
              <span className="font-semibold text-slate-900 block mb-0.5">Site Engineer</span>
              <span className="font-mono text-slate-600 text-[11px] sm:text-xs truncate block">engineer@thecurve.com</span>
            </div>
            <div className="bg-[#f8f9fe] p-3.5 sm:p-4 rounded-2xl border border-slate-200/70">
              <span className="font-semibold text-slate-900 block mb-0.5">Contractor</span>
              <span className="font-mono text-slate-600 text-[11px] sm:text-xs truncate block">apex.contractor@thecurve.com</span>
            </div>
            <div className="bg-[#f8f9fe] p-3.5 sm:p-4 rounded-2xl border border-slate-200/70">
              <span className="font-semibold text-slate-900 block mb-0.5">Project Owner</span>
              <span className="font-mono text-slate-600 text-[11px] sm:text-xs truncate block">owner@thecurve.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-5 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide uppercase">
          THE CURVE WORK &amp; PAYMENTS SYSTEM
        </div>
      </footer>
    </main>
  );
}

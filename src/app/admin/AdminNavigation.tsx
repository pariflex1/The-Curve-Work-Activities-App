"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  BookOpen,
  LogOut,
  Download,
} from "lucide-react";

import { signOut } from "@/app/auth/actions";
import PWAInstallButton from "@/components/PWAInstallButton";

interface AdminNavigationProps {
  adminName?: string;
}

export default function AdminNavigation({
  adminName = "Administrator",
}: AdminNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      isActive: pathname === "/admin",
    },
    {
      label: "Projects",
      href: "/admin/projects",
      icon: Building2,
      isActive: pathname.startsWith("/admin/projects"),
    },
    {
      label: "User Accounts",
      href: "/admin/users",
      icon: Users,
      isActive: pathname.startsWith("/admin/users"),
    },
    {
      label: "Activity",
      href: "/admin/activity-master",
      icon: FileSpreadsheet,
      isActive: pathname.startsWith("/admin/activity-master"),
    },
    {
      label: "Reports & Exports",
      href: "/admin/reports",
      icon: FileText,
      isActive: pathname.startsWith("/admin/reports"),
    },
    {
      label: "Audit & Logs",
      href: "/admin/audit-logs",
      icon: ShieldCheck,
      isActive: pathname.startsWith("/admin/audit-logs"),
    },
    {
      label: "User Manual",
      href: "/admin/manual",
      icon: BookOpen,
      isActive: pathname.startsWith("/admin/manual"),
    },
  ];


  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP: FIXED LEFT SIDEBAR (Hidden on mobile / tablet < lg)             */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-slate-200 z-40">
        {/* Header: Logo & Title */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3.5 bg-slate-50/50">
          <Link href="/admin" className="flex items-center gap-3.5 group">
            <img
              src="/the-curve-logo.webp"
              alt="The Curve Logo"
              className="h-11 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-tight">
                THE CURVE
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">
                Administration Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Buttons Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Main Navigation Section */}
          <div className="space-y-1.5">
            <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Menu Navigation
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                    item.isActive
                      ? "bg-black text-white shadow-sm shadow-slate-900/10"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${item.isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick App Actions */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Application
            </span>

            {/* Install App PWA Trigger Button */}
            <div className="pt-1">
              <PWAInstallButton className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all border border-blue-400/30 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Footer: Current User & Sign Out Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{adminName}</p>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">System Administrator</span>
            </div>
          </div>

          <form action={signOut} className="w-full">
            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-red-100"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE: TOP BAR & HORIZONTAL BUTTON CAROUSEL (Visible on < lg)            */}
      {/* ========================================================================= */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        {/* Mobile Top Header */}
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <img
              src="/the-curve-logo.webp"
              alt="The Curve Logo"
              className="h-8 w-auto object-contain"
            />
            <div>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight block leading-tight">
                THE CURVE
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                Administration Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <PWAInstallButton className="py-1.5 px-2.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1" />
            <form action={signOut}>
              <button
                type="submit"
                title="Sign Out"
                className="p-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Horizontal Scrolling Tabs Bar */}
        <div className="px-3 py-2 bg-slate-50/90 border-t border-slate-100 overflow-x-auto flex items-center gap-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                  item.isActive
                    ? "bg-black text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>
    </>
  );
}

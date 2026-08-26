"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Crown,
  FileSpreadsheet,
  Layers,
  Home,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Coins,
} from "lucide-react";
import PWAInstallButton from "@/components/PWAInstallButton";
import UserManualModal from "@/components/UserManualModal";
import { signOut } from "@/app/auth/actions";

interface AppShellProps {
  children: React.ReactNode;
  role: "admin" | "employee" | "contractor" | "owner";
  userName?: string | null;
  userEmail?: string | null;
}

export default function AppShell({
  children,
  role,
  userName,
  userEmail,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Define navigation items based on user role
  const navItems =
    role === "admin"
      ? [
          { name: "Overview", href: "/admin", icon: ShieldCheck },
          { name: "Projects Management", href: "/admin/projects", icon: Building2 },
          { name: "Activity Templates", href: "/admin/activity-master", icon: FileSpreadsheet },
          { name: "Audit Trail", href: "/admin/audit-logs", icon: Layers },
        ]
      : role === "employee"
      ? [
          { name: "Workspace", href: "/employee", icon: UserCheck },
        ]
      : role === "contractor"
      ? [
          { name: "Contractor Tasks", href: "/contractor", icon: Briefcase },
        ]
      : [
          { name: "Financial Portfolio", href: "/owner", icon: Crown },
        ];

  const roleTitle =
    role === "admin"
      ? "Administrator"
      : role === "employee"
      ? "Site Engineer"
      : role === "contractor"
      ? "Civil Contractor"
      : "Portfolio Owner";

  const roleBadgeColor =
    role === "admin"
      ? "bg-black text-white"
      : role === "employee"
      ? "bg-blue-600 text-white"
      : role === "contractor"
      ? "bg-amber-600 text-white"
      : "bg-purple-600 text-white";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* ========================================== */}
      {/* 1. DESKTOP SIDE MENU (Fixed Left Sidebar)   */}
      {/* ========================================== */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white shadow-sm z-30 justify-between p-6">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center text-white shadow-md shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-black tracking-tight block leading-none">
                THE CURVE
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1 block">
                Work &amp; Payment System
              </span>
            </div>
          </div>

          {/* User Profile Badge Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${roleBadgeColor}`}>
                {roleTitle}
              </span>
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 truncate">
                {userName || "User"}
              </p>
              {userEmail && (
                <p className="text-xs text-slate-500 truncate font-normal">{userEmail}</p>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Navigation Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? "bg-black text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-black"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? "text-white opacity-80" : "text-slate-300"}`} />
                </Link>
              );
            })}

            <Link
              href="/"
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                pathname === "/"
                  ? "bg-black text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-black"
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-slate-500" />
                <span>Landing Page</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-3 pt-6 border-t border-slate-100">
          <PWAInstallButton className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" />
          <UserManualModal role={role} triggerLabel="System Manual" />
          <form action={signOut}>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ========================================== */}
      {/* 2. MOBILE TOP MENU (Sticky Mobile Header)  */}
      {/* ========================================== */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-sm shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base text-black tracking-tight block leading-none">
              THE CURVE
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mt-0.5">
              {roleTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[57px] bottom-0 z-30 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border-b border-slate-200 p-5 space-y-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4 shadow-2xl">
            {/* User Info Header */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900">{userName || "User"}</p>
                <p className="text-xs text-slate-500 font-normal">{userEmail}</p>
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${roleBadgeColor}`}>
                {roleTitle}
              </span>
            </div>

            {/* Navigation Items */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">
                Menu Links
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-black text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </Link>
                );
              })}

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-slate-500" />
                  <span>Landing Page</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <UserManualModal role={role} triggerLabel="Open User Manual" />
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. MAIN CONTENT AREA (Offset for Sidebar)  */}
      {/* ========================================== */}
      <main className="flex-1 lg:pl-72 min-h-screen">{children}</main>
    </div>
  );
}

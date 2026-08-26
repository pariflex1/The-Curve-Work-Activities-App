import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Layers,
  Home,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  ChevronRight,
  LogOut,
  UserPlus,
} from "lucide-react";
import UserManualModal from "@/components/UserManualModal";
import UserManagementModal from "./users/UserManagementModal";
import PWAInstallButton from "@/components/PWAInstallButton";
import AdminWorkPaymentConsole from "./AdminWorkPaymentConsole";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile, metrics, and detailed project hierarchy concurrently
  const [
    { data: profile },
    { count: projectCount },
    { count: blockCount },
    { count: unitCount },
    { data: allProfiles, count: userCount },
    { data: projectsData },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("blocks").select("*", { count: "exact", head: true }),
    supabase.from("units").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select(`
        id,
        name,
        status,
        location,
        blocks (
          id,
          name,
          sort_order,
          units (
            id,
            unit_number,
            floor,
            unit_type,
            status,
            unit_activities (
              id,
              estimated_cost,
              progress_percentage,
              status,
              activity_master ( id, name, category ),
              project_contractors (
                id,
                company_name,
                profiles ( full_name )
              ),
              payments (
                id,
                amount,
                paid_to,
                payment_date,
                payment_type
              )
            )
          )
        ),
        project_contractors (
          id,
          company_name,
          profiles ( full_name )
        )
      `)
      .order("created_at", { ascending: false }),
  ]);



  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="/the-curve-logo.webp"
              alt="The Curve Logo"
              className="h-12 w-auto object-contain shrink-0"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
                Administration Portal
              </h1>

              <p className="text-sm font-normal text-slate-500 mt-1">
                Welcome, <strong className="text-black font-semibold">{profile?.full_name || "Admin"}</strong> — Master System Architecture &amp; Governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <PWAInstallButton />
            <UserManagementModal profiles={allProfiles || []} triggerLabel="Manage Accounts" />
            <UserManualModal role="admin" />
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors min-h-[42px] flex items-center"
            >
              Home
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-semibold transition-colors min-h-[42px] flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/admin/projects"
            className="bg-white border border-slate-200 hover:border-black rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-black transition-colors">
                Total Projects
              </span>
              <div className="p-2.5 bg-slate-100 group-hover:bg-black group-hover:text-white text-black rounded-xl transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-4xl sm:text-5xl font-bold text-black tracking-tight">{projectCount ?? 0}</p>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-500 font-normal mt-3">Active &amp; completed sites</p>
          </Link>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Total Blocks
              </span>
              <div className="p-2.5 bg-slate-100 text-black rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl sm:text-5xl font-bold text-black tracking-tight">{blockCount ?? 0}</p>
            <p className="text-xs text-slate-500 font-normal mt-3">Nested under active projects</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Total Units
              </span>
              <div className="p-2.5 bg-slate-100 text-black rounded-xl">
                <Home className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl sm:text-5xl font-bold text-black tracking-tight">{unitCount ?? 0}</p>
            <p className="text-xs text-slate-500 font-normal mt-3">Across all project blocks</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Active Profiles
              </span>
              <div className="p-2.5 bg-slate-100 text-black rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl sm:text-5xl font-bold text-black tracking-tight">{userCount ?? 0}</p>
            <p className="text-xs text-slate-500 font-normal mt-3">Employees, contractors, owners</p>
          </div>
        </div>

        {/* Work Activities & Disbursement Interactive Console */}
        {projectsData && projectsData.length > 0 && (
          <AdminWorkPaymentConsole projects={(projectsData as any) || []} />
        )}

        {/* Management Modules */}
        <div className="space-y-6">

          <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
            Management Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-black flex items-center justify-center mb-5">
                  <UserPlus className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-black tracking-tight">
                  User Accounts &amp; Teams
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-2 leading-relaxed">
                  Create and manage accounts for Site Engineers, Contractors, and Owners. Issue mobile login credentials.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <UserManagementModal profiles={allProfiles || []} triggerLabel="Open User Directory" />
              </div>
            </div>

            <Link
              href="/admin/activity-master"
              className="bg-white border border-slate-200 hover:border-black rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-black group-hover:bg-black group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-black tracking-tight group-hover:translate-x-0.5 transition-transform">
                  Activity Master Templates
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-2 leading-relaxed">
                  Manage reusable construction activity templates, codes, and standard measurement units.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-black uppercase tracking-wider">
                <span>Manage Templates</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>


            <Link
              href="/admin/audit-logs"
              className="bg-white border border-slate-200 hover:border-black rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-black group-hover:bg-black group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-black tracking-tight group-hover:translate-x-0.5 transition-transform">
                  System Audit Trail &amp; Logs
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-2 leading-relaxed">
                  View immutable chronological audit trail across all contractor reassignments, payments, and lifecycle events.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-black uppercase tracking-wider">
                <span>View Audit Logs</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

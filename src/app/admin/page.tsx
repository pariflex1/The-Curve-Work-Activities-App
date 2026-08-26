import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Layers,
  Home,
  Users,
  Shield,
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Fetch quick metrics
  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  const { count: blockCount } = await supabase
    .from("blocks")
    .select("*", { count: "exact", head: true });

  const { count: unitCount } = await supabase
    .from("units")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Administration Portal
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back, <span className="text-white font-medium">{profile?.full_name}</span> — Master Operations &amp; Configuration
            </p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/projects"
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group shadow-xl hover:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors">
                Projects
              </span>
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-white">{projectCount ?? 0}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span>Manage sites &amp; hierarchy</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </p>
          </Link>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Blocks &amp; Towers
              </span>
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-white">{blockCount ?? 0}</p>
            <p className="text-xs text-slate-500 mt-2">Nested under active projects</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Total Units
              </span>
              <Home className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white">{unitCount ?? 0}</p>
            <p className="text-xs text-slate-500 mt-2">Across all project blocks</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Active Profiles
              </span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{userCount ?? 0}</p>
            <p className="text-xs text-slate-500 mt-2">Employees, contractors, owners</p>
          </div>
        </div>

        {/* Quick Nav Modules */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Management Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/admin/projects"
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all shadow-md group"
            >
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 w-fit mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Project &amp; Team Hierarchy
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Configure projects, create structural blocks, add units, and assign employee/contractor teams.
              </p>
            </Link>

            <Link
              href="/admin/activity-master"
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all shadow-md group"
            >
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 w-fit mb-4">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                Activity Master Templates
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Manage reusable construction activity templates and standard units (Phase 4).
              </p>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all shadow-md group"
            >
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 w-fit mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                System Audit Logs
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                View immutable chronological audit trail across all actions and reassignments (Phase 9).
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

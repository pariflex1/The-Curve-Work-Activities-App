import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, Briefcase, ChevronRight, UserCheck } from "lucide-react";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboard() {
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

  // Query projects scoped to this employee via RLS
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      blocks (
        id,
        name,
        units ( id )
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <AppShell role="employee" userName={profile?.full_name} userEmail={user.email}>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Employee Workspace
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Welcome, <strong className="text-slate-800">{profile?.full_name || "Employee"}</strong> — Assigned Projects &amp; Field Operations
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>My Assigned Projects ({projects?.length || 0})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {projects && projects.length > 0 ? (
              projects.map((project) => {
                const totalBlocks = project.blocks?.length || 0;
                const totalUnits =
                  project.blocks?.reduce(
                    (acc: number, b: any) => acc + (b.units?.length || 0),
                    0
                  ) || 0;

                const statusBadge =
                  project.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200";

                return (
                  <div
                    key={project.id}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full border capitalize font-semibold ${statusBadge}`}
                        >
                          {project.status.replace("_", " ")}
                        </span>
                      </div>

                      {project.location && (
                        <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5 mb-5">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{project.location}</span>
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6 text-center">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Blocks</p>
                          <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">{totalBlocks}</p>
                        </div>
                        <div className="border-l border-slate-200">
                          <p className="text-xs text-slate-500 font-medium">Units</p>
                          <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">{totalUnits}</p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/employee/projects/${project.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-700 flex items-center justify-center gap-2 font-semibold transition-all text-xs sm:text-sm min-h-[44px]"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Manage Unit Contractors</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-6 shadow-sm">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Projects Assigned</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mt-1">
                  Contact an administrator to get assigned to active development projects.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}


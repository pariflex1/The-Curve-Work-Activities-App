import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, Layers, Briefcase, ChevronRight, UserCheck, LogOut, Globe, Home } from "lucide-react";
import UserManualModal from "@/components/UserManualModal";
import PWAInstallButton from "@/components/PWAInstallButton";
import { getEmployeeHierarchy, filterAccessibleBlocksAndUnits } from "@/utils/hierarchy";

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
  const { data: rawProjects } = await supabase
    .from("projects")
    .select(`
      *,
      blocks (
        id,
        name,
        units ( id, unit_number )
      )
    `)
    .order("created_at", { ascending: false });

  // Fetch hierarchy permissions for each project
  const projects = await Promise.all(
    (rawProjects || []).map(async (project) => {
      const hierarchy = await getEmployeeHierarchy(supabase, project.id, profile?.id || "");
      const accessibleBlocks = filterAccessibleBlocksAndUnits(project.blocks || [], hierarchy);
      return {
        ...project,
        hierarchy,
        accessibleBlocks,
      };
    })
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-2 sm:p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/the-curve-logo.webp"
              alt="The Curve Logo"
              className="h-9 sm:h-11 w-auto object-contain shrink-0"
            />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                Site Operations &amp; Supervision
              </h1>
              <p className="text-xs text-slate-500">
                {profile?.full_name || "Site Engineer"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <PWAInstallButton />
            <form action={signOut}>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors min-h-[38px] flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Assigned Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>My Supervised Projects ({projects.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {projects && projects.length > 0 ? (
              projects.map((project) => {
                const totalBlocks = project.accessibleBlocks?.length || 0;
                const totalUnits =
                  project.accessibleBlocks?.reduce(
                    (acc: number, b: any) => acc + (b.units?.length || 0),
                    0
                  ) || 0;

                const statusBadge =
                  project.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200";

                const accessLevel = project.hierarchy?.access_level || "full_project";

                return (
                  <div
                    key={project.id}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full border capitalize font-semibold ${statusBadge}`}
                        >
                          {project.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Hierarchy Scope Indicator */}
                      <div className="mb-3">
                        {accessLevel === "full_project" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Globe className="w-3 h-3 text-emerald-600" /> Full Project Supervised
                          </span>
                        )}
                        {accessLevel === "block_level" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <Layers className="w-3 h-3 text-blue-600" /> {project.hierarchy?.block_ids?.length || 0} Block(s) Assigned
                          </span>
                        )}
                        {accessLevel === "unit_level" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                            <Home className="w-3 h-3 text-purple-600" /> {project.hierarchy?.unit_ids?.length || 0} Unit(s) Assigned
                          </span>
                        )}
                      </div>

                      {project.location && (
                        <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5 mb-5">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{project.location}</span>
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6 text-center">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Accessible Blocks</p>
                          <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">{totalBlocks}</p>
                        </div>
                        <div className="border-l border-slate-200">
                          <p className="text-xs text-slate-500 font-medium">Accessible Units</p>
                          <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">{totalUnits}</p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/employee/projects/${project.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FFE5CC] border border-[#FFD4AA] hover:bg-[#FF7903] hover:text-white text-[#933D00] flex items-center justify-center gap-2 font-semibold transition-all text-xs sm:text-sm min-h-[44px] cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Manage Site Units</span>
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
    </main>
  );
}

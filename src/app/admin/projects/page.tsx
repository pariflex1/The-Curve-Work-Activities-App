import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Layers, Users, ChevronRight, Sparkles, Plus, Coins } from "lucide-react";
import ProjectFormModal from "./ProjectFormModal";
import PaymentFormModal from "@/app/admin/payments/PaymentFormModal";
import UserManualModal from "@/components/UserManualModal";
import PWAInstallButton from "@/components/PWAInstallButton";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = await createClient();

  // Fetch all projects with their blocks and unit counts
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      blocks (
        id,
        name,
        units ( id )
      ),
      project_employees ( id ),
      project_contractors ( id ),
      project_owners ( id )
    `)
    .order("created_at", { ascending: false });

  const activeCount = projects?.filter((p) => p.status === "active").length || 0;
  const onHoldCount = projects?.filter((p) => p.status === "on_hold").length || 0;
  const completedCount = projects?.filter((p) => p.status === "completed").length || 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link
              href="/admin"
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900 shrink-0 min-h-[40px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-black shrink-0" />
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Projects Management
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
                Manage construction sites, structural blocks, unit inventories, and team allocations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            <PWAInstallButton />
            <UserManualModal role="admin" />
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors min-h-[40px] flex items-center"
            >
              Home
            </Link>
            <ProjectFormModal />
          </div>

        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Active Projects</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{activeCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-amber-700">On Hold</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{onHoldCount}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-blue-700">Completed</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{completedCount}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects && projects.length > 0 ? (
            projects.map((project) => {
              const totalBlocks = project.blocks?.length || 0;
              const totalUnits =
                project.blocks?.reduce(
                  (acc: number, b: any) => acc + (b.units?.length || 0),
                  0
                ) || 0;
              const totalTeam =
                (project.project_employees?.length || 0) +
                (project.project_contractors?.length || 0) +
                (project.project_owners?.length || 0);

              const statusBadge =
                project.status === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : project.status === "on_hold"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : project.status === "completed"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-100 text-slate-700 border-slate-200";

              return (
                <div
                  key={project.id}
                  className="bg-white border border-slate-200 hover:border-black rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
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
                      <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5 mb-5 font-normal">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6 text-center">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Blocks</p>
                        <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{totalBlocks}</p>
                      </div>
                      <div className="border-x border-slate-200">
                        <p className="text-xs text-slate-500 font-medium">Units</p>
                        <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{totalUnits}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Team</p>
                        <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{totalTeam}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <PaymentFormModal
                      projectId={project.id}
                      triggerLabel="Pay"
                    />

                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-black border border-slate-200 hover:border-black text-slate-700 hover:text-white flex items-center justify-center gap-1.5 font-semibold transition-all text-xs min-h-[40px]"
                    >
                      <span>Manage Hierarchy &amp; Team</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm p-6">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Projects Found</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mt-1 mb-6">
                Get started by creating your first construction project to structure blocks and units.
              </p>
              <ProjectFormModal triggerLabel="Create First Project" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Building2, Plus, MapPin, Layers, Users, ChevronRight, Sparkles } from "lucide-react";
import ProjectFormModal from "./ProjectFormModal";

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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-7 h-7 text-emerald-400" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Projects Management
                </h1>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Manage construction sites, structural blocks, unit inventories, and team allocations
              </p>
            </div>
          </div>

          <ProjectFormModal />
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Active Projects</p>
              <p className="text-3xl font-bold text-white mt-1">{activeCount}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-amber-400">On Hold</p>
              <p className="text-3xl font-bold text-white mt-1">{onHoldCount}</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-cyan-400">Completed</p>
              <p className="text-3xl font-bold text-white mt-1">{completedCount}</p>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
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

              const statusColor =
                project.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : project.status === "on_hold"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : project.status === "completed"
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                  : "bg-slate-500/10 text-slate-400 border-slate-500/30";

              return (
                <div
                  key={project.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all shadow-xl hover:shadow-2xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {project.name}
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border capitalize font-medium ${statusColor}`}
                      >
                        {project.status.replace("_", " ")}
                      </span>
                    </div>

                    {project.location && (
                      <p className="text-slate-400 text-sm flex items-center gap-1.5 mb-5">
                        <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 rounded-xl border border-white/5 mb-6 text-center">
                      <div>
                        <p className="text-xs text-slate-400">Blocks</p>
                        <p className="text-lg font-bold text-white mt-0.5">{totalBlocks}</p>
                      </div>
                      <div className="border-x border-white/5">
                        <p className="text-xs text-slate-400">Units</p>
                        <p className="text-lg font-bold text-white mt-0.5">{totalUnits}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Team</p>
                        <p className="text-lg font-bold text-white mt-0.5">{totalTeam}</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 flex items-center justify-center gap-2 font-medium transition-all text-sm group-hover:shadow-md"
                  >
                    <span>Manage Hierarchy & Team</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-300">No Projects Found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1 mb-6">
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

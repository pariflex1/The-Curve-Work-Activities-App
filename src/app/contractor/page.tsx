import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Home,
  CheckCircle2,
  Clock,
  Layers,
  Building2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContractorDashboard() {
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

  // Fetch unit activities assigned to this contractor via RLS
  const { data: assignedActivities } = await supabase
    .from("unit_activities")
    .select(`
      *,
      activity_master (
        id,
        name,
        code,
        category,
        default_unit
      ),
      units (
        id,
        unit_number,
        floor,
        unit_type,
        blocks (
          id,
          name,
          projects (
            id,
            name,
            location
          )
        )
      )
    `)
    .order("status", { ascending: false });

  // Group activities by Unit
  const activitiesByUnit: Record<string, any[]> = {};
  (assignedActivities || []).forEach((act) => {
    const uId = act.unit_id;
    if (!activitiesByUnit[uId]) {
      activitiesByUnit[uId] = [];
    }
    activitiesByUnit[uId].push(act);
  });

  const totalAssigned = assignedActivities?.length || 0;
  const inProgressCount =
    assignedActivities?.filter((a) => a.status === "in_progress").length || 0;
  const completedCount =
    assignedActivities?.filter((a) => a.status === "completed").length || 0;
  const pendingCount =
    assignedActivities?.filter((a) => a.status === "pending").length || 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Contractor "My Work" Dashboard
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Welcome, <span className="text-white font-medium">{profile?.full_name}</span> — Assigned Activities &amp; Daily Progress Execution
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

        {/* Status Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Work Items</p>
            <p className="text-3xl font-bold text-white mt-1">{totalAssigned}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-amber-400">Pending</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-cyan-400">In Progress</p>
            <p className="text-3xl font-bold text-cyan-400 mt-1">{inProgressCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Completed</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{completedCount}</p>
          </div>
        </div>

        {/* Work Grouped by Unit */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-400" />
            <span>Assigned Tasks Grouped by Unit</span>
          </h2>

          <div className="space-y-6">
            {Object.keys(activitiesByUnit).length > 0 ? (
              Object.entries(activitiesByUnit).map(([uId, acts]) => {
                const sampleUnit = acts[0]?.units;
                const projectName = sampleUnit?.blocks?.projects?.name || "Project";
                const blockName = sampleUnit?.blocks?.name || "Block";
                const unitNumber = sampleUnit?.unit_number || "Unit";

                return (
                  <div
                    key={uId}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{projectName}</span>
                          <span className="text-slate-600">•</span>
                          <span>{blockName}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mt-1">
                          Unit {unitNumber} {sampleUnit?.floor ? `(${sampleUnit.floor})` : ""}
                        </h3>
                      </div>
                      <span className="text-xs px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-semibold w-fit">
                        {acts.length} Assigned Task(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {acts.map((act) => (
                        <div
                          key={act.id}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                                {act.activity_master?.name}
                              </h4>
                              <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-white/5 border border-white/10 text-slate-300">
                                {act.status.replace("_", " ")}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-400 mt-2">
                              <p className="flex justify-between">
                                <span>Category:</span>
                                <span className="text-slate-300">{act.activity_master?.category || "General"}</span>
                              </p>
                              {act.remarks && (
                                <p className="text-slate-400 italic text-xs mt-1 bg-black/20 p-2 rounded-lg">
                                  "{act.remarks}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="pt-4 mt-3 border-t border-white/5 space-y-3">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Current Progress</span>
                                <span className="text-amber-400 font-mono font-bold">{act.progress_percentage}%</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all"
                                  style={{ width: `${act.progress_percentage}%` }}
                                />
                              </div>
                            </div>

                            <Link
                              href={`/contractor/work/${act.id}`}
                              className="w-full py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <span>Update Progress &amp; Photos</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 p-6">
                <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-300">No Work Items Assigned Yet</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1">
                  Once an employee assigns activities to your company, they will appear here grouped by unit.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

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
  LogOut,
  Eye,
} from "lucide-react";
import UserManualModal from "@/components/UserManualModal";
import PWAInstallButton from "@/components/PWAInstallButton";

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
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/the-curve-logo.webp"
              alt="The Curve Logo"
              className="h-10 sm:h-12 w-auto object-contain shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Contractor Portal
                </h1>

                <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                  Read-Only
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
                Welcome, <strong className="text-black font-semibold">{profile?.full_name || "Contractor"}</strong> — View assigned tasks, verified progress &amp; site inspections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <PWAInstallButton />
            <UserManualModal role="contractor" triggerLabel="Contractor Guide" />
            <form action={signOut}>

              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-semibold transition-colors min-h-[40px] flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Total Work Items</p>
            <p className="text-2xl sm:text-3xl font-bold text-black mt-1">{totalAssigned}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-amber-700">Pending</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-blue-700">In Progress</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Completed</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          </div>
        </div>

        {/* Work Grouped by Unit */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Home className="w-5 h-5 text-black" />
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
                    className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{projectName}</span>
                          <span className="text-slate-300">•</span>
                          <span>{blockName}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                          Unit {unitNumber} {sampleUnit?.floor ? `(${sampleUnit.floor})` : ""}
                        </h3>
                      </div>
                      <span className="text-xs px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-full font-semibold w-fit">
                        {acts.length} Assigned Task(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {acts.map((act) => {
                        const statusBadge =
                          act.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : act.status === "in_progress"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-700 border-slate-200";

                        return (
                          <div
                            key={act.id}
                            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-black transition-all flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-black transition-colors">
                                  {act.activity_master?.name}
                                </h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold border ${statusBadge}`}>
                                  {act.status.replace("_", " ")}
                                </span>
                              </div>

                              <div className="space-y-1 text-xs text-slate-600 mt-2 font-normal">
                                <p className="flex justify-between">
                                  <span className="text-slate-500">Category:</span>
                                  <span className="font-semibold text-slate-800">{act.activity_master?.category || "General"}</span>
                                </p>
                                {act.remarks && (
                                  <p className="text-slate-700 italic text-xs mt-1 bg-white p-2 rounded-lg border border-slate-200">
                                    "{act.remarks}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="pt-3 mt-3 border-t border-slate-200 space-y-3">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-slate-500 font-medium">Verified Progress</span>
                                  <span className="text-black font-mono font-bold">{act.progress_percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-black h-full rounded-full transition-all"
                                    style={{ width: `${act.progress_percentage}%` }}
                                  />
                                </div>
                              </div>

                              <Link
                                href={`/contractor/work/${act.id}`}
                                className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-black hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[38px]"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Inspection Details</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-6 shadow-sm">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Work Items Assigned Yet</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mt-1 font-normal">
                  Once an engineer assigns activities to your company, they will appear here grouped by unit.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

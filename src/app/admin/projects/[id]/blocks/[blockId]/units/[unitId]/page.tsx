import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Home,
  Layers,
  Sparkles,
  Copy,
  Plus,
  Coins,
  FileCheck2,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";
import ProvisionModal from "./ProvisionModal";
import EditCostModal from "./EditCostModal";

export const dynamic = "force-dynamic";

interface UnitActivityPageProps {
  params: Promise<{ id: string; blockId: string; unitId: string }>;
}

export default async function UnitActivitiesPage({ params }: UnitActivityPageProps) {
  const { id: projectId, blockId, unitId } = await params;
  const supabase = await createClient();

  // Fetch unit with block and project
  const { data: unit } = await supabase
    .from("units")
    .select(`
      *,
      blocks (
        id,
        name,
        projects (
          id,
          name
        )
      )
    `)
    .eq("id", unitId)
    .single();

  if (!unit) {
    notFound();
  }

  // Fetch unit activities with activity_master and contractor
  const { data: unitActivities } = await supabase
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
      project_contractors (
        id,
        company_name,
        profiles ( full_name )
      )
    `)
    .eq("unit_id", unitId)
    .order("sort_order", { ascending: true });

  // Fetch active activity masters for "From Template" mode
  const { data: activeMasters } = await supabase
    .from("activity_master")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Fetch all other units in this project for "Copy from Unit" mode
  const { data: otherUnits } = await supabase
    .from("units")
    .select(`
      id,
      unit_number,
      blocks!inner (
        name,
        project_id
      ),
      unit_activities ( count )
    `)
    .eq("blocks.project_id", projectId)
    .neq("id", unitId);

  const totalEstimatedCost =
    unitActivities?.reduce((acc, a) => acc + (Number(a.estimated_cost) || 0), 0) || 0;

  const existingMasterIds = (unitActivities || []).map((a) => a.activity_master_id);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/projects/${projectId}/blocks/${blockId}`}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>{unit.blocks?.projects?.name}</span>
                <span className="text-slate-600">/</span>
                <span>{unit.blocks?.name}</span>
              </div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mt-1">
                <Home className="w-7 h-7 text-emerald-400" />
                <span>Unit {unit.unit_number} — Activity Checklist</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}/progress`}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-sm font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Live Progress Dashboard</span>
            </Link>

            <ProvisionModal
              unitId={unitId}
              projectId={projectId}
              blockId={blockId}
              activeMasters={activeMasters || []}
              existingMasterIds={existingMasterIds}
              otherUnits={(otherUnits || []).map((u: any) => ({
                id: u.id,
                unit_number: u.unit_number,
                block_name: u.blocks?.name,
                activityCount: u.unit_activities?.[0]?.count || 0,
              }))}
            />
          </div>
        </div>

        {/* Unit Info & Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Unit Type &amp; Specs</p>
            <p className="text-xl font-bold text-white mt-1">
              {unit.unit_type || "Standard"} {unit.floor ? `(${unit.floor})` : ""}
            </p>
            <p className="text-xs text-slate-500 mt-1">{unit.area ? `${unit.area} sq.ft` : "Area not specified"}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-cyan-400">Total Activities</p>
            <p className="text-3xl font-bold text-cyan-400 mt-1">{unitActivities?.length || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Provisioned tasks</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Total Estimated Cost</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">₹{totalEstimatedCost.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500 mt-1">Sum of activity estimates</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-amber-400">Unit Status</p>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase">
              {unit.status}
            </span>
          </div>
        </div>

        {/* Unit Activities Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              <span>Assigned Work Activities</span>
            </h2>
            <span className="text-xs text-slate-400">
              Each unit's activities are strictly independent copies
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Sort</th>
                  <th className="px-6 py-4">Activity</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Estimated Cost</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {unitActivities && unitActivities.length > 0 ? (
                  unitActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        #{act.sort_order}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{act.activity_master?.name}</p>
                        {act.remarks && (
                          <p className="text-xs text-slate-400 mt-0.5">{act.remarks}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs border border-purple-500/20">
                          {act.activity_master?.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-400">
                        ₹{Number(act.estimated_cost || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all"
                              style={{ width: `${act.progress_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono">{act.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs capitalize bg-white/5 border border-white/10 font-medium text-slate-300">
                          {act.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <EditCostModal
                          activity={act}
                          projectId={projectId}
                          blockId={blockId}
                          unitId={unitId}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-300 font-semibold text-base">No Activities Provisioned Yet</p>
                      <p className="text-slate-500 text-xs mt-1 mb-5">
                        Populate this unit by selecting from master templates or cloning an existing unit's checklist.
                      </p>
                      <ProvisionModal
                        unitId={unitId}
                        projectId={projectId}
                        blockId={blockId}
                        activeMasters={activeMasters || []}
                        existingMasterIds={existingMasterIds}
                        otherUnits={(otherUnits || []).map((u: any) => ({
                          id: u.id,
                          unit_number: u.unit_number,
                          block_name: u.blocks?.name,
                          activityCount: u.unit_activities?.[0]?.count || 0,
                        }))}
                        triggerLabel="Provision Activities Now"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Home,
  Layers,
  Sparkles,
  Coins,
  FileCheck2,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";
import ProvisionModal from "./ProvisionModal";
import ActivityEditModal from "@/components/ActivityEditModal";

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

  // Fetch project contractors
  const { data: projectContractors } = await supabase
    .from("project_contractors")
    .select(`
      id,
      company_name,
      profiles ( full_name )
    `)
    .eq("project_id", projectId);

  const totalEstimatedCost =
    unitActivities?.reduce((acc, a) => acc + (Number(a.estimated_cost) || 0), 0) || 0;

  const existingMasterIds = (unitActivities || []).map((a) => a.activity_master_id);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Breadcrumb Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link
              href={`/admin/projects/${projectId}/blocks/${blockId}`}
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900 shrink-0 min-h-[40px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium flex-wrap">
                <span>{unit.blocks?.projects?.name}</span>
                <span className="text-slate-300">/</span>
                <span>{unit.blocks?.name}</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2 mt-1">
                <Home className="w-6 h-6 text-black shrink-0" />
                <span>Unit {unit.unit_number} — Activity Checklist</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <Link
              href={`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}/progress`}
              className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-black hover:bg-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors min-h-[40px]"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Unit Type &amp; Specs</p>
            <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              {unit.unit_type || "Standard"} {unit.floor ? `(${unit.floor})` : ""}
            </p>
            <p className="text-xs text-slate-500 mt-1">{unit.area ? `${unit.area} sq.ft` : "Area not specified"}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-black">Total Activities</p>
            <p className="text-2xl sm:text-3xl font-bold text-black mt-1">{unitActivities?.length || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Provisioned tasks</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Total Estimated Cost</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">₹{totalEstimatedCost.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500 mt-1">Sum of activity estimates</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Unit Status</p>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold uppercase">
              {unit.status}
            </span>
          </div>
        </div>

        {/* Unit Activities Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-black" />
              <span>Assigned Work Activities</span>
            </h2>
            <span className="text-xs text-slate-500">
              Admin can update progress %, status, costs, and contractor assignments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Sort</th>
                  <th className="px-5 py-3.5">Activity</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Assigned Contractor</th>
                  <th className="px-5 py-3.5">Estimated Cost</th>
                  <th className="px-5 py-3.5">Progress</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {unitActivities && unitActivities.length > 0 ? (
                  unitActivities.map((act) => {
                    const statusBadge =
                      act.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : act.status === "in_progress"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-700 border-slate-200";

                    return (
                      <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-slate-400">
                          #{act.sort_order}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{act.activity_master?.name}</p>
                          {act.remarks && (
                            <p className="text-xs text-slate-500 mt-0.5">{act.remarks}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full text-xs font-medium border border-slate-200">
                            {act.activity_master?.category || "General"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {act.project_contractors ? (
                            <span className="font-semibold text-slate-900">
                              {act.project_contractors.company_name}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900 font-mono">
                          ₹{Number(act.estimated_cost || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-black h-full rounded-full transition-all"
                                style={{ width: `${act.progress_percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-black font-mono">{act.progress_percentage}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize border font-semibold ${statusBadge}`}>
                            {act.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <ActivityEditModal
                            activity={act}
                            projectId={projectId}
                            unitId={unitId}
                            blockId={blockId}
                            contractors={projectContractors || []}
                            allowDelete={true}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-800 font-bold text-base">No Activities Provisioned Yet</p>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 mb-5">
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

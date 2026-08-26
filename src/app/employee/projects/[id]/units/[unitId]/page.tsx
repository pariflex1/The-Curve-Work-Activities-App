import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Home, Building2, Briefcase, FileCheck2, Sparkles, ClipboardCheck } from "lucide-react";
import ContractorSelect from "./ContractorSelect";
import ProvisionModal from "@/app/admin/projects/[id]/blocks/[blockId]/units/[unitId]/ProvisionModal";
import ActivityEditModal from "@/components/ActivityEditModal";
import InspectionReportModal from "@/components/InspectionReportModal";

export const dynamic = "force-dynamic";

interface EmployeeUnitPageProps {
  params: Promise<{ id: string; unitId: string }>;
}

export default async function EmployeeUnitPage({ params }: EmployeeUnitPageProps) {
  const { id: projectId, unitId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch unit details
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

  if (!unit) notFound();

  // Fetch activities, contractors, active masters, and other units concurrently
  const [
    { data: activities },
    { data: projectContractors },
    { data: activeMasters },
    { data: otherUnits },
  ] = await Promise.all([
    supabase
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
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_contractors")
      .select(`
        id,
        company_name,
        profiles ( full_name )
      `)
      .eq("project_id", projectId),
    supabase
      .from("activity_master")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
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
      .neq("id", unitId),
  ]);


  const existingMasterIds = (activities || []).map((a) => a.activity_master_id);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link
              href={`/employee/projects/${projectId}`}
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
                <span>Unit {unit.unit_number} — Site Inspection &amp; Activities</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <ProvisionModal
              unitId={unitId}
              projectId={projectId}
              blockId={unit.blocks?.id || ""}
              activeMasters={activeMasters || []}
              existingMasterIds={existingMasterIds}
              otherUnits={(otherUnits || []).map((u: any) => ({
                id: u.id,
                unit_number: u.unit_number,
                block_name: u.blocks?.name,
                activityCount: u.unit_activities?.[0]?.count || 0,
              }))}
              triggerLabel="Add Activities"
            />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Total Activities</p>
            <p className="text-2xl sm:text-3xl font-bold text-black mt-1">{activities?.length || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-blue-700">Available Contractors</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{projectContractors?.length || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Unit Type</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{unit.unit_type || "Standard"}</p>
          </div>
        </div>

        {/* Activities Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-black" />
              <span>Site Inspection &amp; Progress Verification Checklist</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Inspect contractor work on site and submit photo-verified progress reports
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Sort</th>
                  <th className="px-5 py-3.5">Activity Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Assigned Contractor</th>
                  <th className="px-5 py-3.5">Verified Progress</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {activities && activities.length > 0 ? (
                  activities.map((act) => {
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
                            <p className="text-xs text-slate-500 font-normal mt-0.5">{act.remarks}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full text-xs font-medium border border-slate-200">
                            {act.activity_master?.category || "General"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <ContractorSelect
                            unitActivityId={act.id}
                            currentContractorId={act.contractor_id}
                            contractors={projectContractors || []}
                            projectId={projectId}
                            unitId={unitId}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
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
                          <div className="flex items-center justify-end gap-1.5">
                            <InspectionReportModal
                              unitActivityId={act.id}
                              activityName={act.activity_master?.name || "Activity"}
                              category={act.activity_master?.category}
                              currentProgress={Number(act.progress_percentage) || 0}
                              currentStatus={act.status}
                              contractorName={act.project_contractors?.company_name}
                              triggerLabel="Inspect"
                            />
                            <ActivityEditModal
                              activity={act}
                              projectId={projectId}
                              unitId={unitId}
                              blockId={unit.blocks?.id}
                              contractors={projectContractors || []}
                              allowDelete={false}
                              triggerLabel="Edit"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-800 font-bold text-base">No Activities Provisioned Yet</p>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 mb-5">
                        Add activities to this unit using template catalogs or custom tasks.
                      </p>
                      <ProvisionModal
                        unitId={unitId}
                        projectId={projectId}
                        blockId={unit.blocks?.id || ""}
                        activeMasters={activeMasters || []}
                        existingMasterIds={existingMasterIds}
                        otherUnits={(otherUnits || []).map((u: any) => ({
                          id: u.id,
                          unit_number: u.unit_number,
                          block_name: u.blocks?.name,
                          activityCount: u.unit_activities?.[0]?.count || 0,
                        }))}
                        triggerLabel="Add Activities Now"
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

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Home, Building2, Briefcase, FileCheck2, Coins, ChevronRight } from "lucide-react";
import ContractorSelect from "./ContractorSelect";

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

  // Fetch activities for this unit
  const { data: activities } = await supabase
    .from("unit_activities")
    .select(`
      *,
      activity_master (
        id,
        name,
        code,
        category
      )
    `)
    .eq("unit_id", unitId)
    .order("sort_order", { ascending: true });

  // Fetch contractors linked to this project
  const { data: projectContractors } = await supabase
    .from("project_contractors")
    .select(`
      id,
      company_name,
      profiles (
        full_name
      )
    `)
    .eq("project_id", projectId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/employee/projects/${projectId}`}
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
                <Home className="w-7 h-7 text-blue-400" />
                <span>Unit {unit.unit_number} — Contractor Allocation</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Activities</p>
            <p className="text-3xl font-bold text-white mt-1">{activities?.length || 0}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-amber-400">Available Contractors</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{projectContractors?.length || 0}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-blue-400">Unit Type</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{unit.unit_type || "Standard"}</p>
          </div>
        </div>

        {/* Activities Contractor Assignment Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <span>Unit Activities &amp; Contractor Assignments</span>
            </h2>
            <span className="text-xs text-slate-400">
              Reassignments automatically log to audit trail
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Sort</th>
                  <th className="px-6 py-4">Activity Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned Contractor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activities && activities.length > 0 ? (
                  activities.map((act) => (
                    <tr key={act.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        #{act.sort_order}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {act.activity_master?.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs border border-purple-500/20">
                          {act.activity_master?.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {act.progress_percentage}%
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs capitalize bg-white/5 border border-white/10 font-medium text-slate-300">
                          {act.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ContractorSelect
                          unitActivityId={act.id}
                          currentContractorId={act.contractor_id}
                          contractors={projectContractors || []}
                          projectId={projectId}
                          unitId={unitId}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No activities provisioned for this unit yet.
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

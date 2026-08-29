import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Building2, Layers, Home, MapPin, ChevronRight, Briefcase, Globe, ShieldCheck } from "lucide-react";
import UserManualModal from "@/components/UserManualModal";
import PWAInstallButton from "@/components/PWAInstallButton";
import { getEmployeeHierarchy, filterAccessibleBlocksAndUnits } from "@/utils/hierarchy";

export const dynamic = "force-dynamic";

interface EmployeeProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeProjectPage({ params }: EmployeeProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("user_id", user.id)
    .single();

  // Fetch project scoped by RLS
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  // Fetch engineer's hierarchy permissions for this project
  const hierarchy = await getEmployeeHierarchy(supabase, id, profile?.id || "");

  // Fetch all blocks and units for this project
  const { data: rawBlocks } = await supabase
    .from("blocks")
    .select(`
      *,
      units (
        id,
        unit_number,
        floor,
        unit_type,
        status,
        unit_activities ( id, progress_percentage, status, contractor_id )
      )
    `)
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  // Filter blocks and units based on hierarchy scope
  const blocks = filterAccessibleBlocksAndUnits(rawBlocks || [], hierarchy);

  const statusBadge =
    project.status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-2 sm:p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
              <Building2 className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {project.name}
                </h1>

                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border capitalize font-semibold ${statusBadge}`}
                >
                  {project.status.replace("_", " ")}
                </span>
              </div>

              {/* Hierarchy Scope Indicator */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {hierarchy.access_level === "full_project" && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Full Project Access (All Blocks &amp; Units)</span>
                  </span>
                )}
                {hierarchy.access_level === "block_level" && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Block Scoped ({hierarchy.block_ids.length} Block(s) Assigned)</span>
                  </span>
                )}
                {hierarchy.access_level === "unit_level" && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-purple-600" />
                    <span>Unit Scoped ({hierarchy.unit_ids.length} Unit(s) Assigned)</span>
                  </span>
                )}
              </div>

              {project.location && (
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{project.location}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <Link
              href="/employee"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 min-h-[38px] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Projects</span>
            </Link>
            <PWAInstallButton />
          </div>
        </div>

        {/* Blocks & Units Hierarchy */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Supervised Blocks &amp; Units ({blocks.length} Blocks)</span>
            </h2>
          </div>

          <div className="space-y-4">
            {blocks && blocks.length > 0 ? (
              blocks.map((block: any) => (
                <div
                  key={block.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Block {block.name}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {block.units?.length || 0} unit(s) under supervision
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {block.units && block.units.length > 0 ? (
                      block.units.map((unit: any) => {
                        const totalActivities = unit.unit_activities?.length || 0;
                        const assignedActivities =
                          unit.unit_activities?.filter((a: any) => a.contractor_id).length || 0;

                        return (
                          <div
                            key={unit.id}
                            className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                                  Unit {unit.unit_number}
                                </h4>
                                <span className="text-xs px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 font-medium">
                                  {unit.unit_type || "Std"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Contractors: <strong className="text-slate-800">{assignedActivities}/{totalActivities}</strong> assigned
                              </p>
                            </div>

                            <Link
                              href={`/employee/projects/${id}/units/${unit.id}`}
                              className="mt-4 w-full py-2 px-3 rounded-lg bg-[#FFE5CC] border border-[#FFD4AA] text-[#933D00] hover:bg-[#FF7903] hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all min-h-[36px] cursor-pointer"
                            >
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>Assign Contractors &amp; Inspect</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic col-span-full py-4 text-center">
                        No accessible units in this block.
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-6 shadow-sm">
                <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Assigned Blocks or Units Found</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mt-1">
                  You are currently restricted to specific blocks or units that have not yet been assigned to your supervision scope. Contact your administrator to adjust permissions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

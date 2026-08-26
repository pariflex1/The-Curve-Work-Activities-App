import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Building2, Layers, Home, MapPin, ChevronRight, Briefcase } from "lucide-react";
import UserManualModal from "@/components/UserManualModal";
import PWAInstallButton from "@/components/PWAInstallButton";

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

  // Fetch project scoped by RLS
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  // Fetch blocks and units
  const { data: blocks } = await supabase
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

  const statusBadge =
    project.status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link
              href="/employee"
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900 shrink-0 min-h-[40px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {project.name}
                </h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border capitalize font-semibold ${statusBadge}`}
                >
                  {project.status.replace("_", " ")}
                </span>
              </div>
              {project.location && (
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{project.location}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <PWAInstallButton />
            <UserManualModal role="employee" triggerLabel="Engineer Manual" />
          </div>
        </div>

        {/* Blocks & Units Hierarchy */}
        <div className="space-y-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Blocks &amp; Unit Workstreams</span>
          </h2>

          <div className="space-y-6">
            {blocks && blocks.length > 0 ? (
              blocks.map((block) => (
                <div
                  key={block.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{block.name}</h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {block.units?.length || 0} unit(s) in block
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
                              className="mt-4 w-full py-2 px-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all min-h-[36px]"
                            >
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>Assign Contractors</span>
                            </Link>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic col-span-full py-4 text-center">
                        No units in this block.
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-12 text-slate-500 text-sm">
                No blocks or units found for this project.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

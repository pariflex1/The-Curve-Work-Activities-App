import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Building2, Layers, Home, MapPin, ChevronRight, Briefcase } from "lucide-react";

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/employee"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                <span className="text-xs px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 capitalize font-medium">
                  {project.status.replace("_", " ")}
                </span>
              </div>
              {project.location && (
                <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{project.location}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Blocks & Units Hierarchy */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Blocks &amp; Unit Workstreams</span>
          </h2>

          <div className="space-y-6">
            {blocks && blocks.length > 0 ? (
              blocks.map((block) => (
                <div
                  key={block.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-lg font-bold text-white">{block.name}</h3>
                    <span className="text-xs text-slate-400">
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
                            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-white text-base">
                                  Unit {unit.unit_number}
                                </h4>
                                <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                                  {unit.unit_type || "Std"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">
                                Contractors: {assignedActivities}/{totalActivities} assigned
                              </p>
                            </div>

                            <Link
                              href={`/employee/projects/${id}/units/${unit.id}`}
                              className="mt-4 w-full py-2 px-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                            >
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>Assign Contractors</span>
                            </Link>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-500 italic col-span-full py-4 text-center">
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

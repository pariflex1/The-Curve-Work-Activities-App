import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Home, Layers, Building2, Sparkles } from "lucide-react";
import UnitProgressDashboard from "./UnitProgressDashboard";

export const dynamic = "force-dynamic";

interface ProgressPageProps {
  params: Promise<{ id: string; blockId: string; unitId: string }>;
}

export default async function UnitProgressPage({ params }: ProgressPageProps) {
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
          name,
          location
        )
      )
    `)
    .eq("id", unitId)
    .single();

  if (!unit) notFound();

  // Fetch unit activities
  const { data: activities } = await supabase
    .from("unit_activities")
    .select(`
      *,
      activity_master (
        name,
        code,
        category
      ),
      project_contractors (
        id,
        company_name,
        profiles (
          full_name
        )
      )
    `)
    .eq("unit_id", unitId)
    .order("sort_order", { ascending: true });

  // Fetch contractors linked to this project
  const { data: contractors } = await supabase
    .from("project_contractors")
    .select(`
      id,
      company_name,
      profiles (
        full_name
      )
    `)
    .eq("project_id", projectId);

  // Fetch payments made towards this unit's activities (Phase 8 integration)
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, unit_activity_id")
    .eq("project_id", projectId);

  // Calculate real paid amount for this unit
  const unitActivityIds = (activities || []).map((a) => a.id);
  const paidAmount =
    payments
      ?.filter((p) => unitActivityIds.includes(p.unit_activity_id))
      ?.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || 0;

  const projectName = unit.blocks?.projects?.name || "Project";
  const blockName = unit.blocks?.name || "Block";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium flex-wrap">

                <Link href="/admin/projects" className="hover:text-blue-600 transition-colors">
                  {projectName}
                </Link>
                <span className="text-slate-300">/</span>
                <Link
                  href={`/admin/projects/${projectId}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {blockName}
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-bold">Unit {unit.unit_number}</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2 mt-1">
                <Home className="w-6 h-6 text-amber-600 shrink-0" />
                <span>Unit Work Progress &amp; Financial Dashboard</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href={`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}`}
              className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors min-h-[40px] flex items-center"
            >
              Edit Checklist
            </Link>
          </div>
        </div>

        {/* Dashboard Component */}
        <UnitProgressDashboard
          unit={unit}
          projectName={projectName}
          blockName={blockName}
          projectId={projectId}
          blockId={blockId}
          activities={activities || []}
          contractors={
            contractors?.map((c: any) => ({
              id: c.id,
              company_name: c.company_name,
              contactName: c.profiles?.full_name,
            })) || []
          }
          paidAmount={paidAmount}
        />
      </div>
    </main>
  );
}

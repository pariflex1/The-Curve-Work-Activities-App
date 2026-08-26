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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}`}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link href="/admin/projects" className="hover:text-white transition-colors">
                  {projectName}
                </Link>
                <span className="text-slate-600">/</span>
                <Link
                  href={`/admin/projects/${projectId}`}
                  className="hover:text-white transition-colors"
                >
                  {blockName}
                </Link>
                <span className="text-slate-600">/</span>
                <span className="text-white font-medium">Unit {unit.unit_number}</span>
              </div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mt-1">
                <Home className="w-7 h-7 text-amber-400" />
                <span>Unit Work Progress &amp; Financial Dashboard</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}`}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-sm font-medium transition-all"
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

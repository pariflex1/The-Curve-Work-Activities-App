import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Layers,
  Home,
  Plus,
  MapPin,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import UnitFormModal from "./UnitFormModal";

export const dynamic = "force-dynamic";

interface BlockDetailPageProps {
  params: Promise<{ id: string; blockId: string }>;
}

export default async function BlockDetailPage({ params }: BlockDetailPageProps) {
  const { id: projectId, blockId } = await params;
  const supabase = await createClient();

  // Fetch project
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, location")
    .eq("id", projectId)
    .single();

  // Fetch block
  const { data: block } = await supabase
    .from("blocks")
    .select("*")
    .eq("id", blockId)
    .single();

  if (!project || !block) {
    notFound();
  }

  // Fetch units in this block
  const { data: units } = await supabase
    .from("units")
    .select("*")
    .eq("block_id", blockId)
    .order("unit_number", { ascending: true });

  const activeUnitsCount = units?.filter((u) => u.status === "active").length || 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/projects/${projectId}`}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400 text-sm">{project.name}</span>
                <span className="text-slate-600">/</span>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <span>{block.name} — Units Inventory</span>
                </h1>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Manage residential or commercial units, floors, and specifications within this block
              </p>
            </div>
          </div>

          <UnitFormModal projectId={projectId} blockId={blockId} />
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Units</p>
            <p className="text-3xl font-bold text-white mt-1">{units?.length || 0}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Active Units</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{activeUnitsCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-cyan-400">Block Order</p>
            <p className="text-3xl font-bold text-cyan-400 mt-1">#{block.sort_order}</p>
          </div>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {units && units.length > 0 ? (
            units.map((unit) => {
              const statusBadge =
                unit.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-500/10 text-slate-400 border-slate-500/30";

              return (
                <div
                  key={unit.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-md flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                          <Home className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                          Unit {unit.unit_number}
                        </h3>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusBadge}`}>
                        {unit.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-white/5">
                      {unit.floor && (
                        <p className="flex justify-between">
                          <span>Floor:</span>
                          <span className="text-slate-200 font-medium">{unit.floor}</span>
                        </p>
                      )}
                      {unit.unit_type && (
                        <p className="flex justify-between">
                          <span>Type:</span>
                          <span className="text-slate-200 font-medium">{unit.unit_type}</span>
                        </p>
                      )}
                      {unit.area && (
                        <p className="flex justify-between">
                          <span>Area:</span>
                          <span className="text-slate-200 font-medium">{unit.area} sq.ft</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/projects/${projectId}/blocks/${blockId}/units/${unit.id}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Activities</span>
                    </Link>

                    <UnitFormModal
                      projectId={projectId}
                      blockId={blockId}
                      unit={unit}
                      isEdit={true}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 p-6">
              <Home className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-300">No Units in this Block</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1 mb-6">
                Add units (flats, offices, shops) to track unit-level activity progress.
              </p>
              <UnitFormModal
                projectId={projectId}
                blockId={blockId}
                triggerLabel="Add First Unit"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

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

  // Fetch project, block, and units concurrently
  const [
    { data: project },
    { data: block },
    { data: units },
  ] = await Promise.all([
    supabase.from("projects").select("id, name, location").eq("id", projectId).maybeSingle(),
    supabase.from("blocks").select("*").eq("id", blockId).maybeSingle(),
    supabase.from("units").select("*").eq("block_id", blockId).order("unit_number", { ascending: true }),
  ]);

  if (!project || !block) {
    notFound();
  }



  const activeUnitsCount = units?.filter((u) => u.status === "active").length || 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link
              href={`/admin/projects/${projectId}`}
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900 shrink-0 min-h-[40px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 text-xs sm:text-sm font-medium">{project.name}</span>
                <span className="text-slate-300">/</span>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>{block.name} — Units Inventory</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage residential or commercial units, floors, and specifications within this block
              </p>
            </div>
          </div>

          <UnitFormModal projectId={projectId} blockId={blockId} />
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Total Units</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{units?.length || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Active Units</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{activeUnitsCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-blue-700">Block Order</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">#{block.sort_order}</p>
          </div>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {units && units.length > 0 ? (
            units.map((unit) => {
              const statusBadge =
                unit.status === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-700 border-slate-200";

              return (
                <div
                  key={unit.id}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Home className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Unit {unit.unit_number}
                        </h3>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-semibold ${statusBadge}`}>
                        {unit.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                      {unit.floor && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Floor:</span>
                          <span className="font-semibold text-slate-800">{unit.floor}</span>
                        </p>
                      )}
                      {unit.unit_type && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Type:</span>
                          <span className="font-semibold text-slate-800">{unit.unit_type}</span>
                        </p>
                      )}
                      {unit.area && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Area:</span>
                          <span className="font-semibold text-slate-800">{unit.area} sq.ft</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/projects/${projectId}/blocks/${blockId}/units/${unit.id}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all min-h-[36px]"
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
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm p-6">
              <Home className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Units in this Block</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mt-1 mb-6">
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

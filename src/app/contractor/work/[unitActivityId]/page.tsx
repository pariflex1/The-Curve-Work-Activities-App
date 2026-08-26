import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Briefcase,
  HardHat,
  Home,
  Building2,
  Calendar,
  History,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";


export const dynamic = "force-dynamic";

interface WorkDetailPageProps {
  params: Promise<{ unitActivityId: string }>;
}

export default async function ContractorWorkDetailPage({ params }: WorkDetailPageProps) {
  const { unitActivityId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch unit activity with details
  const { data: activity } = await supabase
    .from("unit_activities")
    .select(`
      *,
      activity_master (
        id,
        name,
        code,
        category,
        default_unit,
        description
      ),
      units (
        id,
        unit_number,
        floor,
        unit_type,
        blocks (
          id,
          name,
          project_id,
          projects (
            id,
            name,
            location
          )
        )
      )
    `)
    .eq("id", unitActivityId)
    .single();

  if (!activity) notFound();

  // Fetch chronological progress reports (append-only history)
  const { data: history } = await supabase
    .from("progress_reports")
    .select(`
      *,
      progress_report_photos (
        id,
        storage_path
      )
    `)
    .eq("unit_activity_id", unitActivityId)
    .order("created_at", { ascending: false });

  const unit = activity.units;
  const block = unit?.blocks;
  const project = block?.projects;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const statusBadge =
    activity.status === "completed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : activity.status === "in_progress"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-2 sm:p-4 md:p-8 font-sans overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
              <HardHat className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
                <span>{project?.name}</span>
                <span className="text-slate-300">/</span>
                <span>{block?.name}</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-800 font-bold">Unit {unit?.unit_number}</span>
              </div>
              <h1 className="text-base sm:text-2xl font-bold text-slate-900 mt-0.5">
                {activity.activity_master?.name}
              </h1>
            </div>
          </div>

          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-[10px] sm:text-xs font-semibold uppercase shrink-0">
            Read-Only
          </span>
        </div>

        {/* Activity Summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Category</span>
            <p className="text-xs sm:text-sm font-bold text-purple-700 mt-1">{activity.activity_master?.category || "General"}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Verified Progress</span>
            <p className="text-base sm:text-lg font-bold text-black font-mono mt-0.5">{activity.progress_percentage}%</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Current Status</span>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${statusBadge}`}>
              {activity.status.replace("_", " ")}
            </span>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Est. Cost</span>
            <p className="text-xs sm:text-sm font-bold text-black mt-1">
              ₹{Number(activity.estimated_cost || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Chronological Progress History & Photo Gallery */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-black" />
              <span>Engineer Inspection Reports &amp; Verification Trail</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {history?.length || 0} report(s) recorded
            </span>
          </div>

          <div className="space-y-6">
            {history && history.length > 0 ? (
              history.map((rep, idx) => {
                const photos = rep.progress_report_photos || [];
                const formattedDate = new Date(rep.created_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div
                    key={rep.id}
                    className="relative pl-6 pb-6 border-l-2 border-slate-200 last:border-l-0 last:pb-0 space-y-3"
                  >
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-black border-4 border-white shadow-sm" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Progress Verified: {rep.previous_progress}% →{" "}
                          <span className="text-black font-mono">{rep.new_progress}%</span>
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                          +{Number(rep.new_progress) - Number(rep.previous_progress)}%
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{formattedDate}</span>
                    </div>

                    {rep.work_completed_note && (
                      <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-normal">
                        {rep.work_completed_note}
                      </p>
                    )}

                    {/* Photos */}
                    {photos.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-black" />
                          <span>Inspection Photos ({photos.length})</span>
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {photos.map((p: any) => {
                            const photoUrl = `${supabaseUrl}/storage/v1/object/public/progress-photos/${p.storage_path}`;
                            return (
                              <a
                                key={p.id}
                                href={photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative rounded-xl overflow-hidden aspect-video border border-slate-200 hover:border-black transition-all block shadow-sm"
                              >
                                <img
                                  src={photoUrl}
                                  alt="Site progress"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs sm:text-sm font-normal">
                No site inspections recorded yet. The Site Engineer will inspect the work on site and post verified progress updates here.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

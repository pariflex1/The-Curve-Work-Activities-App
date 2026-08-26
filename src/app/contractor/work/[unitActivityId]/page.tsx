import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Home,
  Building2,
  Calendar,
  History,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";
import ProgressForm from "./ProgressForm";

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <Link
            href="/contractor"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{project?.name}</span>
              <span className="text-slate-600">/</span>
              <span>{block?.name}</span>
              <span className="text-slate-600">/</span>
              <span>Unit {unit?.unit_number}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {activity.activity_master?.name}
            </h1>
          </div>
        </div>

        {/* Activity Summary Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Category</span>
            <p className="text-sm font-semibold text-purple-300 mt-1">{activity.activity_master?.category || "General"}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Current Progress</span>
            <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">{activity.progress_percentage}%</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Status</span>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {activity.status.replace("_", " ")}
            </span>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Est. Cost</span>
            <p className="text-sm font-bold text-emerald-400 mt-1">
              ₹{Number(activity.estimated_cost || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Form to submit new progress */}
        <ProgressForm
          unitActivityId={unitActivityId}
          currentProgress={Number(activity.progress_percentage) || 0}
        />

        {/* Chronological Progress History & Photo Gallery */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <span>Progress Submission History</span>
            </h3>
            <span className="text-xs text-slate-400">
              {history?.length || 0} report(s) logged (Immutable Audit Trail)
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
                    className="relative pl-6 pb-6 border-l-2 border-amber-500/30 last:border-l-0 last:pb-0 space-y-3"
                  >
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-slate-900" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          Progress Updated: {rep.previous_progress}% →{" "}
                          <span className="text-amber-400 font-mono">{rep.new_progress}%</span>
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                          +{Number(rep.new_progress) - Number(rep.previous_progress)}%
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{formattedDate}</span>
                    </div>

                    {rep.work_completed_note && (
                      <p className="text-sm text-slate-300 bg-white/5 p-3.5 rounded-xl border border-white/5">
                        {rep.work_completed_note}
                      </p>
                    )}

                    {/* Photos */}
                    {photos.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Verification Photos ({photos.length})</span>
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
                                className="group relative rounded-xl overflow-hidden aspect-video border border-white/10 hover:border-cyan-400/50 transition-all block"
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
              <div className="py-8 text-center text-slate-500 text-sm">
                No progress reports submitted yet. Use the form above to log daily completion.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Plus, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import ActivityMasterModal from "./ActivityMasterModal";

export const dynamic = "force-dynamic";

export default async function ActivityMasterPage() {
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from("activity_master")
    .select("*")
    .order("sort_order", { ascending: true });

  const activeCount = activities?.filter((a) => a.is_active).length || 0;
  const categories = Array.from(new Set(activities?.map((a) => a.category).filter(Boolean)));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-7 h-7 text-cyan-400" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Activity Master
                </h1>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Standard construction and finishing activity catalog used for provisioning unit work checklists
              </p>
            </div>
          </div>

          <ActivityMasterModal />
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Activities</p>
              <p className="text-3xl font-bold text-white mt-1">{activities?.length || 0}</p>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Active Templates</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{activeCount}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-purple-400">Categories</p>
              <p className="text-3xl font-bold text-purple-400 mt-1">{categories.length}</p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Activities Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Sort</th>
                  <th className="px-6 py-4">Activity Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Default Unit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activities && activities.length > 0 ? (
                  activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        #{activity.sort_order}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{activity.name}</p>
                        {activity.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{activity.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        <span className="px-2 py-1 bg-white/5 rounded-md border border-white/10 text-cyan-400">
                          {activity.code || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs border border-purple-500/20">
                          {activity.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {activity.default_unit || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {activity.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActivityMasterModal activity={activity} isEdit={true} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No activities registered yet.
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

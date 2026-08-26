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
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Activity Master Catalog
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Standard construction and finishing activity catalog used for provisioning unit work checklists
              </p>
            </div>
          </div>


          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            <ActivityMasterModal />
          </div>
        </div>




        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Total Activities</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{activities?.length || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Active Templates</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{activeCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-purple-700">Categories</p>
              <p className="text-3xl font-extrabold text-purple-600 mt-1">{categories.length}</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Activities Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Sort</th>
                  <th className="px-5 py-3.5">Activity Name</th>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Default Unit</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {activities && activities.length > 0 ? (
                  activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">
                        #{activity.sort_order}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{activity.name}</p>
                        {activity.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200 font-semibold text-blue-700">
                          {activity.code || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                          {activity.category || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {activity.default_unit || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {activity.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ActivityMasterModal activity={activity} isEdit={true} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
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

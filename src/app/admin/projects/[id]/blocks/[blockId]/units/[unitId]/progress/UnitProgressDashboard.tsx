"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Coins,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Filter,
  ArrowUpRight,
  FileCheck2,
} from "lucide-react";

interface ActivityItem {
  id: string;
  activity_master?: {
    name: string;
    code: string | null;
    category: string | null;
  } | null;
  project_contractors?: {
    id: string;
    company_name: string;
    profiles?: {
      full_name: string;
    } | null;
  } | null;
  estimated_cost: number | null;
  progress_percentage: number;
  status: string;
  start_date: string | null;
  expected_completion_date: string | null;
  actual_completion_date: string | null;
  remarks: string | null;
  sort_order: number;
}

interface UnitProgressDashboardProps {
  unit: {
    id: string;
    unit_number: string;
    floor: string | null;
    unit_type: string | null;
    area: number | null;
  };
  projectName: string;
  blockName: string;
  projectId: string;
  blockId: string;
  activities: ActivityItem[];
  contractors: {
    id: string;
    company_name: string;
    contactName?: string;
  }[];
  paidAmount?: number;
}

export default function UnitProgressDashboard({
  unit,
  projectName,
  blockName,
  projectId,
  blockId,
  activities,
  contractors,
  paidAmount = 0,
}: UnitProgressDashboardProps) {
  const [selectedContractorId, setSelectedContractorId] = useState<string>("all");

  // Filter activities
  const filteredActivities =
    selectedContractorId === "all"
      ? activities
      : activities.filter((a) => a.project_contractors?.id === selectedContractorId);

  // Computations
  const totalEstimatedCost = activities.reduce(
    (acc, a) => acc + (Number(a.estimated_cost) || 0),
    0
  );

  const balanceAmount = totalEstimatedCost - paidAmount;

  // Overall progress computation
  const overallProgress =
    activities.length > 0
      ? Math.round(
          activities.reduce((acc, a) => acc + (Number(a.progress_percentage) || 0), 0) /
            activities.length
        )
      : 0;

  // Filtered contractor's specific average progress
  const filteredProgress =
    filteredActivities.length > 0
      ? Math.round(
          filteredActivities.reduce(
            (acc, a) => acc + (Number(a.progress_percentage) || 0),
            0
          ) / filteredActivities.length
        )
      : 0;

  const completedActivitiesCount =
    filteredActivities.filter((a) => a.status === "completed").length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Financial & Progress Metric Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              {selectedContractorId === "all" ? "Overall Progress" : "Contractor Progress"}
            </span>
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
              {selectedContractorId === "all" ? overallProgress : filteredProgress}%
            </p>
            <span className="text-xs text-slate-500 font-semibold">
              ({completedActivitiesCount}/{filteredActivities.length} done)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${selectedContractorId === "all" ? overallProgress : filteredProgress}%`,
              }}
            />
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Total Estimated Cost
            </span>
            <Coins className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            ₹{totalEstimatedCost.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-2">Sum of all work packages</p>
        </div>

        {/* Paid Amount */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Total Paid
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            ₹{paidAmount.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-2">Verified disbursed disbursements</p>
        </div>

        {/* Balance Due */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Outstanding Balance
            </span>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 mt-1">
            ₹{balanceAmount.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-2">Estimated Cost − Paid</p>
        </div>
      </div>

      {/* Filter & Activity List Section */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-4">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              <span>Unit Activity Breakdown</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live completion status, contractor assignment, and photo progress logs
            </p>
          </div>

          {/* Contractor Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedContractorId}
              onChange={(e) => setSelectedContractorId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
            >
              <option value="all">All Contractors ({activities.length} tasks)</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activities Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Sort</th>
                <th className="px-5 py-3.5">Activity Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Assigned Contractor</th>
                <th className="px-5 py-3.5">Estimated Cost</th>
                <th className="px-5 py-3.5">Progress (%)</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Progress History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredActivities && filteredActivities.length > 0 ? (
                filteredActivities.map((act) => {
                  const statusPill =
                    act.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : act.status === "in_progress"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">
                        #{act.sort_order}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{act.activity_master?.name}</p>
                        {act.remarks && (
                          <p className="text-xs text-slate-500 mt-0.5">{act.remarks}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                          {act.activity_master?.category || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {act.project_contractors ? (
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">
                              {act.project_contractors.company_name}
                            </p>
                            {act.project_contractors.profiles?.full_name && (
                              <p className="text-xs text-slate-500">
                                {act.project_contractors.profiles.full_name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        ₹{Number(act.estimated_cost || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${act.progress_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-800">{act.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize border font-medium ${statusPill}`}>
                          {act.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/contractor/work/${act.id}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors min-h-[36px]"
                        >
                          <span>View History &amp; Photos</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No activities found matching selected contractor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

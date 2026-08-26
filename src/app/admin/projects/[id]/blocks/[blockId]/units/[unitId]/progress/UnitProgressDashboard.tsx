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
  ChevronRight,
  FileCheck2,
  Calendar,
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
  paidAmount?: number; // Real payments wired in Phase 8
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
    <div className="space-y-8">
      {/* Financial & Progress Metric Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              {selectedContractorId === "all" ? "Overall Progress" : "Contractor Progress"}
            </span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-white font-mono">
              {selectedContractorId === "all" ? overallProgress : filteredProgress}%
            </p>
            <span className="text-xs text-slate-400">
              ({completedActivitiesCount}/{filteredActivities.length} done)
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${selectedContractorId === "all" ? overallProgress : filteredProgress}%`,
              }}
            />
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Total Estimated Cost
            </span>
            <Coins className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-cyan-400 mt-1">
            ₹{totalEstimatedCost.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-2">Sum of all work packages</p>
        </div>

        {/* Paid Amount */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Total Paid
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400 mt-1">
            ₹{paidAmount.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-2">Verified disbursed disbursements</p>
        </div>

        {/* Balance Due */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Outstanding Balance
            </span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400 mt-1">
            ₹{balanceAmount.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-2">Estimated Cost − Paid</p>
        </div>
      </div>

      {/* Filter & Activity List Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl space-y-4">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-400" />
              <span>Unit Activity Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live completion status, contractor assignment, and photo progress logs
            </p>
          </div>

          {/* Contractor Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedContractorId}
              onChange={(e) => setSelectedContractorId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Sort</th>
                <th className="px-6 py-4">Activity Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Assigned Contractor</th>
                <th className="px-6 py-4">Estimated Cost</th>
                <th className="px-6 py-4">Progress (%)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Progress History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredActivities && filteredActivities.length > 0 ? (
                filteredActivities.map((act) => {
                  const statusPill =
                    act.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : act.status === "in_progress"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-slate-500/10 text-slate-400 border-slate-500/30";

                  return (
                    <tr key={act.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        #{act.sort_order}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{act.activity_master?.name}</p>
                        {act.remarks && (
                          <p className="text-xs text-slate-400 mt-0.5">{act.remarks}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs border border-purple-500/20">
                          {act.activity_master?.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {act.project_contractors ? (
                          <div>
                            <p className="font-medium text-white text-xs">
                              {act.project_contractors.company_name}
                            </p>
                            {act.project_contractors.profiles?.full_name && (
                              <p className="text-xs text-slate-400">
                                {act.project_contractors.profiles.full_name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-400">
                        ₹{Number(act.estimated_cost || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full"
                              style={{ width: `${act.progress_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold">{act.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs capitalize border font-medium ${statusPill}`}>
                          {act.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/contractor/work/${act.id}`}
                          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
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
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
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

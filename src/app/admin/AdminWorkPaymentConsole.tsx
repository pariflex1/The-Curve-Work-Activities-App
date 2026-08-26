"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Home,
  Coins,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  Plus,
  CheckCircle2,
  Clock,
  CircleDashed,
  Filter,
  BarChart3,
  IndianRupee,
  Layers,
} from "lucide-react";
import PaymentFormModal from "@/app/admin/payments/PaymentFormModal";

export interface ActivityItem {
  id: string;
  estimated_cost: number | null;
  progress_percentage: number | null;
  status: string;
  activity_master?: {
    id: string;
    name: string;
    category: string | null;
  } | null;
  project_contractors?: {
    id: string;
    company_name: string;
    profiles?: {
      full_name: string | null;
    } | null;
  } | null;
  payments?: {
    id: string;
    amount: number;
    paid_to: string | null;
    payment_date: string;
    payment_type: string | null;
  }[];
}

export interface UnitItem {
  id: string;
  unit_number: string;
  floor: number | null;
  unit_type: string | null;
  status: string;
  block_id: string;
  block_name: string;
  unit_activities: ActivityItem[];
}

export interface BlockItem {
  id: string;
  name: string;
  sort_order: number;
  units: UnitItem[];
}

export interface ProjectItem {
  id: string;
  name: string;
  status: string;
  location: string | null;
  blocks: BlockItem[];
  project_contractors?: {
    id: string;
    company_name: string;
    profiles?: {
      full_name: string | null;
    } | null;
  }[];
}

interface AdminWorkPaymentConsoleProps {
  projects: ProjectItem[];
}

export default function AdminWorkPaymentConsole({ projects }: AdminWorkPaymentConsoleProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [unitSearch, setUnitSearch] = useState<string>("");
  const [filterTab, setFilterTab] = useState<"all" | "in_progress" | "completed" | "not_started">("all");

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Flatten all units from all blocks in the selected project
  const allUnits: UnitItem[] = useMemo(() => {
    return (activeProject?.blocks || []).flatMap((b) =>
      (b.units || []).map((u) => ({
        ...u,
        block_id: b.id,
        block_name: b.name,
        unit_activities: u.unit_activities || [],
      }))
    );
  }, [activeProject]);

  const [selectedUnitId, setSelectedUnitId] = useState<string>(allUnits[0]?.id || "");

  // Update selected unit if current selection doesn't exist in active project
  const activeUnit = allUnits.find((u) => u.id === selectedUnitId) || allUnits[0];

  // Project Level KPI Calculations
  const projectStats = useMemo(() => {
    let totalEst = 0;
    let totalPaid = 0;
    let totalProgressSum = 0;
    let totalActivityCount = 0;

    allUnits.forEach((u) => {
      u.unit_activities.forEach((a) => {
        totalEst += Number(a.estimated_cost) || 0;
        totalProgressSum += Number(a.progress_percentage) || 0;
        totalActivityCount += 1;
        (a.payments || []).forEach((p) => {
          totalPaid += Number(p.amount) || 0;
        });
      });
    });

    const avgProgress = totalActivityCount > 0 ? Math.round(totalProgressSum / totalActivityCount) : 0;
    const balance = totalEst - totalPaid;

    return {
      totalEst,
      totalPaid,
      balance,
      avgProgress,
      totalActivities: totalActivityCount,
    };
  }, [allUnits]);

  // Unit Filtering Logic
  const filteredUnits = useMemo(() => {
    return allUnits.filter((u) => {
      // 1. Search Query
      const query = unitSearch.trim().toLowerCase();
      const matchesSearch =
        !query ||
        u.unit_number.toLowerCase().includes(query) ||
        u.block_name.toLowerCase().includes(query) ||
        (u.unit_type && u.unit_type.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // 2. Tab Filter
      if (filterTab === "all") return true;

      const totalActs = u.unit_activities.length;
      if (totalActs === 0) return filterTab === "not_started";

      const completedActs = u.unit_activities.filter(
        (a) => a.status === "completed" || (a.progress_percentage || 0) >= 100
      ).length;

      if (filterTab === "completed") return completedActs === totalActs;
      if (filterTab === "in_progress") return completedActs < totalActs && completedActs > 0;
      if (filterTab === "not_started") return completedActs === 0;

      return true;
    });
  }, [allUnits, unitSearch, filterTab]);

  const contractorsList = (activeProject?.project_contractors || []).map((c) => ({
    id: c.id,
    company_name: c.company_name,
    full_name: c.profiles?.full_name || null,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header & Project Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-black text-white shadow-sm">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Work Activities &amp; Disbursement Console
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time site progress, unit checklists &amp; direct milestone disbursements
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Project Selector */}
        <div className="flex items-center gap-3 self-start lg:self-auto bg-slate-50 border border-slate-200 p-1.5 rounded-2xl shadow-inner">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 pl-2.5 shrink-0 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Project:</span>
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              const newProjId = e.target.value;
              setSelectedProjectId(newProjId);
              const newProj = projects.find((p) => p.id === newProjId);
              const firstUnit = newProj?.blocks?.[0]?.units?.[0];
              if (firstUnit) {
                setSelectedUnitId(firstUnit.id);
              }
            }}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-sm min-w-[220px]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                🏢 {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column Workflow: Left = Unit Selection | Right = Work Activities & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Step 2: Unit Picker (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-black" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                1. Select Unit ({filteredUnits.length}/{allUnits.length})
              </h3>
            </div>
            {activeProject && (
              <Link
                href={`/admin/projects/${activeProject.id}`}
                className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 transition-colors"
              >
                <span>Project View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Unit Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                filterTab === "all" ? "bg-white text-black shadow-xs font-bold" : "text-slate-600 hover:text-black"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab("in_progress")}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                filterTab === "in_progress" ? "bg-white text-black shadow-xs font-bold" : "text-slate-600 hover:text-black"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterTab("completed")}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                filterTab === "completed" ? "bg-white text-black shadow-xs font-bold" : "text-slate-600 hover:text-black"
              }`}
            >
              Done
            </button>
          </div>

          {/* Unit Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={unitSearch}
              onChange={(e) => setUnitSearch(e.target.value)}
              placeholder="Search by unit # or block..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
            />
          </div>

          {/* Unit List Container */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredUnits.length > 0 ? (
              filteredUnits.map((u) => {
                const isSelected = activeUnit?.id === u.id;
                const activityCount = u.unit_activities.length;
                const completedCount = u.unit_activities.filter(
                  (a) => a.status === "completed" || (a.progress_percentage || 0) >= 100
                ).length;
                const unitEst = u.unit_activities.reduce((acc, a) => acc + (Number(a.estimated_cost) || 0), 0);

                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUnitId(u.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? "bg-black text-white border-black shadow-md"
                        : "bg-slate-50 hover:bg-slate-100/90 border-slate-200 text-slate-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">
                          Unit {u.unit_number}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isSelected
                              ? "bg-slate-800 text-white border border-slate-700"
                              : "bg-white text-slate-700 border border-slate-200"
                          }`}
                        >
                          {u.block_name}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        {u.unit_type || "Apartment"} • Floor {u.floor || 1}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${
                          isSelected
                            ? "bg-white text-black"
                            : activityCount > 0
                            ? "bg-slate-100 text-slate-900 border border-slate-300"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {activityCount} {activityCount === 1 ? "Activity" : "Activities"}
                      </span>
                      {activityCount > 0 && (
                        <p className={`text-[10px] mt-1 ${isSelected ? "text-slate-300" : "text-emerald-700 font-semibold"}`}>
                          {completedCount}/{activityCount} Done • ₹{unitEst.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                No units match your search filters.
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Work Activities & Payments for Selected Unit (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                2. Work Activities for {activeUnit ? `${activeUnit.block_name} — Unit ${activeUnit.unit_number}` : "Unit"}
              </h3>
            </div>

            {activeUnit && activeProject && (
              <Link
                href={`/admin/projects/${activeProject.id}/blocks/${activeUnit.block_id}/units/${activeUnit.id}`}
                className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 transition-colors"
              >
                <span>Full Unit Checklist</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Activities List */}
          {activeUnit && activeUnit.unit_activities.length > 0 ? (
            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {activeUnit.unit_activities.map((act) => {
                const activityName = act.activity_master?.name || "Construction Activity";
                const category = act.activity_master?.category || "Structural";
                const cCompany = act.project_contractors?.company_name;
                const cPerson = act.project_contractors?.profiles?.full_name;
                const contractorLabel = cCompany
                  ? `${cCompany}${cPerson && cPerson !== cCompany ? ` — ${cPerson}` : ""}`
                  : "Unassigned Contractor";

                const progress = act.progress_percentage || 0;
                const estCost = Number(act.estimated_cost) || 0;
                const totalPaidForActivity = (act.payments || []).reduce(
                  (acc, p) => acc + (Number(p.amount) || 0),
                  0
                );
                const remainingBal = estCost - totalPaidForActivity;

                const isUnassigned = !cCompany || contractorLabel === "Unassigned Contractor" || !act.project_contractors;

                return (
                  <div
                    key={act.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400/80 shadow-xs hover:shadow-md transition-all space-y-3.5"
                  >
                    {/* Top Row: Activity Name, Contractor, & Pay Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            {activityName}
                          </h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                          <span className="text-slate-400">Assigned:</span>
                          {isUnassigned ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200/60 text-[11px]">
                              ⚠️ Unassigned
                            </span>
                          ) : (
                            <strong className="text-slate-800">🏢 {contractorLabel}</strong>
                          )}
                        </p>
                      </div>

                      {/* Payment Trigger vs Assign Prompt */}
                      <div className="shrink-0">
                        {isUnassigned ? (
                          <Link
                            href={`/admin/projects/${activeProject.id}/blocks/${activeUnit.block_id}/units/${activeUnit.id}`}
                            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                            title="Assign a contractor to enable payment recording"
                          >
                            <span>+ Assign Contractor</span>
                          </Link>
                        ) : (
                          <PaymentFormModal
                            projectId={activeProject.id}
                            unitActivityId={act.id}
                            contractors={contractorsList}
                            hideHierarchySelectors={true}
                            triggerLabel="Record Payment"
                          />
                        )}
                      </div>
                    </div>


                    {/* Progress Bar & Financials */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-medium text-slate-500">Verified Milestone:</span>
                          <span className="font-bold text-slate-900 font-mono">{progress}% Complete</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
                          <div
                            className={`h-full transition-all duration-500 ${
                              progress >= 100
                                ? "bg-emerald-500"
                                : progress > 0
                                ? "bg-black"
                                : "bg-slate-300"
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                        <div className="text-left sm:text-right">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Est. Cost</span>
                          <span className="font-bold font-mono text-slate-900">₹{estCost.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-emerald-700 block text-[10px] uppercase font-bold tracking-wider">Paid</span>
                          <span className="font-bold font-mono text-emerald-700">₹{totalPaidForActivity.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-purple-700 block text-[10px] uppercase font-bold tracking-wider">Balance</span>
                          <span className="font-bold font-mono text-purple-700">₹{remainingBal.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-black mx-auto flex items-center justify-center shadow-xs">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">No work activities provisioned yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add activities to this unit to start tracking construction progress and recording contractor disbursements.
                </p>
              </div>
              {activeUnit && activeProject && (
                <Link
                  href={`/admin/projects/${activeProject.id}/blocks/${activeUnit.block_id}/units/${activeUnit.id}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all min-h-[40px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Provision Work Activities</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

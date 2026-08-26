"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  Coins,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  Plus,
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

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Flatten all units from all blocks in the selected project
  const allUnits: UnitItem[] = (activeProject?.blocks || []).flatMap((b) =>
    (b.units || []).map((u) => ({
      ...u,
      block_id: b.id,
      block_name: b.name,
      unit_activities: u.unit_activities || [],
    }))
  );

  const [selectedUnitId, setSelectedUnitId] = useState<string>(allUnits[0]?.id || "");

  // Update selected unit if current selection doesn't exist in active project
  const activeUnit = allUnits.find((u) => u.id === selectedUnitId) || allUnits[0];

  const filteredUnits = allUnits.filter((u) => {
    if (!unitSearch.trim()) return true;
    const query = unitSearch.toLowerCase();
    return (
      u.unit_number.toLowerCase().includes(query) ||
      u.block_name.toLowerCase().includes(query) ||
      (u.unit_type && u.unit_type.toLowerCase().includes(query))
    );
  });

  const contractorsList = (activeProject?.project_contractors || []).map((c) => ({
    id: c.id,
    company_name: c.company_name,
    full_name: c.profiles?.full_name || null,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Coins className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Work Activities &amp; Disbursement Console
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select a <strong>Project</strong> → Choose a <strong>Unit</strong> → View <strong>Work Activities</strong> &amp; Disburse Milestone Funds
          </p>
        </div>

        {/* Step 1: Project Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
            Project:
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
            className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm min-w-[200px]"
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
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                1. Select Unit ({allUnits.length})
              </h3>
            </div>
            {activeProject && (
              <Link
                href={`/admin/projects/${activeProject.id}`}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Project View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Unit Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={unitSearch}
              onChange={(e) => setUnitSearch(e.target.value)}
              placeholder="Search by unit # or block..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Unit List Container */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredUnits.length > 0 ? (
              filteredUnits.map((u) => {
                const isSelected = activeUnit?.id === u.id;
                const activityCount = u.unit_activities.length;
                const completedCount = u.unit_activities.filter(
                  (a) => a.status === "completed" || (a.progress_percentage || 0) >= 100
                ).length;

                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUnitId(u.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900"
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
                              ? "bg-blue-500/40 text-white border border-blue-400/50"
                              : "bg-white text-slate-600 border border-slate-200"
                          }`}
                        >
                          {u.block_name}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                        {u.unit_type || "Apartment"} • Floor {u.floor || 1}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${
                          isSelected
                            ? "bg-white text-blue-700"
                            : activityCount > 0
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {activityCount} {activityCount === 1 ? "Activity" : "Activities"}
                      </span>
                      {activityCount > 0 && (
                        <p className={`text-[10px] mt-1 ${isSelected ? "text-blue-100" : "text-emerald-700 font-semibold"}`}>
                          {completedCount}/{activityCount} Done
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                No units match your search.
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Work Activities & Payments for Selected Unit (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                2. Work Activities for {activeUnit ? `${activeUnit.block_name} — Unit ${activeUnit.unit_number}` : "Unit"}
              </h3>
            </div>

            {activeUnit && activeProject && (
              <Link
                href={`/admin/projects/${activeProject.id}/blocks/${activeUnit.block_id}/units/${activeUnit.id}`}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Full Unit Checklist</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Activities List */}
          {activeUnit && activeUnit.unit_activities.length > 0 ? (
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
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

                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3"
                  >
                    {/* Top Row: Activity Name, Contractor, & Pay Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            {activityName}
                          </h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                            {category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                          <span className="text-slate-400">Contractor:</span>
                          <strong className="text-slate-800">🏢 {contractorLabel}</strong>
                        </p>
                      </div>

                      {/* Direct Activity Payment Modal Trigger */}
                      <div className="shrink-0">
                        <PaymentFormModal
                          projectId={activeProject.id}
                          unitActivityId={act.id}
                          contractors={contractorsList}
                          hideHierarchySelectors={true}
                          triggerLabel="Record Payment"
                        />
                      </div>
                    </div>

                    {/* Progress Bar & Financials */}
                    <div className="pt-2.5 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-slate-500">Verified Progress:</span>
                          <span className="font-bold text-slate-900 font-mono">{progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              progress >= 100
                                ? "bg-emerald-500"
                                : progress > 0
                                ? "bg-blue-600"
                                : "bg-slate-300"
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
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
            <div className="p-10 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">No work activities provisioned yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Add activities to this unit to track construction progress and disburse contractor payments.
                </p>
              </div>
              {activeUnit && activeProject && (
                <Link
                  href={`/admin/projects/${activeProject.id}/blocks/${activeUnit.block_id}/units/${activeUnit.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all min-h-[38px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Work Activities</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Building2,
  Home,
  CheckCircle2,
  Clock,
  Coins,
  ChevronRight,
  HardHat,
  Sparkles,
  Layers,
} from "lucide-react";
import PaymentFormModal from "@/app/admin/payments/PaymentFormModal";

export interface ProjectHubData {
  id: string;
  name: string;
  status: string;
  blocks: {
    id: string;
    name: string;
    units: {
      id: string;
      unit_number: string;
      floor?: string | null;
      status: string;
      unit_activities: any[];
    }[];
  }[];
}

interface WorkAndPaymentHubProps {
  projects?: any[];
}


export default function WorkAndPaymentHub({ projects = [] }: WorkAndPaymentHubProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  
  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Flatten units of current project
  const allUnitsOfProject: {
    id: string;
    unit_number: string;
    block_id: string;
    block_name: string;
    floor?: string | null;
    status: string;
    activitiesCount: number;
    avgProgress: number;
    activities: any[];
  }[] = [];

  (currentProject?.blocks || []).forEach((b: any) => {
    (b.units || []).forEach((u: any) => {
      const acts = u.unit_activities || [];
      const totalProg = acts.reduce((sum: number, a: any) => sum + (Number(a.progress_percentage) || 0), 0);
      const avgProg = acts.length > 0 ? Math.round(totalProg / acts.length) : 0;


      allUnitsOfProject.push({
        id: u.id,
        unit_number: u.unit_number,
        block_id: b.id,
        block_name: b.name,
        floor: u.floor,
        status: u.status,
        activitiesCount: acts.length,
        avgProgress: avgProg,
        activities: acts,
      });
    });
  });

  const [selectedUnitId, setSelectedUnitId] = useState<string>(allUnitsOfProject[0]?.id || "");
  const currentUnit = allUnitsOfProject.find((u) => u.id === selectedUnitId) || allUnitsOfProject[0];

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
        <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-3" />
        <p className="font-semibold text-slate-700">No active construction projects available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Hub Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Workflow &amp; Payment Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Work Activities &amp; Instant Disbursement
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Step 1: Select Project ➔ Step 2: Select Unit ➔ Step 3: Pay Directly on Activity
          </p>
        </div>
      </div>

      {/* Step 1: Project Selector Tabs */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          1. Select Project
        </label>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {projects.map((proj) => {
            const isSelected = proj.id === selectedProjectId;
            return (
              <button
                key={proj.id}
                onClick={() => {
                  setSelectedProjectId(proj.id);
                  const firstBlock = proj.blocks?.[0];
                  const firstUnit = firstBlock?.units?.[0];
                  if (firstUnit) setSelectedUnitId(firstUnit.id);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 border min-h-[42px] ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>{proj.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Unit Selector Tiles */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          2. Select Project Unit ({allUnitsOfProject.length} Units in {currentProject?.name})
        </label>
        {allUnitsOfProject.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1 bg-slate-50/70 border border-slate-200 rounded-2xl">
            {allUnitsOfProject.map((u) => {
              const isSelected = u.id === currentUnit?.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnitId(u.id)}
                  className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]"
                      : "bg-white hover:border-blue-300 text-slate-900 border-slate-200 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">
                      Unit {u.unit_number}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.block_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium pt-1 border-t border-slate-100/50">
                    <span className={isSelected ? "text-blue-100" : "text-slate-500"}>
                      {u.activitiesCount} tasks
                    </span>
                    <span
                      className={`font-bold font-mono ${
                        isSelected ? "text-white" : "text-emerald-700"
                      }`}
                    >
                      {u.avgProgress}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400">
            No units found for {currentProject?.name}.
          </div>
        )}
      </div>

      {/* Step 3: Work Activities Checklist for Selected Unit */}
      {currentUnit && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Work Activities in {currentUnit.block_name} — Unit {currentUnit.unit_number}
              </label>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Click <strong className="text-slate-900 font-semibold">&quot;Pay&quot;</strong> on any work activity to record disbursement instantly.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {currentUnit.activities?.length || 0} Total Activities
            </span>
          </div>

          {currentUnit.activities && currentUnit.activities.length > 0 ? (
            <div className="space-y-3">
              {currentUnit.activities.map((act: any) => {
                const actName = act.activity_master?.name || "Work Activity";
                const cCompany = act.project_contractors?.company_name || "";
                const cPerson = act.project_contractors?.profiles?.full_name || "";
                const contractorLabel = cCompany
                  ? `${cCompany}${cPerson && cPerson !== cCompany ? ` — ${cPerson}` : ""}`
                  : "Unassigned Contractor";

                const progress = Number(act.progress_percentage) || 0;
                const cost = Number(act.estimated_cost) || 0;

                return (
                  <div
                    key={act.id}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          {actName}
                        </h4>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                            progress === 100
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : progress > 0
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {progress}% Verified
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                        <HardHat className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{contractorLabel}</span>
                      </p>

                      {/* Progress Bar */}
                      <div className="w-full max-w-md bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            progress === 100
                              ? "bg-emerald-600"
                              : progress > 50
                              ? "bg-blue-600"
                              : "bg-amber-700"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Right Financials & Direct Payment Action */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Est. Cost
                        </span>
                        <strong className="text-sm sm:text-base font-bold font-mono text-slate-900">
                          ₹{cost.toLocaleString("en-IN")}
                        </strong>
                      </div>

                      {/* Direct Activity Payment Modal */}
                      <PaymentFormModal
                        projectId={currentProject.id}
                        unitActivityId={act.id}
                        triggerLabel="Pay"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-400" />
              <p className="font-semibold text-sm text-slate-700">
                No work progress activities assigned to Unit {currentUnit.unit_number} yet.
              </p>
              <p className="text-xs text-slate-500">
                Add activities to this unit from the Unit Checklist to start recording milestone disbursements.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

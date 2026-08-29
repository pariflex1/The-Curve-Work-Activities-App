"use client";

import { useState } from "react";
import { Plus, X, Sparkles, Copy, CheckSquare, Square, Search, Layers, ArrowRight, Tag } from "lucide-react";
import { provisionFromTemplate, copyFromUnit, provisionSingleActivity } from "./activity-actions";
import ActivitySearchSelect, { ActivityOption, PRESET_CONSTRUCTION_ACTIVITIES } from "@/components/ActivitySearchSelect";

interface ActivityMaster {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  default_unit: string | null;
  sort_order: number;
}

interface OtherUnit {
  id: string;
  unit_number: string;
  block_name?: string;
  activityCount: number;
}

export interface ProjectContractorOption {
  id: string;
  company_name: string;
  full_name?: string | null;
}

interface ProvisionModalProps {
  unitId: string;
  projectId: string;
  blockId: string;
  activeMasters: ActivityMaster[];
  existingMasterIds: string[];
  otherUnits: OtherUnit[];
  contractors?: ProjectContractorOption[];
  triggerLabel?: string;
}

export default function ProvisionModal({
  unitId,
  projectId,
  blockId,
  activeMasters,
  existingMasterIds,
  otherUnits,
  contractors = [],
  triggerLabel = "Provision Activities",
}: ProvisionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "batch" | "copy">("single");

  // Single / Custom Activity Mode State
  const [singleActivityName, setSingleActivityName] = useState("");
  const [singleActivityId, setSingleActivityId] = useState<string | undefined>(undefined);
  const [isSingleCustom, setIsSingleCustom] = useState(false);
  const [singleCategory, setSingleCategory] = useState("");
  const [singleCode, setSingleCode] = useState("");
  const [singleDefaultUnit, setSingleDefaultUnit] = useState("");
  const [singleEstimatedCost, setSingleEstimatedCost] = useState<number>(0);
  const [singleContractorId, setSingleContractorId] = useState<string>("");
  const [singleProgressPercentage, setSingleProgressPercentage] = useState<number>(0);
  const [singleStatus, setSingleStatus] = useState<string>("pending");
  const [singleRemarks, setSingleRemarks] = useState("");

  // Batch Mode State
  const [batchSearchQuery, setBatchSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [estimatedCosts, setEstimatedCosts] = useState<Record<string, number>>({});

  // Clone Mode State
  const [sourceUnitId, setSourceUnitId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formatted options for ActivitySearchSelect
  const searchSelectOptions: ActivityOption[] = activeMasters.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    code: m.code,
    default_unit: m.default_unit,
  }));

  // Batch filtered list
  const filteredBatchMasters = activeMasters.filter((m) => {
    if (!batchSearchQuery.trim()) return true;
    const q = batchSearchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q) ||
      m.code?.toLowerCase().includes(q)
    );
  });

  function handleSingleSelectChange(val: {
    name: string;
    isCustom: boolean;
    activityId?: string;
    category?: string;
    code?: string;
    default_unit?: string;
  }) {
    setSingleActivityName(val.name);
    setIsSingleCustom(val.isCustom);
    setSingleActivityId(val.activityId);
    if (val.category) setSingleCategory(val.category);
    if (val.code) setSingleCode(val.code);
    if (val.default_unit) setSingleDefaultUnit(val.default_unit);
  }

  function toggleSelect(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function selectAll() {
    const unprovisioned = activeMasters
      .filter((m) => !existingMasterIds.includes(m.id))
      .map((m) => m.id);
    setSelectedIds(unprovisioned);
  }

  function deselectAll() {
    setSelectedIds([]);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    let res;
    if (mode === "single") {
      if (!singleActivityName.trim()) {
        setError("Please select or enter an activity name.");
        setLoading(false);
        return;
      }
      res = await provisionSingleActivity(unitId, projectId, blockId, {
        activityMasterId: isSingleCustom ? undefined : singleActivityId,
        customName: singleActivityName,
        customCode: singleCode,
        customCategory: singleCategory,
        customDefaultUnit: singleDefaultUnit,
        estimatedCost: singleEstimatedCost,
        contractorId: singleContractorId || null,
        progressPercentage: singleProgressPercentage,
        status: singleStatus,
        remarks: singleRemarks,
      });
    } else if (mode === "batch") {
      if (selectedIds.length === 0) {
        setError("Please select at least one activity template.");
        setLoading(false);
        return;
      }
      res = await provisionFromTemplate(unitId, projectId, blockId, selectedIds, estimatedCosts);
    } else {
      if (!sourceUnitId) {
        setError("Please select a source unit to clone activities from.");
        setLoading(false);
        return;
      }
      res = await copyFromUnit(unitId, sourceUnitId, projectId, blockId);
    }

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
      // Reset state
      setSingleActivityName("");
      setSingleActivityId(undefined);
      setIsSingleCustom(false);
      setSingleEstimatedCost(0);
      setSingleContractorId("");
      setSingleProgressPercentage(0);
      setSingleStatus("pending");
      setSingleRemarks("");
      setSelectedIds([]);
      setSourceUnitId("");
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-xl bg-[#FFE5CC] hover:bg-[#FF7903] text-[#933D00] hover:text-white border border-[#FFD4AA] font-semibold flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm transition-all min-h-[40px] cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Work Progress Activity to Unit</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign work activities, set estimated costs, assign contractor, and record progress
                </p>
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode("single");
                  setError(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  mode === "single"
                    ? "bg-white text-blue-700 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Search &amp; Add</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("batch");
                  setError(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  mode === "batch"
                    ? "bg-white text-blue-700 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Batch Select</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("copy");
                  setError(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  mode === "copy"
                    ? "bg-white text-blue-700 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Clone Unit</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
              {mode === "single" ? (
                // Mode 1: Searchable Combobox with 'Other' option
                <div className="space-y-4 py-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Activity Name *
                    </label>
                    <ActivitySearchSelect
                      options={searchSelectOptions}
                      value={singleActivityName}
                      onChange={handleSingleSelectChange}
                      placeholder="Search activity or type for custom..."
                    />
                  </div>

                  {isSingleCustom && (
                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={singleCategory}
                          onChange={(e) => setSingleCategory(e.target.value)}
                          placeholder="e.g. Finishing, MEP"
                          className="w-full px-3 py-2 rounded-lg bg-white border border-amber-300 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                          Short Code
                        </label>
                        <input
                          type="text"
                          value={singleCode}
                          onChange={(e) => setSingleCode(e.target.value.toUpperCase())}
                          placeholder="e.g. CUS-1"
                          className="w-full px-3 py-2 rounded-lg bg-white border border-amber-300 text-slate-900 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Estimated Cost (₹)
                      </label>
                      <input
                        type="number"
                        step="100"
                        value={singleEstimatedCost || ""}
                        onChange={(e) => setSingleEstimatedCost(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Assigned Contractor
                      </label>
                      <select
                        value={singleContractorId}
                        onChange={(e) => setSingleContractorId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="">-- Unassigned --</option>
                        {contractors.map((c) => (
                          <option key={c.id} value={c.id}>
                            🏢 {c.company_name} {c.full_name ? `(${c.full_name})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Initial Progress %</span>
                        <span className="font-mono text-blue-600 font-bold">{singleProgressPercentage}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={singleProgressPercentage}
                        onChange={(e) => {
                          const p = parseInt(e.target.value, 10);
                          setSingleProgressPercentage(p);
                          if (p >= 100) setSingleStatus("completed");
                          else if (p > 0) setSingleStatus("in_progress");
                          else setSingleStatus("pending");
                        }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Work Status
                      </label>
                      <select
                        value={singleStatus}
                        onChange={(e) => {
                          const s = e.target.value;
                          setSingleStatus(s);
                          if (s === "completed" && singleProgressPercentage < 100) setSingleProgressPercentage(100);
                          else if (s === "pending") setSingleProgressPercentage(0);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Unit-Specific Notes / Remarks
                    </label>
                    <input
                      type="text"
                      value={singleRemarks}
                      onChange={(e) => setSingleRemarks(e.target.value)}
                      placeholder="e.g. East wall finishing, Phase 1"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                    />
                  </div>
                </div>

              ) : mode === "batch" ? (
                // Mode 2: Batch Select with live search
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={batchSearchQuery}
                        onChange={(e) => setBatchSearchQuery(e.target.value)}
                        placeholder="Filter activities list..."
                        className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-blue-600 hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="text-slate-500 hover:underline"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredBatchMasters.map((m) => {
                      const isAlreadyAdded = existingMasterIds.includes(m.id);
                      const isChecked = selectedIds.includes(m.id);

                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isAlreadyAdded
                              ? "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed"
                              : isChecked
                              ? "bg-blue-50/70 border-blue-300 shadow-sm"
                              : "bg-white border-slate-200 hover:border-slate-300 cursor-pointer"
                          }`}
                          onClick={() => {
                            if (!isAlreadyAdded) toggleSelect(m.id);
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {isAlreadyAdded ? (
                              <CheckSquare className="w-4 h-4 text-slate-400 shrink-0" />
                            ) : isChecked ? (
                              <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{m.name}</p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {m.category || "General"} {m.code ? `• ${m.code}` : ""}
                              </p>
                            </div>
                          </div>

                          {!isAlreadyAdded && isChecked && (
                            <div
                              className="flex items-center gap-1.5 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-xs text-slate-500 font-mono font-bold">₹</span>
                              <input
                                type="number"
                                placeholder="Est. Cost"
                                value={estimatedCosts[m.id] ?? ""}
                                onChange={(e) =>
                                  setEstimatedCosts({
                                    ...estimatedCosts,
                                    [m.id]: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-24 px-2 py-1 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          )}

                          {isAlreadyAdded && (
                            <span className="text-[11px] text-slate-400 italic shrink-0">Already Added</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Mode 3: Clone from unit
                <div className="space-y-4 py-2">
                  <p className="text-xs text-slate-600">
                    Select a unit from this project to clone its activity checklist and cost estimates into this unit as new independent rows:
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Source Unit
                    </label>
                    <select
                      value={sourceUnitId}
                      onChange={(e) => setSourceUnitId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm font-medium"
                    >
                      <option value="">-- Choose Unit to Clone From --</option>
                      {otherUnits.map((u) => (
                        <option key={u.id} value={u.id}>
                          Unit {u.unit_number} ({u.block_name || "Block"}) — {u.activityCount} Activities
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-blue-700">
                      <Sparkles className="w-4 h-4" />
                      <span>Data Independence Guarantee</span>
                    </p>
                    <p className="text-slate-600">
                      Cloned activities become completely independent copies. Modifying either unit's costs, contractor assignments, or progress will never affect the other.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {mode === "single"
                  ? singleActivityName
                    ? `Ready to add "${singleActivityName}"`
                    : "Pick an activity"
                  : mode === "batch"
                  ? `${selectedIds.length} activities selected`
                  : sourceUnitId
                  ? "Source selected"
                  : "Pick source"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FFE5CC] hover:bg-[#ffd9b3] text-[#933D00] border border-[#FFD4AA] text-xs sm:text-sm font-semibold transition-colors min-h-[40px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    (mode === "single"
                      ? !singleActivityName.trim()
                      : mode === "batch"
                      ? selectedIds.length === 0
                      : !sourceUnitId)
                  }
                  className="px-5 py-2 rounded-xl bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#FF7903]/20 transition-all disabled:opacity-50 min-h-[40px] cursor-pointer"
                >
                  {loading
                    ? "Saving..."
                    : mode === "single"
                    ? "Add Activity"
                    : mode === "batch"
                    ? "Insert Activities"
                    : "Clone Checklist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

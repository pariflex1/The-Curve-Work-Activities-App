"use client";

import { useState } from "react";
import { Plus, X, Sparkles, Copy, CheckSquare, Square, Building2, Coins } from "lucide-react";
import { provisionFromTemplate, copyFromUnit } from "./activity-actions";

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

interface ProvisionModalProps {
  unitId: string;
  projectId: string;
  blockId: string;
  activeMasters: ActivityMaster[];
  existingMasterIds: string[];
  otherUnits: OtherUnit[];
  triggerLabel?: string;
}

export default function ProvisionModal({
  unitId,
  projectId,
  blockId,
  activeMasters,
  existingMasterIds,
  otherUnits,
  triggerLabel = "Provision Activities",
}: ProvisionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"template" | "copy">("template");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [estimatedCosts, setEstimatedCosts] = useState<Record<string, number>>({});
  const [sourceUnitId, setSourceUnitId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (mode === "template") {
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
      setSelectedIds([]);
      setSourceUnitId("");
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Provision Unit Activities</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose a provisioning method to attach work activities to this unit
                </p>
              </div>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode("template");
                  setError(null);
                }}
                className={`py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  mode === "template"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Mode 1: From Master Template</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("copy");
                  setError(null);
                }}
                className={`py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  mode === "copy"
                    ? "bg-cyan-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>Mode 2: Copy from Another Unit</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
              {mode === "template" ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Select Master Activities
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-emerald-400 hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="text-slate-400 hover:underline"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {activeMasters.map((m) => {
                      const isAlreadyAdded = existingMasterIds.includes(m.id);
                      const isChecked = selectedIds.includes(m.id);

                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isAlreadyAdded
                              ? "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
                              : isChecked
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-white/5 border-white/10 hover:border-white/20 cursor-pointer"
                          }`}
                          onClick={() => {
                            if (!isAlreadyAdded) toggleSelect(m.id);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {isAlreadyAdded ? (
                              <CheckSquare className="w-5 h-5 text-slate-500" />
                            ) : isChecked ? (
                              <CheckSquare className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-500" />
                            )}
                            <div>
                              <p className="font-semibold text-white text-sm">{m.name}</p>
                              <p className="text-xs text-slate-400">
                                {m.category || "General"} {m.code ? `• ${m.code}` : ""}
                              </p>
                            </div>
                          </div>

                          {!isAlreadyAdded && isChecked && (
                            <div
                              className="flex items-center gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-xs text-slate-400 font-mono">₹</span>
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
                                className="w-28 px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-white/15 text-emerald-400 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          )}

                          {isAlreadyAdded && (
                            <span className="text-xs text-slate-500 italic">Already Added</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <p className="text-xs text-slate-400">
                    Select a unit from this project to clone its activity checklist and cost estimates into this unit as new independent rows:
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Source Unit
                    </label>
                    <select
                      value={sourceUnitId}
                      onChange={(e) => setSourceUnitId(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                    >
                      <option value="">-- Choose Unit to Clone From --</option>
                      {otherUnits.map((u) => (
                        <option key={u.id} value={u.id}>
                          Unit {u.unit_number} ({u.block_name || "Block"}) — {u.activityCount} Activities
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Data Independence Guarantee</span>
                    </p>
                    <p className="text-slate-400">
                      Cloned activities become completely independent copies. Modifying either unit's costs, contractor assignments, or progress will never affect the other.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-5 border-t border-white/10 mt-5 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {mode === "template"
                  ? `${selectedIds.length} activities selected`
                  : sourceUnitId
                  ? "Source selected"
                  : "Pick source"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || (mode === "template" ? selectedIds.length === 0 : !sourceUnitId)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-semibold shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? "Provisioning..." : mode === "template" ? "Insert Activities" : "Clone Activities"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

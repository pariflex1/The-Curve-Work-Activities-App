"use client";

import { useState } from "react";
import { X, Coins, Trash2 } from "lucide-react";
import { updateUnitActivity, deleteUnitActivity } from "./activity-actions";

interface EditCostModalProps {
  activity: {
    id: string;
    estimated_cost: number | null;
    remarks: string | null;
    activity_master?: {
      name: string;
    };
  };
  projectId: string;
  blockId: string;
  unitId: string;
}

export default function EditCostModal({
  activity,
  projectId,
  blockId,
  unitId,
}: EditCostModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cost, setCost] = useState(activity.estimated_cost?.toString() || "0");
  const [remarks, setRemarks] = useState(activity.remarks || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);

    const res = await updateUnitActivity(
      activity.id,
      projectId,
      blockId,
      unitId,
      parseFloat(cost) || 0,
      remarks
    );

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove "${activity.activity_master?.name}" from this unit?`)) return;
    setLoading(true);
    const res = await deleteUnitActivity(activity.id, projectId, blockId, unitId);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
      >
        Edit Cost
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {activity.activity_master?.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update estimated budget &amp; task notes for this specific unit
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Estimated Cost (₹) *
                </label>
                <input
                  type="number"
                  step="100"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Unit-Specific Notes / Scope
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Custom specifications for this unit..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-5 border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>

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
                  onClick={handleSave}
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-semibold shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Cost"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

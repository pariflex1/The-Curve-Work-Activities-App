"use client";

import { useState } from "react";
import { X, Coins, Trash2 } from "lucide-react";
import { updateUnitActivity, deleteUnitActivity } from "./activity-actions";

import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
      unitId,
      {
        blockId,
        estimatedCost: parseFloat(cost) || 0,
        remarks,
      }
    );

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
    }
  }

  async function handleConfirmDelete() {
    const res = await deleteUnitActivity(activity.id, projectId, unitId, blockId);
    if (res?.error) {
      return { error: res.error };
    }
    setIsOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors min-h-[36px]"
      >
        Edit Cost
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {activity.activity_master?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update estimated budget &amp; task notes for this specific unit
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Cost (₹) *
                </label>
                <input
                  type="number"
                  step="100"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Unit-Specific Notes / Scope
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Custom specifications for this unit..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                disabled={loading}
                className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 min-h-[44px]"
                >
                  {loading ? "Saving..." : "Save Cost"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={activity.activity_master?.name}
        itemType="activity"
        warningText="Removing this activity will permanently delete its estimated cost, progress records, and specs for this unit."
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { Edit, X, Sparkles, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { updateUnitActivity, deleteUnitActivity } from "@/app/admin/projects/[id]/blocks/[blockId]/units/[unitId]/activity-actions";

import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export interface ProjectContractorOption {
  id: string;
  company_name: string;
  profiles?: any;
}

interface ActivityEditModalProps {
  activity: {
    id: string;
    estimated_cost: number | null;
    progress_percentage: number;
    status: string;
    remarks: string | null;
    contractor_id: string | null;
    activity_master?: {
      name: string;
      category?: string | null;
      code?: string | null;
    } | null;
  };
  projectId: string;
  unitId: string;
  blockId?: string;
  contractors?: ProjectContractorOption[];
  allowDelete?: boolean;
  triggerLabel?: string;
}

export default function ActivityEditModal({
  activity,
  projectId,
  unitId,
  blockId,
  contractors = [],
  allowDelete = true,
  triggerLabel = "Edit",
}: ActivityEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [cost, setCost] = useState<number>(activity.estimated_cost || 0);
  const [progress, setProgress] = useState<number>(activity.progress_percentage || 0);
  const [status, setStatus] = useState<string>(activity.status || "pending");
  const [contractorId, setContractorId] = useState<string>(activity.contractor_id || "");
  const [remarks, setRemarks] = useState<string>(activity.remarks || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleProgressChange(newVal: number) {
    setProgress(newVal);
    // Auto-update status based on progress
    if (newVal >= 100) {
      setStatus("completed");
    } else if (newVal > 0) {
      setStatus("in_progress");
    } else {
      setStatus("pending");
    }
  }

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    // Auto-update progress based on status
    if (newStatus === "completed" && progress < 100) {
      setProgress(100);
    } else if (newStatus === "pending" && progress > 0) {
      setProgress(0);
    } else if (newStatus === "in_progress" && progress === 0) {
      setProgress(25);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await updateUnitActivity(activity.id, projectId, unitId, {
      blockId,
      estimatedCost: cost,
      progressPercentage: progress,
      status,
      contractorId: contractorId ? contractorId : null,
      remarks,
    });

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
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors min-h-[32px] inline-flex items-center gap-1"
      >
        <Edit className="w-3.5 h-3.5 text-slate-500" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">
                  Update Activity: {activity.activity_master?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activity.activity_master?.category || "General"} {activity.activity_master?.code ? `• ${activity.activity_master.code}` : ""}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Progress Slider & Quick Buttons */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Work Progress Completion
                  </label>
                  <span className="text-xl font-bold font-mono text-black">{progress}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                />

                <div className="flex gap-1.5 pt-1">
                  {[0, 25, 50, 75, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleProgressChange(val)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        progress === val
                          ? "bg-black text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selector & Estimated Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Activity Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black text-sm font-semibold"
                  >
                    <option value="pending">Pending (0%)</option>
                    <option value="in_progress">In Progress (1% - 99%)</option>
                    <option value="completed">Completed (100%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black text-sm font-bold font-mono"
                  />
                </div>
              </div>

              {/* Assigned Contractor */}
              {contractors && contractors.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Assigned Contractor
                  </label>
                  <select
                    value={contractorId}
                    onChange={(e) => setContractorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  >
                    <option value="">-- Unassigned --</option>
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name} {c.profiles?.full_name ? `(${c.profiles.full_name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Unit-Specific Notes & Remarks */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Remarks / Unit Specifications
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Completed foundation footing, curing in progress..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-6">
                {allowDelete ? (
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[42px]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors min-h-[42px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 min-h-[42px]"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {allowDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={activity.activity_master?.name}
          itemType="unit activity"
          warningText="Deleting this activity from the unit will permanently remove its recorded progress, specifications, and contractor assignments."
        />
      )}
    </>
  );
}

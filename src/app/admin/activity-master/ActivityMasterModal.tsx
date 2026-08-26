"use client";

import { useState } from "react";
import { Plus, X, FileSpreadsheet, Trash2 } from "lucide-react";
import { createActivityMaster, updateActivityMaster, deleteActivityMaster } from "./actions";

interface ActivityMasterModalProps {
  activity?: {
    id: string;
    name: string;
    code: string | null;
    category: string | null;
    description: string | null;
    default_unit: string | null;
    sort_order: number;
    is_active: boolean;
  };
  triggerLabel?: string;
  isEdit?: boolean;
}

export default function ActivityMasterModal({
  activity,
  triggerLabel = "New Activity",
  isEdit = false,
}: ActivityMasterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    let res;
    if (isEdit && activity) {
      res = await updateActivityMaster(activity.id, formData);
    } else {
      res = await createActivityMaster(formData);
    }

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
    }
  }

  async function handleDelete() {
    if (!activity || !confirm(`Are you sure you want to delete activity "${activity.name}"?`)) {
      return;
    }
    setLoading(true);
    const res = await deleteActivityMaster(activity.id);
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
      {isEdit ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
        >
          Edit
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold flex items-center gap-1.5 text-sm shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{triggerLabel}</span>
        </button>
      )}

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
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isEdit ? "Edit Activity Template" : "Add Activity Template"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEdit ? "Update standard activity definition" : "Define a standard construction task"}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Activity Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={activity?.name || ""}
                  placeholder="e.g. Waterproofing, False Ceiling"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Short Code
                  </label>
                  <input
                    name="code"
                    type="text"
                    defaultValue={activity?.code || ""}
                    placeholder="e.g. WPF, FCL"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    name="category"
                    type="text"
                    defaultValue={activity?.category || ""}
                    placeholder="e.g. Structural, Finishing, MEP"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Default Unit
                  </label>
                  <input
                    name="default_unit"
                    type="text"
                    defaultValue={activity?.default_unit || ""}
                    placeholder="sq.ft / r.ft / nos"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Sort Order
                  </label>
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={activity?.sort_order ?? 0}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description / Specifications
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={activity?.description || ""}
                  placeholder="Details regarding quality standards, materials, or scope..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  name="is_active"
                  defaultValue={activity ? (activity.is_active ? "true" : "false") : "true"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                >
                  <option value="true">Active (Included in template checklists)</option>
                  <option value="false">Inactive (Hidden from new unit provisioning)</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 mt-6">
                {isEdit ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-all"
                  >
                    Delete
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Activity"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

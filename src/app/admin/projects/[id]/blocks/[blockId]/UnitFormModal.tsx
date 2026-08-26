"use client";

import { useState } from "react";
import { Plus, X, Home } from "lucide-react";
import { createUnit, updateUnit, deleteUnit } from "../../../actions";

interface UnitFormModalProps {
  projectId: string;
  blockId: string;
  unit?: {
    id: string;
    unit_number: string;
    floor: string | null;
    unit_type: string | null;
    area: number | null;
    status: string;
  };
  triggerLabel?: string;
  isEdit?: boolean;
}

export default function UnitFormModal({
  projectId,
  blockId,
  unit,
  triggerLabel = "Add Unit",
  isEdit = false,
}: UnitFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    let res;
    if (isEdit && unit) {
      res = await updateUnit(unit.id, blockId, projectId, formData);
    } else {
      res = await createUnit(blockId, projectId, formData);
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
    if (!unit || !confirm("Are you sure you want to delete this unit?")) {
      return;
    }
    setLoading(true);
    const res = await deleteUnit(unit.id, blockId, projectId);
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
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold flex items-center gap-1.5 text-sm shadow-md transition-all cursor-pointer"
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
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isEdit ? "Edit Unit" : "Add New Unit"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEdit ? "Update unit specs and status" : "Create a new unit inside this block"}
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
                  Unit Number / Name *
                </label>
                <input
                  name="unit_number"
                  type="text"
                  required
                  defaultValue={unit?.unit_number || ""}
                  placeholder="e.g. 101, A-302, Penthouse 1"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Floor
                  </label>
                  <input
                    name="floor"
                    type="text"
                    defaultValue={unit?.floor || ""}
                    placeholder="e.g. 1st Floor"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Unit Type
                  </label>
                  <input
                    name="unit_type"
                    type="text"
                    defaultValue={unit?.unit_type || ""}
                    placeholder="e.g. 3 BHK, Studio"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Area (sq.ft)
                  </label>
                  <input
                    name="area"
                    type="number"
                    step="0.01"
                    defaultValue={unit?.area ?? ""}
                    placeholder="1250"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={unit?.status || "active"}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Unit"}
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

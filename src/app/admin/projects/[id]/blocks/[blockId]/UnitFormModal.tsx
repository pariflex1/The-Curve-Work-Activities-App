"use client";

import { useState } from "react";
import { Plus, X, Home, Trash2 } from "lucide-react";
import { createUnit, updateUnit, deleteUnit } from "../../../actions";

import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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

  async function handleConfirmDelete() {
    if (!unit) return;
    const res = await deleteUnit(unit.id, blockId, projectId);
    if (res?.error) {
      return { error: res.error };
    }
    setIsOpen(false);
  }

  return (
    <>
      {isEdit ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-[#FFE5CC] border border-[#FFD4AA] hover:bg-[#FF7903] text-[#933D00] hover:text-white text-xs font-semibold transition-colors min-h-[36px] cursor-pointer"
        >
          Edit
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-[#FF7903] hover:bg-[#e66a00] text-white font-semibold flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm shadow-[#FF7903]/20 transition-all min-h-[40px] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{triggerLabel}</span>
        </button>
      )}

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
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isEdit ? "Edit Unit" : "Add New Unit"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEdit ? "Update unit specs and status" : "Create a new unit inside this block"}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Unit Number / Name *
                </label>
                <input
                  name="unit_number"
                  type="text"
                  required
                  defaultValue={unit?.unit_number || ""}
                  placeholder="e.g. 101, A-302, Penthouse 1"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Floor
                  </label>
                  <input
                    name="floor"
                    type="text"
                    defaultValue={unit?.floor || ""}
                    placeholder="e.g. 1st Floor"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Unit Type
                  </label>
                  <input
                    name="unit_type"
                    type="text"
                    defaultValue={unit?.unit_type || ""}
                    placeholder="e.g. 3 BHK, Studio"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Area (sq.ft)
                  </label>
                  <input
                    name="area"
                    type="number"
                    step="0.01"
                    defaultValue={unit?.area ?? ""}
                    placeholder="1250"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={unit?.status || "active"}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-6">
                {isEdit ? (
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
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
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#FFE5CC] hover:bg-[#ffd9b3] text-[#933D00] border border-[#FFD4AA] text-xs sm:text-sm font-semibold transition-colors min-h-[44px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#FF7903]/20 transition-all disabled:opacity-50 min-h-[44px] cursor-pointer"
                  >
                    {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Unit"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEdit && unit && (
        <DeleteConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={`Unit ${unit.unit_number}`}
          itemType="unit"
          warningText="Deleting this unit will permanently remove all associated work activities, contractor assignments, and progress history for this unit."
        />
      )}
    </>
  );
}

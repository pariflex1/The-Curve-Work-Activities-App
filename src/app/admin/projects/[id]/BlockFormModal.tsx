"use client";

import { useState } from "react";
import { Plus, X, Layers, Trash2 } from "lucide-react";
import { createBlock, updateBlock, deleteBlock } from "../actions";

import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface BlockFormModalProps {
  projectId: string;
  block?: {
    id: string;
    name: string;
    sort_order: number;
  };
  triggerLabel?: string;
  isEdit?: boolean;
}

export default function BlockFormModal({
  projectId,
  block,
  triggerLabel = "Add Block",
  isEdit = false,
}: BlockFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    let res;
    if (isEdit && block) {
      res = await updateBlock(block.id, projectId, formData);
    } else {
      res = await createBlock(projectId, formData);
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
    if (!block) return;
    const res = await deleteBlock(block.id, projectId);
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
          className="px-3 py-1.5 rounded-xl bg-[#FFE5CC] border border-[#FFD4AA] hover:bg-[#FF7903] text-[#933D00] hover:text-white text-xs font-semibold transition-colors min-h-[36px] cursor-pointer"
        >
          Edit
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-[#FFE5CC] border border-[#FFD4AA] text-[#933D00] hover:bg-[#FF7903] hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer"
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
              <div className="w-11 h-11 bg-[#FFE5CC] text-[#FF7903] border border-[#FFD4AA] rounded-xl flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isEdit ? "Edit Block" : "Add New Block"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEdit ? "Update block or tower properties" : "Add a structural division to this project"}
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
                  Block / Tower Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={block?.name || ""}
                  placeholder="e.g. Tower A, Block 1, North Wing"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7903] focus:bg-white text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Sort Order
                </label>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={block?.sort_order ?? 0}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7903] focus:bg-white text-base sm:text-sm"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-6">
                {isEdit ? (
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
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
                    {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Block"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEdit && block && (
        <DeleteConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={block.name}
          itemType="block"
          warningText="Deleting this block will permanently remove all associated units and their work activities."
        />
      )}
    </>
  );
}

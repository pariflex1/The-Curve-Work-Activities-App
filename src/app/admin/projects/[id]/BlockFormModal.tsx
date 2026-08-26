"use client";

import { useState } from "react";
import { Plus, X, Layers } from "lucide-react";
import { createBlock, updateBlock, deleteBlock } from "../actions";

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

  async function handleDelete() {
    if (!block || !confirm("Are you sure you want to delete this block? All units in this block will be deleted.")) {
      return;
    }
    setLoading(true);
    const res = await deleteBlock(block.id, projectId);
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
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-sm font-medium transition-all"
        >
          Edit
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
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
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isEdit ? "Edit Block" : "Add New Block"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEdit ? "Update block or tower properties" : "Add a structural division to this project"}
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
                  Block / Tower Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={block?.name || ""}
                  placeholder="e.g. Tower A, Block 1, North Wing"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Display Sort Order
                </label>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={block?.sort_order ?? 0}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 mt-6">
                {isEdit ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-all"
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
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Block"}
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

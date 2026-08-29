"use client";

import { useState, useEffect } from "react";
import { Plus, X, FileSpreadsheet, Trash2 } from "lucide-react";
import { createActivityMaster, updateActivityMaster, deleteActivityMaster } from "./actions";
import ActivitySearchSelect, { PRESET_CONSTRUCTION_ACTIVITIES } from "@/components/ActivitySearchSelect";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [name, setName] = useState(activity?.name || "");
  const [code, setCode] = useState(activity?.code || "");
  const [category, setCategory] = useState(activity?.category || "");
  const [defaultUnit, setDefaultUnit] = useState(activity?.default_unit || "");
  const [description, setDescription] = useState(activity?.description || "");
  const [sortOrder, setSortOrder] = useState<number>(activity?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(activity ? (activity.is_active ? "true" : "false") : "true");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when editing or reopening
  useEffect(() => {
    if (activity) {
      setName(activity.name || "");
      setCode(activity.code || "");
      setCategory(activity.category || "");
      setDefaultUnit(activity.default_unit || "");
      setDescription(activity.description || "");
      setSortOrder(activity.sort_order ?? 0);
      setIsActive(activity.is_active ? "true" : "false");
    } else {
      setName("");
      setCode("");
      setCategory("");
      setDefaultUnit("");
      setDescription("");
      setSortOrder(0);
      setIsActive("true");
    }
  }, [activity, isOpen]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    // Explicitly set controlled state values
    formData.set("name", name);
    formData.set("code", code);
    formData.set("category", category);
    formData.set("default_unit", defaultUnit);
    formData.set("description", description);
    formData.set("sort_order", sortOrder.toString());
    formData.set("is_active", isActive);

    if (!name.trim()) {
      setError("Activity name is required.");
      setLoading(false);
      return;
    }

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

  async function handleConfirmDelete() {
    if (!activity) return { error: "No activity selected" };
    const res = await deleteActivityMaster(activity.id);
    if (res?.error) {
      return { error: res.error };
    }
    setIsOpen(false);
    return { success: true };
  }

  function handleActivitySelect(selected: {
    name: string;
    isCustom: boolean;
    category?: string;
    code?: string;
    default_unit?: string;
  }) {
    setName(selected.name);
    // Autofill suggested fields if empty or standard option selected
    if (!isEdit || !category) {
      if (selected.category) setCategory(selected.category);
    }
    if (!isEdit || !code) {
      if (selected.code) setCode(selected.code);
    }
    if (!isEdit || !defaultUnit) {
      if (selected.default_unit) setDefaultUnit(selected.default_unit);
    }
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
          className="px-4 py-2.5 rounded-xl bg-[#FF7903] hover:bg-[#e66a00] text-white font-semibold flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm shadow-[#FF7903]/20 transition-all min-h-[44px] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{triggerLabel}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-[#FFE5CC] text-[#FF7903] border border-[#FFD4AA] rounded-xl flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isEdit ? "Edit Activity Template" : "Add Activity Template"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select from standard catalog or define a custom construction activity
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              {/* Searchable Activity Dropdown with 'Other' option */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Activity Name *
                </label>
                <ActivitySearchSelect
                  options={PRESET_CONSTRUCTION_ACTIVITIES}
                  value={name}
                  onChange={handleActivitySelect}
                  placeholder="Select standard activity or type to search..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Short Code
                  </label>
                  <input
                    name="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WPF, FCL"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    name="category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Structural, Finishing"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Default Unit of Measurement
                  </label>
                  <input
                    name="default_unit"
                    type="text"
                    value={defaultUnit}
                    onChange={(e) => setDefaultUnit(e.target.value)}
                    placeholder="sq.ft / r.ft / nos / cu.m"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sort Order
                  </label>
                  <input
                    name="sort_order"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Quality Specifications
                </label>
                <textarea
                  name="description"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding quality standards, materials, or scope..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  name="is_active"
                  value={isActive}
                  onChange={(e) => setIsActive(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                >
                  <option value="true">Active (Included in template checklists)</option>
                  <option value="false">Inactive (Hidden from new unit provisioning)</option>
                </select>
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
                    disabled={loading || !name.trim()}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#FF7903]/20 transition-all disabled:opacity-50 min-h-[44px] cursor-pointer"
                  >
                    {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Activity"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEdit && activity && (
        <DeleteConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={activity.name}
          itemType="activity template"
          warningText="Deleting this standard activity template from the catalog will not remove existing unit activities that were already created from it, but will prevent it from appearing in future checklists."
        />
      )}
    </>
  );
}

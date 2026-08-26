"use client";

import { useState } from "react";
import { Plus, X, Building2, Trash2 } from "lucide-react";
import { createProject, updateProject, deleteProject } from "./actions";

import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface ProjectFormModalProps {
  project?: {
    id: string;
    name: string;
    location: string | null;
    status: string;
  };
  triggerLabel?: string;
  isEdit?: boolean;
}

export default function ProjectFormModal({
  project,
  triggerLabel = "New Project",
  isEdit = false,
}: ProjectFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    let res;
    if (isEdit && project) {
      res = await updateProject(project.id, formData);
    } else {
      res = await createProject(formData);
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
    if (!project) return;
    const res = await deleteProject(project.id);
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
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors min-h-[40px]"
        >
          Edit Settings
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>{triggerLabel}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isEdit ? "Edit Project" : "Create New Project"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEdit ? "Update project details and operational status" : "Set up a new real estate development project"}
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
                  Project Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={project?.name || ""}
                  placeholder="e.g. Skyline Heights Phase 1"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <input
                  name="location"
                  type="text"
                  defaultValue={project?.location || ""}
                  placeholder="e.g. Bandra Kurla Complex, Mumbai"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={project?.status || "active"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
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
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEdit && project && (
        <DeleteConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={project.name}
          itemType="project"
          warningText="Deleting this project will permanently remove all associated blocks, units, activity records, and assignments."
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { Plus, X, Building2, MapPin, CheckCircle2 } from "lucide-react";
import { createProject, updateProject, deleteProject } from "./actions";

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

  async function handleDelete() {
    if (!project || !confirm("Are you sure you want to delete this project? All associated blocks and units will be removed.")) {
      return;
    }
    setLoading(true);
    const res = await deleteProject(project.id);
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
          className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-sm font-medium"
        >
          Edit Settings
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer"
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
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isEdit ? "Edit Project" : "Create New Project"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEdit ? "Update project details and operational status" : "Set up a new real estate development project"}
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
                  Project Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={project?.name || ""}
                  placeholder="e.g. Skyline Heights Phase 1"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <input
                  name="location"
                  type="text"
                  defaultValue={project?.location || ""}
                  placeholder="e.g. Sector 62, Gurgaon, Haryana"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={project?.status || "active"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
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
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
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

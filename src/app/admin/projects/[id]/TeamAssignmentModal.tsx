"use client";

import { useState } from "react";
import { Users, X, UserPlus, Trash2 } from "lucide-react";
import {
  assignEmployee,
  removeEmployee,
  assignContractor,
  removeContractor,
  assignOwner,
  removeOwner,
} from "../actions";

import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface Profile {
  id: string;
  full_name: string;
  role: string;
  phone: string | null;
}

interface TeamAssignmentModalProps {
  projectId: string;
  profiles: Profile[];
  assignedEmployeeIds: string[];
  assignedContractorIds: string[];
  assignedOwnerIds: string[];
}

export default function TeamAssignmentModal({
  projectId,
  profiles,
  assignedEmployeeIds,
  assignedContractorIds,
  assignedOwnerIds,
}: TeamAssignmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"employee" | "contractor" | "owner">("employee");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "employee" | "contractor" | "owner";
    profileId: string;
    name: string;
  } | null>(null);

  const availableEmployees = profiles.filter(
    (p) => (p.role === "employee" || p.role === "admin") && !assignedEmployeeIds.includes(p.id)
  );

  const availableContractors = profiles.filter(
    (p) => p.role === "contractor" && !assignedContractorIds.includes(p.id)
  );

  const availableOwners = profiles.filter(
    (p) => (p.role === "owner" || p.role === "admin") && !assignedOwnerIds.includes(p.id)
  );

  async function handleAssign() {
    if (!selectedProfileId) return;
    setLoading(true);
    setError(null);

    let res;
    if (activeTab === "employee") {
      res = await assignEmployee(projectId, selectedProfileId);
    } else if (activeTab === "contractor") {
      if (!companyName.trim()) {
        setError("Company name is required for contractors");
        setLoading(false);
        return;
      }
      res = await assignContractor(projectId, selectedProfileId, companyName);
    } else if (activeTab === "owner") {
      res = await assignOwner(projectId, selectedProfileId);
    }

    if (res?.error) {
      setError(res.error);
    } else {
      setSelectedProfileId("");
      setCompanyName("");
    }
    setLoading(false);
  }

  async function handleConfirmRemove() {
    if (!deleteTarget) return;
    setLoading(true);
    let res;
    if (deleteTarget.type === "employee") res = await removeEmployee(projectId, deleteTarget.profileId);
    if (deleteTarget.type === "contractor") res = await removeContractor(projectId, deleteTarget.profileId);
    if (deleteTarget.type === "owner") res = await removeOwner(projectId, deleteTarget.profileId);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
      return { error: res.error };
    }
    setLoading(false);
    setDeleteTarget(null);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
      >
        <UserPlus className="w-4 h-4" />
        <span>Manage Team</span>
      </button>

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
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Project Team Allocations</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Link authorized personnel to this project for role-based scoping
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("employee");
                  setSelectedProfileId("");
                  setError(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "employee"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Employees
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("contractor");
                  setSelectedProfileId("");
                  setError(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "contractor"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Contractors
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("owner");
                  setSelectedProfileId("");
                  setError(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "owner"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Owners
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Allocation Form */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mb-6">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Assign New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </p>

              <div>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                >
                  <option value="">-- Select Person --</option>
                  {(activeTab === "employee"
                    ? availableEmployees
                    : activeTab === "contractor"
                    ? availableContractors
                    : availableOwners
                  ).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.role}) {p.phone ? `— ${p.phone}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {activeTab === "contractor" && (
                <div>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company / Agency Name (e.g. Apex Electricals)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleAssign}
                disabled={loading || !selectedProfileId}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 min-h-[44px]"
              >
                {loading ? "Assigning..." : "Add to Project"}
              </button>
            </div>

            {/* Current Members in this Category */}
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Currently Assigned ({activeTab}s)
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {profiles
                  .filter((p) =>
                    activeTab === "employee"
                      ? assignedEmployeeIds.includes(p.id)
                      : activeTab === "contractor"
                      ? assignedContractorIds.includes(p.id)
                      : assignedOwnerIds.includes(p.id)
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{p.full_name}</p>
                        <p className="text-xs text-slate-500">{p.phone || "No phone registered"}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: activeTab,
                            profileId: p.id,
                            name: p.full_name,
                          })
                        }
                        disabled={loading}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmationModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmRemove}
          itemName={deleteTarget.name}
          itemType={`${deleteTarget.type} allocation`}
          warningText={`Removing ${deleteTarget.name} from this project will revoke their role access and visibility to this project's blocks, units, and progress reports.`}
        />
      )}
    </>
  );
}

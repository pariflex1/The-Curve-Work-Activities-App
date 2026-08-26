"use client";

import { useState } from "react";
import { Users, X, UserPlus, Trash2, CheckCircle2, Building2 } from "lucide-react";
import {
  assignEmployee,
  removeEmployee,
  assignContractor,
  removeContractor,
  assignOwner,
  removeOwner,
} from "../actions";

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

  async function handleRemove(type: "employee" | "contractor" | "owner", profileId: string) {
    if (!confirm("Remove this member from the project?")) return;
    setLoading(true);
    let res;
    if (type === "employee") res = await removeEmployee(projectId, profileId);
    if (type === "contractor") res = await removeContractor(projectId, profileId);
    if (type === "owner") res = await removeOwner(projectId, profileId);

    if (res?.error) setError(res.error);
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <UserPlus className="w-4 h-4" />
        <span>Manage Team</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Project Team Allocations</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Link authorized personnel to this project for role-based scoping
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("employee");
                  setSelectedProfileId("");
                  setError(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "employee"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
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
                    ? "bg-amber-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
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
                    ? "bg-cyan-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Owners
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Allocation Form */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 mb-6">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Assign New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </p>

              <div>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleAssign}
                disabled={loading || !selectedProfileId}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {loading ? "Assigning..." : "Add to Project"}
              </button>
            </div>

            {/* Current Members in this Category */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-white">{p.full_name}</p>
                        <p className="text-xs text-slate-400">{p.phone || "No phone registered"}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(activeTab, p.id)}
                        disabled={loading}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-sm font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import {
  Users,
  X,
  UserPlus,
  Trash2,
  Sliders,
  Shield,
  Layers,
  Home,
  CheckCircle2,
  Globe,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  assignEmployee,
  removeEmployee,
  updateEmployeeHierarchy,
  assignContractor,
  removeContractor,
  assignOwner,
  removeOwner,
} from "../actions";
import { AccessLevel, EmployeeHierarchy } from "@/utils/hierarchy";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface Profile {
  id: string;
  full_name: string;
  role: string;
  phone: string | null;
}

export interface AssignedEmployeeItem {
  id: string;
  profile_id: string;
  full_name: string;
  phone: string | null;
  hierarchy: EmployeeHierarchy;
}

export interface AssignedContractorItem {
  id: string;
  profile_id: string;
  full_name: string;
  company_name: string;
  phone: string | null;
}

export interface AssignedOwnerItem {
  id: string;
  profile_id: string;
  full_name: string;
  phone: string | null;
}

export interface ProjectBlockItem {
  id: string;
  name: string;
  units?: { id: string; unit_number: string; floor?: string; unit_type?: string }[];
}

interface TeamAssignmentModalProps {
  projectId: string;
  profiles: Profile[];
  assignedEmployees: AssignedEmployeeItem[];
  assignedContractors: AssignedContractorItem[];
  assignedOwners: AssignedOwnerItem[];
  projectBlocks: ProjectBlockItem[];
}

export default function TeamAssignmentModal({
  projectId,
  profiles,
  assignedEmployees = [],
  assignedContractors = [],
  assignedOwners = [],
  projectBlocks = [],
}: TeamAssignmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"employee" | "contractor" | "owner">("employee");
  
  // Selection state
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  // Hierarchy state for Employee assignment
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("full_project");
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  
  // Editing existing employee hierarchy
  const [editingEmployee, setEditingEmployee] = useState<AssignedEmployeeItem | null>(null);
  const [editAccessLevel, setEditAccessLevel] = useState<AccessLevel>("full_project");
  const [editBlockIds, setEditBlockIds] = useState<string[]>([]);
  const [editUnitIds, setEditUnitIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "employee" | "contractor" | "owner";
    profileId: string;
    name: string;
  } | null>(null);

  const assignedEmployeeIds = assignedEmployees.map((e) => e.profile_id);
  const assignedContractorIds = assignedContractors.map((c) => c.profile_id);
  const assignedOwnerIds = assignedOwners.map((o) => o.profile_id);

  const availableEmployees = profiles.filter(
    (p) => (p.role === "employee" || p.role === "admin") && !assignedEmployeeIds.includes(p.id)
  );

  const availableContractors = profiles.filter(
    (p) => p.role === "contractor" && !assignedContractorIds.includes(p.id)
  );

  const availableOwners = profiles.filter(
    (p) => (p.role === "owner" || p.role === "admin") && !assignedOwnerIds.includes(p.id)
  );

  function resetCreateForm() {
    setSelectedProfileId("");
    setCompanyName("");
    setAccessLevel("full_project");
    setSelectedBlockIds([]);
    setSelectedUnitIds([]);
    setError(null);
  }

  function startEditHierarchy(emp: AssignedEmployeeItem) {
    setEditingEmployee(emp);
    setEditAccessLevel(emp.hierarchy?.access_level || "full_project");
    setEditBlockIds(emp.hierarchy?.block_ids || []);
    setEditUnitIds(emp.hierarchy?.unit_ids || []);
    setError(null);
    setSuccessMsg(null);
  }

  async function handleAssign() {
    if (!selectedProfileId) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    let res;
    if (activeTab === "employee") {
      if (accessLevel === "block_level" && selectedBlockIds.length === 0) {
        setError("Please select at least one block for Block-level scope.");
        setLoading(false);
        return;
      }
      if (accessLevel === "unit_level" && selectedUnitIds.length === 0) {
        setError("Please select at least one unit for Unit-level scope.");
        setLoading(false);
        return;
      }

      res = await assignEmployee(projectId, selectedProfileId, {
        accessLevel,
        blockIds: selectedBlockIds,
        unitIds: selectedUnitIds,
      });
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
      setSuccessMsg("Team member successfully assigned!");
      resetCreateForm();
    }
    setLoading(false);
  }

  async function handleSaveHierarchyEdit() {
    if (!editingEmployee) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (editAccessLevel === "block_level" && editBlockIds.length === 0) {
      setError("Please select at least one block for Block-level scope.");
      setLoading(false);
      return;
    }
    if (editAccessLevel === "unit_level" && editUnitIds.length === 0) {
      setError("Please select at least one unit for Unit-level scope.");
      setLoading(false);
      return;
    }

    const res = await updateEmployeeHierarchy(projectId, editingEmployee.profile_id, {
      accessLevel: editAccessLevel,
      blockIds: editBlockIds,
      unitIds: editUnitIds,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccessMsg(`Permissions updated for ${editingEmployee.full_name}`);
      setEditingEmployee(null);
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
        onClick={() => {
          setIsOpen(true);
          setError(null);
          setSuccessMsg(null);
        }}
        className="px-3.5 py-2 rounded-xl bg-[#FFE5CC] border border-[#FFD4AA] text-[#933D00] hover:bg-[#FF7903] hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer"
      >
        <UserPlus className="w-4 h-4" />
        <span>Manage Team &amp; Hierarchy</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-2xl p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Project Team &amp; Hierarchy</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure site engineers, supervision scopes (Full Project, Block or Unit), and contractors
                </p>
              </div>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("employee");
                  resetCreateForm();
                }}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "employee"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Engineers ({assignedEmployees.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("contractor");
                  resetCreateForm();
                }}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "contractor"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Contractors ({assignedContractors.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("owner");
                  resetCreateForm();
                }}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "owner"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Owners ({assignedOwners.length})
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                {successMsg}
              </div>
            )}

            {/* Allocation & Hierarchy Assignment Box */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 mb-6">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Assign New {activeTab === "employee" ? "Site Engineer / Supervisor" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select User Account *
                </label>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                >
                  <option value="">-- Choose User --</option>
                  {(activeTab === "employee"
                    ? availableEmployees
                    : activeTab === "contractor"
                    ? availableContractors
                    : availableOwners
                  ).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.role.toUpperCase()}) {p.phone ? `— 📱 ${p.phone}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hierarchy Configuration (Only for Engineers / Supervisors) */}
              {activeTab === "employee" && (
                <div className="pt-2 border-t border-slate-200/80 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Hierarchy &amp; Supervision Scope:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Option 1: Full Project (Default) */}
                      <button
                        type="button"
                        onClick={() => setAccessLevel("full_project")}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          accessLevel === "full_project"
                            ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <Globe className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Full Project</span>
                          </div>
                          <span className="text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Default</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Manage all Blocks &amp; all Units in this project
                        </p>
                      </button>

                      {/* Option 2: Block Level */}
                      <button
                        type="button"
                        onClick={() => setAccessLevel("block_level")}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          accessLevel === "block_level"
                            ? "bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          <span>Block Level</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Restrict to specific assigned block(s)
                        </p>
                      </button>

                      {/* Option 3: Unit Level */}
                      <button
                        type="button"
                        onClick={() => setAccessLevel("unit_level")}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          accessLevel === "unit_level"
                            ? "bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-500/20"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Home className="w-3.5 h-3.5 text-purple-600" />
                          <span>Unit Level</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Restrict to specific assigned unit(s)
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Block Level Picker */}
                  {accessLevel === "block_level" && (
                    <div className="p-3 bg-white border border-blue-200 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-slate-800">
                        Select Authorized Block(s):
                      </p>
                      {projectBlocks.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {projectBlocks.map((b) => {
                            const isChecked = selectedBlockIds.includes(b.id);
                            return (
                              <label
                                key={b.id}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? "bg-blue-50 border-blue-400 text-blue-900 font-semibold"
                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBlockIds((prev) => [...prev, b.id]);
                                    } else {
                                      setSelectedBlockIds((prev) => prev.filter((id) => id !== b.id));
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-blue-600"
                                />
                                <span>{b.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({b.units?.length || 0} units)
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No blocks found in this project.</p>
                      )}
                    </div>
                  )}

                  {/* Unit Level Picker */}
                  {accessLevel === "unit_level" && (
                    <div className="p-3 bg-white border border-purple-200 rounded-xl space-y-3 max-h-56 overflow-y-auto">
                      <p className="text-xs font-semibold text-slate-800">
                        Select Authorized Unit(s) across Blocks:
                      </p>
                      {projectBlocks.length > 0 ? (
                        projectBlocks.map((b) => (
                          <div key={b.id} className="space-y-1.5">
                            <p className="text-[11px] font-bold text-slate-600 uppercase">
                              Block {b.name}
                            </p>
                            {b.units && b.units.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                {b.units.map((u) => {
                                  const isChecked = selectedUnitIds.includes(u.id);
                                  return (
                                    <label
                                      key={u.id}
                                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                                        isChecked
                                          ? "bg-purple-50 border-purple-400 text-purple-900 font-semibold"
                                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedUnitIds((prev) => [...prev, u.id]);
                                          } else {
                                            setSelectedUnitIds((prev) => prev.filter((id) => id !== u.id));
                                          }
                                        }}
                                        className="w-3.5 h-3.5 rounded text-purple-600"
                                      />
                                      <span>Unit {u.unit_number}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">No units in this block</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No blocks/units available.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Contractor Company Name */}
              {activeTab === "contractor" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Trade Agency Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Electricals, Shivam Plaster Works"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7903] text-xs sm:text-sm"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleAssign}
                disabled={loading || !selectedProfileId}
                className="w-full py-2.5 rounded-xl bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#FF7903]/20 transition-all disabled:opacity-50 min-h-[44px] cursor-pointer"
              >
                {loading ? "Assigning..." : `Assign ${activeTab === "employee" ? "Engineer with Scope" : "to Project"}`}
              </button>
            </div>

            {/* Edit Existing Hierarchy Modal/Drawer */}
            {editingEmployee && (
              <div className="mb-6 p-4 sm:p-5 bg-blue-50/50 border border-blue-300 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      Edit Hierarchy Scope: {editingEmployee.full_name}
                    </h4>
                  </div>
                  <button
                    onClick={() => setEditingEmployee(null)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditAccessLevel("full_project")}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold ${
                      editAccessLevel === "full_project"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20"
                        : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-600 mb-1" />
                    <span>Full Project</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditAccessLevel("block_level")}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold ${
                      editAccessLevel === "block_level"
                        ? "bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20"
                        : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600 mb-1" />
                    <span>Block Level</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditAccessLevel("unit_level")}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold ${
                      editAccessLevel === "unit_level"
                        ? "bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-500/20"
                        : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <Home className="w-3.5 h-3.5 text-purple-600 mb-1" />
                    <span>Unit Level</span>
                  </button>
                </div>

                {editAccessLevel === "block_level" && (
                  <div className="p-3 bg-white border border-blue-200 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-slate-800">Select Block(s):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {projectBlocks.map((b) => {
                        const isChecked = editBlockIds.includes(b.id);
                        return (
                          <label
                            key={b.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                              isChecked
                                ? "bg-blue-50 border-blue-400 text-blue-900 font-semibold"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditBlockIds((prev) => [...prev, b.id]);
                                } else {
                                  setEditBlockIds((prev) => prev.filter((id) => id !== b.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-blue-600"
                            />
                            <span>{b.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {editAccessLevel === "unit_level" && (
                  <div className="p-3 bg-white border border-purple-200 rounded-xl space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-xs font-semibold text-slate-800">Select Unit(s):</p>
                    {projectBlocks.map((b) => (
                      <div key={b.id} className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Block {b.name}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {b.units?.map((u) => {
                            const isChecked = editUnitIds.includes(u.id);
                            return (
                              <label
                                key={u.id}
                                className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-xs cursor-pointer ${
                                  isChecked
                                    ? "bg-purple-50 border-purple-400 text-purple-900 font-semibold"
                                    : "bg-slate-50 border-slate-200 text-slate-700"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditUnitIds((prev) => [...prev, u.id]);
                                    } else {
                                      setEditUnitIds((prev) => prev.filter((id) => id !== u.id));
                                    }
                                  }}
                                  className="w-3.5 h-3.5 rounded text-purple-600"
                                />
                                <span>Unit {u.unit_number}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveHierarchyEdit}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs font-semibold shadow-sm shadow-[#FF7903]/20 cursor-pointer"
                  >
                    {loading ? "Saving..." : "Save Scope Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="px-4 py-2 rounded-xl bg-[#FFE5CC] hover:bg-[#ffd9b3] text-[#933D00] border border-[#FFD4AA] text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Currently Assigned List */}
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Currently Assigned ({activeTab === "employee" ? "Site Engineers" : activeTab === "contractor" ? "Contractors" : "Owners"})
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {activeTab === "employee" && (
                  assignedEmployees.length > 0 ? (
                    assignedEmployees.map((emp) => {
                      const level = emp.hierarchy?.access_level || "full_project";
                      const blockCount = emp.hierarchy?.block_ids?.length || 0;
                      const unitCount = emp.hierarchy?.unit_ids?.length || 0;

                      return (
                        <div
                          key={emp.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm"
                        >
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-900">{emp.full_name}</p>
                              {level === "full_project" && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <Globe className="w-2.5 h-2.5" /> Full Project
                                </span>
                              )}
                              {level === "block_level" && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                                  <Layers className="w-2.5 h-2.5" /> {blockCount} Block(s)
                                </span>
                              )}
                              {level === "unit_level" && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                                  <Home className="w-2.5 h-2.5" /> {unitCount} Unit(s)
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{emp.phone || "No phone"}</p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditHierarchy(emp)}
                              className="px-2.5 py-1 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Edit Scope / Permissions"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Edit Scope</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: "employee",
                                  profileId: emp.profile_id,
                                  name: emp.full_name,
                                })
                              }
                              disabled={loading}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Remove from project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 italic py-3 text-center">No site engineers assigned.</p>
                  )
                )}

                {activeTab === "contractor" && (
                  assignedContractors.length > 0 ? (
                    assignedContractors.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{c.company_name}</p>
                          <p className="text-xs text-slate-500">{c.full_name} {c.phone ? `(${c.phone})` : ""}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: "contractor",
                              profileId: c.profile_id,
                              name: `${c.company_name} (${c.full_name})`,
                            })
                          }
                          disabled={loading}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-3 text-center">No contractors linked.</p>
                  )
                )}

                {activeTab === "owner" && (
                  assignedOwners.length > 0 ? (
                    assignedOwners.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{o.full_name}</p>
                          <p className="text-xs text-slate-500">{o.phone || "No phone"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: "owner",
                              profileId: o.profile_id,
                              name: o.full_name,
                            })
                          }
                          disabled={loading}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-3 text-center">No owners assigned.</p>
                  )
                )}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 mt-5 flex justify-end">
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

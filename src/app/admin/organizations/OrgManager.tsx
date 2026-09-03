"use client";

import { useState } from "react";
import { Building2, Plus, Trash2, FolderPlus, Briefcase } from "lucide-react";
import {
  createOrganization,
  createDepartment,
  createDesignation,
  deleteDepartment,
  deleteDesignation,
} from "./actions";

interface DepartmentItem {
  id: string;
  name: string;
}

interface DesignationItem {
  id: string;
  title: string;
  department_id: string | null;
}

interface OrgItem {
  id: string;
  name: string;
  code: string | null;
  departments: DepartmentItem[];
  designations: DesignationItem[];
}

interface OrgManagerProps {
  initialOrganizations: OrgItem[];
}

export default function OrgManager({ initialOrganizations }: OrgManagerProps) {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(
    initialOrganizations[0]?.id || null
  );

  // Create Org state
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);

  // Dept state
  const [deptName, setDeptName] = useState("");
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState<string | null>(null);

  // Desig state
  const [desigTitle, setDesigTitle] = useState("");
  const [desigDeptId, setDesigDeptId] = useState<string>("");
  const [desigLoading, setDesigLoading] = useState(false);
  const [desigError, setDesigError] = useState<string | null>(null);

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    setOrgLoading(true);
    setOrgError(null);

    const fd = new FormData();
    fd.append("name", orgName);
    fd.append("code", orgCode);

    const res = await createOrganization(fd);
    setOrgLoading(false);

    if (res.error) {
      setOrgError(res.error);
      return;
    }

    if (res.data) {
      setOrganizations([
        ...organizations,
        { ...res.data, departments: [], designations: [] },
      ]);
      setOrgName("");
      setOrgCode("");
      setShowCreateOrg(false);
      setSelectedOrgId(res.data.id);
    }
  }

  async function handleAddDept(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrgId) return;
    setDeptLoading(true);
    setDeptError(null);

    const res = await createDepartment(selectedOrgId, deptName);
    setDeptLoading(false);

    if (res.error) {
      setDeptError(res.error);
      return;
    }

    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === selectedOrgId
          ? { ...o, departments: [...o.departments, res.data] }
          : o
      )
    );
    setDeptName("");
  }

  async function handleAddDesig(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrgId) return;
    setDesigLoading(true);
    setDesigError(null);

    const res = await createDesignation(
      selectedOrgId,
      desigDeptId || null,
      desigTitle
    );
    setDesigLoading(false);

    if (res.error) {
      setDesigError(res.error);
      return;
    }

    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === selectedOrgId
          ? { ...o, designations: [...o.designations, res.data] }
          : o
      )
    );
    setDesigTitle("");
    setDesigDeptId("");
  }

  async function handleDeleteDept(deptId: string) {
    const res = await deleteDepartment(deptId);
    if (!res.error) {
      setOrganizations((prev) =>
        prev.map((o) =>
          o.id === selectedOrgId
            ? { ...o, departments: o.departments.filter((d) => d.id !== deptId) }
            : o
        )
      );
    }
  }

  async function handleDeleteDesig(desigId: string) {
    const res = await deleteDesignation(desigId);
    if (!res.error) {
      setOrganizations((prev) =>
        prev.map((o) =>
          o.id === selectedOrgId
            ? {
                ...o,
                designations: o.designations.filter((d) => d.id !== desigId),
              }
            : o
        )
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage organizations, departments & designations
          </p>
        </div>
        <button
          onClick={() => setShowCreateOrg(true)}
          className="px-4 py-2.5 bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs font-semibold rounded-full flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> New Organization
        </button>
      </div>

      {/* Create Org Modal */}
      {showCreateOrg && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Organization</h3>
            {orgError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{orgError}</p>
            )}
            <form onSubmit={handleCreateOrg} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7903]/30"
                  placeholder="e.g. ABC Builders"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Code (optional)
                </label>
                <input
                  type="text"
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7903]/30"
                  placeholder="e.g. ABC"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={orgLoading}
                  className="flex-1 py-2.5 bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs font-semibold rounded-full transition-colors"
                >
                  {orgLoading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateOrg(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Org Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {organizations.map((org) => (
          <button
            key={org.id}
            onClick={() => setSelectedOrgId(org.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              org.id === selectedOrgId
                ? "bg-[#FF7903] text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            {org.name}
          </button>
        ))}
      </div>

      {/* Selected Org Details */}
      {selectedOrg && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Departments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#FF7903]" />
              <h3 className="text-sm font-bold text-slate-900">
                Departments ({selectedOrg.departments.length})
              </h3>
            </div>

            <form onSubmit={handleAddDept} className="flex gap-2">
              <input
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7903]/30"
                placeholder="New department name..."
                required
              />
              <button
                type="submit"
                disabled={deptLoading}
                className="px-4 py-2 bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {deptLoading ? "..." : "Add"}
              </button>
            </form>
            {deptError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{deptError}</p>
            )}

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {selectedOrg.departments.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No departments yet. Add one above.
                </p>
              )}
              {selectedOrg.departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 group"
                >
                  <span className="text-xs font-medium text-slate-700">{dept.name}</span>
                  <button
                    onClick={() => handleDeleteDept(dept.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Designations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#FF7903]" />
              <h3 className="text-sm font-bold text-slate-900">
                Designations ({selectedOrg.designations.length})
              </h3>
            </div>

            <form onSubmit={handleAddDesig} className="space-y-2">
              <input
                type="text"
                value={desigTitle}
                onChange={(e) => setDesigTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7903]/30"
                placeholder="New designation title..."
                required
              />
              <div className="flex gap-2">
                <select
                  value={desigDeptId}
                  onChange={(e) => setDesigDeptId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7903]/30"
                >
                  <option value="">No Department</option>
                  {selectedOrg.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={desigLoading}
                  className="px-4 py-2 bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {desigLoading ? "..." : "Add"}
                </button>
              </div>
            </form>
            {desigError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{desigError}</p>
            )}

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {selectedOrg.designations.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No designations yet. Add one above.
                </p>
              )}
              {selectedOrg.designations.map((desig) => {
                const dept = selectedOrg.departments.find((d) => d.id === desig.department_id);
                return (
                  <div
                    key={desig.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 group"
                  >
                    <div>
                      <span className="text-xs font-medium text-slate-700 block">
                        {desig.title}
                      </span>
                      {dept && (
                        <span className="text-[10px] text-slate-400">{dept.name}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteDesig(desig.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

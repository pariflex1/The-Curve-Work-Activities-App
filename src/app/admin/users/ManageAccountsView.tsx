"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Building2,
  HardHat,
  Crown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  KeyRound,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  Sliders,
} from "lucide-react";
import {
  createUserAccount,
  updateUserAccount,
  updateUserPassword,
  deleteUserAccount,
} from "./user-actions";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export interface UserProfileItem {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  phone: string | null;
  is_active?: boolean;
  created_at: string;
  company_name?: string | null;
  email?: string | null;
}

interface ManageAccountsViewProps {
  initialProfiles: UserProfileItem[];
}

export default function ManageAccountsView({ initialProfiles }: ManageAccountsViewProps) {
  const [profiles, setProfiles] = useState<UserProfileItem[]>(initialProfiles);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"employee" | "contractor" | "owner" | "admin">("employee");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Edit User State
  const [editTarget, setEditTarget] = useState<UserProfileItem | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<"employee" | "contractor" | "owner" | "admin">("employee");
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Inline Reset Password Target
  const [resetTarget, setResetTarget] = useState<UserProfileItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<UserProfileItem | null>(null);

  function generateRandomPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
  }

  function startEditUser(profile: UserProfileItem) {
    setEditTarget(profile);
    setEditFullName(profile.full_name || "");
    setEditPhone(profile.phone || "");
    setEditRole((profile.role as any) || "employee");
    setEditIsActive(profile.is_active !== undefined ? profile.is_active : true);
    setEditCompanyName(profile.company_name || "");
    setEditError(null);
    setEditSuccess(null);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await createUserAccount({
      fullName,
      phone,
      role,
      password,
      email: email.trim() || undefined,
      companyName: companyName.trim() || undefined,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccessMsg(
        `Account created for ${fullName} (${role.toUpperCase()}). Credentials: Mobile: ${phone} / Password: ${password}`
      );
      setFullName("");
      setPhone("");
      setEmail("");
      setCompanyName("");
      setPassword("");
      setLoading(false);
      // Update local profiles list
      const newProfile: UserProfileItem = {
        id: (res as any)?.profile?.id || crypto.randomUUID(),
        user_id: (res as any)?.profile?.user_id || crypto.randomUUID(),
        full_name: fullName,
        role: role,
        phone: phone,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setProfiles((prev) => [newProfile, ...prev]);
    }
  }

  async function handleSaveEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;

    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    const res = await updateUserAccount(editTarget.id, {
      fullName: editFullName,
      phone: editPhone,
      role: editRole,
      isActive: editIsActive,
      companyName: editCompanyName.trim() || undefined,
    });

    if (res?.error) {
      setEditError(res.error);
      setEditLoading(false);
    } else {
      setEditSuccess(`User account "${editFullName}" updated successfully.`);
      // Update local profiles list
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === editTarget.id
            ? {
                ...p,
                full_name: editFullName,
                phone: editPhone.replace(/\D/g, ""),
                role: editRole,
                is_active: editIsActive,
                company_name: editCompanyName,
              }
            : p
        )
      );
      setEditLoading(false);
      setTimeout(() => {
        setEditTarget(null);
      }, 1200);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;

    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    const res = await updateUserPassword(resetTarget.user_id, newPassword);
    if (res?.error) {
      setResetError(res.error);
    } else {
      setResetSuccess(`Password successfully updated for ${resetTarget.full_name}. New password: ${newPassword}`);
      setNewPassword("");
    }
    setResetLoading(false);
  }

  async function handleConfirmDeleteUser() {
    if (!deleteTarget) return;
    const res = await deleteUserAccount(deleteTarget.id);
    if (res?.error) {
      throw new Error(res.error);
    }
    setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery)) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Create Account Section */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-black text-white shrink-0">
                <UserPlus className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                User Accounts &amp; Access
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 rounded-xl bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all min-h-[40px] shadow-sm cursor-pointer"
          >
            {showCreateForm ? <ChevronUp className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{showCreateForm ? "Hide Create Form" : "+ Create New Account"}</span>
          </button>
        </div>

        {/* Create Account Form Accordion */}
        {showCreateForm && (
          <form onSubmit={handleCreateUser} className="space-y-4 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF7903]" />
              <span>Issue New Account Credentials</span>
            </h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7903] text-xs sm:text-sm"
                />
              </div>

              {/* Phone (Login ID) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (Login ID) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono font-medium">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7903] text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  System Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7903] text-xs sm:text-sm"
                >
                  <option value="employee">Site Engineer (Operations &amp; Supervision)</option>
                  <option value="contractor">Contractor (Work Execution &amp; Updates)</option>
                  <option value="owner">Project Owner / Investor</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-[#FF7903] hover:text-[#e66a00] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7903] text-xs sm:text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Contractor Company Name */}
              {role === "contractor" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Trade Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Electricals"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7903] text-xs sm:text-sm"
                  />
                </div>
              )}

              {/* Optional Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email ID (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@thecurve.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7903] text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#FF7903] hover:bg-[#e66a00] text-white font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 min-h-[44px] shadow-sm shadow-[#FF7903]/20 cursor-pointer"
              >
                {loading ? "Creating Account..." : "Create Account & Credentials"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Accounts Directory */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF7903]" />
              <span>Accounts Directory ({filteredProfiles.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect credentials, edit profile details, or reset access keys
            </p>
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 bg-[#FFE5CC]/50 p-1.5 rounded-xl border border-[#FFD4AA] text-xs">
            {["all", "employee", "contractor", "owner", "admin"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                  roleFilter === r
                    ? "bg-[#FF7903] text-white shadow-xs"
                    : "bg-[#FFE5CC] text-[#933D00] hover:bg-[#ffd9b3] border border-[#FFD4AA]"
                }`}
              >
                {r === "all" ? "All Users" : r === "employee" ? "Engineers" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile number, or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7903] text-xs sm:text-sm"
          />
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Mobile (Login ID)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((p) => {
                  const roleBadge =
                    p.role === "admin"
                      ? "bg-slate-900 text-white"
                      : p.role === "employee"
                      ? "bg-blue-100 text-blue-800"
                      : p.role === "contractor"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-purple-100 text-purple-800";

                  const isActive = p.is_active !== undefined ? p.is_active : true;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {p.full_name || "Unnamed User"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${roleBadge}`}>
                          {p.role === "employee" ? "Site Engineer" : p.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {p.phone || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {new Date(p.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {/* Edit User Button */}
                        <button
                          type="button"
                          onClick={() => startEditUser(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FFE5CC] hover:bg-[#FF7903] text-[#933D00] hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer border border-[#FFD4AA]"
                          title="Edit Account Details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Reset Password Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setResetTarget(p);
                            setNewPassword("");
                            setResetError(null);
                            setResetSuccess(null);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FFE5CC] hover:bg-[#FF7903] text-[#933D00] hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer border border-[#FFD4AA]"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Password</span>
                        </button>

                        {/* Delete User Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors inline-flex items-center cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No accounts match your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditTarget(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit User Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update profile name, login mobile, system role, and access status
                </p>
              </div>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
              </div>

              {/* Mobile (Login ID) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (Login ID) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono font-medium">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              {/* System Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  System Role *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                >
                  <option value="employee">Site Engineer (Field Operations &amp; Supervision)</option>
                  <option value="contractor">Contractor (Task Execution)</option>
                  <option value="owner">Project Owner / Investor</option>
                  <option value="admin">Administrator (Governance &amp; Master Setup)</option>
                </select>
              </div>

              {/* Contractor Company Name */}
              {editRole === "contractor" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Trade Name
                  </label>
                  <input
                    type="text"
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    placeholder="e.g. Apex Civil Structures"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
              )}

              {/* Active Status */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-900">Account Active Status</p>
                  <p className="text-[11px] text-slate-500">
                    Inactive accounts cannot log into the mobile or web app
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    editIsActive
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {editIsActive ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 rounded-xl bg-[#FFE5CC] hover:bg-[#ffd9b3] text-[#933D00] border border-[#FFD4AA] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 min-h-[40px] shadow-sm shadow-[#FF7903]/20 cursor-pointer"
                >
                  {editLoading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setResetTarget(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-[#FFE5CC] text-[#FF7903] rounded-xl flex items-center justify-center shrink-0 border border-[#FFD4AA]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Credentials</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">
                  {resetTarget.full_name} ({resetTarget.phone || resetTarget.role})
                </p>
              </div>
            </div>

            {resetError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7903] text-xs sm:text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-4 py-2 rounded-xl bg-[#FFE5CC] hover:bg-[#ffd9b3] text-[#933D00] border border-[#FFD4AA] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={resetLoading || !newPassword}
                  className="px-5 py-2 rounded-xl bg-[#FF7903] hover:bg-[#e66a00] text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 min-h-[40px] shadow-sm shadow-[#FF7903]/20 cursor-pointer"
                >
                  {resetLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal Guard */}
      {deleteTarget && (
        <DeleteConfirmationModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDeleteUser}
          itemName={`${deleteTarget.full_name} (${deleteTarget.phone || deleteTarget.role})`}
          itemType="user account"
          warningText={`Deleting ${deleteTarget.full_name}'s account will permanently revoke their login credentials and all project allocations.`}
        />
      )}
    </div>
  );
}

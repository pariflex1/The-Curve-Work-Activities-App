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
} from "lucide-react";
import { createUserAccount, updateUserPassword, deleteUserAccount } from "./user-actions";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export interface UserProfileItem {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  phone: string | null;
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
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        full_name: fullName,
        role: role,
        phone: phone,
        created_at: new Date().toISOString(),
      };
      setProfiles((prev) => [newProfile, ...prev]);
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
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="px-3.5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{showCreateForm ? "Collapse" : "+ New User"}</span>
            {showCreateForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* On-Page Create Account Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateUser} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Account Created Successfully</span>
                </div>
                <p className="font-mono text-emerald-800 bg-white/80 p-2 rounded-lg border border-emerald-200 mt-1">
                  {successMsg}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (Login ID) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  System Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                >
                  <option value="employee">👷 Site Engineer / Supervisor</option>
                  <option value="contractor">🔨 Contractor</option>
                  <option value="owner">📊 Project Owner / Investor</option>
                  <option value="admin">👑 Administrator</option>
                </select>
              </div>

              {/* Company Name (For Contractors) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Civil Structures"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@thecurve.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Creating Account..." : "Save & Issue Credentials"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Directory & Management Table */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-xl font-bold text-slate-900">
              Accounts Directory ({filteredProfiles.length})
            </h3>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Role Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              {["all", "employee", "contractor", "owner", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all text-[11px] ${
                    roleFilter === r ? "bg-white text-black font-bold shadow-2xs" : "text-slate-600 hover:text-black"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, role..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Reset Password Inline Banner */}
        {resetTarget && (
          <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                  Reset Password for {resetTarget.full_name} ({resetTarget.phone || resetTarget.role})
                </h4>
              </div>
              <button
                onClick={() => {
                  setResetTarget(null);
                  setResetError(null);
                  setResetSuccess(null);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetError && (
              <p className="text-xs text-red-600 font-semibold">{resetError}</p>
            )}
            {resetSuccess && (
              <p className="text-xs text-emerald-700 font-semibold">{resetSuccess}</p>
            )}

            <form onSubmit={handleResetPassword} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={resetLoading || newPassword.length < 6}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
              >
                {resetLoading ? "Updating..." : "Save New Password"}
              </button>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Mobile (Login ID)</th>
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

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {p.full_name || "Unnamed User"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${roleBadge}`}>
                          {p.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {p.phone || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {new Date(p.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setResetTarget(p);
                            setNewPassword("");
                            setResetError(null);
                            setResetSuccess(null);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset Password</span>
                        </button>

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
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    No accounts match your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

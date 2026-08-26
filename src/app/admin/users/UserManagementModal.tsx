"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  X,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  HardHat,
  Crown,
  Search,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
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
}

interface UserManagementModalProps {
  profiles: UserProfileItem[];
  triggerLabel?: string;
}

export default function UserManagementModal({
  profiles = [],
  triggerLabel = "Users & Team Directory",
}: UserManagementModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"directory" | "create">("create");

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

  // Reset Password State
  const [resetTarget, setResetTarget] = useState<UserProfileItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<UserProfileItem | null>(null);

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
      setSuccessMsg(`User "${fullName}" created successfully! Login: ${phone} / Password: ${password}`);
      setFullName("");
      setPhone("");
      setPassword("");
      setEmail("");
      setCompanyName("");
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    const res = await updateUserPassword(resetTarget.id, newPassword);
    if (res?.error) {
      setResetError(res.error);
      setResetLoading(false);
    } else {
      setResetSuccess(`Password updated for "${resetTarget.full_name}".`);
      setNewPassword("");
      setResetLoading(false);
    }
  }

  async function handleConfirmDeleteUser() {
    if (!deleteTarget) return;
    const res = await deleteUserAccount(deleteTarget.id);
    if (res?.error) {
      return { error: res.error };
    }
    setDeleteTarget(null);
  }

  function generateRandomPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
  }

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery)) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setError(null);
          setSuccessMsg(null);
        }}
        className="px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all min-h-[42px]"
      >
        <UserPlus className="w-4 h-4" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    User Accounts &amp; Team Directory
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issue credentials, manage team members (Engineers, Contractors, Owners), and configure access.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("create");
                  setError(null);
                }}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "create"
                    ? "border-black text-black"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User Account</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("directory");
                  setError(null);
                }}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "directory"
                    ? "border-black text-black"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Registered Users Directory ({profiles.length})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: CREATE USER FORM */}
              {activeTab === "create" && (
                <div className="max-w-2xl mx-auto space-y-6">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
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
                      <p className="font-mono text-emerald-800 bg-white/70 p-2 rounded-lg border border-emerald-200 mt-2">
                        {successMsg}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleCreateUser} className="space-y-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          placeholder="e.g. Ramesh Patel"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Mobile Number (Login ID) *
                        </label>
                        <div className="relative">
                          <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            required
                            maxLength={13}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Account Role &amp; Permissions *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { key: "employee", label: "Site Engineer", desc: "Field Inspections & Checklist", icon: HardHat, color: "border-blue-300 bg-blue-50/50 text-blue-900" },
                          { key: "contractor", label: "Contractor", desc: "Trade Tasks & Scope", icon: Building2, color: "border-amber-300 bg-amber-50/50 text-amber-900" },
                          { key: "owner", label: "Project Owner", desc: "Financials & Photos", icon: Crown, color: "border-purple-300 bg-purple-50/50 text-purple-900" },
                          { key: "admin", label: "Administrator", desc: "Full Governance", icon: ShieldCheck, color: "border-slate-300 bg-slate-100 text-slate-900" },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isSelected = role === item.key;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setRole(item.key as any)}
                              className={`p-3 rounded-2xl border text-left transition-all ${
                                isSelected
                                  ? `${item.color} border-2 shadow-xs font-bold`
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              <Icon className="w-5 h-5 mb-1.5 text-black" />
                              <p className="text-xs font-bold">{item.label}</p>
                              <p className="text-[10px] text-slate-500 font-normal mt-0.5 leading-tight">{item.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Optional Contractor Company Name */}
                    {role === "contractor" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Company / Trade Agency Name
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Apex Electricals & MEP Solutions"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                      </div>
                    )}

                    {/* Password & Generator */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Initial Login Password *
                        </label>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Secure Password</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Optional Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-slate-400 font-normal">(Optional — defaults to mobileID@thecurve.app)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. engineer@thecurve.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !fullName || !phone || !password}
                      className="w-full py-3 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 min-h-[46px] disabled:opacity-50 text-sm mt-4"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Issue Login Credentials</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: DIRECTORY LIST */}
              {activeTab === "directory" && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name, phone, role..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-black font-sans"
                      />
                    </div>

                    <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      {["all", "employee", "contractor", "owner", "admin"].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRoleFilter(r)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                            roleFilter === r
                              ? "bg-black text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Profiles Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider text-slate-500">
                          <tr>
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-4">Mobile / Login ID</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredProfiles.map((p) => {
                            const badgeColor =
                              p.role === "admin"
                                ? "bg-slate-100 text-slate-900 border-slate-300"
                                : p.role === "employee"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : p.role === "contractor"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-purple-50 text-purple-800 border-purple-200";

                            return (
                              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-slate-900">
                                  {p.full_name}
                                </td>
                                <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                                  {p.phone || "—"}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${badgeColor}`}>
                                    {p.role}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setResetTarget(p);
                                        setNewPassword("");
                                        setResetError(null);
                                        setResetSuccess(null);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                                      title="Reset Password"
                                    >
                                      <KeyRound className="w-3.5 h-3.5" />
                                      <span>Reset Pass</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteTarget(p)}
                                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                      title="Delete Account"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reset Password Sub-Modal */}
            {resetTarget && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-sm text-slate-900">Reset Password</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResetTarget(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">
                    Set a new password for <strong className="text-slate-900">{resetTarget.full_name}</strong> (Mobile: {resetTarget.phone || "—"}):
                  </p>

                  {resetError && <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl">{resetError}</div>}
                  {resetSuccess && <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl">{resetSuccess}</div>}

                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <input
                      type="text"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-black"
                    />

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setResetTarget(null)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={resetLoading || newPassword.length < 6}
                        className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                      >
                        {resetLoading ? "Updating..." : "Save Password"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Password-Protected Delete Confirmation */}
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
        </div>
      )}
    </>
  );
}

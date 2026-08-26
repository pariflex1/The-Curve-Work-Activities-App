import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft, Building2, UserPlus, ShieldCheck, HardHat, Crown, Smartphone } from "lucide-react";
import UserManagementModal from "./UserManagementModal";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const totalUsers = profiles?.length || 0;
  const adminCount = profiles?.filter((p) => p.role === "admin").length || 0;
  const employeeCount = profiles?.filter((p) => p.role === "employee").length || 0;
  const contractorCount = profiles?.filter((p) => p.role === "contractor").length || 0;
  const ownerCount = profiles?.filter((p) => p.role === "owner").length || 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              User Accounts Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage system access, create logins for site engineers, contractors, and owners
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <UserManagementModal
            profiles={profiles || []}
            triggerLabel="+ Create New Account"
          />
        </div>
      </div>

      {/* Role Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Site Engineers</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{employeeCount}</p>
          <span className="text-xs text-slate-500 mt-1 block">Field operations &amp; checklists</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Contractors</span>
            <HardHat className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{contractorCount}</p>
          <span className="text-xs text-slate-500 mt-1 block">Task progress &amp; photo uploads</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Project Owners</span>
            <Crown className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{ownerCount}</p>
          <span className="text-xs text-slate-500 mt-1 block">Financials &amp; milestone disbursements</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Administrators</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{adminCount}</p>
          <span className="text-xs text-slate-500 mt-1 block">Master governance &amp; templates</span>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Registered Accounts ({totalUsers})
            </h2>
            <p className="text-xs text-slate-500">
              Active authentication profiles across all roles in The Curve system
            </p>
          </div>

          <UserManagementModal
            profiles={profiles || []}
            triggerLabel="Open Management Console"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-black text-slate-800 hover:text-white text-xs font-bold transition-all shadow-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Mobile / Contact</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles && profiles.length > 0 ? (
                profiles.map((p) => {
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
                      <td className="py-3.5 px-4 text-right">
                        <UserManagementModal
                          profiles={profiles}
                          triggerLabel="Manage"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-black text-slate-700 hover:text-white text-xs font-semibold transition-all inline-block"
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    No registered user accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

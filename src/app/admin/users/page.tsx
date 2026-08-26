import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Users, HardHat, Crown, ShieldCheck } from "lucide-react";
import ManageAccountsView from "./ManageAccountsView";

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
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              User Accounts &amp; Team Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Issue mobile login credentials, manage site engineers, contractors, and project investors
            </p>
          </div>
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

      {/* Main On-Page Management Console */}
      <ManageAccountsView initialProfiles={(profiles as any) || []} />
    </div>
  );
}

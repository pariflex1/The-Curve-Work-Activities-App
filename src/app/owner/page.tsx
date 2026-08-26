import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Coins,
  CheckCircle2,
  Clock,
  Crown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import PaymentFormModal from "@/app/admin/payments/PaymentFormModal";
import UserManualModal from "@/components/UserManualModal";
import PWAInstallButton from "@/components/PWAInstallButton";

export const dynamic = "force-dynamic";

export default async function OwnerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile, projects, and payments concurrently
  const [
    { data: profile },
    { data: projects },
    { data: payments },
    { data: contractors },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("projects").select(`
      *,
      blocks (
        id,
        name,
        units (
          id,
          unit_activities (
            id,
            estimated_cost,
            progress_percentage
          )
        )
      )
    `).order("created_at", { ascending: false }),
    supabase.from("payments").select("*").order("payment_date", { ascending: false }),
    supabase.from("project_contractors").select("id, company_name, profiles(full_name)"),
  ]);

  const contractorOptions = (contractors || []).map((c: any) => ({
    id: c.id,
    company_name: c.company_name,
    full_name: c.profiles?.full_name,
  }));



  // Calculate totals
  let totalEstimatedCost = 0;
  (projects || []).forEach((p) => {
    p.blocks?.forEach((b: any) => {
      b.units?.forEach((u: any) => {
        u.unit_activities?.forEach((a: any) => {
          totalEstimatedCost += Number(a.estimated_cost) || 0;
        });
      });
    });
  });

  const totalPaid = payments?.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || 0;
  const balanceDue = totalEstimatedCost - totalPaid;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/the-curve-logo.webp"
              alt="The Curve Logo"
              className="h-10 sm:h-12 w-auto object-contain shrink-0"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Owner Financial Portfolio
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Welcome, <strong className="text-slate-800">{profile?.full_name || "Owner"}</strong> — Portfolio Balances &amp; Payment Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <PWAInstallButton />
            <UserManualModal role="owner" triggerLabel="Owner Guide" />
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors min-h-[40px] flex items-center"
            >
              Home
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-semibold transition-colors min-h-[40px] flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Financial Summary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Portfolio Estimated Cost
              </span>
              <Coins className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              ₹{totalEstimatedCost.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-500 mt-2">Across all assigned development projects</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Total Disbursed (Paid)
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              ₹{totalPaid.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-500 mt-2">Verified disbursed disbursements</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Outstanding Balance
              </span>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 mt-1">
              ₹{balanceDue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-500 mt-2">Estimated Cost − Paid</p>
          </div>
        </div>

        {/* Owned Projects Cards */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Development Projects ({projects?.length || 0})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {projects && projects.length > 0 ? (
              projects.map((project) => {
                let projCost = 0;
                let projUnitsCount = 0;

                project.blocks?.forEach((b: any) => {
                  projUnitsCount += b.units?.length || 0;
                  b.units?.forEach((u: any) => {
                    u.unit_activities?.forEach((a: any) => {
                      projCost += Number(a.estimated_cost) || 0;
                    });
                  });
                });

                const projPayments =
                  payments?.filter((p) => p.project_id === project.id) || [];
                const projPaid = projPayments.reduce(
                  (acc, p) => acc + (Number(p.amount) || 0),
                  0
                );
                const projBalance = projCost - projPaid;

                const statusBadge =
                  project.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200";

                return (
                  <div
                    key={project.id}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                        <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-semibold ${statusBadge}`}>
                          {project.status.replace("_", " ")}
                        </span>
                      </div>

                      {project.location && (
                        <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5 mb-4">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{project.location}</span>
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 text-center">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Total Est. Cost</p>
                          <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                            ₹{projCost.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="border-l border-slate-200">
                          <p className="text-xs text-slate-500 font-medium">Total Paid</p>
                          <p className="text-sm sm:text-base font-extrabold text-emerald-600 mt-0.5">
                            ₹{projPaid.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <PaymentFormModal
                        projectId={project.id}
                        contractors={contractorOptions}
                        triggerLabel="Record Payment"
                      />


                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors min-h-[40px] flex items-center justify-center"
                        title="View Project Units"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-6 shadow-sm">
                <Crown className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Projects Found</h3>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payment Ledger */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-4">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-600" />
              <span>Recent Payment Transactions</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {payments?.length || 0} total payments logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Paid To</th>
                  <th className="px-5 py-3.5">Mode</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Notes</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {payments && payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {p.payment_date}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {p.paid_to}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                          {p.payment_type || "Transfer"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-emerald-600 font-mono">
                        ₹{Number(p.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">
                        {p.notes || "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <PaymentFormModal
                          projectId={p.project_id}
                          payment={p}
                          isEdit={true}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

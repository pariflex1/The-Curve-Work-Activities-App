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
  ArrowUpRight,
} from "lucide-react";
import PaymentFormModal from "@/app/admin/payments/PaymentFormModal";

export const dynamic = "force-dynamic";

export default async function OwnerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Query projects owned by this owner via RLS
  const { data: projects } = await supabase
    .from("projects")
    .select(`
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
    `)
    .order("created_at", { ascending: false });

  // Query payments
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .order("payment_date", { ascending: false });

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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Crown className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Owner Financial Portfolio
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Welcome, <span className="text-white font-medium">{profile?.full_name}</span> — Portfolio Balances &amp; Payment Ledger
            </p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Financial Summary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Portfolio Estimated Cost
              </span>
              <Coins className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-cyan-400 mt-1">
              ₹{totalEstimatedCost.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-500 mt-2">Across all assigned development projects</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Total Disbursed (Paid)
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400 mt-1">
              ₹{totalPaid.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-500 mt-2">Verified disbursed disbursements</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Outstanding Balance
              </span>
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400 mt-1">
              ₹{balanceDue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-500 mt-2">Estimated Cost − Paid</p>
          </div>
        </div>

        {/* Owned Projects Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>Development Projects ({projects?.length || 0})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                return (
                  <div
                    key={project.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                        <span className="text-xs px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 capitalize font-medium">
                          {project.status.replace("_", " ")}
                        </span>
                      </div>

                      {project.location && (
                        <p className="text-slate-400 text-sm flex items-center gap-1.5 mb-4">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span>{project.location}</span>
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-xl border border-white/5 mb-4 text-center">
                        <div>
                          <p className="text-xs text-slate-400">Total Est. Cost</p>
                          <p className="text-sm font-bold text-cyan-400 mt-0.5">
                            ₹{projCost.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="border-l border-white/5">
                          <p className="text-xs text-slate-400">Total Paid</p>
                          <p className="text-sm font-bold text-emerald-400 mt-0.5">
                            ₹{projPaid.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <PaymentFormModal
                        projectId={project.id}
                        triggerLabel="Make Payment"
                      />

                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
                        title="View Project Units"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 p-6">
                <Crown className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-300">No Projects Found</h3>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payment Ledger */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl space-y-4">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              <span>Recent Payment Transactions</span>
            </h2>
            <span className="text-xs text-slate-400">
              {payments?.length || 0} total payments logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Paid To</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments && payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {p.payment_date}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {p.paid_to}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-white/5 text-slate-300 rounded-full text-xs border border-white/10">
                          {p.payment_type || "Transfer"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400 font-mono">
                        ₹{Number(p.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                        {p.notes || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
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
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
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

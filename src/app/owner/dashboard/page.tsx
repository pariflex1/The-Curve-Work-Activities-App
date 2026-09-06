import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Building2, MapPin, Layers, ChevronDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "owner") {
    redirect("/");
  }

  // Fetch projects where user is assigned as owner
  const { data: ownerAssignments } = await supabase
    .from("project_owners")
    .select(`
      project_id,
      projects (
        id,
        name,
        location,
        status,
        blocks (
          id,
          name,
          units (
            id,
            unit_number,
            unit_activities (
              id,
              progress_percentage,
              status,
              estimated_cost
            )
          )
        )
      )
    `)
    .eq("profile_id", profile.id);

  const projects = ownerAssignments?.map((a: any) => a.projects).filter(Boolean) || [];

  // Fetch payments for owner's projects
  const projectIds = projects.map((p: any) => p.id);
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .in("project_id", projectIds)
    .order("payment_date", { ascending: false });

  // Calculate stats
  const totalUnits = projects.reduce((sum: number, p: any) => {
    return sum + (p.blocks?.reduce((bSum: number, b: any) => bSum + (b.units?.length || 0), 0) || 0);
  }, 0);

  const allActivities = projects.flatMap((p: any) =>
    p.blocks?.flatMap((b: any) =>
      b.units?.flatMap((u: any) => u.unit_activities || []) || []
    ) || []
  );

  const inProgressCount = allActivities.filter((a: any) =>
    a.status === "in_progress" || (a.progress_percentage > 0 && a.progress_percentage < 100)
  ).length;

  const completedCount = allActivities.filter((a: any) =>
    a.status === "completed" || a.progress_percentage === 100
  ).length;

  // Get user organizations for filter
  const { data: userOrgs } = await supabase
    .from("user_organizations")
    .select("organization_id, organizations (id, name)")
    .eq("profile_id", profile.id);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center text-2xl shadow-md">
              🏠
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Owner Dashboard
              </h1>
              <p className="text-sm text-slate-500">Track your property investments</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Total Units</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{totalUnits}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-2xl">🏢</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-amber-700">In Progress</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{inProgressCount}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-2xl">⚙️</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-blue-700">Completed</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{completedCount}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-2xl">✓</div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => {
            const totalBlocks = project.blocks?.length || 0;
            const totalProjectUnits = project.blocks?.reduce(
              (sum: number, b: any) => sum + (b.units?.length || 0),
              0
            ) || 0;
            const projectActivities = project.blocks?.flatMap((b: any) =>
              b.units?.flatMap((u: any) => u.unit_activities || []) || []
            ) || [];

            const totalProgress = projectActivities.length > 0
              ? Math.round(
                  projectActivities.reduce((sum: number, a: any) => sum + a.progress_percentage, 0) /
                    projectActivities.length
                )
              : 0;

            const projectPayments = payments?.filter((p: any) => p.project_id === project.id) || [];
            const totalPaid = projectPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
            const lastPayment = projectPayments[0];

            const statusBadge =
              project.status === "active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : project.status === "on_hold"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : project.status === "completed"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-slate-100 text-slate-700 border-slate-200";

            return (
              <div
                key={project.id}
                className="bg-white border border-slate-200 hover:border-black rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border capitalize font-semibold ${statusBadge}`}
                  >
                    {project.status.replace("_", " ")}
                  </span>
                </div>

                {project.location && (
                  <p className="text-slate-500 text-sm flex items-center gap-1.5 mb-5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{project.location}</span>
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4 text-center">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Blocks</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{totalBlocks}</p>
                  </div>
                  <div className="border-x border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Units</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{totalProjectUnits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Activities</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{projectActivities.length}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">Overall Progress</span>
                    <span className="text-sm font-bold text-[#FF7903]">{totalProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF7903] rounded-full transition-all"
                      style={{ width: `${totalProgress}%` }}
                    />
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Paid</div>
                    <div className="text-2xl font-bold text-slate-900">
                      ₹{(totalPaid / 100000).toFixed(1)}L
                    </div>
                  </div>
                  <span
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                      lastPayment
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {lastPayment ? "Paid" : "Pending"}
                  </span>
                </div>

                {/* Payment History Toggle */}
                {projectPayments.length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-sm font-semibold hover:bg-slate-100 transition-colors">
                      <span>Payment History</span>
                      <ChevronDown className="w-4 h-4" />
                    </summary>
                    <div className="mt-2 space-y-2">
                      {projectPayments.slice(0, 5).map((payment: any) => (
                        <div
                          key={payment.id}
                          className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0 text-sm"
                        >
                          <div>
                            <div className="text-xs text-slate-500 mb-1">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </div>
                            <div className="font-semibold">{payment.description || "Payment"}</div>
                          </div>
                          <div className="font-bold text-[#FF7903]">
                            ₹{(payment.amount / 100000).toFixed(1)}L
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <div className="text-6xl mb-4">🏠</div>
            <p className="text-lg">No projects assigned yet</p>
          </div>
        )}
      </div>
    </main>
  );
}

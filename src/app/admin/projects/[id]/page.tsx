import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Layers,
  Users,
  MapPin,
  Plus,
  UserCheck,
  Briefcase,
  Crown,
  ChevronRight,
  Coins,
  CheckCircle2,
  Clock,
} from "lucide-react";
import ProjectFormModal from "../ProjectFormModal";
import BlockFormModal from "./BlockFormModal";
import TeamAssignmentModal from "./TeamAssignmentModal";
import PaymentFormModal from "@/app/admin/payments/PaymentFormModal";

import { getAllProjectEmployeesHierarchy } from "@/utils/hierarchy";

export const dynamic = "force-dynamic";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch project details, blocks, and units
  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      blocks (
        id,
        name,
        sort_order,
        units (
          id,
          unit_number,
          floor,
          unit_type,
          area,
          status,
          unit_activities (
            id,
            estimated_cost,
            progress_percentage,
            status
          )
        )
      )
    `)
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  const blocks = project.blocks || [];

  // Fetch team assignments, profiles, payments, and hierarchy concurrently
  const [
    { data: employees },
    { data: contractors },
    { data: owners },
    { data: allProfiles },
    { data: payments },
    hierarchyMap,
  ] = await Promise.all([
    supabase
      .from("project_employees")
      .select("id, profile_id, profiles ( id, full_name, phone )")
      .eq("project_id", id),
    supabase
      .from("project_contractors")
      .select("id, profile_id, company_name, profiles ( id, full_name, phone )")
      .eq("project_id", id),
    supabase
      .from("project_owners")
      .select("id, profile_id, profiles ( id, full_name, phone )")
      .eq("project_id", id),
    supabase
      .from("profiles")
      .select("id, full_name, role, phone")
      .eq("is_active", true),
    supabase
      .from("payments")
      .select("*")
      .eq("project_id", id)
      .order("payment_date", { ascending: false }),
    getAllProjectEmployeesHierarchy(supabase, id),
  ]);

  const assignedEmployeesData = (employees || []).map((e: any) => ({
    id: e.id,
    profile_id: e.profile_id,
    full_name: e.profiles?.full_name || "Unknown",
    phone: e.profiles?.phone || null,
    hierarchy: hierarchyMap[e.profile_id] || {
      access_level: "full_project",
      block_ids: [],
      unit_ids: [],
    },
  }));

  const assignedContractorsData = (contractors || []).map((c: any) => ({
    id: c.id,
    profile_id: c.profile_id,
    full_name: c.profiles?.full_name || "Unknown",
    company_name: c.company_name,
    phone: c.profiles?.phone || null,
  }));

  const assignedOwnersData = (owners || []).map((o: any) => ({
    id: o.id,
    profile_id: o.profile_id,
    full_name: o.profiles?.full_name || "Unknown",
    phone: o.profiles?.phone || null,
  }));

  const projectBlocksData = blocks.map((b: any) => ({
    id: b.id,
    name: b.name,
    units: (b.units || []).map((u: any) => ({
      id: u.id,
      unit_number: u.unit_number,
      floor: u.floor,
      unit_type: u.unit_type,
    })),
  }));


  const totalUnits = blocks.reduce((acc: number, b: any) => acc + (b.units?.length || 0), 0);

  let totalEstimatedCost = 0;
  blocks.forEach((b: any) => {
    b.units?.forEach((u: any) => {
      u.unit_activities?.forEach((a: any) => {
        totalEstimatedCost += Number(a.estimated_cost) || 0;
      });
    });
  });

  const totalPaid = payments?.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || 0;
  const balanceDue = totalEstimatedCost - totalPaid;

  const statusBadge =
    project.status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : project.status === "on_hold"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : project.status === "completed"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  const contractorOptions = (contractors || []).map((c: any) => ({
    id: c.id,
    company_name: c.company_name,
    full_name: c.profiles?.full_name,
  }));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-2 sm:p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
              <Building2 className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {project.name}
                </h1>

                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border capitalize font-semibold ${statusBadge}`}
                >
                  {project.status.replace("_", " ")}
                </span>
              </div>
              {project.location && (
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{project.location}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <ProjectFormModal project={project} isEdit={true} />
          </div>
        </div>


        {/* Overview & Financial KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Blocks / Units</p>
            <p className="text-2xl sm:text-3xl font-bold text-black mt-1">{blocks.length} / {totalUnits}</p>
            <p className="text-xs text-slate-500 mt-1">Total inventory</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-blue-700">Project Est. Cost</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">₹{totalEstimatedCost.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500 mt-1">All unit activities</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Total Disbursed (Paid)</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">₹{totalPaid.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500 mt-1">{payments?.length || 0} payments recorded</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-purple-700">Outstanding Balance</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-700 mt-1">₹{balanceDue.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500 mt-1">Estimated − Paid</p>
          </div>
        </div>

        {/* 2-Column Section: Blocks & Hierarchy | Team Allocation & Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Blocks Section (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-black" />
                <h2 className="text-lg font-bold text-slate-900">Blocks &amp; Towers</h2>
              </div>
              <BlockFormModal projectId={id} />
            </div>

            <div className="space-y-3">
              {blocks && blocks.length > 0 ? (
                blocks.map((block: any) => (
                  <div
                    key={block.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-black transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{block.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          Order #{block.sort_order}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        {block.units?.length || 0} unit(s) registered in this block
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <BlockFormModal projectId={id} block={block} isEdit={true} />
                      <Link
                        href={`/admin/projects/${id}/blocks/${block.id}`}
                        className="px-4 py-2 rounded-xl bg-[#FFE5CC] border border-[#FFD4AA] text-[#933D00] hover:bg-[#FF7903] hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all min-h-[40px] cursor-pointer"
                      >
                        <span>Manage Units</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm p-6">
                  <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-800 font-bold text-sm">No Blocks Created Yet</p>
                  <p className="text-slate-500 text-xs mt-1 mb-4">
                    Add structural blocks (e.g. Tower A, Block 1) to start adding units.
                  </p>
                  <BlockFormModal projectId={id} triggerLabel="Add First Block" />
                </div>
              )}
            </div>

            {/* Recent Project Payments Table for Admin */}
            {payments && payments.length > 0 && (
              <div className="mt-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-black">Project Disbursements Ledger</h3>
                  </div>
                  <PaymentFormModal
                    projectId={id}
                    contractors={contractorOptions}
                    triggerLabel="+ Record Payment"
                  />

                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Paid To</th>
                        <th className="px-5 py-3">Mode</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {payments.slice(0, 5).map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-slate-500">{p.payment_date}</td>
                          <td className="px-5 py-3 font-semibold text-slate-900">{p.paid_to}</td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 border border-slate-200 font-medium">
                              {p.payment_type || "Transfer"}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-bold text-emerald-600 font-mono">
                            ₹{Number(p.amount).toLocaleString("en-IN")}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <PaymentFormModal
                              projectId={id}
                              payment={p}
                              isEdit={true}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Team Allocations Section (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-black" />
                <h2 className="text-lg font-bold text-slate-900">Project Team</h2>
              </div>
              <TeamAssignmentModal
                projectId={id}
                profiles={allProfiles || []}
                assignedEmployees={assignedEmployeesData}
                assignedContractors={assignedContractorsData}
                assignedOwners={assignedOwnersData}
                projectBlocks={projectBlocksData}
              />
            </div>

            {/* Team Members Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
              {/* Employees */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700 mb-2.5 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Assigned Site Engineers ({assignedEmployeesData.length})</span>
                </p>
                {assignedEmployeesData && assignedEmployeesData.length > 0 ? (
                  <div className="space-y-2">
                    {assignedEmployeesData.map((emp) => {
                      const level = emp.hierarchy?.access_level || "full_project";
                      const blockCount = emp.hierarchy?.block_ids?.length || 0;
                      const unitCount = emp.hierarchy?.unit_ids?.length || 0;

                      return (
                        <div
                          key={emp.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-slate-900">{emp.full_name}</p>
                            {level === "full_project" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                🌐 Full Project
                              </span>
                            )}
                            {level === "block_level" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                🏢 {blockCount} Block(s)
                              </span>
                            )}
                            {level === "unit_level" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                🚪 {unitCount} Unit(s)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{emp.phone || "No phone"}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No employees assigned</p>
                )}
              </div>

              {/* Contractors */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-amber-700 mb-2.5 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>Linked Contractors ({contractors?.length || 0})</span>
                </p>
                {contractors && contractors.length > 0 ? (
                  <div className="space-y-1.5">
                    {contractors.map((con: any) => (
                      <div
                        key={con.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{con.company_name}</p>
                          <p className="text-xs text-slate-500">{con.profiles?.full_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No contractors linked</p>
                )}
              </div>

              {/* Owners */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-purple-700 mb-2.5 flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  <span>Project Owners ({owners?.length || 0})</span>
                </p>
                {owners && owners.length > 0 ? (
                  <div className="space-y-1.5">
                    {owners.map((own: any) => (
                      <div
                        key={own.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{own.profiles?.full_name}</p>
                          <p className="text-xs text-slate-500">{own.profiles?.phone || "No phone"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No owners assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

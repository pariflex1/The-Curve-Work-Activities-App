import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Layers,
  Users,
  MapPin,
  Plus,
  Trash2,
  UserCheck,
  Briefcase,
  Crown,
  ChevronRight,
} from "lucide-react";
import ProjectFormModal from "../ProjectFormModal";
import BlockFormModal from "./BlockFormModal";
import TeamAssignmentModal from "./TeamAssignmentModal";

export const dynamic = "force-dynamic";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch project details
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  // Fetch blocks with unit counts
  const { data: blocks } = await supabase
    .from("blocks")
    .select(`
      *,
      units (
        id,
        unit_number,
        floor,
        unit_type,
        status
      )
    `)
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  // Fetch team assignments with profile names
  const { data: employees } = await supabase
    .from("project_employees")
    .select("id, profile_id, profiles ( id, full_name, phone )")
    .eq("project_id", id);

  const { data: contractors } = await supabase
    .from("project_contractors")
    .select("id, profile_id, company_name, profiles ( id, full_name, phone )")
    .eq("project_id", id);

  const { data: owners } = await supabase
    .from("project_owners")
    .select("id, profile_id, profiles ( id, full_name, phone )")
    .eq("project_id", id);

  // Fetch available profiles for team assignment dropdown
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone")
    .eq("is_active", true);

  const totalUnits = blocks?.reduce((acc, b) => acc + (b.units?.length || 0), 0) || 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/projects"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                <span className="text-xs px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 capitalize font-medium">
                  {project.status.replace("_", " ")}
                </span>
              </div>
              {project.location && (
                <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{project.location}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ProjectFormModal project={project} isEdit={true} />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Blocks</p>
            <p className="text-2xl font-bold text-white mt-1">{blocks?.length || 0}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Units</p>
            <p className="text-2xl font-bold text-white mt-1">{totalUnits}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Employees</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{employees?.length || 0}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Contractors</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{contractors?.length || 0}</p>
          </div>
        </div>

        {/* 2-Column Section: Blocks & Hierarchy | Team Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blocks Section (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Blocks & Towers</h2>
              </div>
              <BlockFormModal projectId={id} />
            </div>

            <div className="space-y-4">
              {blocks && blocks.length > 0 ? (
                blocks.map((block) => (
                  <div
                    key={block.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{block.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                          Order #{block.sort_order}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {block.units?.length || 0} unit(s) registered in this block
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <BlockFormModal projectId={id} block={block} isEdit={true} />
                      <Link
                        href={`/admin/projects/${id}/blocks/${block.id}`}
                        className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium flex items-center gap-1.5 transition-all"
                      >
                        <span>Manage Units</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 p-6">
                  <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-300 font-medium">No Blocks Created Yet</p>
                  <p className="text-slate-500 text-xs mt-1 mb-4">
                    Add structural blocks (e.g. Tower A, Block 1) to start adding units.
                  </p>
                  <BlockFormModal projectId={id} triggerLabel="Add First Block" />
                </div>
              )}
            </div>
          </div>

          {/* Team Allocations Section (1 col) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Project Team</h2>
              </div>
              <TeamAssignmentModal
                projectId={id}
                profiles={allProfiles || []}
                assignedEmployeeIds={(employees || []).map((e: any) => e.profile_id)}
                assignedContractorIds={(contractors || []).map((c: any) => c.profile_id)}
                assignedOwnerIds={(owners || []).map((o: any) => o.profile_id)}
              />
            </div>

            {/* Team Members Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl space-y-6">
              {/* Employees */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-3 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assigned Employees ({employees?.length || 0})</span>
                </p>
                {employees && employees.length > 0 ? (
                  <div className="space-y-2">
                    {employees.map((emp: any) => (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 text-sm"
                      >
                        <div>
                          <p className="font-medium text-white">{emp.profiles?.full_name}</p>
                          <p className="text-xs text-slate-400">{emp.profiles?.phone || "No phone"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No employees assigned</p>
                )}
              </div>

              {/* Contractors */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Linked Contractors ({contractors?.length || 0})</span>
                </p>
                {contractors && contractors.length > 0 ? (
                  <div className="space-y-2">
                    {contractors.map((con: any) => (
                      <div
                        key={con.id}
                        className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 text-sm"
                      >
                        <div>
                          <p className="font-medium text-white">{con.company_name}</p>
                          <p className="text-xs text-slate-400">{con.profiles?.full_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No contractors linked</p>
                )}
              </div>

              {/* Owners */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-3 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Project Owners ({owners?.length || 0})</span>
                </p>
                {owners && owners.length > 0 ? (
                  <div className="space-y-2">
                    {owners.map((own: any) => (
                      <div
                        key={own.id}
                        className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 text-sm"
                      >
                        <div>
                          <p className="font-medium text-white">{own.profiles?.full_name}</p>
                          <p className="text-xs text-slate-400">{own.profiles?.phone || "No phone"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No owners assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

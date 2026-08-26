import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { Building2, MapPin, Layers, Crown, ChevronRight } from "lucide-react";

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
        units ( id )
      )
    `)
    .order("created_at", { ascending: false });

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
                Owner Portfolio
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Welcome, <span className="text-white font-medium">{profile?.full_name}</span> — Portfolio Overviews &amp; Executive Oversight
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

        {/* Owned Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>My Portfolio Projects ({projects?.length || 0})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects && projects.length > 0 ? (
              projects.map((project) => {
                const totalBlocks = project.blocks?.length || 0;
                const totalUnits =
                  project.blocks?.reduce(
                    (acc: number, b: any) => acc + (b.units?.length || 0),
                    0
                  ) || 0;

                return (
                  <div
                    key={project.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                        <span className="text-xs px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 capitalize font-medium">
                          {project.status.replace("_", " ")}
                        </span>
                      </div>

                      {project.location && (
                        <p className="text-slate-400 text-sm flex items-center gap-1.5 mb-5">
                          <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{project.location}</span>
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-xl border border-white/5 mb-6 text-center">
                        <div>
                          <p className="text-xs text-slate-400">Blocks</p>
                          <p className="text-lg font-bold text-white mt-0.5">{totalBlocks}</p>
                        </div>
                        <div className="border-l border-white/5">
                          <p className="text-xs text-slate-400">Units</p>
                          <p className="text-lg font-bold text-white mt-0.5">{totalUnits}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs text-emerald-300">
                      Payment disbursement and financial tracking will activate in Phase 8.
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 p-6">
                <Crown className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-300">No Portfolio Projects</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1">
                  You are not assigned as an owner on any real estate development projects yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

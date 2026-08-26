import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Welcome, {profile?.full_name}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-sm"
            >
              Sign Out
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Projects", value: "—", href: "/admin/projects" },
            { label: "Activities", value: "—", href: "/admin/activity-master" },
            { label: "Users", value: "—", href: "#" },
            { label: "Audit Logs", value: "—", href: "/admin/audit-logs" },
          ].map((card) => (
            <a
              key={card.label}
              href={card.href}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group"
            >
              <p className="text-slate-400 text-sm">{card.label}</p>
              <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

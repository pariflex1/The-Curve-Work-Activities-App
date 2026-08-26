import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";

export default async function EmployeeDashboard() {
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Employee Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Welcome, {profile?.full_name}</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-sm">
              Sign Out
            </button>
          </form>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
          <p className="text-slate-400">My Projects view will be built in Phase 3.</p>
        </div>
      </div>
    </main>
  );
}

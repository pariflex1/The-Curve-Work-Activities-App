import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminNavigation from "./AdminNavigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: profiles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNavigation
        adminName={profile?.full_name || "Admin"}
        profiles={profiles || []}
      />
      <div className="lg:pl-72 flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

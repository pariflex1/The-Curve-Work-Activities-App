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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full overflow-x-hidden">
      <AdminNavigation adminName={profile?.full_name || "Admin"} />
      <div className="lg:pl-72 flex-1 flex flex-col w-full min-w-0">
        <main className="flex-1 p-2 sm:p-4 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

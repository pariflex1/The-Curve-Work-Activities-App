import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminWorkPaymentConsole from "./AdminWorkPaymentConsole";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch detailed project hierarchy with blocks, units, activities, and contractors
  const { data: projectsData } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      status,
      location,
      blocks (
        id,
        name,
        sort_order,
        units (
          id,
          unit_number,
          floor,
          unit_type,
          status,
          unit_activities (
            id,
            estimated_cost,
            progress_percentage,
            status,
            activity_master ( id, name, category ),
            project_contractors (
              id,
              company_name,
              profiles ( full_name )
            ),
            payments (
              id,
              amount,
              paid_to,
              payment_date,
              payment_type
            )
          )
        )
      ),
      project_contractors (
        id,
        company_name,
        profiles ( full_name )
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="w-full space-y-6">
      {projectsData && projectsData.length > 0 ? (
        <AdminWorkPaymentConsole projects={(projectsData as any) || []} />
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800">No Projects Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Create your first project from the Projects tab on the left menu.
          </p>
        </div>
      )}
    </div>
  );
}

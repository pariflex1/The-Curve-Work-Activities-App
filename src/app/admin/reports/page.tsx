import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ReportsView, { ActivityReportItem, PaymentReportItem } from "./ReportsView";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch full project hierarchy and payments concurrently
  const [{ data: projects }, { data: paymentsData }] = await Promise.all([
    supabase
      .from("projects")
      .select(`
        id,
        name,
        status,
        blocks (
          id,
          name,
          units (
            id,
            unit_number,
            unit_type,
            floor,
            unit_activities (
              id,
              estimated_cost,
              progress_percentage,
              status,
              activity_master (
                id,
                name,
                category
              ),
              project_contractors (
                id,
                company_name,
                profiles (
                  full_name
                )
              ),
              payments (
                id,
                amount,
                payment_date,
                payment_type,
                paid_to,
                notes
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
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select(`
        id,
        amount,
        payment_date,
        payment_type,
        paid_to,
        notes,
        project_id,
        unit_activity_id,
        projects ( name ),
        unit_activities (
          id,
          activity_master ( name ),
          units (
            unit_number,
            blocks ( name )
          )
        )
      `)
      .order("payment_date", { ascending: false }),
  ]);

  // Flatten and structure Activities for reporting
  const activities: ActivityReportItem[] = [];
  const projectOptions: { id: string; name: string }[] = [];
  const contractorSet = new Set<string>();
  const unitOptions: { unitId: string; label: string; projectId: string }[] = [];
  const categorySet = new Set<string>();

  (projects || []).forEach((proj) => {
    projectOptions.push({ id: proj.id, name: proj.name });

    (proj.blocks || []).forEach((b: any) => {
      (b.units || []).forEach((u: any) => {
        unitOptions.push({
          unitId: u.id,
          label: `${proj.name} • ${b.name} — Unit ${u.unit_number}`,
          projectId: proj.id,
        });

        (u.unit_activities || []).forEach((act: any) => {
          const actName = act.activity_master?.name || "Activity";
          const category = act.activity_master?.category || "General";
          categorySet.add(category);

          const cCompany = act.project_contractors?.company_name || "";
          const cPerson = act.project_contractors?.profiles?.full_name || "";
          const cName = cCompany ? (cPerson && cPerson !== cCompany ? `${cCompany} — ${cPerson}` : cCompany) : "";
          if (cName) contractorSet.add(cName);

          const estCost = Number(act.estimated_cost) || 0;
          const totalPaid = (act.payments || []).reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0);
          const balanceDue = estCost - totalPaid;

          activities.push({
            id: act.id,
            projectId: proj.id,
            projectName: proj.name,
            blockName: b.name,
            unitId: u.id,
            unitNumber: u.unit_number,
            unitType: u.unit_type || "Apartment",
            activityName: actName,
            category,
            contractorName: cName,
            contractorCompany: cCompany,
            estimatedCost: estCost,
            progressPercentage: Number(act.progress_percentage) || 0,
            status: act.status || "pending",
            totalPaid,
            balanceDue,
            payments: act.payments || [],
          });
        });
      });
    });
  });

  // Structure Payments for reporting
  const payments: PaymentReportItem[] = (paymentsData || []).map((p: any) => ({
    id: p.id,
    projectId: p.project_id,
    projectName: p.projects?.name || "Project",
    blockName: p.unit_activities?.units?.blocks?.name || "Block",
    unitNumber: p.unit_activities?.units?.unit_number || "Unit",
    activityName: p.unit_activities?.activity_master?.name || "Milestone",
    contractorName: p.paid_to || "Contractor",
    amount: Number(p.amount) || 0,
    paymentDate: p.payment_date,
    paymentType: p.payment_type || "Bank Transfer",
    notes: p.notes || "",
  }));

  return (
    <ReportsView
      activities={activities}
      payments={payments}
      projectOptions={projectOptions}
      contractorOptions={Array.from(contractorSet)}
      unitOptions={unitOptions}
      categoryOptions={Array.from(categorySet)}
    />
  );
}

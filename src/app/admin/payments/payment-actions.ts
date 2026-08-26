"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPayment(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  const projectId = formData.get("project_id") as string;
  const unitActivityId = (formData.get("unit_activity_id") as string) || null;
  const amount = parseFloat(formData.get("amount") as string);
  const paymentType = (formData.get("payment_type") as string) || "Bank Transfer";
  const paidTo = formData.get("paid_to") as string;
  const paymentDate = (formData.get("payment_date") as string) || new Date().toISOString().split("T")[0];
  const notes = (formData.get("notes") as string) || null;

  if (!unitActivityId) {
    return { error: "Payment must be connected to a specific Unit Work Activity." };
  }

  if (isNaN(amount) || amount <= 0) {
    return { error: "Payment amount must be greater than 0." };
  }

  if (!paidTo || paidTo.trim() === "" || paidTo.toLowerCase().includes("unassigned")) {
    return { error: "Cannot record payment to an unassigned contractor. Please assign a contractor first." };
  }

  // Verify that the target unit activity has an assigned contractor
  const { data: targetAct } = await supabase
    .from("unit_activities")
    .select("id, contractor_id")
    .eq("id", unitActivityId)
    .single();

  if (!targetAct || !targetAct.contractor_id) {
    return { error: "This work activity is unassigned. Please assign a contractor before recording payment." };
  }



  const { data, error } = await supabase
    .from("payments")
    .insert({
      project_id: projectId,
      unit_activity_id: unitActivityId,
      amount,
      payment_type: paymentType,
      paid_to: paidTo,
      payment_date: paymentDate,
      notes,
      created_by: profile?.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Write audit log entry
  await supabase.from("audit_logs").insert({
    actor_profile_id: profile?.id,
    action: "CREATE_PAYMENT",
    entity_type: "payments",
    entity_id: data.id,
    meta_json: {
      amount,
      paid_to: paidTo,
      project_id: projectId,
      unit_activity_id: unitActivityId,
    },
  });

  revalidatePath(`/owner`);
  revalidatePath(`/admin/projects/${projectId}`);
  return { data };
}

export async function updatePayment(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const projectId = formData.get("project_id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const paymentType = formData.get("payment_type") as string;
  const paidTo = formData.get("paid_to") as string;
  const paymentDate = formData.get("payment_date") as string;
  const notes = (formData.get("notes") as string) || null;

  const { error } = await supabase
    .from("payments")
    .update({
      amount,
      payment_type: paymentType,
      paid_to: paidTo,
      payment_date: paymentDate,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  // Write audit log entry
  await supabase.from("audit_logs").insert({
    actor_profile_id: profile?.id,
    action: "UPDATE_PAYMENT",
    entity_type: "payments",
    entity_id: id,
    meta_json: {
      amount,
      paid_to: paidTo,
      project_id: projectId,
    },
  });

  revalidatePath(`/owner`);
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function deletePayment(id: string, projectId: string, amount: number, paidTo: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase.from("payments").delete().eq("id", id);

  if (error) return { error: error.message };

  // Write audit log entry for payment deletion
  await supabase.from("audit_logs").insert({
    actor_profile_id: profile?.id,
    action: "DELETE_PAYMENT",
    entity_type: "payments",
    entity_id: id,
    meta_json: {
      deleted_amount: amount,
      paid_to: paidTo,
      project_id: projectId,
    },
  });

  revalidatePath(`/owner`);
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function getPaymentFormContext(projectId: string) {
  const supabase = await createClient();

  // 1. Fetch project contractors
  const { data: pc } = await supabase
    .from("project_contractors")
    .select("id, company_name, profile_id, profiles(full_name)")
    .eq("project_id", projectId);

  let contractors: { id: string; company_name: string; full_name?: string | null }[] = [];
  if (pc && pc.length > 0) {
    contractors = pc
      .filter((c: any) => c.company_name || c.profiles?.full_name)
      .map((c: any) => ({
        id: c.id,
        company_name: c.company_name || "Contractor",
        full_name: c.profiles?.full_name || null,
      }));
  }

  // 2. Fetch blocks and units
  const { data: blocks } = await supabase
    .from("blocks")
    .select("id, name, sort_order, units(id, unit_number, floor, status)")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  const unitMap: Record<string, { unitNumber: string; blockName: string }> = {};
  const unitIds: string[] = [];
  const units: { unit_id: string; label: string }[] = [];

  (blocks || []).forEach((b: any) => {
    (b.units || []).forEach((u: any) => {
      unitIds.push(u.id);
      const label = `${b.name} — Unit ${u.unit_number}`;
      unitMap[u.id] = { unitNumber: u.unit_number, blockName: b.name };
      units.push({ unit_id: u.id, label });
    });
  });

  // 3. Fetch unit activities
  let activities: {
    id: string;
    unit_id: string;
    unit_number: string;
    block_name: string;
    activity_name: string;
    contractor_id: string | null;
    contractor_name: string;
    contractor_company: string;
    contractor_person: string;
    estimated_cost: number;
    progress_percentage: number;
  }[] = [];

  if (unitIds.length > 0) {
    const { data: ua } = await supabase
      .from("unit_activities")
      .select(`
        id,
        unit_id,
        contractor_id,
        estimated_cost,
        progress_percentage,
        activity_master ( name ),
        project_contractors (
          id,
          company_name,
          profiles ( full_name )
        )
      `)
      .in("unit_id", unitIds);

    if (ua && ua.length > 0) {
      activities = ua.map((item: any) => {
        const info = unitMap[item.unit_id] || { unitNumber: "Unit", blockName: "Block" };
        const activityName = item.activity_master?.name || "Activity";
        const cCompany = item.project_contractors?.company_name || "";
        const cPerson = item.project_contractors?.profiles?.full_name || "";
        const cId = item.contractor_id || item.project_contractors?.id || null;
        const cName = cCompany ? (cPerson && cPerson !== cCompany ? `${cCompany} — ${cPerson}` : cCompany) : "";

        return {
          id: item.id,
          unit_id: item.unit_id,
          unit_number: info.unitNumber,
          block_name: info.blockName,
          activity_name: activityName,
          contractor_id: cId,
          contractor_name: cName,
          contractor_company: cCompany,
          contractor_person: cPerson,
          estimated_cost: Number(item.estimated_cost) || 0,
          progress_percentage: Number(item.progress_percentage) || 0,
        };
      });
    }
  }

  // If no project contractors are linked, fallback to general contractor profiles
  if (contractors.length === 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, company_name")
      .eq("role", "contractor");

    if (profs && profs.length > 0) {
      contractors = profs.map((p: any) => ({
        id: p.id,
        company_name: p.company_name || p.full_name,
        full_name: p.full_name,
      }));
    }
  }

  return { contractors, units, activities };
}


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

  if (isNaN(amount) || amount <= 0) {
    return { error: "Payment amount must be greater than 0." };
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

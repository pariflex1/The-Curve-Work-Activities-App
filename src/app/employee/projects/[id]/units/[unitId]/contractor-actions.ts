"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function assignContractorToActivity(
  unitActivityId: string,
  newContractorId: string | null,
  projectId: string,
  unitId: string
) {
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

  // Fetch current activity to get old contractor ID
  const { data: currentActivity, error: fetchErr } = await supabase
    .from("unit_activities")
    .select("contractor_id, activity_master ( name )")
    .eq("id", unitActivityId)
    .single();

  if (fetchErr) return { error: fetchErr.message };

  const oldContractorId = currentActivity?.contractor_id;

  // Update contractor_id on unit_activity
  const { error: updateErr } = await supabase
    .from("unit_activities")
    .update({
      contractor_id: newContractorId || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", unitActivityId);

  if (updateErr) return { error: updateErr.message };

  // Write audit log entry
  await supabase.from("audit_logs").insert({
    actor_profile_id: profile?.id,
    action: oldContractorId ? "REASSIGN_CONTRACTOR" : "ASSIGN_CONTRACTOR",
    entity_type: "unit_activities",
    entity_id: unitActivityId,
    meta_json: {
      activity_name: (currentActivity?.activity_master as any)?.name,
      old_contractor_id: oldContractorId,
      new_contractor_id: newContractorId,
      unit_id: unitId,
      project_id: projectId,
    },
  });

  revalidatePath(`/employee/projects/${projectId}/units/${unitId}`);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/contractor`);
  return { success: true };
}

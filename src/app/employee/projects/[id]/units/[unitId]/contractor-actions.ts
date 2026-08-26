"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
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

  if (!user) return { error: "Unauthorized. Please log in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Profile not found." };

  // Check role & assignment
  if (profile.role !== "admin") {
    if (profile.role !== "employee") {
      return { error: "Unauthorized: only Admins and Site Engineers can assign contractors." };
    }
    const { data: assignment } = await supabase
      .from("project_employees")
      .select("id")
      .eq("project_id", projectId)
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (!assignment) {
      return { error: "Access denied. You are not assigned to this project." };
    }
  }

  const adminClient = createAdminClient();

  // Fetch current activity to get old contractor ID
  const { data: currentActivity, error: fetchErr } = await adminClient
    .from("unit_activities")
    .select("contractor_id, activity_master ( name )")
    .eq("id", unitActivityId)
    .single();

  if (fetchErr) return { error: fetchErr.message };

  const oldContractorId = currentActivity?.contractor_id;

  // Update contractor_id on unit_activity
  const { error: updateErr } = await adminClient
    .from("unit_activities")
    .update({
      contractor_id: newContractorId || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", unitActivityId);

  if (updateErr) return { error: updateErr.message };

  // Write audit log entry
  await adminClient.from("audit_logs").insert({
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

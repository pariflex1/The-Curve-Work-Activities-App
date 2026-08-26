"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function submitProgressReport(
  unitActivityId: string,
  newProgress: number,
  workCompletedNote: string,
  photoPaths: string[] = [],
  remarks?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized. Please log in." };

  // Fetch actor profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role === "contractor") {
    return { error: "Contractors have read-only access. Inspection reports must be verified and submitted by the Site Engineer." };
  }

  const adminClient = createAdminClient();

  // Fetch current unit activity
  const { data: currentAct, error: actErr } = await adminClient
    .from("unit_activities")
    .select(`
      id,
      progress_percentage,
      contractor_id,
      unit_id,
      units (
        id,
        block_id,
        blocks (
          id,
          project_id
        )
      )
    `)
    .eq("id", unitActivityId)
    .single();

  if (actErr || !currentAct) return { error: "Activity not found." };

  const projectId = (currentAct.units as any)?.blocks?.project_id;

  // If role is employee, verify assignment to project
  if (profile?.role === "employee" && projectId) {
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

  const previousProgress = Number(currentAct.progress_percentage) || 0;
  let contractorId = currentAct.contractor_id;

  // If still no contractor ID, lookup first contractor for this project
  if (!contractorId && projectId) {
    const { data: firstContractor } = await adminClient
      .from("project_contractors")
      .select("id")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle();
    if (firstContractor) contractorId = firstContractor.id;
  }

  // 1. Insert into append-only progress_reports if contractorId is available
  if (contractorId) {
    const { data: report, error: repErr } = await adminClient
      .from("progress_reports")
      .insert({
        unit_activity_id: unitActivityId,
        contractor_id: contractorId,
        previous_progress: previousProgress,
        new_progress: newProgress,
        work_completed_note: workCompletedNote || "Progress updated",
      })
      .select()
      .single();

    if (!repErr && report && photoPaths && photoPaths.length > 0) {
      const photoRows = photoPaths.map((path) => ({
        progress_report_id: report.id,
        storage_path: path,
      }));
      await adminClient.from("progress_report_photos").insert(photoRows);
    }
  }

  // 2. Compute accurate auto-status transition
  let newStatus = "pending";
  let completionDate = null;
  if (newProgress >= 100) {
    newStatus = "completed";
    completionDate = new Date().toISOString().split("T")[0];
  } else if (newProgress > 0) {
    newStatus = "in_progress";
  }

  // 3. Update cached values in unit_activities
  const updatePayload: any = {
    progress_percentage: newProgress,
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (remarks) updatePayload.remarks = remarks;
  if (completionDate) updatePayload.actual_completion_date = completionDate;

  const { error: updErr } = await adminClient
    .from("unit_activities")
    .update(updatePayload)
    .eq("id", unitActivityId);

  if (updErr) return { error: updErr.message };

  // Write audit log
  if (profile) {
    await adminClient.from("audit_logs").insert({
      actor_profile_id: profile.id,
      action: "SUBMIT_PROGRESS_REPORT",
      entity_type: "unit_activities",
      entity_id: unitActivityId,
      meta_json: {
        previous_progress: previousProgress,
        new_progress: newProgress,
        status: newStatus,
        work_completed_note: workCompletedNote,
      },
    });
  }

  const blockId = (currentAct.units as any)?.block_id;
  const unitId = currentAct.unit_id;

  if (projectId && blockId && unitId) {
    revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}`);
    revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}/progress`);
    revalidatePath(`/employee/projects/${projectId}/units/${unitId}`);
  }
  revalidatePath(`/contractor/work/${unitActivityId}`);
  revalidatePath(`/contractor`);
  revalidatePath(`/admin`);
  revalidatePath(`/employee`);
  revalidatePath(`/owner`);
  return { success: true };
}

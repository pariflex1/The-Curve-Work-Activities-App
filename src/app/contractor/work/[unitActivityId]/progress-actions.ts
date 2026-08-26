"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitProgressReport(
  unitActivityId: string,
  newProgress: number,
  workCompletedNote: string,
  photoPaths: string[],
  remarks?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Fetch contractor profile & project_contractor record
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  const { data: contractorRec } = await supabase
    .from("project_contractors")
    .select("id")
    .eq("profile_id", profile?.id)
    .single();

  // Fetch current unit activity to get previous_progress
  const { data: currentAct, error: actErr } = await supabase
    .from("unit_activities")
    .select("id, progress_percentage, contractor_id, unit_id")
    .eq("id", unitActivityId)
    .single();

  if (actErr || !currentAct) return { error: "Activity not found" };

  const previousProgress = Number(currentAct.progress_percentage) || 0;
  const contractorId = contractorRec?.id || currentAct.contractor_id;

  if (!contractorId) {
    return { error: "No contractor ID found for this progress submission." };
  }

  // 1. Insert into append-only progress_reports
  const { data: report, error: repErr } = await supabase
    .from("progress_reports")
    .insert({
      unit_activity_id: unitActivityId,
      contractor_id: contractorId,
      previous_progress: previousProgress,
      new_progress: newProgress,
      work_completed_note: workCompletedNote,
    })
    .select()
    .single();

  if (repErr) return { error: repErr.message };

  // 2. Insert photos if any
  if (photoPaths && photoPaths.length > 0) {
    const photoRows = photoPaths.map((path) => ({
      progress_report_id: report.id,
      storage_path: path,
    }));
    await supabase.from("progress_report_photos").insert(photoRows);
  }

  // 3. Compute auto-status transition
  let newStatus = "pending";
  let completionDate = null;
  if (newProgress > 0 && newProgress < 100) {
    newStatus = "in_progress";
  } else if (newProgress >= 100) {
    newStatus = "completed";
    completionDate = new Date().toISOString().split("T")[0];
  }

  // 4. Update cached values in unit_activities
  const updatePayload: any = {
    progress_percentage: newProgress,
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (remarks) updatePayload.remarks = remarks;
  if (completionDate) updatePayload.actual_completion_date = completionDate;

  const { error: updErr } = await supabase
    .from("unit_activities")
    .update(updatePayload)
    .eq("id", unitActivityId);

  if (updErr) return { error: updErr.message };

  revalidatePath(`/contractor/work/${unitActivityId}`);
  revalidatePath(`/contractor`);
  revalidatePath(`/admin`);
  revalidatePath(`/employee`);
  return { success: true };
}

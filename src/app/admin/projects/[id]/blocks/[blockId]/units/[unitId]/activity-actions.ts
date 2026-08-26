"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

// Helper to verify caller authentication and project access
async function verifyProjectAccess(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: "Unauthorized. Please log in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { authorized: false, error: "User profile not found." };
  }

  if (profile.role === "admin") {
    return { authorized: true, profile, adminClient: createAdminClient() };
  }

  if (profile.role === "employee") {
    // Check if employee is assigned to this project
    const { data: assignment } = await supabase
      .from("project_employees")
      .select("id")
      .eq("project_id", projectId)
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (assignment) {
      return { authorized: true, profile, adminClient: createAdminClient() };
    }
  }

  return {
    authorized: false,
    error: "Access denied. You do not have permission for this project.",
  };
}

// Mode 1: "From Template" — Provision multiple activities from selected Activity Master items
export async function provisionFromTemplate(
  unitId: string,
  projectId: string,
  blockId?: string,
  selectedActivityIds: string[] = [],
  estimatedCosts: Record<string, number> = {}
) {
  const authCheck = await verifyProjectAccess(projectId);
  if (!authCheck.authorized || !authCheck.adminClient) {
    return { error: authCheck.error };
  }

  const db = authCheck.adminClient;

  if (!selectedActivityIds || selectedActivityIds.length === 0) {
    return { error: "Please select at least one activity to provision." };
  }

  // Fetch activity masters to maintain sort order
  const { data: masters, error: mError } = await db
    .from("activity_master")
    .select("id, sort_order")
    .in("id", selectedActivityIds);

  if (mError) return { error: mError.message };

  const rowsToInsert = masters.map((master) => ({
    unit_id: unitId,
    activity_master_id: master.id,
    contractor_id: null,
    estimated_cost: estimatedCosts[master.id] || 0,
    progress_percentage: 0,
    status: "pending",
    sort_order: master.sort_order || 0,
  }));

  const { data, error } = await db
    .from("unit_activities")
    .insert(rowsToInsert)
    .select();

  if (error) return { error: error.message };

  // Write audit log
  if (authCheck.profile?.id) {
    await db.from("audit_logs").insert({
      actor_profile_id: authCheck.profile.id,
      action: "PROVISION_ACTIVITIES_BATCH",
      entity_type: "unit_activities",
      entity_id: unitId,
      meta_json: {
        unit_id: unitId,
        project_id: projectId,
        count: rowsToInsert.length,
        activity_ids: selectedActivityIds,
      },
    });
  }

  // Revalidate both admin and employee paths
  if (blockId) {
    revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}`);
    revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}/progress`);
  }
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/employee/projects/${projectId}/units/${unitId}`);
  revalidatePath(`/employee/projects/${projectId}`);
  revalidatePath(`/contractor`);
  revalidatePath(`/owner`);
  return { data };
}

// Mode: Provision a Single Activity (from dropdown or Custom Activity)
export async function provisionSingleActivity(
  unitId: string,
  projectId: string,
  blockId?: string,
  payload: {
    activityMasterId?: string;
    customName?: string;
    customCode?: string;
    customCategory?: string;
    customDefaultUnit?: string;
    estimatedCost?: number;
    remarks?: string;
  } = {}
) {
  const authCheck = await verifyProjectAccess(projectId);
  if (!authCheck.authorized || !authCheck.adminClient) {
    return { error: authCheck.error };
  }

  const db = authCheck.adminClient;
  let masterId = payload.activityMasterId;

  // If custom activity was entered, find or create the activity_master record
  if (!masterId && payload.customName?.trim()) {
    const trimmedName = payload.customName.trim();

    // Check if already in activity_master
    const { data: existing } = await db
      .from("activity_master")
      .select("id")
      .ilike("name", trimmedName)
      .maybeSingle();

    if (existing) {
      masterId = existing.id;
    } else {
      // Create new activity_master
      const { data: newMaster, error: createError } = await db
        .from("activity_master")
        .insert({
          name: trimmedName,
          code: payload.customCode?.trim().toUpperCase() || null,
          category: payload.customCategory?.trim() || "General",
          default_unit: payload.customDefaultUnit?.trim() || null,
          is_active: true,
          sort_order: 99,
        })
        .select("id")
        .single();

      if (createError) return { error: createError.message };
      masterId = newMaster.id;
    }
  }

  if (!masterId) {
    return { error: "Please select an activity or enter a custom activity name." };
  }

  // Check if this activity is already provisioned for this unit
  const { data: alreadyProvisioned } = await db
    .from("unit_activities")
    .select("id")
    .eq("unit_id", unitId)
    .eq("activity_master_id", masterId)
    .maybeSingle();

  if (alreadyProvisioned) {
    return { error: "This activity is already provisioned for this unit." };
  }

  // Insert into unit_activities
  const { data, error } = await db
    .from("unit_activities")
    .insert({
      unit_id: unitId,
      activity_master_id: masterId,
      contractor_id: null,
      estimated_cost: payload.estimatedCost || 0,
      remarks: payload.remarks || null,
      progress_percentage: 0,
      status: "pending",
      sort_order: 10,
    })
    .select();

  if (error) return { error: error.message };

  // Write audit log
  if (authCheck.profile?.id) {
    await db.from("audit_logs").insert({
      actor_profile_id: authCheck.profile.id,
      action: "ADD_UNIT_ACTIVITY",
      entity_type: "unit_activities",
      entity_id: data?.[0]?.id,
      meta_json: {
        unit_id: unitId,
        project_id: projectId,
        activity_master_id: masterId,
        custom: !payload.activityMasterId,
        estimated_cost: payload.estimatedCost || 0,
      },
    });
  }

  if (blockId) {
    revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}`);
    revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}/progress`);
  }
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/employee/projects/${projectId}/units/${unitId}`);
  revalidatePath(`/employee/projects/${projectId}`);
  revalidatePath("/admin/activity-master");
  revalidatePath(`/contractor`);
  revalidatePath(`/owner`);
  return { data };
}

// Mode 2: "Copy from another unit" — Clone unit_activities from a source unit in the same project
export async function copyFromUnit(
  targetUnitId: string,
  sourceUnitId: string,
  projectId: string,
  blockId?: string
) {
  const authCheck = await verifyProjectAccess(projectId);
  if (!authCheck.authorized || !authCheck.adminClient) {
    return { error: authCheck.error };
  }

  const db = authCheck.adminClient;

  // Fetch source unit activities
  const { data: sourceActivities, error: sError } = await db
    .from("unit_activities")
    .select("activity_master_id, estimated_cost, remarks, sort_order")
    .eq("unit_id", sourceUnitId);

  if (sError) return { error: sError.message };

  if (!sourceActivities || sourceActivities.length === 0) {
    return { error: "The selected source unit has no activities to copy." };
  }

  // Create brand new independent rows for the target unit
  const newRows = sourceActivities.map((sa) => ({
    unit_id: targetUnitId,
    activity_master_id: sa.activity_master_id,
    contractor_id: null,
    estimated_cost: sa.estimated_cost || 0,
    progress_percentage: 0,
    status: "pending",
    remarks: sa.remarks,
    sort_order: sa.sort_order || 0,
  }));

  const { data, error } = await db
    .from("unit_activities")
    .insert(newRows)
    .select();

  if (error) return { error: error.message };

  // Write audit log
  if (authCheck.profile?.id) {
    await db.from("audit_logs").insert({
      actor_profile_id: authCheck.profile.id,
      action: "COPY_UNIT_ACTIVITIES",
      entity_type: "unit_activities",
      entity_id: targetUnitId,
      meta_json: {
        target_unit_id: targetUnitId,
        source_unit_id: sourceUnitId,
        project_id: projectId,
        count: newRows.length,
      },
    });
  }

  if (blockId) {
    revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${targetUnitId}`);
  }
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/employee/projects/${projectId}/units/${targetUnitId}`);
  revalidatePath(`/employee/projects/${projectId}`);
  return { data };
}

// Comprehensive Activity Updation (For Admin, Engineer & Site Supervisor)
export async function updateUnitActivity(
  unitActivityId: string,
  projectId: string,
  unitId: string,
  payload: {
    blockId?: string;
    estimatedCost?: number;
    progressPercentage?: number;
    status?: string;
    contractorId?: string | null;
    remarks?: string;
  }
) {
  const authCheck = await verifyProjectAccess(projectId);
  if (!authCheck.authorized || !authCheck.adminClient) {
    return { error: authCheck.error };
  }

  const db = authCheck.adminClient;
  const actorProfileId = authCheck.profile?.id;

  // Fetch current activity state
  const { data: currentAct, error: fetchErr } = await db
    .from("unit_activities")
    .select("*, activity_master(name)")
    .eq("id", unitActivityId)
    .single();

  if (fetchErr || !currentAct) return { error: "Activity not found" };

  let progress = payload.progressPercentage !== undefined ? payload.progressPercentage : currentAct.progress_percentage;
  let status = payload.status || currentAct.status;
  const estimatedCost = payload.estimatedCost !== undefined ? payload.estimatedCost : currentAct.estimated_cost;
  const remarks = payload.remarks !== undefined ? payload.remarks : currentAct.remarks;
  const contractorId = payload.contractorId !== undefined ? payload.contractorId : currentAct.contractor_id;

  // Auto-correct and synchronize Status with Progress %
  if (payload.progressPercentage !== undefined && payload.status === undefined) {
    if (progress >= 100) {
      progress = 100;
      status = "completed";
    } else if (progress > 0) {
      status = "in_progress";
    } else {
      progress = 0;
      status = "pending";
    }
  } else if (payload.status !== undefined && payload.progressPercentage === undefined) {
    if (status === "completed" && progress < 100) {
      progress = 100;
    } else if (status === "pending" && progress > 0) {
      progress = 0;
    } else if (status === "in_progress" && progress === 0) {
      progress = 25;
    }
  } else if (payload.progressPercentage !== undefined && payload.status !== undefined) {
    // Both supplied
    if (progress >= 100) {
      status = "completed";
    } else if (progress === 0 && status === "completed") {
      progress = 100;
    }
  }

  let actualCompletionDate = currentAct.actual_completion_date;
  if (status === "completed" && !actualCompletionDate) {
    actualCompletionDate = new Date().toISOString().split("T")[0];
  } else if (status !== "completed") {
    actualCompletionDate = null;
  }

  const updateData: any = {
    estimated_cost: estimatedCost,
    progress_percentage: progress,
    status: status,
    contractor_id: contractorId || null,
    remarks: remarks || null,
    actual_completion_date: actualCompletionDate,
    updated_at: new Date().toISOString(),
  };

  const { error: updErr } = await db
    .from("unit_activities")
    .update(updateData)
    .eq("id", unitActivityId);

  if (updErr) return { error: updErr.message };

  // Write audit log
  if (actorProfileId) {
    await db.from("audit_logs").insert({
      actor_profile_id: actorProfileId,
      action: "UPDATE_ACTIVITY",
      entity_type: "unit_activities",
      entity_id: unitActivityId,
      meta_json: {
        activity_name: currentAct.activity_master?.name,
        previous_progress: currentAct.progress_percentage,
        new_progress: progress,
        previous_status: currentAct.status,
        new_status: status,
        previous_cost: currentAct.estimated_cost,
        new_cost: estimatedCost,
      },
    });
  }

  // Revalidate routes
  if (payload.blockId) {
    revalidatePath(`/admin/projects/${projectId}/blocks/${payload.blockId}/units/${unitId}`);
    revalidatePath(`/admin/projects/${projectId}/blocks/${payload.blockId}/units/${unitId}/progress`);
  }
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/employee/projects/${projectId}/units/${unitId}`);
  revalidatePath(`/employee/projects/${projectId}`);
  revalidatePath(`/contractor/work/${unitActivityId}`);
  revalidatePath(`/contractor`);
  revalidatePath(`/owner`);
  return { success: true };
}

// Delete a unit activity
export async function deleteUnitActivity(
  unitActivityId: string,
  projectId: string,
  unitId: string,
  blockId?: string
) {
  const authCheck = await verifyProjectAccess(projectId);
  if (!authCheck.authorized || !authCheck.adminClient) {
    return { error: authCheck.error };
  }

  const db = authCheck.adminClient;

  // Fetch activity name before deleting for audit log
  const { data: act } = await db
    .from("unit_activities")
    .select("activity_master ( name )")
    .eq("id", unitActivityId)
    .single();

  const { error } = await db
    .from("unit_activities")
    .delete()
    .eq("id", unitActivityId);

  if (error) return { error: error.message };

  // Write audit log
  if (authCheck.profile?.id) {
    await db.from("audit_logs").insert({
      actor_profile_id: authCheck.profile.id,
      action: "DELETE_UNIT_ACTIVITY",
      entity_type: "unit_activities",
      entity_id: unitActivityId,
      meta_json: {
        unit_id: unitId,
        project_id: projectId,
        activity_name: (act?.activity_master as any)?.name || "Unknown",
      },
    });
  }

  if (blockId) {
    revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}`);
    revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}/progress`);
  }
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/employee/projects/${projectId}/units/${unitId}`);
  revalidatePath(`/employee/projects/${projectId}`);
  return { success: true };
}

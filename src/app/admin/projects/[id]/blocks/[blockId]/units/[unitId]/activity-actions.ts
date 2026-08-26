"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Mode 1: "From Template" — Provision activities from selected Activity Master items
export async function provisionFromTemplate(
  unitId: string,
  projectId: string,
  blockId: string,
  selectedActivityIds: string[],
  estimatedCosts: Record<string, number>
) {
  const supabase = await createClient();

  if (!selectedActivityIds || selectedActivityIds.length === 0) {
    return { error: "Please select at least one activity to provision." };
  }

  // Fetch activity masters to maintain sort order
  const { data: masters, error: mError } = await supabase
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

  const { data, error } = await supabase
    .from("unit_activities")
    .insert(rowsToInsert)
    .select();

  if (error) return { error: error.message };

  revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}`);
  return { data };
}

// Mode 2: "Copy from another unit" — Clone unit_activities from a source unit in the same project
export async function copyFromUnit(
  targetUnitId: string,
  sourceUnitId: string,
  projectId: string,
  blockId: string
) {
  const supabase = await createClient();

  // Fetch source unit activities
  const { data: sourceActivities, error: sError } = await supabase
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
    contractor_id: null, // Reset contractor assignment
    estimated_cost: sa.estimated_cost || 0,
    progress_percentage: 0, // Reset progress
    status: "pending",
    remarks: sa.remarks,
    sort_order: sa.sort_order || 0,
  }));

  const { data, error } = await supabase
    .from("unit_activities")
    .insert(newRows)
    .select();

  if (error) return { error: error.message };

  revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${targetUnitId}`);
  return { data };
}

// Update individual unit activity cost & remarks
export async function updateUnitActivity(
  unitActivityId: string,
  projectId: string,
  blockId: string,
  unitId: string,
  estimatedCost: number,
  remarks?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("unit_activities")
    .update({
      estimated_cost: estimatedCost,
      remarks: remarks || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", unitActivityId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}`);
  return { success: true };
}

// Delete a unit activity
export async function deleteUnitActivity(
  unitActivityId: string,
  projectId: string,
  blockId: string,
  unitId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("unit_activities")
    .delete()
    .eq("id", unitActivityId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}/units/${unitId}`);
  return { success: true };
}

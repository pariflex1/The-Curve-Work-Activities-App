"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ==========================================
// PROJECTS ACTIONS
// ==========================================

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const status = (formData.get("status") as string) || "active";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileId = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    profileId = profile?.id;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name,
      location,
      status,
      created_by: profileId,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/projects");
  return { data };
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("projects")
    .update({
      name,
      location,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  return { success: true };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/projects");
  return { success: true };
}

// ==========================================
// BLOCKS ACTIONS
// ==========================================

export async function createBlock(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const sortOrder = parseInt((formData.get("sort_order") as string) || "0", 10);

  const { data, error } = await supabase
    .from("blocks")
    .insert({
      project_id: projectId,
      name,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/projects/${projectId}`);
  return { data };
}

export async function updateBlock(blockId: string, projectId: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const sortOrder = parseInt((formData.get("sort_order") as string) || "0", 10);

  const { error } = await supabase
    .from("blocks")
    .update({
      name,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", blockId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function deleteBlock(blockId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blocks").delete().eq("id", blockId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

// ==========================================
// UNITS ACTIONS
// ==========================================

export async function createUnit(blockId: string, projectId: string, formData: FormData) {
  const supabase = await createClient();
  const unitNumber = formData.get("unit_number") as string;
  const floor = formData.get("floor") as string;
  const unitType = formData.get("unit_type") as string;
  const area = formData.get("area") ? parseFloat(formData.get("area") as string) : null;
  const status = (formData.get("status") as string) || "active";

  const { data, error } = await supabase
    .from("units")
    .insert({
      block_id: blockId,
      unit_number: unitNumber,
      floor,
      unit_type: unitType,
      area,
      status,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}`);
  return { data };
}

export async function updateUnit(unitId: string, blockId: string, projectId: string, formData: FormData) {
  const supabase = await createClient();
  const unitNumber = formData.get("unit_number") as string;
  const floor = formData.get("floor") as string;
  const unitType = formData.get("unit_type") as string;
  const area = formData.get("area") ? parseFloat(formData.get("area") as string) : null;
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("units")
    .update({
      unit_number: unitNumber,
      floor,
      unit_type: unitType,
      area,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", unitId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}`);
  return { success: true };
}

export async function deleteUnit(unitId: string, blockId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("units").delete().eq("id", unitId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}/blocks/${blockId}`);
  return { success: true };
}

// ==========================================
// TEAM ASSIGNMENTS ACTIONS
// ==========================================

export async function assignEmployee(
  projectId: string,
  profileId: string,
  hierarchy?: {
    accessLevel?: "full_project" | "block_level" | "unit_level";
    blockIds?: string[];
    unitIds?: string[];
  }
) {
  const supabase = await createClient();
  const { data: newPE, error } = await supabase
    .from("project_employees")
    .insert({ project_id: projectId, profile_id: profileId })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // If hierarchy scope is specified or defaulted
  const accessLevel = hierarchy?.accessLevel || "full_project";
  const blockIds = hierarchy?.blockIds || [];
  const unitIds = hierarchy?.unitIds || [];

  const { data: { user } } = await supabase.auth.getUser();
  let actorId = null;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
    actorId = p?.id;
  }

  // Record hierarchy configuration in audit_logs
  await supabase.from("audit_logs").insert({
    actor_profile_id: actorId,
    action: "SET_HIERARCHY",
    entity_type: "project_employees",
    entity_id: newPE.id,
    meta_json: {
      access_level: accessLevel,
      block_ids: blockIds,
      unit_ids: unitIds,
      project_id: projectId,
      profile_id: profileId,
    },
  });

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/employee`);
  revalidatePath(`/employee/projects/${projectId}`);
  return { success: true };
}

export async function updateEmployeeHierarchy(
  projectId: string,
  profileId: string,
  hierarchy: {
    accessLevel: "full_project" | "block_level" | "unit_level";
    blockIds?: string[];
    unitIds?: string[];
  }
) {
  const supabase = await createClient();
  
  // Find project_employees record
  const { data: pe, error: peErr } = await supabase
    .from("project_employees")
    .select("id")
    .eq("project_id", projectId)
    .eq("profile_id", profileId)
    .single();

  if (peErr || !pe) {
    return { error: "Employee project assignment not found." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  let actorId = null;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
    actorId = p?.id;
  }

  // Save new hierarchy configuration
  const { error: logErr } = await supabase.from("audit_logs").insert({
    actor_profile_id: actorId,
    action: "SET_HIERARCHY",
    entity_type: "project_employees",
    entity_id: pe.id,
    meta_json: {
      access_level: hierarchy.accessLevel || "full_project",
      block_ids: hierarchy.blockIds || [],
      unit_ids: hierarchy.unitIds || [],
      project_id: projectId,
      profile_id: profileId,
    },
  });

  if (logErr) return { error: logErr.message };

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/employee`);
  revalidatePath(`/employee/projects/${projectId}`);
  return { success: true };
}

export async function removeEmployee(projectId: string, profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_employees")
    .delete()
    .match({ project_id: projectId, profile_id: profileId });

  if (error) return { error: error.message };
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/employee`);
  revalidatePath(`/employee/projects/${projectId}`);
  return { success: true };
}

export async function assignContractor(projectId: string, profileId: string, companyName: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_contractors")
    .insert({
      project_id: projectId,
      profile_id: profileId,
      company_name: companyName,
    });

  if (error) return { error: error.message };
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function removeContractor(projectId: string, profileId: string) {
  const supabase = await createClient();

  // Find project_contractor record ID
  const { data: pc } = await supabase
    .from("project_contractors")
    .select("id")
    .match({ project_id: projectId, profile_id: profileId })
    .maybeSingle();

  if (pc?.id) {
    await supabase
      .from("unit_activities")
      .update({ assigned_contractor_id: null })
      .eq("assigned_contractor_id", pc.id);
  }

  const { error } = await supabase
    .from("project_contractors")
    .delete()
    .match({ project_id: projectId, profile_id: profileId });

  if (error) return { error: error.message };
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}


export async function assignOwner(projectId: string, profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_owners")
    .insert({ project_id: projectId, profile_id: profileId });

  if (error) return { error: error.message };
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function removeOwner(projectId: string, profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_owners")
    .delete()
    .match({ project_id: projectId, profile_id: profileId });

  if (error) return { error: error.message };
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

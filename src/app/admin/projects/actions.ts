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

export async function assignEmployee(projectId: string, profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_employees")
    .insert({ project_id: projectId, profile_id: profileId });

  if (error) return { error: error.message };
  revalidatePath(`/admin/projects/${projectId}`);
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

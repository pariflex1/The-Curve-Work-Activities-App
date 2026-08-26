"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createActivityMaster(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const defaultUnit = formData.get("default_unit") as string;
  const sortOrder = parseInt((formData.get("sort_order") as string) || "0", 10);
  const isActive = formData.get("is_active") === "true";

  const { data, error } = await supabase
    .from("activity_master")
    .insert({
      name,
      code: code ? code.toUpperCase() : null,
      category,
      description,
      default_unit: defaultUnit,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/activity-master");
  return { data };
}

export async function updateActivityMaster(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const defaultUnit = formData.get("default_unit") as string;
  const sortOrder = parseInt((formData.get("sort_order") as string) || "0", 10);
  const isActive = formData.get("is_active") === "true";

  const { error } = await supabase
    .from("activity_master")
    .update({
      name,
      code: code ? code.toUpperCase() : null,
      category,
      description,
      default_unit: defaultUnit,
      sort_order: sortOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/activity-master");
  return { success: true };
}

export async function deleteActivityMaster(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("activity_master").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/activity-master");
  return { success: true };
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false };
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
  if (!profile || profile.role !== "admin") return { authorized: false };
  return { authorized: true, supabase };
}

export async function createOrganization(formData: FormData) {
  const check = await verifyAdmin();
  if (!check.authorized) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim() || null;

  if (!name) return { error: "Organization Name is required." };

  const { data, error } = await check.supabase
    .from("organizations")
    .insert({ name, code })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/organizations");
  return { success: true, data };
}

export async function createDepartment(orgId: string, name: string) {
  const check = await verifyAdmin();
  if (!check.authorized) return { error: "Unauthorized" };

  const deptName = name?.trim();
  if (!deptName) return { error: "Department name is required." };

  const { data, error } = await check.supabase
    .from("departments")
    .insert({ organization_id: orgId, name: deptName })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/organizations");
  return { success: true, data };
}

export async function createDesignation(orgId: string, deptId: string | null, title: string) {
  const check = await verifyAdmin();
  if (!check.authorized) return { error: "Unauthorized" };

  const desigTitle = title?.trim();
  if (!desigTitle) return { error: "Designation title is required." };

  const { data, error } = await check.supabase
    .from("designations")
    .insert({
      organization_id: orgId,
      department_id: deptId || null,
      title: desigTitle,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/organizations");
  return { success: true, data };
}

export async function deleteDepartment(deptId: string) {
  const check = await verifyAdmin();
  if (!check.authorized) return { error: "Unauthorized" };

  const { error } = await check.supabase.from("departments").delete().eq("id", deptId);
  if (error) return { error: error.message };

  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function deleteDesignation(desigId: string) {
  const check = await verifyAdmin();
  if (!check.authorized) return { error: "Unauthorized" };

  const { error } = await check.supabase.from("designations").delete().eq("id", desigId);
  if (error) return { error: error.message };

  revalidatePath("/admin/organizations");
  return { success: true };
}

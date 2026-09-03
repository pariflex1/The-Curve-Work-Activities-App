"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getMyOrganizations() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { organizations: [], activeOrgId: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, active_organization_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { organizations: [], activeOrgId: null };

  const { data: userOrgs } = await supabase
    .from("user_organizations")
    .select(`
      organization_id,
      role,
      organizations (
        id,
        name,
        code,
        status
      )
    `)
    .eq("profile_id", profile.id);

  const orgs = (userOrgs || []).map((uo: any) => ({
    id: uo.organizations.id,
    name: uo.organizations.name,
    code: uo.organizations.code,
    role: uo.role,
  }));

  const cookieStore = await cookies();
  const cookieActiveOrg = cookieStore.get("the_curve_active_org")?.value;

  const activeOrgId =
    cookieActiveOrg || profile.active_organization_id || (orgs[0] ? orgs[0].id : null);

  return { organizations: orgs, activeOrgId };
}

export async function switchActiveOrganization(organizationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  // Verify membership
  const { data: membership } = await supabase
    .from("user_organizations")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!membership) {
    return { error: "Access denied to this organization" };
  }

  // Update profile active_organization_id
  await supabase
    .from("profiles")
    .update({ active_organization_id: organizationId })
    .eq("id", profile.id);

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("the_curve_active_org", organizationId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  return { success: true };
}

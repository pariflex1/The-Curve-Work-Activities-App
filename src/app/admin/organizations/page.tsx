import { createClient } from "@/utils/supabase/server";
import OrgManager from "./OrgManager";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const supabase = await createClient();

  // Fetch organizations
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, code")
    .order("name");

  const orgList = orgs || [];

  // Fetch departments & designations for each org
  const orgsWithDetails = await Promise.all(
    orgList.map(async (org) => {
      const [{ data: depts }, { data: desigs }] = await Promise.all([
        supabase.from("departments").select("id, name").eq("organization_id", org.id).order("name"),
        supabase.from("designations").select("id, title, department_id").eq("organization_id", org.id).order("title"),
      ]);

      return {
        ...org,
        departments: depts || [],
        designations: desigs || [],
      };
    })
  );

  return <OrgManager initialOrganizations={orgsWithDetails} />;
}

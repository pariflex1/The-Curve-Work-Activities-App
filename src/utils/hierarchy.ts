import { SupabaseClient } from "@supabase/supabase-js";

export type AccessLevel = "full_project" | "block_level" | "unit_level";

export interface EmployeeHierarchy {
  access_level: AccessLevel;
  block_ids: string[];
  unit_ids: string[];
}

/**
 * Fetch hierarchy permissions for an employee on a specific project.
 * Defaults to 'full_project' (view and manage all blocks and units) if not specifically restricted.
 */
export async function getEmployeeHierarchy(
  supabase: SupabaseClient,
  projectId: string,
  profileId: string
): Promise<EmployeeHierarchy> {
  try {
    // 1. Get the project_employees entry
    const { data: pe } = await supabase
      .from("project_employees")
      .select("id")
      .eq("project_id", projectId)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (!pe) {
      return { access_level: "full_project", block_ids: [], unit_ids: [] };
    }

    // 2. Fetch the latest SET_HIERARCHY log for this assignment
    const { data: log } = await supabase
      .from("audit_logs")
      .select("meta_json")
      .eq("action", "SET_HIERARCHY")
      .eq("entity_id", pe.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (log?.meta_json) {
      const meta = log.meta_json as any;
      return {
        access_level: (meta.access_level as AccessLevel) || "full_project",
        block_ids: Array.isArray(meta.block_ids) ? meta.block_ids : [],
        unit_ids: Array.isArray(meta.unit_ids) ? meta.unit_ids : [],
      };
    }
  } catch (err) {
    console.error("Error fetching employee hierarchy:", err);
  }

  // Default: Full Project access
  return { access_level: "full_project", block_ids: [], unit_ids: [] };
}

/**
 * Fetch hierarchy permissions for all employees assigned to a project.
 */
export async function getAllProjectEmployeesHierarchy(
  supabase: SupabaseClient,
  projectId: string
): Promise<Record<string, EmployeeHierarchy>> {
  const result: Record<string, EmployeeHierarchy> = {};

  try {
    // 1. Fetch all project_employees
    const { data: employees } = await supabase
      .from("project_employees")
      .select("id, profile_id")
      .eq("project_id", projectId);

    if (!employees || employees.length === 0) return result;

    const peIds = employees.map((e) => e.id);
    const peMap = new Map(employees.map((e) => [e.id, e.profile_id]));

    // 2. Fetch hierarchy logs for all these employees
    const { data: logs } = await supabase
      .from("audit_logs")
      .select("entity_id, meta_json, created_at")
      .eq("action", "SET_HIERARCHY")
      .in("entity_id", peIds)
      .order("created_at", { ascending: false });

    // Index latest log per entity_id
    const latestLogsByEntity = new Map<string, any>();
    if (logs) {
      for (const l of logs) {
        if (!latestLogsByEntity.has(l.entity_id)) {
          latestLogsByEntity.set(l.entity_id, l.meta_json);
        }
      }
    }

    // Populate map for each employee
    for (const pe of employees) {
      const meta = latestLogsByEntity.get(pe.id);
      if (meta) {
        result[pe.profile_id] = {
          access_level: (meta.access_level as AccessLevel) || "full_project",
          block_ids: Array.isArray(meta.block_ids) ? meta.block_ids : [],
          unit_ids: Array.isArray(meta.unit_ids) ? meta.unit_ids : [],
        };
      } else {
        result[pe.profile_id] = {
          access_level: "full_project",
          block_ids: [],
          unit_ids: [],
        };
      }
    }
  } catch (err) {
    console.error("Error fetching all employees hierarchy:", err);
  }

  return result;
}

/**
 * Filter project blocks and units according to an employee's hierarchy permission.
 */
export function filterAccessibleBlocksAndUnits(
  blocks: any[],
  hierarchy: EmployeeHierarchy
) {
  if (!blocks) return [];

  // 1. Full Project: Show all blocks & units
  if (hierarchy.access_level === "full_project") {
    return blocks;
  }

  // 2. Block Level: Show only assigned blocks (and all their units)
  if (hierarchy.access_level === "block_level") {
    const allowedBlockIds = new Set(hierarchy.block_ids);
    return blocks.filter((b) => allowedBlockIds.has(b.id));
  }

  // 3. Unit Level: Filter units inside blocks, and only retain blocks with matching units
  if (hierarchy.access_level === "unit_level") {
    const allowedUnitIds = new Set(hierarchy.unit_ids);
    return blocks
      .map((block) => ({
        ...block,
        units: (block.units || []).filter((u: any) => allowedUnitIds.has(u.id)),
      }))
      .filter((block) => block.units && block.units.length > 0);
  }

  return blocks;
}

/**
 * Check if an employee is authorized to access a particular unit.
 */
export function canAccessUnit(
  unitId: string,
  blockId: string,
  hierarchy: EmployeeHierarchy
): boolean {
  if (hierarchy.access_level === "full_project") {
    return true;
  }
  if (hierarchy.access_level === "block_level") {
    return hierarchy.block_ids.includes(blockId);
  }
  if (hierarchy.access_level === "unit_level") {
    return hierarchy.unit_ids.includes(unitId);
  }
  return false;
}

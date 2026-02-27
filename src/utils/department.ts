export type DepartmentGroup = {
  type: string; // 대분류
  names: string[]; // 소분류
};

export function parseDepartmentGroups(departments: unknown): DepartmentGroup[] {
  if (!Array.isArray(departments)) return [];

  return departments
    .filter((row) => Array.isArray(row) && row.length >= 1)
    .map((row) => {
      const arr = row as unknown[];
      const type = String(arr[0] ?? "").trim();
      const names = arr
        .slice(1)
        .map((v) => String(v ?? "").trim())
        .filter(Boolean);

      return { type, names };
    })
    .filter((g) => g.type.length > 0);
}

const KEY = "common_metadata_departments_v1";

export function loadDeptGroupsCache(): DepartmentGroup[] | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as DepartmentGroup[]) : null;
  } catch {
    return null;
  }
}

export function saveDeptGroupsCache(groups: DepartmentGroup[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(groups));
  } catch {}
}

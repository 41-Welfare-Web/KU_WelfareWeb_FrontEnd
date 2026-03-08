export interface DepartmentCategory {
  category: string;
  requiresInput: boolean;
  options?: string[];
  placeholder?: string;
}

export type DepartmentGroup = {
  type: string; // 대분류 (category)
  names: string[]; // 소분류 (options)
  requiresInput: boolean; // 직접 입력 필요 여부
  placeholder?: string; // 직접 입력 시 placeholder
};

export function parseDepartmentGroups(departments: unknown): DepartmentGroup[] {
  if (!Array.isArray(departments)) return [];

  return departments
    .filter((item) => item && typeof item === 'object')
    .map((item: any) => {
      const category = String(item.category ?? "").trim();
      const requiresInput = Boolean(item.requiresInput);
      const options = Array.isArray(item.options) 
        ? item.options.map((v: any) => String(v ?? "").trim()).filter(Boolean)
        : [];
      const placeholder = item.placeholder ? String(item.placeholder).trim() : undefined;

      return {
        type: category,
        names: options,
        requiresInput,
        placeholder,
      };
    })
    .filter((g) => g.type.length > 0);
}



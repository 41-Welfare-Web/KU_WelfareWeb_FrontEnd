import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCommonMetadata } from "../api/signup/signupApi";
import {
  loadDeptGroupsCache,
  parseDepartmentGroups,
  saveDeptGroupsCache,
  type DepartmentGroup,
} from "../utils/department";

type MetadataState = {
  deptGroups: DepartmentGroup[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const MetadataContext = createContext<MetadataState | null>(null);

export function MetadataProvider({ children }: { children: React.ReactNode }) {
  const [deptGroups, setDeptGroups] = useState<DepartmentGroup[]>(() => {
    return loadDeptGroupsCache() ?? [];
  });
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const meta = await getCommonMetadata();
      const groups = parseDepartmentGroups(meta.departments);
      setDeptGroups(groups);
      saveDeptGroupsCache(groups);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deptGroups.length === 0) void refresh();
  }, []);

  const value = useMemo(
    () => ({ deptGroups, loading, refresh }),
    [deptGroups, loading],
  );

  return (
    <MetadataContext.Provider value={value}>
      {children}
    </MetadataContext.Provider>
  );
}

export function useMetadata() {
  const v = useContext(MetadataContext);
  if (!v) throw new Error("useMetadata must be used within MetadataProvider");
  return v;
}

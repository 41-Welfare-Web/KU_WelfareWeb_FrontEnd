import { useEffect, useMemo, useRef, useState } from "react";
import filterIcon from "../../assets/rental/filter.svg";
import type { SortBy, SortOrder } from "../../api/rental/types";

type Props = {
  sortBy: SortBy | null;
  sortOrder: SortOrder;
  onChange: (next: { sortBy: SortBy; sortOrder: SortOrder }) => void;
};

const LABEL: Record<SortBy, string> = {
  popularity: "인기순",
  name: "이름순",
  createdAt: "최신순",
};

export default function SortDropdown({ sortBy, sortOrder, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const displayText = useMemo(() => {
    if (!sortBy) return "정렬";
    return LABEL[sortBy];
  }, [sortBy]);

  const pick = (nextBy: SortBy) => {
    if (nextBy === sortBy) {
      onChange({
        sortBy: nextBy,
        sortOrder: sortOrder === "asc" ? "desc" : "asc",
      });
      return;
    }

    onChange({
      sortBy: nextBy,
      sortOrder: "desc",
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-[44px] flex items-center gap-2 px-4 rounded-[10px] bg-white whitespace-nowrap"
      >
        <img src={filterIcon} alt="정렬" />
        <span className="text-black">{displayText}</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-[100px] rounded-2xl border border-black/10 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] overflow-hidden z-50">
          {(["popularity", "name", "createdAt"] as SortBy[]).map((key) => {
            const active = key === sortBy;
            const arrow =
              active && sortOrder === "asc"
                ? "▲"
                : active && sortOrder === "desc"
                  ? "▼"
                  : "";

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  pick(key);
                  setOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-[14px] flex items-center justify-between hover:bg-black/5
                  ${active ? "font-semibold text-[#FE6949]" : "text-black"}`}
              >
                <span>{LABEL[key]}</span>
                <span className="text-[12px]">{arrow}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

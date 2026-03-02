import { useEffect, useMemo, useState } from "react";
import { useMetadata } from "../contexts/MetadataContext";
import cancel from "../assets/rental/cancel-white.svg";

type Props = {
  open: boolean;
  onClose: () => void;

  // 현재 값(표시용)
  value?: { departmentType: string; departmentName: string };

  // 확정 시
  onConfirm: (next: { departmentType: string; departmentName: string }) => void;

  title?: string; // 기본: "소속 선택"
};

export default function DepartmentPickerModal({
  open,
  onClose,
  value,
  onConfirm,
  title = "소속 선택",
}: Props) {
  const { deptGroups, loading } = useMetadata();

  // 왼쪽(대분류)에서 "호버/클릭"된 항목
  const [activeType, setActiveType] = useState<string>("");

  // 오른쪽 직접입력(소분류 없을 때)
  const [customName, setCustomName] = useState("");

  // 모달 열릴 때 초기 activeType 잡기
  useEffect(() => {
    if (!open) return;

    const initial =
      value?.departmentType ||
      (deptGroups[0] as any)?.type ||
      (deptGroups[0] as any)?.name ||
      "";

    setActiveType(initial);
    setCustomName(value?.departmentName ?? "");
  }, [open, value?.departmentType, value?.departmentName, deptGroups]);

  const groups = useMemo(() => {
    // DepartmentGroup 형태가 { type, names } 또는 { name, items } 등일 수 있어서 안전처리
    return deptGroups
      .map((g: any) => ({
        type: String(g.type ?? g.name ?? "").trim(),
        names: Array.isArray(g.names)
          ? (g.names as string[])
          : Array.isArray(g.items)
            ? (g.items as string[])
            : [],
      }))
      .filter((g) => g.type);
  }, [deptGroups]);

  const activeGroup = useMemo(() => {
    return groups.find((g) => g.type === activeType) ?? null;
  }, [groups, activeType]);

  const hasSubNames = (activeGroup?.names?.length ?? 0) > 0;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[min(820px,96vw)] max-h-[86dvh] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#001A37] px-6 py-4">
          <div className="text-[clamp(18px,2.2vw,24px)] font-bold text-white">
            {title}
          </div>
          <button type="button" onClick={onClose} className="p-2">
            <img src={cancel} alt="닫기" className="h-7 w-7" />
          </button>
        </div>

        {/* Body */}
        <div className="flex max-h-[calc(86dvh-64px)] min-h-[360px]">
          {/* Left: 대분류 */}
          <div className="w-[44%] border-r border-black/10 p-4 overflow-y-auto">
            {loading && (
              <div className="text-sm text-black/50">불러오는 중…</div>
            )}

            {!loading && groups.length === 0 && (
              <div className="text-sm text-red-600">
                소속 목록을 불러오지 못했어요.
              </div>
            )}

            <div className="space-y-1">
              {groups.map((g) => {
                const active = g.type === activeType;
                return (
                  <button
                    key={g.type}
                    type="button"
                    onMouseEnter={() => setActiveType(g.type)}
                    onClick={() => setActiveType(g.type)}
                    className={[
                      "w-full text-left rounded-xl px-4 py-3 transition",
                      active
                        ? "bg-[#FF7A57] text-white font-semibold"
                        : "bg-black/5 text-black hover:bg-black/10",
                    ].join(" ")}
                  >
                    {g.type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: 소분류 */}
          <div className="w-[56%] p-4 overflow-y-auto">
            <div className="mb-2 text-sm font-semibold text-black/70">
              {activeType ? `${activeType} 상세` : "상세"}
            </div>

            {/* 소분류가 있으면 리스트 */}
            {hasSubNames ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeGroup!.names.map((nm) => (
                  <button
                    key={nm}
                    type="button"
                    className="rounded-xl bg-black/5 px-4 py-3 text-left text-[15px] hover:bg-black/10"
                    onClick={() => {
                      onConfirm({
                        departmentType: activeType,
                        departmentName: nm,
                      });
                      onClose();
                    }}
                  >
                    {nm}
                  </button>
                ))}

                {/* "직접 입력" 옵션도 같이 두고 싶으면 아래 주석 해제 */}
                {/* <button
                  type="button"
                  className="rounded-xl border border-black/15 bg-white px-4 py-3 text-left text-[15px] hover:bg-black/5"
                  onClick={() => setCustomName("")}
                >
                  직접 입력하기
                </button> */}
              </div>
            ) : (
              <>
                <div className="text-sm text-black/50 mb-3">
                  이 대분류는 소분류 목록이 없어서 직접 입력해야 해요.
                </div>

                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="소속명을 입력하세요"
                  className="w-full h-12 rounded-xl bg-[#EFEFEF] px-4 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                />

                <button
                  type="button"
                  className="mt-3 w-full h-12 rounded-xl bg-[#FD7D5D] text-white text-[16px] font-bold disabled:opacity-50"
                  disabled={!customName.trim() || !activeType}
                  onClick={() => {
                    onConfirm({
                      departmentType: activeType,
                      departmentName: customName.trim(),
                    });
                    onClose();
                  }}
                >
                  선택 확정
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

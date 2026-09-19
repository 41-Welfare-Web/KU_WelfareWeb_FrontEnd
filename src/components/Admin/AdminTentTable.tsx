import { useEffect, useRef, useState } from "react";
import type { Tent } from "../../api/tent/types";
import AdminTableHeader from "./AdminTableHeader";
import {
  getCurrentUnit,
  getLastUnit,
  getTentBlockReason,
} from "../../utils/tentUtils";

interface TentNoteCellProps {
  note: string;
  onSave: (note: string) => void;
}

/** 클릭 없이 바로 입력 가능한 비고 칸. Enter 또는 포커스 해제 시 저장 */
function TentNoteCell({ note, onSave }: TentNoteCellProps) {
  const [value, setValue] = useState(note);
  const [prevNote, setPrevNote] = useState(note);
  const [saved, setSaved] = useState(false);
  const [focused, setFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 외부에서 값이 바뀌면 (재조회 등) 입력값도 맞춰줌
  if (note !== prevNote) {
    setPrevNote(note);
    setValue(note);
  }

  // 언마운트 시 저장 표시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const commit = () => {
    setFocused(false);
    if (value === note) return;
    onSave(value);
    setSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(false), 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setValue(note);
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      placeholder="비고 입력"
      title={value || undefined}
      className={`w-full h-[32px] px-2 rounded-[6px] border bg-white font-['Gmarket_Sans'] font-light text-[13px] text-[#410f07] placeholder:text-[#C3C3C3] outline-none transition-colors ${
        saved
          ? "border-[#1F7A34]"
          : focused
            ? "border-[#fe6949]"
            : "border-transparent hover:border-[#D9D9D9]"
      }`}
    />
  );
}

/** "천막 7" -> 7 (번호가 없으면 0) */
const tentNo = (tentNumber: string) => {
  const m = tentNumber.match(/(\d+)\s*$/);
  return m ? Number(m[1]) : 0;
};

interface AdminTentTableProps {
  tents: Tent[];
  /** 파손 여부 변경 (관리자 직접 설정) */
  onDamagedChange: (tentId: number, damaged: boolean) => void;
  /** 비고 변경 (관리자 직접 수정) */
  onNoteChange: (tentId: number, note: string) => void;
  /** 천막 등록 (천막 번호 목록) */
  onCreateTents: (tentNumbers: string[]) => Promise<void>;
  /** 물품 목록 관리에 등록된 천막 총 수량 (처음 일괄 등록 시 기본 개수) */
  itemTotalQuantity?: number;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export default function AdminTentTable({
  tents,
  onDamagedChange,
  onNoteChange,
  onCreateTents,
  itemTotalQuantity = 0,
  loading = false,
  error = null,
  className = "",
}: AdminTentTableProps) {
  const [creating, setCreating] = useState(false);

  const create = async (tentNumbers: string[], confirmMessage: string) => {
    if (creating || !window.confirm(confirmMessage)) return;
    setCreating(true);
    try {
      await onCreateTents(tentNumbers);
    } finally {
      setCreating(false);
    }
  };

  // 다음 번호로 한 동 추가
  const handleAddOne = () => {
    const next = tents.reduce((max, t) => Math.max(max, tentNo(t.tentNumber)), 0) + 1;
    const tentNumber = `천막 ${next}`;
    create([tentNumber], `'${tentNumber}'을(를) 새로 등록할까요?`);
  };

  // 처음: 물품 총 수량만큼 천막 1 ~ N 일괄 등록
  const handleAddInitial = () => {
    const numbers = Array.from({ length: itemTotalQuantity }, (_, i) => `천막 ${i + 1}`);
    create(
      numbers,
      `천막 1 ~ 천막 ${itemTotalQuantity}, 총 ${itemTotalQuantity}동을 등록할까요?`,
    );
  };

  const showEmpty = !loading && !error && tents.length === 0;

  return (
    <div className={className}>
      {!loading && !error && tents.length > 0 && (
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="font-['Gmarket_Sans'] text-[13px] text-[#8E8E8E]">
            총 {tents.length}동
            {itemTotalQuantity > 0 && tents.length !== itemTotalQuantity && (
              <span className="ml-2 text-[#d72002]">
                (물품 목록의 천막 수량 {itemTotalQuantity}개와 다릅니다)
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={handleAddOne}
            disabled={creating}
            className="shrink-0 whitespace-nowrap h-[32px] px-3 rounded-[8px] border border-[#a4a4a4] bg-white font-['Gmarket_Sans'] font-medium text-[13px] text-[#410f07] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? "등록 중..." : "+ 천막 추가"}
          </button>
        </div>
      )}

      <div className="bg-white border border-[#D9D9D9] rounded-[10px] overflow-visible md:min-w-[680px]">
        <AdminTableHeader
          columns={[
            { label: "천막 번호", width: "w-[13%] min-w-0" },
            { label: "현재 대여 단위", width: "flex-1 min-w-0" },
            { label: "최근 대여 단위", width: "flex-1 min-w-0" },
            { label: "파손 여부", width: "w-[11%] min-w-0" },
            { label: "대여 가능 여부", width: "w-[13%] min-w-0" },
            { label: "비고", width: "w-[24%] min-w-0" },
          ]}
        />

        {loading && (
          <div className="h-[200px] flex items-center justify-center">
            <span className="text-gray-500">로딩 중...</span>
          </div>
        )}

        {!loading && error && (
          <div className="h-[200px] flex items-center justify-center">
            <span className="text-red-500">{error}</span>
          </div>
        )}

        {showEmpty && (
          <div className="h-[220px] flex flex-col items-center justify-center gap-3">
            <span className="text-gray-500">등록된 천막이 없습니다.</span>
            <button
              type="button"
              onClick={itemTotalQuantity > 0 ? handleAddInitial : handleAddOne}
              disabled={creating}
              className="h-[38px] px-4 rounded-[8px] bg-[#f72] text-white font-['Gmarket_Sans'] font-bold text-[14px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] hover:bg-[#e65a3d] disabled:bg-[#ccc] disabled:cursor-not-allowed transition-colors"
            >
              {creating
                ? "등록 중..."
                : itemTotalQuantity > 0
                  ? `천막 ${itemTotalQuantity}동 등록 (천막 1 ~ ${itemTotalQuantity})`
                  : "천막 1 등록"}
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          tents.map((tent) => {
            const currentUnit = getCurrentUnit(tent);
            const lastUnit = getLastUnit(tent);
            // 파손이거나 지금 나가 있으면(대여중/연체) 불가 — 천막 지정 팝업과 같은 기준
            const blockReason = getTentBlockReason(tent);
            const available = blockReason === null;

            return (
              <div
                key={tent.id}
                className="flex items-center border-b border-[#EDEDED] last:border-b-0 h-[56px] px-4 gap-2 hover:bg-[#FFFBF9] transition-colors"
              >
                <div className="w-[13%] min-w-0 flex items-center justify-center font-['Noto_Sans'] font-semibold text-[14px] text-[#410f07]">
                  {tent.tentNumber}
                </div>

                <div
                  className="flex-1 min-w-0 flex items-center justify-center font-['Gmarket_Sans'] text-[14px] text-[#410f07]"
                  title={currentUnit !== "-" ? currentUnit : undefined}
                >
                  <span className="truncate">{currentUnit}</span>
                </div>

                <div
                  className="flex-1 min-w-0 flex items-center justify-center font-['Gmarket_Sans'] text-[14px] text-[#8E8E8E]"
                  title={lastUnit !== "-" ? lastUnit : undefined}
                >
                  <span className="truncate">{lastUnit}</span>
                </div>

                <div className="w-[11%] min-w-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onDamagedChange(tent.id, !tent.damaged)}
                    aria-label={`${tent.tentNumber} 파손 여부`}
                    aria-pressed={tent.damaged}
                    title="클릭하면 정상/파손이 전환됩니다"
                    className={`rounded-[10px] px-2.5 h-[24px] flex items-center font-['Gmarket_Sans'] font-medium text-[12px] cursor-pointer transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#fe6949] ${
                      tent.damaged
                        ? "bg-[#FBE3DF] text-[#d72002]"
                        : "bg-[#E7F5EA] text-[#1F7A34]"
                    }`}
                  >
                    {tent.damaged ? "파손" : "정상"}
                  </button>
                </div>

                <div className="w-[13%] min-w-0 flex items-center justify-center">
                  <span
                    title={
                      blockReason ?? undefined
                    }
                    className={`rounded-[10px] px-2.5 h-[24px] flex items-center font-['Gmarket_Sans'] font-medium text-[12px] ${
                      available
                        ? "bg-[#E7F5EA] text-[#1F7A34]"
                        : "bg-[#FBE3DF] text-[#d72002]"
                    }`}
                  >
                    {available ? "가능" : "불가"}
                  </span>
                </div>

                <div className="w-[24%] min-w-0 flex items-center">
                  <TentNoteCell
                    note={tent.note}
                    onSave={(next) => onNoteChange(tent.id, next)}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

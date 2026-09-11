import { useEffect, useMemo, useState } from "react";
import type { Tent } from "../../api/tent/types";
import { getTents } from "../../api/tent/tentApi";
import { getTentBlockReason, toLocalDateKey } from "../../utils/tentUtils";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

export interface TentAssignTarget {
  rentalCode: string;
  userName: string;
  department: string;
  /** 대여 시작일 (ISO 문자열 가능) */
  startDate: string;
  /** 반납 예정일 (ISO 문자열 가능) */
  endDate: string;
  /** 신청 수량 = 내보낼 천막 수 */
  quantity: number;
}

/**
 * 열릴 때마다 새로 마운트해서 쓰는 팝업입니다 (부모에서 조건부 렌더 + key).
 * 그래서 선택 상태 초기화 로직이 따로 없습니다.
 */
interface TentAssignModalProps {
  target: TentAssignTarget;
  /** 취소 (상태 변경 없음) */
  onCancel: () => void;
  /** 선택한 천막으로 대여 처리. 실패 시 throw 하면 팝업이 열린 채로 에러를 보여줍니다 */
  onConfirm: (tents: Pick<Tent, "id" | "tentNumber">[]) => Promise<void>;
}

export default function TentAssignModal({
  target,
  onCancel,
  onConfirm,
}: TentAssignModalProps) {
  useLockBodyScroll(true);

  const [tents, setTents] = useState<Tent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  // 실제로 내보낼 천막 수. 기본은 신청 수량이고, 모자라면 관리자가 −로 줄임
  const [count, setCount] = useState(target.quantity);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 최신 천막 현황 조회
  useEffect(() => {
    let cancelled = false;
    getTents()
      .then((data) => {
        if (!cancelled) setTents(data);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(
            err instanceof Error && !("response" in err)
              ? err.message
              : "천막 목록을 불러오지 못했습니다.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startKey = toLocalDateKey(target.startDate);
  const endKey = toLocalDateKey(target.endDate);
  const required = target.quantity;

  const rows = useMemo(
    () =>
      tents.map((tent) => ({
        tent,
        blockReason: getTentBlockReason(tent),
      })),
    [tents],
  );

  const availableCount = rows.filter((r) => !r.blockReason).length;
  const isFull = selected.size >= count;
  const canSubmit = selected.size === count && !submitting && !loading;

  // Esc로 닫기 (처리 중에는 막음)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [submitting, onCancel]);

  const toggle = (tentId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tentId)) next.delete(tentId);
      else if (next.size < count) next.add(tentId);
      return next;
    });
  };

  const changeCount = (delta: number) => {
    const next = Math.min(required, Math.max(1, count + delta));
    if (next === count) return;
    setCount(next);
    setSelected((prev) => {
      if (prev.size <= next) return prev;
      return new Set(Array.from(prev).slice(0, next));
    });
  };

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      // 화면에 보이는 순서대로 전달
      const ordered = rows
        .filter((r) => selected.has(r.tent.id))
        .map(({ tent }) => ({ id: tent.id, tentNumber: tent.tentNumber }));
      await onConfirm(ordered);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err instanceof Error ? err.message : "대여 처리에 실패했습니다.");
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tent-assign-title"
    >
      <div className="bg-white rounded-[21px] w-full max-w-[540px] max-h-[90vh] flex flex-col shadow-lg">
        {/* 헤더 */}
        <div className="bg-[#001a37] rounded-t-[21px] h-[62px] flex items-center justify-between px-[31px] shrink-0">
          <h2
            id="tent-assign-title"
            className="text-[21px] font-['Gmarket_Sans'] font-medium text-white"
          >
            대여 천막 지정
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            aria-label="닫기"
            className="text-white text-[22px] leading-none hover:opacity-70 disabled:opacity-40"
          >
            ×
          </button>
        </div>

        <div className="px-[31px] py-5 overflow-y-auto">
          {/* 대여 정보 */}
          <div className="bg-[#f4f4f4] rounded-[10px] px-5 py-4 mb-4 grid grid-cols-[72px_1fr] gap-y-1.5 text-[14px] font-['Gmarket_Sans']">
            <span className="text-[#8E8E8E]">신청번호</span>
            <span className="text-[#410f07] font-medium">{target.rentalCode}</span>
            <span className="text-[#8E8E8E]">대여 단위</span>
            <span className="text-[#410f07] font-medium">
              {target.department} · {target.userName}
            </span>
            <span className="text-[#8E8E8E]">대여 기간</span>
            <span className="text-[#410f07] font-medium">
              {startKey} ~ {endKey}
            </span>
          </div>

          {/* 내보낼 수량 + 선택 현황 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <span className="font-['Gmarket_Sans'] text-[14px] text-[#410f07]">
                내보낼 천막
              </span>
              <div className="inline-flex items-center border border-[#a4a4a4] rounded-[8px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => changeCount(-1)}
                  disabled={count <= 1 || submitting}
                  aria-label="내보낼 천막 수 줄이기"
                  className="w-[32px] h-[30px] flex items-center justify-center text-[18px] leading-none text-[#410f07] hover:bg-gray-50 disabled:text-[#C3C3C3] disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span
                  className="min-w-[48px] h-[30px] flex items-center justify-center border-x border-[#a4a4a4] font-['Gmarket_Sans'] font-bold text-[14px] text-[#410f07]"
                  aria-live="polite"
                >
                  {count}동
                </span>
                <button
                  type="button"
                  onClick={() => changeCount(1)}
                  disabled={count >= required || submitting}
                  aria-label="내보낼 천막 수 늘리기"
                  className="w-[32px] h-[30px] flex items-center justify-center text-[18px] leading-none text-[#410f07] hover:bg-gray-50 disabled:text-[#C3C3C3] disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <span
              className={`font-['Gmarket_Sans'] font-medium text-[14px] ${
                selected.size === count ? "text-[#1F7A34]" : "text-[#f72]"
              }`}
            >
              {selected.size} / {count} 선택
            </span>
          </div>

          {!loading && !error && tents.length === 0 && (
            <div className="mb-3 p-2.5 bg-[#FFF4E5] border border-[#FFB547] rounded-[8px] text-[#8A5300] text-[12px] font-['Gmarket_Sans']">
              등록된 천막이 없습니다. 천막 관리 탭에서 천막을 먼저 등록해주세요.
            </div>
          )}

          {!loading && tents.length > 0 && availableCount < count && (
            <div className="mb-3 p-2.5 bg-[#FFF4E5] border border-[#FFB547] rounded-[8px] text-[#8A5300] text-[12px] font-['Gmarket_Sans']">
              {availableCount === 0
                ? "이 기간에 내보낼 수 있는 천막이 없습니다. 파손 여부나 다른 대여 일정을 확인해주세요."
                : `이 기간에 내보낼 수 있는 천막이 ${availableCount}동뿐입니다. − 버튼으로 ${availableCount}동까지 줄여서 내보낼 수 있습니다.`}
            </div>
          )}

          {count < required && (
            <div className="mb-3 p-2.5 bg-[#F4F4F4] rounded-[8px] text-[#5c5c5c] text-[12px] font-['Gmarket_Sans']">
              신청 {required}동 중 <b>{count}동</b>만 내보냅니다. 확정하면 대여
              기록의 천막 수량도 <b>{count}동</b>으로 바뀝니다.
            </div>
          )}

          {/* 천막 목록 */}
          {loading ? (
            <div className="h-[160px] flex items-center justify-center text-gray-500 text-[14px]">
              천막 현황을 불러오는 중...
            </div>
          ) : (
            <ul className="border border-[#D9D9D9] rounded-[10px] divide-y divide-[#EDEDED] overflow-hidden">
              {rows.map(({ tent, blockReason }) => {
                const checked = selected.has(tent.id);
                const disabled =
                  Boolean(blockReason) || (!checked && isFull) || submitting;

                return (
                  <li key={tent.id}>
                    <label
                      className={`flex items-center gap-3 px-4 h-[48px] transition-colors ${
                        blockReason
                          ? "bg-[#FAFAFA] cursor-not-allowed"
                          : disabled
                            ? "cursor-not-allowed opacity-50"
                            : checked
                              ? "bg-[#fff5f2] cursor-pointer"
                              : "cursor-pointer hover:bg-[#FFFBF9]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggle(tent.id)}
                        className="w-4 h-4 accent-[#f72] cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span
                        className={`font-['Noto_Sans'] font-semibold text-[14px] ${
                          blockReason ? "text-[#B5B5B5]" : "text-[#410f07]"
                        }`}
                      >
                        {tent.tentNumber}
                      </span>
                      {tent.note && (
                        <span
                          className="font-['Gmarket_Sans'] font-light text-[12px] text-[#8E8E8E] truncate"
                          title={tent.note}
                        >
                          {tent.note}
                        </span>
                      )}
                      <span className="ml-auto shrink-0">
                        {blockReason ? (
                          <span className="rounded-[10px] px-2.5 h-[24px] inline-flex items-center font-['Gmarket_Sans'] font-medium text-[12px] bg-[#FBE3DF] text-[#d72002]">
                            {blockReason}
                          </span>
                        ) : (
                          <span className="rounded-[10px] px-2.5 h-[24px] inline-flex items-center font-['Gmarket_Sans'] font-medium text-[12px] bg-[#E7F5EA] text-[#1F7A34]">
                            가능
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {error && (
            <div className="mt-3 p-2 bg-red-100 border border-red-400 rounded-[8px] text-red-700 text-[12px]">
              {error}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 px-[31px] pb-6 pt-1 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 h-[38px] bg-[#f2f2f2] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-[14px] font-['Gmarket_Sans'] font-bold text-black hover:bg-[#e5e5e5] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="flex-1 h-[38px] bg-[#f72] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-[14px] font-['Gmarket_Sans'] font-bold text-white hover:bg-[#e65a3d] disabled:bg-[#ccc] disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "처리 중..." : `${count}동 대여 처리`}
          </button>
        </div>
      </div>
    </div>
  );
}

import type { Tent, TentRental } from "../api/tent/types";

/**
 * 대여 품목 중 '천막'인지 판별.
 * 부분 일치로 하면 '천막용 LED등' 같은 부속 물품까지 걸리므로 이름이 정확히 일치할 때만 천막으로 봅니다.
 */
export const isTentItem = (itemName?: string | null) =>
  (itemName ?? "").trim() === "천막";

/** ISO 문자열 등 임의의 날짜 문자열 -> 로컬 기준 "YYYY-MM-DD" */
export const toLocalDateKey = (value: string) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/* ------------------------------------------------------------------ */
/* 현재/최근 대여 단위, 내보낼 수 있는지                                 */
/* ------------------------------------------------------------------ */

/** 지금 나가 있는 대여 (천막 품목이 대여중 또는 연체) */
const isOut = (r: TentRental) => r.status === "RENTED" || r.status === "OVERDUE";

/** 다 쓰고 돌아온 대여 (정상/불량 반납) */
const isReturned = (r: TentRental) =>
  r.status === "RETURNED" || r.status === "DEFECTIVE";

const time = (iso: string) => new Date(iso).getTime() || 0;

export const getCurrentRental = (tent: Tent): TentRental | undefined =>
  [...tent.rentals]
    .sort((a, b) => time(b.startDate) - time(a.startDate))
    .find(isOut);

/** 지금 이 천막을 쓰고 있는 단위 */
export const getCurrentUnit = (tent: Tent): string =>
  getCurrentRental(tent)?.departmentName || "-";

/** 반납된 대여 중 가장 최근(반납 예정일 기준)에 이 천막을 썼던 단위 */
export const getLastUnit = (tent: Tent): string => {
  const last = [...tent.rentals]
    .filter(isReturned)
    .sort((a, b) => time(b.endDate) - time(a.endDate))[0];
  return last?.departmentName || "-";
};

/**
 * 이 천막을 지금 내보낼 수 있는지. 불가하면 사유를 돌려줍니다 (파손 / 미반납 / 대여중).
 * 예약 단계에서는 천막을 특정하지 않으므로(수량 단위 예약) 날짜 겹침은 따지지 않습니다.
 */
export const getTentBlockReason = (tent: Tent): string | null => {
  if (tent.damaged) return "파손";
  const current = getCurrentRental(tent);
  if (!current) return null;
  const unit = current.departmentName ?? "-";
  return current.status === "OVERDUE" ? `미반납 (${unit})` : `대여중 (${unit})`;
};

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
/* 대여 메모의 천막 배정 태그                                           */
/* 서버에 '어느 천막이 어느 대여에 나갔는지' 저장할 곳이 없어서,          */
/* 대여중으로 바꿀 때 대여 메모에 [대여 천막: 천막 5, 천막 6] 을 남깁니다. */
/* 관리자 화면의 대여 메모에 그대로 보이므로 사람이 읽어도 알 수 있습니다. */
/* ------------------------------------------------------------------ */

const TENT_TAG_RE = /\s*\[대여 천막: ([^\]]*)\]/;

/** 메모에서 천막 번호 목록 추출 (태그가 없으면 빈 배열) */
export const parseTentTag = (memo?: string | null): string[] => {
  const m = (memo ?? "").match(TENT_TAG_RE);
  return m
    ? m[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
};

/** 기존 메모는 살리고 천막 태그만 붙이거나 교체 */
export const withTentTag = (memo: string | null | undefined, tentNumbers: string[]) => {
  const base = (memo ?? "").replace(TENT_TAG_RE, "").trim();
  const tag = `[대여 천막: ${tentNumbers.join(", ")}]`;
  return base ? `${base} ${tag}` : tag;
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

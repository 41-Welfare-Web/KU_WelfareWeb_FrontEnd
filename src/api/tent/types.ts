import type { RentalStatus } from "../rental/types";

/** 실물 부위 상태 — 정상 / 파손 하·중·상 */
export type PartCondition = "NORMAL" | "LOW" | "MEDIUM" | "HIGH";

/** 화면 표시용 라벨 */
export const PART_CONDITION_LABEL: Record<PartCondition, string> = {
  NORMAL: "정상",
  LOW: "파손(하)",
  MEDIUM: "파손(중)",
  HIGH: "파손(상)",
};

/**
 * 천막 한 동이 나갔던 대여 건.
 * 대여중으로 바꿀 때 instanceIds로 지정한 출고 기록을 서버가 돌려줍니다 (GET /api/items/:id/instances 의 rentals).
 */
export interface TentRental {
  rentalId: number;
  rentalItemId: number;
  /** 그 대여 건의 천막 품목 상태 (대여중/연체면 지금 나가 있음) */
  status: RentalStatus;
  /** 대여 시작일 (ISO 문자열) */
  startDate: string;
  /** 반납 예정일 (ISO 문자열) */
  endDate: string;
  renterName?: string;
  /** 대여 단위 (예약자가 속한 집단: 단과대/학과/자치기구 등) */
  departmentName?: string;
}

/** 천막 관리 표의 한 행 = '천막' 물품의 개별 실물 1개 */
export interface Tent {
  /** 개별 실물 ID */
  id: number;
  /** 화면에 표시되는 천막 번호 (개별 실물의 시리얼 번호) */
  tentNumber: string;
  /**
   * 파손 여부 (관리자가 직접 설정, 실물 상태 BROKEN).
   * 대여 가능 여부는 이 값과 현재 대여 상태에서 파생됩니다 (파손 또는 대여중/연체 = 불가).
   */
  damaged: boolean;
  /** 비고 (관리자가 직접 수정, 실물의 note로 서버에 저장) */
  note: string;
  /** 천(원단) 상태 — 기록·표시용이며 대여 가능 여부와는 무관 */
  fabric: PartCondition;
  /** 다리(프레임) 상태 — 기록·표시용 */
  frame: PartCondition;
  /** 이 천막이 나갔던 대여 건들 */
  rentals: TentRental[];
}

/** '천막' 물품 정보 */
export interface TentItemInfo {
  id: number;
  /** 물품 목록 관리에 등록된 천막 총 수량 */
  totalQuantity: number;
}

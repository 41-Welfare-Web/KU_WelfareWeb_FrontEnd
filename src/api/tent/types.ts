import type { RentalStatus } from "../rental/types";

/**
 * 천막 한 동이 나갔던 대여 건.
 * 대여중으로 바꿀 때 대여 메모에 남기는 `[대여 천막: 천막 5, 천막 6]` 태그로 연결합니다.
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
  /** 비고 (관리자가 직접 수정 — 서버에 저장할 칸이 없어 이 브라우저에만 저장) */
  note: string;
  /** 이 천막이 나갔던 대여 건들 */
  rentals: TentRental[];
}

/** '천막' 물품 정보 */
export interface TentItemInfo {
  id: number;
  /** 물품 목록 관리에 등록된 천막 총 수량 */
  totalQuantity: number;
}

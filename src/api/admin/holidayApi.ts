import axiosInstance from "../axiosInstance";

/**
 * 휴무일 API
 *
 * 주말(토·일)은 서버의 운영일 계산에서 자동으로 제외되므로 테이블에 등록하지 않습니다.
 * 따라서 이 목록에는 평일만 들어 있습니다.
 */
export interface Holiday {
  id: number;
  /** ISO 날짜 문자열 (예: "2026-11-30T00:00:00.000Z") */
  holidayDate: string;
  description: string | null;
}

export interface CreateRangeResult {
  message: string;
  /** 새로 등록된 날 수 */
  created: number;
  /** 이미 등록돼 있어 건너뛴 날 수 (기존 사유 유지) */
  alreadyRegistered: number;
  /** 주말이라 제외한 날 수 */
  weekendsSkipped: number;
  dates: string[];
}

/** 전체 휴무일 목록 (GET /api/admin/holidays) */
export async function getHolidays(): Promise<Holiday[]> {
  const res = await axiosInstance.get<Holiday[]>("/api/admin/holidays");
  return res.data;
}

/** 하루 등록 (POST /api/admin/holidays) */
export async function createHoliday(
  holidayDate: string,
  description?: string,
): Promise<Holiday> {
  const res = await axiosInstance.post<Holiday>("/api/admin/holidays", {
    holidayDate,
    description,
  });
  return res.data;
}

/** 기간 일괄 등록 (POST /api/admin/holidays/range) */
export async function createHolidayRange(payload: {
  startDate: string;
  endDate: string;
  description?: string;
  includeWeekends?: boolean;
}): Promise<CreateRangeResult> {
  const res = await axiosInstance.post<CreateRangeResult>(
    "/api/admin/holidays/range",
    payload,
  );
  return res.data;
}

/** 하루 삭제 (DELETE /api/admin/holidays/:id) */
export async function deleteHoliday(id: number): Promise<void> {
  await axiosInstance.delete(`/api/admin/holidays/${id}`);
}

/** 기간 일괄 삭제 (DELETE /api/admin/holidays/range) */
export async function deleteHolidayRange(
  startDate: string,
  endDate: string,
): Promise<{ message: string; deleted: number }> {
  const res = await axiosInstance.delete<{ message: string; deleted: number }>(
    "/api/admin/holidays/range",
    { params: { startDate, endDate } },
  );
  return res.data;
}

/** "2026-11-30T00:00:00.000Z" -> "2026-11-30" (UTC 기준 저장이라 자르기만 하면 됨) */
export const toDateKey = (isoDate: string) => isoDate.slice(0, 10);

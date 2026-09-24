import axiosInstance from "../axiosInstance";
import { getItems } from "../rental/rentalApi";
import { isTentItem } from "../../utils/tentUtils";
import type { PartCondition, Tent, TentItemInfo, TentRental } from "./types";

/**
 * 천막 API
 *
 * 천막 한 동 = '천막' 물품의 개별 실물(item_instances) 1개.
 *   - 천막 번호 : 실물 시리얼 번호                  (GET/POST /api/items/:id/instances)
 *   - 파손/비고 : 실물 상태 BROKEN/AVAILABLE + note (PUT /api/items/instances/:id)
 *   - 대여 이력 : 실물 목록 응답의 rentals — 대여중으로 바꿀 때 instanceIds로 지정한 출고 기록
 */

/** GET /api/items/:id/instances 응답 (필요한 필드만) */
interface InstanceResponse {
  id: number;
  serialNumber: string;
  status: "AVAILABLE" | "RENTED" | "BROKEN";
  note: string | null;
  fabricCondition?: PartCondition;
  frameCondition?: PartCondition;
  /** 이 실물이 출고됐던 대여 건 (최신 배정순) */
  rentals?: {
    rentalId: number;
    rentalItemId: number;
    status: TentRental["status"];
    startDate: string;
    endDate: string;
    renterName?: string | null;
    departmentName?: string | null;
  }[];
}

/* ---------------- '천막' 물품 ---------------- */

let tentItemPromise: Promise<TentItemInfo> | null = null;

/** '천막' 물품 찾기 (이름이 정확히 '천막'인 것. '천막용 LED등' 제외). 한 번 찾으면 재사용 */
export function getTentItem(): Promise<TentItemInfo> {
  if (!tentItemPromise) {
    tentItemPromise = getItems({ search: "천막" })
      .then((items) => {
        const tent = items.find((it) => isTentItem(it.name));
        if (!tent) {
          throw new Error(
            "물품 목록에 '천막'이 없습니다. 물품 목록 관리에서 먼저 등록해주세요.",
          );
        }
        return { id: tent.id, totalQuantity: tent.totalQuantity ?? 0 };
      })
      .catch((err) => {
        tentItemPromise = null; // 실패는 캐시하지 않음
        throw err;
      });
  }
  return tentItemPromise;
}

/* ---------------- 조회 ---------------- */

/** "천막 10"이 "천막 2" 뒤에 오도록 숫자 기준 정렬 */
const byTentNumber = (a: Tent, b: Tent) =>
  a.tentNumber.localeCompare(b.tentNumber, "ko", { numeric: true });

export async function getTents(): Promise<Tent[]> {
  const { id } = await getTentItem();
  const { data: instances } = await axiosInstance.get<InstanceResponse[]>(
    `/api/items/${id}/instances`,
  );

  return instances
    .map((inst) => ({
      id: inst.id,
      tentNumber: inst.serialNumber,
      damaged: inst.status === "BROKEN",
      note: inst.note ?? "",
      fabric: inst.fabricCondition ?? "NORMAL",
      frame: inst.frameCondition ?? "NORMAL",
      rentals: (inst.rentals ?? []).map(
        (r): TentRental => ({
          rentalId: r.rentalId,
          rentalItemId: r.rentalItemId,
          status: r.status,
          startDate: r.startDate,
          endDate: r.endDate,
          renterName: r.renterName ?? undefined,
          departmentName: r.departmentName ?? undefined,
        }),
      ),
    }))
    .sort(byTentNumber);
}

/* ---------------- 수정/등록 ---------------- */

export async function updateTent(
  tentId: number,
  patch: Partial<Pick<Tent, "damaged" | "note" | "fabric" | "frame">>,
): Promise<void> {
  const body: {
    status?: "BROKEN" | "AVAILABLE";
    note?: string;
    fabricCondition?: PartCondition;
    frameCondition?: PartCondition;
  } = {};
  if (patch.damaged !== undefined) {
    body.status = patch.damaged ? "BROKEN" : "AVAILABLE";
  }
  if (patch.note !== undefined) {
    body.note = patch.note;
  }
  if (patch.fabric !== undefined) {
    body.fabricCondition = patch.fabric;
  }
  if (patch.frame !== undefined) {
    body.frameCondition = patch.frame;
  }
  if (Object.keys(body).length === 0) return;
  await axiosInstance.put(`/api/items/instances/${tentId}`, body);
}

/** 천막 등록 (tentNumber = 시리얼 번호, 전체 물품에서 중복 불가) */
export async function createTent(tentNumber: string): Promise<void> {
  const { id } = await getTentItem();
  await axiosInstance.post(`/api/items/${id}/instances`, {
    serialNumber: tentNumber,
  });
}

import axiosInstance from "../axiosInstance";
import { getItems } from "../rental/rentalApi";
import { getRentals } from "../../services/rentalApi";
import type { Rental } from "../rental/types";
import { isTentItem, parseTentTag } from "../../utils/tentUtils";
import type { Tent, TentItemInfo, TentRental } from "./types";

/**
 * 천막 API — 현재 운영 중인 백엔드 API만 사용합니다.
 *
 * 천막 한 동 = '천막' 물품의 개별 실물(item_instances) 1개.
 *   - 천막 번호 : 실물 시리얼 번호           (GET/POST /api/items/:id/instances)
 *   - 파손 여부 : 실물 상태 BROKEN/AVAILABLE (PUT /api/items/instances/:id)
 *   - 대여 이력 : 대여 메모의 [대여 천막: ...] 태그 + 천막 품목 상태 (GET /api/rentals)
 *   - 비고     : 서버에 저장할 칸이 없어 이 브라우저(localStorage)에만 저장
 */

/** GET /api/items/:id/instances 응답 (필요한 필드만) */
interface InstanceResponse {
  id: number;
  serialNumber: string;
  status: "AVAILABLE" | "RENTED" | "BROKEN";
}

/** 목록 응답에는 있지만 공용 Rental 타입에 빠져 있는 소속 필드 */
type RentalWithDepartment = Rental & {
  departmentName?: string | null;
  departmentType?: string | null;
};

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

/* ---------------- 비고 (이 브라우저에만 저장) ---------------- */

const NOTES_KEY = "admin.tentNotes";

const readNotes = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeNote = (tentId: number, note: string) => {
  const notes = readNotes();
  if (note) notes[tentId] = note;
  else delete notes[tentId];
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    throw new Error("이 브라우저에 비고를 저장하지 못했습니다.");
  }
};

/* ---------------- 조회 ---------------- */

/** 대여 목록에서 '천막 번호 -> 그 천막이 나갔던 대여 건들' */
const collectTentRentals = (rentals: RentalWithDepartment[]) => {
  const byTentNumber = new Map<string, TentRental[]>();
  for (const rental of rentals) {
    const tentNumbers = parseTentTag(rental.memo);
    if (tentNumbers.length === 0) continue;
    const tentItem = rental.rentalItems?.find((ri) => isTentItem(ri.item?.name));
    if (!tentItem) continue;

    const entry: TentRental = {
      rentalId: rental.id,
      rentalItemId: tentItem.id,
      status: tentItem.status,
      startDate: rental.startDate,
      endDate: rental.endDate,
      renterName: rental.user?.name,
      departmentName: rental.departmentName || rental.departmentType || undefined,
    };
    for (const tentNumber of tentNumbers) {
      byTentNumber.set(tentNumber, [...(byTentNumber.get(tentNumber) ?? []), entry]);
    }
  }
  return byTentNumber;
};

/** "천막 10"이 "천막 2" 뒤에 오도록 숫자 기준 정렬 */
const byTentNumber = (a: Tent, b: Tent) =>
  a.tentNumber.localeCompare(b.tentNumber, "ko", { numeric: true });

export async function getTents(): Promise<Tent[]> {
  const { id } = await getTentItem();
  const [{ data: instances }, { rentals }] = await Promise.all([
    axiosInstance.get<InstanceResponse[]>(`/api/items/${id}/instances`),
    // 관리자 대여 관리 탭과 같은 범위 (최근 1000건)
    getRentals({ page: 1, pageSize: 1000 }),
  ]);

  const rentalsByTent = collectTentRentals(rentals as RentalWithDepartment[]);
  const notes = readNotes();

  return instances
    .map((inst) => ({
      id: inst.id,
      tentNumber: inst.serialNumber,
      damaged: inst.status === "BROKEN",
      note: notes[inst.id] ?? "",
      rentals: rentalsByTent.get(inst.serialNumber) ?? [],
    }))
    .sort(byTentNumber);
}

/* ---------------- 수정/등록 ---------------- */

export async function updateTent(
  tentId: number,
  patch: Partial<Pick<Tent, "damaged" | "note">>,
): Promise<void> {
  if (patch.damaged !== undefined) {
    await axiosInstance.put(`/api/items/instances/${tentId}`, {
      status: patch.damaged ? "BROKEN" : "AVAILABLE",
    });
  }
  if (patch.note !== undefined) {
    writeNote(tentId, patch.note);
  }
}

/** 천막 등록 (tentNumber = 시리얼 번호, 전체 물품에서 중복 불가) */
export async function createTent(tentNumber: string): Promise<void> {
  const { id } = await getTentItem();
  await axiosInstance.post(`/api/items/${id}/instances`, {
    serialNumber: tentNumber,
  });
}

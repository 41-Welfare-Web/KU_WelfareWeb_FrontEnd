import { describe, it, expect } from 'vitest';

// ─────────────────────────────────────────────
// AdminDashboard 에서 쓰는 상태 매핑 로직
// ─────────────────────────────────────────────

const RENTAL_STATUS_MAP_REVERSE = {
  RESERVED: 'reserved',
  RENTED: 'renting',
  RETURNED: 'returned',
  OVERDUE: 'overdue',
  CANCELED: 'canceled',
  DEFECTIVE: 'defective',
} as const;

type ApiStatus = keyof typeof RENTAL_STATUS_MAP_REVERSE;
type FrontStatus = (typeof RENTAL_STATUS_MAP_REVERSE)[ApiStatus];

function toApiStatus(frontStatus: FrontStatus): ApiStatus {
  return (
    (Object.keys(RENTAL_STATUS_MAP_REVERSE) as ApiStatus[]).find(
      (k) => RENTAL_STATUS_MAP_REVERSE[k] === frontStatus,
    ) ?? 'RESERVED'
  );
}

describe('RENTAL_STATUS_MAP_REVERSE', () => {
  it('모든 API 상태가 프론트 상태로 매핑된다', () => {
    expect(RENTAL_STATUS_MAP_REVERSE['RESERVED']).toBe('reserved');
    expect(RENTAL_STATUS_MAP_REVERSE['RENTED']).toBe('renting');
    expect(RENTAL_STATUS_MAP_REVERSE['RETURNED']).toBe('returned');
    expect(RENTAL_STATUS_MAP_REVERSE['OVERDUE']).toBe('overdue');
    expect(RENTAL_STATUS_MAP_REVERSE['CANCELED']).toBe('canceled');
    expect(RENTAL_STATUS_MAP_REVERSE['DEFECTIVE']).toBe('defective');
  });

  it('toApiStatus: 프론트 상태 → API 상태 역변환이 정확하다', () => {
    expect(toApiStatus('reserved')).toBe('RESERVED');
    expect(toApiStatus('renting')).toBe('RENTED');
    expect(toApiStatus('returned')).toBe('RETURNED');
    expect(toApiStatus('overdue')).toBe('OVERDUE');
    expect(toApiStatus('canceled')).toBe('CANCELED');
    expect(toApiStatus('defective')).toBe('DEFECTIVE');
  });
});

// ─────────────────────────────────────────────
// 로컬 상태 업데이트 로직 (개별 상태 변경)
// ─────────────────────────────────────────────

interface RentalItem {
  id?: number;
  status: string;
  item?: { name: string };
  quantity?: number;
}

interface RentalData {
  id: number;
  memo?: string | null;
  rentalItems: RentalItem[];
  user: { name: string; studentId: string };
  startDate: string;
  endDate: string;
}

function applyLocalStatusUpdate(
  prev: RentalData[],
  targetRentalId: number,
  apiStatus: string,
  newMemo: string | undefined,
  rentalItemId?: number,
): RentalData[] {
  return prev.map((r) => {
    if (r.id !== targetRentalId) return r;
    return {
      ...r,
      memo: newMemo ?? r.memo,
      rentalItems: r.rentalItems.map((ri) => {
        if (apiStatus === 'DEFECTIVE' && ri.id !== rentalItemId) return ri;
        return { ...ri, status: apiStatus };
      }),
    };
  });
}

const mockRentalData: RentalData[] = [
  {
    id: 1,
    memo: '기존 메모',
    user: { name: '홍길동', studentId: '2024001' },
    startDate: '2026-07-01',
    endDate: '2026-07-03',
    rentalItems: [
      { id: 10, status: 'RESERVED', item: { name: '텐트' }, quantity: 1 },
      { id: 11, status: 'RESERVED', item: { name: '의자' }, quantity: 5 },
    ],
  },
  {
    id: 2,
    memo: null,
    user: { name: '김철수', studentId: '2024002' },
    startDate: '2026-07-02',
    endDate: '2026-07-04',
    rentalItems: [
      { id: 20, status: 'RENTED', item: { name: '마이크' }, quantity: 1 },
    ],
  },
];

describe('applyLocalStatusUpdate (개별 상태 변경)', () => {
  it('대상 rental의 모든 items 상태가 변경된다 (DEFECTIVE 아닐 때)', () => {
    const result = applyLocalStatusUpdate(mockRentalData, 1, 'RENTED', undefined);
    const rental = result.find((r) => r.id === 1)!;
    expect(rental.rentalItems[0].status).toBe('RENTED');
    expect(rental.rentalItems[1].status).toBe('RENTED');
  });

  it('다른 rental은 변경되지 않는다', () => {
    const result = applyLocalStatusUpdate(mockRentalData, 1, 'RENTED', undefined);
    const other = result.find((r) => r.id === 2)!;
    expect(other.rentalItems[0].status).toBe('RENTED'); // 원래 값 유지
  });

  it('DEFECTIVE 일 때 해당 rentalItemId의 item만 변경된다', () => {
    const result = applyLocalStatusUpdate(mockRentalData, 1, 'DEFECTIVE', undefined, 10);
    const rental = result.find((r) => r.id === 1)!;
    expect(rental.rentalItems[0].status).toBe('DEFECTIVE'); // id=10 변경됨
    expect(rental.rentalItems[1].status).toBe('RESERVED'); // id=11 유지
  });

  it('memo가 전달되면 업데이트된다', () => {
    const result = applyLocalStatusUpdate(mockRentalData, 1, 'RETURNED', '새 메모');
    const rental = result.find((r) => r.id === 1)!;
    expect(rental.memo).toBe('새 메모');
  });

  it('memo가 undefined면 기존 memo가 유지된다', () => {
    const result = applyLocalStatusUpdate(mockRentalData, 1, 'RETURNED', undefined);
    const rental = result.find((r) => r.id === 1)!;
    expect(rental.memo).toBe('기존 메모');
  });
});

// ─────────────────────────────────────────────
// 로컬 상태 업데이트 로직 (일괄 적용)
// ─────────────────────────────────────────────

function applyBulkStatusUpdate(
  prev: RentalData[],
  checkedIds: Set<number>,
  apiStatus: string,
): RentalData[] {
  return prev.map((r) => ({
    ...r,
    rentalItems: r.rentalItems.map((ri) =>
      ri.id !== undefined && checkedIds.has(ri.id)
        ? { ...ri, status: apiStatus }
        : ri,
    ),
  }));
}

describe('applyBulkStatusUpdate (일괄 적용)', () => {
  it('체크된 items만 상태가 변경된다', () => {
    const checked = new Set([10, 20]);
    const result = applyBulkStatusUpdate(mockRentalData, checked, 'RETURNED');

    const rental1 = result.find((r) => r.id === 1)!;
    const rental2 = result.find((r) => r.id === 2)!;

    expect(rental1.rentalItems[0].status).toBe('RETURNED'); // id=10 변경
    expect(rental1.rentalItems[1].status).toBe('RESERVED'); // id=11 미체크, 유지
    expect(rental2.rentalItems[0].status).toBe('RETURNED'); // id=20 변경
  });

  it('체크가 없으면 아무것도 변경되지 않는다', () => {
    const checked = new Set<number>();
    const result = applyBulkStatusUpdate(mockRentalData, checked, 'RETURNED');
    expect(result[0].rentalItems[0].status).toBe('RESERVED');
    expect(result[1].rentalItems[0].status).toBe('RENTED');
  });

  it('여러 그룹의 items를 동시에 처리할 수 있다', () => {
    const checked = new Set([10, 11, 20]);
    const result = applyBulkStatusUpdate(mockRentalData, checked, 'CANCELED');
    result.forEach((r) =>
      r.rentalItems.forEach((ri) => {
        expect(ri.status).toBe('CANCELED');
      }),
    );
  });
});

// ─────────────────────────────────────────────
// onSelectGroup 로직 (그룹 전체 토글)
// ─────────────────────────────────────────────

function selectGroup(prev: Set<number>, groupIds: number[]): Set<number> {
  const allChecked = groupIds.every((id) => prev.has(id));
  const next = new Set(prev);
  if (allChecked) {
    groupIds.forEach((id) => next.delete(id));
  } else {
    groupIds.forEach((id) => next.add(id));
  }
  return next;
}

describe('selectGroup (신청번호 클릭 → 그룹 토글)', () => {
  it('아무것도 선택 안 된 상태에서 그룹 전체가 선택된다', () => {
    const result = selectGroup(new Set(), [10, 11]);
    expect(result.has(10)).toBe(true);
    expect(result.has(11)).toBe(true);
  });

  it('그룹 전체가 선택된 상태에서 전체 해제된다', () => {
    const result = selectGroup(new Set([10, 11]), [10, 11]);
    expect(result.has(10)).toBe(false);
    expect(result.has(11)).toBe(false);
  });

  it('일부만 선택된 상태에서 나머지가 추가 선택된다', () => {
    const result = selectGroup(new Set([10]), [10, 11]);
    expect(result.has(10)).toBe(true);
    expect(result.has(11)).toBe(true);
  });

  it('다른 그룹 선택은 유지된다', () => {
    const result = selectGroup(new Set([20]), [10, 11]);
    expect(result.has(20)).toBe(true); // 기존 그룹 유지
    expect(result.has(10)).toBe(true);
    expect(result.has(11)).toBe(true);
  });
});

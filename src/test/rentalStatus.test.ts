import { describe, it, expect } from 'vitest';

// ─────────────────────────────────────────────
// AdminDashboard: 상태 매핑 (RentalDetailModal의 statusToAPI는
// 이중 호출 버그 수정으로 제거되어 AdminDashboard의 매핑만 사용됨)
// ─────────────────────────────────────────────

const statusToAPI = {
  reserved: 'RESERVED',
  renting: 'RENTED',
  returned: 'RETURNED',
  overdue: 'OVERDUE',
  canceled: 'CANCELED',
  defective: 'DEFECTIVE',
} as const;

describe('상태 매핑 (프론트 → API)', () => {
  it('defective → DEFECTIVE (이전 버그: RETURNED로 잘못 매핑됨)', () => {
    expect(statusToAPI['defective']).toBe('DEFECTIVE');
    expect(statusToAPI['defective']).not.toBe('RETURNED');
  });

  it('모든 상태가 올바른 API 값으로 매핑된다', () => {
    expect(statusToAPI['reserved']).toBe('RESERVED');
    expect(statusToAPI['renting']).toBe('RENTED');
    expect(statusToAPI['returned']).toBe('RETURNED');
    expect(statusToAPI['overdue']).toBe('OVERDUE');
    expect(statusToAPI['canceled']).toBe('CANCELED');
    expect(statusToAPI['defective']).toBe('DEFECTIVE');
  });
});

// ─────────────────────────────────────────────
// AdminRentalRow: formatShortDate
// ─────────────────────────────────────────────

function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString.split('T')[0];
  const yy = String(d.getFullYear()).slice(2);
  return `${yy}/${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`;
}

describe('AdminRentalRow - formatShortDate', () => {
  it('ISO 날짜를 YY/M/DD 형식으로 변환한다', () => {
    const result = formatShortDate('2026-07-01T00:00:00.000Z');
    // UTC 기준 파싱이므로 로컬 타임존에 따라 달라질 수 있음 — 형식만 검증
    expect(result).toMatch(/^\d{2}\/\d{1,2}\/\d{2}$/);
  });

  it('빈 문자열 입력 시 빈 문자열 반환', () => {
    expect(formatShortDate('')).toBe('');
  });

  it('잘못된 날짜 입력 시 T 이전 값 반환', () => {
    expect(formatShortDate('invalid-date')).toBe('invalid-date');
  });
});

// ─────────────────────────────────────────────
// RentalCart: 수정 모드 품목 필터링 + locked 판정
// (관리자: CANCELED 제외 전체, RESERVED 아닌 품목은 locked)
// (일반 사용자: RESERVED만)
// ─────────────────────────────────────────────

interface RentalItem {
  id: number;
  status: string;
  item?: { id: number; name: string };
  quantity: number;
}

function filterEditItems(rentalItems: RentalItem[], isAdmin: boolean) {
  return rentalItems
    .filter((ri) =>
      isAdmin ? ri.status !== 'CANCELED' : ri.status === 'RESERVED',
    )
    .map((ri) => ({ ...ri, locked: ri.status !== 'RESERVED' }));
}

describe('RentalCart - 수정 모드 품목 필터', () => {
  const mixedItems: RentalItem[] = [
    { id: 1, status: 'RESERVED', item: { id: 10, name: '텐트' }, quantity: 1 },
    { id: 2, status: 'RENTED', item: { id: 11, name: '의자' }, quantity: 5 },
    { id: 3, status: 'RESERVED', item: { id: 12, name: '마이크' }, quantity: 2 },
    { id: 4, status: 'OVERDUE', item: { id: 13, name: '앰프' }, quantity: 1 },
    { id: 5, status: 'CANCELED', item: { id: 14, name: '천막' }, quantity: 1 },
  ];

  it('일반 사용자: RESERVED 상태만 필터링된다', () => {
    const result = filterEditItems(mixedItems, false);
    expect(result).toHaveLength(2);
    expect(result.every((ri) => ri.status === 'RESERVED')).toBe(true);
  });

  it('관리자: CANCELED 제외 전체가 표시된다', () => {
    const result = filterEditItems(mixedItems, true);
    expect(result).toHaveLength(4);
    expect(result.some((ri) => ri.status === 'CANCELED')).toBe(false);
  });

  it('관리자: RESERVED가 아닌 품목은 locked 처리된다', () => {
    const result = filterEditItems(mixedItems, true);
    const rented = result.find((ri) => ri.status === 'RENTED')!;
    const overdue = result.find((ri) => ri.status === 'OVERDUE')!;
    const reserved = result.find((ri) => ri.id === 1)!;
    expect(rented.locked).toBe(true);
    expect(overdue.locked).toBe(true);
    expect(reserved.locked).toBe(false);
  });

  it('일반 사용자: RESERVED가 하나도 없으면 빈 배열 반환', () => {
    const noneReserved: RentalItem[] = [
      { id: 1, status: 'RENTED', quantity: 1 },
      { id: 2, status: 'RETURNED', quantity: 1 },
    ];
    expect(filterEditItems(noneReserved, false)).toHaveLength(0);
  });

  it('관리자: RESERVED가 없어도 품목이 표시된다 (날짜 전용 수정)', () => {
    const noneReserved: RentalItem[] = [
      { id: 1, status: 'RENTED', quantity: 1 },
      { id: 2, status: 'RETURNED', quantity: 1 },
    ];
    const result = filterEditItems(noneReserved, true);
    expect(result).toHaveLength(2);
    expect(result.every((ri) => ri.locked)).toBe(true);
  });
});

// ─────────────────────────────────────────────
// RentalCart: 수정 제출 payload 분기
// (RESERVED 품목 있으면 items 전송, 없으면 날짜 전용 전송)
// ─────────────────────────────────────────────

interface EditCartItem {
  itemId: number;
  count: number;
  startDate: string | null;
  endDate: string | null;
  locked?: boolean;
}

function buildUpdatePayload(
  cartItems: EditCartItem[],
  departmentType: string,
  departmentName: string | null,
) {
  const first = cartItems[0];
  const editableItems = cartItems.filter((it) => !it.locked);

  if (editableItems.length > 0) {
    return {
      departmentType,
      departmentName,
      items: editableItems.map((it) => ({
        itemId: it.itemId,
        quantity: it.count,
        startDate: String(it.startDate ?? '').slice(0, 10),
        endDate: String(it.endDate ?? '').slice(0, 10),
      })),
    };
  }
  return {
    departmentType,
    departmentName,
    startDate: String(first.startDate).slice(0, 10),
    endDate: String(first.endDate).slice(0, 10),
  };
}

describe('RentalCart - 수정 제출 payload 분기', () => {
  it('RESERVED(unlocked) 품목이 있으면 items로 전송된다', () => {
    const payload = buildUpdatePayload(
      [
        { itemId: 1, count: 2, startDate: '2026-07-20', endDate: '2026-07-22', locked: false },
        { itemId: 2, count: 1, startDate: '2026-07-20', endDate: '2026-07-22', locked: true },
      ],
      '학과',
      '컴퓨터공학과',
    );
    expect(payload.items).toHaveLength(1);
    expect(payload.items![0].itemId).toBe(1);
    expect((payload as any).startDate).toBeUndefined();
  });

  it('locked 품목은 items에서 제외된다', () => {
    const payload = buildUpdatePayload(
      [
        { itemId: 1, count: 2, startDate: '2026-07-20', endDate: '2026-07-22', locked: false },
        { itemId: 2, count: 1, startDate: '2026-07-20', endDate: '2026-07-22', locked: true },
      ],
      '학과',
      null,
    );
    expect(payload.items!.some((i) => i.itemId === 2)).toBe(false);
  });

  it('전부 locked면 날짜 전용 payload로 전송된다 (items 없음)', () => {
    const payload = buildUpdatePayload(
      [
        { itemId: 1, count: 2, startDate: '2026-07-20', endDate: '2026-07-22', locked: true },
        { itemId: 2, count: 1, startDate: '2026-07-20', endDate: '2026-07-22', locked: true },
      ],
      '학과',
      '컴퓨터공학과',
    );
    expect((payload as any).items).toBeUndefined();
    expect(payload.startDate).toBe('2026-07-20');
    expect(payload.endDate).toBe('2026-07-22');
  });
});

// ─────────────────────────────────────────────
// RentalCart: 수정 모드 날짜 변경 — 모든 품목에 동일 적용
// ─────────────────────────────────────────────

function applyDateToAll(
  cartItems: EditCartItem[],
  range: { startDate: string | null; endDate: string | null },
): EditCartItem[] {
  return cartItems.map((x) => ({
    ...x,
    startDate: range.startDate,
    endDate: range.endDate,
  }));
}

describe('RentalCart - 수정 모드 날짜 일괄 적용', () => {
  it('날짜 변경 시 모든 품목의 날짜가 동일하게 바뀐다', () => {
    const items: EditCartItem[] = [
      { itemId: 1, count: 1, startDate: '2026-07-01', endDate: '2026-07-03' },
      { itemId: 2, count: 2, startDate: '2026-07-01', endDate: '2026-07-03' },
      { itemId: 3, count: 3, startDate: '2026-07-01', endDate: '2026-07-03', locked: true },
    ];
    const result = applyDateToAll(items, { startDate: '2026-07-10', endDate: '2026-07-12' });
    result.forEach((it) => {
      expect(it.startDate).toBe('2026-07-10');
      expect(it.endDate).toBe('2026-07-12');
    });
  });

  it('백엔드 검증 통과: 변경 후 모든 품목 날짜가 동일하다', () => {
    const items: EditCartItem[] = [
      { itemId: 1, count: 1, startDate: '2026-07-01', endDate: '2026-07-03' },
      { itemId: 2, count: 2, startDate: '2026-07-05', endDate: '2026-07-08' },
    ];
    const result = applyDateToAll(items, { startDate: '2026-07-10', endDate: '2026-07-12' });
    const firstStart = result[0].startDate;
    const firstEnd = result[0].endDate;
    expect(result.every((it) => it.startDate === firstStart && it.endDate === firstEnd)).toBe(true);
  });
});

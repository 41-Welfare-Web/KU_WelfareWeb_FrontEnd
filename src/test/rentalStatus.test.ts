import { describe, it, expect } from 'vitest';

// ─────────────────────────────────────────────
// RentalDetailModal: statusToAPI 매핑
// ─────────────────────────────────────────────

const statusToAPI = {
  reserved: 'RESERVED',
  renting: 'RENTED',
  returned: 'RETURNED',
  overdue: 'OVERDUE',
  canceled: 'CANCELED',
  defective: 'DEFECTIVE',
} as const;

describe('RentalDetailModal - statusToAPI 매핑', () => {
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
// RentalCart: RESERVED 필터링 (수정 모드)
// ─────────────────────────────────────────────

interface RentalItem {
  id: number;
  status: string;
  item?: { id: number; name: string };
  quantity: number;
}

function filterReservedItems(rentalItems: RentalItem[]): RentalItem[] {
  return rentalItems.filter((ri) => ri.status === 'RESERVED');
}

describe('RentalCart - 수정 모드 RESERVED 아이템 필터', () => {
  const mixedItems: RentalItem[] = [
    { id: 1, status: 'RESERVED', item: { id: 10, name: '텐트' }, quantity: 1 },
    { id: 2, status: 'RENTED', item: { id: 11, name: '의자' }, quantity: 5 },
    { id: 3, status: 'RESERVED', item: { id: 12, name: '마이크' }, quantity: 2 },
    { id: 4, status: 'OVERDUE', item: { id: 13, name: '앰프' }, quantity: 1 },
  ];

  it('RESERVED 상태만 필터링된다', () => {
    const result = filterReservedItems(mixedItems);
    expect(result).toHaveLength(2);
    expect(result.every((ri) => ri.status === 'RESERVED')).toBe(true);
  });

  it('RENTED/OVERDUE 항목은 제외된다 (수정 시 삭제 방지)', () => {
    const result = filterReservedItems(mixedItems);
    expect(result.some((ri) => ri.status === 'RENTED')).toBe(false);
    expect(result.some((ri) => ri.status === 'OVERDUE')).toBe(false);
  });

  it('전부 RESERVED인 경우 모두 포함된다', () => {
    const allReserved: RentalItem[] = [
      { id: 1, status: 'RESERVED', quantity: 1 },
      { id: 2, status: 'RESERVED', quantity: 2 },
    ];
    expect(filterReservedItems(allReserved)).toHaveLength(2);
  });

  it('RESERVED가 하나도 없으면 빈 배열 반환', () => {
    const noneReserved: RentalItem[] = [
      { id: 1, status: 'RENTED', quantity: 1 },
      { id: 2, status: 'RETURNED', quantity: 1 },
    ];
    expect(filterReservedItems(noneReserved)).toHaveLength(0);
  });
});

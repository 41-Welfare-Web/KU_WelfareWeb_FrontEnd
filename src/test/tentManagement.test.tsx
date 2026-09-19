// 천막 관리: 백엔드 API 연동(응답 변환/요청 형식), 현재·최근 대여 단위, 천막 등록 버튼
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Tent, TentRental } from '../api/tent/types';
import { getCurrentUnit, getLastUnit, getTentBlockReason } from '../utils/tentUtils';
import AdminTentTable from '../components/Admin/AdminTentTable';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  post: vi.fn(),
  getItems: vi.fn(),
  getRentals: vi.fn(),
}));

vi.mock('../api/axiosInstance', () => ({
  default: { get: mocks.get, put: mocks.put, post: mocks.post, delete: vi.fn() },
}));
vi.mock('../api/rental/rentalApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/rental/rentalApi')>()),
  getItems: mocks.getItems,
}));
vi.mock('../services/rentalApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/rentalApi')>()),
  getRentals: mocks.getRentals,
}));

// tentApi는 '천막' 물품 ID를 모듈 안에 캐시하므로 테스트마다 새로 불러옴
const loadTentApi = async () => {
  vi.resetModules();
  return import('../api/tent/tentApi');
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mocks.getItems.mockResolvedValue([
    { id: 8, name: '천막용 LED등', totalQuantity: 13 },
    { id: 1, name: '천막', totalQuantity: 8 },
  ]);
  mocks.getRentals.mockResolvedValue({ rentals: [] });
  mocks.put.mockResolvedValue({ data: {} });
  mocks.post.mockResolvedValue({ data: {} });
});

describe('tentApi (백엔드 API)', () => {
  it("'천막용 LED등'이 아니라 이름이 정확히 '천막'인 물품을 쓴다", async () => {
    const api = await loadTentApi();
    await expect(api.getTentItem()).resolves.toEqual({ id: 1, totalQuantity: 8 });
    expect(mocks.getItems).toHaveBeenCalledWith({ search: '천막' });
  });

  it("'천막' 물품이 없으면 안내 메시지로 실패한다", async () => {
    mocks.getItems.mockResolvedValue([{ id: 8, name: '천막용 LED등', totalQuantity: 13 }]);
    const api = await loadTentApi();
    await expect(api.getTents()).rejects.toThrow("물품 목록에 '천막'이 없습니다");
  });

  it('서버 실물 목록(비고·출고 이력 포함)으로 천막 목록을 만든다 (번호순, 대여 목록은 조회 안 함)', async () => {
    const outRental = {
      rentalId: 44,
      rentalItemId: 55,
      status: 'RENTED',
      startDate: '2026-09-05T00:00:00Z',
      endDate: '2026-09-12T00:00:00Z',
      renterName: '박도윤',
      departmentName: '학과',
      assignedAt: '2026-09-05T01:00:00Z',
    };
    mocks.get.mockResolvedValue({
      data: [
        { id: 30, serialNumber: '천막 10', status: 'AVAILABLE', note: null, rentals: [outRental] },
        { id: 12, serialNumber: '천막 2', status: 'BROKEN', note: '프레임 휨', rentals: [outRental] },
        { id: 31, serialNumber: '천막 11', status: 'AVAILABLE', note: null }, // rentals 필드 없는 응답도 허용
      ],
    });

    const api = await loadTentApi();
    const tents = await api.getTents();

    expect(mocks.get).toHaveBeenCalledWith('/api/items/1/instances');
    expect(mocks.getRentals).not.toHaveBeenCalled();
    expect(tents.map((t) => t.tentNumber)).toEqual(['천막 2', '천막 10', '천막 11']);

    const expectedRental = {
      rentalId: 44,
      rentalItemId: 55,
      status: 'RENTED',
      renterName: '박도윤',
      departmentName: '학과',
    };
    expect(tents[0]).toMatchObject({ id: 12, damaged: true, note: '프레임 휨', rentals: [expectedRental] });
    expect(tents[1]).toMatchObject({ id: 30, damaged: false, note: '', rentals: [expectedRental] });
    expect(tents[2]).toMatchObject({ id: 31, note: '', rentals: [] });
  });

  it('파손 여부는 실물 상태로 서버에 저장한다', async () => {
    const api = await loadTentApi();
    await api.updateTent(12, { damaged: true });
    await api.updateTent(12, { damaged: false });
    expect(mocks.put.mock.calls).toEqual([
      ['/api/items/instances/12', { status: 'BROKEN' }],
      ['/api/items/instances/12', { status: 'AVAILABLE' }],
    ]);
  });

  it('비고는 실물의 note로 서버에 저장한다 (비우면 빈 값으로)', async () => {
    const api = await loadTentApi();
    await api.updateTent(12, { note: '지퍼 수선 완료' });
    await api.updateTent(12, { note: '' });
    expect(mocks.put.mock.calls).toEqual([
      ['/api/items/instances/12', { note: '지퍼 수선 완료' }],
      ['/api/items/instances/12', { note: '' }],
    ]);
    expect(localStorage.getItem('admin.tentNotes')).toBeNull();
  });

  it('파손과 비고를 함께 바꾸면 한 요청으로 보낸다', async () => {
    const api = await loadTentApi();
    await api.updateTent(12, { damaged: true, note: '폴대 부러짐' });
    expect(mocks.put).toHaveBeenCalledTimes(1);
    expect(mocks.put).toHaveBeenCalledWith('/api/items/instances/12', {
      status: 'BROKEN',
      note: '폴대 부러짐',
    });
  });

  it('천막 등록은 천막 번호를 시리얼 번호로 보낸다', async () => {
    const api = await loadTentApi();
    await api.createTent('천막 9');
    expect(mocks.post).toHaveBeenCalledWith('/api/items/1/instances', { serialNumber: '천막 9' });
  });
});

const rental = (over: Partial<TentRental>): TentRental => ({
  rentalId: 1,
  rentalItemId: 1,
  status: 'RETURNED',
  startDate: '2026-09-01T00:00:00Z',
  endDate: '2026-09-03T00:00:00Z',
  departmentName: '-',
  ...over,
});
const tent = (over: Partial<Tent> = {}): Tent => ({
  id: 1,
  tentNumber: '천막 1',
  damaged: false,
  note: '',
  rentals: [],
  ...over,
});

describe('현재/최근 대여 단위, 내보낼 수 있는지', () => {
  it('대여중인 건이 현재 단위, 반납된 건 중 가장 최근 것이 최근 단위', () => {
    const t = tent({
      rentals: [
        rental({ status: 'RETURNED', departmentName: '총학생회', endDate: '2026-08-22T00:00:00Z' }),
        rental({ status: 'RENTED', departmentName: '경영대학', startDate: '2026-09-08T00:00:00Z', endDate: '2026-09-15T00:00:00Z' }),
        rental({ status: 'RETURNED', departmentName: '이과대학', endDate: '2026-09-04T00:00:00Z' }),
        rental({ status: 'CANCELED', departmentName: '취소된 단위', endDate: '2026-09-06T00:00:00Z' }),
      ],
    });
    expect(getCurrentUnit(t)).toBe('경영대학');
    expect(getLastUnit(t)).toBe('이과대학');
    expect(getTentBlockReason(t)).toBe('대여중 (경영대학)');
  });

  it('반납 처리되면 현재 단위에서 빠지고 최근 단위가 된다', () => {
    const t = tent({ rentals: [rental({ status: 'RETURNED', departmentName: '경영대학' })] });
    expect(getCurrentUnit(t)).toBe('-');
    expect(getLastUnit(t)).toBe('경영대학');
    expect(getTentBlockReason(t)).toBeNull();
  });

  it('연체는 아직 나가 있는 것으로 보고, 파손이 가장 우선한다', () => {
    const overdue = tent({ rentals: [rental({ status: 'OVERDUE', departmentName: '예술대학' })] });
    expect(getCurrentUnit(overdue)).toBe('예술대학');
    expect(getTentBlockReason(overdue)).toBe('미반납 (예술대학)');
    expect(getTentBlockReason({ ...overdue, damaged: true })).toBe('파손');
  });
});

describe('AdminTentTable 천막 등록', () => {
  const baseProps = {
    onDamagedChange: vi.fn(),
    onNoteChange: vi.fn(),
  };

  it('천막이 하나도 없으면 물품 수량만큼 천막 1~N을 한 번에 등록한다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onCreateTents = vi.fn().mockResolvedValue(undefined);
    render(<AdminTentTable {...baseProps} tents={[]} itemTotalQuantity={3} onCreateTents={onCreateTents} />);

    await userEvent.click(screen.getByRole('button', { name: '천막 3동 등록 (천막 1 ~ 3)' }));
    expect(onCreateTents).toHaveBeenCalledWith(['천막 1', '천막 2', '천막 3']);
  });

  it('+ 천막 추가는 가장 큰 번호 다음 번호로 등록한다 (문자열 순서가 아니라 숫자 기준)', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onCreateTents = vi.fn().mockResolvedValue(undefined);
    render(
      <AdminTentTable
        {...baseProps}
        tents={[tent({ id: 1, tentNumber: '천막 2' }), tent({ id: 2, tentNumber: '천막 10' })]}
        itemTotalQuantity={2}
        onCreateTents={onCreateTents}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: '+ 천막 추가' }));
    expect(onCreateTents).toHaveBeenCalledWith(['천막 11']);
  });

  it('확인 창에서 취소하면 등록하지 않는다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onCreateTents = vi.fn();
    render(<AdminTentTable {...baseProps} tents={[]} itemTotalQuantity={8} onCreateTents={onCreateTents} />);
    await userEvent.click(screen.getByRole('button', { name: /천막 8동 등록/ }));
    expect(onCreateTents).not.toHaveBeenCalled();
  });

  it('등록된 천막 수가 물품 목록의 수량과 다르면 알려준다 (비고는 서버 저장이라 브라우저 안내 없음)', () => {
    render(
      <AdminTentTable {...baseProps} tents={[tent()]} itemTotalQuantity={8} onCreateTents={vi.fn()} />,
    );
    expect(screen.getByText(/물품 목록의 천막 수량 8개와 다릅니다/)).toBeInTheDocument();
    expect(screen.queryByText(/이 브라우저에만 저장/)).not.toBeInTheDocument();
  });
});

describe('AdminTentTable 대여 가능 여부', () => {
  it('파손이거나 지금 나가 있으면(대여중/연체) 불가, 사유는 툴팁으로', () => {
    render(
      <AdminTentTable
        tents={[
          tent({ id: 1, tentNumber: '천막 1' }),
          tent({ id: 2, tentNumber: '천막 2', damaged: true }),
          tent({
            id: 3,
            tentNumber: '천막 3',
            rentals: [rental({ status: 'RENTED', departmentName: '학생복지위원회' })],
          }),
          tent({
            id: 4,
            tentNumber: '천막 4',
            rentals: [rental({ status: 'OVERDUE', departmentName: '예술대학' })],
          }),
          tent({
            id: 5,
            tentNumber: '천막 5',
            rentals: [rental({ status: 'RETURNED', departmentName: '경영대학' })],
          }),
        ]}
        itemTotalQuantity={5}
        onDamagedChange={vi.fn()}
        onNoteChange={vi.fn()}
        onCreateTents={vi.fn()}
      />,
    );

    const availabilityOf = (tentNumber: string) => {
      const row = screen.getByText(tentNumber).closest('[class*="h-[56px]"]') as HTMLElement;
      return Array.from(row.querySelectorAll('span')).find(
        (el) => el.textContent === '가능' || el.textContent === '불가',
      ) as HTMLElement;
    };

    expect(availabilityOf('천막 1')).toHaveTextContent('가능');
    expect(availabilityOf('천막 2')).toHaveTextContent('불가');
    expect(availabilityOf('천막 2')).toHaveAttribute('title', '파손');
    expect(availabilityOf('천막 3')).toHaveTextContent('불가');
    expect(availabilityOf('천막 3')).toHaveAttribute('title', '대여중 (학생복지위원회)');
    expect(availabilityOf('천막 4')).toHaveAttribute('title', '미반납 (예술대학)');
    // 반납된 천막은 다시 가능
    expect(availabilityOf('천막 5')).toHaveTextContent('가능');
  });
});

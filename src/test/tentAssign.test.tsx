// 관리자 대시보드: 천막 품목 예약 -> 대여중 변경 시 천막 지정 팝업 흐름 테스트
// 실제 백엔드 대신 API 모듈을 모킹해서, 어떤 요청이 어떤 순서로 나가는지 검증한다.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../features/Admin/AdminDashboard';
import type { Tent } from '../api/tent/types';

const mocks = vi.hoisted(() => ({
  getRentals: vi.fn(),
  getRentalDetail: vi.fn(),
  updateRental: vi.fn(),
  put: vi.fn(),
  getTents: vi.fn(),
}));

// 로그인/레이아웃 컴포넌트는 이 테스트와 무관
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/Admin/AdminItemEditModal', () => ({ default: () => null }));

vi.mock('../services/rentalApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/rentalApi')>()),
  getRentals: mocks.getRentals,
}));
vi.mock('../services/plotterApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/plotterApi')>()),
  getPlotterOrders: vi.fn().mockResolvedValue([]),
}));
vi.mock('../services/commonApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/commonApi')>()),
  getCommonMetadata: vi.fn().mockResolvedValue({}),
}));
vi.mock('../api/rental/rentalApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/rental/rentalApi')>()),
  getCategories: vi.fn().mockResolvedValue([]),
  getItems: vi.fn().mockResolvedValue([]),
  getRentalDetail: mocks.getRentalDetail,
  updateRental: mocks.updateRental,
}));
vi.mock('../api/tent/tentApi', () => ({
  getTents: mocks.getTents,
  getTentItem: vi.fn().mockResolvedValue({ id: 1, totalQuantity: 8 }),
  updateTent: vi.fn().mockResolvedValue(undefined),
  createTent: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../api/axiosInstance', () => ({
  default: { put: mocks.put, get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

/**
 * 천막 8동: 1·3번 파손, 2번은 경영대학에 대여중 -> 선택 가능은 4~8번 (5동)
 */
const tentFixtures = (): Tent[] =>
  Array.from({ length: 8 }, (_, i) => {
    const id = i + 1;
    return {
      id,
      tentNumber: `천막 ${id}`,
      damaged: id === 1 || id === 3,
      note: '',
      rentals:
        id === 2
          ? [
              {
                rentalId: 400,
                rentalItemId: 401,
                status: 'RENTED',
                startDate: '2026-09-05T12:00:00Z',
                endDate: '2026-09-12T12:00:00Z',
                departmentName: '경영대학',
              },
            ]
          : [],
    };
  });

type Item = { id: number; itemId: number; name: string; quantity: number; status: string };

/** 테스트용 대여 건. 날짜는 UTC 정오로 넣어 어느 타임존에서 돌려도 날짜가 밀리지 않게 함 */
const makeRental = (id: number, items: Item[], memo = '') => ({
  id,
  userId: 'u1',
  startDate: '2026-10-05T12:00:00Z',
  endDate: '2026-10-07T12:00:00Z',
  status: 'RESERVED',
  memo,
  departmentType: '학과',
  departmentName: '교육공학과 학생회',
  createdAt: '2026-09-01T00:00:00Z',
  user: { name: '홍길동', studentId: '2020123456', phoneNumber: '010-0000-0000' },
  rentalItems: items.map((it) => ({
    id: it.id,
    rentalId: id,
    itemId: it.itemId,
    quantity: it.quantity,
    status: it.status,
    instanceId: null,
    item: { id: it.itemId, name: it.name },
  })),
});

const renderDashboard = async (rental: ReturnType<typeof makeRental>) => {
  mocks.getRentals.mockResolvedValue({ rentals: [rental] });
  mocks.getRentalDetail.mockResolvedValue(rental);
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>,
  );
  await screen.findAllByText('R-' + rental.id);
};

/** 데스크톱 표에서 품목명이 정확히 일치하는 행 */
const getRow = (itemName: string) => {
  const cell = screen
    .getAllByText(itemName, { exact: true })
    .find((el) => el.closest('div.h-\\[52px\\]'));
  if (!cell) throw new Error(`row not found: ${itemName}`);
  return cell.closest('div.h-\\[52px\\]') as HTMLElement;
};

/** 행의 상태 배지 -> 드롭다운에서 새 상태 선택 */
const changeStatus = async (itemName: string, statusText: string) => {
  const row = getRow(itemName);
  const badgeBtn = within(row)
    .getAllByRole('button')
    .find((b) => b.textContent === '예약');
  await userEvent.click(badgeBtn!);
  const dropdown = document.body.querySelector('div[style*="z-index: 9999"]') as HTMLElement;
  await userEvent.click(within(dropdown).getByText(statusText));
};

/** 팝업이 열리고 천막 목록까지 불러온 상태 */
const openedDialog = async () => {
  const dialog = await screen.findByRole('dialog');
  await within(dialog).findByText('천막 8');
  return dialog;
};

const enabledCheckboxes = (dialog: HTMLElement) =>
  within(dialog)
    .getAllByRole('checkbox')
    .filter((cb) => !(cb as HTMLInputElement).disabled);

let alertSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  mocks.put.mockResolvedValue({ data: {} });
  mocks.updateRental.mockResolvedValue({ rentals: [] });
  mocks.getTents.mockImplementation(async () => tentFixtures());
});

describe('천막 예약 -> 대여중 변경', () => {
  it('파손·대여중 천막은 사유와 함께 잠기고, 나머지만 고를 수 있다', async () => {
    await renderDashboard(
      makeRental(510, [{ id: 91, itemId: 1, name: '천막', quantity: 1, status: 'RESERVED' }]),
    );
    await changeStatus('천막', '대여 중');
    const dialog = await openedDialog();

    const rowOf = (n: number) => within(dialog).getByText(`천막 ${n}`).closest('li') as HTMLElement;
    expect(within(rowOf(1)).getByText('파손')).toBeInTheDocument();
    expect(within(rowOf(2)).getByText('대여중 (경영대학)')).toBeInTheDocument();
    expect(within(rowOf(3)).getByText('파손')).toBeInTheDocument();
    expect(within(rowOf(4)).getByText('가능')).toBeInTheDocument();
    expect(enabledCheckboxes(dialog)).toHaveLength(5);
  });

  it('천막을 적게 내보내면: 예약 품목 전체를 수량만 바꿔 수정 -> 새 천막 품목 ID로 대여중 변경 + 메모에 천막 기록', async () => {
    const rental = makeRental(500, [
      { id: 11, itemId: 1, name: '천막', quantity: 3, status: 'RESERVED' },
      { id: 12, itemId: 3, name: '빔프로젝터', quantity: 1, status: 'RESERVED' },
      { id: 13, itemId: 8, name: '천막용 LED등', quantity: 2, status: 'RENTED' },
    ]);
    await renderDashboard(rental);

    // 수정 후 서버는 예약 품목을 새 ID로 다시 만든다
    const recreated = makeRental(500, [
      { id: 21, itemId: 1, name: '천막', quantity: 2, status: 'RESERVED' },
      { id: 22, itemId: 3, name: '빔프로젝터', quantity: 1, status: 'RESERVED' },
      { id: 13, itemId: 8, name: '천막용 LED등', quantity: 2, status: 'RENTED' },
    ]);
    mocks.getRentalDetail.mockResolvedValueOnce(rental).mockResolvedValueOnce(recreated);

    await changeStatus('천막', '대여 중');

    // 팝업이 뜨고, 아직 아무 요청도 나가지 않음
    const dialog = await openedDialog();
    expect(mocks.put).not.toHaveBeenCalled();
    expect(within(dialog).getByText('3동')).toBeInTheDocument();

    // 3동 -> 2동으로 줄이고 천막 4·5 선택 후 확정
    await userEvent.click(within(dialog).getByLabelText('내보낼 천막 수 줄이기'));
    expect(within(dialog).getByText(/확정하면 대여\s*기록의 천막 수량도/)).toBeInTheDocument();
    const [tent4, tent5] = enabledCheckboxes(dialog);
    await userEvent.click(tent4);
    await userEvent.click(tent5);
    await userEvent.click(within(dialog).getByRole('button', { name: '2동 대여 처리' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // 1) 예약 품목(천막, 빔프로젝터)만 전부 보내고 천막 수량만 2로. 이미 대여중인 LED등은 제외
    expect(mocks.updateRental).toHaveBeenCalledTimes(1);
    expect(mocks.updateRental).toHaveBeenCalledWith(
      500,
      {
        departmentType: '학과',
        departmentName: '교육공학과 학생회',
        items: [
          { itemId: 1, quantity: 2, startDate: '2026-10-05', endDate: '2026-10-07' },
          { itemId: 3, quantity: 1, startDate: '2026-10-05', endDate: '2026-10-07' },
        ],
      },
      true,
    );

    // 2) 새로 만들어진 천막 품목(21)을 대여중으로 + 고른 천막(4, 5)을 메모에 기록 (한 요청)
    expect(mocks.put).toHaveBeenCalledTimes(1);
    expect(mocks.put).toHaveBeenCalledWith('/api/rentals/500/status', {
      status: 'RENTED',
      memo: '[대여 천막: 천막 4, 천막 5]',
      rentalItemId: 21,
    });

    // 수량 수정이 상태 변경보다 먼저
    expect(mocks.updateRental.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.put.mock.invocationCallOrder[0],
    );

    // 품목 ID가 바뀌었으므로 목록 재조회 + 안내
    await waitFor(() => expect(mocks.getRentals).toHaveBeenCalledTimes(2));
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('3동 → 2동'));
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('천막 4, 천막 5'));
  });

  it('신청 수량대로 내보내면: 수량 수정 없이 기존 품목 ID로 대여중 변경, 기존 메모는 살리고 천막만 덧붙임', async () => {
    await renderDashboard(
      makeRental(
        501,
        [{ id: 31, itemId: 1, name: '천막', quantity: 2, status: 'RESERVED' }],
        '오전 10시 수령',
      ),
    );

    await changeStatus('천막', '대여 중');
    const dialog = await openedDialog();
    const boxes = enabledCheckboxes(dialog);
    await userEvent.click(boxes[1]); // 천막 5
    await userEvent.click(boxes[3]); // 천막 7
    await userEvent.click(within(dialog).getByRole('button', { name: '2동 대여 처리' }));

    await waitFor(() => expect(mocks.put).toHaveBeenCalledTimes(1));
    expect(mocks.updateRental).not.toHaveBeenCalled();
    expect(mocks.put).toHaveBeenCalledWith('/api/rentals/501/status', {
      status: 'RENTED',
      memo: '오전 10시 수령 [대여 천막: 천막 5, 천막 7]',
      rentalItemId: 31,
    });
  });

  it('서버가 거부하면 팝업에 사유를 보여주고 다시 시도할 수 있다', async () => {
    await renderDashboard(
      makeRental(506, [{ id: 36, itemId: 1, name: '천막', quantity: 1, status: 'RESERVED' }]),
    );
    mocks.put.mockRejectedValueOnce({
      response: { data: { message: '대여 건을 찾을 수 없습니다.' } },
    });

    await changeStatus('천막', '대여 중');
    const dialog = await openedDialog();
    await userEvent.click(enabledCheckboxes(dialog)[0]);
    await userEvent.click(within(dialog).getByRole('button', { name: '1동 대여 처리' }));

    expect(await within(dialog).findByText('대여 건을 찾을 수 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mocks.updateRental).not.toHaveBeenCalled();
  });

  it('팝업에서 취소하면 아무 요청도 나가지 않는다', async () => {
    await renderDashboard(
      makeRental(502, [{ id: 41, itemId: 1, name: '천막', quantity: 1, status: 'RESERVED' }]),
    );

    await changeStatus('천막', '대여 중');
    const dialog = await openedDialog();
    await userEvent.click(within(dialog).getByRole('button', { name: '취소' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mocks.put).not.toHaveBeenCalled();
    expect(mocks.updateRental).not.toHaveBeenCalled();
  });

  it('수량은 줄었는데 대여중 변경이 실패하면: 팝업을 닫고 목록 재조회 + 안내', async () => {
    const rental = makeRental(503, [
      { id: 51, itemId: 1, name: '천막', quantity: 2, status: 'RESERVED' },
    ]);
    await renderDashboard(rental);
    const recreated = makeRental(503, [
      { id: 61, itemId: 1, name: '천막', quantity: 1, status: 'RESERVED' },
    ]);
    mocks.getRentalDetail.mockResolvedValueOnce(rental).mockResolvedValueOnce(recreated);
    mocks.put.mockRejectedValueOnce(new Error('network'));

    await changeStatus('천막', '대여 중');
    const dialog = await openedDialog();
    await userEvent.click(within(dialog).getByLabelText('내보낼 천막 수 줄이기'));
    await userEvent.click(enabledCheckboxes(dialog)[0]);
    await userEvent.click(within(dialog).getByRole('button', { name: '1동 대여 처리' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mocks.updateRental).toHaveBeenCalledTimes(1);
    expect(mocks.put).toHaveBeenCalledWith(
      '/api/rentals/503/status',
      expect.objectContaining({ rentalItemId: 61, memo: '[대여 천막: 천막 4]' }),
    );
    await waitFor(() => expect(mocks.getRentals).toHaveBeenCalledTimes(2));
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('줄였지만, 대여중 변경에는 실패'));
  });

  it("'천막용 LED등'은 천막으로 보지 않는다 (팝업 없이 바로 변경, 메모도 그대로)", async () => {
    await renderDashboard(
      makeRental(504, [{ id: 71, itemId: 8, name: '천막용 LED등', quantity: 1, status: 'RESERVED' }]),
    );

    await changeStatus('천막용 LED등', '대여 중');

    await waitFor(() => expect(mocks.put).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.put).toHaveBeenCalledWith('/api/rentals/504/status', {
      status: 'RENTED',
      memo: '',
      rentalItemId: 71,
    });
  });

  it('일괄 처리로 천막을 대여중으로 바꾸려 하면 막고 안내한다', async () => {
    await renderDashboard(
      makeRental(505, [{ id: 81, itemId: 1, name: '천막', quantity: 1, status: 'RESERVED' }]),
    );

    await userEvent.click(within(getRow('천막')).getByRole('checkbox'));
    // 일괄 상태 기본값이 '대여중'
    await userEvent.click(screen.getByRole('button', { name: '일괄 적용' }));

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('개별로 변경해주세요'));
    expect(mocks.put).not.toHaveBeenCalled();
  });
});

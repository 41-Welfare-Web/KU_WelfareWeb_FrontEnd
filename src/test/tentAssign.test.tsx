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
      fabric: 'NORMAL' as const,
      frame: 'NORMAL' as const,
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

type Item = {
  id: number;
  itemId: number;
  name: string;
  quantity: number;
  status: string;
  /** 서버가 돌려주는 출고 실물 번호 */
  assigned?: string[];
};

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
    assignments: (it.assigned ?? []).map((serialNumber, i) => ({
      itemInstance: { id: i + 1, serialNumber },
    })),
  })),
});

const renderDashboard = async (rental: ReturnType<typeof makeRental>) => {
  mocks.getRentals.mockResolvedValue({ rentals: [rental] });
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

  it('천막을 적게 내보내면: 한 요청으로 대여중 변경 + 고른 천막 전송 (수량 조정은 서버가 같은 트랜잭션에서)', async () => {
    await renderDashboard(
      makeRental(500, [
        { id: 11, itemId: 1, name: '천막', quantity: 3, status: 'RESERVED' },
        { id: 12, itemId: 3, name: '빔프로젝터', quantity: 1, status: 'RESERVED' },
        { id: 13, itemId: 8, name: '천막용 LED등', quantity: 2, status: 'RENTED' },
      ]),
    );

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

    // 요청은 딱 한 번: 기존 천막 품목(11)을 대여중으로 + 내보낸 천막 ID. 메모는 건드리지 않음
    expect(mocks.put).toHaveBeenCalledTimes(1);
    expect(mocks.put).toHaveBeenCalledWith('/api/rentals/500/status', {
      status: 'RENTED',
      memo: '',
      rentalItemId: 11,
      instanceIds: [4, 5],
    });

    // 품목 ID가 그대로라 목록 재조회 없이 화면만 갱신: 수량 2개 + 내보낸 천막 번호 표시
    expect(mocks.getRentals).toHaveBeenCalledTimes(1);
    expect(getRow('천막 [천막 4, 천막 5]')).toHaveTextContent('2개');
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('3동 → 2동'));
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('천막 4, 천막 5'));
  });

  it('신청 수량대로 내보내면: 기존 품목 ID로 대여중 변경, 기존 메모는 그대로', async () => {
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
    expect(mocks.put).toHaveBeenCalledWith('/api/rentals/501/status', {
      status: 'RENTED',
      memo: '오전 10시 수령',
      rentalItemId: 31,
      instanceIds: [5, 7],
    });
    expect(alertSpy).toHaveBeenCalledWith(expect.not.stringContaining('→'));
  });

  it('서버가 거부하면 팝업에 사유를 보여주고 다시 시도할 수 있다', async () => {
    await renderDashboard(
      makeRental(506, [{ id: 36, itemId: 1, name: '천막', quantity: 1, status: 'RESERVED' }]),
    );
    mocks.put.mockRejectedValueOnce({
      response: { status: 404, data: { message: '대여 건을 찾을 수 없습니다.' } },
    });

    await changeStatus('천막', '대여 중');
    const dialog = await openedDialog();
    await userEvent.click(enabledCheckboxes(dialog)[0]);
    await userEvent.click(within(dialog).getByRole('button', { name: '1동 대여 처리' }));

    expect(await within(dialog).findByText('대여 건을 찾을 수 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // 409가 아니면 목록을 다시 부르지 않음
    expect(mocks.getTents).toHaveBeenCalledTimes(1);
  });

  it('다른 관리자가 먼저 가져가면(409): 사유 표시 + 최신 현황으로 다시 그리고 그 천막은 선택 해제', async () => {
    await renderDashboard(
      makeRental(507, [{ id: 37, itemId: 1, name: '천막', quantity: 1, status: 'RESERVED' }]),
    );
    mocks.put.mockRejectedValueOnce({
      response: {
        status: 409,
        data: { message: '다른 대여 건이 이미 사용 중인 실물입니다: 천막 4(R-999)' },
      },
    });

    await changeStatus('천막', '대여 중');
    const dialog = await openedDialog();

    // 팝업을 연 뒤 다른 관리자가 천막 4를 내보낸 상황
    mocks.getTents.mockImplementation(async () =>
      tentFixtures().map((t) =>
        t.id === 4
          ? {
              ...t,
              rentals: [
                {
                  rentalId: 999,
                  rentalItemId: 998,
                  status: 'RENTED' as const,
                  startDate: '2026-09-05T12:00:00Z',
                  endDate: '2026-09-12T12:00:00Z',
                  departmentName: '공과대학',
                },
              ],
            }
          : t,
      ),
    );

    await userEvent.click(enabledCheckboxes(dialog)[0]); // 천막 4
    await userEvent.click(within(dialog).getByRole('button', { name: '1동 대여 처리' }));

    expect(
      await within(dialog).findByText(/이미 사용 중인 실물입니다: 천막 4/),
    ).toBeInTheDocument();
    const row4 = within(dialog).getByText('천막 4').closest('li') as HTMLElement;
    expect(await within(row4).findByText('대여중 (공과대학)')).toBeInTheDocument();
    expect(within(dialog).getByText('0 / 1 선택')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('요청이 실패해도 반쯤 반영되는 일이 없어, 팝업에서 그대로 다시 시도할 수 있다', async () => {
    await renderDashboard(
      makeRental(503, [{ id: 51, itemId: 1, name: '천막', quantity: 2, status: 'RESERVED' }]),
    );
    mocks.put.mockRejectedValueOnce(new Error('network'));

    await changeStatus('천막', '대여 중');
    const dialog = await openedDialog();
    await userEvent.click(within(dialog).getByLabelText('내보낼 천막 수 줄이기'));
    await userEvent.click(enabledCheckboxes(dialog)[0]);
    await userEvent.click(within(dialog).getByRole('button', { name: '1동 대여 처리' }));

    expect(await within(dialog).findByText('network')).toBeInTheDocument();

    // 같은 품목 ID로 재시도
    await userEvent.click(within(dialog).getByRole('button', { name: '1동 대여 처리' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mocks.put).toHaveBeenCalledTimes(2);
    expect(mocks.put).toHaveBeenLastCalledWith('/api/rentals/503/status', {
      status: 'RENTED',
      memo: '',
      rentalItemId: 51,
      instanceIds: [4],
    });
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
  });

  it("'천막용 LED등'은 천막으로 보지 않는다 (팝업 없이 바로 변경, 실물 지정 없음)", async () => {
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

describe('대여 목록의 출고 천막 표시', () => {
  it('서버가 준 출고 기록이 있으면 품목명 옆에 천막 번호를 보여준다', async () => {
    await renderDashboard(
      makeRental(508, [
        {
          id: 88,
          itemId: 1,
          name: '천막',
          quantity: 2,
          status: 'RENTED',
          assigned: ['천막 3', '천막 8'],
        },
        { id: 89, itemId: 3, name: '빔프로젝터', quantity: 1, status: 'RENTED' },
      ]),
    );

    expect(getRow('천막 [천막 3, 천막 8]')).toHaveTextContent('2개');
    // 출고 기록이 없는 품목은 이름 그대로
    expect(getRow('빔프로젝터')).toBeInTheDocument();
  });
});

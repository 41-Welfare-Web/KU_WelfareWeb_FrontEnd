// 관리자 휴무일 관리: 기간 일괄 등록 / 월 단위·단일 삭제 / 주말 제외 안내
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminHolidayPanel from '../components/Admin/AdminHolidayPanel';

const mocks = vi.hoisted(() => ({
  getHolidays: vi.fn(),
  createHolidayRange: vi.fn(),
  deleteHoliday: vi.fn(),
  deleteHolidayRange: vi.fn(),
}));

vi.mock('../api/admin/holidayApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/admin/holidayApi')>()),
  getHolidays: mocks.getHolidays,
  createHolidayRange: mocks.createHolidayRange,
  deleteHoliday: mocks.deleteHoliday,
  deleteHolidayRange: mocks.deleteHolidayRange,
}));

const holiday = (id: number, dateKey: string, description = '대여 휴무 기간') => ({
  id,
  holidayDate: `${dateKey}T00:00:00.000Z`,
  description,
});

let alertSpy: ReturnType<typeof vi.spyOn>;
let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  vi.clearAllMocks();
  // 오늘을 2026-11-20으로 고정 — "앞으로 예정된 휴무일" 필터가 오늘 날짜에 의존하므로
  // 고정하지 않으면 11/30이 지난 뒤 테스트가 깨진다
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-11-20T09:00:00+09:00'));
  user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  mocks.getHolidays.mockResolvedValue([
    holiday(1, '2026-11-30'),
    holiday(2, '2026-12-01'),
    holiday(3, '2026-12-25', '크리스마스'),
    holiday(4, '2026-10-13', '중간고사 기간'), // 지난 휴무일
    // 실제 오늘이 아니라 고정한 2026-11-20 기준으로 '지난 날'이어야 한다 (시계 고정 검증)
    holiday(5, '2026-11-10', '지난 휴무'),
  ]);
  mocks.createHolidayRange.mockResolvedValue({
    message: 'ok',
    created: 5,
    alreadyRegistered: 1,
    weekendsSkipped: 2,
    dates: [],
  });
  mocks.deleteHoliday.mockResolvedValue(undefined);
  mocks.deleteHolidayRange.mockResolvedValue({ message: 'ok', deleted: 2 });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('휴무일 관리 패널', () => {
  it('앞으로 예정된 휴무일만 월별로 보여준다', async () => {
    render(<AdminHolidayPanel />);

    expect(await screen.findByText('2026년 11월')).toBeInTheDocument();
    expect(screen.getByText('2026년 12월')).toBeInTheDocument();
    // 지난 10월은 기본으로 숨김
    expect(screen.queryByText('2026년 10월')).not.toBeInTheDocument();
    expect(screen.getByText(/2026-11-30 \(월\)/)).toBeInTheDocument();
    expect(screen.getByText('크리스마스')).toBeInTheDocument();
    // 시계가 2026-11-20으로 고정됐다면 11/10은 지난 날이라 숨겨진다
    expect(screen.queryByText(/2026-11-10/)).not.toBeInTheDocument();
  });

  it('지난 휴무일 보기를 누르면 과거도 나온다', async () => {
    render(<AdminHolidayPanel />);
    await screen.findByText('2026년 11월');

    await user.click(screen.getByRole('button', { name: '지난 휴무일 보기' }));
    expect(screen.getByText('2026년 10월')).toBeInTheDocument();
  });

  it('기간을 넣으면 등록될 평일 수를 미리 알려준다 (주말 제외)', async () => {
    render(<AdminHolidayPanel />);
    await screen.findByText('2026년 11월');

    // 2026-11-30(월) ~ 2026-12-06(일) → 평일 5일
    await user.type(screen.getByLabelText('시작일'), '2026-11-30');
    await user.type(screen.getByLabelText('종료일'), '2026-12-06');

    expect(screen.getByText('평일 5일이 등록됩니다.')).toBeInTheDocument();
  });

  it('기간 등록을 하면 시작일·종료일·사유를 그대로 보낸다', async () => {
    render(<AdminHolidayPanel />);
    await screen.findByText('2026년 11월');

    await user.type(screen.getByLabelText('시작일'), '2026-11-30');
    await user.type(screen.getByLabelText('종료일'), '2026-12-04');
    await user.type(
      screen.getByPlaceholderText('예: 겨울방학 대여 휴무'),
      '겨울방학 대여 휴무',
    );
    await user.click(screen.getByRole('button', { name: '등록' }));

    await waitFor(() => expect(mocks.createHolidayRange).toHaveBeenCalledTimes(1));
    expect(mocks.createHolidayRange).toHaveBeenCalledWith({
      startDate: '2026-11-30',
      endDate: '2026-12-04',
      description: '겨울방학 대여 휴무',
    });
    // 결과를 사람이 읽을 수 있게 알려준다
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('5일을 등록했습니다'));
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('건너뜀: 1일'));
  });

  it('종료일이 시작일보다 빠르면 등록 버튼이 막힌다', async () => {
    render(<AdminHolidayPanel />);
    await screen.findByText('2026년 11월');

    await user.type(screen.getByLabelText('시작일'), '2026-12-10');
    await user.type(screen.getByLabelText('종료일'), '2026-12-01');

    expect(screen.getByText('종료일이 시작일보다 빠릅니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '등록' })).toBeDisabled();
    expect(mocks.createHolidayRange).not.toHaveBeenCalled();
  });

  it('× 버튼으로 하루만 삭제한다', async () => {
    render(<AdminHolidayPanel />);
    await screen.findByText('2026년 11월');

    await user.click(
      screen.getByRole('button', { name: '2026-11-30 휴무일 삭제' }),
    );

    await waitFor(() => expect(mocks.deleteHoliday).toHaveBeenCalledWith(1));
  });

  it('이 달 전체 삭제는 그 달의 첫날~말일 범위로 요청한다', async () => {
    render(<AdminHolidayPanel />);
    const header = (await screen.findByText('2026년 12월')).closest('div')!;

    await user.click(
      within(header.parentElement as HTMLElement).getByRole('button', {
        name: '이 달 전체 삭제',
      }),
    );

    await waitFor(() =>
      expect(mocks.deleteHolidayRange).toHaveBeenCalledWith('2026-12-01', '2026-12-31'),
    );
  });

  it('서버가 거부하면 사유를 보여준다', async () => {
    mocks.createHolidayRange.mockRejectedValueOnce({
      response: { data: { message: '한 번에 처리할 수 있는 기간은 최대 366일입니다.' } },
    });
    render(<AdminHolidayPanel />);
    await screen.findByText('2026년 11월');

    await user.type(screen.getByLabelText('시작일'), '2026-11-30');
    await user.type(screen.getByLabelText('종료일'), '2026-12-04');
    await user.click(screen.getByRole('button', { name: '등록' }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('최대 366일')),
    );
  });
});

// 관리자 패널 컴포넌트 버튼 동작 단위 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import AdminDashboardHeader from '../components/Admin/AdminDashboardHeader';
import AdminTabNavigation from '../components/Admin/AdminTabNavigation';
import AdminFilterBar from '../components/Admin/AdminFilterBar';
import AdminPlotterFilterBar from '../components/Admin/AdminPlotterFilterBar';
import AdminItemsFilterBar from '../components/Admin/AdminItemsFilterBar';
import AdminRentalRow from '../components/Admin/AdminRentalRow';
import RentalDetailModal from '../components/Admin/RentalDetailModal';
import AdminItemCard from '../components/Admin/AdminItemCard';

// useNavigate 모킹 (RentalDetailModal 내부에서 사용) — 나머지 export는 실제 모듈 유지
const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// AdminItemCard가 렌더링하는 수정 모달은 API 호출이 있으므로 통째로 모킹
vi.mock('../components/Admin/AdminItemEditModal', () => ({
  default: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
  // jsdom은 window.scrollTo 미구현 → useLockBodyScroll 정리 시 노이즈 방지
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

/* ------------------------------------------------------------------ */
/* 1. AdminDashboardHeader                                             */
/* ------------------------------------------------------------------ */
describe('AdminDashboardHeader', () => {
  it('엑셀 다운로드 버튼은 항상 렌더링되고 클릭 시 onDownload가 호출된다', async () => {
    const onDownload = vi.fn();
    render(<AdminDashboardHeader activeTab="rental" onDownload={onDownload} />);

    const button = screen.getByRole('button', { name: /엑셀 다운로드/ });
    await userEvent.click(button);
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('야간 점검 토글: OFF 라벨 표시 + 클릭 시 onToggleInspectionTime 호출', async () => {
    const onToggleInspectionTime = vi.fn();
    render(
      <AdminDashboardHeader
        activeTab="rental"
        onDownload={vi.fn()}
        inspectionTimeEnabled={false}
        onToggleInspectionTime={onToggleInspectionTime}
      />
    );

    const button = screen.getByRole('button', { name: /야간 점검 OFF/ });
    await userEvent.click(button);
    expect(onToggleInspectionTime).toHaveBeenCalledTimes(1);
  });

  it('야간 점검 토글: inspectionTimeEnabled=true이면 ON 라벨이 표시된다', () => {
    render(
      <AdminDashboardHeader
        activeTab="rental"
        onDownload={vi.fn()}
        inspectionTimeEnabled={true}
        onToggleInspectionTime={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /야간 점검 ON/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /야간 점검 OFF/ })).not.toBeInTheDocument();
  });

  it('점검 모드 토글: OFF/ON 라벨 표시 + 클릭 시 onToggleInspection 호출', async () => {
    const onToggleInspection = vi.fn();
    const { rerender } = render(
      <AdminDashboardHeader
        activeTab="rental"
        onDownload={vi.fn()}
        inspectionMode={false}
        onToggleInspection={onToggleInspection}
      />
    );

    const offButton = screen.getByRole('button', { name: /점검 모드 OFF/ });
    await userEvent.click(offButton);
    expect(onToggleInspection).toHaveBeenCalledTimes(1);

    rerender(
      <AdminDashboardHeader
        activeTab="rental"
        onDownload={vi.fn()}
        inspectionMode={true}
        onToggleInspection={onToggleInspection}
      />
    );
    expect(screen.getByRole('button', { name: /점검 모드 ON/ })).toBeInTheDocument();
  });

  it('토글 콜백을 넘기지 않으면 토글 버튼이 렌더링되지 않는다', () => {
    render(<AdminDashboardHeader activeTab="rental" onDownload={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /야간 점검/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /점검 모드/ })).not.toBeInTheDocument();
  });

  it('신규 물품 등록 버튼: items 탭에서만 렌더링되고 클릭 시 onAddItem 호출', async () => {
    const onAddItem = vi.fn();
    const { rerender } = render(
      <AdminDashboardHeader activeTab="rental" onDownload={vi.fn()} onAddItem={onAddItem} />
    );

    // rental 탭에서는 미표시
    expect(screen.queryByRole('button', { name: /신규 물품 등록/ })).not.toBeInTheDocument();

    // items 탭에서는 표시 + 클릭 동작
    rerender(
      <AdminDashboardHeader activeTab="items" onDownload={vi.fn()} onAddItem={onAddItem} />
    );
    const button = screen.getByRole('button', { name: /신규 물품 등록/ });
    await userEvent.click(button);
    expect(onAddItem).toHaveBeenCalledTimes(1);
  });
});

/* ------------------------------------------------------------------ */
/* 2. AdminTabNavigation                                               */
/* ------------------------------------------------------------------ */
describe('AdminTabNavigation', () => {
  it('탭 버튼 3개가 렌더링된다', () => {
    render(<AdminTabNavigation activeTab="rental" onTabChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '물품 대여 관리' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '플로터 인쇄 관리' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '물품 목록 관리' })).toBeInTheDocument();
  });

  it('각 탭 클릭 시 onTabChange가 해당 탭 id로 호출된다', async () => {
    const onTabChange = vi.fn();
    render(<AdminTabNavigation activeTab="rental" onTabChange={onTabChange} />);

    await userEvent.click(screen.getByRole('button', { name: '플로터 인쇄 관리' }));
    expect(onTabChange).toHaveBeenLastCalledWith('plotter');

    await userEvent.click(screen.getByRole('button', { name: '물품 목록 관리' }));
    expect(onTabChange).toHaveBeenLastCalledWith('items');

    await userEvent.click(screen.getByRole('button', { name: '물품 대여 관리' }));
    expect(onTabChange).toHaveBeenLastCalledWith('rental');
    expect(onTabChange).toHaveBeenCalledTimes(3);
  });
});

/* ------------------------------------------------------------------ */
/* 3. AdminFilterBar                                                   */
/* ------------------------------------------------------------------ */
describe('AdminFilterBar', () => {
  const defaultProps = {
    statusOptions: ['전체', '예약', '대여중'],
    selectedStatus: '전체',
    onStatusChange: vi.fn(),
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    onStartDateChange: vi.fn(),
    onEndDateChange: vi.fn(),
    searchQuery: '',
    onSearchQueryChange: vi.fn(),
    onSearch: vi.fn(),
  };

  it('상태 버튼 클릭 시 onStatusChange가 해당 상태로 호출된다', async () => {
    const onStatusChange = vi.fn();
    render(<AdminFilterBar {...defaultProps} onStatusChange={onStatusChange} />);

    await userEvent.click(screen.getByRole('button', { name: '대여중' }));
    expect(onStatusChange).toHaveBeenCalledWith('대여중');
  });

  it('날짜 입력 변경 시 onStartDateChange / onEndDateChange가 호출된다', () => {
    const onStartDateChange = vi.fn();
    const onEndDateChange = vi.fn();
    const { container } = render(
      <AdminFilterBar
        {...defaultProps}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />
    );

    const dateInputs = container.querySelectorAll('input[type="date"]');
    expect(dateInputs).toHaveLength(2);

    fireEvent.change(dateInputs[0], { target: { value: '2026-05-01' } });
    expect(onStartDateChange).toHaveBeenCalledWith('2026-05-01');

    fireEvent.change(dateInputs[1], { target: { value: '2026-06-15' } });
    expect(onEndDateChange).toHaveBeenCalledWith('2026-06-15');
  });

  it('허용 범위(2026년) 밖의 날짜는 경계값으로 보정되어 콜백에 전달된다', () => {
    const onStartDateChange = vi.fn();
    const { container } = render(
      <AdminFilterBar {...defaultProps} onStartDateChange={onStartDateChange} />
    );

    const startInput = container.querySelectorAll('input[type="date"]')[0];
    fireEvent.change(startInput, { target: { value: '2025-12-31' } });
    expect(onStartDateChange).toHaveBeenCalledWith('2026-01-01');
  });

  it('검색어 입력 시 onSearchQueryChange, 검색 버튼 클릭 시 onSearch가 호출된다', async () => {
    const onSearchQueryChange = vi.fn();
    const onSearch = vi.fn();
    render(
      <AdminFilterBar
        {...defaultProps}
        onSearchQueryChange={onSearchQueryChange}
        onSearch={onSearch}
      />
    );

    const input = screen.getByPlaceholderText('이름, 학과, 물품 검색');
    fireEvent.change(input, { target: { value: '홍길동' } });
    expect(onSearchQueryChange).toHaveBeenCalledWith('홍길동');

    await userEvent.click(screen.getByRole('button', { name: '검색' }));
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});

/* ------------------------------------------------------------------ */
/* 4-1. AdminPlotterFilterBar                                          */
/* ------------------------------------------------------------------ */
describe('AdminPlotterFilterBar', () => {
  const defaultProps = {
    statusOptions: ['전체 상태', '대기', '완료'],
    selectedStatus: '전체 상태',
    onStatusChange: vi.fn(),
    searchQuery: '',
    onSearchQueryChange: vi.fn(),
    onSearch: vi.fn(),
  };

  it('상태 드롭다운을 열고 항목 선택 시 onStatusChange가 호출되고 드롭다운이 닫힌다', async () => {
    const onStatusChange = vi.fn();
    render(<AdminPlotterFilterBar {...defaultProps} onStatusChange={onStatusChange} />);

    // 드롭다운 열기 전에는 옵션 미표시
    expect(screen.queryByRole('button', { name: '대기' })).not.toBeInTheDocument();

    // 드롭다운 토글 버튼 클릭 (현재 선택된 상태가 라벨)
    await userEvent.click(screen.getByRole('button', { name: /전체 상태/ }));

    const option = screen.getByRole('button', { name: '대기' });
    await userEvent.click(option);

    expect(onStatusChange).toHaveBeenCalledWith('대기');
    // 선택 후 드롭다운 닫힘
    expect(screen.queryByRole('button', { name: '대기' })).not.toBeInTheDocument();
  });

  it('검색어 입력 시 onSearchQueryChange, 검색 버튼 클릭 시 onSearch가 호출된다', async () => {
    const onSearchQueryChange = vi.fn();
    const onSearch = vi.fn();
    render(
      <AdminPlotterFilterBar
        {...defaultProps}
        onSearchQueryChange={onSearchQueryChange}
        onSearch={onSearch}
      />
    );

    const input = screen.getByPlaceholderText('이름, 학과, 물품 검색');
    fireEvent.change(input, { target: { value: '플로터' } });
    expect(onSearchQueryChange).toHaveBeenCalledWith('플로터');

    await userEvent.click(screen.getByRole('button', { name: '검색' }));
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});

/* ------------------------------------------------------------------ */
/* 4-2. AdminItemsFilterBar                                            */
/* ------------------------------------------------------------------ */
describe('AdminItemsFilterBar', () => {
  const defaultProps = {
    categories: ['전체', '행사', '체육'],
    selectedCategory: '전체',
    onCategoryChange: vi.fn(),
    searchQuery: '',
    onSearchQueryChange: vi.fn(),
    onSearch: vi.fn(),
  };

  it('카테고리 버튼 클릭 시 onCategoryChange가 해당 카테고리로 호출된다', async () => {
    const onCategoryChange = vi.fn();
    render(<AdminItemsFilterBar {...defaultProps} onCategoryChange={onCategoryChange} />);

    await userEvent.click(screen.getByRole('button', { name: '체육' }));
    expect(onCategoryChange).toHaveBeenCalledWith('체육');
  });

  it('검색어 입력 시 onSearchQueryChange, Enter 키 입력 시 onSearch가 호출된다', () => {
    const onSearchQueryChange = vi.fn();
    const onSearch = vi.fn();
    render(
      <AdminItemsFilterBar
        {...defaultProps}
        onSearchQueryChange={onSearchQueryChange}
        onSearch={onSearch}
      />
    );

    const input = screen.getByPlaceholderText('물품 검색');
    fireEvent.change(input, { target: { value: '천막' } });
    expect(onSearchQueryChange).toHaveBeenCalledWith('천막');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});

/* ------------------------------------------------------------------ */
/* 5. AdminRentalRow                                                   */
/* ------------------------------------------------------------------ */
describe('AdminRentalRow', () => {
  const defaultProps = {
    rentalId: 1,
    rentalItemId: 10,
    rentalCode: 'R-001',
    userName: '홍길동',
    department: '컴퓨터공학과',
    itemName: '천막',
    quantity: 2,
    startDate: '2026-07-01',
    endDate: '2026-07-03',
    status: 'reserved' as const,
    note: '기존 메모',
    onSave: vi.fn(),
  };

  // useNavigate를 쓰는 하위 컴포넌트(RentalDetailModal)가 있으므로 MemoryRouter로 감싼다
  const renderRow = (props = {}) =>
    render(
      <MemoryRouter>
        <AdminRentalRow {...defaultProps} {...props} />
      </MemoryRouter>
    );

  it('체크박스 클릭 시 onCheck가 호출된다', async () => {
    const onCheck = vi.fn();
    renderRow({ onCheck });

    // 모바일/데스크톱 뷰가 모두 DOM에 있으므로 첫 번째 체크박스 사용
    const checkbox = screen.getAllByRole('checkbox')[0];
    await userEvent.click(checkbox);
    expect(onCheck).toHaveBeenCalledWith(true);
  });

  it('대여 코드 클릭 시 onSelectGroup이 호출된다', async () => {
    const onSelectGroup = vi.fn();
    renderRow({ onSelectGroup });

    // 데스크톱 뷰의 대여 코드 span (모바일에도 동일 텍스트가 있으므로 hover:underline 클래스를 가진 요소 선택)
    const codeElements = screen.getAllByText('R-001');
    const desktopCode = codeElements.find((el) => el.className.includes('hover:underline'))!;
    await userEvent.click(desktopCode);
    expect(onSelectGroup).toHaveBeenCalledTimes(1);
  });

  it('상태 배지 클릭 → 드롭다운 열림 → 상태 선택 시 onSave가 호출된다', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderRow({ onSave });

    // 드롭다운 열기 전에는 다른 상태 옵션이 없음
    expect(screen.queryByRole('button', { name: '정상 반납' })).not.toBeInTheDocument();

    // 상태 배지 버튼 클릭 (reserved → 배지 텍스트 '예약')
    await userEvent.click(screen.getByRole('button', { name: '예약' }));

    // 드롭다운(포털)에 상태 옵션들이 표시됨
    expect(screen.getByRole('button', { name: '불량 반납' })).toBeInTheDocument();

    // '정상 반납' 선택 → onSave({status, memo, rentalItemId})
    await userEvent.click(screen.getByRole('button', { name: '정상 반납' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        status: 'returned',
        memo: '기존 메모',
        rentalItemId: 10,
      })
    );
  });

  it('연필(수정) 아이콘 클릭 시 RentalDetailModal이 열린다', async () => {
    renderRow();

    // 모달 열기 전에는 미표시
    expect(screen.queryByText('예약/대여 상세 관리')).not.toBeInTheDocument();

    // 데스크톱 뷰의 수정 버튼 (aria-label="상세 관리", 모바일/데스크톱 2개 중 두 번째)
    const editButtons = screen.getAllByRole('button', { name: '상세 관리' });
    await userEvent.click(editButtons[editButtons.length - 1]);

    expect(screen.getByText('예약/대여 상세 관리')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/* 6. RentalDetailModal                                                */
/* ------------------------------------------------------------------ */
describe('RentalDetailModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    rentalId: 7,
    rentalItemId: 10,
    rentalCode: 'R-007',
    userName: '홍길동',
    department: '컴퓨터공학과',
    itemName: '천막',
    startDate: '2026-07-01',
    endDate: '2026-07-03',
    status: 'reserved' as const,
    note: '기존 메모',
    onSave: vi.fn(),
  };

  const renderModal = (props = {}) =>
    render(
      <MemoryRouter>
        <RentalDetailModal {...defaultProps} {...props} />
      </MemoryRouter>
    );

  it('상태 select 변경이 화면에 반영된다', async () => {
    renderModal();

    // createPortal로 body에 렌더링되지만 screen 쿼리는 document.body 기준이므로 그대로 조회 가능
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('reserved');

    await userEvent.selectOptions(select, 'returned');
    expect(select.value).toBe('returned');
  });

  it('저장하기 클릭 시 onSave({status, memo})가 호출되고 성공하면 onClose가 호출된다', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    renderModal({ onSave, onClose });

    // 상태와 메모 변경
    await userEvent.selectOptions(screen.getByRole('combobox'), 'renting');
    const textarea = screen.getByPlaceholderText('추가 메모를 입력하세요');
    fireEvent.change(textarea, { target: { value: '새 메모' } });

    await userEvent.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => {
      // 모달은 API를 직접 호출하지 않고 onSave 콜백만 호출한다
      expect(onSave).toHaveBeenCalledWith({ status: 'renting', memo: '새 메모' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('onSave가 실패하면 에러 메시지가 표시되고 onClose는 호출되지 않는다', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('저장 실패 테스트'));
    const onClose = vi.fn();
    renderModal({ onSave, onClose });

    await userEvent.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => {
      expect(screen.getByText('저장 실패 테스트')).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('수정 버튼 클릭 시 navigate가 편집 경로로 호출된다', async () => {
    renderModal();

    await userEvent.click(screen.getByRole('button', { name: '수정' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      '/rental/cart?editRentalId=7',
      expect.objectContaining({
        state: expect.objectContaining({
          rentalCode: 'R-007',
          isEditFromAdmin: true,
        }),
      })
    );
  });

  it('isOpen이 false이면 모달이 렌더링되지 않는다', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText('예약/대여 상세 관리')).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/* 7. AdminItemCard                                                    */
/* ------------------------------------------------------------------ */
describe('AdminItemCard', () => {
  const defaultProps = {
    id: 3,
    name: '천막',
    category: '행사',
    description: '대형 천막입니다',
    quantity: 13,
  };

  it('수정 버튼 클릭 시 onEdit이 id와 함께 호출된다', async () => {
    const onEdit = vi.fn();
    render(<AdminItemCard {...defaultProps} onEdit={onEdit} />);

    await userEvent.click(screen.getByRole('button', { name: '수정' }));
    expect(onEdit).toHaveBeenCalledWith(3);
  });

  it('삭제 버튼 클릭 시 onDelete가 id와 함께 호출된다', async () => {
    const onDelete = vi.fn();
    render(<AdminItemCard {...defaultProps} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onDelete).toHaveBeenCalledWith(3);
  });

  it('onDelete를 넘기지 않으면 삭제 버튼이 렌더링되지 않는다', () => {
    render(<AdminItemCard {...defaultProps} />);
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
  });
});

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import RentalStatusBadge from '../MyPage/RentalStatusBadge';
import { updateRentalStatus } from '../../services/rentalApi';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

interface RentalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: number;
  rentalCode: string;
  userName: string;
  department: string;
  itemName: string;
  startDate: string;
  endDate: string;
  status: 'reserved' | 'renting' | 'returned' | 'overdue' | 'canceled' | 'defective';
  note?: string;
  onSave: (payload: { status: typeof status; memo: string }) => void;
}

const allStatuses = ['reserved', 'renting', 'returned', 'defective', 'canceled'] as const;

// 상태 매핑: 프론트엔드 상태 -> API 상태
const statusToAPI = {
  'reserved': 'RESERVED',
  'renting': 'RENTED',
  'returned': 'RETURNED',
  'overdue': 'OVERDUE',
  'canceled': 'CANCELED',
  'defective': 'RETURNED', // 불량도 반납 처리
} as const;

export default function RentalDetailModal({
  isOpen,
  onClose,
  rentalId,
  rentalCode,
  userName,
  department,
  itemName,
  startDate,
  endDate,
  status,
  note = '',
  onSave,
}: RentalDetailModalProps) {
  useLockBodyScroll(isOpen);
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<typeof status>(status);
  const [memoValue, setMemoValue] = useState(note);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달이 열리거나 status/note가 변경될 때마다 상태 동기화
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(status);
      setMemoValue(note);
      setError(null);
    }
  }, [isOpen, status, note]);

  const handleEdit = () => {
    navigate(`/rental/cart?editRentalId=${rentalId}`, {
      state: {
        rentalCode,
        userName,
        department,
        itemName,
        startDate,
        endDate,
        isEditFromAdmin: true,
      }
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiStatus = statusToAPI[selectedStatus];
      await updateRentalStatus(rentalId, {
        status: apiStatus as any,
        memo: memoValue,
      });
      // 저장 후 콜백 하나만 호출
      onSave({ status: selectedStatus, memo: memoValue });
      onClose();
    } catch (err: any) {
      console.error("대여 상태 변경 실패:", err);
      const errorMessage = err instanceof Error ? err.message : '저장에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('.', '-').replace(/ /g, '').replace(/-$/, '');
    } catch {
      return dateStr;
    }
  };

  // displayStatus는 선택된 상태를 badge에 표시할 때 사용됨

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[21px] w-full max-w-[540px] max-h-[90vh] overflow-y-auto shadow-lg">
        {/* 헤더 */}
        <div className="bg-[#001a37] rounded-t-[21px] h-[62px] flex items-center justify-between px-[31px] py-3 relative">
          <h2 className="text-[21px] font-['210_OmniGothic:040',sans-serif] text-white">예약/대여 상세 관리</h2>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="닫기"
          >
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-[31px] py-5">
          {/* 신청 번호 */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-[#7d7d7d] text-[17px] font-['210_OmniGothic:030',sans-serif] mb-1">신청 번호</p>
              <p className="text-black text-[17px] font-['210_OmniGothic:030',sans-serif]">{rentalCode}</p>
            </div>
            <RentalStatusBadge status={selectedStatus === 'overdue' ? 'defective' : selectedStatus as 'reserved' | 'renting' | 'returned' | 'defective' | 'canceled'} />
          </div>

          {/* 신청자 정보 박스 */}
          <div className="bg-[#e9e9e9] rounded-[10px] p-5 mb-5 relative">
            <button onClick={handleEdit} className="absolute top-3 right-3 bg-[#f72] text-white px-3 py-1 rounded-[4px] text-[13px] font-['Gmarket_Sans:Medium',sans-serif] hover:bg-[#e65a3d] transition-colors shadow-md">
              수정
            </button>
            <div className="space-y-3">
              <div className="flex items-center gap-5">
                <p className="text-[15px] font-['Gmarket_Sans:Bold',sans-serif] text-black flex-[3]">신청자</p>
                <p className="text-[15px] font-['HanbatGothic:Medium',sans-serif] text-black flex-[7]">{userName}</p>
              </div>
              <div className="flex items-center gap-5">
                <p className="text-[15px] font-['Gmarket_Sans:Bold',sans-serif] text-black flex-[3]">소속 단위</p>
                <p className="text-[15px] font-['HanbatGothic:Medium',sans-serif] text-black flex-[7]">{department}</p>
              </div>
              <div className="flex items-center gap-5">
                <p className="text-[15px] font-['Gmarket_Sans:Bold',sans-serif] text-black flex-[3]">요청 품목</p>
                <p className="text-[15px] font-['HanbatGothic:Medium',sans-serif] text-black flex-[7]">{itemName}</p>
              </div>
              <div className="flex items-center gap-5">
                <p className="text-[15px] font-['Gmarket_Sans:Bold',sans-serif] text-black flex-[3]">기간/날짜</p>
                <p className="text-[15px] font-['HanbatGothic:Medium',sans-serif] text-black flex-[7]">
                  {formatDate(startDate)} ~ {formatDate(endDate)}
                </p>
              </div>
            </div>
          </div>

          {/* 상태 변경 */}
          <div className="mb-5">
            <label className="text-[15px] font-['210_OmniGothic:030',sans-serif] text-black mb-2 block">상태 변경</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as typeof status)}
              className="w-full h-[34px] px-3 border border-[#969696] rounded-[8px] bg-white text-[15px] font-['210_OmniGothic:030',sans-serif] text-black appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                paddingRight: '30px',
              }}
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'reserved' && '예약'}
                  {s === 'renting' && '대여중'}
                  {s === 'returned' && '정상 반납'}
                  {s === 'canceled' && '예약 취소'}
                  {s === 'defective' && '불량 반납'}
                </option>
              ))}
            </select>
          </div>

          {/* 관리자 메모 (비고) */}
          <div className="mb-5">
            <label className="text-[15px] font-['210_OmniGothic:030',sans-serif] text-black mb-2 block">관리자 메모 (비고)</label>
            <textarea
              value={memoValue}
              onChange={(e) => setMemoValue(e.target.value)}
              placeholder="추가 메모를 입력하세요"
              disabled={isLoading}
              className="w-full h-[82px] px-3 py-2 border border-[#969696] rounded-[8px] bg-white text-[15px] font-['210_OmniGothic:030',sans-serif] text-black resize-none focus:outline-none focus:border-[#f72] disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-3 p-2 bg-red-100 border border-red-400 rounded-[8px] text-red-700 text-[12px]">
              {error}
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-[38px] bg-[#f2f2f2] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-[14px] font-['Gmarket_Sans:Bold',sans-serif] text-black hover:bg-[#e5e5e5] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 h-[38px] bg-[#f72] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-[14px] font-['Gmarket_Sans:Bold',sans-serif] text-white hover:bg-[#e65a3d] disabled:bg-[#ccc] disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

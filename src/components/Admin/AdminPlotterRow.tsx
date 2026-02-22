import { useState, useRef, useEffect } from 'react';
import StatusBadge from '../ui/StatusBadge';

interface AdminPlotterRowProps {
  orderCode: string;
  userName: string;
  club: string;
  purpose: string;
  paperSizeAndCount: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'printed' | 'rejected' | 'completed';
  onStatusChange?: (newStatus: 'pending' | 'confirmed' | 'printed' | 'rejected' | 'completed') => void;
}

export default function AdminPlotterRow({
  orderCode,
  userName,
  club,
  purpose,
  paperSizeAndCount,
  orderDate,
  status,
  onStatusChange
}: AdminPlotterRowProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // status 변환: pending -> waiting, printed -> printing으로 매핑
  const badgeStatus = 
    status === 'pending' ? 'waiting' :
    status === 'printed' ? 'printing' :
    status as 'waiting' | 'confirmed' | 'printing' | 'completed' | 'rejected';

  // 날짜 포맷팅 함수: ISO 형식에서 YYYY-MM-DD만 추출
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  // 가능한 모든 상태
  const allStatuses: Array<'pending' | 'confirmed' | 'printed' | 'rejected' | 'completed'> = [
    'pending', 'confirmed', 'printed', 'rejected', 'completed'
  ];

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleStatusClick = (newStatus: 'pending' | 'confirmed' | 'printed' | 'rejected' | 'completed') => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full h-[52px] bg-white border-b border-[#e5e5e5] flex items-center px-8 gap-4">
      {/* 주문 코드 */}
      <span className="text-[16px] font-medium text-black w-[100px]">
        {orderCode}
      </span>

      {/* 신청자 */}
      <span className="text-[16px] font-medium text-black w-[80px]">
        {userName}
      </span>

      {/* 동아리 */}
      <span className="text-[16px] font-medium text-black w-[120px]">
        {club}
      </span>

      {/* 출력 용도 */}
      <span className="text-[16px] font-medium text-black flex-1">
        {purpose}
      </span>

      {/* 용지 규격 및 매수 */}
      <span className="text-[16px] font-medium text-black w-[120px]">
        {paperSizeAndCount}
      </span>

      {/* 신청일 */}
      <span className="text-[16px] font-medium text-black w-[100px]">
        {formatDate(orderDate)}
      </span>

      {/* 상태 배지 - 클릭 가능 */}
      <div className="relative w-[97px]" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full hover:opacity-80 transition"
        >
          <StatusBadge status={badgeStatus} />
        </button>

        {/* 상태 선택 드롭다운 */}
        {isDropdownOpen && (
          <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] py-2 min-w-[120px] max-h-[300px] overflow-y-auto">
            {allStatuses.map((statusOption) => {
              const displayStatus = 
                statusOption === 'pending' ? 'waiting' :
                statusOption === 'printed' ? 'printing' :
                statusOption as 'waiting' | 'confirmed' | 'printing' | 'completed' | 'rejected';
              return (
                <button
                  key={statusOption}
                  onClick={() => handleStatusClick(statusOption)}
                  className="w-full px-3 py-2 hover:bg-gray-50 transition flex items-center justify-center"
                >
                  <StatusBadge status={displayStatus} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

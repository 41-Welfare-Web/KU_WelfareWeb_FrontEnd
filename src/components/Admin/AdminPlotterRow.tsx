import { useState, useRef, useEffect } from 'react';
import PlotterStatusBadge from '../Plotter/PlotterStatusBadge';
import editIcon from '../../assets/admin/pencil.svg';

// 텍스트가 실제로 잘렸을 때만 호버 시 위쪽에 풀 텍스트 툴팁을 보여주는 셀
function TruncatedCell({ text, className }: { text: string; className: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    const el = spanRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      const rect = el.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
  };

  return (
    <div className={className}>
      <span
        ref={spanRef}
        className="block truncate text-[14px] font-medium text-black"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setPos(null)}
      >
        {text}
      </span>
      {pos && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: pos.x, top: pos.y - 8, transform: 'translate(-50%, -100%)' }}
        >
          <div className="bg-gray-800 text-white text-xs rounded px-2 py-1.5 max-w-[280px] break-words text-center shadow-lg">
            {text}
          </div>
          <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800 mx-auto" />
        </div>
      )}
    </div>
  );
}

interface AdminPlotterRowProps {
  orderCode: string;
  userName: string;
  club: string;
  purpose: string;
  paperSizeAndCount: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'printed' | 'rejected' | 'completed';
  note?: string;
  onStatusChange?: (newStatus: 'pending' | 'confirmed' | 'printed' | 'rejected' | 'completed') => void;
  onNoteChange?: (note: string) => void;
}

export default function AdminPlotterRow({
  orderCode,
  userName,
  club,
  purpose,
  paperSizeAndCount,
  orderDate,
  status,
  note = '',
  onStatusChange,
  onNoteChange
}: AdminPlotterRowProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noteValue, setNoteValue] = useState(note);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleNoteBlur = () => {
    setIsEditing(false);
    if (onNoteChange && noteValue !== note) {
      onNoteChange(noteValue);
    }
  };

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNoteBlur();
    }
  };

  return (
    <>
      {/* 모바일 카드 뷰 */}
      <div className="md:hidden w-full bg-white border-b border-[#e5e5e5] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-gray-500">{orderCode}</span>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="hover:opacity-80 transition">
              <PlotterStatusBadge status={badgeStatus} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] py-2 min-w-[120px] max-h-[300px] overflow-y-auto">
                {allStatuses.map((statusOption) => {
                  const displayStatus =
                    statusOption === 'pending' ? 'waiting' :
                    statusOption === 'printed' ? 'printing' :
                    statusOption as 'waiting' | 'confirmed' | 'printing' | 'completed' | 'rejected';
                  return (
                    <button key={statusOption} onClick={() => handleStatusClick(statusOption)} className="w-full px-3 py-2 hover:bg-gray-50 transition flex items-center justify-center">
                      <PlotterStatusBadge status={displayStatus} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14px] font-semibold text-black">{userName}</span>
          <span className="text-[13px] text-gray-500">{club}</span>
        </div>
        <p className="text-[13px] text-gray-700 mb-2 truncate">{purpose}</p>
        <div className="flex items-center gap-3 text-[12px] text-gray-500">
          <span>{paperSizeAndCount}</span>
          <span>·</span>
          <span>{formatDate(orderDate)}</span>
        </div>
        {/* 비고 */}
        <div className="flex items-center gap-2 mt-2">
          <input
            ref={inputRef}
            type="text"
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            onBlur={handleNoteBlur}
            onKeyDown={handleNoteKeyDown}
            disabled={!isEditing}
            placeholder="비고"
            className="flex-1 h-[30px] px-2 text-[13px] font-medium text-black border border-gray-300 rounded bg-white disabled:bg-gray-50 disabled:border-gray-200 focus:outline-none focus:border-blue-500"
          />
          <button onClick={handleEditClick} className="w-4 h-4 hover:opacity-70 transition-opacity flex-shrink-0" aria-label="비고 수정">
            <img src={editIcon} alt="수정" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 데스크톱 테이블 행 뷰 */}
      <div className="hidden md:flex w-full h-[52px] bg-white border-b border-[#e5e5e5] items-center px-4 gap-2">
        {/* 주문 코드 */}
        <TruncatedCell text={orderCode} className="w-[7%] min-w-0 text-center shrink" />
        {/* 신청자 */}
        <TruncatedCell text={userName} className="w-[8%] min-w-0 text-center shrink" />
        {/* 소속 */}
        <TruncatedCell text={club} className="w-[12%] min-w-0 text-center shrink" />
        {/* 파일명 */}
        <TruncatedCell text={purpose} className="flex-1 min-w-0 text-center" />
        {/* 용지 규격 및 매수 */}
        <TruncatedCell text={paperSizeAndCount} className="w-[10%] min-w-0 text-center shrink" />
        {/* 날짜 */}
        <span className="text-[14px] font-medium text-black w-[10%] min-w-0 text-center shrink">{formatDate(orderDate)}</span>

        {/* 상태 배지 */}
        <div className="relative w-[9%] min-w-0 shrink" ref={dropdownRef}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full hover:opacity-80 transition">
            <PlotterStatusBadge status={badgeStatus} />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] py-2 min-w-[120px] max-h-[300px] overflow-y-auto">
              {allStatuses.map((statusOption) => {
                const displayStatus =
                  statusOption === 'pending' ? 'waiting' :
                  statusOption === 'printed' ? 'printing' :
                  statusOption as 'waiting' | 'confirmed' | 'printing' | 'completed' | 'rejected';
                return (
                  <button key={statusOption} onClick={() => handleStatusClick(statusOption)} className="w-full px-3 py-2 hover:bg-gray-50 transition flex items-center justify-center">
                    <PlotterStatusBadge status={displayStatus} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 비고 입력 필드 */}
        <div className="w-[13%] min-w-0 shrink flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            onBlur={handleNoteBlur}
            onKeyDown={handleNoteKeyDown}
            disabled={!isEditing}
            className="flex-1 min-w-0 h-[30px] px-2 text-[13px] font-medium text-black border border-gray-300 rounded bg-white disabled:bg-gray-50 disabled:border-gray-200 focus:outline-none focus:border-blue-500"
          />
          <button onClick={handleEditClick} className="w-4 h-4 hover:opacity-70 transition-opacity flex-shrink-0" aria-label="비고 수정">
            <img src={editIcon} alt="수정" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

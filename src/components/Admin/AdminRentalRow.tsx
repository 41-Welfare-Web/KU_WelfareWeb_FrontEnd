import { useState, useRef, useEffect } from "react";
import RentalStatusBadge from "../MyPage/RentalStatusBadge";
import editIcon from '../../assets/admin/pencil.svg';

interface AdminRentalRowProps {
  rentalCode: string;
  userName: string;
  department: string;
  itemName: string;
  startDate: string;
  endDate: string;
  status: "reserved" | "renting" | "returned" | "overdue" | "canceled" | "defective";
  note?: string;
  onStatusChange?: (newStatus: "reserved" | "renting" | "returned" | "overdue" | "canceled" | "defective") => void;
  onNoteChange?: (note: string) => void;
  className?: string;
}

export default function AdminRentalRow({
  rentalCode,
  userName,
  department,
  itemName,
  startDate,
  endDate,
  status,
  note = '',
  onStatusChange,
  onNoteChange,
  className = "",
}: AdminRentalRowProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noteValue, setNoteValue] = useState(note);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // status 변환: overdue -> defective로 매핑
  const badgeStatus = status === "overdue" ? "defective" : status as "reserved" | "renting" | "returned" | "defective" | "canceled";

  // 날짜 포맷팅 함수: ISO 형식에서 YYYY-MM-DD만 추출
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  // 가능한 모든 상태
  const allStatuses: Array<"reserved" | "renting" | "returned" | "overdue" | "canceled"> = [
    "reserved", "renting", "returned", "overdue", "canceled"
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

  const handleStatusClick = (newStatus: "reserved" | "renting" | "returned" | "overdue" | "canceled") => {
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
      <div className={`md:hidden w-full bg-white border-b border-[#e5e5e5] p-4 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-gray-500">{rentalCode}</span>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="hover:opacity-80 transition">
              <RentalStatusBadge status={badgeStatus} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] py-2 min-w-[120px] max-h-[300px] overflow-y-auto">
                {allStatuses.map((statusOption) => {
                  const displayStatus = statusOption === "overdue" ? "defective" : statusOption as "reserved" | "renting" | "returned" | "defective" | "canceled";
                  return (
                    <button key={statusOption} onClick={() => handleStatusClick(statusOption)} className="w-full px-3 py-2 hover:bg-gray-50 transition flex items-center justify-center">
                      <RentalStatusBadge status={displayStatus} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14px] font-semibold text-black">{userName}</span>
          <span className="text-[13px] text-gray-500">{department}</span>
        </div>
        <p className="text-[13px] text-gray-700 mb-2 truncate">{itemName}</p>
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <span>{formatDate(startDate)}</span>
          <span>~</span>
          <span>{formatDate(endDate)}</span>
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
      <div className={`hidden md:flex w-full h-[52px] bg-white border-b border-[#e5e5e5] items-center px-4 gap-2 ${className}`}>
        {/* 대여 코드 */}
        <span className="text-[14px] font-medium text-black w-[7%] min-w-0 text-center truncate shrink">{rentalCode}</span>
        {/* 이름 */}
        <span className="text-[14px] font-medium text-black w-[8%] min-w-0 text-center truncate shrink">{userName}</span>
        {/* 소속 */}
        <span className="text-[14px] font-medium text-black w-[12%] min-w-0 text-center truncate shrink">{department}</span>
        {/* 물품명 */}
        <span className="text-[14px] font-medium text-black flex-1 min-w-0 text-center truncate">{itemName}</span>
        {/* 대여 시작일 */}
        <span className="text-[14px] font-medium text-black w-[10%] min-w-0 text-center shrink">{formatDate(startDate)}</span>
        {/* 대여 종료일 */}
        <span className="text-[14px] font-medium text-black w-[10%] min-w-0 text-center shrink">{formatDate(endDate)}</span>

        {/* 상태 배지 */}
        <div className="relative w-[9%] min-w-0 shrink" ref={dropdownRef}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full hover:opacity-80 transition">
            <RentalStatusBadge status={badgeStatus} />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] py-2 min-w-[120px] max-h-[300px] overflow-y-auto">
              {allStatuses.map((statusOption) => {
                const displayStatus = statusOption === "overdue" ? "defective" : statusOption as "reserved" | "renting" | "returned" | "defective" | "canceled";
                return (
                  <button key={statusOption} onClick={() => handleStatusClick(statusOption)} className="w-full px-3 py-2 hover:bg-gray-50 transition flex items-center justify-center">
                    <RentalStatusBadge status={displayStatus} />
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

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import RentalStatusBadge from "../MyPage/RentalStatusBadge";
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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [isEditing, setIsEditing] = useState(false);
  const [noteValue, setNoteValue] = useState(note);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const badgeBtnRef = useRef<HTMLButtonElement>(null);
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
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        badgeBtnRef.current && !badgeBtnRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleToggleDropdown = () => {
    if (!isDropdownOpen && badgeBtnRef.current) {
      const rect = badgeBtnRef.current.getBoundingClientRect();
      const dropdownHeight = 220;
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow >= dropdownHeight) {
        setDropdownStyle({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
      } else {
        setDropdownStyle({ top: rect.top + window.scrollY - dropdownHeight - 4, left: rect.left + window.scrollX });
      }
    }
    setIsDropdownOpen((prev) => !prev);
  };

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
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1000);
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
          <div>
            <button ref={badgeBtnRef} onClick={handleToggleDropdown} className="hover:opacity-80 transition">
              <RentalStatusBadge status={badgeStatus} />
            </button>
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
        <div className="flex items-center gap-2 mt-2 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            onBlur={handleNoteBlur}
            onKeyDown={handleNoteKeyDown}
            disabled={!isEditing}
            placeholder="비고"
            className={`flex-1 min-w-0 h-[30px] px-2 text-[13px] font-medium text-black border rounded bg-white disabled:bg-gray-50 disabled:border-gray-200 focus:outline-none transition-colors ${
              saveSuccess ? 'border-green-500' : isEditing ? 'border-[#FF7A57]' : 'border-gray-300'
            }`}
          />
          <button onClick={handleEditClick} className="w-4 h-4 hover:opacity-70 transition-opacity flex-shrink-0" aria-label="비고 수정">
            <img src={editIcon} alt="수정" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 데스크톱 테이블 행 뷰 */}
      <div className={`hidden md:flex w-full h-[52px] bg-white border-b border-[#e5e5e5] items-center px-4 gap-2 ${className}`}>
        {/* 대여 코드 */}
        <TruncatedCell text={rentalCode} className="w-[7%] min-w-0 text-center shrink" />
        {/* 이름 */}
        <TruncatedCell text={userName} className="w-[8%] min-w-0 text-center shrink" />
        {/* 소속 */}
        <TruncatedCell text={department} className="w-[12%] min-w-0 text-center shrink" />
        {/* 물품명 */}
        <TruncatedCell text={itemName} className="flex-1 min-w-0 text-center" />
        {/* 대여 시작일 */}
        <span className="text-[14px] font-medium text-black w-[10%] min-w-0 text-center shrink">{formatDate(startDate)}</span>
        {/* 대여 종료일 */}
        <span className="text-[14px] font-medium text-black w-[10%] min-w-0 text-center shrink">{formatDate(endDate)}</span>

        {/* 상태 배지 */}
        <div className="w-[9%] min-w-0 shrink flex items-center justify-center">
          <button ref={badgeBtnRef} onClick={handleToggleDropdown} className="w-full hover:opacity-80 transition">
            <RentalStatusBadge status={badgeStatus} />
          </button>
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
            className={`flex-1 min-w-0 h-[30px] px-2 text-[13px] font-medium text-black border rounded bg-white disabled:bg-gray-50 disabled:border-gray-200 focus:outline-none transition-colors ${
              saveSuccess ? 'border-green-500' : isEditing ? 'border-[#FF7A57]' : 'border-gray-300'
            }`}
          />
          <button onClick={handleEditClick} className="w-4 h-4 hover:opacity-70 transition-opacity flex-shrink-0" aria-label="비고 수정">
            <img src={editIcon} alt="수정" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 포털 드롭다운 – overflow 컨테이너 바깥 body에 렌더링 */}
      {isDropdownOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'absolute', ...dropdownStyle, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[120px] max-h-[220px] overflow-y-auto"
        >
          {allStatuses.map((statusOption) => {
            const displayStatus = statusOption === "overdue" ? "defective" : statusOption as "reserved" | "renting" | "returned" | "defective" | "canceled";
            return (
              <button
                key={statusOption}
                onClick={() => handleStatusClick(statusOption)}
                className="w-full px-3 py-2 hover:bg-gray-50 transition flex items-center justify-center"
              >
                <RentalStatusBadge status={displayStatus} />
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

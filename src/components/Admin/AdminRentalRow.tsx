import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import RentalStatusBadge from "../MyPage/RentalStatusBadge";
import RentalDetailModal from "./RentalDetailModal";
import editIcon from '../../assets/admin/pencil.svg';

// 필요 시 호버 툴팁을 띄우는 셀
function TruncatedCell({
  text,
  className,
  tooltipText,
  showTooltipOnOverflowOnly = true,
}: {
  text: string;
  className: string;
  tooltipText?: string;
  showTooltipOnOverflowOnly?: boolean;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    const el = spanRef.current;
    const shouldShowTooltip = Boolean(tooltipText) || (el && el.scrollWidth > el.clientWidth);
    const isOverflowing = el && el.scrollWidth > el.clientWidth;

    if (el && shouldShowTooltip && (!showTooltipOnOverflowOnly || isOverflowing)) {
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
            {tooltipText ?? text}
          </div>
          <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800 mx-auto" />
        </div>
      )}
    </div>
  );
}

interface AdminRentalRowProps {
  rentalId: number;
  rentalItemId?: number;
  rentalCode: string;
  userName: string;
  phoneNumber?: string;
  department: string;
  itemName: string;
  quantity?: number;
  startDate: string;
  endDate: string;
  status: "reserved" | "renting" | "returned" | "overdue" | "canceled" | "defective";
  note?: string;
  checked?: boolean;
  onCheck?: (checked: boolean) => void;
  onSelectGroup?: () => void;
  onSave: (payload: { status: typeof status; memo: string; rentalItemId?: number }) => Promise<void> | void;
  groupIndex?: number;
  isFirstInGroup?: boolean;
  className?: string;
}

export default function AdminRentalRow({
  rentalId,
  rentalItemId,
  rentalCode,
  userName,
  phoneNumber,
  department,
  itemName,
  quantity,
  startDate,
  endDate,
  status,
  note = '',
  checked = false,
  onCheck,
  onSelectGroup,
  onSave,
  groupIndex = 0,
  isFirstInGroup = false,
  className = "",
}: AdminRentalRowProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRowLoading, setIsRowLoading] = useState(false);

  const groupBg = checked ? 'bg-[#fff5f2]' : 'bg-white';
  const groupBorderTop = isFirstInGroup ? 'border-t-2 border-t-[#b8b8b8]' : '';
  const dropdownRef = useRef<HTMLDivElement>(null);
  const badgeBtnRef = useRef<HTMLButtonElement>(null);

  // status 변환: overdue -> defective로 매핑
  const badgeStatus = status === "overdue" ? "defective" : status as "reserved" | "renting" | "returned" | "defective" | "canceled";

  // YY/M/DD 형식 (기간 칸 절약용)
  const formatShortDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString.split('T')[0];
    const yy = String(d.getFullYear()).slice(2);
    return `${yy}/${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`;
  };

  // 가능한 모든 상태
  const allStatuses: Array<"reserved" | "renting" | "returned" | "defective" | "canceled"> = [
    "reserved", "renting", "returned", "defective", "canceled"
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

  const handleStatusClick = async (newStatus: "reserved" | "renting" | "returned" | "defective" | "canceled") => {
    setIsDropdownOpen(false);
    setIsRowLoading(true);
    try {
      await onSave({ status: newStatus, memo: note, rentalItemId });
    } finally {
      setIsRowLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsDetailModalOpen(true);
  };

  return (
    <>
      {/* 모바일 카드 뷰 */}
      <div className={`md:hidden w-full border-b border-[#c8c8c8] p-4 ${groupBg} ${groupBorderTop} ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onCheck?.(e.target.checked)}
              className="w-4 h-4 accent-[#f72] cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-[13px] font-semibold text-gray-500">{rentalCode}</span>
          </div>
          <div className="flex items-center justify-center w-[60px]">
            {isRowLoading ? (
              <svg className="animate-spin w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <RentalStatusBadge status={badgeStatus} />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14px] font-semibold text-black" title={phoneNumber || '-'}>{userName}</span>
          <span className="text-[13px] text-gray-500">{department}</span>
        </div>
        <div className="flex items-center gap-2 mb-1 justify-between">
          <p className="text-[13px] text-gray-700 truncate flex-1">
            {itemName}{quantity !== undefined ? ` (${quantity}개)` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-gray-500 justify-between">
          <span>{formatShortDate(startDate)} ~ {formatShortDate(endDate)}</span>
          <button onClick={handleEditClick} className="hover:opacity-70 transition-opacity" aria-label="상세 관리">
            <img src={editIcon} alt="수정" className="w-[18px] h-[18px]" />
          </button>
        </div>
        {note && (
          <div className="mt-1 text-[12px] text-gray-500 text-right">
            {note}
          </div>
        )}
      </div>

      {/* 데스크톱 테이블 행 뷰 */}
      <div className={`hidden md:flex w-full flex-col border-b border-[#c8c8c8] ${groupBg} ${groupBorderTop} ${className}`}>
        <div
          className="flex w-full h-[52px] items-center px-4 gap-2 cursor-pointer"
          onClick={() => onCheck?.(!checked)}
        >
          {/* 체크박스 */}
          <div className="w-[3%] min-w-0 shrink flex items-center justify-center">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onCheck?.(e.target.checked)}
              className="w-4 h-4 accent-[#f72] cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {/* 대여 코드 — 클릭 시 그룹 전체 선택 */}
          <div
            className="w-[7%] min-w-0 shrink flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); onSelectGroup?.(); }}
          >
            <span className="block truncate text-[14px] font-semibold text-[#f72] hover:underline cursor-pointer">
              {rentalCode}
            </span>
          </div>
          {/* 이름 */}
          <TruncatedCell text={userName} tooltipText={phoneNumber || '-'} showTooltipOnOverflowOnly={false} className="w-[8%] min-w-0 text-center shrink" />
          {/* 소속 */}
          <TruncatedCell text={department} className="w-[12%] min-w-0 text-center shrink" />
          {/* 물품명 */}
          <TruncatedCell
            text={itemName}
            className="flex-1 min-w-0 text-center"
          />
          {/* 수량 */}
          <span className="text-[14px] font-medium text-black w-[6%] min-w-0 text-center shrink">
            {quantity !== undefined ? `${quantity}개` : '-'}
          </span>
          {/* 기간 */}
          <span className="text-[13px] font-medium text-black w-[14%] min-w-0 text-center shrink whitespace-nowrap">
            {formatShortDate(startDate)} ~ {formatShortDate(endDate)}
          </span>
          {/* 상태 배지 */}
          <div className="w-[9%] min-w-0 shrink flex items-center justify-center">
            <button
              ref={badgeBtnRef}
              onClick={(e) => { e.stopPropagation(); if (!isRowLoading) handleToggleDropdown(); }}
              disabled={isRowLoading}
              className="hover:opacity-80 transition disabled:cursor-not-allowed"
            >
              {isRowLoading ? (
                <svg className="animate-spin w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <RentalStatusBadge status={badgeStatus} />
              )}
            </button>
          </div>
          {/* 수정 버튼 */}
          <div className="w-[5%] min-w-0 shrink flex items-center justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); handleEditClick(); }}
              className="hover:opacity-70 transition-opacity"
              aria-label="상세 관리"
            >
              <img src={editIcon} alt="수정" className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
        {/* 비고 서브 행 */}
        {note && (
          <div className={`flex justify-end px-4 py-1.5 ${groupBg}`}>
            <span className="text-[12px] text-gray-500 truncate">{note}</span>
          </div>
        )}
      </div>

      {/* 포털 드롭다운 – overflow 컨테이너 바깥 body에 렌더링 */}
      {isDropdownOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'absolute', ...dropdownStyle, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[120px] max-h-[220px] overflow-y-auto"
        >
          {allStatuses.map((statusOption) => {
            return (
              <button
                key={statusOption}
                onClick={() => handleStatusClick(statusOption)}
                className="w-full px-3 py-2 hover:bg-gray-50 transition flex items-center justify-center"
              >
                <RentalStatusBadge status={statusOption} />
              </button>
            );
          })}
        </div>,
        document.body
      )}

      {/* 상세 관리 모달 */}
      <RentalDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        rentalId={rentalId}
        rentalItemId={rentalItemId}
        rentalCode={rentalCode}
        userName={userName}
        department={department}
        itemName={itemName}
        startDate={startDate}
        endDate={endDate}
        status={status}
        note={note}
        onSave={({ status: newStatus, memo: newMemo }) => {
          onSave({ status: newStatus, memo: newMemo, rentalItemId });
          setIsDetailModalOpen(false);
        }}
      />
    </>
  );
}

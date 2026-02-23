import { useState, useRef, useEffect } from "react";
import RentalStatusBadge from "../MyPage/RentalStatusBadge";

interface AdminRentalRowProps {
  rentalCode: string;
  userName: string;
  department: string;
  itemName: string;
  startDate: string;
  endDate: string;
  status: "reserved" | "renting" | "returned" | "overdue" | "canceled";
  onStatusChange?: (newStatus: "reserved" | "renting" | "returned" | "overdue" | "canceled") => void;
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
  onStatusChange,
  className = "",
}: AdminRentalRowProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      className={`w-full h-[52px] bg-white border-b border-[#e5e5e5] flex items-center px-8 gap-4 ${className}`}
    >
      {/* 대여 코드 */}
      <span className="text-[16px] font-medium text-black w-[100px]">
        {rentalCode}
      </span>

      {/* 이름 */}
      <span className="text-[16px] font-medium text-black w-[80px]">
        {userName}
      </span>

      {/* 단위 */}
      <span className="text-[16px] font-medium text-black w-[120px]">
        {department}
      </span>

      {/* 물품명 */}
      <span className="text-[16px] font-medium text-black flex-1">
        {itemName}
      </span>

      {/* 대여 시작일 */}
      <span className="text-[16px] font-medium text-black w-[100px]">
        {formatDate(startDate)}
      </span>

      {/* 대여 종료일 */}
      <span className="text-[16px] font-medium text-black w-[100px]">
        {formatDate(endDate)}
      </span>

      {/* 상태 배지 - 클릭 가능 */}
      <div className="relative w-[97px]" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full hover:opacity-80 transition"
        >
          <RentalStatusBadge status={badgeStatus} />
        </button>

        {/* 상태 선택 드롭다운 */}
        {isDropdownOpen && (
          <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] py-2 min-w-[120px] max-h-[300px] overflow-y-auto">
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
          </div>
        )}
      </div>
    </div>
  );
}

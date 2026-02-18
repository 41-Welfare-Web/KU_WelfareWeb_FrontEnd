import editIcon from "../../../assets/admin/pencil.svg";

interface AdminRentalRowProps {
  rentalCode: string;
  userName: string;
  department: string;
  itemName: string;
  startDate: string;
  endDate: string;
  status: "reserved" | "renting" | "returned" | "overdue" | "canceled";
  onEdit?: () => void;
  className?: string;
}

const statusConfig = {
  reserved: {
    text: "예약",
    bgColor: "#fdd297",
    textColor: "#f54a00",
  },
  renting: {
    text: "대여중",
    bgColor: "#c3e5ff",
    textColor: "#0066cc",
  },
  returned: {
    text: "반납완료",
    bgColor: "#d4edda",
    textColor: "#155724",
  },
  overdue: {
    text: "연체",
    bgColor: "#f8d7da",
    textColor: "#721c24",
  },
  canceled: {
    text: "취소",
    bgColor: "#e2e3e5",
    textColor: "#383d41",
  },
};

export default function AdminRentalRow({
  rentalCode,
  userName,
  department,
  itemName,
  startDate,
  endDate,
  status,
  onEdit,
  className = "",
}: AdminRentalRowProps) {
  const statusStyle = statusConfig[status];

  return (
    <div
      className={`relative w-full h-[52px] bg-white border-b border-[#e5e5e5] ${className}`}
    >
      {/* 메인 콘텐츠 */}
      <div className="absolute left-[33px] top-1/2 -translate-y-1/2 flex items-center gap-8">
        <span className="text-[20px] font-medium text-black w-[100px]">
          {rentalCode}
        </span>
        <span className="text-[20px] font-medium text-black w-[80px]">
          {userName}
        </span>
        <span className="text-[20px] font-medium text-black w-[150px]">
          {department}
        </span>
        <span className="text-[20px] font-medium text-black w-[150px]">
          {itemName}
        </span>
        <span className="text-[15px] font-medium text-black w-[100px]">
          {startDate}
        </span>
        <span className="text-[15px] font-medium text-black w-[100px]">
          {endDate}
        </span>
      </div>

      {/* 상태 뱃지 */}
      <div
        className="absolute right-[100px] top-1/2 -translate-y-1/2 w-[80px] h-[26px] rounded-[5px] flex items-center justify-center"
        style={{ backgroundColor: statusStyle.bgColor }}
      >
        <span
          className="text-[15px] font-medium"
          style={{ color: statusStyle.textColor }}
        >
          {statusStyle.text}
        </span>
      </div>

      {/* 수정 버튼 */}
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute right-[40px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] hover:opacity-70 transition"
        >
          <img src={editIcon} alt="수정" className="w-full h-full" />
        </button>
      )}
    </div>
  );
}

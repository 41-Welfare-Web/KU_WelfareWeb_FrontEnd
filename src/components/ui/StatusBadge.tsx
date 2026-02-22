type BadgeStatus = "waiting" | "confirmed" | "printing" | "completed" | "rejected";

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

const statusConfig = {
  waiting: {
    text: "예약 대기",
    bgColor: "bg-[#fdd297]",
    textColor: "text-[#f54a00]",
  },
  confirmed: {
    text: "예약 확정",
    bgColor: "bg-[#97f2fd]",
    textColor: "text-[#155dfc]",
  },
  printing: {
    text: "인쇄 완료",
    bgColor: "bg-[#a9ffca]",
    textColor: "text-[#1b811f]",
  },
  completed: {
    text: "수령 완료",
    bgColor: "bg-[#ddd]",
    textColor: "text-[#4a5565]",
  },
  rejected: {
    text: "예약 반려",
    bgColor: "bg-[#ffa2a2]",
    textColor: "text-[red]",
  },
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`flex items-center justify-center w-[97px] h-[33px] rounded-[11px] ${config.bgColor} ${className}`}
    >
      <p className={`text-[15px] font-medium ${config.textColor}`}>
        {config.text}
      </p>
    </div>
  );
}
